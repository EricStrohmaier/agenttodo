import { createClient } from "@/utils/supabase/server";
import { supabaseAdmin } from "@/utils/supabase/admin";
import { DashboardClient } from "./dashboard-client";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let initialTasks: any[] = [];
  let initialProjects: string[] = [];

  if (user) {
    const db = supabaseAdmin();

    const [tasksRes, projectsRes] = await Promise.all([
      db
        .from("tasks")
        .select("id,title,status,intent,priority,project,assigned_agent,human_input_needed,parent_task_id,created_by,updated_at,created_at")
        .eq("user_id", user.id)
        .order("priority", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(100),
      db
        .from("projects")
        .select("name")
        .eq("user_id", user.id)
        .order("name", { ascending: true }),
    ]);

    initialTasks = tasksRes.data || [];
    initialProjects = (projectsRes.data || []).map((p: any) => p.name);
  }

  return (
    <DashboardClient
      user={user ? { id: user.id, email: user.email } : null}
      initialTasks={initialTasks}
      initialProjects={initialProjects}
    />
  );
}
