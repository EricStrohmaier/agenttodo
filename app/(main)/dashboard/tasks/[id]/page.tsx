import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { supabaseAdmin } from "@/utils/supabase/admin";
import { TaskDetailClient } from "./task-detail-client";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function TaskDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/dashboard");
  }

  const db = supabaseAdmin();

  const [taskRes, subtasksRes, messagesRes, attachmentsRes, dependenciesRes] = await Promise.all([
    db.from("tasks").select("*").eq("id", id).eq("user_id", user.id).single(),
    db.from("tasks").select("*").eq("parent_task_id", id).eq("user_id", user.id).order("priority", { ascending: false }),
    db.from("task_messages").select("*").eq("task_id", id).eq("user_id", user.id).order("created_at", { ascending: true }),
    db.from("task_attachments").select("*").eq("task_id", id).eq("user_id", user.id).order("created_at", { ascending: true }),
    db.from("task_dependencies").select("*, depends_on:depends_on_task_id(id, title, status)").eq("task_id", id).eq("user_id", user.id),
  ]);

  if (taskRes.error || !taskRes.data) {
    redirect("/dashboard");
  }

  const task = {
    ...taskRes.data,
    messages: messagesRes.data || [],
    attachments: attachmentsRes.data || [],
    dependencies: dependenciesRes.data || [],
  };

  const subtasks = subtasksRes.data || [];

  // Fetch parent task title if this is a subtask
  let parentTask: { id: string; title: string } | null = null;
  if (task.parent_task_id) {
    const { data: parent } = await db
      .from("tasks")
      .select("id, title")
      .eq("id", task.parent_task_id)
      .eq("user_id", user.id)
      .single();
    if (parent) {
      parentTask = { id: parent.id, title: parent.title };
    }
  }

  return (
    <TaskDetailClient
      initialTask={task as any}
      initialSubtasks={subtasks as any}
      initialParentTask={parentTask}
    />
  );
}
