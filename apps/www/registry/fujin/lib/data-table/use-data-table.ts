"use client"

import * as React from "react"
import {
  useTable,
  type Column,
  type ColumnOrderState,
  type ReactTable,
  type Row,
  type RowData,
  type SortingState,
  type ColumnVisibilityState,
  type Updater,
} from "@tanstack/react-table"

import { dataTableFeatures, type DataTableFeatures } from "./features"
import {
  cellText,
  formatSort,
  matchFilterValue,
  parseSort,
} from "./filter-codec"
import { tokenizeQuery } from "./query-syntax"
import type {
  DataTableColumnDef,
  DataTableColumnMeta,
  DataTableMode,
  FilterDef,
  ListQuery,
  ListState,
  PaginationState,
  SelectionDescriptor,
  SortOption,
} from "./types"
import { useLocalListState } from "./use-list-state"
import { usePersistedState } from "./use-persisted-state"
import { useDataTableSelection } from "./use-data-table-selection"

export { dataTableFeatures }

type CommonOptions<TData extends RowData> = {
  /** Client mode: every row. Server mode: the current page, already filtered and sorted. */
  data: readonly TData[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- column value types vary per column
  columns: DataTableColumnDef<TData, any>[]
  /** What the search bar, chips and header menus can filter on. */
  filters?: readonly FilterDef<TData>[]
  /**
   * Search, sort and filters. `useUrlListState` keeps them in the URL,
   * `useLocalListState` in React state (the default when omitted).
   */
  list?: ListState
  /** Controlled pagination (`useUrlListState` provides both). */
  pagination?: PaginationState
  onPaginationChange?: (pagination: PaginationState) => void
  /** Default 20. */
  defaultPageSize?: number
  /** `false` renders every row on one page (client mode). Default true. */
  paginate?: boolean
  /** Sort menu entries. Derived from the sortable columns when omitted. */
  sortOptions?: readonly SortOption[]
  /**
   * Persists column visibility and order in this browser under this id, and
   * is the default storage key for saved views.
   */
  tableId?: string
  initialColumnVisibility?: ColumnVisibilityState
  initialColumnOrder?: ColumnOrderState
  /** Controlled selection. */
  selection?: SelectionDescriptor
  onSelectionChange?: (selection: SelectionDescriptor) => void
}

type ClientOptions<TData extends RowData> = CommonOptions<TData> & {
  /** `"client"` (default): the table filters, searches, sorts and pages `data` itself. */
  mode?: "client"
  /** Stable row id. Defaults to the row index, which is fine for a fixed client-side list. */
  getRowId?: (row: TData, index: number) => string
  rowCount?: undefined
}

type ServerOptions<TData extends RowData> = CommonOptions<TData> & {
  /**
   * `"server"`: `data` is one page your API already filtered, searched,
   * sorted and paged, using `list` (see `useUrlListState().params`).
   */
  mode: "server"
  /**
   * Required: ids must be unique across pages, or "select all" and
   * cross-page selection would confuse row 3 of page 1 with row 3 of page 2.
   */
  getRowId: (row: TData, index: number) => string
  /** Required: total rows matching the query, for pagination and "Select all N". */
  rowCount: number
}

export type UseDataTableOptions<TData extends RowData> =
  ClientOptions<TData> | ServerOptions<TData>

type ColumnPrefs = {
  visibility: ColumnVisibilityState
  order: ColumnOrderState
}

function isColumnPrefs(value: unknown): value is ColumnPrefs {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as ColumnPrefs).visibility === "object" &&
    Array.isArray((value as ColumnPrefs).order)
  )
}

type AnyColumnDef<TData extends RowData> = DataTableColumnDef<
  TData,
  unknown
> & {
  accessorKey?: unknown
  accessorFn?: (row: TData, index: number) => unknown
  columns?: AnyColumnDef<TData>[]
}

type LeafAccessor<TData> = {
  id: string
  meta: DataTableColumnMeta | undefined
  get: (row: TData, index: number) => unknown
}

/** Leaf columns with an accessor, id resolved the way TanStack v9 does it. */
function leafAccessors<TData extends RowData>(
  defs: readonly AnyColumnDef<TData>[]
): LeafAccessor<TData>[] {
  const out: LeafAccessor<TData>[] = []
  for (const def of defs) {
    if (def.columns?.length) {
      out.push(...leafAccessors(def.columns))
      continue
    }
    const key =
      typeof def.accessorKey === "string" || typeof def.accessorKey === "number"
        ? String(def.accessorKey)
        : undefined
    const id =
      def.id ??
      key?.replaceAll(".", "_") ??
      (typeof def.header === "string" ? def.header : undefined)
    if (!id) continue
    const accessorFn = def.accessorFn
    let get: LeafAccessor<TData>["get"] | undefined
    if (accessorFn) {
      get = accessorFn
    } else if (key !== undefined) {
      const path = key.split(".")
      get = (row) =>
        path.reduce<unknown>(
          (value, part) =>
            value == null
              ? undefined
              : (value as Record<string, unknown>)[part],
          row
        )
    }
    if (get) out.push({ id, meta: def.meta, get })
  }
  return out
}

/** Search terms: words, and "quoted phrases" kept whole. */
function searchTerms(q: string): string[] {
  return tokenizeQuery(q)
    .map((token) =>
      (token.quoted ? token.value : token.raw).trim().toLowerCase()
    )
    .filter(Boolean)
}

function resolve<T>(updater: Updater<T>, current: T): T {
  return typeof updater === "function"
    ? (updater as (old: T) => T)(current)
    : updater
}

const DEFAULT_PAGE_SIZE = 20
const NO_FILTERS: never[] = []

function columnLabel<TData extends RowData>(
  column: Column<DataTableFeatures, TData, unknown>
): string {
  const { meta, header } = column.columnDef
  return meta?.label ?? (typeof header === "string" ? header : column.id)
}

/**
 * Builds everything `<DataTable>` renders: the TanStack table, list state,
 * filters, selection and column preferences. Rendering is `<DataTable>`'s
 * job; this hook holds no markup.
 */
export function useDataTable<TData extends RowData>(
  options: UseDataTableOptions<TData>
) {
  const {
    data,
    columns,
    filters: filterDefs = NO_FILTERS,
    list: listProp,
    pagination: paginationProp,
    onPaginationChange,
    defaultPageSize = DEFAULT_PAGE_SIZE,
    paginate = true,
    sortOptions: sortOptionsProp,
    tableId,
    initialColumnVisibility,
    initialColumnOrder,
    selection: selectionProp,
    onSelectionChange,
  } = options
  const mode: DataTableMode = options.mode ?? "client"
  const server = mode === "server"

  /* ------------------------------ list state ------------------------------ */
  const localList = useLocalListState()
  const list = listProp ?? localList

  /* ------------------------ client-mode filtering ------------------------- */
  const accessors = React.useMemo(
    () => leafAccessors(columns as AnyColumnDef<TData>[]),
    [columns]
  )

  const filtered = React.useMemo(() => {
    if (server) return data
    const tests: Array<(row: TData, index: number) => boolean> = []

    for (const def of filterDefs) {
      const value = list.filters[def.key]
      if (!value) continue
      const column = accessors.find(
        (a) => a.meta?.filterKey === def.key || a.id === def.key
      )
      const get = def.getValue ?? column?.get
      if (!get) continue
      tests.push((row, index) => matchFilterValue(get(row, index), value))
    }

    const terms = searchTerms(list.q ?? "")
    if (terms.length > 0) {
      const searchable = accessors.filter((a) => a.meta?.searchable !== false)
      tests.push((row, index) => {
        const haystack = searchable
          .map((a) => cellText(a.get(row, index)).toLowerCase())
          .join("\u0000")
        return terms.every((term) => haystack.includes(term))
      })
    }

    if (tests.length === 0) return data
    return data.filter((row, index) => tests.every((test) => test(row, index)))
  }, [accessors, data, filterDefs, list.filters, list.q, server])

  /* ------------------------------ pagination ------------------------------ */
  const [internalPagination, setInternalPagination] =
    React.useState<PaginationState>({ pageIndex: 0, pageSize: defaultPageSize })
  const pagination = paginationProp ?? internalPagination
  const setPagination = React.useCallback(
    (next: PaginationState) => {
      if (!paginationProp) setInternalPagination(next)
      onPaginationChange?.(next)
    },
    [onPaginationChange, paginationProp]
  )

  // A different query is a different list: back to its first page, and drop
  // the selection ("all matching" would otherwise silently change meaning).
  const queryKey = JSON.stringify([list.q ?? "", list.filters])
  const [lastQueryKey, setLastQueryKey] = React.useState(queryKey)
  if (lastQueryKey !== queryKey) {
    setLastQueryKey(queryKey)
    if (!paginationProp && internalPagination.pageIndex !== 0) {
      setInternalPagination({ ...internalPagination, pageIndex: 0 })
    }
  }

  const rowCount =
    options.mode === "server" ? options.rowCount : filtered.length
  // Past the last page (rows were filtered away or deleted): show the last one.
  const pageCount = Math.max(Math.ceil(rowCount / pagination.pageSize), 1)
  const effectivePagination = React.useMemo<PaginationState>(
    () =>
      paginate
        ? {
            pageIndex: Math.min(pagination.pageIndex, pageCount - 1),
            pageSize: pagination.pageSize,
          }
        : { pageIndex: 0, pageSize: Math.max(filtered.length, 1) },
    [filtered.length, pageCount, paginate, pagination]
  )

  /* --------------------------------- sort --------------------------------- */
  const sortFieldOf = React.useCallback(
    (column: Column<DataTableFeatures, TData, unknown>) => {
      const meta = column.columnDef.meta
      if (meta?.sortField) return meta.sortField
      if (server) {
        return column.columnDef.enableSorting === true ? column.id : undefined
      }
      return column.getCanSort() ? column.id : undefined
    },
    [server]
  )

  // `sort` names a field; TanStack wants the column showing it.
  const sorting = React.useMemo<SortingState>(() => {
    const parsed = parseSort(list.sort)
    if (!parsed) return []
    const match = accessors.find(
      (a) => (a.meta?.sortField ?? a.id) === parsed.field
    )
    return [
      { id: match?.id ?? parsed.field, desc: parsed.direction === "desc" },
    ]
  }, [accessors, list.sort])

  /* --------------------------- column preferences -------------------------- */
  const defaultPrefs = React.useMemo<ColumnPrefs>(
    () => ({
      visibility: initialColumnVisibility ?? {},
      order: initialColumnOrder ?? [],
    }),
    [initialColumnOrder, initialColumnVisibility]
  )
  const [prefs, setPrefs, resetPrefs] = usePersistedState(
    tableId ? `fujin-data-table:${tableId}:columns` : undefined,
    defaultPrefs,
    isColumnPrefs
  )

  /* --------------------------------- table -------------------------------- */
  const core = useTable({
    features: dataTableFeatures,
    data: filtered as TData[],
    columns,
    getRowId: options.getRowId,
    state: {
      sorting,
      pagination: effectivePagination,
      columnVisibility: prefs.visibility,
      columnOrder: prefs.order,
    },
    onSortingChange: (updater) => {
      const first = resolve(updater, sorting)[0]
      const column = first ? core.getColumn(first.id) : undefined
      const field = column ? sortFieldOf(column) : undefined
      list.update({
        sort:
          first && field
            ? formatSort({ field, direction: first.desc ? "desc" : "asc" })
            : undefined,
      })
    },
    onPaginationChange: (updater) =>
      setPagination(resolve(updater, effectivePagination)),
    onColumnVisibilityChange: (updater) =>
      setPrefs((prev) => ({
        ...prev,
        visibility: resolve(updater, prev.visibility),
      })),
    onColumnOrderChange: (updater) =>
      setPrefs((prev) => ({ ...prev, order: resolve(updater, prev.order) })),
    enableMultiSort: false,
    manualSorting: server,
    manualPagination: server || !paginate,
    autoResetPageIndex: false,
    rowCount,
  })

  const rows = core.getRowModel().rows as Row<DataTableFeatures, TData>[]
  const pageRowIds = rows.map((row) => row.id)

  /* ------------------------------- selection ------------------------------ */
  const selection = useDataTableSelection({
    pageRowIds,
    totalRowCount: rowCount,
    value: selectionProp,
    onChange: onSelectionChange,
  })
  const { clear: clearSelection, hasSelection } = selection
  const selectionQueryKey = React.useRef(queryKey)
  React.useEffect(() => {
    if (selectionQueryKey.current === queryKey) return
    selectionQueryKey.current = queryKey
    if (hasSelection) clearSelection()
  }, [clearSelection, hasSelection, queryKey])

  /* ------------------------------ derived bits ----------------------------- */
  const sortOptions: readonly SortOption[] =
    sortOptionsProp ??
    core.getAllLeafColumns().flatMap((column) => {
      const field = sortFieldOf(column)
      return field ? [{ value: field, label: columnLabel(column) }] : []
    })

  const getFilterDef = React.useCallback(
    (column: Column<DataTableFeatures, TData, unknown>) => {
      const key = column.columnDef.meta?.filterKey ?? column.id
      return filterDefs.find((def) => def.key === key)
    },
    [filterDefs]
  )

  const isFiltered = Boolean(list.q) || Object.keys(list.filters).length > 0

  const query: ListQuery = { q: list.q, sort: list.sort, filters: list.filters }

  return {
    /** The TanStack table, for anything this API doesn't cover. */
    core,
    mode,
    tableId,
    list,
    query,
    filters: filterDefs,
    /** Rows on the current page. */
    rows,
    /** Rows matching the query across all pages. */
    rowCount,
    /** Client mode: every row matching the query (for CSV export). */
    filteredData: filtered,
    pagination: effectivePagination,
    setPagination,
    paginate,
    isFiltered,
    selection,
    sortOptions,
    sortFieldOf,
    getFilterDef,
    columnLabel,
    columnPrefs: {
      isCustomized:
        prefs.order.length > 0 ||
        Object.values(prefs.visibility).some((visible) => !visible),
      reset: resetPrefs,
    },
  }
}

export type DataTableInstance<TData extends RowData> = ReturnType<
  typeof useDataTable<TData>
>

export type { ReactTable }
