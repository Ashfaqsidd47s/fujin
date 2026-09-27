"use client"

import * as React from "react"

import type { SelectionDescriptor } from "./types"

export type UseDataTableSelectionOptions = {
  /** Row ids currently loaded for this page, in display order. */
  pageRowIds: string[]
  value?: SelectionDescriptor
  onChange?: (selection: SelectionDescriptor) => void
}

const EMPTY_SELECTION: SelectionDescriptor = { type: "include", ids: [] }

/**
 * Shopify-style selection: an "include" set until "select all N" is chosen,
 * at which point it flips to "exclude" - every row matching the current
 * filters except whatever gets unchecked afterwards. `selectedCount` and
 * every helper here understand both shapes so callers never branch on
 * `selection.type` themselves.
 */
export function useDataTableSelection({
  pageRowIds,
  value,
  onChange,
}: UseDataTableSelectionOptions) {
  const [internal, setInternal] =
    React.useState<SelectionDescriptor>(EMPTY_SELECTION)
  const isControlled = value !== undefined
  const selection = isControlled ? value : internal

  // Mirrors the latest resolved selection so two toggles in the same event
  // handler resolve against each other, not against the same stale
  // render-time `selection` closure. Written by `set` itself (event-handler
  // time) and mirrored from the latest render in an effect - never during
  // render, which React refs must not be used for.
  const selectionRef = React.useRef(selection)
  React.useEffect(() => {
    selectionRef.current = selection
  }, [selection])

  const set = React.useCallback(
    (
      next:
        | SelectionDescriptor
        | ((prev: SelectionDescriptor) => SelectionDescriptor)
    ) => {
      const resolved =
        typeof next === "function" ? next(selectionRef.current) : next
      selectionRef.current = resolved
      if (!isControlled) setInternal(resolved)
      onChange?.(resolved)
    },
    [isControlled, onChange]
  )

  const isRowSelected = React.useCallback(
    (rowId: string) =>
      selection.type === "include"
        ? selection.ids.includes(rowId)
        : !selection.ids.includes(rowId),
    [selection]
  )

  const selectedCount =
    selection.type === "include"
      ? selection.ids.length
      : Math.max(selection.total - selection.ids.length, 0)

  const isAllPageRowsSelected =
    pageRowIds.length > 0 && pageRowIds.every(isRowSelected)
  const isSomePageRowsSelected =
    !isAllPageRowsSelected && pageRowIds.some(isRowSelected)

  const toggleRow = React.useCallback(
    (rowId: string, checked: boolean) => {
      set((prev) => {
        if (prev.type === "include") {
          const ids = checked
            ? [...new Set([...prev.ids, rowId])]
            : prev.ids.filter((id) => id !== rowId)
          return { type: "include", ids }
        }
        const ids = checked
          ? prev.ids.filter((id) => id !== rowId)
          : [...new Set([...prev.ids, rowId])]
        return { type: "exclude", ids, total: prev.total }
      })
    },
    [set]
  )

  const togglePage = React.useCallback(
    (checked: boolean) => {
      set((prev) => {
        if (prev.type === "include") {
          const ids = checked
            ? [...new Set([...prev.ids, ...pageRowIds])]
            : prev.ids.filter((id) => !pageRowIds.includes(id))
          return { type: "include", ids }
        }
        const ids = checked
          ? prev.ids.filter((id) => !pageRowIds.includes(id))
          : [...new Set([...prev.ids, ...pageRowIds])]
        return { type: "exclude", ids, total: prev.total }
      })
    },
    [pageRowIds, set]
  )

  /** "Select all {total} items" - every row matching the filters, nothing excluded yet. */
  const selectAllMatching = React.useCallback(
    (total: number) => set({ type: "exclude", ids: [], total }),
    [set]
  )

  const clear = React.useCallback(
    () => set({ type: "include", ids: [] }),
    [set]
  )

  return {
    selection,
    selectedCount,
    isRowSelected,
    isAllPageRowsSelected,
    isSomePageRowsSelected,
    toggleRow,
    togglePage,
    selectAllMatching,
    clear,
  }
}

export type UseDataTableSelectionResult = ReturnType<
  typeof useDataTableSelection
>
