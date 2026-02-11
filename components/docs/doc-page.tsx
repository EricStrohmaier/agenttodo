"use client";

import { useState } from "react";
import { Check, Copy, FileText } from "lucide-react";
import { MarkdownRenderer } from "./markdown-renderer";

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

  return (
    <div>
      <div className="flex items-center justify-between mb-8 max-w-3xl">
        <h1 className="sr-only">{title}</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border bg-background hover:bg-muted transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? "Copied!" : "Copy page"}
          </button>
          <a
            href={`/api/docs/${slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border bg-background hover:bg-muted transition-colors"
          >
            <FileText className="w-3.5 h-3.5" />
            Raw
          </a>
        </div>
      </div>
      <MarkdownRenderer content={content} />
    </div>
  );
}
