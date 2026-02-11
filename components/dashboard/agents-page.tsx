"use client";

import { useState } from "react";
import { useAgents } from "@/hooks/use-agents";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Copy, Trash2, Check } from "lucide-react";
import { timeAgo } from "@/lib/time";
import { toast } from "sonner";

export function AgentsPage() {
  const { keys, loading, createKey, deleteKey } = useAgents();
  const [name, setName] = useState("");
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) return;
    setCreating(true);
    const result = await createKey(name.trim());
    if (result?.key) {
      setGeneratedKey(result.key);
    }
    setCreating(false);
    setName("");
  };

  const copyKey = () => {
    if (generatedKey) {
      navigator.clipboard.writeText(generatedKey);
      setCopied(true);
      toast.success("Copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">API Keys</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage API keys for your agents
          </p>
        </div>

        <Dialog
          open={dialogOpen}
          onOpenChange={(o) => {
            setDialogOpen(o);
            if (!o) {
              setGeneratedKey(null);
              setName("");
            }
          }}
        >
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="w-3.5 h-3.5 mr-1.5" /> Create Key
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{generatedKey ? "API Key Created" : "Create API Key"}</DialogTitle>
              <DialogDescription>
                {generatedKey
                  ? "Copy this key now. You won't be able to see it again."
                  : "Give your agent a name to identify it."}
              </DialogDescription>
            </DialogHeader>

            {generatedKey ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-xs bg-muted p-3 rounded-md font-mono break-all select-all">
                    {generatedKey}
                  </code>
                  <Button size="icon" variant="outline" onClick={copyKey} className="shrink-0">
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
                <p className="text-xs text-destructive">
                  ⚠️ This key will only be shown once. Copy it now.
                </p>
              </div>
            ) : (
              <>
                <Input
                  placeholder="Agent name (e.g. research-bot)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                />
                <DialogFooter>
                  <Button onClick={handleCreate} disabled={!name.trim() || creating}>
                    {creating ? "Creating..." : "Create"}
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-24 ml-auto" />
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </div>
      ) : keys.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground border rounded-lg border-dashed">
          <p className="text-sm">No API keys yet</p>
          <p className="text-xs mt-1">Create one to let agents connect</p>
        </div>
      ) : (
        <div className="space-y-2">
          {keys.map((key) => (
            <div key={key.id} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-accent/30 transition-colors">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{key.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Created {timeAgo(key.created_at)}
                  {key.last_used_at && ` · Last used ${timeAgo(key.last_used_at)}`}
                </p>
              </div>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive shrink-0">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete "{key.name}"?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will immediately revoke the API key. Any agents using it will lose access.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => deleteKey(key.id)}>Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
