import type { Metadata } from "next";
import { Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import QueryProvider from "./providers/QueryProvider";
import { AppearanceProvider } from "./providers/AppearanceProvider";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

// Monospace for metric numerals (`.tabular` / `font-mono`).
const geistMono = Geist_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: { default: "BuildxSkill", template: "%s · BuildxSkill" },
  description:
    "Track the hours you put into the skills you're building, run deep-work projects with a milestone every 20 hours, and get an honest read on your pace.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${geistMono.variable}`}>
      <body className="antialiased">
        <AppearanceProvider>
          <QueryProvider>
            <main>
              {children}
              <SpeedInsights />
              <Analytics />
            </main>
          </QueryProvider>
        </AppearanceProvider>
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: "var(--popover)",
              color: "var(--popover-foreground)",
              border: "1px solid var(--border)",
              borderRadius: "12px",
              boxShadow: "var(--raised-shadow)",
              fontSize: "13px",
              padding: "10px 12px",
            },
            success: { iconTheme: { primary: "var(--success)", secondary: "var(--popover)" } },
            error: { duration: 4000, iconTheme: { primary: "var(--danger)", secondary: "var(--popover)" } },
          }}
        />
      </body>
    </html>
  );
}
