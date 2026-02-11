import { AppHeader } from "@/components/layout/app-header";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col w-full min-h-screen">
      <AppHeader />
      <div className="flex-1">{children}</div>
    </div>
  );
}
