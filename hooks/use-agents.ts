"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

interface ApiKey {
  id: string;
  name: string;
  last_used_at: string | null;
  created_at: string;
}

export function useAgents() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchKeys = useCallback(async () => {
    const res = await fetch("/api/agents");
    const json = await res.json();
    if (json.data) setKeys(json.data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchKeys();
  }, [fetchKeys]);

  const createKey = async (name: string): Promise<{ key: string; id: string; name: string } | null> => {
    const res = await fetch("/api/agents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const json = await res.json();
    if (json.error) {
      toast.error(json.error);
      return null;
    }
    toast.success("API key created");
    await fetchKeys();
    return json.data;
  };

  const deleteKey = async (id: string) => {
    const res = await fetch(`/api/agents?id=${id}`, { method: "DELETE" });
    const json = await res.json();
    if (json.error) {
      toast.error(json.error);
      return false;
    }
    toast.success("API key deleted");
    setKeys((prev) => prev.filter((k) => k.id !== id));
    return true;
  };

  return { keys, loading, createKey, deleteKey, refetch: fetchKeys };
}
