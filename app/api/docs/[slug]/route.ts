import { readFileSync, existsSync } from "fs";
import path from "path";
import { NextResponse } from "next/server";

const VALID_SLUGS = ["introduction", "quickstart", "self-hosting", "api-reference", "concepts", "dashboard", "agent-integration", "use-cases", "best-practices", "faq", "story"];

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  if (!VALID_SLUGS.includes(slug)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const filePath = path.join(process.cwd(), "docs", `${slug}.md`);

  if (!existsSync(filePath)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const content = readFileSync(filePath, "utf-8");

  return new Response(content, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
    },
  });
}
