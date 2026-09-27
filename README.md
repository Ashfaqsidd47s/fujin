# Fujin

Production-ready React components you own. Full data tables, full forms, full
features, not primitives you have to assemble.

Fujin is a [shadcn](https://ui.shadcn.com)-compatible registry built on
[Base UI](https://base-ui.com) and Tailwind CSS v4. Components are copied into
your project, so you can read and change all of it. Every item also ships
structured guidance for coding agents over MCP.

```bash
npx fujin create my-app --template next   # or --template react
npx fujin add button field                # into an existing project
```

See [docs/plan.md](docs/plan.md) for the architecture, research and roadmap.

## Repository

| Path                                | What                                                |
| ----------------------------------- | --------------------------------------------------- |
| `apps/www`                          | Docs site and registry host (Next.js 16 + Fumadocs) |
| `apps/www/registry/fujin`           | Source of every component the registry ships        |
| `packages/schema`                   | Registry and agent-metadata schemas                 |
| `packages/mcp`                      | MCP server (`@fujin/mcp`)                           |
| `packages/cli`                      | CLI (`fujin`)                                       |
| `templates/next`, `templates/react` | Starter apps                                        |

## Development

Requires Node 22.12+ and pnpm 11.

```bash
pnpm install
pnpm --filter www registry:build   # build the registry into apps/www/public/r
pnpm --filter www dev              # docs + registry on http://localhost:4100
```

Other tasks:

```bash
pnpm build                  # everything, via Turborepo
pnpm typecheck
pnpm lint
pnpm templates:sync         # reinstall registry items into both templates (needs the dev server)
pnpm --filter @fujin/mcp smoke   # drive the MCP server with a real client
pnpm configure --site <url> --scope <@scope>   # use your own domain / npm scope
pnpm release:dry            # preview an npm release
```

Point the CLI or MCP server at a local registry with
`FUJIN_REGISTRY_URL=http://localhost:4100/r`.

### Trying it in another project before publishing

The registry is not hosted and the packages are not on npm yet, so use the
local build:

```bash
# 1. In this repo: build and serve the registry
pnpm install && pnpm build
pnpm --filter www start                     # http://localhost:4100

# 2. Anywhere else (macOS/Linux shell shown)
export FUJIN_REGISTRY_URL=http://localhost:4100/r
FUJIN=/path/to/fujin/packages/cli/dist/index.mjs

# New app from the GitHub template
node $FUJIN create my-app --template next    # or --template react

# Or an existing Next.js / Vite app with Tailwind v4
node $FUJIN init --yes
node $FUJIN add button field input
node $FUJIN mcp init                        # needs @fujin/mcp published, see below
```

On Windows PowerShell use `$env:FUJIN_REGISTRY_URL = "http://localhost:4100/r"`.

For the MCP server before it is published, point your editor at the local
build: `"command": "node", "args": ["/path/to/fujin/packages/mcp/dist/bin.mjs"]`
with the same `FUJIN_REGISTRY_URL` in `env`.

To go live, follow [docs/releasing.md](docs/releasing.md): deploy `apps/www`
(Vercel or Docker), then publish the npm packages.

### Adding a component

1. Write it in `apps/www/registry/fujin/<tier>/`.
2. Register it, including `meta.fujin`, in that folder's `_registry.ts`.
3. Add a demo in `registry/fujin/examples/` and a page in
   `apps/www/content/docs/components/`.
4. `pnpm --filter www registry:build`, then check the docs page.

The checklist is in [docs/plan.md §6](docs/plan.md#6-definition-of-done-for-a-component).

## License

MIT
