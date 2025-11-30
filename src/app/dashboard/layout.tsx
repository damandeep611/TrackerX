import Sidebar from "@/components/dashboard/sidebar/Sidebar";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "react-hot-toast";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <div className="flex h-screen bg-background text-primary ">
        <Sidebar />
        <main className="flex-1 overflow-auto  mr-2  scrollbar-hide">
          {children}
        </main>
        <Toaster position="top-right" />
      </div>
    </ThemeProvider>
  );
}
