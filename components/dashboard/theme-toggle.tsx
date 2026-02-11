"use client";

import { useState, useEffect } from "react";
import { Moon, Sun, Monitor } from "lucide-react";

type Theme = "light" | "dark" | "system";

function applyTheme(theme: Theme) {
  const isDark =
    theme === "dark" ||
    (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", isDark);
  document.cookie = `theme=${isDark ? "dark" : "light"};path=/;max-age=31536000;SameSite=Lax`;
}

export function ThemeToggle({ collapsed = false }: { collapsed?: boolean }) {
  const [theme, setTheme] = useState<Theme>("system");

  useEffect(() => {
    const stored = localStorage.getItem("theme") as Theme | null;
    const t = stored || "system";
    setTheme(t);
    applyTheme(t);

    // Listen for system changes when in system mode
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      if ((localStorage.getItem("theme") || "system") === "system") {
        applyTheme("system");
      }
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const cycle = () => {
    const order: Theme[] = ["light", "dark", "system"];
    const next = order[(order.indexOf(theme) + 1) % order.length];
    setTheme(next);
    localStorage.setItem("theme", next);
    applyTheme(next);
  };

  const icon =
    theme === "dark" ? <Sun className="w-4 h-4 shrink-0" /> :
    theme === "light" ? <Moon className="w-4 h-4 shrink-0" /> :
    <Monitor className="w-4 h-4 shrink-0" />;

  const label =
    theme === "dark" ? "Light mode" :
    theme === "light" ? "Dark mode" :
    "System theme";

  return (
    <button
      onClick={cycle}
      className={`flex items-center gap-3 rounded-md text-sm text-muted-foreground hover:bg-accent/50 hover:text-foreground transition-colors ${
        collapsed ? "px-0 py-2 justify-center w-full" : "px-3 py-2 w-full"
      }`}
      title={collapsed ? label : undefined}
    >
      {icon}
      {!collapsed && <span>{label}</span>}
    </button>
  );
}
