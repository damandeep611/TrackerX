import { ReactNode } from "react"

interface SidebarSectionProps {
  title: string
  children: ReactNode
  rightIcon?: ReactNode
}

export default function SidebarSection({title, children, rightIcon}:SidebarSectionProps){
  return(
    <div className="mb-4">
      <div className="flex justify-between items-center px-4 py-2">
        <h3 className="text-xs font-medium text-gray-400">{title}</h3>
        {rightIcon}
      </div>
      <div className="mt-1">
        {children}
      </div>
    </div>
  )
}