import { DocsSidebar } from "@/components/docs/docs-sidebar";

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex w-full min-h-screen">
      <DocsSidebar />
      <main className="flex-1 min-w-0 px-6 md:px-12 py-10 max-w-4xl">
        <article className="prose-custom">{children}</article>
      </main>
    </div>
  );
}
