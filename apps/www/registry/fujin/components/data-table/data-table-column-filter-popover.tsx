"use client"

import * as React from "react"

import type {
  ActiveFilter,
  FilterOption,
  FilterType,
} from "@/registry/fujin/lib/data-table/types"
import { Button } from "@/registry/fujin/ui/button"
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
  CommandPopup,
  CommandTrigger,
} from "@/registry/fujin/ui/command"
import { Input } from "@/registry/fujin/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/registry/fujin/ui/popover"

export type DataTableColumnFilterPopoverProps = {
  label: string
  /** Only `"text" | "select" | "multi-select" | "number-range"` render a control - see `FILTER_TYPES_WITH_UI`. */
  type: FilterType
  value: ActiveFilter["value"] | undefined
  onValueChange: (value: ActiveFilter["value"] | undefined) => void
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Only read by `select`/`multi-select`. */
  query: string
  onQueryChange: (query: string) => void
  /** Only read by `select`/`multi-select`. */
  options: FilterOption[]
  loading: boolean
  children: React.ReactNode
  triggerClassName?: string
}

/**
 * The reusable half of both entry points the plan calls for: the unified
 * search bar's value-picker step and a column header's click-to-filter
 * popover both render this, seeded with the same `getColumnOptions` and
 * writing to the same filter state - one filter, two ways to reach it.
 * Data fetching lives in the caller (`data-table-filter-pill`,
 * `data-table-column-header`) since each seeds `selectedValues` differently.
 *
 * Branches on `type`: `select`/`multi-select` get the value-list `Command`
 * popover (single- vs multi-choice), `text` gets a single input, and
 * `number-range` gets a min/max pair - each writes the value shape its
 * `filterFn` (`FILTER_FN_BY_TYPE`) actually expects.
 */
function DataTableColumnFilterPopover({
  label,
  type,
  value,
  onValueChange,
  open,
  onOpenChange,
  query,
  onQueryChange,
  options,
  loading,
  children,
  triggerClassName,
}: DataTableColumnFilterPopoverProps) {
  if (type === "text") {
    return (
      <DataTableTextFilterPopover
        label={label}
        value={typeof value === "string" ? value : ""}
        onValueChange={onValueChange}
        open={open}
        onOpenChange={onOpenChange}
        triggerClassName={triggerClassName}
      >
        {children}
      </DataTableTextFilterPopover>
    )
  }

  if (type === "number-range") {
    const [min, max] = Array.isArray(value) ? value : ["", ""]
    return (
      <DataTableNumberRangeFilterPopover
        label={label}
        min={min != null ? String(min) : ""}
        max={max != null ? String(max) : ""}
        onValueChange={onValueChange}
        open={open}
        onOpenChange={onOpenChange}
        triggerClassName={triggerClassName}
      >
        {children}
      </DataTableNumberRangeFilterPopover>
    )
  }

  const selectedValues = Array.isArray(value)
    ? value
    : value != null
      ? [String(value)]
      : []
  const selectedOptions: FilterOption[] = selectedValues.map(
    (selected) =>
      options.find((option) => option.value === selected) ?? {
        value: selected,
        label: selected,
      }
  )

  const list = (
    <>
      <CommandInput placeholder={`Filter by ${label}...`} />
      {loading ? (
        <div className="py-6 text-center text-sm text-muted-foreground">
          Loading...
        </div>
      ) : (
        <>
          <CommandEmpty>No matching values.</CommandEmpty>
          <CommandList>
            {(option: FilterOption) => (
              <CommandItem key={option.value} value={option}>
                {option.label}
                {option.count != null ? (
                  <span className="ml-auto text-xs text-muted-foreground">
                    {option.count}
                  </span>
                ) : null}
              </CommandItem>
            )}
          </CommandList>
        </>
      )}
    </>
  )

  if (type === "select") {
    return (
      <Command
        items={options}
        value={selectedOptions[0] ?? null}
        isItemEqualToValue={(a: FilterOption, b: FilterOption) =>
          a.value === b.value
        }
        inputValue={query}
        onInputValueChange={onQueryChange}
        filter={() => true}
        open={open}
        onOpenChange={onOpenChange}
        onValueChange={(option: FilterOption | null) =>
          onValueChange(option ? option.value : undefined)
        }
      >
        <CommandTrigger
          aria-label={`Filter by ${label}`}
          className={triggerClassName}
        >
          {children}
        </CommandTrigger>
        <CommandPopup>{list}</CommandPopup>
      </Command>
    )
  }

  return (
    <Command
      items={options}
      multiple
      value={selectedOptions}
      isItemEqualToValue={(a: FilterOption, b: FilterOption) =>
        a.value === b.value
      }
      inputValue={query}
      onInputValueChange={onQueryChange}
      filter={() => true}
      open={open}
      onOpenChange={onOpenChange}
      onValueChange={(values: FilterOption[]) =>
        onValueChange(
          values.length ? values.map((option) => option.value) : undefined
        )
      }
    >
      <CommandTrigger
        aria-label={`Filter by ${label}`}
        className={triggerClassName}
      >
        {children}
      </CommandTrigger>
      <CommandPopup>{list}</CommandPopup>
    </Command>
  )
}

type ScalarFilterPopoverProps = {
  label: string
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
  triggerClassName?: string
}

function DataTableTextFilterPopover({
  label,
  value,
  onValueChange,
  open,
  onOpenChange,
  children,
  triggerClassName,
}: ScalarFilterPopoverProps & {
  value: string
  onValueChange: (value: string | undefined) => void
}) {
  const [draft, setDraft] = React.useState(value)
  // Reset the draft to the current value each time the popover opens -
  // adjusted during render (React's documented pattern for this), not in an
  // effect, so opening never costs an extra render.
  const [wasOpen, setWasOpen] = React.useState(open)
  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) setDraft(value)
  }

  const apply = () => {
    const trimmed = draft.trim()
    onValueChange(trimmed || undefined)
    onOpenChange(false)
  }

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger
        aria-label={`Filter by ${label}`}
        className={triggerClassName}
      >
        {children}
      </PopoverTrigger>
      <PopoverContent align="start" className="w-64">
        <form
          className="flex flex-col gap-2"
          onSubmit={(event) => {
            event.preventDefault()
            apply()
          }}
        >
          <span className="text-xs font-medium text-muted-foreground">
            {label}
          </span>
          <Input
            autoFocus
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder={`Filter by ${label}...`}
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              className="rounded-sm px-2 py-1 text-sm text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
              onClick={() => {
                setDraft("")
                onValueChange(undefined)
                onOpenChange(false)
              }}
            >
              Clear
            </button>
            <Button type="submit" size="sm">
              Apply
            </Button>
          </div>
        </form>
      </PopoverContent>
    </Popover>
  )
}

function DataTableNumberRangeFilterPopover({
  label,
  min,
  max,
  onValueChange,
  open,
  onOpenChange,
  children,
  triggerClassName,
}: ScalarFilterPopoverProps & {
  min: string
  max: string
  onValueChange: (value: string[] | undefined) => void
}) {
  const [draftMin, setDraftMin] = React.useState(min)
  const [draftMax, setDraftMax] = React.useState(max)
  // Reset the drafts to the current values each time the popover opens -
  // adjusted during render (React's documented pattern for this), not in an
  // effect, so opening never costs an extra render.
  const [wasOpen, setWasOpen] = React.useState(open)
  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) {
      setDraftMin(min)
      setDraftMax(max)
    }
  }

  const apply = () => {
    onValueChange(draftMin || draftMax ? [draftMin, draftMax] : undefined)
    onOpenChange(false)
  }

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger
        aria-label={`Filter by ${label}`}
        className={triggerClassName}
      >
        {children}
      </PopoverTrigger>
      <PopoverContent align="start" className="w-64">
        <form
          className="flex flex-col gap-2"
          onSubmit={(event) => {
            event.preventDefault()
            apply()
          }}
        >
          <span className="text-xs font-medium text-muted-foreground">
            {label}
          </span>
          <div className="flex items-center gap-2">
            <Input
              autoFocus
              type="number"
              inputMode="decimal"
              value={draftMin}
              onChange={(event) => setDraftMin(event.target.value)}
              placeholder="Min"
              aria-label={`Minimum ${label}`}
            />
            <span aria-hidden className="text-muted-foreground">
              –
            </span>
            <Input
              type="number"
              inputMode="decimal"
              value={draftMax}
              onChange={(event) => setDraftMax(event.target.value)}
              placeholder="Max"
              aria-label={`Maximum ${label}`}
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              className="rounded-sm px-2 py-1 text-sm text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
              onClick={() => {
                setDraftMin("")
                setDraftMax("")
                onValueChange(undefined)
                onOpenChange(false)
              }}
            >
              Clear
            </button>
            <Button type="submit" size="sm">
              Apply
            </Button>
          </div>
        </form>
      </PopoverContent>
    </Popover>
  )
}

/** Fetches a column's options whenever the popover is open and the query changes. Only meaningful for `select`/`multi-select`. */
function useColumnFilterOptions(
  columnId: string,
  query: string,
  open: boolean,
  getColumnOptions: (
    columnId: string,
    query?: string
  ) => Promise<FilterOption[]>
) {
  // `loading` is derived from comparing the request key each render fetched
  // options for, rather than a separate flag set to `true` synchronously at
  // the top of the effect - `setResult` only ever runs inside the async
  // `.then()`, never synchronously in the effect body.
  const requestKey = open ? `${columnId}:${query}` : null
  const [result, setResult] = React.useState<{
    key: string
    options: FilterOption[]
  } | null>(null)

  React.useEffect(() => {
    if (!requestKey) return
    let cancelled = false
    Promise.resolve(getColumnOptions(columnId, query)).then((options) => {
      if (!cancelled) setResult({ key: requestKey, options })
    })
    return () => {
      cancelled = true
    }
  }, [requestKey, query, columnId, getColumnOptions])

  const options = result?.key === requestKey ? result.options : []
  const loading = requestKey != null && result?.key !== requestKey

  return { options, loading }
}

export { DataTableColumnFilterPopover, useColumnFilterOptions }
