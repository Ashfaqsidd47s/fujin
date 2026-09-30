import type * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/registry/fujin/lib/utils"

/*
 * Same parts as shadcn/ui's empty. `EmptyMedia` is hidden from assistive tech
 * by default because it is almost always a decorative icon or illustration;
 * pass `aria-hidden={false}` when it carries meaning (e.g. an avatar stack
 * whose `alt` text matters).
 */
type EmptyProps = React.ComponentProps<"div">

function Empty({ className, ...props }: EmptyProps) {
  return (
    <div
      data-slot="empty"
      className={cn(
        "flex min-w-0 flex-1 flex-col items-center justify-center gap-6 rounded-lg border-dashed p-6 text-center text-balance md:p-12",
        className
      )}
      {...props}
    />
  )
}

type EmptyHeaderProps = React.ComponentProps<"div">

function EmptyHeader({ className, ...props }: EmptyHeaderProps) {
  return (
    <div
      data-slot="empty-header"
      className={cn(
        "flex max-w-sm flex-col items-center gap-2 text-center",
        className
      )}
      {...props}
    />
  )
}

const emptyMediaVariants = cva(
  "mb-2 flex shrink-0 items-center justify-center [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        icon: "size-10 rounded-lg bg-muted text-foreground [&_svg:not([class*='size-'])]:size-6",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

type EmptyMediaProps = React.ComponentProps<"div"> &
  VariantProps<typeof emptyMediaVariants>

function EmptyMedia({
  className,
  variant = "default",
  ...props
}: EmptyMediaProps) {
  return (
    <div
      data-slot="empty-media"
      data-variant={variant}
      aria-hidden
      className={cn(emptyMediaVariants({ variant }), className)}
      {...props}
    />
  )
}

type EmptyTitleProps = React.ComponentProps<"div">

/**
 * A `div` - pass `role="heading" aria-level={n}` when the empty state stands
 * in for a whole page section.
 */
function EmptyTitle({ className, ...props }: EmptyTitleProps) {
  return (
    <div
      data-slot="empty-title"
      className={cn("text-lg font-medium tracking-tight", className)}
      {...props}
    />
  )
}

type EmptyDescriptionProps = React.ComponentProps<"div">

function EmptyDescription({ className, ...props }: EmptyDescriptionProps) {
  return (
    <div
      data-slot="empty-description"
      className={cn(
        "text-sm/relaxed text-muted-foreground [&>a]:underline [&>a]:underline-offset-4 [&>a:hover]:text-primary",
        className
      )}
      {...props}
    />
  )
}

type EmptyContentProps = React.ComponentProps<"div">

/** Actions: the primary "create" button, an import link, a search reset. */
function EmptyContent({ className, ...props }: EmptyContentProps) {
  return (
    <div
      data-slot="empty-content"
      className={cn(
        "flex w-full max-w-sm min-w-0 flex-col items-center gap-4 text-sm text-balance",
        className
      )}
      {...props}
    />
  )
}

export {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
  emptyMediaVariants,
  type EmptyProps,
  type EmptyHeaderProps,
  type EmptyMediaProps,
  type EmptyTitleProps,
  type EmptyDescriptionProps,
  type EmptyContentProps,
}
