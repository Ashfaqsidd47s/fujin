# Fujin: plan

_Last updated 2026-09-16. Covers what was decided, why, and what gets built next._

## 1. What Fujin is

A shadcn-style registry: code is copied into the user's project, not installed
as a dependency. The difference is **depth**. shadcn ships primitives and leaves
the assembly to you. Fujin ships finished pieces:

| Tier       | Registry type        | Examples                                                         |
| ---------- | -------------------- | ---------------------------------------------------------------- |
| Primitives | `registry:ui`        | button, input, field, select, dialog                             |
| Composites | `registry:component` | data-table, form, date-range-picker, file-upload, combobox-async |
| Blocks     | `registry:block`     | dashboard shell, settings page, CRUD list page                   |
| Recipes    | `registry:item`      | auth, crud, billing, uploads, notifications                      |

Three rules make it work:

1. **Logic and markup live in separate files.** Composites ship headless hooks
   in `lib/<name>/` (no classNames) and markup in `components/ui/<name>/` (no
   business logic). Restyling never breaks behaviour. Each item's
   `meta.fujin.editing` records which files are which.
2. **Recipes install features.** Routes, server actions (or API client calls),
   zod schemas, screens and env vars, wired together. Universal registry items
   with explicit `target`s make this possible with the stock shadcn CLI.
3. **Agents get a map.** Every item carries structured guidance
   (`meta.fujin`), served by an MCP server in layers so an agent pays about 35
   tokens per item to browse and a few hundred to learn one.

## 2. Research findings that shaped the decisions

**Ecosystem state (September 2026)**

- shadcn/ui made **Base UI the default** primitive layer in July 2026. Radix is
  still supported, but its releases arrive in bursts with long gaps (a
  10-month stable gap in 2025–26). Base UI (`@base-ui/react` 1.8) ships
  monthly and has primitives Radix lacks: Combobox, Autocomplete, NumberField,
  OTPField, Drawer, Toast, Meter, Field/Fieldset, CSP provider.
- shadcn's own docs site now runs on **Fumadocs**, `cn` is an npm package, and
  components use `data-slot`, plain function components (no `forwardRef`) and
  Base UI's `render` prop instead of `asChild`.
- The registry schema now has `registry:base`, `registry:item` (universal
  items), target placeholders (`@ui/`, `@lib/`...), `envVars` and `docs`. The
  shadcn MCP server works with any registry. `meta` and `docs` survive
  `shadcn build`, which is how Fujin's metadata travels.
- **TanStack Table v9** is stable (`useTable({ features })`, tree-shakable,
  much faster). shadcn's data-table docs and `dashboard-01` block are a
  copy-paste recipe with no server pagination, virtualization or export.
- **TypeScript 7** (Go port) is stable but has no programmatic API until 7.1
  (planned for 24 Nov 2026), so typescript-eslint and similar tools don't
  support it yet.
- react-hook-form (7.88, 6 open issues, ~19× the downloads) remains the safer
  form default. TanStack Form has a v2 alpha, so its API will move.

**Concrete gaps in shadcn/ui (verified against live registry source)**

- `data-table` does not exist as an installable item.
- `Field` does no ARIA wiring: there are zero instances of `aria-describedby`, `aria-invalid` and `useId`
  (issue #8431). Errors are never associated with inputs.
- Auth blocks (`login-01…05`, `signup-01/02`) contain no submit handler, no
  state, no validation. Forgot/reset password, OTP, 2FA and verify screens
  don't exist.
- Focus rings use `ring-ring/50` and error rings `ring-destructive/20`, which
  fall below WCAG 1.4.11's 3:1 contrast.
- Pagination has no state or page-window logic. Sonner is a theme wrapper
  with no notification centre. No i18n layer. Calendar has no timezone or
  `Intl` support and has broken across react-day-picker majors (#4366, open
  26 months). Multi-select (#66) has been open since 2023.
- No strict-CSP nonce support (#4461).

**Competition.** "Assembled components" is now a category. `@niko-table`
(data tables) and `@elements` (auth/billing/uploads) are free registries in
the same lane. Differentiation therefore has to be **quality you can prove**:
accessibility you can document, correctness (timezones, i18n, RTL),
coherence across the whole system, and agent-readiness.

**Accessibility bar.** Build and test to **WCAG 2.2 AA**. The criteria
components most often fail:

| Criterion                       | What it means for components                                                           |
| ------------------------------- | -------------------------------------------------------------------------------------- |
| 2.5.8 Target Size               | ≥ 24×24px hit area: icon buttons, pagination, calendar cells, toast close, row actions |
| 2.5.7 Dragging                  | Every drag has a click path: slider track click, reorder buttons, resizable presets    |
| 1.4.11 Non-text Contrast        | Solid focus rings; no alpha rings                                                      |
| 2.4.11 Focus Not Obscured       | Sticky table headers and footers need `scroll-margin`                                  |
| 3.3.7 Redundant Entry           | Multi-step forms and failed submits keep entered values                                |
| 3.3.8 Accessible Authentication | Never block paste; correct `autocomplete` tokens; OTP accepts a full paste             |

No component library, including shadcn, Radix, Base UI, MUI and Mantine, publishes a VPAT/ACR. A
scoped ACR (VPAT 2.5 INT) is a possible later differentiator. Note that the
ADA Title II deadline moved to April 2027, and EN 301 549 v4.1.1 is not yet
cited in the EU Official Journal, so claims about legal urgency need care.

## 3. Stack

| Concern              | Choice                                                 | Why                                                       |
| -------------------- | ------------------------------------------------------ | --------------------------------------------------------- |
| Primitives           | `@base-ui/react` 1.8                                   | shadcn default; broadest primitive set; monthly releases  |
| Styling              | Tailwind CSS 4.3, CSS variables                        | shadcn-compatible tokens, plus `success`/`warning`/`info` |
| Variants             | `class-variance-authority`                             | Same as shadcn, so mixed projects stay consistent         |
| Class merge          | `cn` 0.3                                               | What shadcn now uses                                      |
| Tables               | TanStack Table 9 + Virtual 3                           | v9 is current; shadcn is still on the v8 recipe           |
| Forms                | react-hook-form 7.88 + zod 4                           | Default; adapter seam kept open for TanStack Form         |
| URL state            | nuqs 2                                                 | Table filters/pagination in the URL                       |
| Server state (React) | TanStack Query 5                                       |                                                           |
| Auth recipe          | Better Auth 1.7                                        | Works in both templates                                   |
| Docs                 | Next.js 16 + Fumadocs 16                               | Same stack as ui.shadcn.com                               |
| Monorepo             | pnpm 11 + Turborepo 2                                  |                                                           |
| Language             | TypeScript 6.0.3                                       | TS 7 waits for 7.1's API (tooling compatibility)          |
| Lint/format          | ESLint 10 (next config) + Prettier 3 (tailwind plugin) | Matches shadcn; class sorting                             |
| Packages             | tsdown                                                 |                                                           |
| Tests (next)         | Vitest + Testing Library + axe; Playwright             | Accessibility is asserted, not assumed                    |

## 4. Repository layout

```txt
apps/www                 docs site + registry host (Next.js 16, Fumadocs)
  content/docs/          MDX docs
  registry/fujin/        SOURCE OF TRUTH for every shipped file
    ui/ components/ blocks/ hooks/ lib/ recipes/ examples/
    */_registry.ts       item definitions + meta.fujin
  registry/registry.ts   composes all items
  scripts/build-registry.ts
  public/r/              build output (gitignored)
packages/schema          @fujin/schema - registry + MCP metadata schemas
packages/mcp             @fujin/mcp - MCP server (stdio)
packages/cli             fujin - create / init / add / list / info / mcp / doctor
templates/next           Next.js starter (installed via the real shadcn CLI)
templates/react          Vite starter
scripts/sync-templates.mjs
```

**Registry build** (`pnpm --filter www registry:build`):
validate → `registry.json` → `shadcn build` → `public/r/{name}.json` →
`public/r/mcp/index.json` (compact catalog) + `public/r/mcp/{name}.json`
(guidance, no source) → `registry/__index__.ts` (docs previews).

**Served URLs**: `/r/registry.json`, `/r/{name}.json`, `/r/mcp/*`, and every docs
page as markdown at `/docs/<page>.md`.

## 5. MCP design

| Tool                  | Returns                                                                               | Cost            |
| --------------------- | ------------------------------------------------------------------------------------- | --------------- |
| `list_items`          | one line per item, filterable                                                         | ~35 tokens/item |
| `search_items`        | ranked one-liners                                                                     | small           |
| `get_item`            | when/when-not, anatomy, props, examples, pitfalls, a11y, files; `sections` narrows it | ~250–600 tokens |
| `get_item_source`     | installed files                                                                       | full source     |
| `get_install_command` | one command                                                                           | one line        |

Resources: `fujin://catalog`, `fujin://item/{name}`. Responses are compact
markdown, not JSON. Unknown names get "did you mean" suggestions.

`meta.fujin` schema (`packages/schema/src/mcp.ts`): `summary`, `whenToUse`,
**`whenNotToUse`**, `anatomy`, `props[]` (with `owner` for sub-components),
`examples[]`, `pitfalls`, `a11y`, `tokens`, `related`, `editing{ui,logic}`,
`status`, `frameworks`. The build warns about items without it.

## 6. Definition of done for a component

- [ ] Source in `registry/fujin/...`, `"use client"` only where needed
- [ ] Every Base UI prop forwarded; controlled and uncontrolled both work
- [ ] `data-slot` on every part; theme tokens only
- [ ] Composite: headless hook in `lib/`, markup in `components/`
- [ ] WCAG 2.2 AA items from §2 checked; axe test passes
- [ ] `meta.fujin` complete, including `whenNotToUse` and `pitfalls`
- [ ] Example in `examples/` + docs page with preview, install, usage, API
- [ ] Builds in both templates (`pnpm templates:sync` + build)

## 7. Roadmap

**Phase 0: foundation (done)**
Monorepo, docs site, registry pipeline, MCP server, CLI, both templates,
`theme`, `utils`, `spinner`, `button`, `input`, `field`. Verified end to end:
the shadcn CLI installs from the registry into both templates, both build,
and browser tests confirm the Field ARIA wiring and the loading button.

**Phase 1: primitives.** Label, textarea, checkbox, checkbox-group, radio-group,
switch, select, native-select, number-field, otp-field, slider, toggle,
toggle-group, separator, badge, alert, card, skeleton, avatar, kbd, tooltip,
popover, dialog, alert-dialog, drawer/sheet, dropdown-menu, context-menu,
menubar, tabs, accordion, collapsible, scroll-area, progress, meter, toast
(Base UI), breadcrumb, pagination (with page-window logic), empty-state.
Also: a shared overlay-stack test matrix (dialog-in-dropdown, combobox-in-dialog, and so on).

**Phase 2: data.** `data-table` as the flagship. Full spec, decisions and
build order in `docs/data-table-plan.md`. Summary: TanStack Table v9,
headless `useDataTable` (server-driven by default, client-mode escape
hatch), multi-sort, a Shopify-style search bar (combobox that turns picked
columns into pills) unified with GitHub-style per-column header filters,
row selection with a cross-page "select all N" descriptor driving bulk
actions and CSV export, URL state via `nuqs`, and a header/action-bar that
sticks to the viewport (not just the table's scroll container). Column
pinning/resizing/reordering/grouping, saved views and virtualization-by-
default are explicitly deferred past v1. Needs 9 new primitives first
(`table`, `checkbox`, `popover`, `command`, `dropdown-menu`, `badge`,
`tooltip`, `separator`, `skeleton`) since only `spinner`/`button`/`input`/
`field` exist today.

**Phase 3: forms.** `form` (react-hook-form + zod, `Controller` wiring to
Field), form-array, multi-step form/stepper that keeps state, combobox-async
(debounce, loading, infinite scroll), multi-select, tag-input, date-picker,
date-range-picker and datetime-picker with IANA timezones (evaluate Temporal
and `@tanstack/time`), phone input, currency input, file-upload (drop zone,
progress, validation).

**Phase 4: recipes.** `auth` (Better Auth: sign in/up, forgot/reset,
verify email, 2FA, sessions; Next.js and SPA variants), `crud`, `settings`,
`billing`, `uploads`, `notifications` (persistent inbox, not only toasts).

**Phase 5: blocks and polish.** Dashboard shell with sidebar, command palette,
charts, i18n message layer, RTL audit, CSP nonce support, scoped ACR.

**Infrastructure, in parallel:** CI (build, typecheck, lint, registry
validation, template builds), Vitest + axe per component, Playwright visual
checks for docs previews, changesets releases, deployment of `apps/www`,
listing in shadcn's registry directory.

## 8. Open questions

- **Domain and npm scope.** `fujin.dev` and `@fujin/*` are placeholders; the
  registry URL is configurable via `FUJIN_REGISTRY_URL`.
- **Radix variant.** Base UI only for now. A Radix base would double the
  maintenance work; revisit if users ask for it.
- **Versioned updates.** Copy-paste code cannot be upgraded with `npm update`.
  Options: `fujin diff` (built on `shadcn add --diff`) or moving the headless
  `lib/` hooks into an optional versioned package.
- **TypeScript 7.** Move once 7.1 lands and typescript-eslint supports it.
