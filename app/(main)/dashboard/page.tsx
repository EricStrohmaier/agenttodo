"use client";

import { useState, useMemo } from "react";
import { useTasks } from "@/hooks/use-tasks";
import { QuickAdd } from "@/components/dashboard/quick-add";
import { TaskFilters } from "@/components/dashboard/task-filters";
import { TaskList } from "@/components/dashboard/task-list";
import { TaskBoard } from "@/components/dashboard/task-board";
import { TaskDetail } from "@/components/dashboard/task-detail";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { List, Columns3 } from "lucide-react";
import type { Task } from "@/types/tasks";

export default function DashboardPage() {
  const { tasks, loading, filters, setFilters, createTask, updateTask, deleteTask, spawnSubtask } = useTasks();
  const [view, setView] = useState<"list" | "board">("list");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const uniqueAgents = useMemo(() => {
    const agents = new Set(tasks.map((t) => t.assigned_agent).filter(Boolean) as string[]);
    return Array.from(agents);
  }, [tasks]);

  const handleToggleDone = (task: Task) => {
    const newStatus = task.status === "done" ? "todo" : "done";
    updateTask(task.id, { status: newStatus });
  };

  // When task is updated in detail panel, also update selectedTask
  const handleUpdate = async (id: string, updates: Partial<Task>) => {
    const result = await updateTask(id, updates);
    if (result && selectedTask?.id === id) {
      setSelectedTask({ ...selectedTask, ...updates, ...result });
    }
    return result;
  };

  return (
    <div className="flex flex-col h-[calc(100dvh)] max-w-5xl mx-auto w-full">
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
            <h2 className="text-lg font-semibold mb-2">Welcome to AgentBoard</h2>
            <p className="text-sm text-muted-foreground">
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
