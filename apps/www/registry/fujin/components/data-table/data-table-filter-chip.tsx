"use client"

import * as React from "react"
import { XIcon } from "lucide-react"

import { filterSummary } from "@/registry/fujin/lib/data-table/filter-summary"
import type {
  FilterDef,
  FilterValue,
} from "@/registry/fujin/lib/data-table/types"
import { useResolvedOptions } from "@/registry/fujin/lib/data-table/use-filter-options"
import { cn } from "@/registry/fujin/lib/utils"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/registry/fujin/ui/popover"

import { DataTableFilterPicker } from "./data-table-filter-picker"

export type DataTableFilterChipProps = {
  def: FilterDef<never>
  /** Undefined while the filter is being added and has no value yet. */
  value: FilterValue | undefined
  open: boolean
  onOpenChange: (open: boolean) => void
  onChange: (next: FilterValue | undefined) => void
  onRemove: () => void
  /** Left / Right on the chip: the neighbouring chip, or the search box. */
  onNavigate?: (direction: -1 | 1) => void
  /** Where focus goes when the picker closes. Default: back to the chip. */
  finalFocus?: React.RefObject<HTMLElement | null>
  ref?: React.Ref<HTMLButtonElement>
}

/**
 * An applied filter inside the search bar, as in the Shopify admin:
 * "Status is Active, Draft" with the values tinted. Clicking it reopens the
 * picker with the current values checked; Delete or Backspace removes it;
 * the x shows on hover and focus.
 */
function DataTableFilterChip({
  def,
  value,
  open,
  onOpenChange,
  onChange,
  onRemove,
  onNavigate,
  finalFocus,
  ref,
}: DataTableFilterChipProps) {
  const values =
    value && (value.op === "in" || value.op === "not_in") ? value.values : []
  const resolved = useResolvedOptions(def, values)
  const summary = value ? filterSummary(def, value, { resolved }) : null
  // A filter being added reads "Status is" until a value is picked.
  const pendingVerb =
    def.type === "enum" || def.type === "async" || def.type === "boolean"
      ? " is"
      : ""

  const onKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "Backspace" || event.key === "Delete") {
      event.preventDefault()
      onRemove()
    } else if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault()
      onNavigate?.(event.key === "ArrowLeft" ? -1 : 1)
    }
  }

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <span
        data-slot="data-table-filter-chip"
        data-filter={def.key}
        data-state={open ? "open" : "closed"}
        className="group/chip inline-flex h-7 max-w-full min-w-0 items-center rounded-md bg-muted text-sm data-[state=open]:ring-2 data-[state=open]:ring-ring"
      >
        <PopoverTrigger
          ref={ref}
          onKeyDown={onKeyDown}
          aria-keyshortcuts="Delete Backspace"
          aria-label={
            summary
              ? `${summary.text}. Press Enter to edit, Delete to remove.`
              : `${def.label}: choose a value`
          }
          title={summary?.text}
          className="flex h-full min-w-0 items-center gap-1 rounded-md px-2 outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span className="shrink-0 text-foreground">
            {def.label}
            {summary ? ` ${summary.verb}` : pendingVerb}
          </span>
          {summary ? (
            <span className="min-w-0 truncate rounded-sm bg-primary/10 px-1 font-medium text-foreground">
              {summary.detail}
            </span>
          ) : null}
        </PopoverTrigger>
        {summary ? (
          <button
            type="button"
            tabIndex={-1}
            onClick={onRemove}
            aria-label={`Remove ${summary.text}`}
            className={cn(
              "-ml-1 flex h-full w-6 items-center justify-center rounded-r-md text-muted-foreground hover:text-foreground",
              // Fades in on hover or focus, as Shopify's chips do. It keeps its
              // room: a chip that grew on hover could wrap away from the pointer
              // and flicker. Always shown for touch, which has no hover.
              "opacity-0 group-focus-within/chip:opacity-100 group-hover/chip:opacity-100 pointer-coarse:opacity-100"
            )}
          >
            <XIcon className="size-3.5" aria-hidden />
          </button>
        ) : null}
      </span>
      <PopoverContent
        align="start"
        className="w-auto p-0"
        finalFocus={finalFocus ?? true}
      >
        <DataTableFilterPicker
          def={def}
          value={value}
          onChange={onChange}
          onDone={() => onOpenChange(false)}
        />
      </PopoverContent>
    </Popover>
  )
}

export { DataTableFilterChip }
