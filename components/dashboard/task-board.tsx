"use client";

import { TaskCard } from "./task-card";
import { ALL_STATUSES, STATUS_LABELS, STATUS_DOT_COLORS } from "@/lib/constants";
import { Skeleton } from "@/components/ui/skeleton";
import type { Task, TaskStatus } from "@/types/tasks";

interface TaskBoardProps {
  tasks: Task[];
  loading: boolean;
  onSelect: (task: Task) => void;
}

export function TaskBoard({ tasks, loading, onSelect }: TaskBoardProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 px-6 md:px-12 lg:px-20 py-4">
        {ALL_STATUSES.map((s) => (
          <div key={s} className="space-y-3">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-24 w-full rounded-lg" />
            <Skeleton className="h-24 w-full rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  const columns = ALL_STATUSES.map((status) => ({
    status,
    label: STATUS_LABELS[status],
    dotColor: STATUS_DOT_COLORS[status],
    tasks: tasks.filter((t) => t.status === status),
  }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 px-6 md:px-12 lg:px-20 py-4 overflow-x-auto">
      {columns.map((col) => (
        <div key={col.status} className="min-w-[200px]">
          <div className="flex items-center gap-2 mb-3 px-1">
            <div className={`w-2 h-2 rounded-full ${col.dotColor}`} />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {col.label}
            </span>
            <span className="text-xs text-muted-foreground/60">{col.tasks.length}</span>
          </div>
          <div className="space-y-2 max-h-[calc(100dvh-200px)] overflow-y-auto">
            {col.tasks.map((task) => (
              <TaskCard key={task.id} task={task} onSelect={onSelect} />
            ))}
            {col.tasks.length === 0 && (
              <div className="border border-dashed rounded-lg p-4 text-center text-xs text-muted-foreground/50">
                No tasks
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
