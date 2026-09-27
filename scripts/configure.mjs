/**
 * Points the project at your own domain, npm scope and GitHub repository.
 *
 *   pnpm configure --site https://ui.example.com
 *   pnpm configure --scope @acme-ui
 *   pnpm configure --repo my-org/my-repo
 *   pnpm configure --site ... --scope ... --repo ... --dry-run
 *
 * Rewrites every git-tracked text file. The shadcn registry namespace
 * (`@fujin/button` in components.json) is independent of the npm scope and is
 * left alone.
 */
import { execFileSync } from "node:child_process"
import { readFileSync, writeFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { parseArgs } from "node:util"

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")

const CURRENT = {
  site: "https://fujin.dev",
  scope: "@fujin",
  repo: "ashfaqaxe-stack/fujin",
}
const PACKAGES = ["cli", "mcp", "schema", "template-next", "template-react"]

const { values } = parseArgs({
  options: {
    site: { type: "string" },
    scope: { type: "string" },
    repo: { type: "string" },
    "dry-run": { type: "boolean", default: false },
  },
})

if (!values.site && !values.scope && !values.repo) {
  console.log(
    readFileSync(fileURLToPath(import.meta.url), "utf8").split("*/")[0]
  )
  process.exit(1)
}

const replacements = []

if (values.site) {
  const site = values.site.replace(/\/+$/, "")
  if (!/^https?:\/\/[^/]+$/.test(site)) {
    throw new Error(
      `--site must be an origin like https://ui.example.com (got ${site})`
    )
  }
  replacements.push([CURRENT.site, site])
}

if (values.scope) {
  const scope = values.scope.startsWith("@") ? values.scope : `@${values.scope}`
  if (!/^@[a-z0-9][a-z0-9._-]*$/.test(scope)) {
    throw new Error(`--scope must be a valid npm scope (got ${scope})`)
  }
  for (const name of PACKAGES) {
    replacements.push([`${CURRENT.scope}/${name}`, `${scope}/${name}`])
  }
  // Keep this script's own starting point in sync.
  replacements.push([`scope: "${CURRENT.scope}"`, `scope: "${scope}"`])
}

if (values.repo) {
  if (!/^[\w.-]+\/[\w.-]+$/.test(values.repo)) {
    throw new Error(`--repo must look like owner/name (got ${values.repo})`)
  }
  const [owner, name] = values.repo.split("/")
  const [oldOwner, oldName] = CURRENT.repo.split("/")
  replacements.push(
    [CURRENT.repo, values.repo],
    [
      `owner: ${oldOwner}, repository: ${oldName}`,
      `owner: ${owner}, repository: ${name}`,
    ]
  )
}

const files = execFileSync("git", ["ls-files"], { cwd: ROOT, encoding: "utf8" })
  .split("\n")
  .filter(Boolean)
  .filter(
    (file) =>
      !/(^|\/)pnpm-lock\.yaml$|\.(png|ico|jpg|jpeg|gif|webp|woff2?)$/.test(file)
  )
  .filter((file) => file !== "docs/brief.md")

const changed = []
for (const file of files) {
  const absolute = path.join(ROOT, file)
  const before = readFileSync(absolute, "utf8")
  let after = before
  for (const [from, to] of replacements) after = after.split(from).join(to)
  if (after !== before) {
    changed.push(file)
    if (!values["dry-run"]) writeFileSync(absolute, after)
  }
}

console.log(
  `${values["dry-run"] ? "Would update" : "Updated"} ${changed.length} files:\n${changed.map((file) => `  ${file}`).join("\n")}`
)

if (!values["dry-run"] && changed.length) {
  console.log(`
Next:
  pnpm install                 # refresh the lockfile for renamed packages
  pnpm build && pnpm typecheck`)
}
