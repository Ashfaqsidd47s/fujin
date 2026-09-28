# Fujin: data-table plan

_Created 2026-09-21. Full spec for the Phase 2 flagship (`docs/plan.md` §7).
Decisions below came out of a requirements session; each row says what was
picked and why, so this file can be revisited without re-litigating it._

## Revision 2026-09-29: rebuilt around a list query

The first build did not work in the browser. Picking a column in the search
bar wrote the picked item into the input as JSON, and no filter was applied:
Base UI's Combobox treats the picked item as the input's value. It also failed
`tsc` in the Vite template (`noUnusedLocals`, no `process` types). The table
was rebuilt, borrowing the design of a working in-house table (a
Shopify-style admin kit) and checked against current Shopify and GitHub
behaviour. That research lives outside the repo. Its main finding: the
Shopify admin's Products and Orders pages no longer use Polaris
`IndexFilters` tabs. They use one search bar with a view menu, filter chips
and typed `field:value` terms, which is close to GitHub's.

These rows replace or extend the decisions in §2:

| #   | Decision                                                                                                                                                                                                    | Why                                                                                                                                                                                  |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| R1  | Filters are `FilterDef`s (`enum`, `async`, `text`, `boolean`, `number-range`, `date-range`) declared separately from columns. Values are `{ op, ... }` (`in`, `not_in`, `contains`, `eq`, `between`).       | Shopify filters on things that aren't columns ("Tagged with"). An explicit `op` carries "is not" and ranges, which TanStack's per-column `filterFn` values couldn't express cleanly. |
| R2  | One `ListState` (`q`, `sort`, `filters`) is the state for the bar, chips, header menus, sort panel and views. Client mode filters `data` with it before TanStack sorts and pages.                           | One source of truth, the same shape in the URL and in an API request. TanStack's column-filter features are no longer registered.                                                    |
| R3  | The search box is a hand-rolled ARIA 1.2 combobox (`use-filter-search.ts`), not Base UI Combobox.                                                                                                           | It has to hold free text, turn qualifiers into chips and offer mixed suggestions (filters, values, views). A value-picking combobox fights all three; that is the bug that broke v1. |
| R4  | GitHub qualifier syntax in the box: `key:a,b`, `-key:a`, `key:"two words"`, `key:10..20`, `key:>=10`. Values match a unique prefix. Unknown terms stay as text with a warning.                              | Shopify's current bar and GitHub both accept typed terms. Power users type; everyone else uses chips. Both write the same state.                                                     |
| R5  | URL and API parameters are flat, not JSON: `key=a,b`, `key_not=`, `key_gte=` / `key_lte=`, plus `q`, `sort` (`-field` = descending) and `page`. `nuqs` stays.                                               | Readable, shareable links that double as the backend contract.                                                                                                                       |
| R6  | Saved views are in scope (reverses decision 6). A view menu sits in the bar with Save as, Update, Rename, Duplicate and Delete. Views live in localStorage by default, or on a server through `savedViews`. | The current Shopify admin makes views the entry point of the bar.                                                                                                                    |
| R7  | Column order is in scope, through buttons in the "Sort and columns" panel. The first column stays first, visible and sticky next to the checkbox. Pinning, resizing and grouping are still out.             | Shopify's display panel reorders with up/down controls. Drag-only reordering would fail WCAG 2.5.7.                                                                                  |
| R8  | Single-column sort (`sort=field` / `-field`), not multi-sort.                                                                                                                                               | Neither Shopify nor GitHub offers multi-sort, and one `sort` parameter is what most APIs accept.                                                                                     |
| R9  | Bulk actions choose `promoted` themselves (replaces decision 10's fixed 2). Actions without `supportsAllMatching` are disabled after "Select all N".                                                        | Matches Polaris. An action that only works on loaded ids must not run on "all matching".                                                                                             |
| R10 | `mode` defaults to `"client"`. Server mode's types require `getRowId` and `rowCount`.                                                                                                                       | The v1 runtime warnings relied on `process.env`, which Vite apps don't type. Type-level requirements catch the mistake earlier.                                                      |
| R11 | Changing `q` or filters clears the selection and returns to page 1. Sorting keeps both.                                                                                                                     | Otherwise "Select all N" would quietly mean a different set of rows.                                                                                                                 |

The file layout in §4 below is historical. The current one:

```txt
lib/data-table/        types, filter-codec (URL params, matching, sort), query-syntax,
                       filter-summary, use-list-state, use-filter-search, use-filter-options,
                       use-data-table, use-data-table-selection, use-data-table-views,
                       use-persisted-state, csv-export, features
components/data-table/ data-table, filter-bar, filter-chip, filter-picker, view-menu,
                       display-options, column-header, bulk-actions, row-actions,
                       pagination, states
```

## 1. Goal

Ship a data-table composite that matches the two reference systems the brief
named:

- **Shopify admin (Polaris `IndexTable` + `IndexFilters`)** — a single search
  bar that behaves like a combobox: typing suggests filterable columns,
  picking one turns into a pill with its own value picker (multi-select),
  free text left over becomes a plain search query; selecting rows swaps the
  header for a bulk-action bar at the same height; header and action bar
  stick to the viewport on scroll.
- **GitHub (Projects table view / Issues list)** — same search-and-select
  behaviour, plus clicking a column header opens a popover of that column's
  unique values for a quick per-column filter.

The brief's requirement is that both entry points (search bar, header click)
feed **one shared filter state**, not two parallel systems.

## 2. Decisions

| #   | Question                                      | Decision                                                                                                                                                                             | Why                                                                                                                                                                                                     |
| --- | --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Sequencing against missing Phase 1 primitives | Build only the ~9 primitives data-table needs, then data-table                                                                                                                       | Only `spinner`/`button`/`input`/`field` exist. Building the full Phase 1 list first would delay the flagship for no benefit; building throwaway local pieces risks rework when the real primitives land |
| 2   | Data-fetching model                           | Server-driven by default (`mode: "server"`), with a client-only escape hatch (`mode: "client"`)                                                                                      | Matches how Shopify/GitHub actually scale; TanStack Table's `manualSorting/Filtering/Pagination` map directly onto this                                                                                 |
| 3   | Filter entry points                           | Unified — header-click and search-bar picks write the same filter state, rendered as the same pills                                                                                  | One mental model; avoids "two places to check what's filtered"                                                                                                                                          |
| 4   | Bulk selection scope                          | Full cross-page selection with a "select all N matching" banner                                                                                                                      | Required for the selection descriptor to mean anything once data is server-paginated                                                                                                                    |
| 5   | Column feature scope for v1                   | Visibility only (dropdown-menu show/hide). Pinning, resizing, reordering, grouping deferred                                                                                          | Keeps v1 buildable; each deferred feature has its own WCAG 2.5.7 (no drag-only) and API design work that shouldn't block the core table                                                                 |
| 6   | Saved views / tabs                            | Out of scope for v1                                                                                                                                                                  | Not in the original brief; filter-state shape must not preclude adding it later, but nothing is built now                                                                                               |
| 7   | CSV export                                    | Included in v1                                                                                                                                                                       | Small addition once the selection descriptor and bulk-action bar exist                                                                                                                                  |
| 8   | Filter value types                            | Text / single-select / multi-select from unique values, date range, numeric range, boolean                                                                                           | Covers every filter type both reference systems actually use                                                                                                                                            |
| 9   | Sticky header                                 | Sticky to the **viewport**, offset configurable (`stickyOffset` prop / CSS var), not just the table's internal scroll container                                                      | This is the specific behaviour called out from Shopify — header and action bar stay visible while the page scrolls, not just while the table scrolls                                                    |
| 10  | Bulk-action inline count                      | Fixed at 2 inline actions, rest in a "⋯" overflow menu                                                                                                                               | Matches Shopify's density; no configurable prop since there's no requirement driving one                                                                                                                |
| 11  | Virtualization                                | Opt-in (`virtualized` prop), off by default                                                                                                                                          | Keeps DOM simple/inspectable for typical admin-table row counts; avoids virtualization's sticky-header/find-in-page interaction complexity until actually needed                                        |
| 12  | Next.js vs React split                        | One framework-agnostic `data-table` (`frameworks: ["react", "next"]`); data-fetching glue (Server Action vs TanStack Query) lives only in `examples/`, not as a second registry item | The component itself has no server dependency; only the demo of wiring it up differs per framework                                                                                                      |

## 3. Prerequisite primitives

None of these exist yet. Each ships as a real `registry:ui` item — full
`meta.fujin`, an example, a docs page, WCAG 2.2 AA pass — before data-table
starts. Build order matters: `table` and `checkbox` first (data-table's
skeleton needs them immediately), `command` next (it's the biggest lift —
wraps `@base-ui/react/autocomplete` for the search-bar combobox), the rest in
any order.

| Primitive       | Base UI part                  | Why data-table needs it                                                                                                |
| --------------- | ----------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `table`         | none (semantic HTML)          | `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell` — the raw parts data-table's markup composes |
| `checkbox`      | `@base-ui/react/checkbox`     | Row selection, multi-select filter value lists                                                                         |
| `popover`       | `@base-ui/react/popover`      | Filter value pickers, per-column header filter popover                                                                 |
| `command`       | `@base-ui/react/autocomplete` | The search-bar combobox: type-ahead column picker → value picker, keyboard nav                                         |
| `dropdown-menu` | `@base-ui/react/menu`         | Column visibility toggle, bulk-action overflow, per-row action menu                                                    |
| `badge`         | none (styled span)            | Filter pills, selection count                                                                                          |
| `tooltip`       | `@base-ui/react/tooltip`      | Icon-only header buttons (sort, overflow)                                                                              |
| `separator`     | `@base-ui/react/separator`    | Toolbar dividers                                                                                                       |
| `skeleton`      | none (styled div)             | Loading-state rows                                                                                                     |

Page-size selection reuses `dropdown-menu` rather than adding a `select`
primitive — no need to pull that in for one control.

## 4. Architecture

Per `AGENTS.md`: behaviour in `lib/`, no classNames; markup in `components/`,
no business logic.

```txt
registry/fujin/lib/data-table/
  use-data-table.ts            sorting, column visibility, pagination, orchestrates the others
  use-data-table-filters.ts    filter pills, search-bar parsing, unique-value fetching contract
  use-data-table-selection.ts  cross-page selection descriptor (include/exclude sets)
  use-data-table-url-state.ts  nuqs binding for sort/filters/pagination/search
  csv-export.ts                row -> CSV serialization + client-mode download trigger
  types.ts                     DataTableColumnMeta, FilterDef, SelectionDescriptor, etc.

registry/fujin/components/data-table/
  data-table.tsx                    root: composes toolbar + table + pagination, owns sticky offset
  data-table-toolbar.tsx            search bar + rendered pills
  data-table-filter-combobox.tsx    Command-based: pick column -> pick values
  data-table-filter-pill.tsx        one active filter, editable/removable
  data-table-column-header.tsx      sortable header button (aria-sort) + filter-popover trigger
  data-table-column-filter-popover.tsx  GitHub-style unique-values popover per header
  data-table-column-visibility-menu.tsx dropdown-menu show/hide
  data-table-selection-bar.tsx      replaces header row on selection; 2 inline actions + overflow
  data-table-pagination.tsx
  data-table-empty-state.tsx / -loading.tsx / -error.tsx
```

### Selection descriptor

```ts
type SelectionDescriptor =
  | { type: "include"; ids: string[] }
  | { type: "exclude"; ids: string[]; total: number }
```

Selecting everything on the current page and choosing "select all N" flips to
`exclude` with the rows the user then deselects added to `ids`. Bulk actions
and CSV export both take this shape instead of a plain id array, so they stay
correct at any page size.

### Data-fetching contract

```ts
useDataTable({
  data,
  columns,
  mode: "server" | "client", // default "server"
  rowCount, // required in server mode
  sorting,
  onSortingChange,
  filters,
  onFiltersChange,
  pagination,
  onPaginationChange,
  search,
  onSearchChange,
})
```

In `"server"` mode these map to TanStack Table's `manualSorting: true` /
`manualFiltering: true` / `manualPagination: true`, and the app wires the
`onXChange` callbacks to its own fetch (Server Action, route handler, React
Query — whichever). In `"client"` mode the hook flips those flags off and
TanStack Table computes everything from the full in-memory `data` array.

### Filter model

Each column opts in via `meta.filter`:

```ts
meta: {
  label: "Status",
  filter: {
    type: "select" | "multi-select" | "text" | "date-range" | "number-range" | "boolean",
    getOptions?: (query?: string) => Promise<FilterOption[]> | FilterOption[],
  }
}
```

`getOptions` is how both entry points get the same list: the search-bar
combobox and the header-click popover both call it. Free text typed into the
search bar that doesn't match a column label becomes a plain `search` token
(global search), not a pill — matching the brief's "if you type the entire
thing like search then search can be applied."

State synced to the URL via `nuqs`: `sort`, `filters` (JSON param), `q`
(search text), `page`, `pageSize`. Selection and column visibility stay in
component state only — too volatile/large for a shareable URL; column
visibility gets an optional `persistKey` (localStorage) later if wanted, not
in v1.

### Sticky header

`<DataTable stickyOffset={64}>` sets a CSS var
(`--fujin-data-table-offset`) that the toolbar, column-header row and
selection bar all use for `top-[var(--fujin-data-table-offset)]` plus
`scroll-margin-top` at the same value, per the WCAG 2.4.11 (Focus Not
Obscured) note already in `docs/plan.md` §2.

## 5. Non-goals for v1

Column pinning, resizing, reordering, grouping; saved views/tabs; row
virtualization on by default. Each is a real follow-up item, not cut for
good — the filter/selection/URL-state shapes above are picked so none of
them require a breaking change later.

## 6. Verification (per `AGENTS.md`)

```bash
pnpm --filter www registry:build
pnpm typecheck
pnpm --filter www build
```

Plus, once components render: Vitest + axe per new primitive and for
data-table itself, a Playwright pass over the docs preview, and — since this
affects templates — `pnpm --filter www dev`, `pnpm templates:sync`, then
build both `templates/next` and `templates/react`.

## 7. Suggested build order

1. `table`, `checkbox` (data-table's skeleton needs these immediately)
2. `command` (biggest lift — the search-bar combobox depends on it)
3. `popover`, `dropdown-menu`, `badge`, `tooltip`, `separator`, `skeleton`
4. `data-table` headless hooks (`lib/data-table/`)
5. `data-table` markup (`components/data-table/`), wired to the hooks
6. Examples: a client-mode Vite demo, a server-mode Next.js demo (Server
   Action + `nuqs` in a Server Component), docs page
7. Axe + Playwright passes, template sync, both template builds
