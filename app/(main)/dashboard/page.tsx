import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function Dashboard() {
  const supabase = await createClient();
  const { data: user } = await supabase.auth.getUser();

  if (!user || !user.user) {
    redirect("/signin");
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">
          AgentBoard Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage your agent tasks and workflows.
        </p>
      </div>

      <div className="rounded-lg border p-8 text-center text-muted-foreground">
        <p>Dashboard coming soon. Start building your agent workflows here.</p>
      </div>
    </div>
  );
}
