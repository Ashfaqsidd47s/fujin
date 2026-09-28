"use client"

import * as React from "react"
import type { Row, RowData } from "@tanstack/react-table"

import type { DataTableFeatures } from "@/registry/fujin/lib/data-table/features"
import type {
  BulkAction,
  DataTableView,
  RowAction,
} from "@/registry/fujin/lib/data-table/types"
import type { DataTableInstance } from "@/registry/fujin/lib/data-table/use-data-table"
import { useDataTableViews } from "@/registry/fujin/lib/data-table/use-data-table-views"
import { cn } from "@/registry/fujin/lib/utils"
import { Button } from "@/registry/fujin/ui/button"
import { Checkbox } from "@/registry/fujin/ui/checkbox"

import { DataTableBulkActions } from "./data-table-bulk-actions"
import { DataTableColumnHeader } from "./data-table-column-header"
import { DataTableFilterBar } from "./data-table-filter-bar"
import { DataTablePagination } from "./data-table-pagination"
import { DataTableRowActions } from "./data-table-row-actions"
import {
  DataTableEmptyState,
  DataTableErrorState,
  DataTableLoadingState,
} from "./data-table-states"

export type DataTableProps<TData extends RowData> = {
  /** Built with `useDataTable`: that hook holds the state, this component renders it. */
  table: DataTableInstance<TData>

  /* Toolbar ---------------------------------------------------------------- */
  /** Show the search and filter bar. Default true. */
  toolbar?: boolean
  /** `false` turns off free-text search (the bar then only adds filters). */
  search?: false | { placeholder?: string; label?: string }
  /** Built-in views ("All", "Active", ...), shown in the menu at the start of the bar. */
  views?: readonly DataTableView[]
  /** Saved views, controlled (store them on your server to share them). Default: this browser, under the table's `tableId`. */
  savedViews?: readonly DataTableView[]
  onSavedViewsChange?: (views: DataTableView[]) => void
  /** Show the sort and columns panel. Default true. */
  displayOptions?: boolean
  /** Extra controls at the end of the toolbar: Export, a primary action. */
  toolbarActions?: React.ReactNode

  /* Rows ------------------------------------------------------------------- */
  /** Checkbox column, Shift-click ranges, bulk actions. Default: when `bulkActions` are given. */
  selectable?: boolean
  bulkActions?: readonly BulkAction<TData>[]
  /** Offer "Select all N" across pages. Default true. */
  selectAllMatching?: boolean
  /** The "..." menu in the last column. */
  rowActions?: readonly RowAction<TData>[]
  /** Row click (open the record). While rows are selected, a click toggles selection instead. */
  onRowClick?: (row: TData) => void
  /** Accessible name of a row, for "Select {name}" and "Actions for {name}". Default: its id. */
  getRowLabel?: (row: TData) => string
  /** Nouns for copy: "12 products selected". Default item / items. */
  resourceName?: { singular: string; plural: string }

  /* States ----------------------------------------------------------------- */
  /** First load: skeleton rows. */
  loading?: boolean
  /** Background refetch: a thin progress bar; rows stay readable. */
  fetching?: boolean
  error?: { message?: string; onRetry?: () => void } | null
  /** Shown when nothing matches (filtered) or there is no data at all. */
  emptyState?: {
    title?: string
    description?: string
    action?: React.ReactNode
  }

  /* Layout ----------------------------------------------------------------- */
  /** Show the pagination footer. Default: when the table paginates. */
  pagination?: boolean
  pageSizeOptions?: readonly number[]
  /**
   * The toolbar sticks to the viewport this far from the top (a fixed site
   * header's height). Default 0.
   */
  stickyOffset?: number | string
  /** Caps the table's height; rows then scroll under a sticky header row. */
  maxHeight?: number | string
  className?: string
}

const SELECT_CELL =
  "sticky left-0 z-[2] w-10 min-w-10 max-w-10 px-3 text-center"
const HEAD_CELL =
  "h-10 border-b bg-background px-3 text-left align-middle text-sm font-medium whitespace-nowrap text-muted-foreground"
const BODY_CELL =
  "border-b bg-background px-3 py-2.5 align-middle whitespace-nowrap group-last/row:border-b-0 group-hover/row:bg-[color-mix(in_oklab,var(--muted)_60%,var(--background))] group-data-[selected]/row:bg-[color-mix(in_oklab,var(--accent)_70%,var(--background))]"
/** The first data column sticks next to the checkbox and casts an edge once scrolled. */
const STICKY_FIRST =
  "sticky z-[1] in-data-[scrolled]:shadow-[inset_-1px_0_0_var(--border)]"

const INTERACTIVE =
  'a, button, input, select, textarea, label, [role="checkbox"], [role="menuitem"], [data-no-row-click]'

/**
 * A Shopify-style index table: the search and filter bar (views, chips,
 * typed qualifiers, Save), sortable and filterable headers, sticky checkbox
 * and first columns, Shift-click selection with bulk actions and "Select all
 * N", row actions, and pagination. All state comes from `useDataTable`.
 */
function DataTable<TData extends RowData>({
  table,
  toolbar = true,
  search,
  views: builtInViews,
  savedViews,
  onSavedViewsChange,
  displayOptions = true,
  toolbarActions,
  selectable: selectableProp,
  bulkActions = [],
  selectAllMatching = true,
  rowActions = [],
  onRowClick,
  getRowLabel,
  resourceName = { singular: "item", plural: "items" },
  loading = false,
  fetching = false,
  error = null,
  emptyState,
  pagination = table.paginate,
  pageSizeOptions,
  stickyOffset = 0,
  maxHeight,
  className,
}: DataTableProps<TData>) {
  const { core, selection, rows } = table
  const selectable = selectableProp ?? bulkActions.length > 0
  const hasRowActions = rowActions.length > 0
  const visibleColumns = core.getVisibleLeafColumns()
  const firstColumnId = visibleColumns[0]?.id
  const columnCount =
    visibleColumns.length + (selectable ? 1 : 0) + (hasRowActions ? 1 : 0)
  const selecting = selectable && selection.hasSelection

  const views = useDataTableViews({
    list: table.list,
    views: builtInViews,
    savedViews,
    onSavedViewsChange,
    storageKey: table.tableId
      ? `fujin-data-table:${table.tableId}:views`
      : undefined,
  })

  const scrollRef = React.useRef<HTMLDivElement>(null)
  const [scrolled, setScrolled] = React.useState(false)
  // The visible width, so the bulk-action bar stays on screen (and wraps)
  // while a wide table scrolls sideways under it.
  React.useEffect(() => {
    const element = scrollRef.current
    if (!element || typeof ResizeObserver === "undefined") return
    const observer = new ResizeObserver(([entry]) => {
      if (!entry) return
      element.style.setProperty(
        "--fujin-data-table-width",
        `${entry.contentRect.width}px`
      )
    })
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  const labelOf = (row: Row<DataTableFeatures, TData>) =>
    getRowLabel?.(row.original) ?? row.id

  const onRowClickCapture = (
    row: Row<DataTableFeatures, TData>,
    event: React.MouseEvent<HTMLTableRowElement>
  ) => {
    if ((event.target as HTMLElement).closest(INTERACTIVE)) return
    // Text being selected is not a click.
    if (window.getSelection()?.toString()) return
    if (selecting) {
      selection.toggleRow(row.id, !selection.isRowSelected(row.id), {
        range: event.shiftKey,
      })
      return
    }
    onRowClick?.(row.original)
  }

  const clearQuery = () => {
    if (views.enabled) views.revert()
    else table.list.update({ q: undefined, filters: {} })
  }

  const style = {
    "--fujin-data-table-offset":
      typeof stickyOffset === "number" ? `${stickyOffset}px` : stickyOffset,
  } as React.CSSProperties

  return (
    <div
      data-slot="data-table"
      className={cn("rounded-lg border bg-background", className)}
      style={style}
    >
      {toolbar ? (
        <DataTableFilterBar
          table={table}
          views={views}
          search={search}
          displayOptions={displayOptions}
          actions={toolbarActions}
          className="sticky top-[var(--fujin-data-table-offset)] z-20 rounded-t-lg border-b bg-background"
        />
      ) : null}
      {/* Announces the result count after a search or filter, as Primer asks. */}
      <p role="status" className="sr-only">
        {table.isFiltered && !loading
          ? `${table.rowCount} ${table.rowCount === 1 ? resourceName.singular : resourceName.plural} found`
          : ""}
      </p>
      <div className="relative">
        {fetching && !loading ? (
          <div
            role="progressbar"
            aria-label={`Loading ${resourceName.plural}`}
            className="absolute inset-x-0 top-0 z-30 h-0.5 animate-pulse bg-primary"
          />
        ) : null}
        <div
          ref={scrollRef}
          data-slot="data-table-scroll"
          data-scrolled={scrolled || undefined}
          onScroll={(event) => setScrolled(event.currentTarget.scrollLeft > 0)}
          className="relative w-full overflow-auto"
          style={maxHeight !== undefined ? { maxHeight } : undefined}
        >
          <table
            data-slot="data-table-table"
            aria-busy={loading || fetching || undefined}
            aria-rowcount={loading ? undefined : table.rowCount + 1}
            className="w-full border-separate border-spacing-0 text-sm"
          >
            <thead
              className={cn(
                maxHeight !== undefined && "sticky top-0 z-10",
                "[&_th]:bg-background"
              )}
            >
              {selecting ? (
                <DataTableBulkActions
                  table={table}
                  actions={bulkActions}
                  selectAllMatching={selectAllMatching}
                  resourceName={resourceName}
                  columnCount={columnCount}
                  cellClassName={HEAD_CELL}
                  selectCellClassName={cn(HEAD_CELL, SELECT_CELL)}
                />
              ) : (
                core.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {selectable ? (
                      <th scope="col" className={cn(HEAD_CELL, SELECT_CELL)}>
                        <Checkbox
                          checked={selection.isAllPageRowsSelected}
                          indeterminate={selection.isSomePageRowsSelected}
                          disabled={rows.length === 0}
                          onCheckedChange={(checked) =>
                            selection.togglePage(checked)
                          }
                          aria-label={`Select all ${resourceName.plural} on this page`}
                          className="relative after:absolute after:-inset-1"
                        />
                      </th>
                    ) : null}
                    {headerGroup.headers.map((header) => {
                      const { column } = header
                      const sortField = table.sortFieldOf(column)
                      const sorted = column.getIsSorted()
                      const align = column.columnDef.meta?.align
                      return (
                        <th
                          key={header.id}
                          scope="col"
                          colSpan={header.colSpan}
                          aria-sort={
                            sortField === undefined
                              ? undefined
                              : sorted === "asc"
                                ? "ascending"
                                : sorted === "desc"
                                  ? "descending"
                                  : "none"
                          }
                          data-column={column.id}
                          className={cn(
                            HEAD_CELL,
                            column.id === firstColumnId &&
                              cn(
                                STICKY_FIRST,
                                selectable ? "left-10" : "left-0"
                              ),
                            align === "end" && "text-right",
                            align === "center" && "text-center"
                          )}
                        >
                          <DataTableColumnHeader
                            table={table}
                            header={header}
                          />
                        </th>
                      )
                    })}
                    {hasRowActions ? (
                      <th scope="col" className={cn(HEAD_CELL, "w-12")}>
                        <span className="sr-only">Actions</span>
                      </th>
                    ) : null}
                  </tr>
                ))
              )}
            </thead>
            <tbody>
              {loading ? (
                <DataTableLoadingState
                  colSpan={columnCount}
                  label={`Loading ${resourceName.plural}`}
                />
              ) : error ? (
                <DataTableErrorState
                  colSpan={columnCount}
                  message={error.message}
                  onRetry={error.onRetry}
                />
              ) : rows.length === 0 ? (
                <DataTableEmptyState
                  colSpan={columnCount}
                  filtered={table.isFiltered}
                  title={
                    emptyState?.title ??
                    (table.isFiltered
                      ? `No ${resourceName.plural} found`
                      : `No ${resourceName.plural} yet`)
                  }
                  description={
                    emptyState?.description ??
                    (table.isFiltered
                      ? "Try changing the filters or search term."
                      : undefined)
                  }
                  action={
                    emptyState?.action ??
                    (table.isFiltered ? (
                      <Button variant="outline" size="sm" onClick={clearQuery}>
                        Clear filters
                      </Button>
                    ) : undefined)
                  }
                />
              ) : (
                rows.map((row) => {
                  const selected = selectable && selection.isRowSelected(row.id)
                  const label = labelOf(row)
                  return (
                    <tr
                      key={row.id}
                      data-row-id={row.id}
                      data-selected={selected || undefined}
                      aria-selected={selectable ? selected : undefined}
                      onClick={(event) => onRowClickCapture(row, event)}
                      className={cn(
                        "group/row",
                        (onRowClick || selecting) && "cursor-pointer"
                      )}
                    >
                      {selectable ? (
                        <td className={cn(BODY_CELL, SELECT_CELL)}>
                          <Checkbox
                            checked={selected}
                            onCheckedChange={(checked, details) =>
                              selection.toggleRow(row.id, checked, {
                                range:
                                  (
                                    details.event as
                                      MouseEvent | KeyboardEvent | undefined
                                  )?.shiftKey === true,
                              })
                            }
                            aria-label={`Select ${label}`}
                            className="relative after:absolute after:-inset-1"
                          />
                        </td>
                      ) : null}
                      {row.getVisibleCells().map((cell) => {
                        const meta = cell.column.columnDef.meta
                        return (
                          <td
                            key={cell.id}
                            data-column={cell.column.id}
                            className={cn(
                              BODY_CELL,
                              cell.column.id === firstColumnId &&
                                cn(
                                  STICKY_FIRST,
                                  selectable ? "left-10" : "left-0"
                                ),
                              meta?.align === "end" &&
                                "text-right tabular-nums",
                              meta?.align === "center" && "text-center",
                              meta?.cellClassName
                            )}
                          >
                            <core.FlexRender cell={cell} />
                          </td>
                        )
                      })}
                      {hasRowActions ? (
                        <td className={cn(BODY_CELL, "w-12 px-2 text-right")}>
                          <DataTableRowActions
                            row={row.original}
                            actions={rowActions}
                            label={label}
                          />
                        </td>
                      ) : null}
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      {pagination ? (
        <DataTablePagination table={table} pageSizeOptions={pageSizeOptions} />
      ) : null}
    </div>
  )
}

export { DataTable }
