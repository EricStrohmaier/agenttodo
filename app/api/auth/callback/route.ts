import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next");
  const userType = searchParams.get("user_type") ?? "project_owner";
  console.log("next", next, origin, "code:", code, "userType:", userType);

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    console.log(error && "Exchange code for session error:" + error.message);

    if (!error && data.user) {
      // Create user in  Loops

      let redirectPath;

      // If a specific redirect was requested, use it
      if (next && next !== "/") {
        redirectPath = next;
      } else {
        // Default redirect after auth
        redirectPath = "/dashboard";
      }

      if (redirectPath.startsWith("https://")) {
        return NextResponse.redirect(redirectPath);
      } else {
        return NextResponse.redirect(`${origin}${redirectPath}`);
      }
    }
  }

  const errorPath = "/auth-code-error";
  return NextResponse.redirect(`${origin}${errorPath}`);
}
