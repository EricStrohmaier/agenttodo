"use client";

import { Badge } from "@/components/ui/badge";
import { INTENT_COLORS, PRIORITY_COLORS, INTENT_LABELS } from "@/lib/constants";
import { PriorityDots } from "./task-row";
import { timeAgo } from "@/lib/time";
import type { Task } from "@/types/tasks";

interface TaskCardProps {
  task: Task;
  onSelect: (task: Task) => void;
}

export function TaskCard({ task, onSelect }: TaskCardProps) {
  return (
    <div
      className="p-3 rounded-lg border bg-card hover:shadow-sm cursor-pointer transition-all"
      onClick={() => onSelect(task)}
    >
      <p className="text-sm font-medium mb-2 line-clamp-2">{task.title}</p>
      <div className="flex items-center gap-2 flex-wrap">
        <Badge variant="secondary" className={`text-[10px] px-1.5 py-0 font-normal ${INTENT_COLORS[task.intent]}`}>
          {INTENT_LABELS[task.intent]}
        </Badge>
        <PriorityDots priority={task.priority} />
        <span className="text-[10px] text-muted-foreground ml-auto">{timeAgo(task.updated_at)}</span>
      </div>
      {task.assigned_agent && (
        <p className="text-xs text-muted-foreground mt-2 truncate">🤖 {task.assigned_agent}</p>
      )}
    </div>
  );
}
