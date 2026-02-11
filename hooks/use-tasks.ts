"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import type { Task, TaskStatus, TaskIntent } from "@/types/tasks";
import { toast } from "sonner";

interface Filters {
  status?: TaskStatus | "all";
  intent?: TaskIntent | "all";
  agent?: string;
  sort?: "priority" | "created_at" | "updated_at";
}

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>({ sort: "priority" });
  const supabase = useRef(createClient());

  const fetchTasks = useCallback(async () => {
    const params = new URLSearchParams();
    if (filters.status && filters.status !== "all") params.set("status", filters.status);
    if (filters.intent && filters.intent !== "all") params.set("intent", filters.intent);
    if (filters.agent) params.set("assigned_agent", filters.agent);
    params.set("limit", "100");

    const res = await fetch(`/api/tasks?${params}`);
    const json = await res.json();
    if (json.data) {
      let sorted = json.data as Task[];
      if (filters.sort === "created_at") {
        sorted.sort((a: Task, b: Task) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      } else if (filters.sort === "updated_at") {
        sorted.sort((a: Task, b: Task) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
      }
      // Default sort from API is priority desc
      setTasks(sorted);
    }
    setLoading(false);
  }, [filters]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Real-time subscription
  useEffect(() => {
    const channel = supabase.current
      .channel("tasks-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tasks" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const newTask = payload.new as Task;
            setTasks((prev) => [newTask, ...prev]);
            toast.info(`New task: ${newTask.title}`);
          } else if (payload.eventType === "UPDATE") {
            const updated = payload.new as Task;
            setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
            if (payload.old && (payload.old as Task).status !== updated.status) {
              toast.info(`Task "${updated.title}" → ${updated.status.replace("_", " ")}`);
            }
          } else if (payload.eventType === "DELETE") {
            const deleted = payload.old as Task;
            setTasks((prev) => prev.filter((t) => t.id !== deleted.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.current.removeChannel(channel);
    };
  }, []);

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
    // Realtime will add it, but add optimistically too
    if (json.data) setTasks((prev) => [json.data, ...prev]);
    return json.data;
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    const res = await fetch(`/api/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    const json = await res.json();
    if (json.error) {
      toast.error(json.error);
      return null;
    }
    toast.success("Task updated");
    if (json.data) setTasks((prev) => prev.map((t) => (t.id === json.data.id ? json.data : t)));
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

  return {
    tasks,
    loading,
    filters,
    setFilters,
    createTask,
    updateTask,
    deleteTask,
    spawnSubtask,
    refetch: fetchTasks,
  };
}
