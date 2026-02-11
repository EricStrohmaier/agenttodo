"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Input } from "@/components/ui/input";

interface QuickAddProps {
  onAdd: (title: string) => Promise<any>;
}

export function QuickAdd({ onAdd }: QuickAddProps) {
  const [value, setValue] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    const title = value.trim();
    if (!title || submitting) return;
    setSubmitting(true);
    await onAdd(title);
    setValue("");
    setSubmitting(false);
  };

  return (
    <div className="flex items-center gap-2 px-4 py-2 border-b bg-background">
      <Plus className="w-4 h-4 text-muted-foreground shrink-0" />
      <Input
        placeholder="Add a task..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        disabled={submitting}
        className="border-0 shadow-none focus-visible:ring-0 px-0 h-8 text-sm"
      />
    </div>
  );
}
