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
    <div className="mt-6">
      {!isCollapsed && (
        <h3 className=" px-4 mb-2 text-xs font-medium  uppercase">{title}</h3>
      )}
      <div className="space-y-1">{children}</div>
    </div>
  );
}