import { Hourglass, House, LifeBuoy, Settings, Terminal, type LucideIcon } from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
}

export const mainNav: NavItem[] = [
  { title: "Dashboard", href: "/dashboard", icon: House },
  { title: "80 Hour Goals", href: "/dashboard/80-hour-goals", icon: Hourglass },
  { title: "Sandbox", href: "/dashboard/sandbox", icon: Terminal },
];

export const supportNav: NavItem[] = [
  { title: "Settings", href: "/dashboard/usersetting", icon: Settings },
  { title: "Help Center", href: "/dashboard/help", icon: LifeBuoy },
];

export function isNavActive(pathname: string | null, href: string) {
  if (!pathname) return false;
  if (href === "/dashboard") return pathname === "/dashboard" || pathname.startsWith("/dashboard/skills");
  return pathname === href || pathname.startsWith(`${href}/`);
}
