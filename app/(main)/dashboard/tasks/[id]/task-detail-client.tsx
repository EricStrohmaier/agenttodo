"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import {
  ArrowLeft,
  Circle,
  Trash2,
  GitBranch,
  Upload,
  X,
  FileText,
  Send,
  Clock,
  User as UserIcon,
  AlertTriangle,
  CornerDownRight,
  CheckCircle2,
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  ALL_STATUSES,
  ALL_INTENTS,
  STATUS_LABELS,
  INTENT_LABELS,
  INTENT_COLORS,
  STATUS_COLORS,
  PRIORITY_COLORS,
} from "@/lib/constants";
import { ActivityLog } from "@/components/dashboard/activity-log";
import { timeAgo } from "@/lib/time";
import type { Task, TaskStatus, TaskIntent, TaskMessage, TaskDependency } from "@/types/tasks";

interface TaskDetailClientProps {
  initialTask: Task;
  initialSubtasks: Task[];
  initialParentTask: { id: string; title: string } | null;
}

export function TaskDetailClient({ initialTask, initialSubtasks, initialParentTask }: TaskDetailClientProps) {
  const router = useRouter();
  const taskId = initialTask.id;

  const [task, setTask] = useState<Task>(initialTask);
  const [subtasks, setSubtasks] = useState<Task[]>(initialSubtasks);
  const [parentTask] = useState(initialParentTask);

  // Editable fields
  const [title, setTitle] = useState(initialTask.title);
  const [description, setDescription] = useState(initialTask.description || "");
  const [agent, setAgent] = useState(initialTask.assigned_agent || "");
  const [project, setProject] = useState(initialTask.project || "");
  const [context, setContext] = useState(initialTask.context ? JSON.stringify(initialTask.context, null, 2) : "{}");
  const [blockers, setBlockers] = useState(initialTask.blockers?.join("\n") || "");
  const [messageInput, setMessageInput] = useState("");
  const [subtaskTitle, setSubtaskTitle] = useState("");
  const [editingTitle, setEditingTitle] = useState(false);
  const titleRef = useRef<HTMLTextAreaElement>(null);

  // Dirty tracking to avoid saving unchanged values
  const initialValues = useRef<Record<string, any>>({
    title: initialTask.title,
    description: initialTask.description || "",
    agent: initialTask.assigned_agent || "",
    project: initialTask.project || "",
    context: initialTask.context ? JSON.stringify(initialTask.context, null, 2) : "{}",
    blockers: initialTask.blockers?.join("\n") || "",
  });

  const fetchTask = useCallback(async () => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`);
      if (!res.ok) return;
      const json = await res.json();
      if (json.data) {
        setTask(json.data);
        setSubtasks(json.data.subtasks || []);
      }
    } catch {
      // ignore
    }
  }, [taskId]);

  // Realtime updates
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`task-${taskId}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "tasks", filter: `id=eq.${taskId}` },
        (payload) => {
          const updated = payload.new as Task;
          setTask(updated);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [taskId]);

  const save = async (updates: Partial<Task>) => {
    if (!task) return;
    setTask((prev) => ({ ...prev, ...updates }));
    const res = await fetch(`/api/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    const json = await res.json();
    if (json.error) {
      toast.error(json.error);
      fetchTask();
    }
  };

  const handleDelete = async () => {
    const res = await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });
    const json = await res.json();
    if (json.error) {
      toast.error(json.error);
      return;
    }
    toast.success("Task deleted");
    router.push("/dashboard");
  };

  const handleSpawnSubtask = async () => {
    if (!subtaskTitle.trim()) return;
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: subtaskTitle.trim(), parent_task_id: taskId }),
    });
    const json = await res.json();
    if (json.error) {
      toast.error(json.error);
      return;
    }
    toast.success("Subtask created");
    setSubtaskTitle("");
    if (json.data) {
      setSubtasks((prev) => [...prev, json.data]);
    }
  };

  const handleUpload = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`/api/tasks/${taskId}/upload`, {
        method: "POST",
        body: formData,
      });
      const json = await res.json();
      if (json.error) {
        toast.error(json.error);
        return;
      }
      toast.success("File uploaded");
      if (json.data?.attachment) {
        setTask((prev) => ({ ...prev, attachments: [...(prev.attachments || []), json.data.attachment] }));
      }
    };
    input.click();
  };

  const handleDeleteAttachment = async (attachmentId: string) => {
    setTask((prev) => ({ ...prev, attachments: (prev.attachments || []).filter((a) => a.id !== attachmentId) }));
    const res = await fetch(`/api/tasks/${taskId}/attachments/${attachmentId}`, { method: "DELETE" });
    const json = await res.json();
    if (json.error) {
      toast.error(json.error);
      fetchTask();
    }
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim()) return;
    const content = messageInput.trim();
    setMessageInput("");

    const newMessage: TaskMessage = {
      id: crypto.randomUUID(),
      user_id: "",
      task_id: taskId,
      from_agent: "human",
      content,
      created_at: new Date().toISOString(),
    };
    setTask((prev) => ({ ...prev, messages: [...(prev.messages || []), newMessage] }));

    const res = await fetch(`/api/tasks/${taskId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, from: "human" }),
    });
    const json = await res.json();
    if (json.error) {
      toast.error(json.error);
      fetchTask();
    }
  };

  // Auto-resize title textarea
  useEffect(() => {
    if (titleRef.current && editingTitle) {
      titleRef.current.style.height = "auto";
      titleRef.current.style.height = titleRef.current.scrollHeight + "px";
      titleRef.current.focus();
    }
  }, [editingTitle, title]);

  return (
    <div className="flex-1 flex justify-center">
      <div className="max-w-2xl w-full px-6 md:px-12 py-8">
        {/* Back */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Tasks
        </Link>

        {/* Parent task indicator */}
        {parentTask && (
          <div className="mb-4">
            <Link
              href={`/dashboard/tasks/${parentTask.id}`}
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-2.5 py-1.5 rounded-md bg-muted/50 border"
            >
              <CornerDownRight className="w-3 h-3" />
              <span>Subtask of</span>
              <span className="font-medium text-foreground truncate max-w-[300px]">{parentTask.title}</span>
            </Link>
          </div>
        )}

        {/* Title */}
        <div className="mb-6">
          {editingTitle ? (
            <textarea
              ref={titleRef}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => {
                setEditingTitle(false);
                if (title.trim() && title !== initialValues.current.title) {
                  save({ title: title.trim() });
                  initialValues.current.title = title.trim();
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  (e.target as HTMLTextAreaElement).blur();
                }
                if (e.key === "Escape") {
                  setTitle(initialValues.current.title);
                  setEditingTitle(false);
                }
              }}
              className="w-full text-2xl sm:text-3xl font-semibold tracking-tight bg-transparent border-none outline-none resize-none leading-tight"
              rows={1}
            />
          ) : (
            <h1
              className="text-2xl sm:text-3xl font-semibold tracking-tight cursor-text hover:bg-accent/50 rounded-md -mx-2 px-2 py-1 transition-colors"
              onClick={() => setEditingTitle(true)}
            >
              {task.title}
            </h1>
          )}
          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Created {timeAgo(task.created_at)}
            </span>
            {task.updated_at !== task.created_at && (
              <span>Updated {timeAgo(task.updated_at)}</span>
            )}
            {task.created_by && (
              <span className="flex items-center gap-1">
                <UserIcon className="w-3 h-3" />
                {task.created_by}
              </span>
            )}
          </div>
        </div>

        {/* Properties table - Notion style */}
        <div className="border rounded-lg divide-y mb-8">
          {/* Status */}
          <div className="flex items-center gap-4 px-4 py-2.5">
            <span className="text-sm text-muted-foreground w-32 shrink-0">Status</span>
            <Select
              value={task.status}
              onValueChange={(v) => save({ status: v as TaskStatus })}
            >
              <SelectTrigger className="h-7 text-xs border-0 shadow-none hover:bg-accent/50 w-auto gap-2 px-2">
                <Badge variant="secondary" className={`${STATUS_COLORS[task.status]} text-[11px] font-medium`}>
                  {STATUS_LABELS[task.status]}
                </Badge>
              </SelectTrigger>
              <SelectContent>
                {ALL_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    <Badge variant="secondary" className={`${STATUS_COLORS[s]} text-[11px]`}>
                      {STATUS_LABELS[s]}
                    </Badge>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Intent */}
          <div className="flex items-center gap-4 px-4 py-2.5">
            <span className="text-sm text-muted-foreground w-32 shrink-0">Intent</span>
            <Select
              value={task.intent}
              onValueChange={(v) => save({ intent: v as TaskIntent })}
            >
              <SelectTrigger className="h-7 text-xs border-0 shadow-none hover:bg-accent/50 w-auto gap-2 px-2">
                <Badge variant="secondary" className={`${INTENT_COLORS[task.intent]} text-[11px] font-medium`}>
                  {INTENT_LABELS[task.intent]}
                </Badge>
              </SelectTrigger>
              <SelectContent>
                {ALL_INTENTS.map((i) => (
                  <SelectItem key={i} value={i}>
                    <Badge variant="secondary" className={`${INTENT_COLORS[i]} text-[11px]`}>
                      {INTENT_LABELS[i]}
                    </Badge>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Priority */}
          <div className="flex items-center gap-4 px-4 py-2.5">
            <span className="text-sm text-muted-foreground w-32 shrink-0">Priority</span>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((p) => (
                <button
                  key={p}
                  onClick={() => save({ priority: p })}
                  className="p-0.5 hover:scale-110 transition-transform"
                >
                  <Circle
                    className={`w-4 h-4 ${p <= task.priority ? PRIORITY_COLORS[p] : "text-gray-200 dark:text-gray-700"}`}
                    fill={p <= task.priority ? "currentColor" : "none"}
                    strokeWidth={p <= task.priority ? 0 : 1.5}
                  />
                </button>
              ))}
              <span className="text-xs text-muted-foreground ml-2">
                {task.priority === 1 ? "Low" : task.priority <= 3 ? "Medium" : task.priority === 4 ? "High" : "Urgent"}
              </span>
            </div>
          </div>

          {/* Agent */}
          <div className="flex items-center gap-4 px-4 py-2.5">
            <span className="text-sm text-muted-foreground w-32 shrink-0">Agent</span>
            <input
              value={agent}
              onChange={(e) => setAgent(e.target.value)}
              onBlur={() => {
                if (agent !== initialValues.current.agent) {
                  save({ assigned_agent: agent || null });
                  initialValues.current.agent = agent;
                }
              }}
              placeholder="Unassigned"
              className="text-sm bg-transparent border-none outline-none flex-1 placeholder:text-muted-foreground/50 hover:bg-accent/50 rounded px-2 py-0.5 -mx-2 transition-colors focus:bg-accent/50"
            />
          </div>

          {/* Project */}
          <div className="flex items-center gap-4 px-4 py-2.5">
            <span className="text-sm text-muted-foreground w-32 shrink-0">Project</span>
            <input
              value={project}
              onChange={(e) => setProject(e.target.value)}
              onBlur={() => {
                if (project !== initialValues.current.project) {
                  save({ project: project || null });
                  initialValues.current.project = project;
                }
              }}
              placeholder="No project"
              className="text-sm bg-transparent border-none outline-none flex-1 placeholder:text-muted-foreground/50 hover:bg-accent/50 rounded px-2 py-0.5 -mx-2 transition-colors focus:bg-accent/50"
            />
          </div>

          {/* Human Review */}
          <div className="flex items-center gap-4 px-4 py-2.5">
            <span className="text-sm text-muted-foreground w-32 shrink-0">Human Review</span>
            <Switch
              checked={task.requires_human_review}
              onCheckedChange={(v) => save({ requires_human_review: v })}
              className="scale-90"
            />
          </div>

          {/* Human Input Needed (auto-managed via messages) */}
          {task.human_input_needed && (
            <div className="flex items-center gap-4 px-4 py-2.5">
              <span className="text-sm text-muted-foreground w-32 shrink-0">Needs Input</span>
              <span className="inline-flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
                <AlertTriangle className="w-3 h-3" />
                Waiting for input
              </span>
            </div>
          )}

          {/* Confidence */}
          {task.confidence !== null && task.confidence !== undefined && (
            <div className="flex items-center gap-4 px-4 py-2.5">
              <span className="text-sm text-muted-foreground w-32 shrink-0">Confidence</span>
              <div className="flex items-center gap-3 flex-1">
                <Progress value={task.confidence * 100} className="h-1.5 flex-1 max-w-[200px]" />
                <span className="text-xs text-muted-foreground">{Math.round(task.confidence * 100)}%</span>
              </div>
            </div>
          )}

          {/* Next Run (recurring tasks) */}
          {task.next_run_at && (
            <div className="flex items-center gap-4 px-4 py-2.5">
              <span className="text-sm text-muted-foreground w-32 shrink-0">Next Run</span>
              <span className="text-sm">
                {new Date(task.next_run_at).toLocaleString()}
              </span>
            </div>
          )}
        </div>

        {/* Description */}
        <div className="mb-8">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Description</h3>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onBlur={() => {
              if (description !== initialValues.current.description) {
                save({ description });
                initialValues.current.description = description;
              }
            }}
            placeholder="Add a description..."
            rows={6}
            className="w-full text-sm bg-transparent border rounded-lg px-4 py-3 outline-none resize-none placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-ring focus:border-transparent transition-shadow leading-relaxed"
          />
        </div>

        {/* Blockers */}
        {(blockers || task.blockers?.length > 0) && (
          <div className="mb-8">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Blockers</h3>
            <textarea
              value={blockers}
              onChange={(e) => setBlockers(e.target.value)}
              onBlur={() => {
                if (blockers !== initialValues.current.blockers) {
                  const list = blockers.split("\n").map((b) => b.trim()).filter(Boolean);
                  save({ blockers: list });
                  initialValues.current.blockers = blockers;
                }
              }}
              placeholder="One blocker per line..."
              rows={3}
              className="w-full text-sm bg-transparent border rounded-lg px-4 py-3 outline-none resize-none placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-ring focus:border-transparent transition-shadow"
            />
          </div>
        )}

        {/* Dependencies */}
        {task.dependencies && task.dependencies.length > 0 && (
          <div className="mb-8">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">
              Dependencies
              <span className="ml-1.5 text-xs font-normal">({task.dependencies.length})</span>
            </h3>
            <div className="space-y-1">
              {task.dependencies.map((dep: TaskDependency) => (
                <Link
                  key={dep.id}
                  href={`/dashboard/tasks/${dep.depends_on_task_id}`}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg border hover:bg-accent/50 transition-colors"
                >
                  {dep.depends_on?.status === "done" ? (
                    <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                  )}
                  <span className={`flex-1 text-sm truncate ${dep.depends_on?.status === "done" ? "line-through text-muted-foreground" : ""}`}>
                    {dep.depends_on?.title || dep.depends_on_task_id}
                  </span>
                  {dep.depends_on?.status && (
                    <Badge variant="secondary" className={`text-[10px] px-1.5 py-0 shrink-0 ${STATUS_COLORS[dep.depends_on.status]}`}>
                      {STATUS_LABELS[dep.depends_on.status]}
                    </Badge>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Context JSON */}
        <div className="mb-8">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Context</h3>
          <textarea
            value={context}
            onChange={(e) => setContext(e.target.value)}
            onBlur={() => {
              if (context !== initialValues.current.context) {
                try {
                  const parsed = JSON.parse(context);
                  save({ context: parsed });
                  initialValues.current.context = context;
                } catch {
                  // invalid JSON, don't save
                }
              }
            }}
            rows={4}
            className="w-full text-xs font-mono bg-muted/50 border rounded-lg px-4 py-3 outline-none resize-none placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-ring focus:border-transparent transition-shadow"
          />
        </div>

        {/* Result */}
        {task.result && (
          <div className="mb-8">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Result</h3>
            <pre className="text-xs bg-muted/50 border rounded-lg p-4 overflow-auto max-h-60 font-mono">
              {JSON.stringify(task.result, null, 2)}
            </pre>
          </div>
        )}

        {/* Attachments */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-muted-foreground">
              Attachments
              {task.attachments && task.attachments.length > 0 && (
                <span className="ml-1.5 text-xs font-normal">({task.attachments.length})</span>
              )}
            </h3>
            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={handleUpload}>
              <Upload className="w-3 h-3 mr-1.5" /> Upload
            </Button>
          </div>
          {task.attachments && task.attachments.length > 0 ? (
            <div className="space-y-2">
              {/* Image grid */}
              {task.attachments.filter((a) => a.type.startsWith("image/")).length > 0 && (
                <div className="grid grid-cols-4 gap-2">
                  {task.attachments
                    .filter((a) => a.type.startsWith("image/"))
                    .map((a) => (
                      <div key={a.id} className="relative group/att">
                        <a href={a.url} target="_blank" rel="noopener noreferrer">
                          <img
                            src={a.url}
                            alt={a.name}
                            className="w-full h-24 object-cover rounded-lg border"
                          />
                        </a>
                        <button
                          onClick={() => handleDeleteAttachment(a.id)}
                          className="absolute top-1 right-1 bg-background/80 rounded-full p-0.5 opacity-0 group-hover/att:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                </div>
              )}
              {/* File list */}
              {task.attachments
                .filter((a) => !a.type.startsWith("image/"))
                .map((a) => (
                  <div
                    key={a.id}
                    className="flex items-center gap-3 text-sm group/att px-3 py-2 rounded-lg border hover:bg-accent/50 transition-colors"
                  >
                    <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                    <a
                      href={a.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 truncate hover:underline"
                    >
                      {a.name}
                    </a>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {(a.size / 1024).toFixed(0)}KB
                    </span>
                    <button
                      onClick={() => handleDeleteAttachment(a.id)}
                      className="opacity-0 group-hover/att:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground/50 border border-dashed rounded-lg px-4 py-6 text-center">
              No attachments
            </div>
          )}
        </div>

        {/* Messages */}
        <div className="mb-8">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Messages</h3>
          {task.messages && task.messages.length > 0 && (
            <div className="space-y-2 mb-3 max-h-80 overflow-y-auto">
              {task.messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`rounded-lg px-4 py-2.5 text-sm max-w-[80%] ${
                    msg.from_agent === "human"
                      ? "ml-auto bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium opacity-80">{msg.from_agent}</span>
                    <span className="text-[10px] opacity-50">{timeAgo(msg.created_at)}</span>
                  </div>
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                </div>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <input
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey && messageInput.trim()) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Type a message..."
              className="flex-1 text-sm bg-transparent border rounded-lg px-4 py-2.5 outline-none placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-ring focus:border-transparent transition-shadow"
            />
            <Button
              size="sm"
              variant="outline"
              className="h-auto px-3"
              onClick={handleSendMessage}
              disabled={!messageInput.trim()}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Subtasks */}
        <div className="mb-8">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">
            Subtasks
            {subtasks.length > 0 && (
              <span className="ml-1.5 text-xs font-normal">({subtasks.length})</span>
            )}
          </h3>
          {subtasks.length > 0 && (
            <div className="space-y-1 mb-3">
              {subtasks.map((sub) => (
                <Link
                  key={sub.id}
                  href={`/dashboard/tasks/${sub.id}`}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg border hover:bg-accent/50 transition-colors group"
                >
                  {sub.status === "done" ? (
                    <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                  ) : (
                    <Circle className="w-4 h-4 text-muted-foreground/40 shrink-0" strokeWidth={1.5} />
                  )}
                  <span className={`flex-1 text-sm truncate ${sub.status === "done" ? "line-through text-muted-foreground" : ""}`}>
                    {sub.title}
                  </span>
                  <Badge variant="secondary" className={`text-[10px] px-1.5 py-0 shrink-0 ${STATUS_COLORS[sub.status]}`}>
                    {STATUS_LABELS[sub.status]}
                  </Badge>
                </Link>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <input
              value={subtaskTitle}
              onChange={(e) => setSubtaskTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSpawnSubtask()}
              placeholder="Add a subtask..."
              className="flex-1 text-sm bg-transparent border rounded-lg px-4 py-2.5 outline-none placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-ring focus:border-transparent transition-shadow"
            />
            <Button
              size="sm"
              variant="outline"
              className="h-auto px-3"
              onClick={handleSpawnSubtask}
              disabled={!subtaskTitle.trim()}
            >
              <GitBranch className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Activity */}
        <div className="mb-8">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Activity</h3>
          <ActivityLog taskId={taskId} />
        </div>

        {/* Danger zone */}
        <div className="border-t pt-8 pb-12">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                <Trash2 className="w-4 h-4 mr-2" /> Delete task
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this task?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. The task and its activity log will be permanently deleted.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
}
