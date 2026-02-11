"use client";

import Link from "next/link";
import { User } from "@supabase/supabase-js";

export default function Header({
  user,
}: {
  user: User | null;
  profile?: Record<string, unknown> | null;
}) {
  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <nav className="flex items-center justify-between">
          <Link href="/" className="text-lg font-bold">
            AgentBoard
          </Link>
          <div className="flex items-center gap-4">
            {user ? (
              <Link
                href="/dashboard"
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                Dashboard
              </Link>
            ) : (
              <Link
                href="/signin"
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                Sign In
              </Link>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
