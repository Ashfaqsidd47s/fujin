import type { RegistryItemInput } from "@fujin/schema"

/*
 * Composites. Behaviour lives in lib/<name>/ (no classNames), markup in
 * components/<name>/ (no business logic) - see AGENTS.md. `files` lists
 * both directories under one item; each file's own `type` (registry:lib vs
 * registry:component) is what tells the shadcn CLI which alias to install
 * it under.
 */
export const components: RegistryItemInput[] = [
  {
    name: "data-table",
    type: "registry:component",
    title: "Data Table",
    description:
      "A Shopify-style index table: one search bar with views, filter chips and GitHub-style typed qualifiers, saved views, sortable and filterable headers, cross-page selection with bulk actions, row actions and CSV export - on TanStack Table v9.",
    categories: ["data"],
    dependencies: ["@tanstack/react-table", "nuqs", "lucide-react"],
    registryDependencies: [
      "@fujin/utils",
      "@fujin/button",
      "@fujin/badge",
      "@fujin/checkbox",
      "@fujin/dropdown-menu",
      "@fujin/input",
      "@fujin/popover",
      "@fujin/skeleton",
      "@fujin/table",
      "@fujin/tooltip",
    ],
    files: [
      ...[
        "types.ts",
        "features.ts",
        "filter-codec.ts",
        "query-syntax.ts",
        "filter-summary.ts",
        "use-persisted-state.ts",
        "use-list-state.ts",
        "use-filter-options.ts",
        "use-filter-search.ts",
        "use-data-table-selection.ts",
        "use-data-table-views.ts",
        "use-data-table.ts",
        "csv-export.ts",
      ].map((file) => ({
        path: `registry/fujin/lib/data-table/${file}`,
        type: "registry:lib" as const,
      })),
      ...[
        "data-table.tsx",
        "data-table-filter-bar.tsx",
        "data-table-filter-chip.tsx",
        "data-table-filter-picker.tsx",
        "data-table-view-menu.tsx",
        "data-table-display-options.tsx",
        "data-table-column-header.tsx",
        "data-table-bulk-actions.tsx",
        "data-table-row-actions.tsx",
        "data-table-pagination.tsx",
        "data-table-states.tsx",
      ].map((file) => ({
        path: `registry/fujin/components/data-table/${file}`,
        type: "registry:component" as const,
      })),
    ],
    meta: {
      fujin: {
        status: "beta",
        summary:
          'Shopify admin-style list: views menu, filter chips ("Status is Active, Draft"), typed qualifiers (status:active -vendor:acme price:10..20), saved views, sort/columns panel, header filters, cross-page selection with bulk actions, row actions, URL state.',
        whenToUse: [
          "An admin list of records (products, orders, customers) that people search, filter, sort and act on in bulk - the Shopify Products / GitHub Issues shape.",
          'Small datasets filtered in the browser (`mode: "client"`, the default) and large ones your API filters and pages (`mode: "server"`) - same component, same filter UI.',
          "You want filters, search, sort and page in the URL so views survive a refresh and can be shared (`useUrlListState`).",
        ],
        whenNotToUse: [
          "A handful of static rows with no search, filter or selection - a plain `table` is lighter.",
          "Spreadsheet-style editing, cell selection, column resizing or row grouping - not built in; this is an index table for finding and acting on records.",
          "Tens of thousands of rows rendered at once - paginate (server mode) instead; rows are not virtualized.",
          "Boolean logic across filters (OR between different fields, parentheses) - filters on different fields always combine with AND, values within one filter with OR, as in Shopify.",
        ],
        anatomy: `const table = useDataTable({
  data, columns,                 // TanStack v9 column defs
  filters,                       // FilterDef[]: enum | async | text | boolean | number-range | date-range
  getRowId,                      // required in server mode
  mode, rowCount,                // "server" + total rows, when your API pages
  list, pagination, onPaginationChange,  // from useUrlListState() for URL state
  tableId,                       // persists columns + saved views in this browser
})

<DataTable
  table={table}
  views={[{ id: "all", label: "All", query: {} }, ...]}
  bulkActions={[{ id, label, promoted?, supportsAllMatching?, onAction(selection, rows) }]}
  rowActions={[{ id, label, onAction(row) }]}
  onRowClick={(row) => ...}
  resourceName={{ singular: "product", plural: "products" }}
  toolbarActions={<Button>Export</Button>}
  loading fetching error emptyState stickyOffset maxHeight
/>`,
        props: [
          {
            owner: "useDataTable",
            name: "filters",
            type: "FilterDef<TData>[]",
            description:
              'What people can filter on - not tied to columns. Each has a `key` (URL param and qualifier name), `label` and `type`; `enum` takes `options`, `async` takes `loadOptions(query, signal)`. `pinned` lists it first, `negatable` adds "is not", `aliases` adds qualifier spellings, `getValue(row)` tells client mode what to test.',
          },
          {
            owner: "useDataTable",
            name: "mode",
            type: '"client" | "server"',
            default: '"client"',
            description:
              "Client filters, searches, sorts and pages `data` itself. Server trusts `data` as the current page and requires `getRowId` and `rowCount` (the types enforce it).",
          },
          {
            owner: "useDataTable",
            name: "list",
            type: "ListState",
            description:
              "Search, sort and filters. Default: React state. `useUrlListState({ filters })` keeps them in the URL as flat params (`?q=ring&status=active,draft&price_gte=10&sort=-created`) and also returns `pagination`, `onPaginationChange` and `params` (ready for an API call).",
          },
          {
            owner: "useDataTable",
            name: "tableId",
            type: "string",
            description:
              "Persists column visibility/order and saved views in localStorage under this id.",
          },
          {
            owner: "Column meta",
            name: "meta",
            type: "{ label?, sortField?, filterKey?, align?, lockVisibility?, searchable?, cellClassName? }",
            description:
              '`sortField` makes a column sortable in server mode (client mode sorts any accessor column). `filterKey` links the header\'s Filter menu to a filter whose key differs from the column id. `align: "end"` right-aligns numbers.',
          },
          {
            owner: "DataTable",
            name: "views",
            type: "DataTableView[]",
            description:
              "Built-in views for the menu at the start of the bar; the first is the default. People can save the current query as a new view; pass `savedViews` + `onSavedViewsChange` to store those on your server instead of the browser.",
          },
          {
            owner: "DataTable",
            name: "bulkActions",
            type: "BulkAction<TData>[]",
            description:
              '`promoted` ones are buttons, the rest go under "More actions". `onAction` gets the `SelectionDescriptor` (include ids, or exclude ids after "Select all N") and the loaded selected rows. Actions without `supportsAllMatching` are disabled after "Select all N".',
          },
          {
            owner: "DataTable",
            name: "onRowClick",
            type: "(row: TData) => void",
            description:
              "Opens a record. While rows are selected, a row click toggles its selection instead (Shopify); clicks on links, buttons and inputs inside a row are ignored.",
          },
          {
            owner: "DataTable",
            name: "stickyOffset / maxHeight",
            type: "number | string",
            description:
              "The toolbar sticks to the viewport `stickyOffset` below the top. `maxHeight` makes rows scroll inside the table under a sticky header row.",
          },
        ],
        examples: [
          {
            title: "Client mode with views and bulk actions",
            code: `const filters: FilterDef<Product>[] = [
  { key: "status", label: "Status", type: "enum", pinned: true, negatable: true,
    options: [{ value: "active", label: "Active" }, { value: "draft", label: "Draft" }] },
  { key: "vendor", label: "Vendor", type: "enum", options: uniqueOptions(products, (p) => p.vendor) },
  { key: "price", label: "Price", type: "number-range", prefix: "$" },
]
const columns: DataTableColumnDef<Product>[] = [
  { id: "title", accessorKey: "title", header: "Product", meta: { lockVisibility: true } },
  { id: "status", accessorKey: "status", header: "Status" },
  { id: "price", accessorKey: "price", header: "Price", meta: { align: "end" } },
]

const table = useDataTable({ data: products, columns, filters, getRowId: (p) => p.id, tableId: "products" })

<DataTable
  table={table}
  views={[{ id: "all", label: "All", query: {} },
          { id: "active", label: "Active", query: { filters: { status: { op: "in", values: ["active"] } } } }]}
  resourceName={{ singular: "product", plural: "products" }}
  bulkActions={[{ id: "archive", label: "Archive", promoted: true, onAction: (selection) => archive(selection) }]}
/>`,
          },
          {
            title: "Server mode with URL state",
            code: `const list = useUrlListState({ filters })          // needs <NuqsAdapter> at the root
const { data, total, isFetching } = useQuery({
  queryKey: ["products", list.params, list.pagination],
  queryFn: () => api.products({ ...list.params, page: list.pagination.pageIndex + 1 }),
})

const table = useDataTable({
  mode: "server", data: data ?? [], rowCount: total ?? 0, getRowId: (p) => p.id,
  columns, filters, list, pagination: list.pagination, onPaginationChange: list.onPaginationChange,
})

<DataTable table={table} loading={!data} fetching={isFetching} />`,
          },
        ],
        pitfalls: [
          "Filters are not TanStack column filters: they live in `list.filters` as `{ op, ... }` values keyed by `FilterDef.key`. In client mode a filter tests `getValue(row)`, or the column whose id (or `meta.filterKey`) equals its key - a filter with neither is ignored.",
          "In server mode your API receives flat params (`list.params`): `key=a,b` (any of), `key_not=a,b`, `key=text` (contains), `key=true`, `key_gte` / `key_lte` (numbers and YYYY-MM-DD dates). Commas inside values arrive escaped as %2C. Unknown enum values in a URL are dropped.",
          "`useUrlListState` needs a `<NuqsAdapter>` mounted once near the app root (`nuqs/adapters/next/app` or `nuqs/adapters/react`); pass the same `filters` array to it and to `useDataTable`.",
          "Server-mode columns are not sortable unless they set `meta.sortField` (or `enableSorting: true`) - most APIs only sort on some fields.",
          'Changing the search or filters clears the selection and returns to page 1, because "Select all N" would otherwise quietly mean a different set of rows. Sorting keeps the selection.',
          "Define `columns`, `filters` and `views` outside the component (or memoize them): new arrays every render re-run filtering and reset derived state.",
          "Saved views without `savedViews`/`onSavedViewsChange` live in this browser only (localStorage under `tableId`); without either, the Save button is hidden.",
        ],
        a11y: [
          "The search box is an ARIA 1.2 combobox: focus stays in the input, arrows move through suggestions (announced via aria-activedescendant), Enter picks, Escape closes then clears.",
          "Chips are buttons: Enter opens the picker with current values checked, Delete/Backspace removes, Left/Right move between chips and back into the box; Backspace at the start of the box moves into the chips.",
          'A visually hidden `role="status"` announces the result count after a search or filter, and the bulk-action bar announces the selection count.',
          "Sortable headers set `aria-sort` on the `<th>`; header menus, the sort/columns panel and pickers are reachable by keyboard, and columns reorder with buttons, never drag only (WCAG 2.5.7).",
          "Checkboxes get a 24px hit area (WCAG 2.5.8); no single-key shortcuts are registered (WCAG 2.1.4).",
        ],
        related: ["table", "checkbox", "dropdown-menu", "popover", "badge"],
        editing: {
          ui: ["components/data-table/*"],
          logic: ["lib/data-table/*"],
        },
      },
    },
  },
]
