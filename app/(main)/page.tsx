import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { ArrowRight, Code2, Radio, ScrollText, Github } from "lucide-react";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-24 max-w-3xl mx-auto text-center">
        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight mb-6">
          A task execution memory layer for autonomous agents.
        </h1>
        <p className="text-lg text-muted-foreground mb-10 max-w-xl">
          Give your AI agents a shared task queue with a clean dashboard for
          human oversight. Agents query for work, claim tasks, report results —
          you watch it happen in real-time.
        </p>
        <div className="flex gap-4">
          <Link
            href="/signin"
            className="inline-flex items-center gap-2 rounded-md bg-primary text-primary-foreground px-5 py-2.5 text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Get Started Free
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/docs"
            className="inline-flex items-center gap-2 rounded-md border px-5 py-2.5 text-sm font-medium hover:bg-accent transition-colors"
          >
            View Docs
          </Link>
        </div>
      </div>

      {/* Features */}
      <div className="border-t px-6 py-16">
        <div className="max-w-3xl mx-auto grid sm:grid-cols-2 gap-8">
          {[
            {
              icon: Code2,
              title: "API-first",
              desc: "Simple REST API — any agent can read and write tasks via HTTP.",
            },
            {
              icon: Radio,
              title: "Real-time",
              desc: "Watch agents work in real-time. Dashboard updates as tasks change.",
            },
            {
              icon: ScrollText,
              title: "Audit Trail",
              desc: "Every action logged with agent name, timestamp, and confidence.",
            },
            {
              icon: Github,
              title: "Open Source",
              desc: "MIT licensed. Self-host or use the cloud — your choice.",
            },
          ].map((f) => (
            <div key={f.title} className="space-y-2">
              <f.icon className="w-5 h-5 text-primary" />
              <h3 className="font-medium">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t px-6 py-8 text-center text-sm text-muted-foreground">
        <a
          href="https://github.com/EricStrohmaier/agentboard"
          className="hover:text-foreground transition-colors"
        >
          Open source on GitHub
        </a>
      </div>
    </div>
  );
}
