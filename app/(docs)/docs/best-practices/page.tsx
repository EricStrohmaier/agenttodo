import { readFileSync } from "fs";
import path from "path";
import { DocPage } from "@/components/docs/doc-page";

const content = readFileSync(path.join(process.cwd(), "docs/best-practices.md"), "utf-8");

export default function Page() {
  return <DocPage content={content} title="Best Practices" slug="best-practices" />;
}
