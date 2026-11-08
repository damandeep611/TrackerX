import Sidebar from "@/components/dashboard/sidebar/Sidebar";
import DashboardProviders from "@/components/dashboard/DashboardProviders";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardProviders>
      <div className="flex h-dvh bg-background text-foreground">
        <Sidebar />
        <main className="min-w-0 flex-1 overflow-y-auto pt-14 md:pt-0">{children}</main>
      </div>
    </DashboardProviders>
  );
}
