"use client"

import * as React from "react"

import type { SelectionDescriptor } from "./types"

export const EMPTY_SELECTION: SelectionDescriptor = { type: "include", ids: [] }

export function isRowSelected(
  selection: SelectionDescriptor,
  rowId: string
): boolean {
  return selection.type === "include"
    ? selection.ids.includes(rowId)
    : !selection.ids.includes(rowId)
}

/** How many rows the descriptor covers; `total` is the current match count. */
export function selectedCount(
  selection: SelectionDescriptor,
  total = selection.type === "exclude" ? selection.total : 0
): number {
  return selection.type === "include"
    ? selection.ids.length
    : Math.max(total - selection.ids.length, 0)
}

/** Turns `ids` on or off, in either descriptor shape. */
export function setRowsSelected(
  selection: SelectionDescriptor,
  ids: readonly string[],
  selected: boolean
): SelectionDescriptor {
  const touched = new Set(ids)
  // "include" lists what is on; "exclude" lists what is off.
  const listed = selection.type === "include" ? selected : !selected
  const rest = selection.ids.filter((id) => !touched.has(id))
  const next = listed ? [...rest, ...ids] : rest
  return selection.type === "include"
    ? { type: "include", ids: next }
    : { type: "exclude", ids: next, total: selection.total }
}

/** Ids between two rows of the page, inclusive, in page order (Shift-click). */
export function idsBetween(
  orderedIds: readonly string[],
  anchorId: string,
  targetId: string
): string[] {
  const a = orderedIds.indexOf(anchorId)
  const b = orderedIds.indexOf(targetId)
  if (a === -1 || b === -1) return [targetId]
  const [from, to] = a < b ? [a, b] : [b, a]
  return orderedIds.slice(from, to + 1)
}

export type UseDataTableSelectionOptions = {
  /** Row ids on the current page, in display order. */
  pageRowIds: readonly string[]
  /** Rows matching the current query across all pages. */
  totalRowCount: number
  value?: SelectionDescriptor
  onChange?: (selection: SelectionDescriptor) => void
}

/**
 * Shopify-style selection. An `include` set until "Select all N" is chosen;
 * then `exclude`: every row matching the query except the ones unchecked
 * afterwards. `useDataTable` builds this for you and clears it whenever the
 * query changes, since "all matching" would otherwise mean a different set.
 */
export function useDataTableSelection({
  pageRowIds,
  totalRowCount,
  value,
  onChange,
}: UseDataTableSelectionOptions) {
  const [internal, setInternal] =
    React.useState<SelectionDescriptor>(EMPTY_SELECTION)
  const isControlled = value !== undefined
  const selection = isControlled ? value : internal

  // Two changes in one event (Shift-click, then the row's own handler)
  // resolve against each other, not the same stale render-time value.
  const latest = React.useRef(selection)
  React.useEffect(() => {
    latest.current = selection
  }, [selection])
  const anchor = React.useRef<string | null>(null)

  const set = React.useCallback(
    (
      next:
        | SelectionDescriptor
        | ((prev: SelectionDescriptor) => SelectionDescriptor)
    ) => {
      const resolved = typeof next === "function" ? next(latest.current) : next
      latest.current = resolved
      if (!isControlled) setInternal(resolved)
      onChange?.(resolved)
    },
    [isControlled, onChange]
  )

  const count = selectedCount(selection, totalRowCount)
  const isAllPageRowsSelected =
    pageRowIds.length > 0 &&
    pageRowIds.every((id) => isRowSelected(selection, id))
  const isSomePageRowsSelected =
    !isAllPageRowsSelected &&
    pageRowIds.some((id) => isRowSelected(selection, id))
  const isAllMatchingSelected =
    selection.type === "exclude" && selection.ids.length === 0

  const toggleRow = React.useCallback(
    (rowId: string, selected: boolean, options?: { range?: boolean }) => {
      const ids =
        options?.range && anchor.current
          ? idsBetween(pageRowIds, anchor.current, rowId)
          : [rowId]
      anchor.current = rowId
      set((prev) => setRowsSelected(prev, ids, selected))
    },
    [pageRowIds, set]
  )

  const togglePage = React.useCallback(
    (selected: boolean) => {
      anchor.current = null
      set((prev) => setRowsSelected(prev, pageRowIds, selected))
    },
    [pageRowIds, set]
  )

  /** "Select all N": every row matching the query, nothing excluded yet. */
  const selectAllMatching = React.useCallback(() => {
    set({ type: "exclude", ids: [], total: totalRowCount })
  }, [set, totalRowCount])

  const clear = React.useCallback(() => {
    anchor.current = null
    set(EMPTY_SELECTION)
  }, [set])

  return {
    selection,
    selectedCount: count,
    hasSelection: count > 0,
    isRowSelected: (rowId: string) => isRowSelected(selection, rowId),
    isAllPageRowsSelected,
    isSomePageRowsSelected,
    isAllMatchingSelected,
    toggleRow,
    togglePage,
    selectAllMatching,
    clear,
  }
}

export type UseDataTableSelectionResult = ReturnType<
  typeof useDataTableSelection
>
