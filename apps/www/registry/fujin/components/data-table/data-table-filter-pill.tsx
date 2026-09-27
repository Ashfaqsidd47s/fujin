"use client"

import * as React from "react"
import { ChevronDownIcon, XIcon } from "lucide-react"

import { FILTER_TYPES_WITH_UI } from "@/registry/fujin/lib/data-table/features"
import type {
  ActiveFilter,
  FilterOption,
} from "@/registry/fujin/lib/data-table/types"
import { cn } from "@/registry/fujin/lib/utils"
import { badgeVariants } from "@/registry/fujin/ui/badge"

import {
  DataTableColumnFilterPopover,
  useColumnFilterOptions,
} from "./data-table-column-filter-popover"

export type DataTableFilterPillProps = {
  filter: ActiveFilter
  getColumnOptions: (
    columnId: string,
    query?: string
  ) => Promise<FilterOption[]>
  setFilterValue: (
    columnId: string,
    value: ActiveFilter["value"] | undefined
  ) => void
  onRemove: (columnId: string) => void
}

function summarize(filter: ActiveFilter): string {
  const { type, value } = filter
  if (type === "number-range" && Array.isArray(value)) {
    const [min, max] = value
    if (min && max) return `${min} - ${max}`
    if (min) return `≥ ${min}`
    if (max) return `≤ ${max}`
    return "Any"
  }
  if (Array.isArray(value)) {
    if (value.length === 0) return "Any"
    if (value.length <= 2) return value.join(", ")
    return `${value[0]}, ${value[1]} +${value.length - 2}`
  }
  return String(value)
}

/**
 * A Shopify-style filter pill: click it to reopen the same value-picker the
 * search bar used to create it, seeded with the values already chosen. A
 * filter type with no built-in editor (`boolean`/`date-range` - see
 * `FILTER_TYPES_WITH_UI`) can still only reach this state via a caller
 * driving `column.setFilterValue()` directly, so it renders as a plain,
 * non-interactive summary - removable, but not editable from here.
 */
function DataTableFilterPill({
  filter,
  getColumnOptions,
  setFilterValue,
  onRemove,
}: DataTableFilterPillProps) {
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const isListType = filter.type === "select" || filter.type === "multi-select"
  const { options, loading } = useColumnFilterOptions(
    filter.columnId,
    query,
    open && isListType,
    getColumnOptions
  )

  if (!FILTER_TYPES_WITH_UI.has(filter.type)) {
    return (
      <span
        data-slot="data-table-filter-pill"
        className={cn(
          badgeVariants({ variant: "secondary" }),
          "h-7 gap-1 rounded-r-none py-0 pr-2 pl-2"
        )}
      >
        <span className="font-medium">{filter.label}</span>
        <span className="text-muted-foreground">{summarize(filter)}</span>
      </span>
    )
  }

  return (
    <DataTableColumnFilterPopover
      label={filter.label}
      type={filter.type}
      value={filter.value}
      onValueChange={(value) => {
        if (value == null || (Array.isArray(value) && value.length === 0)) {
          onRemove(filter.columnId)
        } else {
          setFilterValue(filter.columnId, value)
        }
      }}
      open={open}
      onOpenChange={setOpen}
      query={query}
      onQueryChange={setQuery}
      options={options}
      loading={loading}
      triggerClassName={cn(
        badgeVariants({ variant: "secondary" }),
        "h-7 gap-1 rounded-r-none py-0 pr-2 pl-2 outline-none hover:bg-black/5 focus-visible:ring-2 focus-visible:ring-ring dark:hover:bg-white/10"
      )}
    >
      <span className="font-medium">{filter.label}</span>
      <span className="text-muted-foreground">{summarize(filter)}</span>
      <ChevronDownIcon className="size-3 text-muted-foreground" />
    </DataTableColumnFilterPopover>
  )
}

/** Renders the pill's remove button next to it - kept separate so the popover trigger stays a single click target. */
function DataTableFilterPillRemove({
  label,
  onRemove,
}: {
  label: string
  onRemove: () => void
}) {
  return (
    <button
      type="button"
      aria-label={`Remove ${label} filter`}
      onClick={onRemove}
      className={cn(
        badgeVariants({ variant: "secondary" }),
        "h-7 w-6 shrink-0 justify-center rounded-l-none border-l border-l-background/40 px-0 outline-none hover:bg-black/10 focus-visible:ring-2 focus-visible:ring-ring dark:hover:bg-white/10"
      )}
    >
      <XIcon className="size-3.5" />
    </button>
  )
}

export { DataTableFilterPill, DataTableFilterPillRemove }
