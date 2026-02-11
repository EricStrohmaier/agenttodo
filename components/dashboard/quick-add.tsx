"use client";

import { useState, useRef, useEffect } from "react";
import { Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import Link from "next/link";

interface QuickAddProps {
  onAdd: (title: string) => Promise<any>;
}

export function QuickAdd({ onAdd }: QuickAddProps) {
  const [value, setValue] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setIsLoggedIn(!!data.user));
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const handleSubmit = async () => {
    const title = value.trim();
    if (!title || submitting) return;

    if (!isLoggedIn) {
      toast("Sign in to create tasks", {
        action: {
          label: "Sign In",
          onClick: () => (window.location.href = "/signin"),
        },
      });
      return;
    }

    setSubmitting(true);
    await onAdd(title);
    setValue("");
    setSubmitting(false);
  };

  return (
    <div className="flex items-center gap-2 px-6 md:px-12 lg:px-20 py-2 border-b bg-background">
      <Plus className="w-4 h-4 text-muted-foreground shrink-0" />
      <div className="relative flex-1">
        <Input
          ref={inputRef}
          placeholder="Add a task..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          disabled={submitting}
          className="border-0 shadow-none focus-visible:ring-0 px-0 h-8 text-sm"
        />
      </div>
      <kbd className="hidden sm:inline-flex items-center text-[10px] text-muted-foreground/50 border rounded px-1.5 py-0.5 font-mono">
        ⌘K
      </kbd>
    </div>
  );
}
