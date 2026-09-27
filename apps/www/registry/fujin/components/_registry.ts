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
      "The flagship: sorting, a unified Shopify/GitHub-style filter search bar, cross-page selection with bulk actions, sticky header, CSV export - built on TanStack Table v9.",
    categories: ["data"],
    dependencies: [
      "@tanstack/react-table",
      "@tanstack/table-core",
      "nuqs",
      "lucide-react",
    ],
    registryDependencies: [
      "@fujin/utils",
      "@fujin/table",
      "@fujin/button",
      "@fujin/badge",
      "@fujin/checkbox",
      "@fujin/command",
      "@fujin/dropdown-menu",
      "@fujin/input",
      "@fujin/popover",
      "@fujin/skeleton",
    ],
    files: [
      {
        path: "registry/fujin/lib/data-table/features.ts",
        type: "registry:lib",
      },
      {
        path: "registry/fujin/lib/data-table/types.ts",
        type: "registry:lib",
      },
      {
        path: "registry/fujin/lib/data-table/use-controllable-state.ts",
        type: "registry:lib",
      },
      {
        path: "registry/fujin/lib/data-table/use-data-table.ts",
        type: "registry:lib",
      },
      {
        path: "registry/fujin/lib/data-table/use-data-table-filters.ts",
        type: "registry:lib",
      },
      {
        path: "registry/fujin/lib/data-table/use-data-table-selection.ts",
        type: "registry:lib",
      },
      {
        path: "registry/fujin/lib/data-table/use-data-table-url-state.ts",
        type: "registry:lib",
      },
      {
        path: "registry/fujin/lib/data-table/csv-export.ts",
        type: "registry:lib",
      },
      {
        path: "registry/fujin/components/data-table/data-table.tsx",
        type: "registry:component",
      },
      {
        path: "registry/fujin/components/data-table/data-table-toolbar.tsx",
        type: "registry:component",
      },
      {
        path: "registry/fujin/components/data-table/data-table-filter-combobox.tsx",
        type: "registry:component",
      },
      {
        path: "registry/fujin/components/data-table/data-table-filter-pill.tsx",
        type: "registry:component",
      },
      {
        path: "registry/fujin/components/data-table/data-table-column-filter-popover.tsx",
        type: "registry:component",
      },
      {
        path: "registry/fujin/components/data-table/data-table-column-header.tsx",
        type: "registry:component",
      },
      {
        path: "registry/fujin/components/data-table/data-table-column-visibility-menu.tsx",
        type: "registry:component",
      },
      {
        path: "registry/fujin/components/data-table/data-table-selection-bar.tsx",
        type: "registry:component",
      },
      {
        path: "registry/fujin/components/data-table/data-table-pagination.tsx",
        type: "registry:component",
      },
      {
        path: "registry/fujin/components/data-table/data-table-states.tsx",
        type: "registry:component",
      },
    ],
    meta: {
      fujin: {
        status: "beta",
        summary:
          "TanStack Table v9 data grid with a unified search-bar filter combobox (Shopify-style pills, GitHub-style header popovers - same filter state either way), multi-sort, cross-page row selection with bulk actions, a sticky header, and CSV export.",
        whenToUse: [
          "An admin/dashboard list of records that needs sorting, filtering and bulk actions - the flagship use case this was built for.",
          "Both client-side (small dataset, everything in the browser) and server-driven (large dataset, your API sorts/filters/paginates) tables - set `mode` accordingly.",
        ],
        whenNotToUse: [
          "A handful of rows with no sort/filter/selection need - a plain `table` is lighter.",
          "You need column pinning, resizing, drag-to-reorder, row grouping, or saved filter views - none of these ship in this v1 (see docs/data-table-plan.md for what's deferred and why).",
          "You need row virtualization for tens of thousands of rows - not wired up in v1 despite being in TanStack Virtual's dependency list; paginate instead, or add `@tanstack/react-virtual` yourself following its `with-tanstack-virtual` skill.",
        ],
        anatomy: `const table = useDataTable({ data, columns, mode, rowCount, ...urlState })
const selection = useDataTableSelection({ pageRowIds, ...controlled? })

<DataTable
  table={table}
  selection={selection}
  bulkActions={[{ label, icon, onAction, variant? }]}
  onExport={() => rowsToCsv(table, table.getRowModel().rows)}
  stickyOffset={64}
  pagination pageSizeOptions={[10, 20, 50, 100]}
  loading={} error={} emptyState={}
/>`,
        props: [
          {
            owner: "useDataTable",
            name: "mode",
            type: '"server" | "client"',
            default: '"server"',
            description:
              "Server trusts `data` as already sorted/filtered/paginated and expects the on*Change callbacks to refetch. Client processes the full `data` array itself.",
          },
          {
            owner: "useDataTable",
            name: "rowCount",
            type: "number",
            description: "Required in server mode - the total row count.",
          },
          {
            owner: "useDataTable",
            name: "getRowId",
            type: "(row: TData, index: number) => string",
            description:
              "Stable row ids matter a lot here - cross-page selection identifies rows by this id.",
          },
          {
            owner: "Column meta",
            name: "meta.label",
            type: "string",
            description:
              "Display label - column picker, header, CSV header, column-visibility menu.",
          },
          {
            owner: "Column meta",
            name: "meta.filter",
            type: "{ type, getOptions? }",
            description:
              "Makes a column filterable from both the search bar and its header popover. `type` is one of text/select/multi-select/date-range/number-range/boolean, but only text/select/multi-select/number-range render a control in v1 - see the pitfall below. Omit `getOptions` in client mode to derive values from what's loaded via `getFacetedUniqueValues()`.",
          },
          {
            owner: "DataTable",
            name: "selection",
            type: "UseDataTableSelectionResult",
            description:
              "From `useDataTableSelection`. Omit entirely to render without row selection.",
          },
          {
            owner: "DataTable",
            name: "bulkActions",
            type: "{ label, icon?, onAction(selection), variant? }[]",
            description:
              "First 2 render inline in the selection bar, the rest collapse into a “More” menu.",
          },
          {
            owner: "DataTable",
            name: "stickyOffset",
            type: "number | string",
            default: "0",
            description:
              "How far below the viewport top the sticky header/selection bar sits - set to a fixed site nav's height.",
          },
          {
            owner: "DataTable",
            name: "pagination",
            type: "boolean",
            default: "true",
            description:
              "Renders the pagination footer (page size, prev/next, row count) below the table. Set `false` to render without it - e.g. when the caller renders its own outside `<DataTable>`.",
          },
          {
            owner: "DataTable",
            name: "pageSizeOptions",
            type: "number[]",
            default: "[10, 20, 50, 100]",
            description:
              "Choices in the pagination footer's rows-per-page menu.",
          },
        ],
        examples: [
          {
            title: "Client mode with selection and a bulk action",
            code: `const columns: DataTableColumnDef<Invoice>[] = [
  helper.accessor("title", { meta: { label: "Title", filter: { type: "text" } } }),
  helper.accessor("status", {
    meta: { label: "Status", filter: { type: "multi-select" } },
    header: ({ column }) => <DataTableColumnHeader column={column} title="Status" getColumnOptions={getColumnOptions} />,
  }),
]

const table = useDataTable({ data: invoices, columns, mode: "client" })
const selection = useDataTableSelection({ pageRowIds: table.getRowModel().rows.map((r) => r.id) })

<DataTable
  table={table}
  selection={selection}
  bulkActions={[{ label: "Archive", onAction: (sel) => archive(sel) }]}
/>`,
          },
          {
            title: "Server mode with URL state",
            code: `const urlState = useDataTableUrlState()
const { data, rowCount } = useInvoicesQuery(urlState)
const table = useDataTable({ data, columns, mode: "server", rowCount, getRowId: (row) => row.id, ...urlState })

<DataTable table={table} onExport={() => exportAllFiltered(urlState)} />`,
          },
        ],
        pitfalls: [
          "Row selection is not a registered TanStack feature here - it's the external cross-page `SelectionDescriptor` from `useDataTableSelection`, because TanStack's own `RowSelectionState` only knows about loaded rows and can't represent “all 4,213 matching items except these 3”. Bulk actions and export take that descriptor, not a plain id array.",
          "`useDataTableUrlState` needs a `<NuqsAdapter>` mounted once near the app root, or every `useQueryStates` call throws.",
          "The search-bar combobox and a column's header popover write to the exact same `columnFilters` state - a pill and a header's filter icon for the same column always agree; there is nothing to keep in sync manually.",
          "In server mode, `manualSorting`/`manualFiltering`/`manualPagination` are set automatically - `data` must already be the sorted/filtered/paginated page your API returned, not the full dataset.",
          "`date-range` and `boolean` are valid `meta.filter.type` values (their `filterFn` is wired correctly) but have no built-in control yet - a column declaring one is skipped by the search bar and its header popover, and an already-active filter of that type renders as a plain, non-editable, removable pill. Stick to text/select/multi-select/number-range for v1, or drive `column.setFilterValue()` yourself for the other two.",
          '`getRowId` and `rowCount` are optional in the types but effectively required in `mode: "server"` - without `getRowId`, row ids fall back to the row\'s index within the current page and cross-page selection silently corrupts across pages; without `rowCount`, the pagination footer shows 0 pages while rows still render. Both log a dev-mode warning when missing.',
        ],
        a11y: [
          "Sortable headers are real buttons; `aria-sort` is set on the `<th>` itself by `DataTable`, not inside the custom header renderer.",
          "The sticky header combined with `stickyOffset` keeps `scroll-margin-top` in mind so a keyboard-focused cell is never hidden under it (WCAG 2.4.11).",
          'Loading state announces via a visually-hidden `role="status"` row so screen-reader users aren\'t left listening to silence.',
        ],
        related: [
          "table",
          "checkbox",
          "command",
          "dropdown-menu",
          "badge",
          "pagination",
        ],
        editing: {
          ui: ["components/data-table/*"],
          logic: ["lib/data-table/*"],
        },
      },
    },
  },
]
