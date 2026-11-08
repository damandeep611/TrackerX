import { House, Terminal, type LucideIcon } from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
}

export const mainNav: NavItem[] = [
  { title: "Dashboard", href: "/dashboard", icon: House },
  { title: "Sandboxes", href: "/dashboard/sandbox", icon: Terminal },
];

export function isNavActive(pathname: string | null, href: string) {
  if (!pathname) return false;
  if (href === "/dashboard") return pathname === "/dashboard" || pathname.startsWith("/dashboard/skills");
  return pathname === href || pathname.startsWith(`${href}/`);
}
