"use client";

import { useEffect, useState } from "react";
import type { ActivityLog as ActivityLogType } from "@/types/tasks";
import { timeAgo } from "@/lib/time";
import { Skeleton } from "@/components/ui/skeleton";

const ACTION_ICONS: Record<string, string> = {
  created: "🆕",
  claimed: "🤖",
  updated: "✏️",
  blocked: "🚫",
  completed: "✅",
  added_subtask: "📎",
  request_review: "👀",
  unclaimed: "↩️",
};

interface ActivityLogProps {
  taskId: string;
}

export function ActivityLog({ taskId }: ActivityLogProps) {
  const [logs, setLogs] = useState<ActivityLogType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLogs() {
      const res = await fetch(`/api/tasks/${taskId}`);
      const json = await res.json();
      if (json.data?.activity_log) {
        setLogs(json.data.activity_log);
      }
      setLoading(false);
    }
    fetchLogs();
  }, [taskId]);

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex gap-2">
            <Skeleton className="w-4 h-4 rounded-full shrink-0" />
            <Skeleton className="h-4 flex-1" />
          </div>
        ))}
      </div>
    );
  }

  if (logs.length === 0) {
    return <p className="text-xs text-muted-foreground">No activity yet</p>;
  }

  return (
    <div className="space-y-2">
      {logs.map((log) => (
        <div key={log.id} className="flex items-start gap-2 text-xs">
          <span className="shrink-0 mt-0.5">{ACTION_ICONS[log.action] || "•"}</span>
          <div className="flex-1 min-w-0">
            <span className="font-medium">{log.agent}</span>{" "}
            <span className="text-muted-foreground">{log.action.replace("_", " ")}</span>
            {log.details && Object.keys(log.details).length > 0 && (
              <span className="text-muted-foreground"> — {JSON.stringify(log.details)}</span>
            )}
          </div>
          <span className="text-muted-foreground shrink-0">{timeAgo(log.created_at)}</span>
        </div>
      ))}
    </div>
  );
}
