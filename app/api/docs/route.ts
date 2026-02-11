import { NextResponse } from "next/server";

const DOCS = [
  { slug: "introduction", title: "Introduction", url: "/api/docs/introduction" },
  { slug: "quickstart", title: "Quickstart", url: "/api/docs/quickstart" },
  { slug: "self-hosting", title: "Self-Hosting", url: "/api/docs/self-hosting" },
  { slug: "api-reference", title: "API Reference", url: "/api/docs/api-reference" },
  { slug: "concepts", title: "Core Concepts", url: "/api/docs/concepts" },
  { slug: "agent-integration", title: "Agent Integration", url: "/api/docs/agent-integration" },
  { slug: "use-cases", title: "Use Cases", url: "/api/docs/use-cases" },
  { slug: "best-practices", title: "Best Practices", url: "/api/docs/best-practices" },
  { slug: "faq", title: "FAQ", url: "/api/docs/faq" },
];

export async function GET() {
  return NextResponse.json({ docs: DOCS });
}
