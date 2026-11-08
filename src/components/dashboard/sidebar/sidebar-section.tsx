import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SidebarSectionProps {
  title: string;
  children: ReactNode;
  isCollapsed?: boolean;
}

export default function SidebarSection({ title, children, isCollapsed }: SidebarSectionProps) {
  return (
    <div className="space-y-1">
      {isCollapsed ? (
        <div className="mx-auto my-2 h-px w-6 bg-sidebar-border" aria-hidden />
      ) : (
        <h3 className={cn("px-2.5 pt-3 pb-1 text-[11px] font-medium text-subtle-foreground")}>{title}</h3>
      )}
      <nav aria-label={title} className="space-y-0.5">
        {children}
      </nav>
    </div>
  );
}
