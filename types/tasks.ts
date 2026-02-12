export type TaskIntent = "research" | "build" | "write" | "think" | "admin" | "ops" | "monitor" | "test" | "review" | "deploy";
export type TaskStatus = "todo" | "in_progress" | "blocked" | "review" | "done";
export type LogAction = "created" | "claimed" | "updated" | "blocked" | "completed" | "added_subtask" | "request_review" | "unclaimed" | "message_sent" | "deleted";

export interface TaskAttachment {
  id: string;
  user_id: string;
  task_id: string;
  name: string;
  type: string;
  size: number;
  storage_path: string;
  url: string;
  created_at: string;
}

export interface TaskMessage {
  id: string;
  user_id: string;
  task_id: string;
  from_agent: string;
  content: string;
  created_at: string;
}

export interface TaskDependency {
  id: string;
  user_id: string;
  task_id: string;
  depends_on_task_id: string;
  depends_on?: { id: string; title: string; status: TaskStatus };
  created_at: string;
}

export interface Project {
  id: string;
  user_id: string;
  name: string;
  description: string;
  color: string | null;
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
  /** Input data the agent needs to do its work (tags, references, scope). Allows arbitrary nesting. */
  context: Record<string, any>;
  parent_task_id: string | null;
  assigned_agent: string | null;
  created_by: string;
  /** Output from agent execution. Only written on completion. */
  result: Record<string, any> | null;
  artifacts: string[];
  confidence: number | null;
  requires_human_review: boolean;
  blockers: string[];
  attachments?: TaskAttachment[];
  project: string | null;
  human_input_needed: boolean;
  messages?: TaskMessage[];
  dependencies?: TaskDependency[];
  /** System/tracking info (source, attribution, version). Flat key-value only — no nested objects. */
  metadata: Record<string, string | number | boolean | null>;
  recurrence: Record<string, any> | null;
  recurrence_source_id: string | null;
  next_run_at: string | null;
  claimed_at: string | null;
  completed_at: string | null;
  deleted_at: string | null;
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

export interface AgentFeedback {
  id: string;
  user_id: string;
  agent_name: string;
  message: string;
  created_at: string;
}

export interface CreateFeedbackInput {
  message: string;
}

export interface ClaimNextTaskInput {
  intents?: TaskIntent[];
  project?: string;
  priority_min?: number;
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
  human_input_needed?: boolean;
  metadata?: Record<string, any>;
  recurrence?: Record<string, any>;
  recurrence_source_id?: string;
}
