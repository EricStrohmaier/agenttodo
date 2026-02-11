"use client";

import { useState } from "react";
import { Check, Copy, FileText, Pencil, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { MarkdownRenderer } from "./markdown-renderer";
import { TableOfContents } from "./toc";

const DOC_ORDER = [
  { slug: "introduction", href: "/docs", title: "Introduction" },
  { slug: "quickstart", href: "/docs/quickstart", title: "Quickstart" },
  { slug: "self-hosting", href: "/docs/self-hosting", title: "Self-Hosting" },
  { slug: "api", href: "/docs/api", title: "API Reference" },
  { slug: "concepts", href: "/docs/concepts", title: "Core Concepts" },
  { slug: "dashboard", href: "/docs/dashboard", title: "Dashboard Guide" },
  { slug: "agents", href: "/docs/agents", title: "Agent Integration" },
  { slug: "use-cases", href: "/docs/use-cases", title: "Use Cases" },
  { slug: "best-practices", href: "/docs/best-practices", title: "Best Practices" },
  { slug: "faq", href: "/docs/faq", title: "FAQ" },
];

interface DocPageProps {
  content: string;
  title: string;
  slug: string;
}

export function DocPage({ content, title, slug }: DocPageProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentIndex = DOC_ORDER.findIndex(
    (d) => d.slug === slug || (slug === "introduction" && d.slug === "introduction")
  );
  const prev = currentIndex > 0 ? DOC_ORDER[currentIndex - 1] : null;
  const next = currentIndex < DOC_ORDER.length - 1 ? DOC_ORDER[currentIndex + 1] : null;

  return (
    <div className="flex gap-8">
      <div className="flex-1 min-w-0">
        {/* Breadcrumb + actions */}
        <div className="flex items-center justify-between mb-6">
          <nav className="text-sm text-muted-foreground">
            <Link href="/docs" className="hover:text-foreground transition-colors">Docs</Link>
            <span className="mx-2">/</span>
            <span className="text-foreground">{title}</span>
          </nav>
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-2 py-1 text-xs text-muted-foreground hover:text-foreground rounded-md hover:bg-muted transition-colors"
            >
              {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              {copied ? "Copied" : "Copy"}
            </button>
            <a
              href={`/api/docs/${slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-2 py-1 text-xs text-muted-foreground hover:text-foreground rounded-md hover:bg-muted transition-colors"
            >
              <FileText className="w-3 h-3" />
              Raw
            </a>
            <a
              href={`https://github.com/EricStrohmaier/agenttodo.ai/edit/main/docs/${slug}.md`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-2 py-1 text-xs text-muted-foreground hover:text-foreground rounded-md hover:bg-muted transition-colors"
            >
              <Pencil className="w-3 h-3" />
              Edit
            </a>
          </div>
        </div>

        <MarkdownRenderer content={content} />

        {/* Prev / Next navigation */}
        <div className="flex items-center justify-between mt-16 pt-8 border-t">
          {prev ? (
            <Link
              href={prev.href}
              className="group flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              <div>
                <div className="text-xs text-muted-foreground mb-0.5">Previous</div>
                <div className="font-medium text-foreground">{prev.title}</div>
              </div>
            </Link>
          ) : (
            <div />
          )}
          {next ? (
            <Link
              href={next.href}
              className="group flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors text-right"
            >
              <div>
                <div className="text-xs text-muted-foreground mb-0.5">Next</div>
                <div className="font-medium text-foreground">{next.title}</div>
              </div>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          ) : (
            <div />
          )}
        </div>
      </div>

      {/* Table of Contents */}
      <TableOfContents content={content} />
    </div>
  );
}
