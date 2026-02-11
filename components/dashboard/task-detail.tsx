"use client";

import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { ALL_STATUSES, ALL_INTENTS, STATUS_LABELS, INTENT_LABELS, INTENT_COLORS, PRIORITY_COLORS } from "@/lib/constants";
import { ActivityLog } from "./activity-log";
import { HUMAN_INPUT_BADGE_COLOR } from "@/lib/constants";
import { Circle, Trash2, GitBranch, Upload, X, Paperclip, Image as ImageIcon, FileText, Send } from "lucide-react";
import type { Task, TaskStatus, TaskIntent, TaskAttachment, TaskMessage } from "@/types/tasks";

interface TaskDetailProps {
  task: Task | null;
  open: boolean;
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<Task>) => Promise<any>;
  onDelete: (id: string) => Promise<boolean>;
  onSpawnSubtask: (parentId: string, title: string) => Promise<any>;
  onUploadAttachment?: (taskId: string, file: File) => Promise<any>;
  onSendMessage?: (taskId: string, content: string) => Promise<any>;
}

export function TaskDetail({ task, open, onClose, onUpdate, onDelete, onSpawnSubtask, onUploadAttachment, onSendMessage }: TaskDetailProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<TaskStatus>("todo");
  const [intent, setIntent] = useState<TaskIntent>("build");
  const [priority, setPriority] = useState(3);
  const [agent, setAgent] = useState("");
  const [context, setContext] = useState("");
  const [humanReview, setHumanReview] = useState(true);
  const [blockers, setBlockers] = useState("");
  const [project, setProject] = useState("");
  const [projectContext, setProjectContext] = useState("");
  const [humanInputNeeded, setHumanInputNeeded] = useState(false);
  const [messageInput, setMessageInput] = useState("");
  const [subtaskTitle, setSubtaskTitle] = useState("");
  const [editingTitle, setEditingTitle] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || "");
      setStatus(task.status);
      setIntent(task.intent);
      setPriority(task.priority);
      setAgent(task.assigned_agent || "");
      setContext(task.context ? JSON.stringify(task.context, null, 2) : "{}");
      setHumanReview(task.requires_human_review);
      setBlockers(task.blockers?.join("\n") || "");
      setProject(task.project || "");
      setProjectContext(task.project_context || "");
      setHumanInputNeeded(task.human_input_needed ?? false);
      setMessageInput("");
    }
  }, [task]);

  if (!task) return null;

  const save = async (updates: Partial<Task>) => {
    setSaving(true);
    await onUpdate(task.id, updates);
    setSaving(false);
  };

  const handleDelete = async () => {
    await onDelete(task.id);
    onClose();
  };

  const handleSpawnSubtask = async () => {
    if (!subtaskTitle.trim()) return;
    await onSpawnSubtask(task.id, subtaskTitle.trim());
    setSubtaskTitle("");
  };

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="pb-4">
          {editingTitle ? (
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => {
                setEditingTitle(false);
                if (title !== task.title) save({ title });
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setEditingTitle(false);
                  if (title !== task.title) save({ title });
                }
              }}
              autoFocus
              className="text-lg font-semibold border-0 shadow-none focus-visible:ring-0 px-0"
            />
          ) : (
            <SheetTitle
              className="text-lg cursor-pointer hover:text-primary transition-colors text-left"
              onClick={() => setEditingTitle(true)}
            >
              {title}
            </SheetTitle>
          )}
        </SheetHeader>

        <div className="space-y-5 pb-8">
          {/* Status & Intent */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Status</Label>
              <Select
                value={status}
                onValueChange={(v) => {
                  setStatus(v as TaskStatus);
                  save({ status: v as TaskStatus });
                }}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ALL_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Intent</Label>
              <Select
                value={intent}
                onValueChange={(v) => {
                  setIntent(v as TaskIntent);
                  save({ intent: v as TaskIntent });
                }}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ALL_INTENTS.map((i) => (
                    <SelectItem key={i} value={i}>{INTENT_LABELS[i]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Priority */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Priority</Label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((p) => (
                <button
                  key={p}
                  onClick={() => {
                    setPriority(p);
                    save({ priority: p });
                  }}
                  className="p-1 hover:scale-110 transition-transform"
                >
                  <Circle
                    className={`w-4 h-4 ${p <= priority ? PRIORITY_COLORS[p] : "text-gray-200 dark:text-gray-700"}`}
                    fill={p <= priority ? "currentColor" : "none"}
                    strokeWidth={p <= priority ? 0 : 1.5}
                  />
                </button>
              ))}
              <span className="text-xs text-muted-foreground ml-2 self-center">
                {priority === 1 ? "Low" : priority <= 3 ? "Medium" : priority === 4 ? "High" : "Urgent"}
              </span>
            </div>
          </div>

          {/* Agent */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Assigned Agent</Label>
            <Input
              value={agent}
              onChange={(e) => setAgent(e.target.value)}
              onBlur={() => save({ assigned_agent: agent || null })}
              placeholder="Agent name..."
              className="h-8 text-sm"
            />
          </div>

          {/* Project */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Project</Label>
              <Input
                value={project}
                onChange={(e) => setProject(e.target.value)}
                onBlur={() => save({ project: project || null })}
                placeholder="Project name..."
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Project Context</Label>
              <Input
                value={projectContext}
                onChange={(e) => setProjectContext(e.target.value)}
                onBlur={() => save({ project_context: projectContext || null })}
                placeholder="Context..."
                className="h-8 text-sm"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={() => {
                if (description !== task.description) save({ description });
              }}
              placeholder="Task description (markdown)..."
              rows={4}
              className="text-sm resize-none"
            />
          </div>

          {/* Context */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Context (JSON)</Label>
            <Textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              onBlur={() => {
                try {
                  const parsed = JSON.parse(context);
                  save({ context: parsed });
                } catch {}
              }}
              rows={3}
              className="text-xs font-mono resize-none"
            />
          </div>

          {/* Human review toggle */}
          <div className="flex items-center justify-between">
            <Label className="text-xs text-muted-foreground">Requires Human Review</Label>
            <Switch
              checked={humanReview}
              onCheckedChange={(v) => {
                setHumanReview(v);
                save({ requires_human_review: v });
              }}
            />
          </div>

          {/* Blockers */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Blockers (one per line)</Label>
            <Textarea
              value={blockers}
              onChange={(e) => setBlockers(e.target.value)}
              onBlur={() => {
                const list = blockers.split("\n").map((b) => b.trim()).filter(Boolean);
                save({ blockers: list });
              }}
              rows={2}
              className="text-sm resize-none"
              placeholder="Enter blockers..."
            />
          </div>

          {/* Attachments */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Attachments</Label>
            {task.attachments?.length > 0 && (
              <div className="space-y-2">
                {/* Image thumbnails */}
                {task.attachments.filter((a: TaskAttachment) => a.type.startsWith("image/")).length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {task.attachments.filter((a: TaskAttachment) => a.type.startsWith("image/")).map((a: TaskAttachment, i: number) => (
                      <div key={i} className="relative group/att">
                        <a href={a.url} target="_blank" rel="noopener noreferrer">
                          <img src={a.url} alt={a.name} className="w-full h-20 object-cover rounded-md border" />
                        </a>
                        <button
                          onClick={() => {
                            const updated = task.attachments.filter((_: TaskAttachment, idx: number) => idx !== task.attachments.indexOf(a));
                            save({ attachments: updated });
                          }}
                          className="absolute top-1 right-1 bg-background/80 rounded-full p-0.5 opacity-0 group-hover/att:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {/* Non-image files */}
                {task.attachments.filter((a: TaskAttachment) => !a.type.startsWith("image/")).map((a: TaskAttachment, i: number) => (
                  <div key={i} className="flex items-center gap-2 text-xs group/att">
                    <FileText className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    <a href={a.url} target="_blank" rel="noopener noreferrer" className="flex-1 truncate hover:underline">
                      {a.name}
                    </a>
                    <span className="text-muted-foreground shrink-0">{(a.size / 1024).toFixed(0)}KB</span>
                    <button
                      onClick={() => {
                        const idx = task.attachments.findIndex((x: TaskAttachment) => x.storage_path === a.storage_path);
                        const updated = task.attachments.filter((_: TaskAttachment, j: number) => j !== idx);
                        save({ attachments: updated });
                      }}
                      className="opacity-0 group-hover/att:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            {onUploadAttachment && (
              <Button
                size="sm"
                variant="outline"
                className="h-8 text-xs"
                onClick={() => {
                  const input = document.createElement("input");
                  input.type = "file";
                  input.onchange = async (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0];
                    if (file) await onUploadAttachment(task.id, file);
                  };
                  input.click();
                }}
              >
                <Upload className="w-3 h-3 mr-1" /> Upload File
              </Button>
            )}
          </div>

          {/* Human Input Needed */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground">Human Input Needed</Label>
              <Switch
                checked={humanInputNeeded}
                onCheckedChange={(v) => {
                  setHumanInputNeeded(v);
                  save({ human_input_needed: v });
                }}
              />
            </div>
            {humanInputNeeded && (
              <div className="rounded-md bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-2 text-xs text-amber-700 dark:text-amber-400">
                This task is waiting for human input.
              </div>
            )}
          </div>

          {/* Messages / Feedback Thread */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Messages</Label>
            {task.messages?.length > 0 && (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {task.messages.map((msg: TaskMessage, i: number) => (
                  <div
                    key={i}
                    className={`rounded-lg px-3 py-2 text-xs max-w-[85%] ${
                      msg.from === "human"
                        ? "ml-auto bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    <div className="font-medium mb-0.5">{msg.from}</div>
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                  </div>
                ))}
              </div>
            )}
            {onSendMessage && (
              <div className="flex gap-2">
                <Input
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey && messageInput.trim()) {
                      e.preventDefault();
                      onSendMessage(task.id, messageInput.trim());
                      setMessageInput("");
                    }
                  }}
                  placeholder="Type a message..."
                  className="h-8 text-sm flex-1"
                />
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8"
                  onClick={() => {
                    if (messageInput.trim() && onSendMessage) {
                      onSendMessage(task.id, messageInput.trim());
                      setMessageInput("");
                    }
                  }}
                >
                  <Send className="w-3 h-3" />
                </Button>
              </div>
            )}
          </div>

          {/* Result */}
          {task.result && (
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Result</Label>
              <pre className="text-xs bg-muted p-3 rounded-md overflow-auto max-h-40 font-mono">
                {JSON.stringify(task.result, null, 2)}
              </pre>
            </div>
          )}

          {/* Confidence */}
          {task.confidence !== null && task.confidence !== undefined && (
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">
                Confidence: {Math.round(task.confidence * 100)}%
              </Label>
              <Progress value={task.confidence * 100} className="h-2" />
            </div>
          )}

          <Separator />

          {/* Spawn subtask */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Spawn Subtask</Label>
            <div className="flex gap-2">
              <Input
                value={subtaskTitle}
                onChange={(e) => setSubtaskTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSpawnSubtask()}
                placeholder="Subtask title..."
                className="h-8 text-sm flex-1"
              />
              <Button size="sm" variant="outline" onClick={handleSpawnSubtask} className="h-8">
                <GitBranch className="w-3 h-3 mr-1" /> Add
              </Button>
            </div>
          </div>

          <Separator />

          {/* Activity Log */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Activity</Label>
            <ActivityLog taskId={task.id} />
          </div>

          <Separator />

          {/* Delete */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm" className="w-full">
                <Trash2 className="w-3 h-3 mr-2" /> Delete Task
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
      </SheetContent>
    </Sheet>
  );
}
