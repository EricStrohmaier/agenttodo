"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import type { Task, TaskStatus, TaskIntent } from "@/types/tasks";
import { toast } from "sonner";

const PAGE_SIZE = 50;

interface Filters {
  status?: TaskStatus | "all";
  intent?: TaskIntent | "all";
  agent?: string;
  project?: string;
  sort?: "priority" | "created_at" | "updated_at";
}

export function useTasks(initialTasks?: Task[], initialTotal?: number) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks || []);
  const [loading, setLoading] = useState(!initialTasks);
  const [loadingMore, setLoadingMore] = useState(false);
  const [total, setTotal] = useState(initialTotal ?? initialTasks?.length ?? 0);
  const [filters, setFilters] = useState<Filters>({ sort: "priority" });
  const [userId, setUserId] = useState<string | null>(null);
  const supabase = useRef(createClient());
  // Track IDs we've updated optimistically so realtime skips the duplicate toast
  const optimisticUpdates = useRef(new Set<string>());

  const hasMore = tasks.length < total;

  // Helper: deduplicate tasks by ID (keeps first occurrence)
  const dedup = (arr: Task[]) => {
    const seen = new Set<string>();
    return arr.filter((t) => {
      if (seen.has(t.id)) return false;
      seen.add(t.id);
      return true;
    });
  };

  const buildParams = useCallback((offset = 0) => {
    const params = new URLSearchParams();
    if (filters.status && filters.status !== "all") params.set("status", filters.status);
    if (filters.intent && filters.intent !== "all") params.set("intent", filters.intent);
    if (filters.agent) params.set("assigned_agent", filters.agent);
    if (filters.project) params.set("project", filters.project);
    params.set("limit", String(PAGE_SIZE));
    params.set("offset", String(offset));
    return params;
  }, [filters]);

  const sortTasks = useCallback((list: Task[]) => {
    if (filters.sort === "created_at") {
      return [...list].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else if (filters.sort === "updated_at") {
      return [...list].sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
    }
    return list;
  }, [filters.sort]);

  const fetchTasks = useCallback(async () => {
    const params = buildParams(0);
    const res = await fetch(`/api/tasks?${params}`);
    const json = await res.json();
    if (json.data) {
      setTasks(sortTasks(json.data as Task[]));
      setTotal(json.total ?? json.data.length);
    }
    setLoading(false);
  }, [buildParams, sortTasks]);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    const params = buildParams(tasks.length);
    const res = await fetch(`/api/tasks?${params}`);
    const json = await res.json();
    if (json.data) {
      setTasks((prev) => sortTasks(dedup([...prev, ...(json.data as Task[])])));
      if (json.total !== undefined) setTotal(json.total);
    }
    setLoadingMore(false);
  }, [loadingMore, hasMore, buildParams, tasks.length, sortTasks]);

  // Fetch current user ID for realtime filtering
  useEffect(() => {
    supabase.current.auth.getUser().then(({ data }) => {
      if (data.user) setUserId(data.user.id);
    });
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Real-time subscription (scoped to current user)
  useEffect(() => {
    if (!userId) return;

    const channel = supabase.current
      .channel("tasks-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tasks", filter: `user_id=eq.${userId}` },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const newTask = payload.new as Task;
            setTasks((prev) => dedup([newTask, ...prev]));
            setTotal((prev) => prev + 1);
          } else if (payload.eventType === "UPDATE") {
            const updated = payload.new as Task;
            // Soft-deleted tasks should be removed from the list
            if (updated.deleted_at) {
              setTasks((prev) => prev.filter((t) => t.id !== updated.id));
              setTotal((prev) => Math.max(0, prev - 1));
              return;
            }
            // Always sync the latest data from realtime
            setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
            // Only show toast if this wasn't triggered by our own optimistic update
            if (optimisticUpdates.current.has(updated.id)) {
              optimisticUpdates.current.delete(updated.id);
            } else if (payload.old && (payload.old as Task).status !== updated.status) {
              toast.info(`Task "${updated.title}" → ${updated.status.replace("_", " ")}`);
            }
            // Notify when an agent requests human input
            if (payload.old && !(payload.old as Task).human_input_needed && updated.human_input_needed) {
              toast.warning(`"${updated.title}" needs your input`);
            }
          } else if (payload.eventType === "DELETE") {
            const deleted = payload.old as Task;
            setTasks((prev) => prev.filter((t) => t.id !== deleted.id));
            setTotal((prev) => Math.max(0, prev - 1));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.current.removeChannel(channel);
    };
  }, [userId]);

  const createTask = async (title: string) => {
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });
    const json = await res.json();
    if (json.error) {
      toast.error(json.error);
      return null;
    }
    toast.success("Task created");
    // Don't add optimistically — realtime INSERT will add it (with dedup guard)
    return json.data;
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    // Mark as optimistic so realtime skips the duplicate toast
    optimisticUpdates.current.add(id);
    // Optimistically update local state
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));

    const res = await fetch(`/api/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    const json = await res.json();
    if (json.error) {
      optimisticUpdates.current.delete(id);
      toast.error(json.error);
      // Revert optimistic update
      await fetchTasks();
      return null;
    }
    return json.data;
  };

  const deleteTask = async (id: string) => {
    const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
    const json = await res.json();
    if (json.error) {
      toast.error(json.error);
      return false;
    }
    toast.success("Task deleted");
    setTasks((prev) => prev.filter((t) => t.id !== id));
    setTotal((prev) => Math.max(0, prev - 1));
    return true;
  };

  const spawnSubtask = async (parentId: string, title: string) => {
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, parent_task_id: parentId }),
    });
    const json = await res.json();
    if (json.error) {
      toast.error(json.error);
      return null;
    }
    toast.success("Subtask created");
    return json.data;
  };

  const uploadAttachment = async (taskId: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`/api/tasks/${taskId}/upload`, {
      method: "POST",
      body: formData,
    });
    const json = await res.json();
    if (json.error) {
      toast.error(json.error);
      return null;
    }
    toast.success("File uploaded");
    return json.data;
  };

  const sendMessage = async (taskId: string, content: string) => {
    const res = await fetch(`/api/tasks/${taskId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, from: "human" }),
    });
    const json = await res.json();
    if (json.error) {
      toast.error(json.error);
      return null;
    }
    toast.success("Message sent");
    return json.data;
  };

  return {
    tasks,
    loading,
    loadingMore,
    total,
    hasMore,
    loadMore,
    filters,
    setFilters,
    createTask,
    updateTask,
    deleteTask,
    spawnSubtask,
    uploadAttachment,
    sendMessage,
    refetch: fetchTasks,
  };
}
