"use client"

import type * as React from "react"
import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import type { VariantProps } from "class-variance-authority"
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  MoreHorizontalIcon,
} from "lucide-react"

import {
  usePagination,
  type UsePaginationOptions,
} from "@/registry/fujin/lib/pagination"
import { cn } from "@/registry/fujin/lib/utils"
import { buttonVariants } from "@/registry/fujin/ui/button"

/*
 * Differences from shadcn/ui's pagination, all deliberate:
 * - `PaginationControls` renders a real page window (first/last pages,
 *   siblings, ellipses) from `getPageWindow`; shadcn leaves that to you.
 * - Links are `<a>` elements rendered through Base UI's `useRender`, not
 *   Base UI `Button` - `Button` puts `role="button"` on a link, which would
 *   announce page links as buttons.
 * - Previous/Next keep their visible text as the accessible name (shadcn's
 *   `aria-label="Go to previous page"` overrides it); the text becomes
 *   screen-reader-only below `sm`.
 * - Disabled ends use `aria-disabled` instead of `disabled`, so a focused
 *   "Next" button keeps focus when it reaches the last page.
 *
 * A client module (it imports `buttonVariants` from one). From a Server
 * Component, `getHref`/`renderLink` cannot cross the boundary - compute the
 * window with `getPageWindow` (server-safe, in lib/pagination) and render the
 * low-level parts with plain `href`s instead.
 */

type PaginationProps = React.ComponentProps<"nav">

function Pagination({
  className,
  "aria-label": ariaLabel = "Pagination",
  ...props
}: PaginationProps) {
  return (
    <nav
      data-slot="pagination"
      aria-label={ariaLabel}
      className={cn("mx-auto flex w-full justify-center", className)}
      {...props}
    />
  )
}

type PaginationContentProps = React.ComponentProps<"ul">

function PaginationContent({ className, ...props }: PaginationContentProps) {
  return (
    <ul
      data-slot="pagination-content"
      className={cn(
        "flex flex-wrap items-center justify-center gap-1",
        className
      )}
      {...props}
    />
  )
}

type PaginationItemProps = React.ComponentProps<"li">

function PaginationItem(props: PaginationItemProps) {
  return <li data-slot="pagination-item" {...props} />
}

type PaginationLinkProps = useRender.ComponentProps<"a"> &
  Pick<VariantProps<typeof buttonVariants>, "size"> & {
    /** Marks the current page: outline style and `aria-current="page"`. */
    isActive?: boolean
    /**
     * Sets `aria-disabled`, drops `href` and ignores clicks. A rendered
     * `<button>` stays focusable; an `<a>` without `href` does not.
     */
    disabled?: boolean
  }

/**
 * An `<a>` by default. Pass `render={<Link href="?page=2" />}` for a router
 * link, or `render={<button type="button" />}` for client-side paging.
 */
function PaginationLink({
  className,
  render,
  size = "icon",
  isActive = false,
  disabled = false,
  href,
  onClick,
  ...props
}: PaginationLinkProps) {
  return useRender({
    defaultTagName: "a",
    render,
    state: { slot: "pagination-link", active: isActive, disabled },
    props: mergeProps<"a">(
      {
        href: disabled ? undefined : href,
        "aria-current": isActive ? "page" : undefined,
        "aria-disabled": disabled || undefined,
        onClick: (event) => {
          if (disabled) {
            event.preventDefault()
            return
          }
          onClick?.(event)
        },
        className: cn(
          buttonVariants({ variant: isActive ? "outline" : "ghost", size }),
          // Room for 3-4 digit page numbers without changing width per digit.
          size === "icon" && "w-auto min-w-9 px-2 tabular-nums",
          "aria-disabled:pointer-events-none aria-disabled:opacity-50",
          className
        ),
      },
      props
    ),
  })
}

type PaginationPreviousProps = PaginationLinkProps & {
  /** Visible text, also the accessible name. */
  label?: React.ReactNode
}

function PaginationPrevious({
  className,
  label = "Previous",
  children,
  ...props
}: PaginationPreviousProps) {
  return (
    <PaginationLink
      data-slot="pagination-previous"
      size="default"
      className={cn("gap-1 px-2.5 has-[>svg]:px-2.5", className)}
      {...props}
    >
      {children ?? (
        <>
          <ChevronLeftIcon aria-hidden />
          <span className="max-sm:sr-only">{label}</span>
        </>
      )}
    </PaginationLink>
  )
}

type PaginationNextProps = PaginationPreviousProps

function PaginationNext({
  className,
  label = "Next",
  children,
  ...props
}: PaginationNextProps) {
  return (
    <PaginationLink
      data-slot="pagination-next"
      size="default"
      className={cn("gap-1 px-2.5 has-[>svg]:px-2.5", className)}
      {...props}
    >
      {children ?? (
        <>
          <span className="max-sm:sr-only">{label}</span>
          <ChevronRightIcon aria-hidden />
        </>
      )}
    </PaginationLink>
  )
}

type PaginationEllipsisProps = React.ComponentProps<"span"> & {
  /** Screen-reader text. */
  label?: string
}

function PaginationEllipsis({
  className,
  label = "More pages",
  ...props
}: PaginationEllipsisProps) {
  return (
    <span
      data-slot="pagination-ellipsis"
      className={cn(
        "flex size-9 items-center justify-center text-muted-foreground",
        className
      )}
      {...props}
    >
      <MoreHorizontalIcon aria-hidden className="size-4" />
      <span className="sr-only">{label}</span>
    </span>
  )
}

type PaginationControlsLabels = {
  previous?: React.ReactNode
  next?: React.ReactNode
  /** Accessible name of a page button. Must contain the number. */
  page?: (page: number) => string
  ellipsis?: string
}

type PaginationControlsProps = Omit<PaginationProps, "children"> &
  UsePaginationOptions & {
    /** Link mode: the URL for a page. Takes precedence over `onPageChange`. */
    getHref?: (page: number) => string
    /** Link mode: the element to render, e.g. `(href) => <Link href={href} />`. */
    renderLink?: (href: string, page: number) => React.ReactElement
    labels?: PaginationControlsLabels
  }

/**
 * The whole control: Previous, a page window with ellipses, Next.
 * Button mode (default): controlled with `page` + `onPageChange`, or
 * uncontrolled with `defaultPage`. Link mode (`getHref`): pass `page` from
 * the URL; clicks navigate instead of calling `onPageChange`.
 */
function PaginationControls({
  page: pageProp,
  defaultPage,
  pageCount: pageCountProp,
  onPageChange,
  siblings,
  boundaries,
  getHref,
  renderLink,
  labels,
  ...props
}: PaginationControlsProps) {
  const { page, items, canPrev, canNext, setPage } = usePagination({
    page: pageProp,
    defaultPage,
    pageCount: pageCountProp,
    onPageChange,
    siblings,
    boundaries,
  })
  const pageLabel = labels?.page ?? ((n: number) => `Page ${n}`)

  // Props for one target page. Link mode renders the caller's link element
  // (or a plain <a>); a disabled end in link mode stays an <a> with no href,
  // because a rendered router link would keep its own href. Button mode
  // renders a <button> so that a focused control keeps focus as the window
  // shifts around it.
  const target = (to: number, disabled = false) => {
    if (!getHref) {
      return {
        disabled,
        render: <button type="button" />,
        onClick: () => setPage(to),
      }
    }
    if (disabled) return { disabled }
    const href = getHref(to)
    return { href, render: renderLink?.(href, to) }
  }

  return (
    <Pagination data-slot="pagination-controls" {...props}>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            label={labels?.previous}
            {...target(page - 1, !canPrev)}
          />
        </PaginationItem>
        {items.map((item, index) =>
          item === "ellipsis" ? (
            <PaginationItem key={`ellipsis-${index}`}>
              <PaginationEllipsis label={labels?.ellipsis} />
            </PaginationItem>
          ) : (
            // Keyed by page number, not position: the clicked page keeps
            // focus when the window re-centres on it.
            <PaginationItem key={item}>
              <PaginationLink
                isActive={item === page}
                aria-label={pageLabel(item)}
                {...target(item)}
              >
                {item}
              </PaginationLink>
            </PaginationItem>
          )
        )}
        <PaginationItem>
          <PaginationNext
            label={labels?.next}
            {...target(page + 1, !canNext)}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}

export {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
  PaginationControls,
  type PaginationProps,
  type PaginationContentProps,
  type PaginationItemProps,
  type PaginationLinkProps,
  type PaginationPreviousProps,
  type PaginationNextProps,
  type PaginationEllipsisProps,
  type PaginationControlsProps,
  type PaginationControlsLabels,
}
