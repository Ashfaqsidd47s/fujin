import type * as React from "react"

import { cn } from "@/registry/fujin/lib/utils"

/*
 * Same parts and layout as shadcn/ui's card. The header is a container
 * (`@container/card-header`) so contents can respond to the card's width
 * rather than the viewport, and it grows a second column only when a
 * `CardAction` is present.
 *
 * `size="sm"` tightens padding and gaps for dense dashboards.
 */
type CardProps = React.ComponentProps<"div"> & {
  size?: "default" | "sm"
}

function Card({ className, size = "default", ...props }: CardProps) {
  return (
    <div
      data-slot="card"
      data-size={size}
      className={cn(
        "group/card flex flex-col gap-6 rounded-xl border bg-card py-6 text-card-foreground shadow-sm data-[size=sm]:gap-4 data-[size=sm]:py-4",
        className
      )}
      {...props}
    />
  )
}

type CardHeaderProps = React.ComponentProps<"div">

function CardHeader({ className, ...props }: CardHeaderProps) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 group-data-[size=sm]/card:px-4 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6 group-data-[size=sm]/card:[.border-b]:pb-4",
        className
      )}
      {...props}
    />
  )
}

type CardTitleProps = React.ComponentProps<"div">

/**
 * A `div`, like shadcn's - the right heading level depends on the page. Pass
 * `role="heading" aria-level={n}` (or put an `<hN>` inside) so the card shows
 * up in the document outline.
 */
function CardTitle({ className, ...props }: CardTitleProps) {
  return (
    <div
      data-slot="card-title"
      className={cn("leading-none font-semibold", className)}
      {...props}
    />
  )
}

type CardDescriptionProps = React.ComponentProps<"div">

function CardDescription({ className, ...props }: CardDescriptionProps) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

type CardActionProps = React.ComponentProps<"div">

/** Top-right slot in the header, e.g. a menu or "View all" link. */
function CardAction({ className, ...props }: CardActionProps) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  )
}

type CardContentProps = React.ComponentProps<"div">

function CardContent({ className, ...props }: CardContentProps) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-6 group-data-[size=sm]/card:px-4", className)}
      {...props}
    />
  )
}

type CardFooterProps = React.ComponentProps<"div">

function CardFooter({ className, ...props }: CardFooterProps) {
  return (
    <div
      data-slot="card-footer"
      className={cn(
        "flex items-center px-6 group-data-[size=sm]/card:px-4 [.border-t]:pt-6 group-data-[size=sm]/card:[.border-t]:pt-4",
        className
      )}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardContent,
  CardFooter,
  type CardProps,
  type CardHeaderProps,
  type CardTitleProps,
  type CardDescriptionProps,
  type CardActionProps,
  type CardContentProps,
  type CardFooterProps,
}
