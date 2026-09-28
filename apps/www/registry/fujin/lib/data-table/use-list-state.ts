"use client"

import * as React from "react"
import {
  parseAsInteger,
  parseAsString,
  useQueryStates,
  type Options as NuqsOptions,
} from "nuqs"

import {
  filterParamKeys,
  normalizeFilterValues,
  parseFilterValues,
  serializeFilterValues,
} from "./filter-codec"
import type { FilterDef, ListQuery, ListState, PaginationState } from "./types"

/** Trimmed text, or undefined when blank: the URL never carries empty params. */
export function nonEmpty(value: string | undefined | null): string | undefined {
  const trimmed = value?.trim()
  return trimmed ? trimmed : undefined
}

function applyPatch(prev: ListQuery, patch: Partial<ListQuery>): ListQuery {
  return {
    q: "q" in patch ? nonEmpty(patch.q) : prev.q,
    sort: "sort" in patch ? nonEmpty(patch.sort) : prev.sort,
    filters: patch.filters
      ? normalizeFilterValues(patch.filters)
      : prev.filters,
  }
}

/**
 * List state in React state: the default when no `list` is passed to
 * `useDataTable`. Use it directly to read the query (for a fetch) or to
 * start from an initial query.
 */
export function useLocalListState(initial: Partial<ListQuery> = {}): ListState {
  const [query, setQuery] = React.useState<ListQuery>(() =>
    applyPatch({ filters: {} }, initial)
  )
  const update = React.useCallback((patch: Partial<ListQuery>) => {
    setQuery((prev) => applyPatch(prev, patch))
  }, [])
  return React.useMemo(() => ({ ...query, update }), [query, update])
}

export type UseUrlListStateOptions = {
  /** The table's filters: each one reads and writes its own flat params. */
  filters?: readonly FilterDef<never>[]
  /** Prefixes every param (`orders_status`), so two tables can share a page. */
  key?: string
  defaultPageSize?: number
  /**
   * `"push"` makes each change a history entry, so Back undoes a filter.
   * Default `"replace"`.
   */
  history?: "push" | "replace"
  /**
   * Next.js: set `false` to re-render Server Components on every change,
   * for pages that fetch in a Server Component from `searchParams`.
   * Default `true` (client-side only).
   */
  shallow?: boolean
}

export type UrlListState = ListState & {
  pagination: PaginationState
  onPaginationChange: (pagination: PaginationState) => void
  /** The query as flat API params (`q`, `sort`, `status`, `price_gte`...), ready for a fetch. */
  params: Record<string, string>
}

/**
 * List state in the URL, with readable flat params:
 * `?q=ring&status=active,draft&price_gte=10&sort=-created&page=2`.
 * Filters, search, sort and page survive a refresh and can be shared as a
 * link. Every query change goes back to the first page.
 *
 * Needs a `<NuqsAdapter>` mounted once near the app root
 * (`nuqs/adapters/next/app` or `nuqs/adapters/react`).
 */
export function useUrlListState({
  filters: defs = [],
  key = "",
  defaultPageSize = 20,
  history = "replace",
  shallow = true,
}: UseUrlListStateOptions = {}): UrlListState {
  const prefixed = React.useCallback(
    (name: string) => (key ? `${key}_${name}` : name),
    [key]
  )

  const filterKeys = React.useMemo(
    () => defs.flatMap((def) => filterParamKeys(def)),
    [defs]
  )

  const parsers = React.useMemo(() => {
    const map: Record<string, typeof parseAsString> = {}
    for (const name of filterKeys) map[name] = parseAsString
    return {
      ...map,
      q: parseAsString,
      sort: parseAsString,
      page: parseAsInteger.withDefault(1),
      pageSize: parseAsInteger.withDefault(defaultPageSize),
    }
  }, [defaultPageSize, filterKeys])

  const urlKeys = React.useMemo(() => {
    const keys: Record<string, string> = {}
    for (const name of Object.keys(parsers)) keys[name] = prefixed(name)
    return keys
  }, [parsers, prefixed])

  const options: NuqsOptions = { history, shallow, scroll: false }
  const [state, setState] = useQueryStates(parsers, { ...options, urlKeys })

  const q = nonEmpty(state.q)
  const sort = nonEmpty(state.sort)
  // Re-parse only when one of this table's filter params changes, so
  // `filters` keeps its identity across page and sort changes.
  const raw = state as Record<string, unknown>
  const filterParams = filterKeys
    .map((name) => `${name}=${encodeURIComponent(String(raw[name] ?? ""))}`)
    .join("&")
  const filters = React.useMemo(
    () =>
      parseFilterValues(
        defs,
        Object.fromEntries(new URLSearchParams(filterParams))
      ),
    [defs, filterParams]
  )

  const update = React.useCallback(
    (patch: Partial<ListQuery>) => {
      const next: Record<string, string | number | null> = { page: null }
      if ("q" in patch) next.q = nonEmpty(patch.q) ?? null
      if ("sort" in patch) next.sort = nonEmpty(patch.sort) ?? null
      if (patch.filters) {
        Object.assign(
          next,
          serializeFilterValues(defs, normalizeFilterValues(patch.filters))
        )
      }
      void setState(next as Parameters<typeof setState>[0])
    },
    [defs, setState]
  )

  const pagination = React.useMemo<PaginationState>(
    () => ({
      pageIndex: Math.max(state.page - 1, 0),
      pageSize: state.pageSize,
    }),
    [state.page, state.pageSize]
  )

  const onPaginationChange = React.useCallback(
    (next: PaginationState) => {
      void setState({
        page: next.pageIndex === 0 ? null : next.pageIndex + 1,
        pageSize: next.pageSize === defaultPageSize ? null : next.pageSize,
      } as Parameters<typeof setState>[0])
    },
    [defaultPageSize, setState]
  )

  const params = React.useMemo(() => {
    const out: Record<string, string> = {}
    if (q) out.q = q
    if (sort) out.sort = sort
    for (const [name, value] of Object.entries(
      serializeFilterValues(defs, filters)
    )) {
      if (value !== null) out[name] = value
    }
    return out
  }, [defs, filters, q, sort])

  return React.useMemo(
    () => ({
      q,
      sort,
      filters,
      update,
      pagination,
      onPaginationChange,
      params,
    }),
    [filters, onPaginationChange, pagination, params, q, sort, update]
  )
}
