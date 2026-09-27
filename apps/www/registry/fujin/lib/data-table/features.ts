import {
  columnFacetingFeature,
  columnFilteringFeature,
  columnVisibilityFeature,
  createFacetedRowModel,
  createFacetedUniqueValues,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  filterFn_arrHas,
  filterFn_inDateRange,
  filterFn_inNumberRange,
  filterFn_includesString,
  filterFn_weakEquals,
  globalFilteringFeature,
  rowPaginationFeature,
  rowSortingFeature,
  sortFn_alphanumeric,
  sortFn_datetime,
  tableFeatures,
} from "@tanstack/react-table"
import type { FilterType } from "./types"

/*
 * The one, fixed feature set every data-table instance registers. Row
 * selection is deliberately not a TanStack feature here - it is owned
 * entirely by `use-data-table-selection.ts`'s cross-page selection
 * descriptor, which TanStack's loaded-rows-only `RowSelectionState` can't
 * represent on its own. Pinning, resizing, reordering and grouping are v1
 * non-goals (see docs/data-table-plan.md) and are not registered.
 */
export const dataTableFeatures = tableFeatures({
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
  sortFns: { alphanumeric: sortFn_alphanumeric, datetime: sortFn_datetime },
  columnFilteringFeature,
  filteredRowModel: createFilteredRowModel(),
  filterFns: {
    includesString: filterFn_includesString,
    weakEquals: filterFn_weakEquals,
    arrHas: filterFn_arrHas,
    inNumberRange: filterFn_inNumberRange,
    inDateRange: filterFn_inDateRange,
  },
  globalFilteringFeature,
  columnFacetingFeature,
  facetedRowModel: createFacetedRowModel(),
  facetedUniqueValues: createFacetedUniqueValues(),
  rowPaginationFeature,
  paginatedRowModel: createPaginatedRowModel(),
  columnVisibilityFeature,
})

export type DataTableFeatures = typeof dataTableFeatures

type RegisteredFilterFn = keyof DataTableFeatures["filterFns"]

/**
 * The registered `filterFns` key for each `meta.filter.type`. Row values here
 * are always scalars (a column holds one string/number/boolean, never an
 * array), so `select`/`multi-select` use `arrHas` ("row's scalar value is one
 * of these") - not `arrIncludesSome`, which instead expects the row's own
 * value to be an array and checks *that* array against the filter's. Applied
 * automatically by `useDataTable` so column authors never have to wire a
 * `filterFn` by hand and can't mismatch it against the value shape the UI
 * actually writes.
 */
export const FILTER_FN_BY_TYPE: Record<FilterType, RegisteredFilterFn> = {
  text: "includesString",
  select: "weakEquals",
  "multi-select": "arrHas",
  "number-range": "inNumberRange",
  "date-range": "inDateRange",
  boolean: "weakEquals",
}

/**
 * Filter types with a real, working UI in both entry points (the search-bar
 * combobox and a column header's popover). `date-range` and `boolean` are
 * declared in `FilterType` per the v1 filter model but have no control built
 * for them yet - see the pitfall in `components/_registry.ts`. Columns
 * declaring them are excluded from both entry points rather than shown with
 * broken controls; `filterFn` above is still wired correctly for them so a
 * caller driving `column.setFilterValue()` by hand (bypassing the built-in UI
 * entirely) still gets correct results.
 */
export const FILTER_TYPES_WITH_UI = new Set<FilterType>([
  "text",
  "select",
  "multi-select",
  "number-range",
])
