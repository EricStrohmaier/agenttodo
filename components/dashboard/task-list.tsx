"use client";

import { TaskRow } from "./task-row";
import { Skeleton } from "@/components/ui/skeleton";
import type { Task } from "@/types/tasks";

interface TaskListProps {
  tasks: Task[];
  loading: boolean;
  onSelect: (task: Task) => void;
  onToggleDone: (task: Task) => void;
}

export function TaskList({ tasks, loading, onSelect, onToggleDone }: TaskListProps) {
  if (loading) {
    return (
      <div className="divide-y">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-6 md:px-12 lg:px-20 py-3">
            <Skeleton className="w-4 h-4 rounded" />
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
        ))}
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <p className="text-sm">No tasks yet</p>
        <p className="text-xs mt-1">Add one above to get started</p>
      </div>
    );
  }

  return (
    <div className="divide-y">
      {tasks.map((task) => (
        <TaskRow key={task.id} task={task} onSelect={onSelect} onToggleDone={onToggleDone} />
      ))}
    </div>
  );
}
