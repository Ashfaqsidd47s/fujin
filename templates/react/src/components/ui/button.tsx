import * as React from "react"
import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { Spinner } from "@/components/ui/spinner"

/*
 * Differences from shadcn/ui's button, all deliberate:
 * - Focus ring is a solid 2px `ring` with an offset. shadcn's `ring-ring/50`
 *   (and `ring-destructive/20`) composites below the 3:1 non-text contrast
 *   WCAG 1.4.11 requires.
 * - The smallest sizes are exactly 24px, the WCAG 2.5.8 minimum target size.
 * - `type` defaults to "button", so a button inside a <form> never submits it
 *   by accident. Pass `type="submit"` when you mean it.
 * - `loading` is built in: it blocks interaction, sets `aria-busy`, stays
 *   focusable so focus is not lost mid-request, and keeps the button's width.
 */
const buttonVariants = cva(
  "relative inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap transition-[color,background-color,border-color,box-shadow] outline-none select-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 aria-invalid:ring-2 aria-invalid:ring-destructive data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[loading]:cursor-wait [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 focus-visible:ring-destructive",
        outline:
          "border border-input bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        xs: "h-6 gap-1 rounded-sm px-2 text-xs has-[>svg]:px-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 px-6 has-[>svg]:px-4",
        icon: "size-9",
        "icon-xs": "size-6 rounded-sm [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

type ButtonProps = ButtonPrimitive.Props &
  VariantProps<typeof buttonVariants> & {
    /** Shows a spinner, sets `aria-busy` and blocks activation. */
    loading?: boolean
    /** Replaces the label while `loading`. Defaults to the existing label. */
    loadingText?: React.ReactNode
  }

function Button({
  className,
  variant = "default",
  size = "default",
  type = "button",
  loading = false,
  loadingText,
  disabled,
  children,
  onClick,
  ...props
}: ButtonProps) {
  const isIconOnly = typeof size === "string" && size.startsWith("icon")

  return (
    <ButtonPrimitive
      data-slot="button"
      data-variant={variant}
      data-size={size}
      data-loading={loading || undefined}
      type={type}
      disabled={disabled || loading}
      // Keep focus on the button while it is busy instead of dropping it to <body>.
      focusableWhenDisabled={loading}
      aria-busy={loading || undefined}
      className={cn(buttonVariants({ variant, size }), className)}
      onClick={(event) => {
        if (loading) {
          event.preventDefault()
          return
        }
        onClick?.(event)
      }}
      {...props}
    >
      {loading ? (
        isIconOnly || loadingText === undefined ? (
          <>
            {/* Hold the original width so the layout does not jump. */}
            <span className="invisible contents">{children}</span>
            <Spinner label={null} className="absolute inset-0 m-auto" />
          </>
        ) : (
          <>
            <Spinner label={null} />
            {loadingText}
          </>
        )
      ) : (
        children
      )}
    </ButtonPrimitive>
  )
}

export { Button, buttonVariants, type ButtonProps }
