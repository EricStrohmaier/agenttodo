"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createClient } from "@/utils/supabase/client";
import type { User } from "@supabase/supabase-js";

export function AppHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/signin");
  };

  const isActive = (href: string) =>
    pathname === href || (href !== "/" && pathname.startsWith(href));

  const linkClass = (href: string) =>
    `text-sm transition-colors ${
      isActive(href)
        ? "text-foreground font-medium"
        : "text-muted-foreground hover:text-foreground"
    }`;

  const navLinks = (
    <>
      <Link href="/docs" className={linkClass("/docs")}>
        Docs
      </Link>
      <Link href="/pricing" className={linkClass("/pricing")}>
        Pricing
      </Link>
      {user && (
        <Link href="/dashboard" className={linkClass("/dashboard")}>
          Dashboard
        </Link>
      )}
    </>
  );

  return (
    <header className="h-14 border-b bg-background flex items-center px-4 shrink-0 sticky top-0 z-50">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 font-semibold text-base mr-8">
        <img src="/favicon.svg" alt="AgentTodo" className="w-7 h-7" />
        <span>AgentTodo</span>
      </Link>

      {/* Desktop nav */}
      <nav className="hidden md:flex items-center gap-6 flex-1">
        {navLinks}
      </nav>

      {/* Desktop right */}
      <div className="hidden md:flex items-center gap-3">
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs bg-primary/10 text-primary font-medium">
                    {(user.user_metadata?.full_name || user.email || "U")
                      .charAt(0)
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium">
                  {user.user_metadata?.full_name || user.email?.split("@")[0]}
                </p>
                {user.email && (
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                )}
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="w-4 h-4 mr-2" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button variant="outline" size="sm" asChild>
            <Link href="/signin">Sign In</Link>
          </Button>
        )}
      </div>

      {/* Mobile hamburger */}
      <div className="md:hidden ml-auto">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <Menu className="w-4 h-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-64">
            <nav className="flex flex-col gap-4 mt-8">
              <Link href="/docs" className={linkClass("/docs")} onClick={() => setMobileOpen(false)}>
                Docs
              </Link>
              <Link href="/pricing" className={linkClass("/pricing")} onClick={() => setMobileOpen(false)}>
                Pricing
              </Link>
              {user && (
                <Link href="/dashboard" className={linkClass("/dashboard")} onClick={() => setMobileOpen(false)}>
                  Dashboard
                </Link>
              )}
              <hr className="my-2" />
              {user ? (
                <>
                  <div className="text-sm">
                    <p className="font-medium">{user.user_metadata?.full_name || user.email?.split("@")[0]}</p>
                    {user.email && <p className="text-xs text-muted-foreground">{user.email}</p>}
                  </div>
                  <button
                    onClick={() => { setMobileOpen(false); handleSignOut(); }}
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign out
                  </button>
                </>
              ) : (
                <Link href="/signin" className="text-sm font-medium" onClick={() => setMobileOpen(false)}>
                  Sign In
                </Link>
              )}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
