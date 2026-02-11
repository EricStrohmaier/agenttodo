import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { updateSession } from "./utils/supabase/middleware";
import { locales, type Locale } from "@/i18n/routing";

export default async function middleware(req: NextRequest) {
  // Check for ?lang= search param to set locale
  const langParam = req.nextUrl.searchParams.get("lang");

  if (langParam && locales.includes(langParam as Locale)) {
    // Remove lang param from URL and redirect
    const url = req.nextUrl.clone();
    url.searchParams.delete("lang");

    const response = NextResponse.redirect(url);

    // Set the locale cookie
    response.cookies.set("NEXT_LOCALE", langParam, {
      path: "/",
      maxAge: 31536000, // 1 year
      sameSite: "lax",
    });

    return response;
  }

  // Run Supabase session middleware
  return await updateSession(req);
}

export const config = {
  matcher: [
    "/((?!api/|_next/|_static/|_vercel|ingest/|[\\w-]+\\.\\w+).*)",
  ],
};
