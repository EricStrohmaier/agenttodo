import type { NextRequest } from "next/server";
import { updateSession } from "./utils/supabase/middleware";

export default async function middleware(req: NextRequest) {
  return await updateSession(req);
}

export const config = {
  matcher: [
    "/((?!api/|_next/|_static/|_vercel|ingest/|[\\w-]+\\.\\w+).*)",
  ],
};
