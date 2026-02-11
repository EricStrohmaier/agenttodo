"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { CodeBlock } from "./code-block";
import type { Components } from "react-markdown";

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function MarkdownRenderer({ content }: { content: string }) {
  const components: Components = {
    h1: ({ children }) => (
      <h1 id={slugify(String(children))} className="text-3xl font-bold tracking-tight mb-4 scroll-mt-20">
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 id={slugify(String(children))} className="text-xl font-semibold mt-12 mb-4 pt-8 border-t border-border/40 scroll-mt-20">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 id={slugify(String(children))} className="text-lg font-semibold mt-8 mb-3 scroll-mt-20">
        {children}
      </h3>
    ),
    h4: ({ children }) => (
      <h4 id={slugify(String(children))} className="text-sm font-medium mt-6 mb-2 scroll-mt-20">
        {children}
      </h4>
    ),
    p: ({ children }) => (
      <p className="text-foreground/80 mb-4 leading-[1.7]">{children}</p>
    ),
    ul: ({ children }) => (
      <ul className="list-disc pl-6 space-y-2 text-foreground/80 mb-4">{children}</ul>
    ),
    ol: ({ children }) => (
      <ol className="list-decimal pl-6 space-y-2 text-foreground/80 mb-4">{children}</ol>
    ),
    li: ({ children }) => <li>{children}</li>,
    a: ({ href, children }) => (
      <a href={href} className="text-blue-600 dark:text-blue-400 underline underline-offset-4">
        {children}
      </a>
    ),
    strong: ({ children }) => (
      <strong className="text-foreground font-semibold">{children}</strong>
    ),
    code: ({ className, children, ...props }) => {
      const match = /language-(\w+)/.exec(className || "");
      const isBlock = match || (typeof children === "string" && children.includes("\n"));
      if (isBlock) {
        return (
          <CodeBlock language={match?.[1] || "text"}>
            {String(children).replace(/\n$/, "")}
          </CodeBlock>
        );
      }
      return (
        <code className="text-sm bg-muted/80 px-1.5 py-0.5 rounded font-mono" {...props}>
          {children}
        </code>
      );
    },
    pre: ({ children }) => <>{children}</>,
    table: ({ children }) => (
      <div className="overflow-x-auto mb-4">
        <table className="w-full text-sm border border-border">{children}</table>
      </div>
    ),
    thead: ({ children }) => <thead className="bg-muted/50">{children}</thead>,
    tbody: ({ children }) => (
      <tbody className="text-foreground/80">{children}</tbody>
    ),
    tr: ({ children }) => <tr className="border-b border-border">{children}</tr>,
    th: ({ children }) => (
      <th className="py-2 px-4 text-left font-medium border border-border">{children}</th>
    ),
    td: ({ children }) => <td className="py-2 px-4 border border-border">{children}</td>,
    blockquote: ({ children }) => (
      <blockquote className="border-l-2 border-blue-500/30 pl-4 italic text-muted-foreground mb-4">
        {children}
      </blockquote>
    ),
    hr: () => <hr className="my-8 border-border" />,
  };

  return (
    <div className="max-w-3xl leading-[1.7]">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
