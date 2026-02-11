export type TaskIntent = "research" | "build" | "write" | "think" | "admin" | "ops";
export type TaskStatus = "todo" | "in_progress" | "blocked" | "review" | "done";
export type LogAction = "created" | "claimed" | "updated" | "blocked" | "completed" | "added_subtask" | "request_review" | "unclaimed";

export interface Task {
  id: string;
  title: string;
  description: string;
  intent: TaskIntent;
  status: TaskStatus;
  priority: number;
  context: Record<string, any>;
  parent_task_id: string | null;
  assigned_agent: string | null;
  created_by: string;
  result: Record<string, any> | null;
  artifacts: string[];
  confidence: number | null;
  requires_human_review: boolean;
  blockers: string[];
  claimed_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ActivityLog {
  id: string;
  task_id: string;
  agent: string;
  action: LogAction;
  details: Record<string, any>;
  created_at: string;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  intent?: TaskIntent;
  priority?: number;
  context?: Record<string, any>;
  parent_task_id?: string;
  assigned_agent?: string;
  created_by?: string;
  requires_human_review?: boolean;
}
