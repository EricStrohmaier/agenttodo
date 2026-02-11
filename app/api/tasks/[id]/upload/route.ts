import { NextRequest } from "next/server";
import { authenticateRequest, getSupabaseClient } from "@/lib/agent-auth";
import { withCors } from "@/app/api/cors-middleware";
import { success, error } from "@/lib/api-response";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

async function handler(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (req.method !== "POST") return error("Method not allowed", 405);

  const auth = await authenticateRequest(req);
  if (auth.error || !auth.data) return error(auth.error || "Unauthorized", 401);
  if (!auth.data.permissions.write) return error("Write permission required", 403);

  const { id } = await params;
  const db = getSupabaseClient(auth.data);

  // Verify task exists and belongs to user
  const { data: task, error: taskErr } = await db.from("tasks").select("id, attachments").eq("id", id).eq("user_id", auth.data.userId).single();
  if (taskErr || !task) return error("Task not found", 404);

  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) return error("file is required");
  if (file.size > MAX_FILE_SIZE) return error("File too large. Maximum size is 10MB");

  // Build storage path
  const ext = file.name.split(".").pop() || "bin";
  const timestamp = Date.now();
  const random = Math.random().toString(36).slice(2, 8);
  const storagePath = `${auth.data.userId}/${id}/${timestamp}-${random}.${ext}`;

  // Upload to Supabase Storage
  const buffer = Buffer.from(await file.arrayBuffer());
  const { error: uploadErr } = await db.storage
    .from("task-attachments")
    .upload(storagePath, buffer, { contentType: file.type, upsert: false });

  if (uploadErr) return error(uploadErr.message, 500);

  // Get signed URL (bucket is private, so public URLs won't work)
  const { data: urlData, error: signErr } = await db.storage
    .from("task-attachments")
    .createSignedUrl(storagePath, 60 * 60 * 24 * 365); // 1 year

  if (signErr || !urlData?.signedUrl) return error("Failed to generate signed URL", 500);

  const attachment = {
    url: urlData.signedUrl,
    name: file.name,
    type: file.type,
    size: file.size,
    storage_path: storagePath,
  };

  // Append to task's attachments array
  const existingAttachments = task.attachments || [];
  const { data: updated, error: updateErr } = await db
    .from("tasks")
    .update({ attachments: [...existingAttachments, attachment] })
    .eq("id", id)
    .eq("user_id", auth.data.userId)
    .select()
    .single();

  if (updateErr) return error(updateErr.message, 500);

  return success({ attachment, task: updated }, 201);
}

export const POST = withCors(handler);
export const OPTIONS = withCors(handler);
