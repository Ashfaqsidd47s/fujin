import type * as React from "react"
import type {
  ColumnDef,
  PaginationState,
  RowData,
  TableFeatures,
} from "@tanstack/react-table"

import type { DataTableFeatures } from "./features"

export type DataTableColumnDef<
  TData extends RowData,
  TValue = unknown,
> = ColumnDef<DataTableFeatures, TData, TValue>

/* -------------------------------------------------------------------------- */
/* Filters                                                                    */
/* -------------------------------------------------------------------------- */

export type FilterOption = {
  value: string
  label: string
  /** Secondary line under the label: an email, a SKU. */
  description?: string
  /** Facet count, shown right-aligned when known. */
  count?: number
}

export type FilterType =
  "enum" | "async" | "text" | "boolean" | "number-range" | "date-range"

type FilterDefBase<TData> = {
  /**
   * URL param name, typed-qualifier name (`status:active`) and the key in
   * `list.filters`. Keep it short and URL-safe: `status`, `vendor`.
   */
  key: string
  /** Human label: "Status", "Product type". */
  label: string
  /** Listed first when the search box offers filters. */
  pinned?: boolean
  /** Extra qualifier spellings accepted in the search box (`type:` for `productType:`). */
  aliases?: readonly string[]
  /**
   * Client mode only: the row value this filter tests. Defaults to the value
   * of the column whose id (or `meta.filterKey`) equals `key`, so a filter
   * that mirrors a column needs nothing here.
   */
  getValue?: (row: TData) => unknown
}

export type EnumFilterDef<TData = unknown> = FilterDefBase<TData> & {
  type: "enum"
  options: readonly FilterOption[]
  /** Allow several values (any of). Default true. */
  multiple?: boolean
  /** Also offer "is not" (encoded as `<key>_not`). Default false. */
  negatable?: boolean
}

export type AsyncFilterDef<TData = unknown> = FilterDefBase<TData> & {
  type: "async"
  /** Options for the picker, called with its search text (debounced) and an abort signal. */
  loadOptions: (
    query: string,
    signal: AbortSignal
  ) => Promise<readonly FilterOption[]>
  /**
   * Labels for values that arrived from the URL and are not in the loaded
   * options. Without it, a chip shows the raw value until the picker has
   * loaded a page containing it.
   */
  resolveOptions?: (
    values: readonly string[],
    signal: AbortSignal
  ) => Promise<readonly FilterOption[]>
  multiple?: boolean
  negatable?: boolean
  /** Debounce before `loadOptions` runs. Default 250 ms. */
  debounceMs?: number
}

export type TextFilterDef<TData = unknown> = FilterDefBase<TData> & {
  type: "text"
  placeholder?: string
}

export type BooleanFilterDef<TData = unknown> = FilterDefBase<TData> & {
  type: "boolean"
  trueLabel?: string
  falseLabel?: string
}

export type NumberRangeFilterDef<TData = unknown> = FilterDefBase<TData> & {
  type: "number-range"
  min?: number
  max?: number
  step?: number
  /** Shown before values in the chip and the inputs: "$". */
  prefix?: string
  /** Shown after values: "kg". */
  suffix?: string
}

export type DateRangePreset = {
  id: string
  label: string
  /** `YYYY-MM-DD` bounds, either side optional. Called when picked, so "today" stays current. */
  range: () => { from?: string; to?: string }
}

export type DateRangeFilterDef<TData = unknown> = FilterDefBase<TData> & {
  type: "date-range"
  /** Quick choices above the custom range. Default: Shopify's list (today ... last 12 months). */
  presets?: readonly DateRangePreset[] | false
}

export type FilterDef<TData = unknown> =
  | EnumFilterDef<TData>
  | AsyncFilterDef<TData>
  | TextFilterDef<TData>
  | BooleanFilterDef<TData>
  | NumberRangeFilterDef<TData>
  | DateRangeFilterDef<TData>

/**
 * An applied filter. In the URL and API it is flat params:
 *
 * | value                      | params                      |
 * | -------------------------- | --------------------------- |
 * | `{ op: "in", values }`     | `key=a,b`                   |
 * | `{ op: "not_in", values }` | `key_not=a,b`               |
 * | `{ op: "contains", value }`| `key=text`                  |
 * | `{ op: "eq", value }`      | `key=true` / `key=false`    |
 * | `{ op: "between", min, max }` | `key_gte=min&key_lte=max` |
 */
export type FilterValue =
  | { op: "in"; values: string[] }
  | { op: "not_in"; values: string[] }
  | { op: "contains"; value: string }
  | { op: "eq"; value: boolean }
  | { op: "between"; min?: string; max?: string }

export type FilterValues = Readonly<Record<string, FilterValue>>

/* -------------------------------------------------------------------------- */
/* List state: what the list is asking for                                    */
/* -------------------------------------------------------------------------- */

export type ListQuery = {
  /** Free-text search. */
  q?: string
  /** `"field"` ascending, `"-field"` descending. */
  sort?: string
  filters: FilterValues
}

/**
 * The one piece of state the search bar, chips, header menus, sort menu and
 * views all read and write. `useLocalListState` keeps it in React state,
 * `useUrlListState` in the URL.
 */
export type ListState = ListQuery & {
  update: (patch: Partial<ListQuery>) => void
}

export type SortOption = {
  /** Sort field without the direction prefix. */
  value: string
  label: string
  /** Direction labels, as Shopify words them: "A-Z" / "Z-A", "Oldest first" / "Newest first". */
  ascLabel?: string
  descLabel?: string
}

/** A named query: built-in ("All", "Active") or saved by the user. */
export type DataTableView = {
  id: string
  label: string
  query: Partial<ListQuery>
}

/* -------------------------------------------------------------------------- */
/* Selection and actions                                                      */
/* -------------------------------------------------------------------------- */

/**
 * Shopify-style cross-page selection: an explicit set of row ids, or, after
 * "Select all N", every row matching the current query except `ids`. Bulk
 * actions and CSV export take this instead of an id array so they stay
 * correct at any page size.
 */
export type SelectionDescriptor =
  | { type: "include"; ids: string[] }
  | { type: "exclude"; ids: string[]; total: number }

export type BulkAction<TData> = {
  id: string
  label: string
  icon?: React.ReactNode
  variant?: "default" | "destructive"
  /** Rendered as a button in the bar; the rest go under "More actions". */
  promoted?: boolean
  /**
   * The action can run on "all matching" (an `exclude` descriptor). When
   * false it is disabled in that mode, since only the loaded rows are known.
   */
  supportsAllMatching?: boolean
  disabled?: boolean
  /** Keep the rows selected after the action resolves. Default: clear. */
  keepSelection?: boolean
  /** `rows` holds the selected rows that are loaded (the current page). */
  onAction: (
    selection: SelectionDescriptor,
    rows: TData[]
  ) => void | Promise<void>
}

export type RowAction<TData> = {
  id: string
  label: string
  icon?: React.ReactNode
  variant?: "default" | "destructive"
  /** Draws a separator above this item. */
  separatorBefore?: boolean
  disabled?: (row: TData) => boolean
  hidden?: (row: TData) => boolean
  onAction: (row: TData) => void | Promise<void>
}

export type DataTableMode = "client" | "server"

/* -------------------------------------------------------------------------- */
/* Column meta                                                                */
/* -------------------------------------------------------------------------- */

export type DataTableColumnMeta = {
  /** Plain-text name for menus and the CSV header when `header` is a render function. */
  label?: string
  /**
   * The `sort` value this column sends. Setting it makes the column sortable
   * in server mode; client mode sorts any accessor column and uses the column id.
   */
  sortField?: string
  /** The `FilterDef.key` this column shows; adds "Filter" to its header menu. */
  filterKey?: string
  align?: "start" | "center" | "end"
  /** Cannot be hidden from the Columns menu (the primary column). */
  lockVisibility?: boolean
  /** Client mode: leave this column out of free-text search. */
  searchable?: boolean
  /** Extra classes on body cells. */
  cellClassName?: string
}

declare module "@tanstack/table-core" {
  /* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-object-type -- module augmentation, not a redundant supertype; type params must match the augmented interface's arity */
  interface ColumnMeta<
    TFeatures extends TableFeatures,
    TData extends RowData,
    TValue,
  > extends DataTableColumnMeta {}
  /* eslint-enable @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-object-type */
}

export type { DataTableFeatures } from "./features"
export type { PaginationState }
