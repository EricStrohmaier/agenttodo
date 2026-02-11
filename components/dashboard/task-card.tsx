"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ALL_INTENTS, INTENT_COLORS, INTENT_LABELS, PRIORITY_COLORS } from "@/lib/constants";
import { PriorityDots } from "./task-row";
import { timeAgo } from "@/lib/time";
import { GripVertical, MessageCircle, Paperclip, Trash2 } from "lucide-react";
import type { Task } from "@/types/tasks";

interface TaskCardProps {
  task: Task;
  onSelect: (task: Task) => void;
  onUpdate?: (id: string, updates: Partial<Task>) => void;
  onDelete?: (id: string) => void;
  shiftHeld?: boolean;
}

const priorityLabel = (p: number) =>
  p === 1 ? "Low" : p === 2 ? "Medium-Low" : p === 3 ? "Medium" : p === 4 ? "High" : "Urgent";

export function TaskCard({ task, onSelect }: TaskCardProps) {
  return (
    <div
      className="p-3 rounded-md border bg-card hover:bg-accent/50 cursor-pointer transition-colors"
      onClick={() => onSelect(task)}
    >
      <p className="text-sm font-medium mb-2 line-clamp-2">{task.title}</p>
      <div className="flex items-center gap-2 flex-wrap">
        {task.project && (
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-normal">
            {task.project}
          </Badge>
        )}
        <Badge variant="secondary" className={`text-[10px] px-1.5 py-0 font-normal ${INTENT_COLORS[task.intent]}`}>
          {INTENT_LABELS[task.intent]}
        </Badge>
        {task.human_input_needed && (
          <MessageCircle className="w-3 h-3 text-amber-500" />
        )}
        {task.attachments?.length > 0 && (
          <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
            <Paperclip className="w-2.5 h-2.5" />
            {task.attachments.length}
          </span>
        )}
        <PriorityDots priority={task.priority} />
        <span className="text-[10px] text-muted-foreground ml-auto">{timeAgo(task.updated_at)}</span>
      </div>
      {task.assigned_agent && (
        <p className="text-xs text-muted-foreground mt-2 truncate">🤖 {task.assigned_agent}</p>
      )}
    </div>
  );
}

export function SortableTaskCard({ task, onSelect, onUpdate, onDelete, shiftHeld }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <TooltipProvider delayDuration={400}>
      <div
        ref={setNodeRef}
        style={style}
        className={`px-2.5 py-2 rounded-md border bg-card transition-colors group/card ${
          isDragging ? "opacity-40 shadow-lg" : "hover:bg-accent/50"
        }`}
      >
        {/* Title row — drag handle, title, trash */}
        <div className="flex items-start gap-1 mb-1.5">
          <button
            {...attributes}
            {...listeners}
            className="shrink-0 mt-0.5 cursor-grab active:cursor-grabbing text-muted-foreground/40 hover:text-muted-foreground opacity-0 group-hover/card:opacity-100 transition-opacity touch-none"
            onClick={(e) => e.stopPropagation()}
          >
            <GripVertical className="w-3 h-3" />
          </button>

          <p
            className="flex-1 min-w-0 text-xs font-medium line-clamp-2 cursor-pointer"
            onClick={() => onSelect(task)}
          >
            {task.title}
          </p>

          <div className="shrink-0 w-4" onClick={(e) => e.stopPropagation()}>
            {shiftHeld && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => onDelete?.(task.id)}
                    className="p-0.5 rounded-sm text-red-500 hover:bg-red-500/10 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="left" sideOffset={8}>
                  <p>Delete task</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>

        {/* Tags row — project, intent, icons */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {task.project && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="outline" className="text-[9px] leading-tight px-1 py-0 font-normal">
                  {task.project}
                </Badge>
              </TooltipTrigger>
              <TooltipContent side="bottom" sideOffset={4}>
                <p>Project</p>
              </TooltipContent>
            </Tooltip>
          )}

          <div onClick={(e) => e.stopPropagation()}>
            <DropdownMenu>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuTrigger asChild>
                    <Badge
                      variant="secondary"
                      className={`text-[9px] leading-tight px-1 py-0 font-normal cursor-pointer hover:ring-1 hover:ring-ring/30 transition-shadow ${INTENT_COLORS[task.intent]}`}
                    >
                      {INTENT_LABELS[task.intent]}
                    </Badge>
                  </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent side="bottom" sideOffset={4}>
                  <p>Intent — click to change</p>
                </TooltipContent>
              </Tooltip>
              <DropdownMenuContent align="start" className="min-w-[100px]">
                {ALL_INTENTS.map((i) => (
                  <DropdownMenuItem
                    key={i}
                    onClick={() => onUpdate?.(task.id, { intent: i })}
                    className="text-xs gap-2"
                  >
                    <Badge variant="secondary" className={`text-[10px] px-1.5 py-0 ${INTENT_COLORS[i]}`}>
                      {INTENT_LABELS[i]}
                    </Badge>
                    {i === task.intent && <span className="ml-auto text-muted-foreground">✓</span>}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {task.human_input_needed && (
            <Tooltip>
              <TooltipTrigger asChild>
                <MessageCircle className="w-2.5 h-2.5 text-amber-500" />
              </TooltipTrigger>
              <TooltipContent side="bottom" sideOffset={4}>
                <p>Needs human input</p>
              </TooltipContent>
            </Tooltip>
          )}

          {task.attachments?.length > 0 && (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="flex items-center gap-0.5 text-[9px] text-muted-foreground">
                  <Paperclip className="w-2 h-2" />
                  {task.attachments.length}
                </span>
              </TooltipTrigger>
              <TooltipContent side="bottom" sideOffset={4}>
                <p>{task.attachments.length} attachment{task.attachments.length !== 1 ? "s" : ""}</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>

        {/* Bottom row — priority, agent, time */}
        <div className="flex items-center gap-1.5 mt-1.5">
          <div onClick={(e) => e.stopPropagation()}>
            <DropdownMenu>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuTrigger asChild>
                    <div className="cursor-pointer hover:ring-1 hover:ring-ring/30 rounded-sm px-0.5 transition-shadow">
                      <PriorityDots priority={task.priority} />
                    </div>
                  </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent side="bottom" sideOffset={4}>
                  <p>Priority: {priorityLabel(task.priority)} — click to change</p>
                </TooltipContent>
              </Tooltip>
              <DropdownMenuContent align="start" className="min-w-[120px]">
                {[1, 2, 3, 4, 5].map((p) => (
                  <DropdownMenuItem
                    key={p}
                    onClick={() => onUpdate?.(task.id, { priority: p })}
                    className="text-xs gap-2"
                  >
                    <PriorityDots priority={p} />
                    <span>{priorityLabel(p)}</span>
                    {p === task.priority && <span className="ml-auto text-muted-foreground">✓</span>}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {task.assigned_agent && (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="text-[9px] text-muted-foreground truncate max-w-[60px]">
                  {task.assigned_agent}
                </span>
              </TooltipTrigger>
              <TooltipContent side="bottom" sideOffset={4}>
                <p>Agent: {task.assigned_agent}</p>
              </TooltipContent>
            </Tooltip>
          )}

          <Tooltip>
            <TooltipTrigger asChild>
              <span className="text-[9px] text-muted-foreground ml-auto">{timeAgo(task.updated_at)}</span>
            </TooltipTrigger>
            <TooltipContent side="bottom" sideOffset={4}>
              <p>Last updated</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  );
}
