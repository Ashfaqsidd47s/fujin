import type {
  ColumnDef,
  ColumnFiltersState,
  PaginationState,
  RowData,
  SortingState,
  TableFeatures,
} from "@tanstack/react-table"

import type { DataTableFeatures } from "./features"

export type DataTableColumnDef<
  TData extends RowData,
  TValue = unknown,
> = ColumnDef<DataTableFeatures, TData, TValue>

export type FilterOption = {
  value: string
  label: string
  /** Shown next to the label - a count from `getFacetedUniqueValues()`, typically. */
  count?: number
}

/**
 * Every declared filter shape (see docs/data-table-plan.md §4, decision 8).
 * `filterFn` is wired automatically per type (`FILTER_FN_BY_TYPE` in
 * `features.ts`) so this stays correct even for the two types below with no
 * built-in control yet - only `text` | `select` | `multi-select` |
 * `number-range` render from the search bar or a header popover
 * (`FILTER_TYPES_WITH_UI`). `date-range` and `boolean` are reserved for a
 * later release; a column declaring one is skipped by both entry points
 * rather than shown with a broken control - see the pitfall in
 * `components/_registry.ts`.
 */
export type FilterType =
  "text" | "select" | "multi-select" | "date-range" | "number-range" | "boolean"

/**
 * Declared on a column's `meta.filter` to make it filterable from both the
 * unified search bar and its own header popover. Both entry points read
 * this same config, which is the point: one filter, two ways to reach it.
 */
export type DataTableFilterConfig<TData extends RowData> = {
  type: FilterType
  /**
   * Supplies the list of pickable values for `select`/`multi-select`. Omit
   * for `text`/`number-range`, where there is nothing to enumerate. In
   * client mode, when a `select`/`multi-select` column has no `getOptions`,
   * the unique values already loaded are used instead (via
   * `column.getFacetedUniqueValues()`); in server mode without `getOptions`
   * the picker shows no values, since one page can't be trusted to
   * enumerate every value across the full dataset.
   */
  getOptions?: (query: string) => FilterOption[] | Promise<FilterOption[]>
}

/** Declared once per column via TanStack's `meta` - see `declare module` below. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface DataTableColumnMeta<TData extends RowData = any> {
  /** Display label - used in the search-bar column picker and the header. */
  label?: string
  filter?: DataTableFilterConfig<TData>
}

declare module "@tanstack/table-core" {
  /* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-object-type -- module augmentation, not a redundant supertype; type params must match the augmented interface's arity */
  interface ColumnMeta<
    TFeatures extends TableFeatures,
    TData extends RowData,
    TValue,
  > extends DataTableColumnMeta<TData> {}
  /* eslint-enable @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-object-type */
}

/** One active filter pill: a column id and the operator-specific value it holds. */
export type ActiveFilter = {
  columnId: string
  label: string
  type: FilterType
  /**
   * `string[]` for `multi-select`, `string` for `select`/`text`/`boolean`,
   * `[min, max]` (as raw input strings) for `number-range`/`date-range`.
   */
  value: string[] | string | boolean
}

/**
 * Shopify-style cross-page selection: either an explicit set of included row
 * ids, or "every row matching the current filters except these excluded
 * ids" once "select all N" is chosen. Bulk actions and CSV export both take
 * this instead of a plain id array so they stay correct at any page size.
 */
export type SelectionDescriptor =
  | { type: "include"; ids: string[] }
  | { type: "exclude"; ids: string[]; total: number }

export type DataTableMode = "client" | "server"

export type { DataTableFeatures } from "./features"
export type { ColumnFiltersState, PaginationState, SortingState }
