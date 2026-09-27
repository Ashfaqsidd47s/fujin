# Agent guide

Vite 8 + React 19 SPA + TanStack Query + Tailwind CSS v4 + Fujin components (Base UI).

## Before building UI

1. **Check Fujin first.** Use the `fujin` MCP server: `search_items` or
   `list_items`, then `get_item` for the one you pick. Do not rebuild a table,
   form, dialog or auth screen that the registry already has.
2. **Install, don't copy.** `npx fujin add <name>` (or
   `npx shadcn@latest add @fujin/<name>`).
3. **Only read source when you must change behaviour** (`get_item_source`).

## Where things live

| Path                   | Contents                                | Edit?                    |
| ---------------------- | --------------------------------------- | ------------------------ |
| `src/components/ui/`   | Installed Fujin/shadcn components       | Restyle freely           |
| `src/lib/<component>/` | Headless logic for composite components | Only to change behaviour |
| `src/app.tsx`          | App root                                | Your code                |
| `src/lib/api.ts`       | JSON fetch wrapper, `ApiError`          | Extend for auth          |
| `src/lib/env.ts`       | Validated `VITE_*` variables            | Add new vars here        |

## Conventions

- Put data access in `src/lib/` and call it through TanStack Query hooks.
- Validate input with zod before sending. Map `ApiError.fieldErrors` (shape
  `{ field: string[] }`) straight into `<FieldError errors={...} />`.
- Buttons default to `type="button"`. Write `type="submit"` explicitly.
- Base UI uses `render`, not `asChild`:
  `<Button render={<a href="/x" />} nativeButton={false}>`.
- Wrap every control in `<Field>`; never wire `id`/`htmlFor`/`aria-*` by hand.
- Use theme tokens (`bg-primary`, `text-success`), not raw colours.
- Read environment variables through `env` from `@/lib/env`. Never put secrets in `VITE_*`.

## Commands

```bash
npm run dev        # dev server
npm run build      # type-check + production build
npm run typecheck
```
