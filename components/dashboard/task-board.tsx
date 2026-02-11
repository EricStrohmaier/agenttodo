"use client";

import { useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { TaskCard, SortableTaskCard } from "./task-card";
import { BoardColumn } from "./board-column";
import { ALL_STATUSES, STATUS_LABELS, STATUS_DOT_COLORS } from "@/lib/constants";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import type { Task, TaskStatus } from "@/types/tasks";

interface TaskBoardProps {
  tasks: Task[];
  loading: boolean;
  loadingMore?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  onSelect: (task: Task) => void;
  onStatusChange?: (id: string, status: TaskStatus) => void;
  onUpdate?: (id: string, updates: Partial<Task>) => void;
  onDelete?: (id: string) => void;
  shiftHeld?: boolean;
}

export function TaskBoard({ tasks, loading, loadingMore, hasMore, onLoadMore, onSelect, onStatusChange, onUpdate, onDelete, shiftHeld }: TaskBoardProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 px-4 md:px-6 py-4">
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

  function handleDragStart(event: DragStartEvent) {
    const task = tasks.find((t) => t.id === event.active.id);
    if (task) setActiveTask(task);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveTask(null);
    const { active, over } = event;
    if (!over || !onStatusChange) return;

    const taskId = active.id as string;
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    // Determine target status: dropped on a column or on another task
    let targetStatus: TaskStatus | undefined;

    if (ALL_STATUSES.includes(over.id as TaskStatus)) {
      targetStatus = over.id as TaskStatus;
    } else {
      const overTask = tasks.find((t) => t.id === over.id);
      if (overTask) targetStatus = overTask.status;
    }

    if (targetStatus && targetStatus !== task.status) {
      onStatusChange(taskId, targetStatus);
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 px-4 md:px-6 py-4 overflow-x-auto">
        {columns.map((col) => (
          <BoardColumn
            key={col.status}
            status={col.status}
            label={col.label}
            dotColor={col.dotColor}
            tasks={col.tasks}
            onSelect={onSelect}
            onUpdate={onUpdate}
            onDelete={onDelete}
            shiftHeld={shiftHeld}
          />
        ))}
      </div>

      <DragOverlay dropAnimation={{ duration: 200, easing: "ease" }}>
        {activeTask ? (
          <div className="rotate-[2deg] scale-105">
            <TaskCard task={activeTask} onSelect={() => {}} />
          </div>
        ) : null}
      </DragOverlay>

      {hasMore && (
        <div className="flex justify-center px-4 md:px-6 pb-4">
          <Button variant="outline" size="sm" className="h-7 text-xs" onClick={onLoadMore} disabled={loadingMore}>
            {loadingMore ? (
              <>
                <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />
                Loading...
              </>
            ) : (
              "Load more tasks"
            )}
          </Button>
        </div>
      )}
    </DndContext>
  );
}
