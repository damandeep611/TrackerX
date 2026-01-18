import { ReactNode } from "react"

interface SidebarSectionProps {
  title: string;
  children: ReactNode;
  isCollapsed?: boolean;
}

export default function SidebarSection({
  title,
  children,
  isCollapsed,
}: SidebarSectionProps) {
  return (
    <div className={`${isCollapsed ? "mt-4 pt-2" : "mt-4"}`}>
      {!isCollapsed && (
        <h3 className="px-4 mb-2 text-[10px] font-bold text-zinc-500 dark:text-zinc-500 uppercase tracking-widest animate-in fade-in duration-300">
          {title}
        </h3>
      )}
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}
