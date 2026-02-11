"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CheckSquare, Bot, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "./theme-toggle";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

const navItems = [
  { href: "/dashboard", label: "Tasks", icon: CheckSquare },
  { href: "/dashboard/agents", label: "Agents", icon: Bot },
];

function NavContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const [openTaskCount, setOpenTaskCount] = useState<number | null>(null);

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

  return (
    <div className="flex flex-col h-full">
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

      <div className="p-3">
        <ThemeToggle />
      </div>
    </div>
  );
}

export function Sidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-52 border-r bg-sidebar flex-col shrink-0 h-[calc(100vh-3.5rem)] sticky top-14">
        <NavContent />
      </aside>

      {/* Mobile hamburger */}
      <div className="md:hidden fixed top-16 left-3 z-50">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="h-9 w-9">
              <Menu className="w-4 h-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-52 p-0 pt-4">
            <NavContent onNavigate={() => setOpen(false)} />
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
