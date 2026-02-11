"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ALL_STATUSES, ALL_INTENTS, INTENT_COLORS, STATUS_COLORS, PRIORITY_COLORS, INTENT_LABELS, STATUS_LABELS, HUMAN_INPUT_BADGE_COLOR } from "@/lib/constants";
import { timeAgo } from "@/lib/time";
import type { Task, TaskStatus, TaskIntent } from "@/types/tasks";
import { Circle, MessageCircle, Paperclip, Trash2 } from "lucide-react";

interface TaskRowProps {
  task: Task;
  onSelect: (task: Task) => void;
  onToggleDone: (task: Task) => void;
  onUpdate?: (id: string, updates: Partial<Task>) => void;
  onDelete?: (id: string) => void;
  shiftHeld?: boolean;
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

const priorityLabel = (p: number) =>
  p === 1 ? "Low" : p === 2 ? "Medium-Low" : p === 3 ? "Medium" : p === 4 ? "High" : "Urgent";

export function TaskRow({ task, onSelect, onToggleDone, onUpdate, onDelete, shiftHeld }: TaskRowProps) {
  return (
    <TooltipProvider delayDuration={400}>
      <div
        className="flex items-center gap-3 px-6 md:px-12 lg:px-20 py-2.5 border-b hover:bg-accent/50 cursor-pointer transition-colors group"
        onClick={() => onSelect(task)}
      >
        <div onClick={(e) => e.stopPropagation()}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <Checkbox
                  checked={task.status === "done"}
                  onCheckedChange={() => onToggleDone(task)}
                  className="shrink-0"
                />
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom" sideOffset={4}>
              <p>{task.status === "done" ? "Mark as to do" : "Mark as done"}</p>
            </TooltipContent>
          </Tooltip>
        </div>

        <span className={`flex-1 text-sm truncate ${task.status === "done" ? "line-through text-muted-foreground" : ""}`}>
          {task.title}
        </span>

        {task.project && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-normal shrink-0">
                {task.project}
              </Badge>
            </TooltipTrigger>
            <TooltipContent side="bottom" sideOffset={4}>
              <p>Project</p>
            </TooltipContent>
          </Tooltip>
        )}

        {/* Intent - inline editable */}
        <div onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Badge
                    variant="secondary"
                    className={`text-[10px] px-1.5 py-0 font-normal shrink-0 cursor-pointer hover:ring-1 hover:ring-ring/30 transition-shadow ${INTENT_COLORS[task.intent]}`}
                  >
                    {INTENT_LABELS[task.intent]}
                  </Badge>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent side="bottom" sideOffset={4}>
                <p>Intent — click to change</p>
              </TooltipContent>
            </Tooltip>
            <DropdownMenuContent align="center" className="min-w-[100px]">
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
              <MessageCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            </TooltipTrigger>
            <TooltipContent side="bottom" sideOffset={4}>
              <p>Needs human input</p>
            </TooltipContent>
          </Tooltip>
        )}

        {task.attachments?.length > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="flex items-center gap-0.5 text-xs text-muted-foreground shrink-0">
                <Paperclip className="w-3 h-3" />
                {task.attachments.length}
              </span>
            </TooltipTrigger>
            <TooltipContent side="bottom" sideOffset={4}>
              <p>{task.attachments.length} attachment{task.attachments.length !== 1 ? "s" : ""}</p>
            </TooltipContent>
          </Tooltip>
        )}

        {/* Priority - inline editable */}
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
            <DropdownMenuContent align="center" className="min-w-[120px]">
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
              <span className="text-xs text-muted-foreground truncate max-w-[80px] hidden sm:inline">
                {task.assigned_agent}
              </span>
            </TooltipTrigger>
            <TooltipContent side="bottom" sideOffset={4}>
              <p>Agent: {task.assigned_agent}</p>
            </TooltipContent>
          </Tooltip>
        )}

        {/* Status - inline editable */}
        <div onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Badge
                    variant="secondary"
                    className={`text-[10px] px-1.5 py-0 font-normal shrink-0 cursor-pointer hover:ring-1 hover:ring-ring/30 transition-shadow ${STATUS_COLORS[task.status]}`}
                  >
                    {STATUS_LABELS[task.status]}
                  </Badge>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent side="bottom" sideOffset={4}>
                <p>Status — click to change</p>
              </TooltipContent>
            </Tooltip>
            <DropdownMenuContent align="end" className="min-w-[120px]">
              {ALL_STATUSES.map((s) => (
                <DropdownMenuItem
                  key={s}
                  onClick={() => onUpdate?.(task.id, { status: s })}
                  className="text-xs gap-2"
                >
                  <Badge variant="secondary" className={`text-[10px] px-1.5 py-0 ${STATUS_COLORS[s]}`}>
                    {STATUS_LABELS[s]}
                  </Badge>
                  {s === task.status && <span className="ml-auto text-muted-foreground">✓</span>}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <Tooltip>
          <TooltipTrigger asChild>
            <span className="text-xs text-muted-foreground shrink-0 w-12 text-right hidden sm:inline">
              {timeAgo(task.updated_at)}
            </span>
          </TooltipTrigger>
          <TooltipContent side="bottom" sideOffset={4}>
            <p>Last updated</p>
          </TooltipContent>
        </Tooltip>

        <div className="shrink-0 w-6 relative" onClick={(e) => e.stopPropagation()}>
          {shiftHeld && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => onDelete?.(task.id)}
                  className="absolute inset-0 flex items-center justify-center rounded-sm text-red-500 hover:bg-red-500/10 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="left" sideOffset={8}>
                <p>Delete task</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}

export { PriorityDots };
