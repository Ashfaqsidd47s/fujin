/**
 * Publishes every public workspace package whose current version is not on
 * npm yet. Works locally (after `npm login`) and in CI with npm trusted
 * publishing (OIDC), where npm adds provenance automatically.
 *
 * Packages are packed with pnpm, which rewrites `workspace:*` ranges to real
 * versions, and the tarball is published with npm, which implements trusted
 * publishing.
 *
 *   pnpm release            # build + publish
 *   pnpm release --dry-run  # show what would be published
 */
import { execSync } from "node:child_process"
import { mkdtempSync, readFileSync, readdirSync, rmSync } from "node:fs"
import { tmpdir } from "node:os"
import path from "node:path"
import { fileURLToPath } from "node:url"

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const dryRun = process.argv.includes("--dry-run")
// Paths are wrapped, not escaped: Windows paths must keep single backslashes.
const quote = (value) => (/^[\w@./:=-]+$/.test(value) ? value : `"${value}"`)

// A shell resolves npm/pnpm shims (`.cmd` on Windows) the same way a user would.
function run(command, args, options = {}) {
  return execSync([command, ...args].map(quote).join(" "), {
    encoding: "utf8",
    ...options,
  })
}

function isPublished(name, version) {
  try {
    return (
      run("npm", ["view", `${name}@${version}`, "version"], {
        stdio: ["ignore", "pipe", "ignore"],
      }).trim() === version
    )
  } catch {
    return false
  }
}

// Publish dependencies first (schema before mcp and cli).
const ORDER = ["schema", "mcp", "cli"]
const packages = readdirSync(path.join(ROOT, "packages"))
  .map((dir) => {
    const cwd = path.join(ROOT, "packages", dir)
    const pkg = JSON.parse(readFileSync(path.join(cwd, "package.json"), "utf8"))
    return { dir, cwd, pkg }
  })
  .filter(({ pkg }) => !pkg.private)
  .sort((a, b) => ORDER.indexOf(a.dir) - ORDER.indexOf(b.dir))

const outDir = mkdtempSync(path.join(tmpdir(), "fujin-publish-"))
const published = []

try {
  for (const { cwd, pkg } of packages) {
    const id = `${pkg.name}@${pkg.version}`
    if (isPublished(pkg.name, pkg.version)) {
      console.log(`skip     ${id} (already on npm)`)
      continue
    }

    const before = new Set(readdirSync(outDir))
    run("pnpm", ["pack", "--pack-destination", outDir], {
      cwd,
      stdio: "inherit",
    })
    const tarball = readdirSync(outDir).find((file) => !before.has(file))
    if (!tarball) throw new Error(`pnpm pack produced no tarball for ${id}`)

    const tag = pkg.version.includes("-") ? "next" : "latest"
    const args = [
      "publish",
      path.join(outDir, tarball),
      "--access",
      "public",
      "--tag",
      tag,
    ]
    if (dryRun) args.push("--dry-run")

    console.log(`${dryRun ? "dry-run " : "publish  "}${id} (tag: ${tag})`)
    run("npm", args, { cwd, stdio: "inherit" })

    if (!dryRun) {
      published.push(id)
      // Same format as `changeset publish`; changesets/action reads these lines
      // to create GitHub releases.
      console.log(`New tag: ${id}`)
      run("git", ["tag", id], { cwd: ROOT, stdio: "inherit" })
    }
  }
} finally {
  rmSync(outDir, { recursive: true, force: true })
}

if (dryRun) console.log("\nDry run complete. Nothing was published.")
else if (published.length) console.log(`\nPublished: ${published.join(", ")}`)
else console.log("\nNothing new to publish.")
