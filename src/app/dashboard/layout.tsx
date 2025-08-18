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
      <div className="flex h-screen bg-[#F5F5F5] dark:bg-zinc-900">
        <Sidebar />
        <main className="flex-1 overflow-auto mt-3 mr-3 border border-gray-300 dark:border-gray-800 rounded-t-2xl scrollbar-hide">
          {children}
        </main>
        <Toaster position="top-right" />
      </div>
    </ThemeProvider>
  );
}
