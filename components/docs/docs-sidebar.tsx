"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft } from "lucide-react";

const sections = [
  {
    title: "Getting Started",
    items: [
      { href: "/docs", label: "Introduction" },
      { href: "/docs/quickstart", label: "Quickstart" },
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
];

export function DocsSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 shrink-0 border-r h-screen sticky top-0 overflow-y-auto hidden md:block">
      <div className="p-4 pb-2">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Dashboard
        </Link>
      </div>
      <div className="p-4 pt-2">
        <Link href="/docs" className="text-lg font-semibold">
          Docs
        </Link>
      </div>
      <nav className="px-3 pb-8 space-y-6">
        {sections.map((section) => (
          <div key={section.title}>
            <h4 className="px-3 mb-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {section.title}
            </h4>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`block px-3 py-1.5 rounded-md text-sm transition-colors ${
                      isActive
                        ? "bg-accent text-accent-foreground font-medium"
                        : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
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
    </aside>
  );
}
