"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { SortableTaskCard } from "./task-card";
import type { Task, TaskStatus } from "@/types/tasks";

interface BoardColumnProps {
  status: TaskStatus;
  label: string;
  dotColor: string;
  tasks: Task[];
  onSelect: (task: Task) => void;
  onUpdate?: (id: string, updates: Partial<Task>) => void;
  onDelete?: (id: string) => void;
  shiftHeld?: boolean;
}

export function BoardColumn({ status, label, dotColor, tasks, onSelect, onUpdate, onDelete, shiftHeld }: BoardColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div className="min-w-[180px] flex flex-col">
      {/* Column header */}
      <div className="flex items-center gap-2 mb-2 px-1">
        <div className={`w-2 h-2 rounded-full ${dotColor}`} />
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {label}
        </span>
        <span className="text-[10px] text-muted-foreground/60 bg-muted/50 rounded-full px-1.5 py-0.5 min-w-[20px] text-center font-medium">
          {tasks.length}
        </span>
      </div>

      {/* Column body — droppable area */}
      <div
        ref={setNodeRef}
        className={`flex-1 rounded-lg p-1.5 min-h-[120px] transition-colors duration-150 ${
          isOver ? "bg-accent/40 ring-2 ring-primary/20" : "bg-muted/30"
        }`}
      >
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-1.5 max-h-[calc(100dvh-240px)] overflow-y-auto scrollbar-thin">
            {tasks.map((task) => (
              <SortableTaskCard key={task.id} task={task} onSelect={onSelect} onUpdate={onUpdate} onDelete={onDelete} shiftHeld={shiftHeld} />
            ))}
            {tasks.length === 0 && (
              <div className="flex items-center justify-center h-[100px] text-xs text-muted-foreground/40">
                No tasks
              </div>
            )}
          </div>
        </SortableContext>
      </div>
    </div>
  );
}
