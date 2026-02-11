"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ALL_STATUSES, ALL_INTENTS, STATUS_LABELS, INTENT_LABELS } from "@/lib/constants";
import type { TaskStatus, TaskIntent } from "@/types/tasks";

interface TaskFiltersProps {
  filters: {
    status?: TaskStatus | "all";
    intent?: TaskIntent | "all";
    agent?: string;
    sort?: "priority" | "created_at" | "updated_at";
  };
  onFiltersChange: (filters: any) => void;
  agents: string[];
}

export function TaskFilters({ filters, onFiltersChange, agents }: TaskFiltersProps) {
  return (
    <div className="flex items-center gap-2 px-6 md:px-12 lg:px-20 py-2 border-b flex-wrap">
      <Select
        value={filters.status || "all"}
        onValueChange={(v) => onFiltersChange({ ...filters, status: v as TaskStatus | "all" })}
      >
        <SelectTrigger className="w-[130px] h-8 text-xs">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All statuses</SelectItem>
          {ALL_STATUSES.map((s) => (
            <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.intent || "all"}
        onValueChange={(v) => onFiltersChange({ ...filters, intent: v as TaskIntent | "all" })}
      >
        <SelectTrigger className="w-[120px] h-8 text-xs">
          <SelectValue placeholder="Intent" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All intents</SelectItem>
          {ALL_INTENTS.map((i) => (
            <SelectItem key={i} value={i}>{INTENT_LABELS[i]}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {agents.length > 0 && (
        <Select
          value={filters.agent || "all"}
          onValueChange={(v) => onFiltersChange({ ...filters, agent: v === "all" ? undefined : v })}
        >
          <SelectTrigger className="w-[130px] h-8 text-xs">
            <SelectValue placeholder="Agent" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All agents</SelectItem>
            {agents.map((a) => (
              <SelectItem key={a} value={a}>{a}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      <Select
        value={filters.sort || "priority"}
        onValueChange={(v) => onFiltersChange({ ...filters, sort: v })}
      >
        <SelectTrigger className="w-[120px] h-8 text-xs">
          <SelectValue placeholder="Sort" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="priority">Priority</SelectItem>
          <SelectItem value="created_at">Created</SelectItem>
          <SelectItem value="updated_at">Updated</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
