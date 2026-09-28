"use client"

import * as React from "react"
import type { RowData } from "@tanstack/react-table"
import { ChevronDownIcon, XIcon } from "lucide-react"

import type { BulkAction } from "@/registry/fujin/lib/data-table/types"
import type { DataTableInstance } from "@/registry/fujin/lib/data-table/use-data-table"
import { cn } from "@/registry/fujin/lib/utils"
import { Button } from "@/registry/fujin/ui/button"
import { Checkbox } from "@/registry/fujin/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/registry/fujin/ui/dropdown-menu"

export type DataTableBulkActionsProps<TData extends RowData> = {
  table: DataTableInstance<TData>
  actions: readonly BulkAction<TData>[]
  /** Offer "Select all N" across pages. Default true when there are more rows than the page shows. */
  selectAllMatching?: boolean
  /** Plural noun for the copy: "products". Default "items". */
  resourceName: { singular: string; plural: string }
  /** Classes for the header cells, so the bar keeps the header's height and stickiness. */
  cellClassName?: string
  selectCellClassName?: string
  columnCount: number
}

/**
 * Replaces the header row while rows are selected (Polaris IndexTable).
 * Promoted actions are buttons; the rest sit under "More actions" (or
 * "Actions" when none is promoted).
 */
function DataTableBulkActions<TData extends RowData>({
  table,
  actions,
  selectAllMatching = true,
  resourceName,
  cellClassName,
  selectCellClassName,
  columnCount,
}: DataTableBulkActionsProps<TData>) {
  const { selection } = table
  const [pending, setPending] = React.useState<string | null>(null)
  const promoted = actions.filter((action) => action.promoted)
  const overflow = actions.filter((action) => !action.promoted)
  const allMatching = selection.selection.type === "exclude"
  const moreRows = table.rowCount > table.rows.length
  const count = selection.selectedCount
  const noun = count === 1 ? resourceName.singular : resourceName.plural

  const isDisabled = (action: BulkAction<TData>) =>
    pending !== null ||
    action.disabled === true ||
    (allMatching && !action.supportsAllMatching)

  const run = async (action: BulkAction<TData>) => {
    setPending(action.id)
    try {
      const rows = table.rows
        .filter((row) => selection.isRowSelected(row.id))
        .map((row) => row.original)
      await action.onAction(selection.selection, rows)
      if (!action.keepSelection) selection.clear()
    } finally {
      setPending(null)
    }
  }

  const status = selection.isAllMatchingSelected
    ? `All ${table.rowCount} ${resourceName.plural} selected`
    : `${count} selected`

  return (
    <tr data-slot="data-table-bulk-actions">
      <th scope="col" className={selectCellClassName}>
        <Checkbox
          checked={selection.isAllPageRowsSelected}
          indeterminate={selection.isSomePageRowsSelected}
          onCheckedChange={(checked) => selection.togglePage(checked)}
          aria-label={
            selection.isAllPageRowsSelected
              ? `Deselect all ${resourceName.plural} on this page`
              : `Select all ${resourceName.plural} on this page`
          }
          className="relative after:absolute after:-inset-1"
        />
      </th>
      <th
        scope="col"
        colSpan={Math.max(columnCount - 1, 1)}
        className={cn(cellClassName, "font-normal")}
      >
        <div
          role="toolbar"
          aria-label="Bulk actions"
          className="sticky left-13 flex max-w-[calc(var(--fujin-data-table-width,100%)-3.25rem)] flex-wrap items-center gap-2 py-1"
        >
          <span
            role="status"
            aria-live="polite"
            className="font-medium whitespace-nowrap"
          >
            {status}
          </span>
          {selectAllMatching && moreRows ? (
            allMatching ? (
              <Button
                variant="link"
                size="sm"
                className="h-7 px-1"
                onClick={selection.clear}
              >
                Undo
              </Button>
            ) : selection.isAllPageRowsSelected ? (
              <Button
                variant="link"
                size="sm"
                className="h-7 px-1"
                onClick={selection.selectAllMatching}
              >
                Select all {table.rowCount} {resourceName.plural}
              </Button>
            ) : null
          ) : null}
          {promoted.map((action) => (
            <Button
              key={action.id}
              variant={
                action.variant === "destructive" ? "destructive" : "outline"
              }
              size="sm"
              className="h-7"
              disabled={isDisabled(action)}
              loading={pending === action.id}
              title={
                allMatching && !action.supportsAllMatching
                  ? `Not available when all ${resourceName.plural} are selected`
                  : undefined
              }
              onClick={() => void run(action)}
            >
              {action.icon}
              {action.label}
            </Button>
          ))}
          {overflow.length > 0 ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7"
                    disabled={pending !== null}
                  />
                }
              >
                {promoted.length > 0 ? "More actions" : "Actions"}
                <ChevronDownIcon aria-hidden />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {overflow.map((action) => (
                  <DropdownMenuItem
                    key={action.id}
                    variant={action.variant}
                    disabled={isDisabled(action)}
                    onClick={() => void run(action)}
                  >
                    {action.icon}
                    {action.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}
          <Button
            variant="ghost"
            size="icon-sm"
            className="ml-auto size-7 shrink-0"
            aria-label={`Clear selection (${count} ${noun})`}
            onClick={selection.clear}
          >
            <XIcon aria-hidden />
          </Button>
        </div>
      </th>
    </tr>
  )
}

export { DataTableBulkActions }
