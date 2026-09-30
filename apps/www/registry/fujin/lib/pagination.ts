import * as React from "react"

/*
 * Headless pagination: which page buttons to show, and page state.
 *
 * Deliberately no "use client": `getPageWindow` is pure and safe to call from
 * a Server Component (link-mode pagination rendered on the server). The hook
 * is only usable from client modules, like any hook.
 *
 * Pages are 1-based throughout. TanStack Table's `pageIndex` is 0-based -
 * convert at the boundary (`page = pageIndex + 1`).
 */

export type PageWindowItem = number | "ellipsis"

export type PageWindowOptions = {
  /** Current page, 1-based. Clamped to `[1, pageCount]`. */
  page: number
  /** Total number of pages. `0` yields an empty window. */
  pageCount: number
  /** Pages shown on each side of the current page. */
  siblings?: number
  /** Pages always shown at the start and at the end. */
  boundaries?: number
}

function range(start: number, end: number): number[] {
  const length = Math.max(end - start + 1, 0)
  return Array.from({ length }, (_, index) => start + index)
}

function toCount(value: number, fallback: number): number {
  return Number.isFinite(value) ? Math.max(Math.floor(value), 0) : fallback
}

/**
 * The page numbers to render, with `"ellipsis"` where pages are skipped.
 *
 * Once `pageCount` exceeds the window, the result always has exactly
 * `2 * boundaries + 2 * siblings + 3` items, so the controls keep their width
 * as the current page moves. An ellipsis never stands in for a single page -
 * that page is shown instead, since it costs the same space.
 *
 * getPageWindow({ page: 1, pageCount: 20 })  // [1, 2, 3, 4, 5, "ellipsis", 20]
 * getPageWindow({ page: 10, pageCount: 20 }) // [1, "ellipsis", 9, 10, 11, "ellipsis", 20]
 * getPageWindow({ page: 20, pageCount: 20 }) // [1, "ellipsis", 16, 17, 18, 19, 20]
 */
export function getPageWindow({
  page,
  pageCount,
  siblings = 1,
  boundaries = 1,
}: PageWindowOptions): PageWindowItem[] {
  const count = toCount(pageCount, 0)
  const s = toCount(siblings, 1)
  const b = toCount(boundaries, 1)
  if (count === 0) return []

  // Every slot: both boundary runs, the sibling run, the current page and
  // two ellipses. When everything fits there is nothing to elide.
  const slots = 2 * b + 2 * s + 3
  if (count <= slots) return range(1, count)

  const current = Math.min(Math.max(Math.round(page) || 1, 1), count)
  // Length of the run on the side without an ellipsis: everything but the
  // other boundary run and the one ellipsis.
  const run = slots - b - 1

  // Near the start: the left gap would hide at most one page, so show it.
  if (current - s <= b + 2) {
    return [...range(1, run), "ellipsis", ...range(count - b + 1, count)]
  }
  // Near the end, symmetrically.
  if (current + s >= count - b - 1) {
    return [...range(1, b), "ellipsis", ...range(count - run + 1, count)]
  }
  return [
    ...range(1, b),
    "ellipsis",
    ...range(current - s, current + s),
    "ellipsis",
    ...range(count - b + 1, count),
  ]
}

export type UsePaginationOptions = {
  /** Total number of pages. */
  pageCount: number
  /** Controlled current page, 1-based. */
  page?: number
  /** Initial page when uncontrolled. */
  defaultPage?: number
  /** Called with the requested page (already clamped to `[1, pageCount]`). */
  onPageChange?: (page: number) => void
  siblings?: number
  boundaries?: number
}

export type UsePaginationReturn = {
  /** Current page, clamped to `[1, max(pageCount, 1)]`. */
  page: number
  pageCount: number
  /** Output of `getPageWindow` for the current page. */
  items: PageWindowItem[]
  canPrev: boolean
  canNext: boolean
  setPage: (page: number) => void
  prev: () => void
  next: () => void
}

/**
 * Page state for pagination controls. Controlled when `page` is passed,
 * uncontrolled (`defaultPage`) otherwise; `onPageChange` fires either way.
 */
export function usePagination({
  pageCount,
  page: pageProp,
  defaultPage = 1,
  onPageChange,
  siblings,
  boundaries,
}: UsePaginationOptions): UsePaginationReturn {
  const [uncontrolledPage, setUncontrolledPage] = React.useState(defaultPage)
  const isControlled = pageProp !== undefined
  const count = toCount(pageCount, 0)
  const lastPage = Math.max(count, 1)
  // Clamp on read, so a shrinking `pageCount` (e.g. after filtering) never
  // shows a page that no longer exists. The owner's state is not rewritten.
  const page = Math.min(
    Math.max(Math.round(isControlled ? pageProp : uncontrolledPage) || 1, 1),
    lastPage
  )

  const setPage = React.useCallback(
    (next: number) => {
      const clamped = Math.min(Math.max(Math.round(next) || 1, 1), lastPage)
      if (clamped === page) return
      if (!isControlled) setUncontrolledPage(clamped)
      onPageChange?.(clamped)
    },
    [isControlled, lastPage, onPageChange, page]
  )

  const items = React.useMemo(
    () => getPageWindow({ page, pageCount: count, siblings, boundaries }),
    [page, count, siblings, boundaries]
  )

  return {
    page,
    pageCount: count,
    items,
    canPrev: page > 1,
    canNext: page < count,
    setPage,
    prev: () => setPage(page - 1),
    next: () => setPage(page + 1),
  }
}
