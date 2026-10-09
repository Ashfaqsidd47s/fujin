"use client"

import * as React from "react"
import { ChevronLeftIcon, XIcon } from "lucide-react"

import {
  filterSummary,
  type FilterSummary,
} from "@/registry/fujin/lib/data-table/filter-summary"
import type {
  FilterDef,
  FilterValue,
} from "@/registry/fujin/lib/data-table/types"
import { useResolvedOptions } from "@/registry/fujin/lib/data-table/use-filter-options"
import { cn } from "@/registry/fujin/lib/utils"
import { Button } from "@/registry/fujin/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  type PopoverContentProps,
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
  finalFocus?: PopoverContentProps["finalFocus"]
  /** Shows "All filters" above the picker: back to the list it was picked from. */
  onBack?: () => void
  ref?: React.Ref<HTMLButtonElement>
}

/** A chip's summary; `null` while the filter is being added and has no value. */
function useFilterChipSummary(
  def: FilterDef<never>,
  value: FilterValue | undefined
) {
  const values =
    value && (value.op === "in" || value.op === "not_in") ? value.values : []
  const resolved = useResolvedOptions(def, values)
  return value ? filterSummary(def, value, { resolved }) : null
}

/** "Status is" and the tinted "Active, Draft": the text of every chip. */
function FilterChipLabel({
  def,
  summary,
}: {
  def: FilterDef<never>
  summary: FilterSummary | null
}) {
  // A filter being added reads "Status is" until a value is picked.
  const pendingVerb =
    def.type === "enum" || def.type === "async" || def.type === "boolean"
      ? " is"
      : ""
  return (
    <>
      <span className="shrink-0 text-foreground">
        {def.label}
        {summary ? ` ${summary.verb}` : pendingVerb}
      </span>
      {summary ? (
        <span className="min-w-0 truncate rounded-sm bg-primary/10 px-1 font-medium text-foreground">
          {summary.detail}
        </span>
      ) : null}
    </>
  )
}

/** The picker's back button, to the list the filter was picked from. */
function FilterPickerBack({
  label,
  onBack,
}: {
  label: string
  onBack: () => void
}) {
  return (
    <div data-slot="data-table-filter-back" className="border-b p-1">
      <Button variant="ghost" size="sm" onClick={onBack}>
        <ChevronLeftIcon aria-hidden />
        {label}
      </Button>
    </div>
  )
}

const CHIP =
  "inline-flex h-7 max-w-full min-w-0 items-center rounded-md bg-muted text-sm"
const CHIP_FACE = "flex h-full min-w-0 items-center gap-1 rounded-md px-2"

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
  onBack,
  ref,
}: DataTableFilterChipProps) {
  const summary = useFilterChipSummary(def, value)

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
        className={cn(
          CHIP,
          "group/chip data-[state=open]:ring-2 data-[state=open]:ring-ring"
        )}
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
          className={cn(
            CHIP_FACE,
            "outline-none focus-visible:ring-2 focus-visible:ring-ring"
          )}
        >
          <FilterChipLabel def={def} summary={summary} />
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
        data-filter-popup=""
        align="start"
        className="w-auto p-0"
        finalFocus={finalFocus ?? true}
      >
        {onBack ? (
          <FilterPickerBack label="All filters" onBack={onBack} />
        ) : null}
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

/**
 * An invisible, inert copy of a chip at its natural width. The filter bar
 * lays these out off-screen to learn whether the real chips fit on one line.
 */
function DataTableFilterChipGhost({
  def,
  value,
}: {
  def: FilterDef<never>
  value: FilterValue | undefined
}) {
  const summary = useFilterChipSummary(def, value)
  return (
    <span className={cn(CHIP, "max-w-none shrink-0")}>
      <span className={CHIP_FACE}>
        <FilterChipLabel def={def} summary={summary} />
      </span>
      {/* The remove button: w-6 pulled in by -ml-1. */}
      {summary ? <span className="w-5" /> : null}
    </span>
  )
}

export {
  DataTableFilterChip,
  DataTableFilterChipGhost,
  FilterChipLabel,
  FilterPickerBack,
  useFilterChipSummary,
}
