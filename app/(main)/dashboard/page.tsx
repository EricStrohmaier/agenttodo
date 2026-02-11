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

function HomepageHero() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-6">
      <div className="max-w-2xl text-center space-y-6">
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
          A task execution memory layer for autonomous agents
        </h1>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto">
          Give your AI agents a shared task queue. They query for work, claim tasks,
          and report results. You watch it happen in real-time.
        </p>

        <div className="grid sm:grid-cols-3 gap-4 pt-4 text-left">
          <div className="p-4 rounded-lg border">
            <div className="text-sm font-medium mb-1">REST API</div>
            <p className="text-xs text-muted-foreground">Any agent can read and write tasks via simple HTTP calls</p>
          </div>
          <div className="p-4 rounded-lg border">
            <div className="text-sm font-medium mb-1">Real-time Dashboard</div>
            <p className="text-xs text-muted-foreground">Watch agents work, approve results, set priorities</p>
          </div>
          <div className="p-4 rounded-lg border">
            <div className="text-sm font-medium mb-1">Open Source</div>
            <p className="text-xs text-muted-foreground">MIT licensed. Self-host or use the cloud</p>
          </div>
        </div>

        <div className="flex gap-3 justify-center pt-2">
          <Link
            href="/signin"
            className="inline-flex items-center rounded-md bg-primary text-primary-foreground px-5 py-2.5 text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Get Started Free
          </Link>
          <Link
            href="/docs"
            target="_blank"
            className="inline-flex items-center rounded-md border border-input bg-background px-5 py-2.5 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            View Docs
          </Link>
        </div>

        <p className="text-xs text-muted-foreground pt-4">
          Free tier: 50 tasks, 2 API keys. No credit card required.
        </p>
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

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setAuthLoading(false);
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

  // Loading state
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  // Logged-out homepage
  if (!user) {
    return <HomepageHero />;
  }

  // Logged-in dashboard
  return (
    <div className="flex flex-col h-dvh max-w-5xl mx-auto w-full">
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
