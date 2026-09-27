"use client"

import {
  parseAsInteger,
  parseAsJson,
  parseAsString,
  useQueryStates,
} from "nuqs"

import type { ColumnFiltersState, PaginationState, SortingState } from "./types"

function isSortingState(value: unknown): value is SortingState {
  return Array.isArray(value)
}

function isColumnFiltersState(value: unknown): value is ColumnFiltersState {
  return Array.isArray(value)
}

const sortingParser = parseAsJson<SortingState>((value) =>
  isSortingState(value) ? value : null
).withDefault([])

const filtersParser = parseAsJson<ColumnFiltersState>((value) =>
  isColumnFiltersState(value) ? value : null
).withDefault([])

export type UseDataTableUrlStateOptions = {
  /** Prefixes every param name, so more than one table can share a page. */
  key?: string
  defaultPageSize?: number
}

/**
 * Binds `useDataTable`'s controlled props to the URL via `nuqs`, so filters,
 * sort and pagination survive a refresh and can be shared as a link (the
 * URL-state decision in docs/data-table-plan.md). Optional - plain
 * `useState` works just as well when that isn't needed.
 *
 * Requires a `<NuqsAdapter>` mounted once near the app root (`nuqs/adapters/next`
 * or `nuqs/adapters/react`, depending on the framework).
 */
export function useDataTableUrlState({
  key = "",
  defaultPageSize = 20,
}: UseDataTableUrlStateOptions = {}) {
  const prefixed = (name: string) => (key ? `${key}_${name}` : name)

  const [state, setState] = useQueryStates(
    {
      sort: sortingParser,
      filters: filtersParser,
      q: parseAsString.withDefault(""),
      page: parseAsInteger.withDefault(0),
      pageSize: parseAsInteger.withDefault(defaultPageSize),
    },
    {
      urlKeys: {
        sort: prefixed("sort"),
        filters: prefixed("filters"),
        q: prefixed("q"),
        page: prefixed("page"),
        pageSize: prefixed("pageSize"),
      },
    }
  )

  const pagination: PaginationState = {
    pageIndex: state.page,
    pageSize: state.pageSize,
  }

  return {
    sorting: state.sort,
    onSortingChange: (sorting: SortingState) =>
      setState({ sort: sorting, page: 0 }),
    columnFilters: state.filters,
    onColumnFiltersChange: (filters: ColumnFiltersState) =>
      setState({ filters, page: 0 }),
    globalFilter: state.q,
    onGlobalFilterChange: (q: string) => setState({ q, page: 0 }),
    pagination,
    onPaginationChange: (next: PaginationState) =>
      setState({ page: next.pageIndex, pageSize: next.pageSize }),
  }
}
