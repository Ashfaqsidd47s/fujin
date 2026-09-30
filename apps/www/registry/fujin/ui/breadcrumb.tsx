import type * as React from "react"
import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { ChevronRightIcon, MoreHorizontalIcon } from "lucide-react"

import { cn } from "@/registry/fujin/lib/utils"

/*
 * Plain semantic HTML: <nav> > <ol> > <li>, following the APG breadcrumb
 * pattern. No "use client" - Base UI's `useRender` skips its hooks on the
 * server, so the whole trail can render in a Server Component.
 *
 * Differences from shadcn/ui's breadcrumb:
 * - `BreadcrumbPage` is a plain <span aria-current="page">. shadcn adds
 *   `role="link" aria-disabled="true"`, which announces a link that isn't one.
 * - `BreadcrumbEllipsis` is not `aria-hidden`, so its "More" text is read.
 * - Links are at least 24px tall (WCAG 2.5.8) and get a solid focus ring.
 */

type BreadcrumbProps = React.ComponentProps<"nav">

function Breadcrumb({
  "aria-label": ariaLabel = "Breadcrumb",
  ...props
}: BreadcrumbProps) {
  return <nav data-slot="breadcrumb" aria-label={ariaLabel} {...props} />
}

type BreadcrumbListProps = React.ComponentProps<"ol">

function BreadcrumbList({ className, ...props }: BreadcrumbListProps) {
  return (
    <ol
      data-slot="breadcrumb-list"
      className={cn(
        "flex flex-wrap items-center gap-1.5 text-sm break-words text-muted-foreground sm:gap-2",
        className
      )}
      {...props}
    />
  )
}

type BreadcrumbItemProps = React.ComponentProps<"li">

function BreadcrumbItem({ className, ...props }: BreadcrumbItemProps) {
  return (
    <li
      data-slot="breadcrumb-item"
      className={cn("inline-flex items-center gap-1.5", className)}
      {...props}
    />
  )
}

type BreadcrumbLinkProps = useRender.ComponentProps<"a">

/** An `<a>` by default. Pass `render={<Link href="/docs" />}` for a router link. */
function BreadcrumbLink({ className, render, ...props }: BreadcrumbLinkProps) {
  return useRender({
    defaultTagName: "a",
    render,
    state: { slot: "breadcrumb-link" },
    props: mergeProps<"a">(
      {
        className: cn(
          "inline-flex min-h-6 items-center rounded-sm transition-colors outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          className
        ),
      },
      props
    ),
  })
}

type BreadcrumbPageProps = React.ComponentProps<"span">

function BreadcrumbPage({ className, ...props }: BreadcrumbPageProps) {
  return (
    <span
      data-slot="breadcrumb-page"
      aria-current="page"
      className={cn("font-normal text-foreground", className)}
      {...props}
    />
  )
}

type BreadcrumbSeparatorProps = React.ComponentProps<"li">

/** Decorative. Defaults to a chevron; pass children for a custom glyph. */
function BreadcrumbSeparator({
  children,
  className,
  ...props
}: BreadcrumbSeparatorProps) {
  return (
    <li
      data-slot="breadcrumb-separator"
      role="presentation"
      aria-hidden="true"
      className={cn("[&>svg]:size-3.5", className)}
      {...props}
    >
      {children ?? <ChevronRightIcon />}
    </li>
  )
}

type BreadcrumbEllipsisProps = React.ComponentProps<"span"> & {
  /** Screen-reader text. */
  label?: string
}

/**
 * Stands in for collapsed levels. Not interactive by itself - put it inside
 * a menu trigger so the hidden levels stay reachable.
 */
function BreadcrumbEllipsis({
  className,
  label = "More",
  ...props
}: BreadcrumbEllipsisProps) {
  return (
    <span
      data-slot="breadcrumb-ellipsis"
      className={cn("flex size-6 items-center justify-center", className)}
      {...props}
    >
      <MoreHorizontalIcon aria-hidden className="size-4" />
      <span className="sr-only">{label}</span>
    </span>
  )
}

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
  type BreadcrumbProps,
  type BreadcrumbListProps,
  type BreadcrumbItemProps,
  type BreadcrumbLinkProps,
  type BreadcrumbPageProps,
  type BreadcrumbSeparatorProps,
  type BreadcrumbEllipsisProps,
}
