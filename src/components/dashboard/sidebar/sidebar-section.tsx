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
    <div className={`${isCollapsed ? "mt-6 pt-4" : ""}`}>
      {!isCollapsed && (
        <h3 className=" px-3  mb-2 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mt-6 animate-in fade-in duration-300">
          {title}
        </h3>
      )}
      <div className="space-y-1">{children}</div>
    </div>
  );
}