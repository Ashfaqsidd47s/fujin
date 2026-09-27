"use client"

import * as React from "react"
import {
  ArrowDownIcon,
  ArrowUpIcon,
  ChevronsUpDownIcon,
  FilterIcon,
} from "lucide-react"
import type { Column, RowData } from "@tanstack/react-table"

import {
  FILTER_TYPES_WITH_UI,
  type DataTableFeatures,
} from "@/registry/fujin/lib/data-table/features"
import type {
  ActiveFilter,
  FilterOption,
} from "@/registry/fujin/lib/data-table/types"
import { cn } from "@/registry/fujin/lib/utils"

import {
  DataTableColumnFilterPopover,
  useColumnFilterOptions,
} from "./data-table-column-filter-popover"

export type DataTableColumnHeaderProps<TData extends RowData, TValue> = {
  column: Column<DataTableFeatures, TData, TValue>
  title: string
  /**
   * Omit to disable the GitHub-style header click-to-filter popover for this
   * column even when it has `meta.filter` - useful for a column that should
   * only be filterable from the search bar.
   */
  getColumnOptions?: (
    columnId: string,
    query?: string
  ) => Promise<FilterOption[]>
  className?: string
}

/**
 * What you pass as a column's `header`. Sorting is a plain button (click to
 * cycle asc/desc/none, Shift-click to add to a multi-sort - TanStack's
 * default `getToggleSortingHandler` already does both). The `aria-sort`
 * attribute belongs on the `<th>` itself, not here - `data-table`'s own
 * `TableHead` rendering sets it from `column.getIsSorted()`.
 */
function DataTableColumnHeader<TData extends RowData, TValue>({
  column,
  title,
  getColumnOptions,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")

  const filterConfig = column.columnDef.meta?.filter
  const canFilter = Boolean(
    filterConfig &&
    getColumnOptions &&
    FILTER_TYPES_WITH_UI.has(filterConfig.type)
  )
  const isListType =
    filterConfig?.type === "select" || filterConfig?.type === "multi-select"
  const { options, loading } = useColumnFilterOptions(
    column.id,
    query,
    open && canFilter && isListType,
    getColumnOptions ?? (async () => [])
  )

  const filterValue = column.getFilterValue() as
    ActiveFilter["value"] | undefined
  const hasActiveFilter =
    filterValue != null &&
    (!Array.isArray(filterValue) || filterValue.length > 0)

  const canSort = column.getCanSort()
  const sorted = column.getIsSorted()

  return (
    <div
      data-slot="data-table-column-header"
      className={cn("flex items-center gap-1", className)}
    >
      {canSort ? (
        <button
          type="button"
          onClick={column.getToggleSortingHandler()}
          className="flex items-center gap-1 rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span>{title}</span>
          {sorted === "asc" ? (
            <ArrowUpIcon className="size-3.5" />
          ) : sorted === "desc" ? (
            <ArrowDownIcon className="size-3.5" />
          ) : (
            <ChevronsUpDownIcon className="size-3.5 text-muted-foreground" />
          )}
        </button>
      ) : (
        <span>{title}</span>
      )}
      {canFilter ? (
        <DataTableColumnFilterPopover
          label={title}
          type={filterConfig!.type}
          value={filterValue}
          onValueChange={(value) => column.setFilterValue(value)}
          open={open}
          onOpenChange={setOpen}
          query={query}
          onQueryChange={setQuery}
          options={options}
          loading={loading}
          triggerClassName={cn(
            "flex size-6 items-center justify-center rounded-sm text-muted-foreground outline-none hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring",
            hasActiveFilter && "text-foreground"
          )}
        >
          <FilterIcon className="size-3.5" />
        </DataTableColumnFilterPopover>
      ) : null}
    </div>
  )
}

export { DataTableColumnHeader }
