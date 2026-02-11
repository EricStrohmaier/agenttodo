import { readFileSync } from "fs";
import path from "path";
import { DocPage } from "@/components/docs/doc-page";

const content = readFileSync(path.join(process.cwd(), "docs/agent-integration.md"), "utf-8");

export default function Page() {
  return <DocPage content={content} title="Agent Integration" slug="agent-integration" />;
}
