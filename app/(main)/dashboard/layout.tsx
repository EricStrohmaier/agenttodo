export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="max-w-6xl mx-auto w-full py-6 sm:py-10 px-4 sm:px-6 lg:px-8">
      {children}
    </div>
  );
}
