"use client"

import * as React from "react"
import type { RowData } from "@tanstack/react-table"
import {
  ChevronDownIcon,
  CirclePlusIcon,
  SearchIcon,
  XCircleIcon,
} from "lucide-react"

import { withFilter } from "@/registry/fujin/lib/data-table/filter-codec"
import type { FilterValue } from "@/registry/fujin/lib/data-table/types"
import type { DataTableInstance } from "@/registry/fujin/lib/data-table/use-data-table"
import type { UseDataTableViewsResult } from "@/registry/fujin/lib/data-table/use-data-table-views"
import {
  useFilterSearch,
  type FilterSuggestionGroup,
} from "@/registry/fujin/lib/data-table/use-filter-search"
import { cn } from "@/registry/fujin/lib/utils"
import { Button } from "@/registry/fujin/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/registry/fujin/ui/dropdown-menu"
import { Popover, PopoverContent } from "@/registry/fujin/ui/popover"

import { DataTableDisplayOptions } from "./data-table-display-options"
import { DataTableFilterChip } from "./data-table-filter-chip"
import {
  DataTableViewMenu,
  DataTableViewNameForm,
} from "./data-table-view-menu"

export type DataTableFilterBarProps<TData extends RowData> = {
  table: DataTableInstance<TData>
  views: UseDataTableViewsResult
  /** `false` hides free-text search; the box then only adds filters. */
  search?: false | { placeholder?: string; label?: string }
  /** Show the sort and columns panel. Default true. */
  displayOptions?: boolean
  /** Extra controls at the end of the bar (Export, a primary action). */
  actions?: React.ReactNode
  className?: string
}

/**
 * The Shopify admin search and filter bar: one field holding the view menu
 * ("All ⇅"), the applied filters as chips, the search text, ⊕ to add a
 * filter and ⓧ to go back to the view; Save and the display options sit
 * beside it. Typed GitHub qualifiers (`status:active`) turn into chips too.
 */
function DataTableFilterBar<TData extends RowData>({
  table,
  views,
  search = {},
  displayOptions = true,
  actions,
  className,
}: DataTableFilterBarProps<TData>) {
  const { list, filters: defs } = table
  const applied = list.filters
  const chipRefs = React.useRef(new Map<string, HTMLButtonElement>())

  const [openKey, setOpenKey] = React.useState<string | null>(null)
  // A chip opened from the search box hands focus back to the box on close.
  const [returnToInput, setReturnToInput] = React.useState(false)
  // Applied filters, plus the one being added while its picker is open.
  const chipDefs = defs.filter(
    (def) => applied[def.key] !== undefined || def.key === openKey
  )

  const allViews = [...views.views, ...views.savedViews]
  const filterSearch = useFilterSearch({
    defs,
    list,
    allowText: search !== false,
    showFilters: defs.length > 0,
    onOpenFilter: (key) => {
      setReturnToInput(true)
      setOpenKey(key)
    },
    onFocusLastChip:
      chipDefs.length > 0 ? () => focusChip(chipDefs.length - 1) : undefined,
    views: views.enabled ? allViews : undefined,
    onSelectView: views.enabled ? views.select : undefined,
  })

  const setFilter = (key: string, value: FilterValue | undefined) =>
    list.update({ filters: withFilter(applied, key, value) })

  function focusChip(index: number) {
    const def = chipDefs[index]
    if (def) chipRefs.current.get(def.key)?.focus()
    else if (index >= chipDefs.length) filterSearch.focus()
  }

  const removeChip = (index: number) => {
    const def = chipDefs[index]
    if (!def) return
    if (openKey === def.key) setOpenKey(null)
    setFilter(def.key, undefined)
    const previous = chipDefs[index - 1]
    if (previous) chipRefs.current.get(previous.key)?.focus()
    else filterSearch.focus()
  }

  const isModified = views.enabled ? views.isModified : table.isFiltered
  const clearAll = () => {
    setOpenKey(null)
    if (views.enabled) views.revert()
    else list.update({ q: undefined, filters: {} })
    filterSearch.focus()
  }

  const placeholder =
    chipDefs.length > 0
      ? undefined
      : search === false
        ? "Filter"
        : (search.placeholder ?? "Search and filter")

  return (
    <div
      data-slot="data-table-filter-bar"
      className={cn("flex flex-wrap items-center gap-2 p-2", className)}
    >
      <div
        role="search"
        aria-label={
          search === false ? "Filter" : (search.label ?? "Search and filter")
        }
        data-slot="data-table-search"
        className="relative flex min-h-9 min-w-64 flex-1 basis-80 flex-wrap items-center gap-1 rounded-md border border-input bg-background p-1 shadow-xs transition-[color,box-shadow] focus-within:border-ring focus-within:ring-2 focus-within:ring-ring dark:bg-input/30"
      >
        {views.enabled ? (
          <DataTableViewMenu views={views} />
        ) : (
          <SearchIcon
            aria-hidden
            className="mx-1 size-4 shrink-0 text-muted-foreground"
          />
        )}
        <div aria-live="polite" className="contents">
          {chipDefs.map((def, index) => (
            <DataTableFilterChip
              key={def.key}
              def={def}
              value={applied[def.key]}
              open={openKey === def.key}
              onOpenChange={(open) => {
                if (open) setReturnToInput(false)
                else if (returnToInput) filterSearch.suppressNextOpen()
                setOpenKey(open ? def.key : null)
              }}
              onChange={(value) => setFilter(def.key, value)}
              onRemove={() => removeChip(index)}
              onNavigate={(direction) => focusChip(index + direction)}
              finalFocus={returnToInput ? filterSearch.inputRef : undefined}
              ref={(element) => {
                if (element) chipRefs.current.set(def.key, element)
                else chipRefs.current.delete(def.key)
              }}
            />
          ))}
        </div>
        <input
          {...filterSearch.inputProps}
          aria-label={
            search === false
              ? "Add a filter"
              : (search.label ?? "Search and filter")
          }
          placeholder={placeholder}
          className="h-7 min-w-24 flex-1 bg-transparent px-1 text-sm outline-none placeholder:text-muted-foreground"
        />
        <SuggestionList search={filterSearch} />
        {defs.length > 0 ? (
          <Button
            variant="ghost"
            size="icon-xs"
            className="size-6 shrink-0 text-muted-foreground"
            aria-label="Add filter"
            title="Add filter"
            onClick={() => filterSearch.focus({ open: true })}
          >
            <CirclePlusIcon aria-hidden className="size-4" />
          </Button>
        ) : null}
        {isModified ? (
          <Button
            variant="ghost"
            size="icon-xs"
            className="size-6 shrink-0 text-muted-foreground"
            aria-label={
              views.enabled
                ? `Clear changes to ${views.selected?.label ?? "view"}`
                : "Clear search and filters"
            }
            title="Clear all"
            onClick={clearAll}
          >
            <XCircleIcon aria-hidden className="size-4" />
          </Button>
        ) : null}
      </div>
      <div className="ml-auto flex items-center gap-1.5">
        {views.canSave && views.isModified ? (
          <SaveViewControl views={views} />
        ) : null}
        {displayOptions ? <DataTableDisplayOptions table={table} /> : null}
        {actions}
      </div>
      {filterSearch.warnings.length > 0 ? (
        <p role="status" className="basis-full px-1 text-xs text-destructive">
          {filterSearch.warnings.join(" ")}
        </p>
      ) : null}
    </div>
  )
}

function SuggestionList({
  search,
}: {
  search: ReturnType<typeof useFilterSearch>
}) {
  if (!search.open) return null
  return (
    <div
      id={search.listboxId}
      role="listbox"
      aria-label="Suggestions"
      data-slot="data-table-search-suggestions"
      className="absolute top-full right-0 left-0 z-50 mt-1 max-h-80 overflow-y-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md"
    >
      {search.hints.map((hint) => (
        <div
          key={hint.id}
          className="px-2 py-1.5 text-xs text-muted-foreground"
        >
          {hint.message}
        </div>
      ))}
      {search.groups.map((group) => (
        <div key={group.id} role="group" aria-label={group.heading}>
          <div
            aria-hidden
            className="px-2 pt-1.5 pb-1 text-xs font-medium text-muted-foreground"
          >
            {group.heading}
          </div>
          {group.items.map((item) => (
            <SuggestionOption key={item.id} item={item} search={search} />
          ))}
        </div>
      ))}
    </div>
  )
}

function SuggestionOption({
  item,
  search,
}: {
  item: FilterSuggestionGroup["items"][number]
  search: ReturnType<typeof useFilterSearch>
}) {
  const index = search.indexOf(item)
  const highlighted = index === search.activeIndex
  return (
    // Combobox pattern: focus stays in the input, which handles the keys;
    // this option is announced through aria-activedescendant.
    <div
      id={search.optionId(index)}
      role="option"
      aria-selected={highlighted}
      data-highlighted={highlighted || undefined}
      onMouseDown={(event) => event.preventDefault()}
      onMouseMove={() => search.setHighlight(index)}
      onClick={item.apply}
      className="flex min-h-8 cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm select-none data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground"
    >
      {item.kind === "field" ? (
        <span className="truncate">{item.def.label}</span>
      ) : item.kind === "view" ? (
        <span className="truncate">{item.view.label}</span>
      ) : (
        <span className="min-w-0 truncate">
          {item.def.label} {item.negated ? "is not" : "is"}{" "}
          <span className="font-medium">{item.option.label}</span>
          {item.option.description ? (
            <span className="ml-2 text-xs text-muted-foreground">
              {item.option.description}
            </span>
          ) : null}
        </span>
      )}
      {highlighted ? (
        <kbd
          aria-hidden
          className="ml-auto rounded border bg-background px-1.5 font-sans text-xs text-muted-foreground"
        >
          Enter
        </kbd>
      ) : null}
    </div>
  )
}

/** "Save": a built-in view saves as a new view; a saved one can also be updated. */
function SaveViewControl({ views }: { views: UseDataTableViewsResult }) {
  const anchorRef = React.useRef<HTMLButtonElement>(null)
  const [naming, setNaming] = React.useState(false)
  const selected = views.selected

  return (
    <>
      {views.selectedIsSaved && selected ? (
        <DropdownMenu>
          <DropdownMenuTrigger
            ref={anchorRef}
            render={<Button variant="outline" size="sm" />}
          >
            Save
            <ChevronDownIcon aria-hidden />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={views.saveSelected}>
              Update view
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setNaming(true)}>
              Save as new view
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <Button
          ref={anchorRef}
          variant="outline"
          size="sm"
          onClick={() => setNaming(true)}
        >
          Save as
        </Button>
      )}
      <Popover open={naming} onOpenChange={setNaming}>
        <PopoverContent
          anchor={anchorRef}
          align="end"
          className="w-80"
          finalFocus={anchorRef}
        >
          <DataTableViewNameForm
            title="Save view as"
            submitLabel="Save"
            isAvailable={(name) => views.isLabelAvailable(name)}
            onSubmit={(name) => {
              views.saveAs(name)
              setNaming(false)
            }}
            onCancel={() => setNaming(false)}
          />
        </PopoverContent>
      </Popover>
    </>
  )
}

export { DataTableFilterBar }
