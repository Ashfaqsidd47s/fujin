"use client"

import * as React from "react"
import { ChevronLeftIcon, ChevronRightIcon, SearchIcon } from "lucide-react"

import type { FilterableColumn } from "@/registry/fujin/lib/data-table/use-data-table-filters"
import type {
  ActiveFilter,
  FilterOption,
} from "@/registry/fujin/lib/data-table/types"
import { cn } from "@/registry/fujin/lib/utils"
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
  CommandPopup,
} from "@/registry/fujin/ui/command"

type PickerItem =
  | { kind: "column"; column: FilterableColumn }
  | { kind: "search"; query: string }

export type DataTableFilterComboboxProps = {
  /** Filterable columns that don't already have an active pill. */
  columns: FilterableColumn[]
  getColumnOptions: (
    columnId: string,
    query?: string
  ) => Promise<FilterOption[]>
  setFilterValue: (
    columnId: string,
    value: ActiveFilter["value"] | undefined
  ) => void
  onGlobalSearch: (query: string) => void
  className?: string
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label="Back to filters"
      onClick={onClick}
      className="flex size-6 shrink-0 items-center justify-center rounded-xs text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
    >
      <ChevronLeftIcon className="size-4" />
    </button>
  )
}

const bareInputClassName =
  "h-7 min-w-16 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"

/**
 * The Shopify-style search bar: type to get column suggestions, pick one to
 * see its values, multi-select values to build a filter, or press Enter on
 * free text to run a plain search. This only ever creates a *new* filter -
 * editing an existing one happens on its pill (`data-table-filter-pill`).
 *
 * Once a column is picked, the row branches on its `type`: `select`/
 * `multi-select` show the value-list `Command` popup, `text` shows a single
 * input, `number-range` shows a min/max pair - each applies on Enter and
 * writes the value shape that column's `filterFn` expects.
 */
function DataTableFilterCombobox({
  columns,
  getColumnOptions,
  setFilterValue,
  onGlobalSearch,
  className,
}: DataTableFilterComboboxProps) {
  const [query, setQuery] = React.useState("")
  const [pickedColumnId, setPickedColumnId] = React.useState<string | null>(
    null
  )
  const [rangeMin, setRangeMin] = React.useState("")
  const [rangeMax, setRangeMax] = React.useState("")

  const pickedColumn = columns.find((column) => column.id === pickedColumnId)
  const isListType =
    pickedColumn?.type === "select" || pickedColumn?.type === "multi-select"

  // `loadingOptions` is derived from comparing the request key each render
  // fetched options for, rather than a separate flag set to `true`
  // synchronously at the top of the effect - `setResult` only ever runs
  // inside the async `.then()`, never synchronously in the effect body.
  const requestKey =
    pickedColumnId && isListType ? `${pickedColumnId}:${query}` : null
  const [result, setResult] = React.useState<{
    key: string
    options: FilterOption[]
  } | null>(null)

  React.useEffect(() => {
    if (!requestKey || !pickedColumnId) return
    let cancelled = false
    Promise.resolve(getColumnOptions(pickedColumnId, query)).then((opts) => {
      if (!cancelled) setResult({ key: requestKey, options: opts })
    })
    return () => {
      cancelled = true
    }
  }, [requestKey, pickedColumnId, query, getColumnOptions])

  const options = result?.key === requestKey ? result.options : []
  const loadingOptions = requestKey != null && result?.key !== requestKey

  const goBack = React.useCallback(() => {
    setPickedColumnId(null)
    setQuery("")
    setRangeMin("")
    setRangeMax("")
  }, [])

  const pickerItems = React.useMemo<PickerItem[]>(() => {
    const normalizedQuery = query.trim().toLowerCase()
    const matches = normalizedQuery
      ? columns.filter((column) =>
          column.label.toLowerCase().includes(normalizedQuery)
        )
      : columns
    const items: PickerItem[] = matches.map((column) => ({
      kind: "column",
      column,
    }))
    if (query.trim()) items.push({ kind: "search", query: query.trim() })
    return items
  }, [columns, query])

  if (pickedColumnId && pickedColumn?.type === "text") {
    return (
      <div
        data-slot="data-table-filter-combobox"
        className={cn("flex h-7 min-w-40 flex-1 items-center gap-1", className)}
      >
        <BackButton onClick={goBack} />
        <input
          autoFocus
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              const trimmed = query.trim()
              if (trimmed) setFilterValue(pickedColumnId, trimmed)
              goBack()
            } else if (event.key === "Escape") {
              goBack()
            } else if (event.key === "Backspace" && query === "") {
              goBack()
            }
          }}
          placeholder={`Filter by ${pickedColumn.label}...`}
          className={bareInputClassName}
        />
      </div>
    )
  }

  if (pickedColumnId && pickedColumn?.type === "number-range") {
    return (
      <div
        data-slot="data-table-filter-combobox"
        className={cn("flex h-7 min-w-48 flex-1 items-center gap-1", className)}
      >
        <BackButton onClick={goBack} />
        <input
          autoFocus
          type="number"
          inputMode="decimal"
          value={rangeMin}
          onChange={(event) => setRangeMin(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              if (rangeMin || rangeMax) {
                setFilterValue(pickedColumnId, [rangeMin, rangeMax])
              }
              goBack()
            } else if (event.key === "Escape") {
              goBack()
            }
          }}
          placeholder="Min"
          aria-label={`Minimum ${pickedColumn.label}`}
          className={cn(bareInputClassName, "min-w-0")}
        />
        <span aria-hidden className="text-muted-foreground">
          –
        </span>
        <input
          type="number"
          inputMode="decimal"
          value={rangeMax}
          onChange={(event) => setRangeMax(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              if (rangeMin || rangeMax) {
                setFilterValue(pickedColumnId, [rangeMin, rangeMax])
              }
              goBack()
            } else if (event.key === "Escape") {
              goBack()
            }
          }}
          placeholder="Max"
          aria-label={`Maximum ${pickedColumn.label}`}
          className={cn(bareInputClassName, "min-w-0")}
        />
      </div>
    )
  }

  if (pickedColumnId) {
    return (
      <Command
        key={pickedColumnId}
        items={options}
        multiple
        defaultValue={[]}
        isItemEqualToValue={(a: FilterOption, b: FilterOption) =>
          a.value === b.value
        }
        inputValue={query}
        onInputValueChange={setQuery}
        filter={() => true}
        onValueChange={(values: FilterOption[]) => {
          if (values.length > 0) {
            setFilterValue(
              pickedColumnId,
              values.map((option) => option.value)
            )
          }
        }}
        onOpenChange={(open) => {
          if (!open) goBack()
        }}
      >
        <div
          data-slot="data-table-filter-combobox"
          className={cn(
            "flex h-7 min-w-40 flex-1 items-center gap-1",
            className
          )}
        >
          <BackButton onClick={goBack} />
          <CommandInput
            bare
            placeholder={`Filter by ${pickedColumn?.label ?? ""}...`}
            onKeyDown={(event) => {
              if (event.key === "Backspace" && query === "") goBack()
            }}
          />
        </div>
        <CommandPopup>
          {loadingOptions ? (
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
        </CommandPopup>
      </Command>
    )
  }

  return (
    <Command
      items={pickerItems}
      inputValue={query}
      onInputValueChange={setQuery}
      filter={() => true}
      onValueChange={(item: PickerItem | null) => {
        if (!item) return
        if (item.kind === "search") {
          onGlobalSearch(item.query)
          setQuery("")
        } else {
          setPickedColumnId(item.column.id)
          setQuery("")
        }
      }}
    >
      <CommandInput
        bare
        placeholder="Search or filter..."
        className={cn("min-w-40 flex-1", className)}
      />
      <CommandPopup>
        <CommandEmpty>No results.</CommandEmpty>
        <CommandList>
          {(item: PickerItem) =>
            item.kind === "search" ? (
              <CommandItem key="__search__" value={item} showIndicator={false}>
                <SearchIcon className="opacity-60" />
                Search for &quot;{item.query}&quot;
              </CommandItem>
            ) : (
              <CommandItem
                key={item.column.id}
                value={item}
                showIndicator={false}
              >
                {item.column.label}
                <ChevronRightIcon className="ml-auto opacity-60" />
              </CommandItem>
            )
          }
        </CommandList>
      </CommandPopup>
    </Command>
  )
}

export { DataTableFilterCombobox }
