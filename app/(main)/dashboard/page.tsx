"use client";

import { useState, useMemo, useEffect } from "react";
import { useTasks } from "@/hooks/use-tasks";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import { QuickAdd } from "@/components/dashboard/quick-add";
import { TaskFilters } from "@/components/dashboard/task-filters";
import { TaskList } from "@/components/dashboard/task-list";
import { TaskBoard } from "@/components/dashboard/task-board";
import { TaskDetail } from "@/components/dashboard/task-detail";
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
              A task execution memory layer for autonomous agents
            </h2>
            <p className="text-sm text-muted-foreground max-w-lg">
              Give your AI agents a shared task queue. They query for work, claim tasks,
              and report results — you watch it happen in real-time.
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

export default function DashboardPage() {
  const { tasks, loading, filters, setFilters, createTask, updateTask, deleteTask, spawnSubtask } = useTasks();
  const [view, setView] = useState<"list" | "board">("list");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setAuthLoading(false);
      if (!data.user && !sessionStorage.getItem("banner-dismissed")) {
        setShowBanner(true);
      }
    });
  }, []);

  const uniqueAgents = useMemo(() => {
    const agents = new Set(tasks.map((t) => t.assigned_agent).filter(Boolean) as string[]);
    return Array.from(agents);
  }, [tasks]);

  const handleToggleDone = (task: Task) => {
    const newStatus = task.status === "done" ? "todo" : "done";
    updateTask(task.id, { status: newStatus });
  };

  const handleUpdate = async (id: string, updates: Partial<Task>) => {
    const result = await updateTask(id, updates);
    if (result && selectedTask?.id === id) {
      setSelectedTask({ ...selectedTask, ...updates, ...result });
    }
    return result;
  };

  const dismissBanner = () => {
    setShowBanner(false);
    sessionStorage.setItem("banner-dismissed", "1");
  };

  // Loading state
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-dvh">
      {/* Welcome banner for logged-out users */}
      {showBanner && <WelcomeBanner onDismiss={dismissBanner} />}

      <div className="flex flex-col flex-1 max-w-5xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 md:px-12 lg:px-20 py-3 border-b">
        <h1 className="text-lg font-semibold pl-10 md:pl-0">Tasks</h1>
        <Tabs value={view} onValueChange={(v) => setView(v as "list" | "board")}>
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
      <TaskFilters filters={filters} onFiltersChange={setFilters} agents={uniqueAgents} />

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {!loading && tasks.length === 0 && !filters.status && !filters.intent && !filters.agent ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <h2 className="text-lg font-semibold mb-2">Your task queue is empty</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Create your first task above, or connect an agent via API key.
            </p>
          </div>
        ) : view === "list" ? (
          <TaskList tasks={tasks} loading={loading} onSelect={setSelectedTask} onToggleDone={handleToggleDone} />
        ) : (
          <TaskBoard tasks={tasks} loading={loading} onSelect={setSelectedTask} />
        )}
      </div>

      </div>
      {/* Detail panel */}
      <TaskDetail
        task={selectedTask}
        open={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        onUpdate={handleUpdate}
        onDelete={deleteTask}
        onSpawnSubtask={spawnSubtask}
      />
    </div>
  );
}
