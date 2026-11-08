import * as React from "react"

import { cn } from "@/lib/utils"

const fieldBase =
  "w-full min-w-0 rounded-lg border border-input bg-card px-3 text-sm text-foreground shadow-panel transition-[border-color,box-shadow] outline-none placeholder:text-subtle-foreground selection:bg-brand selection:text-brand-foreground disabled:cursor-not-allowed disabled:opacity-50 hover:border-border-strong focus-visible:border-brand/60 focus-visible:ring-[3px] focus-visible:ring-ring aria-invalid:border-danger aria-invalid:ring-danger/20 dark:bg-surface-2"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        fieldBase,
        "h-9 py-1 file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
        className
      )}
      {...props}
    />
  )
}

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(fieldBase, "min-h-20 resize-y py-2 leading-relaxed", className)}
      {...props}
    />
  )
}

export { Input, Textarea, fieldBase }
