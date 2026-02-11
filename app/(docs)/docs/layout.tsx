import { AppHeader } from "@/components/layout/app-header";
import { DocsSidebar } from "@/components/docs/docs-sidebar";

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AppHeader />
      <div className="flex flex-1">
        <DocsSidebar />
        <main className="flex-1 min-w-0">
          <div className="px-6 md:px-12 lg:px-16 py-8 md:py-12 max-w-3xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
