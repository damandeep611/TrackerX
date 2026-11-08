import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center gap-1 whitespace-nowrap rounded-full border font-medium [&>svg]:pointer-events-none [&>svg]:size-3",
  {
    variants: {
      variant: {
        neutral: "border-border bg-surface-2 text-muted-foreground",
        outline: "border-border bg-transparent text-muted-foreground",
        brand: "border-transparent bg-brand-soft text-brand",
        success: "border-transparent bg-success-soft text-success",
        warning: "border-transparent bg-warning-soft text-warning",
        danger: "border-transparent bg-danger-soft text-danger",
        solid: "border-transparent bg-primary text-primary-foreground",
      },
      size: {
        sm: "h-5 px-2 text-[11px]",
        default: "h-6 px-2.5 text-xs",
      },
    },
    defaultVariants: { variant: "neutral", size: "default" },
  }
)

function Badge({
  className,
  variant,
  size,
  asChild = false,
  dot = false,
  children,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean; dot?: boolean }) {
  const Comp = asChild ? Slot : "span"
  return (
    <Comp data-slot="badge" className={cn(badgeVariants({ variant, size }), className)} {...props}>
      {dot && <span aria-hidden className="size-1.5 rounded-full bg-current" />}
      {children}
    </Comp>
  )
}

export { Badge, badgeVariants }
