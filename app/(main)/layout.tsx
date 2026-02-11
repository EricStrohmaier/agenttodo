import { createClient } from "@/utils/supabase/server";
import { Sidebar } from "@/components/dashboard/sidebar";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="flex w-full min-h-screen">
      <Sidebar user={user} />
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}
