"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { INTENT_COLORS, STATUS_COLORS, PRIORITY_COLORS, INTENT_LABELS, STATUS_LABELS } from "@/lib/constants";
import { timeAgo } from "@/lib/time";
import type { Task } from "@/types/tasks";
import { Circle } from "lucide-react";

interface TaskRowProps {
  task: Task;
  onSelect: (task: Task) => void;
  onToggleDone: (task: Task) => void;
}

function PriorityDots({ priority }: { priority: number }) {
  const color = PRIORITY_COLORS[priority] || PRIORITY_COLORS[3];
  return (
    <div className="flex gap-0.5 items-center">
      {Array.from({ length: 5 }).map((_, i) => (
        <Circle
          key={i}
          className={`w-2 h-2 ${i < priority ? color : "text-gray-200 dark:text-gray-700"}`}
          fill={i < priority ? "currentColor" : "none"}
          strokeWidth={i < priority ? 0 : 1.5}
        />
      ))}
    </div>
  );
}

export function TaskRow({ task, onSelect, onToggleDone }: TaskRowProps) {
  return (
    <div
      className="flex items-center gap-3 px-4 py-2.5 border-b hover:bg-accent/30 cursor-pointer transition-colors group"
      onClick={() => onSelect(task)}
    >
      <div onClick={(e) => e.stopPropagation()}>
        <Checkbox
          checked={task.status === "done"}
          onCheckedChange={() => onToggleDone(task)}
          className="shrink-0"
        />
      </div>

      <span className={`flex-1 text-sm truncate ${task.status === "done" ? "line-through text-muted-foreground" : ""}`}>
        {task.title}
      </span>

      <Badge variant="secondary" className={`text-[10px] px-1.5 py-0 font-normal shrink-0 ${INTENT_COLORS[task.intent]}`}>
        {INTENT_LABELS[task.intent]}
      </Badge>

      <PriorityDots priority={task.priority} />

      {task.assigned_agent && (
        <span className="text-xs text-muted-foreground truncate max-w-[80px] hidden sm:inline">
          {task.assigned_agent}
        </span>
      )}

      <Badge variant="secondary" className={`text-[10px] px-1.5 py-0 font-normal shrink-0 ${STATUS_COLORS[task.status]}`}>
        {STATUS_LABELS[task.status]}
      </Badge>

      <span className="text-xs text-muted-foreground shrink-0 w-12 text-right hidden sm:inline">
        {timeAgo(task.updated_at)}
      </span>
    </div>
  );
}

export { PriorityDots };
