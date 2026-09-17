# Agent guide

Next.js 16 (App Router) + React 19 + Tailwind CSS v4 + Fujin components (Base UI).

<!-- BEGIN:nextjs-agent-rules -->

This version of Next.js has breaking changes; APIs and conventions may differ
from your training data. Read the relevant guide in `node_modules/next/dist/docs/`
before writing framework code, and heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Before building UI

1. **Check Fujin first.** Use the `fujin` MCP server: `search_items` or
   `list_items`, then `get_item` for the one you pick. Do not rebuild a table,
   form, dialog or auth screen that the registry already has.
2. **Install, don't copy.** `npx @fujin/cli add <name>` (or
   `npx shadcn@latest add @fujin/<name>`).
3. **Only read source when you must change behaviour** (`get_item_source`).

## Where things live

| Path               | Contents                                | Edit?                    |
| ------------------ | --------------------------------------- | ------------------------ |
| `components/ui/`   | Installed Fujin/shadcn components       | Restyle freely           |
| `lib/<component>/` | Headless logic for composite components | Only to change behaviour |
| `app/`             | Routes, layouts, server actions         | Your code                |
| `lib/env.ts`       | Validated environment variables         | Add new vars here        |

## Conventions

- Put business logic in server actions or `lib/`, not in components.
- Validate input with zod on the server. Return field errors as
  `{ errors: { field: string[] } }`; `<FieldError errors={...} />` renders them.
- Echo submitted values back from actions and use them as `defaultValue`;
  React resets forms after an action runs.
- Buttons default to `type="button"`. Write `type="submit"` explicitly.
- Base UI uses `render`, not `asChild`:
  `<Button render={<Link href="/x" />} nativeButton={false}>`.
- Wrap every control in `<Field>`; never wire `id`/`htmlFor`/`aria-*` by hand.
- Use theme tokens (`bg-primary`, `text-success`), not raw colours.
- Read environment variables through `env` from `@/lib/env`.

## Commands

```bash
npm run dev        # dev server
npm run build      # production build (also type-checks)
npm run lint
npm run typecheck
```
