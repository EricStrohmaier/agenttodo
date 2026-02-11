"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CheckSquare, Bot, BookOpen, Menu, X, LogOut, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "./theme-toggle";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";

const navItems = [
  { href: "/dashboard", label: "Tasks", icon: CheckSquare },
  { href: "/dashboard/agents", label: "Agents", icon: Bot },
  { href: "/docs", label: "Docs", icon: BookOpen },
  { href: "/pricing", label: "Pricing", icon: CreditCard },
];

function NavContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [openTaskCount, setOpenTaskCount] = useState<number | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  useEffect(() => {
    async function fetchCount() {
      try {
        const res = await fetch("/api/tasks?limit=100");
        const json = await res.json();
        if (json.data) {
          setOpenTaskCount(json.data.filter((t: any) => t.status !== "done").length);
        }
      } catch {}
    }
    fetchCount();
  }, [pathname]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/signin");
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 pb-2">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold text-lg" onClick={onNavigate}>
          <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
            <span className="text-primary-foreground text-sm font-bold">A</span>
          </div>
          <span>AgentBoard</span>
        </Link>
      </div>

      <Separator className="mx-4 w-auto" />

      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                isActive
                  ? "bg-accent text-accent-foreground font-medium"
                  : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
              }`}
            >
              <item.icon className="w-4 h-4" />
              <span className="flex-1">{item.label}</span>
              {item.label === "Tasks" && openTaskCount !== null && openTaskCount > 0 && (
                <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-medium">
                  {openTaskCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <Separator className="mx-4 w-auto" />

      <div className="p-3 space-y-1">
        <ThemeToggle />
        {user && (
          <div className="px-3 py-2">
            <div className="flex items-center gap-2">
              <Avatar className="w-7 h-7">
                <AvatarFallback className="text-xs bg-primary/10 text-primary font-medium">
                  {(user.user_metadata?.full_name || user.email || "U").charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {user.user_metadata?.full_name || user.email?.split("@")[0] || "User"}
                </p>
                {user.email && (
                  <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
                )}
              </div>
            </div>
          </div>
        )}
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-muted-foreground hover:bg-accent/50 hover:text-foreground transition-colors w-full"
        >
          <LogOut className="w-4 h-4" />
          <span className="flex-1 text-left">Sign out</span>
        </button>
      </div>
    </div>
  );
}

export function Sidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-60 border-r bg-sidebar flex-col shrink-0 h-screen sticky top-0">
        <NavContent />
      </aside>

      {/* Mobile hamburger */}
      <div className="md:hidden fixed top-3 left-3 z-50">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="h-9 w-9">
              <Menu className="w-4 h-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-56 p-0">
            <NavContent onNavigate={() => setOpen(false)} />
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
