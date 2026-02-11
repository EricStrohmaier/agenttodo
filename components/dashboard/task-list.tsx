"use client";

import { TaskRow } from "./task-row";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import type { Task } from "@/types/tasks";

interface TaskListProps {
  tasks: Task[];
  loading: boolean;
  loadingMore?: boolean;
  total?: number;
  hasMore?: boolean;
  onLoadMore?: () => void;
  onSelect: (task: Task) => void;
  onToggleDone: (task: Task) => void;
  onUpdate?: (id: string, updates: Partial<Task>) => void;
  onDelete?: (id: string) => void;
  shiftHeld?: boolean;
}

export function TaskList({ tasks, loading, loadingMore, total, hasMore, onLoadMore, onSelect, onToggleDone, onUpdate, onDelete, shiftHeld }: TaskListProps) {
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
    <div>
      <div className="divide-y">
        {tasks.map((task) => (
          <TaskRow key={task.id} task={task} onSelect={onSelect} onToggleDone={onToggleDone} onUpdate={onUpdate} onDelete={onDelete} shiftHeld={shiftHeld} />
        ))}
      </div>
      {(hasMore || (total !== undefined && total > 0)) && (
        <div className="flex items-center justify-between px-6 md:px-12 lg:px-20 py-3 border-t">
          <span className="text-xs text-muted-foreground">
            Showing {tasks.length} of {total} tasks
          </span>
          {hasMore && (
            <Button variant="outline" size="sm" className="h-7 text-xs" onClick={onLoadMore} disabled={loadingMore}>
              {loadingMore ? (
                <>
                  <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />
                  Loading...
                </>
              ) : (
                "Load more"
              )}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
