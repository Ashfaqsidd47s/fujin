"use client"

import * as React from "react"
import type { RowData } from "@tanstack/react-table"
import {
  ArrowDownIcon,
  ArrowUpDownIcon,
  ArrowUpIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "lucide-react"

import { parseSort } from "@/registry/fujin/lib/data-table/filter-codec"
import type { DataTableInstance } from "@/registry/fujin/lib/data-table/use-data-table"
import { cn } from "@/registry/fujin/lib/utils"
import { Button } from "@/registry/fujin/ui/button"
import { Checkbox } from "@/registry/fujin/ui/checkbox"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/registry/fujin/ui/popover"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/registry/fujin/ui/tooltip"

export type DataTableDisplayOptionsProps<TData extends RowData> = {
  table: DataTableInstance<TData>
  /** Show the "Sort by" section. Default: when anything is sortable. */
  sort?: boolean
  /** Show the "Columns" section. Default true. */
  columns?: boolean
}

/**
 * Shopify's display options panel: "Sort by" (field, then direction) and
 * "Columns" (show, hide and reorder with buttons, never drag-only). The
 * leftmost column always stays first and visible, as in the admin.
 */
function DataTableDisplayOptions<TData extends RowData>({
  table,
  sort = table.sortOptions.length > 0,
  columns = true,
}: DataTableDisplayOptionsProps<TData>) {
  if (!sort && !columns) return null
  const state = parseSort(table.list.sort)
  const active = table.sortOptions.find((o) => o.value === state?.field)
  const label = sort && !columns ? "Sort the results" : "Display options"

  return (
    <Popover>
      <Tooltip>
        <TooltipTrigger
          render={
            <PopoverTrigger
              render={
                <Button
                  variant="outline"
                  size="icon-sm"
                  aria-label={
                    active ? `${label}. Sorted by ${active.label}` : label
                  }
                />
              }
            />
          }
        >
          <ArrowUpDownIcon aria-hidden />
        </TooltipTrigger>
        <TooltipContent>
          {sort && !columns ? "Sort" : "Sort and columns"}
        </TooltipContent>
      </Tooltip>
      <PopoverContent
        align="end"
        className="flex max-h-[min(32rem,var(--available-height))] w-64 flex-col overflow-y-auto p-0"
      >
        {sort ? <SortSection table={table} /> : null}
        {sort && columns ? <div className="border-t" /> : null}
        {columns ? <ColumnsSection table={table} /> : null}
      </PopoverContent>
    </Popover>
  )
}

function SortSection<TData extends RowData>({
  table,
}: {
  table: DataTableInstance<TData>
}) {
  const id = React.useId()
  const state = parseSort(table.list.sort)
  const active = table.sortOptions.find((o) => o.value === state?.field)
  const direction = state?.direction ?? "asc"
  const setSort = (field: string, dir: "asc" | "desc") =>
    table.list.update({ sort: dir === "desc" ? `-${field}` : field })

  return (
    <div className="flex flex-col p-1">
      <p
        id={`${id}-sort`}
        className="px-2 py-1.5 text-xs font-medium text-muted-foreground"
      >
        Sort by
      </p>
      <div
        role="radiogroup"
        aria-labelledby={`${id}-sort`}
        className="flex flex-col"
      >
        {table.sortOptions.map((option) => {
          const checked = option.value === state?.field
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={checked}
              // Changing the field keeps the direction, as Shopify's sort does.
              onClick={() => setSort(option.value, direction)}
              className="flex min-h-8 items-center gap-2 rounded-sm px-2 text-left text-sm outline-none hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span
                aria-hidden
                className={cn(
                  "flex size-4 shrink-0 items-center justify-center rounded-full border",
                  checked
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-input bg-background"
                )}
              >
                {checked ? (
                  <span className="size-1.5 rounded-full bg-current" />
                ) : null}
              </span>
              {option.label}
            </button>
          )
        })}
      </div>
      {active ? (
        <div
          role="radiogroup"
          aria-label="Sort direction"
          className="mt-1 flex flex-col border-t pt-1"
        >
          {(
            [
              ["asc", ArrowUpIcon, active.ascLabel ?? "Ascending"],
              ["desc", ArrowDownIcon, active.descLabel ?? "Descending"],
            ] as const
          ).map(([dir, Icon, text]) => (
            <button
              key={dir}
              type="button"
              role="radio"
              aria-checked={direction === dir}
              onClick={() => setSort(active.value, dir)}
              className={cn(
                "flex min-h-8 items-center gap-2 rounded-sm px-2 text-left text-sm outline-none hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring",
                direction === dir && "bg-accent font-medium"
              )}
            >
              <Icon aria-hidden className="size-4" />
              {text}
              {direction === dir ? (
                <CheckIcon aria-hidden className="ml-auto size-4" />
              ) : null}
            </button>
          ))}
          <button
            type="button"
            onClick={() => table.list.update({ sort: undefined })}
            className="flex min-h-8 items-center rounded-sm px-2 text-left text-sm text-muted-foreground outline-none hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
          >
            Clear sort
          </button>
        </div>
      ) : null}
    </div>
  )
}

function ColumnsSection<TData extends RowData>({
  table,
}: {
  table: DataTableInstance<TData>
}) {
  const id = React.useId()
  const { core } = table
  const leafColumns = core.getAllLeafColumns()
  const order = leafColumns.map((column) => column.id)
  const [first] = order

  const move = (columnId: string, delta: -1 | 1) => {
    const from = order.indexOf(columnId)
    const to = from + delta
    // The leftmost column stays first.
    if (from < 1 || to < 1 || to >= order.length) return
    const next = [...order]
    next.splice(from, 1)
    next.splice(to, 0, columnId)
    core.setColumnOrder(next)
  }

  return (
    <div className="flex flex-col p-1">
      <div className="flex items-center justify-between px-2 py-1">
        <p
          id={`${id}-columns`}
          className="text-xs font-medium text-muted-foreground"
        >
          Columns
        </p>
        {table.columnPrefs.isCustomized ? (
          <Button variant="ghost" size="xs" onClick={table.columnPrefs.reset}>
            Reset
          </Button>
        ) : null}
      </div>
      <ul aria-labelledby={`${id}-columns`} className="flex flex-col">
        {leafColumns.map((column, index) => {
          const label = table.columnLabel(column)
          const locked =
            column.id === first ||
            column.columnDef.meta?.lockVisibility === true ||
            !column.getCanHide()
          const checkboxId = `${id}-${column.id}`
          return (
            <li
              key={column.id}
              className="flex min-h-8 items-center gap-2 rounded-sm px-2 hover:bg-accent/50"
            >
              <Checkbox
                id={checkboxId}
                checked={column.getIsVisible()}
                disabled={locked}
                onCheckedChange={(checked) => column.toggleVisibility(checked)}
                className="relative after:absolute after:-inset-1"
              />
              <label
                htmlFor={checkboxId}
                className={cn(
                  "min-w-0 flex-1 truncate text-sm",
                  locked && "text-muted-foreground"
                )}
              >
                {label}
              </label>
              {index > 0 ? (
                <span className="flex">
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    aria-label={`Move ${label} up`}
                    disabled={index <= 1}
                    onClick={() => move(column.id, -1)}
                  >
                    <ChevronUpIcon aria-hidden />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    aria-label={`Move ${label} down`}
                    disabled={index === leafColumns.length - 1}
                    onClick={() => move(column.id, 1)}
                  >
                    <ChevronDownIcon aria-hidden />
                  </Button>
                </span>
              ) : null}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export { DataTableDisplayOptions }
