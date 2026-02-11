import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export async function getSession() {
  const supabase = await createClient();
  const { data: session } = await supabase.auth.getUser();
  return session;
}

export async function getDevUserOnboardingCheck() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // If not authenticated, redirect to sign in
    return redirect("/signin");
  }

  const { data: profile } = await supabase
    .from("users")
    .select("user_type, onboarding_completed")
    .eq("id", user.id)
    .single();

  // If user is a project owner, redirect to project owner onboarding
  if (profile?.user_type === "project_owner") {
    return redirect("/submit/simple");
  }

  // If user is a developer and onboarding is completed, redirect to dashboard
  if (profile?.user_type === "developer" && profile?.onboarding_completed) {
    return redirect("/dashboard");
  }
}
