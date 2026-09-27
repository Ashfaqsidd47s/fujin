"use client"

import * as React from "react"
import { useTable, type RowData } from "@tanstack/react-table"

import { dataTableFeatures, FILTER_FN_BY_TYPE } from "./features"
import type {
  ColumnFiltersState,
  DataTableColumnDef,
  DataTableMode,
  PaginationState,
  SortingState,
} from "./types"
import { useControllableState } from "./use-controllable-state"

export { dataTableFeatures }

const EMPTY_SORTING: SortingState = []
const EMPTY_FILTERS: ColumnFiltersState = []
const DEFAULT_PAGINATION: PaginationState = { pageIndex: 0, pageSize: 20 }

export type UseDataTableOptions<TData extends RowData> = {
  data: TData[]
  columns: DataTableColumnDef<TData>[]
  /**
   * `"server"` (default) trusts `data` as already sorted/filtered/paginated
   * and expects the `on*Change` callbacks to drive a refetch. `"client"`
   * lets TanStack Table do all three over the full `data` array.
   */
  mode?: DataTableMode
  /**
   * Total row count across all pages. Required in `"server"` mode: without
   * it `table.getPageCount()` is `0` while rows still render, producing a
   * footer that contradicts the visible table.
   */
  rowCount?: number
  /**
   * Stable, globally-unique id per row. Required in `"server"` mode: without
   * it TanStack Table falls back to the row's index within the current page,
   * so every page reuses ids `"0"..."pageSize-1"` and cross-page selection
   * (the "select all N" descriptor) silently corrupts - selecting row 0 on
   * one page appears to select row 0 on every other page too.
   */
  getRowId?: (row: TData, index: number) => string

  sorting?: SortingState
  onSortingChange?: (sorting: SortingState) => void
  enableMultiSort?: boolean

  columnFilters?: ColumnFiltersState
  onColumnFiltersChange?: (filters: ColumnFiltersState) => void

  globalFilter?: string
  onGlobalFilterChange?: (value: string) => void

  pagination?: PaginationState
  onPaginationChange?: (pagination: PaginationState) => void

  columnVisibility?: Record<string, boolean>
  onColumnVisibilityChange?: (visibility: Record<string, boolean>) => void
}

export function useDataTable<TData extends RowData>({
  data,
  columns,
  mode = "server",
  rowCount,
  getRowId,
  sorting: sortingProp,
  onSortingChange,
  enableMultiSort = true,
  columnFilters: columnFiltersProp,
  onColumnFiltersChange,
  globalFilter: globalFilterProp,
  onGlobalFilterChange,
  pagination: paginationProp,
  onPaginationChange,
  columnVisibility: columnVisibilityProp,
  onColumnVisibilityChange,
}: UseDataTableOptions<TData>) {
  const [sorting, setSorting] = useControllableState(
    sortingProp,
    EMPTY_SORTING,
    onSortingChange
  )
  const [columnFilters, setColumnFilters] = useControllableState(
    columnFiltersProp,
    EMPTY_FILTERS,
    onColumnFiltersChange
  )
  const [globalFilter, setGlobalFilter] = useControllableState(
    globalFilterProp,
    "",
    onGlobalFilterChange
  )
  const [pagination, setPagination] = useControllableState(
    paginationProp,
    DEFAULT_PAGINATION,
    onPaginationChange
  )
  const [columnVisibility, setColumnVisibility] = useControllableState(
    columnVisibilityProp,
    {},
    onColumnVisibilityChange
  )

  // Wires each column's `filterFn` from its declared `meta.filter.type`, so
  // an author never has to pick one by hand and can't mismatch it against
  // the value shape the filter UI actually writes (see FILTER_FN_BY_TYPE).
  // An explicit `filterFn` on the column definition always wins.
  const resolvedColumns = React.useMemo(
    () =>
      columns.map((column) => {
        const type = column.meta?.filter?.type
        if (!type || column.filterFn) return column
        return { ...column, filterFn: FILTER_FN_BY_TYPE[type] }
      }),
    [columns]
  )

  const manual = mode === "server"

  if (process.env.NODE_ENV !== "production" && manual) {
    if (!getRowId) {
      console.warn(
        'useDataTable: `getRowId` is required in `mode: "server"` - ' +
          "without it, row ids fall back to their index within the current " +
          "page, and cross-page selection will silently corrupt."
      )
    }
    if (rowCount == null) {
      console.warn(
        'useDataTable: `rowCount` is required in `mode: "server"` - ' +
          "without it, the pagination footer will show 0 pages while rows " +
          "still render."
      )
    }
  }

  const table = useTable({
    features: dataTableFeatures,
    data,
    columns: resolvedColumns,
    getRowId,
    state: {
      sorting,
      columnFilters,
      globalFilter,
      pagination,
      columnVisibility,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    onColumnVisibilityChange: setColumnVisibility,
    enableMultiSort,
    globalFilterFn: "includesString",
    manualSorting: manual,
    manualFiltering: manual,
    manualPagination: manual,
    rowCount: manual ? rowCount : undefined,
  })

  return table
}
