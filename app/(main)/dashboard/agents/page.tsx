import { createClient } from "@/utils/supabase/server";
import { AgentsPage } from "@/components/dashboard/agents-page";
import Link from "next/link";

export default async function AgentsRoute() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center px-6">
        <h2 className="text-lg font-semibold mb-2">Agents & API Keys</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Sign in to manage API keys and connect your agents.
        </p>
        <Link
          href="/signin"
          className="inline-flex items-center gap-2 rounded-md bg-primary text-primary-foreground px-5 py-2.5 text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="px-6 md:px-12 lg:px-20 py-6 pt-14 md:pt-8 max-w-3xl mx-auto w-full">
      <AgentsPage />
    </div>
  );
}
