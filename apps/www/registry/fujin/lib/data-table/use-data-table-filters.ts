"use client"

import * as React from "react"
import type { ReactTable, RowData } from "@tanstack/react-table"

import { FILTER_TYPES_WITH_UI, type DataTableFeatures } from "./features"
import type { ActiveFilter, FilterOption, FilterType } from "./types"

export type FilterableColumn = {
  id: string
  label: string
  type: FilterType
}

/**
 * Reads/writes the same `columnFilters` + `globalFilter` state `useDataTable`
 * already owns, shaped for UI: which columns can be filtered (from
 * `meta.filter`), the currently active pills, and a column's pickable values
 * - the one function both the search-bar combobox and a column header's
 * filter popover call, so they always show the same list.
 */
export function useDataTableFilters<TData extends RowData>(
  table: ReactTable<DataTableFeatures, TData>
) {
  const { columnFilters, globalFilter } = table.state
  const manual = table.options.manualFiltering

  const filterableColumns: FilterableColumn[] = React.useMemo(
    () =>
      table
        .getAllLeafColumns()
        .filter(
          (column) =>
            column.columnDef.meta?.filter &&
            FILTER_TYPES_WITH_UI.has(column.columnDef.meta.filter.type)
        )
        .map((column) => ({
          id: column.id,
          label: column.columnDef.meta?.label ?? column.id,
          type: column.columnDef.meta!.filter!.type,
        })),
    [table]
  )

  const activeFilters: ActiveFilter[] = React.useMemo(
    () =>
      columnFilters.flatMap((filter) => {
        const meta = table.getColumn(filter.id)?.columnDef.meta
        if (!meta?.filter) return []
        return [
          {
            columnId: filter.id,
            label: meta.label ?? filter.id,
            type: meta.filter.type,
            value: filter.value as ActiveFilter["value"],
          },
        ]
      }),
    [columnFilters, table]
  )

  const setFilterValue = React.useCallback(
    (columnId: string, value: ActiveFilter["value"] | undefined) => {
      table.getColumn(columnId)?.setFilterValue(value)
    },
    [table]
  )

  const removeFilter = React.useCallback(
    (columnId: string) => setFilterValue(columnId, undefined),
    [setFilterValue]
  )

  const clearAll = React.useCallback(() => {
    table.setColumnFilters([])
    table.setGlobalFilter("")
  }, [table])

  /**
   * The list a filter's value-picker shows. A column's own `getOptions`
   * wins; otherwise, in client mode, the values already loaded into the
   * table are used via `getFacetedUniqueValues()`. In server mode without
   * `getOptions`, there is nothing to enumerate - return no options rather
   * than guessing from one page of server-paginated data.
   */
  const getColumnOptions = React.useCallback(
    async (columnId: string, query = ""): Promise<FilterOption[]> => {
      const column = table.getColumn(columnId)
      const meta = column?.columnDef.meta
      if (!column || !meta?.filter) return []

      if (meta.filter.getOptions) return meta.filter.getOptions(query)
      if (manual) return []

      const unique = column.getFacetedUniqueValues()
      const normalizedQuery = query.toLowerCase()
      return Array.from(unique.entries())
        .map(([value, count]) => ({
          value: String(value),
          label: String(value),
          count,
        }))
        .filter((option) =>
          option.label.toLowerCase().includes(normalizedQuery)
        )
    },
    [table, manual]
  )

  return {
    filterableColumns,
    activeFilters,
    globalFilter,
    setGlobalFilter: table.setGlobalFilter,
    setFilterValue,
    removeFilter,
    clearAll,
    getColumnOptions,
  }
}

export type UseDataTableFiltersResult<TData extends RowData> = ReturnType<
  typeof useDataTableFilters<TData>
>
