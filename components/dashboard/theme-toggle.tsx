"use client";

import { useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle({ collapsed = false }: { collapsed?: boolean }) {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const isDark = stored === "dark" || (!stored && window.matchMedia("(prefers-color-scheme: dark)").matches);
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  return (
    <button
      onClick={toggle}
      className={`flex items-center gap-3 rounded-md text-sm text-muted-foreground hover:bg-accent/50 hover:text-foreground transition-colors ${
        collapsed ? "px-0 py-2 justify-center w-full" : "px-3 py-2 w-full"
      }`}
      title={collapsed ? (dark ? "Light mode" : "Dark mode") : undefined}
    >
      {dark ? <Sun className="w-4 h-4 shrink-0" /> : <Moon className="w-4 h-4 shrink-0" />}
      {!collapsed && <span>{dark ? "Light mode" : "Dark mode"}</span>}
    </button>
  );
}
