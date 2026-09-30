import type * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/registry/fujin/lib/utils"

/*
 * Differences from shadcn/ui's alert, all deliberate:
 * - No `role="alert"` by default. A live role is about *how* the alert
 *   appears, not its colour: an alert rendered with the page is static
 *   content, and `role="alert"` on it either interrupts the screen reader on
 *   mount or is ignored. Pass `role="alert"` (urgent) or `role="status"`
 *   (polite) yourself when the alert is inserted in response to something
 *   the user did.
 * - Status variants keep the text in `foreground`/`muted-foreground` and put
 *   the colour on the border, a 5% tint and the icon. shadcn colours the text
 *   itself, which drops below 4.5:1 for `destructive` and fails badly for a
 *   yellow `warning`.
 * - `AlertTitle` wraps instead of `line-clamp-1`; truncated alerts hide the
 *   part people need.
 * - `AlertAction` gets its own grid column so a long title wraps before the
 *   action instead of running underneath it.
 */
const alertVariants = cva(
  "relative grid w-full grid-cols-[0_1fr_auto] items-start gap-y-0.5 rounded-lg border px-4 py-3 text-sm text-card-foreground has-[>svg]:grid-cols-[1.75rem_1fr_auto] [&>svg]:size-4 [&>svg]:translate-y-0.5 [&>svg]:text-current",
  {
    variants: {
      variant: {
        default: "bg-card",
        destructive:
          "border-destructive/50 bg-destructive/5 [&>svg]:text-destructive",
        success: "border-success/50 bg-success/5 [&>svg]:text-success",
        warning: "border-warning/60 bg-warning/5 [&>svg]:text-warning",
        info: "border-info/50 bg-info/5 [&>svg]:text-info",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

type AlertProps = React.ComponentProps<"div"> &
  VariantProps<typeof alertVariants>

function Alert({ className, variant = "default", ...props }: AlertProps) {
  return (
    <div
      data-slot="alert"
      data-variant={variant}
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  )
}

type AlertTitleProps = React.ComponentProps<"div">

/**
 * A `div`, not a heading - alerts sit at every level of a page. Pass
 * `role="heading" aria-level={n}` when it should appear in the outline.
 */
function AlertTitle({ className, ...props }: AlertTitleProps) {
  return (
    <div
      data-slot="alert-title"
      className={cn(
        "col-start-2 min-h-4 font-medium tracking-tight",
        className
      )}
      {...props}
    />
  )
}

type AlertDescriptionProps = React.ComponentProps<"div">

function AlertDescription({ className, ...props }: AlertDescriptionProps) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        "col-start-2 grid justify-items-start gap-1 text-sm text-muted-foreground [&_p]:leading-relaxed",
        className
      )}
      {...props}
    />
  )
}

type AlertActionProps = React.ComponentProps<"div">

/** Top-right slot for a button or dismiss control. */
function AlertAction({ className, ...props }: AlertActionProps) {
  return (
    <div
      data-slot="alert-action"
      className={cn(
        "col-start-3 row-span-2 row-start-1 ml-3 flex items-center gap-2 self-start",
        className
      )}
      {...props}
    />
  )
}

export {
  Alert,
  AlertTitle,
  AlertDescription,
  AlertAction,
  alertVariants,
  type AlertProps,
  type AlertTitleProps,
  type AlertDescriptionProps,
  type AlertActionProps,
}
