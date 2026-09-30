"use client"

import { Toggle as TogglePrimitive } from "@base-ui/react/toggle"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/registry/fujin/lib/utils"

/*
 * Differences from shadcn/ui's toggle, all deliberate:
 * - Hover only changes the text colour, it never paints the background. In
 *   the default theme `--accent` and `--muted` are the same colour, so
 *   shadcn's hover and pressed states look identical - clicking a hovered
 *   toggle gave no visible feedback.
 * - The unpressed label is `muted-foreground`, so pressed also changes the
 *   foreground, not just a near-white background.
 * - Focus ring is a solid 2px `ring` (WCAG 1.4.11), not `ring-ring/50`.
 * - Pressed state is Base UI's `data-pressed` (`aria-pressed` is set for you).
 */
const toggleVariants = cva(
  "inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap text-muted-foreground transition-[color,background-color,box-shadow] outline-none select-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[pressed]:bg-accent data-[pressed]:text-accent-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        outline: "border border-input bg-transparent shadow-xs",
      },
      size: {
        default: "h-9 min-w-9 px-2",
        sm: "h-8 min-w-8 px-1.5",
        lg: "h-10 min-w-10 px-2.5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

type ToggleProps<Value extends string = string> = TogglePrimitive.Props<Value> &
  VariantProps<typeof toggleVariants>

/**
 * Icon-only toggles need an `aria-label` that names the thing being toggled
 * ("Bold"), not the action ("Make bold") - `aria-pressed` carries the state.
 */
function Toggle<Value extends string = string>({
  className,
  variant = "default",
  size = "default",
  ...props
}: ToggleProps<Value>) {
  return (
    <TogglePrimitive
      data-slot="toggle"
      data-variant={variant}
      data-size={size}
      className={cn(toggleVariants({ variant, size }), className)}
      {...props}
    />
  )
}

export { Toggle, toggleVariants, type ToggleProps }
