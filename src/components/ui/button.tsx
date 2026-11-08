import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-[background-color,border-color,color,box-shadow,transform] duration-150 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-[3px] focus-visible:ring-ring aria-invalid:ring-danger/30 aria-invalid:border-danger",
  {
    variants: {
      variant: {
        /** High emphasis: near-black in light, near-white in dark. */
        default: "bg-primary text-primary-foreground shadow-panel hover:bg-primary/90",
        /** Brand accent: one per view, for the main call to action. */
        brand: "bg-brand text-brand-foreground shadow-panel hover:bg-brand/90",
        /** Bordered, sits on panels ("Details", "View all"). */
        outline:
          "border border-border bg-card text-foreground shadow-panel hover:bg-surface-2 hover:border-border-strong",
        /** Filled neutral on a panel. */
        secondary: "bg-surface-2 text-foreground hover:bg-surface-3",
        /** Low emphasis: icons, toolbar actions. */
        ghost: "text-muted-foreground hover:bg-surface-2 hover:text-foreground",
        destructive: "bg-danger text-white shadow-panel hover:bg-danger/90",
        /** Destructive but quiet (menus, inline). */
        "destructive-ghost": "text-danger hover:bg-danger-soft",
        link: "text-brand underline-offset-4 hover:underline active:scale-100",
      },
      size: {
        xs: "h-7 rounded-md gap-1 px-2 text-xs has-[>svg]:px-1.5 [&_svg:not([class*='size-'])]:size-3.5",
        sm: "h-8 gap-1.5 px-3 text-[13px] has-[>svg]:px-2.5",
        default: "h-9 px-4 has-[>svg]:px-3",
        lg: "h-10 px-5 has-[>svg]:px-4",
        icon: "size-9",
        "icon-sm": "size-8",
        "icon-xs": "size-7 rounded-md [&_svg:not([class*='size-'])]:size-3.5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
