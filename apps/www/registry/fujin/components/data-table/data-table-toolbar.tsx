"use client"

import { DownloadIcon } from "lucide-react"
import type { ReactTable, RowData } from "@tanstack/react-table"

import type { DataTableFeatures } from "@/registry/fujin/lib/data-table/features"
import { useDataTableFilters } from "@/registry/fujin/lib/data-table/use-data-table-filters"
import { cn } from "@/registry/fujin/lib/utils"
import { Button } from "@/registry/fujin/ui/button"

import { DataTableColumnVisibilityMenu } from "./data-table-column-visibility-menu"
import { DataTableFilterCombobox } from "./data-table-filter-combobox"
import {
  DataTableFilterPill,
  DataTableFilterPillRemove,
} from "./data-table-filter-pill"

export type DataTableToolbarProps<TData extends RowData> = {
  table: ReactTable<DataTableFeatures, TData>
  onExport?: () => void
  exporting?: boolean
  className?: string
}

/**
 * The unified search bar (pills + the Shopify-style column/value combobox),
 * column visibility, and export - everything above the table that isn't the
 * selection bar (which replaces this row's neighbor, the header, once rows
 * are selected).
 */
function DataTableToolbar<TData extends RowData>({
  table,
  onExport,
  exporting,
  className,
}: DataTableToolbarProps<TData>) {
  const {
    filterableColumns,
    activeFilters,
    setFilterValue,
    removeFilter,
    getColumnOptions,
    setGlobalFilter,
  } = useDataTableFilters(table)

  const availableColumns = filterableColumns.filter(
    (column) => !activeFilters.some((filter) => filter.columnId === column.id)
  )

  return (
    <div
      data-slot="data-table-toolbar"
      className={cn("flex flex-wrap items-center gap-2 p-2", className)}
    >
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5 rounded-md border border-input bg-transparent p-1 shadow-xs focus-within:border-ring focus-within:ring-2 focus-within:ring-ring">
        {activeFilters.map((filter) => (
          <div key={filter.columnId} className="flex items-stretch">
            <DataTableFilterPill
              filter={filter}
              getColumnOptions={getColumnOptions}
              setFilterValue={setFilterValue}
              onRemove={removeFilter}
            />
            <DataTableFilterPillRemove
              label={filter.label}
              onRemove={() => removeFilter(filter.columnId)}
            />
          </div>
        ))}
        <DataTableFilterCombobox
          columns={availableColumns}
          getColumnOptions={getColumnOptions}
          setFilterValue={setFilterValue}
          onGlobalSearch={setGlobalFilter}
        />
      </div>
      <DataTableColumnVisibilityMenu table={table} />
      {onExport ? (
        <Button
          variant="outline"
          size="sm"
          loading={exporting}
          onClick={onExport}
        >
          <DownloadIcon />
          Export
        </Button>
      ) : null}
    </div>
  )
}

export { DataTableToolbar }
