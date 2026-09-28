"use client"

import * as React from "react"
import type { Header, RowData } from "@tanstack/react-table"
import {
  ArrowDownIcon,
  ArrowUpIcon,
  ChevronDownIcon,
  ChevronsUpDownIcon,
  EyeOffIcon,
  ListFilterIcon,
  XIcon,
} from "lucide-react"

import type { DataTableFeatures } from "@/registry/fujin/lib/data-table/features"
import {
  isEmptyFilterValue,
  parseSort,
  toggleSort,
  withFilter,
} from "@/registry/fujin/lib/data-table/filter-codec"
import type { DataTableInstance } from "@/registry/fujin/lib/data-table/use-data-table"
import { cn } from "@/registry/fujin/lib/utils"
import { Button } from "@/registry/fujin/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/registry/fujin/ui/dropdown-menu"
import { Popover, PopoverContent } from "@/registry/fujin/ui/popover"

import { DataTableFilterPicker } from "./data-table-filter-picker"

export type DataTableColumnHeaderProps<TData extends RowData> = {
  table: DataTableInstance<TData>
  header: Header<DataTableFeatures, TData, unknown>
}

/**
 * A header cell's content: click the label to sort (none, ascending,
 * descending), or open its menu to sort, filter by this column (the same
 * picker and state as the search bar's chips), or hide it.
 */
function DataTableColumnHeader<TData extends RowData>({
  table,
  header,
}: DataTableColumnHeaderProps<TData>) {
  const { column } = header
  const anchorRef = React.useRef<HTMLDivElement>(null)
  const menuTriggerRef = React.useRef<HTMLButtonElement>(null)
  const [filterOpen, setFilterOpen] = React.useState(false)
  // "Filter" opens the popover after the menu has closed and returned focus,
  // or the focus return would count as an outside click and close it.
  const openFilterAfterMenu = React.useRef(false)

  const label = table.columnLabel(column)
  const align = column.columnDef.meta?.align ?? "start"
  const sortField = table.sortFieldOf(column)
  const state = parseSort(table.list.sort)
  const sorted =
    sortField !== undefined && state?.field === sortField
      ? state.direction
      : undefined
  const filterDef = table.getFilterDef(column)
  const filterValue = filterDef ? table.list.filters[filterDef.key] : undefined
  const filtered = !isEmptyFilterValue(filterValue)
  const canHide =
    column.getCanHide() && column.columnDef.meta?.lockVisibility !== true
  const hasMenu = sortField !== undefined || filterDef !== undefined || canHide
  const content = header.isPlaceholder ? null : (
    <table.core.FlexRender header={header} />
  )
  const SortIcon =
    sorted === "asc"
      ? ArrowUpIcon
      : sorted === "desc"
        ? ArrowDownIcon
        : ChevronsUpDownIcon
  const setSort = (sort: string | undefined) => table.list.update({ sort })

  return (
    <div
      ref={anchorRef}
      data-slot="data-table-column-header"
      className={cn(
        "group/head flex min-w-0 items-center gap-0.5",
        align === "end" && "flex-row-reverse",
        align === "center" && "justify-center"
      )}
    >
      {sortField !== undefined ? (
        <button
          type="button"
          onClick={() => setSort(toggleSort(table.list.sort, sortField))}
          aria-label={`${label}${sorted ? `, sorted ${sorted === "asc" ? "ascending" : "descending"}` : ""}. Sort ${sorted === "asc" ? "descending" : sorted === "desc" ? "off" : "ascending"}`}
          className={cn(
            "-mx-1.5 flex h-7 min-w-0 items-center gap-1 rounded-sm px-1.5 outline-none hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring",
            align === "end" && "flex-row-reverse"
          )}
        >
          <span className="truncate">{content}</span>
          <SortIcon
            aria-hidden
            className={cn(
              "size-3.5 shrink-0",
              sorted
                ? "text-foreground"
                : "text-muted-foreground opacity-0 group-focus-within/head:opacity-100 group-hover/head:opacity-100"
            )}
          />
        </button>
      ) : (
        <span className="truncate">{content}</span>
      )}
      {filtered ? (
        <ListFilterIcon
          aria-label={`Filtered by ${label}`}
          className="size-3.5 shrink-0 text-primary"
        />
      ) : null}
      {hasMenu ? (
        <DropdownMenu>
          <DropdownMenuTrigger
            ref={menuTriggerRef}
            render={
              <Button
                variant="ghost"
                size="icon-xs"
                aria-label={`${label} column options`}
                className="size-6 shrink-0 text-muted-foreground opacity-0 group-hover/head:opacity-100 focus-visible:opacity-100 data-[popup-open]:opacity-100 pointer-coarse:opacity-100"
              />
            }
          >
            <ChevronDownIcon aria-hidden />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align={align === "end" ? "end" : "start"}
            className="w-48"
            finalFocus={() => {
              if (!openFilterAfterMenu.current) return true
              openFilterAfterMenu.current = false
              setFilterOpen(true)
              return false
            }}
          >
            {sortField !== undefined ? (
              <>
                <DropdownMenuItem onClick={() => setSort(sortField)}>
                  <ArrowUpIcon aria-hidden />
                  Sort ascending
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSort(`-${sortField}`)}>
                  <ArrowDownIcon aria-hidden />
                  Sort descending
                </DropdownMenuItem>
                {sorted ? (
                  <DropdownMenuItem onClick={() => setSort(undefined)}>
                    <XIcon aria-hidden />
                    Clear sort
                  </DropdownMenuItem>
                ) : null}
              </>
            ) : null}
            {filterDef ? (
              <>
                {sortField !== undefined ? <DropdownMenuSeparator /> : null}
                <DropdownMenuItem
                  onClick={() => {
                    openFilterAfterMenu.current = true
                  }}
                >
                  <ListFilterIcon aria-hidden />
                  {filtered ? "Edit filter" : "Filter"}
                </DropdownMenuItem>
              </>
            ) : null}
            {canHide ? (
              <>
                {sortField !== undefined || filterDef ? (
                  <DropdownMenuSeparator />
                ) : null}
                <DropdownMenuItem
                  onClick={() => column.toggleVisibility(false)}
                >
                  <EyeOffIcon aria-hidden />
                  Hide column
                </DropdownMenuItem>
              </>
            ) : null}
          </DropdownMenuContent>
        </DropdownMenu>
      ) : null}
      {filterDef ? (
        <Popover open={filterOpen} onOpenChange={setFilterOpen}>
          <PopoverContent
            anchor={anchorRef}
            align="start"
            className="w-auto p-0"
            finalFocus={menuTriggerRef}
          >
            <DataTableFilterPicker
              def={filterDef}
              value={filterValue}
              onChange={(value) =>
                table.list.update({
                  filters: withFilter(table.list.filters, filterDef.key, value),
                })
              }
              onDone={() => setFilterOpen(false)}
            />
          </PopoverContent>
        </Popover>
      ) : null}
    </div>
  )
}

export { DataTableColumnHeader }
