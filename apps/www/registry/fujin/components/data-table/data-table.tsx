"use client"

import type * as React from "react"
import type { ReactTable, RowData } from "@tanstack/react-table"

import type { DataTableFeatures } from "@/registry/fujin/lib/data-table/features"
import type { UseDataTableSelectionResult } from "@/registry/fujin/lib/data-table/use-data-table-selection"
import { cn } from "@/registry/fujin/lib/utils"
import { Checkbox } from "@/registry/fujin/ui/checkbox"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/registry/fujin/ui/table"

import {
  DataTableSelectionBar,
  type DataTableBulkAction,
} from "./data-table-selection-bar"
import { DataTablePagination } from "./data-table-pagination"
import {
  DataTableEmptyState,
  DataTableErrorState,
  DataTableLoadingState,
} from "./data-table-states"
import { DataTableToolbar } from "./data-table-toolbar"

export type DataTableProps<TData extends RowData> = {
  /** Built with `useDataTable` - construction is the caller's, rendering is this component's. */
  table: ReactTable<DataTableFeatures, TData>
  /** Built with `useDataTableSelection`. Omit to render without row selection at all. */
  selection?: UseDataTableSelectionResult
  /** Shown in the selection bar - first 2 inline, the rest under "More". */
  bulkActions?: DataTableBulkAction[]
  onExport?: () => void
  exporting?: boolean
  /**
   * Pixels (or any CSS length) the sticky header and selection bar sit below
   * - set this to a fixed site nav's height. Also applied as `scroll-margin-
   * top` internally so a focused cell is never hidden under it (WCAG 2.4.11).
   */
  stickyOffset?: number | string
  loading?: boolean
  error?: { message?: string; onRetry?: () => void } | null
  emptyState?: { title?: string; description?: string }
  /** Set to `false` to render without the pagination footer entirely. */
  pagination?: boolean
  pageSizeOptions?: number[]
  className?: string
}

/**
 * The markup half of data-table: no business logic here, it all comes from
 * the `table` and `selection` instances passed in. See docs/data-table-plan.md
 * for the full architecture - `useDataTable` + `useDataTableSelection` build
 * what this renders.
 */
function DataTable<TData extends RowData>({
  table,
  selection,
  bulkActions = [],
  onExport,
  exporting,
  stickyOffset = 0,
  loading = false,
  error = null,
  emptyState,
  pagination = true,
  pageSizeOptions,
  className,
}: DataTableProps<TData>) {
  const rows = table.getRowModel().rows
  const columnCount = table.getVisibleLeafColumns().length + (selection ? 1 : 0)
  const pageRowIds = rows.map((row) => row.id)
  const hasSelection = Boolean(selection) && selection!.selectedCount > 0
  const totalRowCount = table.getRowCount()

  const style = {
    "--fujin-data-table-offset":
      typeof stickyOffset === "number" ? `${stickyOffset}px` : stickyOffset,
  } as React.CSSProperties

  return (
    <div
      data-slot="data-table"
      className={cn("rounded-md border", className)}
      style={style}
    >
      <DataTableToolbar
        table={table}
        onExport={onExport}
        exporting={exporting}
      />
      <Table>
        <TableHeader sticky>
          {hasSelection ? (
            <TableRow className="hover:bg-transparent">
              <TableHead colSpan={columnCount} className="h-auto p-0">
                <DataTableSelectionBar
                  selection={selection!.selection}
                  selectedCount={selection!.selectedCount}
                  showSelectAllBanner={
                    selection!.isAllPageRowsSelected &&
                    totalRowCount > pageRowIds.length
                  }
                  totalRowCount={totalRowCount}
                  allMatchingSelected={
                    selection!.selection.type === "exclude" &&
                    selection!.selection.ids.length === 0
                  }
                  onSelectAllMatching={() =>
                    selection!.selectAllMatching(totalRowCount)
                  }
                  onClear={selection!.clear}
                  actions={bulkActions}
                />
              </TableHead>
            </TableRow>
          ) : (
            table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {selection ? (
                  <TableHead className="w-10">
                    <Checkbox
                      checked={selection.isAllPageRowsSelected}
                      indeterminate={selection.isSomePageRowsSelected}
                      onCheckedChange={(checked) =>
                        selection.togglePage(checked)
                      }
                      aria-label="Select all rows on this page"
                    />
                  </TableHead>
                ) : null}
                {headerGroup.headers.map((header) => {
                  const sorted = header.column.getIsSorted()
                  return (
                    <TableHead
                      key={header.id}
                      aria-sort={
                        !header.column.getCanSort()
                          ? undefined
                          : sorted === "asc"
                            ? "ascending"
                            : sorted === "desc"
                              ? "descending"
                              : "none"
                      }
                    >
                      {header.isPlaceholder ? null : (
                        <table.FlexRender header={header} />
                      )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))
          )}
        </TableHeader>
        <TableBody aria-busy={loading || undefined}>
          {loading ? (
            <DataTableLoadingState colSpan={columnCount} />
          ) : error ? (
            <DataTableErrorState
              colSpan={columnCount}
              message={error.message}
              onRetry={error.onRetry}
            />
          ) : rows.length === 0 ? (
            <DataTableEmptyState
              colSpan={columnCount}
              title={emptyState?.title}
              description={emptyState?.description}
            />
          ) : (
            rows.map((row) => (
              <TableRow
                key={row.id}
                data-selected={selection?.isRowSelected(row.id) || undefined}
              >
                {selection ? (
                  <TableCell>
                    <Checkbox
                      checked={selection.isRowSelected(row.id)}
                      onCheckedChange={(checked) =>
                        selection.toggleRow(row.id, checked)
                      }
                      aria-label="Select row"
                    />
                  </TableCell>
                ) : null}
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    <table.FlexRender cell={cell} />
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      {pagination ? (
        <DataTablePagination table={table} pageSizeOptions={pageSizeOptions} />
      ) : null}
    </div>
  )
}

export { DataTable }
