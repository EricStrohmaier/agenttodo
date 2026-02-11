import { NextRequest } from "next/server";
import { authenticateRequest, getSupabaseClient } from "@/lib/agent-auth";
import { withCors } from "@/app/api/cors-middleware";
import { success, error } from "@/lib/api-response";
import { computeNextRun } from "@/lib/recurrence";

async function handler(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await authenticateRequest(req);
  if (auth.error || !auth.data) return error(auth.error || "Unauthorized", 401);
  if (!auth.data.permissions.write) return error("Write permission required", 403);

  const { id } = await params;
  const db = getSupabaseClient(auth.data);
  const body = await req.json().catch(() => ({}));

  const { data: task, error: fetchErr } = await db.from("tasks").select("requires_human_review, recurrence").eq("id", id).eq("user_id", auth.data.userId).single();
  if (fetchErr) return error("Task not found", 404);

  const update: Record<string, any> = {
    status: task.requires_human_review ? "review" : "done",
    completed_at: new Date().toISOString(),
  };

  if (body.result !== undefined) update.result = body.result;
  if (body.confidence !== undefined) update.confidence = body.confidence;
  if (body.artifacts !== undefined) update.artifacts = body.artifacts;

  // Recompute next_run_at for recurring tasks
  if (task.recurrence) {
    update.next_run_at = computeNextRun(task.recurrence)?.toISOString() || null;
  }

  const { data: updated, error: dbErr } = await db.from("tasks").update(update).eq("id", id).eq("user_id", auth.data.userId).select().single();
  if (dbErr) return error(dbErr.message, 500);

  // Auto-resolve downstream dependencies:
  // Remove dependency rows where this task was the blocker
  const { data: resolvedDeps } = await db
    .from("task_dependencies")
    .delete()
    .eq("depends_on_task_id", id)
    .eq("user_id", auth.data.userId)
    .select("task_id");

  // For each unblocked task, check if it has any remaining dependencies
  // If none remain and the task is "blocked", move it to "todo"
  if (resolvedDeps && resolvedDeps.length > 0) {
    const unblockedTaskIds = [...new Set(resolvedDeps.map((d: any) => d.task_id))];
    for (const taskId of unblockedTaskIds) {
      const { data: remaining } = await db
        .from("task_dependencies")
        .select("id")
        .eq("task_id", taskId)
        .eq("user_id", auth.data.userId)
        .limit(1);

      if (!remaining || remaining.length === 0) {
        // Check if the task is currently blocked
        const { data: blockedTask } = await db
          .from("tasks")
          .select("status, blockers")
          .eq("id", taskId)
          .eq("user_id", auth.data.userId)
          .single();

        if (blockedTask?.status === "blocked") {
          const hasTextBlockers = blockedTask.blockers && blockedTask.blockers.length > 0;
          if (!hasTextBlockers) {
            await db
              .from("tasks")
              .update({ status: "todo" })
              .eq("id", taskId)
              .eq("user_id", auth.data.userId);
          }
        }
      }
    }
  }

  return success(updated);
}

export const POST = withCors(handler);
export const OPTIONS = withCors(handler);
