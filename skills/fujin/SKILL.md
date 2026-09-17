---
name: fujin
description: Build React UI with Fujin, a shadcn-compatible registry of production-ready components (Base UI + Tailwind v4). Use when adding tables, forms, dialogs, auth or other UI to a project that has a components.json, or when the user mentions Fujin or @fujin.
---

# Fujin

Fujin components are copied into the project with the shadcn CLI. Prefer an
existing Fujin item over writing UI from scratch.

## Workflow

1. **Find.** With the `fujin` MCP server: `search_items` ("table with
   filters") or `list_items`. Without it: `npx @fujin/cli list`.
2. **Learn.** `get_item <name>` (or `npx @fujin/cli info <name>`). Read
   "Do not use when" and "Pitfalls" before writing code.
3. **Install.** `npx @fujin/cli add <name>`. This also installs registry
   dependencies. Never hand-copy registry files.
4. **Use.** Import from `@/components/ui/<name>`. Only read the source
   (`get_item_source`) if you must change behaviour.

If `components.json` lacks `"@fujin"` under `registries`, run
`npx @fujin/cli init`.

## Rules that differ from shadcn/ui

- Base UI: use `render`, not `asChild`. For links:
  `<Button render={<Link href="/x" />} nativeButton={false}>`.
- `Button` defaults to `type="button"`; write `type="submit"` in forms.
  Use `loading` / `loadingText` for pending state.
- Wrap controls in `Field`. Do not set `id`, `htmlFor` or `aria-describedby`
  yourself. With a form library, pass `invalid` to `Field` **and** `errors`
  to `FieldError`.
- Composite components keep behaviour in `lib/<name>/` and markup in
  `components/ui/<name>/`. Restyle the markup; leave the hooks alone unless
  the behaviour must change.
- Status colours exist: `success`, `warning`, `info` (plus `destructive`).
- Keep 24px minimum hit areas, never block paste, and keep user input after a
  failed submit.
