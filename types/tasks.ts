export type TaskIntent = "research" | "build" | "write" | "think" | "admin" | "ops";
export type TaskStatus = "todo" | "in_progress" | "blocked" | "review" | "done";
export type LogAction = "created" | "claimed" | "updated" | "blocked" | "completed" | "added_subtask" | "request_review" | "unclaimed" | "message_sent";

export interface TaskAttachment {
  url: string;
  name: string;
  type: string;
  size: number;
  storage_path: string;
}

export interface TaskMessage {
  from: string;
  content: string;
  created_at: string;
}

export interface Task {
  id: string;
  user_id: string;
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
  attachments: TaskAttachment[];
  project: string | null;
  project_context: string | null;
  human_input_needed: boolean;
  messages: TaskMessage[];
  claimed_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ActivityLog {
  id: string;
  user_id: string;
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
  project?: string;
  project_context?: string;
  human_input_needed?: boolean;
}
