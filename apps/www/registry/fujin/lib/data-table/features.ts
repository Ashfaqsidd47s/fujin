import {
  columnOrderingFeature,
  columnVisibilityFeature,
  createPaginatedRowModel,
  createSortedRowModel,
  rowPaginationFeature,
  rowSortingFeature,
  sortFn_alphanumeric,
  sortFn_basic,
  sortFn_datetime,
  sortFn_text,
  tableFeatures,
} from "@tanstack/react-table"

/*
 * The one, fixed feature set every data-table instance registers.
 *
 * Filtering and search are not TanStack features here: they live in the list
 * state (`ListState`), which is also what the URL and a server request carry.
 * In client mode `useDataTable` applies them to `data` before TanStack sees
 * it, so a filter does not have to be a column (Shopify filters on "Tagged
 * with" without showing tags). Row selection is not a TanStack feature either:
 * `use-data-table-selection.ts` owns a cross-page descriptor that TanStack's
 * loaded-rows-only `RowSelectionState` can't represent.
 */
export const dataTableFeatures = tableFeatures({
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
  sortFns: {
    alphanumeric: sortFn_alphanumeric,
    basic: sortFn_basic,
    datetime: sortFn_datetime,
    text: sortFn_text,
  },
  rowPaginationFeature,
  paginatedRowModel: createPaginatedRowModel(),
  columnVisibilityFeature,
  columnOrderingFeature,
})

export type DataTableFeatures = typeof dataTableFeatures
