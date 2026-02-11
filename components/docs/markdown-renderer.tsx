"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { CodeBlock } from "./code-block";
import type { Components } from "react-markdown";

export function MarkdownRenderer({ content }: { content: string }) {
  const components: Components = {
    h1: ({ children }) => (
      <h1 className="text-3xl font-bold tracking-tight mb-2">{children}</h1>
    ),
    h2: ({ children }) => (
      <h2 className="text-xl font-semibold mt-10 mb-4">{children}</h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-lg font-semibold mt-8 mb-3">{children}</h3>
    ),
    h4: ({ children }) => (
      <h4 className="text-sm font-medium mt-6 mb-2">{children}</h4>
    ),
    p: ({ children }) => (
      <p className="text-muted-foreground mb-4 leading-[1.7]">{children}</p>
    ),
    ul: ({ children }) => (
      <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">{children}</ul>
    ),
    ol: ({ children }) => (
      <ol className="list-decimal pl-6 space-y-2 text-muted-foreground mb-4">{children}</ol>
    ),
    li: ({ children }) => <li>{children}</li>,
    a: ({ href, children }) => (
      <a href={href} className="text-primary underline underline-offset-4">
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
        <code className="text-sm bg-muted px-1.5 py-0.5 rounded font-mono" {...props}>
          {children}
        </code>
      );
    },
    pre: ({ children }) => <>{children}</>,
    table: ({ children }) => (
      <div className="overflow-x-auto mb-4">
        <table className="w-full text-sm">{children}</table>
      </div>
    ),
    thead: ({ children }) => <thead>{children}</thead>,
    tbody: ({ children }) => (
      <tbody className="text-muted-foreground">{children}</tbody>
    ),
    tr: ({ children }) => <tr className="border-b">{children}</tr>,
    th: ({ children }) => (
      <th className="py-2 pr-4 text-left font-medium">{children}</th>
    ),
    td: ({ children }) => <td className="py-2 pr-4">{children}</td>,
    blockquote: ({ children }) => (
      <blockquote className="border-l-2 border-muted pl-4 italic text-muted-foreground mb-4">
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
