"use client"

import * as React from "react"
import { CirclePlusIcon, XIcon } from "lucide-react"

import type {
  FilterDef,
  FilterValue,
  FilterValues,
} from "@/registry/fujin/lib/data-table/types"
import { cn } from "@/registry/fujin/lib/utils"
import { Button } from "@/registry/fujin/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTitle,
  PopoverTrigger,
} from "@/registry/fujin/ui/popover"

import {
  FilterChipLabel,
  FilterPickerBack,
  useFilterChipSummary,
} from "./data-table-filter-chip"
import { DataTableFilterPicker } from "./data-table-filter-picker"

export type DataTableFilterOverflowProps = {
  /** The applied filters, plus the one being added. */
  defs: readonly FilterDef<never>[]
  values: FilterValues
  open: boolean
  onOpenChange: (open: boolean) => void
  /** The filter whose picker is showing; `null` shows every chip. */
  editing: string | null
  onEdit: (key: string) => void
  /** Leave the picker: back to the chips, or closed if it was opened from the search box. */
  onDoneEditing: () => void
  /** The picker's back button: to the chips, or the list it was picked from. */
  onBack: () => void
  /** The back button's text. Default "Applied filters". */
  backLabel?: string
  onChange: (key: string, value: FilterValue | undefined) => void
  onRemove: (key: string) => void
  onAddFilter?: () => void
  onClearAll: () => void
  /** Right on the pill: into the search box. */
  onNavigate?: (direction: -1 | 1) => void
  /** Where focus goes when the popover closes. Default: back to the pill. */
  finalFocus?: React.RefObject<HTMLElement | null>
  ref?: React.Ref<HTMLButtonElement>
}

/**
 * The applied filters folded into one "3 filters" pill once they no longer
 * fit on the search bar's line. The pill opens every chip in a popover;
 * clicking one swaps in its picker, with a back button to the rest.
 */
function DataTableFilterOverflow({
  defs,
  values,
  open,
  onOpenChange,
  editing,
  onEdit,
  onDoneEditing,
  onBack,
  backLabel = "Applied filters",
  onChange,
  onRemove,
  onAddFilter,
  onClearAll,
  onNavigate,
  finalFocus,
  ref,
}: DataTableFilterOverflowProps) {
  const chipRefs = React.useRef(new Map<string, HTMLButtonElement>())
  // The chip to focus when the picker hands back to the list.
  const [returnKey, setReturnKey] = React.useState<string | null>(null)
  const editingDef = defs.find((def) => def.key === editing)
  const count = defs.filter((def) => values[def.key] !== undefined).length
  const noun = count === 1 ? "filter" : "filters"

  const focusChip = (index: number) => {
    const def = defs[Math.max(0, Math.min(index, defs.length - 1))]
    if (def) chipRefs.current.get(def.key)?.focus()
  }

  const remove = (index: number) => {
    const def = defs[index]
    if (!def) return
    // The neighbour stays mounted, so it can take focus right away.
    const next = defs[index + 1] ?? defs[index - 1]
    if (next) chipRefs.current.get(next.key)?.focus()
    onRemove(def.key)
  }

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger
        ref={ref}
        data-slot="data-table-filter-overflow"
        data-state={open ? "open" : "closed"}
        onKeyDown={(event) => {
          if (event.key === "ArrowRight") {
            event.preventDefault()
            onNavigate?.(1)
          }
        }}
        aria-label={`${count} ${noun} applied. Press Enter to show them.`}
        className="inline-flex h-7 shrink-0 items-center gap-1 rounded-md bg-muted px-2 text-sm text-foreground outline-none hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring data-[state=open]:ring-2 data-[state=open]:ring-ring"
      >
        <span className="rounded-sm bg-primary/10 px-1 font-medium tabular-nums">
          {count}
        </span>
        {noun}
      </PopoverTrigger>
      <PopoverContent
        data-filter-popup=""
        align="start"
        className="w-auto p-0"
        finalFocus={finalFocus ?? true}
      >
        {editingDef ? (
          <div data-slot="data-table-filter-overflow-editor">
            <FilterPickerBack label={backLabel} onBack={onBack} />
            <DataTableFilterPicker
              def={editingDef}
              value={values[editingDef.key]}
              onChange={(value) => onChange(editingDef.key, value)}
              onDone={onDoneEditing}
            />
          </div>
        ) : (
          <div
            data-slot="data-table-filter-overflow-list"
            className="flex w-80 max-w-[calc(100vw-2rem)] flex-col"
          >
            <div className="flex items-center justify-between gap-2 border-b px-3 py-2">
              <PopoverTitle>Applied filters</PopoverTitle>
              <span className="text-xs text-muted-foreground tabular-nums">
                {count}
              </span>
            </div>
            <ul
              aria-label="Applied filters"
              className="flex max-h-72 flex-wrap gap-1.5 overflow-y-auto p-2"
            >
              {defs.map((def, index) => (
                <OverflowChip
                  key={def.key}
                  def={def}
                  value={values[def.key]}
                  autoFocus={def.key === returnKey}
                  onEdit={() => {
                    setReturnKey(def.key)
                    onEdit(def.key)
                  }}
                  onRemove={() => remove(index)}
                  onNavigate={(direction) => focusChip(index + direction)}
                  ref={(element) => {
                    if (element) chipRefs.current.set(def.key, element)
                    else chipRefs.current.delete(def.key)
                  }}
                />
              ))}
            </ul>
            <div className="flex items-center justify-between gap-2 border-t p-1.5">
              {onAddFilter ? (
                <Button variant="ghost" size="sm" onClick={onAddFilter}>
                  <CirclePlusIcon aria-hidden />
                  Add filter
                </Button>
              ) : (
                <span />
              )}
              <Button variant="ghost" size="sm" onClick={onClearAll}>
                Clear all
              </Button>
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}

function OverflowChip({
  def,
  value,
  autoFocus,
  onEdit,
  onRemove,
  onNavigate,
  ref,
}: {
  def: FilterDef<never>
  value: FilterValue | undefined
  autoFocus?: boolean
  onEdit: () => void
  onRemove: () => void
  onNavigate: (direction: -1 | 1) => void
  ref?: React.Ref<HTMLButtonElement>
}) {
  const summary = useFilterChipSummary(def, value)
  if (!summary) return null
  return (
    <li
      data-slot="data-table-filter-chip"
      data-filter={def.key}
      className="inline-flex h-7 max-w-full min-w-0 items-center rounded-md bg-muted text-sm"
    >
      <button
        type="button"
        ref={ref}
        autoFocus={autoFocus}
        onClick={onEdit}
        onKeyDown={(event) => {
          if (event.key === "Backspace" || event.key === "Delete") {
            event.preventDefault()
            onRemove()
          } else if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
            event.preventDefault()
            onNavigate(event.key === "ArrowLeft" ? -1 : 1)
          }
        }}
        aria-keyshortcuts="Delete Backspace"
        aria-label={`${summary.text}. Press Enter to edit, Delete to remove.`}
        title={summary.text}
        className={cn(
          "flex h-full min-w-0 items-center gap-1 rounded-md px-2 outline-none",
          "hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring"
        )}
      >
        <FilterChipLabel def={def} summary={summary} />
      </button>
      {/* Always shown here: the popover has room, and touch has no hover. */}
      <button
        type="button"
        tabIndex={-1}
        onClick={onRemove}
        aria-label={`Remove ${summary.text}`}
        className="-ml-1 flex h-full w-6 shrink-0 items-center justify-center rounded-r-md text-muted-foreground hover:text-foreground"
      >
        <XIcon className="size-3.5" aria-hidden />
      </button>
    </li>
  )
}

export { DataTableFilterOverflow }
