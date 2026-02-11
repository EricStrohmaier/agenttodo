"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ListTodo, Cpu, FileText, Sparkles, Menu, LogOut, ExternalLink, PanelLeftClose, PanelLeftOpen, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ThemeToggle } from "./theme-toggle";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import type { User } from "@supabase/supabase-js";

const stripeEnabled = !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

const navItems = [
  { href: "/dashboard", label: "Tasks", icon: ListTodo },
  { href: "/dashboard/agents", label: "Agents", icon: Cpu },
  ...(stripeEnabled
    ? [{ href: "/pricing", label: "Pricing", icon: Sparkles }]
    : []),
  { href: "/docs", label: "Docs", icon: FileText, external: true },
];

function NavContent({ user, onNavigate, collapsed = false, onToggle }: { user: User | null; onNavigate?: () => void; collapsed?: boolean; onToggle?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [openTaskCount, setOpenTaskCount] = useState<number | null>(null);

  useEffect(() => {
    if (!user) return;
    async function fetchCount() {
      try {
        // Use limit=1 to minimize payload; total count comes from the API response
        const res = await fetch("/api/tasks?limit=1");
        const json = await res.json();
        if (json.total !== undefined) {
          // Total excludes done tasks: fetch done count separately
          const doneRes = await fetch("/api/tasks?status=done&limit=1");
          const doneJson = await doneRes.json();
          const doneCount = doneJson.total ?? 0;
          setOpenTaskCount(json.total - doneCount);
        }
      } catch {}
    }
    fetchCount();
  }, [pathname, user]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/signin");
  };

  return (
    <TooltipProvider delayDuration={0}>
      <div className="flex flex-col h-full">
        {/* Logo + Toggle */}
        <div className={`p-4 pb-2 flex items-center ${collapsed ? "justify-center" : "justify-between"}`}>
          {collapsed && onToggle ? (
            <button onClick={onToggle} className="flex items-center justify-center w-7 h-7 relative group/logo">
              <img src="/favicon-light.svg" alt="AgentTodo" className="w-7 h-7 shrink-0 dark:hidden group-hover/logo:opacity-0 transition-opacity" />
              <img src="/favicon-dark.svg" alt="AgentTodo" className="w-7 h-7 shrink-0 hidden dark:block group-hover/logo:opacity-0 transition-opacity" />
              <PanelLeftOpen className="w-5 h-5 text-muted-foreground absolute inset-0 m-auto opacity-0 group-hover/logo:opacity-100 transition-opacity" />
            </button>
          ) : (
            <>
              <Link href="/dashboard" className="flex items-center gap-2 font-semibold text-base" onClick={onNavigate}>
                <img src="/favicon-light.svg" alt="AgentTodo" className="w-7 h-7 shrink-0 dark:hidden" />
                <img src="/favicon-dark.svg" alt="AgentTodo" className="w-7 h-7 shrink-0 hidden dark:block" />
                <span>AgentTodo</span>
              </Link>
              {onToggle && (
                <button onClick={onToggle} className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors">
                  <PanelLeftClose className="w-4 h-4" />
                </button>
              )}
            </>
          )}
        </div>

        {/* Nav */}
        <nav className={`flex-1 ${collapsed ? "p-1.5" : "p-3"} space-y-1`}>
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            const linkContent = (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                {...((item as any).external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                className={`flex items-center gap-3 rounded-md text-sm transition-colors ${
                  collapsed ? "px-0 py-2 justify-center" : "px-3 py-2"
                } ${
                  isActive
                    ? "bg-accent text-accent-foreground font-medium"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                }`}
              >
                <item.icon className="w-4 h-4 shrink-0" />
                {!collapsed && (
                  <>
                    <span className="flex-1">{item.label}</span>
                    {(item as any).external && <ExternalLink className="w-3 h-3 text-muted-foreground" />}
                    {item.label === "Tasks" && openTaskCount !== null && openTaskCount > 0 && (
                      <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-medium">
                        {openTaskCount}
                      </span>
                    )}
                  </>
                )}
              </Link>
            );

            if (collapsed) {
              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                  <TooltipContent side="right" sideOffset={8}>
                    <p>{item.label}</p>
                  </TooltipContent>
                </Tooltip>
              );
            }
            return <div key={item.href}>{linkContent}</div>;
          })}
        </nav>

        <Separator className={collapsed ? "mx-1.5 w-auto" : "mx-4 w-auto"} />

        {/* Bottom section */}
        <div className={`${collapsed ? "p-1.5" : "p-3"} space-y-2`}>
          <ThemeToggle collapsed={collapsed} />
          {user ? (
            collapsed ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button onClick={handleSignOut} className="flex justify-center w-full py-2">
                    <Avatar className="h-7 w-7">
                      <AvatarFallback className="text-xs bg-primary/10 text-primary font-medium">
                        {(user.user_metadata?.full_name || user.email || "U").charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={8}>
                  <p>{user.user_metadata?.full_name || user.email?.split("@")[0]} — Sign out</p>
                </TooltipContent>
              </Tooltip>
            ) : (
              <div className="flex items-center gap-2 px-2 py-1">
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="text-xs bg-primary/10 text-primary font-medium">
                    {(user.user_metadata?.full_name || user.email || "U").charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">
                    {user.user_metadata?.full_name || user.email?.split("@")[0]}
                  </p>
                  {user.email && (
                    <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
                  )}
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={handleSignOut}>
                  <LogOut className="w-3.5 h-3.5" />
                </Button>
              </div>
            )
          ) : collapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Link href="/signin" onClick={onNavigate} className="flex justify-center w-full py-2 text-muted-foreground hover:text-foreground transition-colors">
                  <LogIn className="w-4 h-4" />
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={8}>
                <p>Sign In</p>
              </TooltipContent>
            </Tooltip>
          ) : (
            <Button asChild className="w-full" size="sm">
              <Link href="/signin" onClick={onNavigate}>Sign In</Link>
            </Button>
          )}

          {/* Privacy & Terms */}
          {!collapsed && (
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground/60 pb-1">
              <Link href="/privacy" className="hover:text-muted-foreground transition-colors">Privacy</Link>
              <span>·</span>
              <Link href="/terms" className="hover:text-muted-foreground transition-colors">Terms</Link>
            </div>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}

export function Sidebar({ user }: { user: User | null }) {
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("sidebar-collapsed");
    if (stored === "true") setCollapsed(true);
  }, []);

  const toggleCollapsed = () => {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem("sidebar-collapsed", String(next));
  };

  return (
    <>
      {/* Desktop sidebar */}
      <aside className={`hidden md:flex ${collapsed ? "w-14" : "w-60"} border-r bg-sidebar flex-col shrink-0 h-screen sticky top-0 transition-all duration-200 relative`}>
        <NavContent user={user} collapsed={collapsed} onToggle={toggleCollapsed} />
      </aside>

      {/* Mobile hamburger */}
      <div className="md:hidden fixed top-3 left-3 z-50">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="h-9 w-9">
              <Menu className="w-4 h-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-60 p-0 pt-4">
            <NavContent user={user} onNavigate={() => setOpen(false)} />
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
