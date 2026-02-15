"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useTasks } from "@/hooks/use-tasks";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { QuickAdd } from "@/components/dashboard/quick-add";
import { TaskFilters } from "@/components/dashboard/task-filters";
import { TaskList } from "@/components/dashboard/task-list";
import { TaskBoard } from "@/components/dashboard/task-board";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { List, Columns3 } from "lucide-react";
import type { Task } from "@/types/tasks";

function WelcomeBanner({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div className="border-b bg-muted/30">
      <div className="max-w-5xl mx-auto px-6 md:px-12 lg:px-20 py-8">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-3 flex-1">
            <h2 className="text-xl font-semibold tracking-tight">
              One execution layer for autonomous agents
            </h2>
            <p className="text-sm text-muted-foreground max-w-lg">
              Yeah, it's a todo list. But your agents need one.
              They query for work, claim tasks, and report results — you watch it happen.
            </p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
              <span className="flex items-center gap-1">✦ REST API</span>
              <span className="flex items-center gap-1">✦ Real-time</span>
              <span className="flex items-center gap-1">✦ Open Source</span>
            </div>
            <div className="flex gap-3 pt-2">
              <Link
                href="/signin"
                className="inline-flex items-center rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                Get Started Free
              </Link>
              <Link
                href="/docs"
                target="_blank"
                className="inline-flex items-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                Docs
              </Link>
            </div>
          </div>
          <button
            onClick={onDismiss}
            className="text-muted-foreground hover:text-foreground transition-colors p-1 shrink-0"
            aria-label="Dismiss"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}

interface DashboardClientProps {
  user: { id: string; email?: string | null } | null;
  initialTasks: Task[];
  initialTotal: number;
  initialProjects: string[];
}

export function DashboardClient({ user, initialTasks, initialTotal, initialProjects }: DashboardClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Read filters from URL search params
  const filters = useMemo(() => {
    const f: Record<string, string | undefined> = {};
    const status = searchParams.get("status");
    const intent = searchParams.get("intent");
    const agent = searchParams.get("assigned_agent");
    const project = searchParams.get("project");
    const sort = searchParams.get("sort");
    if (status) f.status = status;
    if (intent) f.intent = intent;
    if (agent) f.agent = agent;
    if (project) f.project = project;
    f.sort = (sort as "priority" | "created_at" | "updated_at") || "priority";
    return f;
  }, [searchParams]);

  // Update URL when filters change
  const setFilters = useCallback((newFilters: any) => {
    const params = new URLSearchParams();
    if (newFilters.status && newFilters.status !== "all") params.set("status", newFilters.status);
    if (newFilters.intent && newFilters.intent !== "all") params.set("intent", newFilters.intent);
    if (newFilters.agent) params.set("assigned_agent", newFilters.agent);
    if (newFilters.project) params.set("project", newFilters.project);
    if (newFilters.sort && newFilters.sort !== "priority") params.set("sort", newFilters.sort);
    const qs = params.toString();
    router.replace(qs ? `/dashboard?${qs}` : "/dashboard");
  }, [router]);

  const { tasks, loading, loadingMore, total, hasMore, loadMore, createTask, updateTask, deleteTask, spawnSubtask, uploadAttachment, sendMessage } = useTasks(initialTasks, initialTotal, filters, setFilters);
  const [view, setView] = useState<"list" | "board">(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("dashboard-view");
      if (saved === "list" || saved === "board") return saved;
    }
    return "list";
  });
  const [showBanner, setShowBanner] = useState(false);
  const [shiftHeld, setShiftHeld] = useState(false);

  useEffect(() => {
    if (!user && typeof window !== "undefined" && !sessionStorage.getItem("banner-dismissed")) {
      setShowBanner(true);
    }
  }, [user]);

  // Track Shift key for quick-delete mode
  useEffect(() => {
    const down = (e: KeyboardEvent) => { if (e.key === "Shift") setShiftHeld(true); };
    const up = (e: KeyboardEvent) => { if (e.key === "Shift") setShiftHeld(false); };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    // Also clear on blur (e.g. user switches tabs while holding shift)
    const blur = () => setShiftHeld(false);
    window.addEventListener("blur", blur);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", blur);
    };
  }, []);

  const uniqueAgents = useMemo(() => {
    const agents = new Set(tasks.map((t) => t.assigned_agent).filter(Boolean) as string[]);
    return Array.from(agents);
  }, [tasks]);

  const uniqueProjects = useMemo(() => {
    const fromTasks = tasks.map((t) => t.project).filter(Boolean) as string[];
    const all = new Set([...initialProjects, ...fromTasks]);
    return Array.from(all).sort();
  }, [tasks, initialProjects]);

  const handleToggleDone = (task: Task) => {
    const newStatus = task.status === "done" ? "todo" : "done";
    updateTask(task.id, { status: newStatus });
  };

  const handleSelect = (task: Task) => {
    router.push(`/dashboard/tasks/${task.id}`);
  };

  const dismissBanner = () => {
    setShowBanner(false);
    sessionStorage.setItem("banner-dismissed", "1");
  };

  return (
    <div className="flex flex-col h-dvh">
      {/* Welcome banner for logged-out users */}
      {showBanner && <WelcomeBanner onDismiss={dismissBanner} />}

      <div className="flex flex-col flex-1 min-h-0 max-w-5xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 md:px-12 lg:px-20 py-3 border-b">
        <h1 className="text-lg font-semibold pl-10 md:pl-0">Tasks</h1>
        <Tabs value={view} onValueChange={(v) => {
          const val = v as "list" | "board";
          setView(val);
          localStorage.setItem("dashboard-view", val);
        }}>
          <TabsList className="h-8">
            <TabsTrigger value="list" className="h-6 px-2 text-xs gap-1">
              <List className="w-3.5 h-3.5" /> List
            </TabsTrigger>
            <TabsTrigger value="board" className="h-6 px-2 text-xs gap-1">
              <Columns3 className="w-3.5 h-3.5" /> Board
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Quick add */}
      <QuickAdd onAdd={createTask} />

      {/* Filters */}
      <TaskFilters filters={filters} onFiltersChange={setFilters} agents={uniqueAgents} projects={uniqueProjects} />

      {/* Content */}
      <div className="flex-1 overflow-auto scrollbar-thin">
        {!loading && tasks.length === 0 && !filters.status && !filters.intent && !filters.agent ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <h2 className="text-lg font-semibold mb-2">Your task queue is empty</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Create your first task above, or connect an agent via API key.
            </p>
          </div>
        ) : view === "list" ? (
          <TaskList tasks={tasks} loading={loading} loadingMore={loadingMore} total={total} hasMore={hasMore} onLoadMore={loadMore} onSelect={handleSelect} onToggleDone={handleToggleDone} onUpdate={(id, updates) => updateTask(id, updates)} onDelete={deleteTask} shiftHeld={shiftHeld} />
        ) : (
          <TaskBoard tasks={tasks} loading={loading} loadingMore={loadingMore} hasMore={hasMore} onLoadMore={loadMore} onSelect={handleSelect} onStatusChange={(id, status) => updateTask(id, { status })} onUpdate={(id, updates) => updateTask(id, updates)} onDelete={deleteTask} shiftHeld={shiftHeld} />
        )}
      </div>

      </div>
    </div>
  );
}
