"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ExternalLink, Menu, X } from "lucide-react";
import { ThemeToggle } from "@/components/dashboard/theme-toggle";

const sections = [
  {
    title: "Getting Started",
    items: [
      { href: "/docs", label: "Introduction" },
      { href: "/docs/quickstart", label: "Quickstart" },
      { href: "/docs/self-hosting", label: "Self-Hosting" },
    ],
  },
  {
    title: "Reference",
    items: [
      { href: "/docs/api", label: "API Reference" },
      { href: "/docs/concepts", label: "Core Concepts" },
    ],
  },
  {
    title: "Guides",
    items: [
      { href: "/docs/agents", label: "Agent Integration" },
    ],
  },
  {
    title: "Resources",
    items: [
      { href: "/docs/use-cases", label: "Use Cases" },
      { href: "/docs/best-practices", label: "Best Practices" },
      { href: "/docs/faq", label: "FAQ" },
    ],
  },
];

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <>
      <div className="p-5 pb-4">
        <h2 className="text-sm font-semibold tracking-tight">Docs</h2>
      </div>
      <nav className="px-3 pb-8 space-y-6 flex-1">
        {sections.map((section) => (
          <div key={section.title}>
            <h4 className="px-3 mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {section.title}
            </h4>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onNavigate}
                    className={`block px-3 py-1.5 text-sm transition-colors border-l-2 ${
                      isActive
                        ? "border-foreground text-foreground font-medium"
                        : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
      <div className="px-3 py-3 border-t space-y-1">
        <ThemeToggle />
        <a
          href="https://github.com/EricStrohmaier/agenttodo"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-muted-foreground hover:bg-accent/50 hover:text-foreground transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          GitHub
        </a>
      </div>
    </>
  );
}

export function DocsSidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-16 left-4 z-50 p-2 rounded-md border bg-background md:hidden"
        aria-label="Open docs menu"
      >
        <Menu className="w-4 h-4" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-64 h-full bg-background border-r flex flex-col">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 p-1"
              aria-label="Close menu"
            >
              <X className="w-4 h-4" />
            </button>
            <SidebarContent onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="w-64 shrink-0 border-r h-[calc(100vh-3.5rem)] sticky top-14 overflow-y-auto hidden md:flex flex-col">
        <SidebarContent />
      </aside>
    </>
  );
}
