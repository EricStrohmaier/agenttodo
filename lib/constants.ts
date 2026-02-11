import type { TaskIntent, TaskStatus } from "@/types/tasks";

export const INTENT_COLORS: Record<TaskIntent, string> = {
  research: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  build: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  write: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  think: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  admin: "bg-gray-100 text-gray-700 dark:bg-gray-800/50 dark:text-gray-400",
  ops: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
};

export const STATUS_COLORS: Record<TaskStatus, string> = {
  todo: "bg-gray-100 text-gray-700 dark:bg-gray-800/50 dark:text-gray-400",
  in_progress: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  blocked: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  review: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  done: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
};

export const STATUS_DOT_COLORS: Record<TaskStatus, string> = {
  todo: "bg-gray-400",
  in_progress: "bg-blue-500",
  blocked: "bg-red-500",
  review: "bg-yellow-500",
  done: "bg-green-500",
};

export const PRIORITY_COLORS: Record<number, string> = {
  1: "text-gray-400",
  2: "text-yellow-500",
  3: "text-yellow-500",
  4: "text-orange-500",
  5: "text-red-500",
};

export const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: "To Do",
  in_progress: "In Progress",
  blocked: "Blocked",
  review: "Review",
  done: "Done",
};

export const INTENT_LABELS: Record<TaskIntent, string> = {
  research: "Research",
  build: "Build",
  write: "Write",
  think: "Think",
  admin: "Admin",
  ops: "Ops",
};

export const ALL_STATUSES: TaskStatus[] = ["todo", "in_progress", "blocked", "review", "done"];
export const ALL_INTENTS: TaskIntent[] = ["research", "build", "write", "think", "admin", "ops"];
