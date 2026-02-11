import { NextResponse } from "next/server";

const DOCS = [
  { slug: "introduction", title: "Introduction", url: "/api/docs/introduction" },
  { slug: "quickstart", title: "Quickstart", url: "/api/docs/quickstart" },
  { slug: "api-reference", title: "API Reference", url: "/api/docs/api-reference" },
  { slug: "concepts", title: "Core Concepts", url: "/api/docs/concepts" },
  { slug: "agent-integration", title: "Agent Integration", url: "/api/docs/agent-integration" },
];

export async function GET() {
  return NextResponse.json({ docs: DOCS });
}
