import { NextRequest } from "next/server";
import { authenticateRequest, getSupabaseClient } from "@/lib/agent-auth";
import { withCors } from "@/app/api/cors-middleware";
import { success, error, authError } from "@/lib/api-response";

async function handler(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; attachmentId: string }> }
) {
  if (req.method !== "DELETE") return error("Method not allowed", 405);

  const auth = await authenticateRequest(req);
  if (auth.error || !auth.data) return authError(auth.error || "Unauthorized", auth.errorCode);
  if (!auth.data.permissions.write) return error("Write permission required", 403);

  const { id, attachmentId } = await params;
  const db = getSupabaseClient(auth.data);

  // Fetch the attachment to get storage_path
  const { data: attachment, error: fetchErr } = await db
    .from("task_attachments")
    .select("*")
    .eq("id", attachmentId)
    .eq("task_id", id)
    .eq("user_id", auth.data.userId)
    .single();

  if (fetchErr || !attachment) return error("Attachment not found", 404);

  // Delete from storage
  await db.storage.from("task-attachments").remove([attachment.storage_path]);

  // Delete the row
  const { error: delErr } = await db
    .from("task_attachments")
    .delete()
    .eq("id", attachmentId)
    .eq("user_id", auth.data.userId);

  if (delErr) return error(delErr.message, 500);

  return success({ deleted: true });
}

export const DELETE = withCors(handler);
export const OPTIONS = withCors(handler);
