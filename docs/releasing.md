# Deploying and releasing

Fujin has two things to ship:

1. **The site** (`apps/www`): docs plus the registry the CLI, MCP server and
   `shadcn add` read from (`/r/*.json`).
2. **Three npm packages**: `@fujin/schema`, `@fujin/mcp`, `fujin`.

Deploy the site first. The packages point at it.

## 0. Pick your names (once)

The defaults are `https://fujin.dev`, the npm scope `@fujin` and the GitHub
repo `ashfaqaxe-stack/fujin`. Change any of them in one step:

```bash
pnpm configure --site https://ui.example.com --scope @your-scope --dry-run
pnpm configure --site https://ui.example.com --scope @your-scope
pnpm install && pnpm build && pnpm typecheck
```

Before publishing, create the npm organization that matches the scope
(npmjs.com → Add organization). Publishing under `@fujin` requires owning
the `fujin` org. Unscoped `fujin` is already taken on npm.

## 1. Deploy the site

### Vercel

1. Import the GitHub repo.
2. **Root Directory**: `apps/www`. Leave the other build settings as they are:
   `apps/www/vercel.json` sets the install and build commands (pnpm 11 +
   Turborepo, which builds `@fujin/schema` and the registry first).
3. **Environment variables**: `NEXT_PUBLIC_SITE_URL=https://ui.example.com`
   (Production). Preview deployments can use their own URL or leave it unset.
4. Add your domain.

### Docker (any host)

Build from the repository root:

```bash
docker build -f apps/www/Dockerfile \
  --build-arg NEXT_PUBLIC_SITE_URL=https://ui.example.com \
  -t fujin-www .
docker run -p 3000:3000 fujin-www
```

The image runs Next.js in standalone mode as a non-root user on port 3000
and has a health check on `/r/registry.json`. Put it behind any reverse
proxy that terminates TLS.

### Any other Node host

```bash
pnpm install --frozen-lockfile
NEXT_PUBLIC_SITE_URL=https://ui.example.com pnpm turbo run build --filter=www
pnpm --filter www exec next start -p 3000
```

### Check the deployment

```bash
curl -I https://ui.example.com/r/registry.json          # 200, CORS header
curl https://ui.example.com/r/mcp/index.json             # compact catalog
curl https://ui.example.com/docs/components/button.md    # markdown docs
npx shadcn@latest view https://ui.example.com/r/button.json
```

| Path                                      | Purpose                    |
| ----------------------------------------- | -------------------------- |
| `/r/registry.json`, `/r/{name}.json`      | shadcn registry            |
| `/r/mcp/index.json`, `/r/mcp/{name}.json` | Agent catalog and guidance |
| `/docs/**.md`                             | Docs as markdown           |
| `/api/search`                             | Docs search                |
| `/sitemap.xml`, `/robots.txt`             | SEO                        |

The registry is served with `Access-Control-Allow-Origin: *`, a 5-minute
browser cache and a 1-hour CDN cache. Vercel purges its CDN on each deploy;
on other hosts, purge `/r/*` after deploying or expect up to an hour of
staleness.

## 2. Publish the npm packages

### First release (from your machine)

Trusted publishing is configured on each package's settings page on
npmjs.com, which only exists after a first publish. So publish 0.1.0 by hand:

```bash
npm login
pnpm release:dry     # build + show exactly what would be published
pnpm release         # build + publish anything not on npm yet
git push --tags
```

`pnpm release` packs each package with pnpm (which turns `workspace:*` into
real versions) and publishes the tarball with npm, in dependency order
(schema → mcp → cli). Versions already on npm are skipped, so it is safe to
re-run.

### Set up trusted publishing (once per package)

On npmjs.com, for each of `@fujin/schema`, `@fujin/mcp`, `fujin`:
**Settings → Trusted publishing → GitHub Actions**

| Field                | Value             |
| -------------------- | ----------------- |
| Organization or user | `ashfaqaxe-stack` |
| Repository           | `fujin`           |
| Workflow filename    | `release.yml`     |
| Environment          | `npm`             |

Tick **allow `npm publish`** as well: configurations created after
3 September 2026 default to staged publishing only. Then, under
**Settings → Publishing access**, choose "Require two-factor authentication
and disallow tokens".

In the GitHub repo:

- **Settings → Actions → General → Workflow permissions**: enable "Allow
  GitHub Actions to create and approve pull requests".
- **Settings → Secrets and variables → Actions → Variables**: add
  `RELEASE_ENABLED` = `true`. The Release workflow is skipped until this
  exists, so it never tries to publish before npm is configured.

### Every release after that

1. In the PR that changes a package, add a changeset:
   ```bash
   pnpm changeset
   ```
2. Merge to `main`. The **Release** workflow opens a "Version Packages" PR
   that bumps versions, writes changelogs and syncs `packages/mcp/server.json`.
3. Merge that PR. The workflow publishes to npm with provenance, tags the
   release and creates GitHub releases. No npm token is stored anywhere.

Prereleases: `pnpm changeset pre enter next`, then release as usual. The
publish script uses the `next` dist-tag for any version with a `-`.

## 3. Optional: list the MCP server

`packages/mcp/server.json` is ready for the official MCP Registry once
`@fujin/mcp` is on npm:

```bash
# https://github.com/modelcontextprotocol/registry (mcp-publisher)
cd packages/mcp
mcp-publisher login github
mcp-publisher publish
```

`mcpName` in `packages/mcp/package.json` must match `name` in `server.json`
(`io.github.<owner>/<repo>`). `pnpm configure --repo` keeps them aligned.

## 4. Optional: list the registry in shadcn's directory

Open a PR against `shadcn-ui/ui` adding your registry to
`apps/v4/registry/directory.json`, so `@fujin/...` resolves without any
`components.json` setup.
