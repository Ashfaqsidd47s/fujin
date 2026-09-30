/**
 * Re-installs registry items into each template with the real shadcn CLI, so
 * templates always ship exactly what the registry serves.
 *
 * Needs the docs site serving the registry:
 *   pnpm --filter www dev
 *   pnpm templates:sync
 *
 * It rebuilds the registry so item dependencies point at the local server
 * (not the public site), and rebuilds it for the public site when done.
 */
import { execFileSync } from "node:child_process"
import { readFileSync, writeFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const LOCAL_REGISTRY =
  process.env.FUJIN_REGISTRY_URL ?? "http://localhost:4100/r"
const PUBLIC_REGISTRY = "https://package.hellofizzbuzz.in/r"

/** Items every template ships with. */
const ITEMS = ["theme", "utils", "spinner", "button", "input", "field"]
const TEMPLATES = ["next", "react"]

// The docs app pins the shadcn CLI; run it directly (no shell, no npx).
const SHADCN = path.join(
  ROOT,
  "apps",
  "www",
  "node_modules",
  "shadcn",
  "dist",
  "index.js"
)

const WWW = path.join(ROOT, "apps", "www")

/** `registry:build`, with dependency URLs pointing at `registryUrl`. */
function buildRegistry(registryUrl) {
  const env = { ...process.env }
  if (registryUrl) env.FUJIN_REGISTRY_URL = registryUrl
  else delete env.FUJIN_REGISTRY_URL
  execFileSync(
    process.execPath,
    [
      path.join(WWW, "node_modules", "tsx", "dist", "cli.mjs"),
      "scripts/build-registry.ts",
    ],
    { cwd: WWW, env, stdio: "inherit" }
  )
}

try {
  await fetch(`${LOCAL_REGISTRY}/registry.json`).then((response) => {
    if (!response.ok) throw new Error(String(response.status))
  })
} catch {
  console.error(
    `Registry not reachable at ${LOCAL_REGISTRY}. Start it with \`pnpm --filter www dev\`.`
  )
  process.exit(1)
}

buildRegistry(LOCAL_REGISTRY)
try {
  for (const template of TEMPLATES) {
    const cwd = path.join(ROOT, "templates", template)
    const configPath = path.join(cwd, "components.json")
    const original = readFileSync(configPath, "utf8")
    const config = JSON.parse(original)
    config.registries = {
      ...config.registries,
      "@fujin": `${LOCAL_REGISTRY}/{name}.json`,
    }

    console.log(`\n> templates/${template}`)
    writeFileSync(configPath, `${JSON.stringify(config, null, 2)}\n`)
    try {
      execFileSync(
        process.execPath,
        [
          SHADCN,
          "add",
          ...ITEMS.map((item) => `@fujin/${item}`),
          "--yes",
          "--overwrite",
        ],
        { cwd, stdio: "inherit" }
      )
    } finally {
      // Never leave a localhost registry in a shipped template.
      const restored = JSON.parse(original)
      restored.registries = {
        ...restored.registries,
        "@fujin": `${PUBLIC_REGISTRY}/{name}.json`,
      }
      writeFileSync(configPath, `${JSON.stringify(restored, null, 2)}\n`)
    }
  }
} finally {
  buildRegistry()
}

console.log("\nTemplates synced.")
