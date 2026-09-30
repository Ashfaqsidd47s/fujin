/**
 * Builds the public registry.
 *
 * Pipeline:
 *   1. Load and validate the registry definition (`registry/registry.ts`).
 *   2. Emit `registry.json` for the shadcn CLI.
 *   3. Run `shadcn build` -> `public/r/{name}.json` + `public/r/registry.json`,
 *      then point each item's `@fujin/<name>` dependencies at absolute URLs.
 *   4. Emit the MCP artifacts: a compact catalog plus one doc per item.
 *   5. Emit `registry/__index__.ts` so the docs site can render live previews.
 *
 * Step 4 is the part that does not exist upstream. `public/r/{name}.json`
 * inlines full file contents, which is exactly what an agent should *not* have
 * to read just to decide whether a component fits. The MCP artifacts are the
 * cheap layer: catalog entries are ~30 tokens, a full component doc is a few
 * hundred, and source is fetched only on demand.
 */
import { execFileSync } from "node:child_process"
import { existsSync } from "node:fs"
import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

import {
  REGISTRY_NAMESPACE,
  registrySchema,
  type RegistryItem,
} from "@fujin/schema"

import { registry } from "../registry/registry"

const APP_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  ".."
)
const OUTPUT_DIR = path.join(APP_ROOT, "public", "r")
const MCP_DIR = path.join(OUTPUT_DIR, "mcp")
const REGISTRY_JSON = path.join(APP_ROOT, "registry.json")

/**
 * Where this build will be served. `FUJIN_REGISTRY_URL` (an http URL) wins,
 * so a local build can point at `http://localhost:4100/r`; otherwise the
 * deployment's site URL.
 */
const SERVED_URL = (
  process.env.FUJIN_REGISTRY_URL?.startsWith("http")
    ? process.env.FUJIN_REGISTRY_URL
    : `${registry.homepage}/r`
).replace(/\/+$/, "")

/** Types that exist only to serve the docs site and are never published. */
const INTERNAL_TYPES = new Set(["registry:example", "registry:internal"])

function log(step: string, detail = "") {
  process.stdout.write(`  ${step.padEnd(22)}${detail}\n`)
}

async function buildRegistryJson() {
  const parsed = registrySchema.safeParse(registry)

  if (!parsed.success) {
    console.error("\n  Registry failed validation:\n")
    for (const issue of parsed.error.issues) {
      console.error(`   - ${issue.path.join(".")}: ${issue.message}`)
    }
    process.exit(1)
  }

  const publicItems = parsed.data.items.filter(
    (item) => !INTERNAL_TYPES.has(item.type)
  )

  const duplicates = publicItems
    .map((item) => item.name)
    .filter((name, index, all) => all.indexOf(name) !== index)

  if (duplicates.length > 0) {
    console.error(
      `\n  Duplicate item names: ${[...new Set(duplicates)].join(", ")}\n`
    )
    process.exit(1)
  }

  await writeFile(
    REGISTRY_JSON,
    `${JSON.stringify(
      {
        $schema: "https://ui.shadcn.com/schema/registry.json",
        name: parsed.data.name,
        homepage: parsed.data.homepage,
        items: publicItems,
      },
      null,
      2
    )}\n`,
    "utf8"
  )

  log("registry.json", `${publicItems.length} items`)
  return publicItems
}

function runShadcnBuild() {
  execFileSync(
    process.execPath,
    [
      path.join(APP_ROOT, "node_modules", "shadcn", "dist", "index.js"),
      "build",
      "registry.json",
      "--output",
      path.relative(APP_ROOT, OUTPUT_DIR),
    ],
    { cwd: APP_ROOT, stdio: "inherit" }
  )
}

/**
 * `@fujin/button` resolves only in projects that list `@fujin` under
 * `registries` in components.json. As absolute URLs the dependencies also
 * resolve for `shadcn add <url>` with no setup. The source and the MCP docs
 * keep the short names.
 */
async function absolutizeDependencies(items: RegistryItem[]) {
  const prefix = `${REGISTRY_NAMESPACE}/`
  let rewritten = 0
  for (const item of items) {
    const file = path.join(OUTPUT_DIR, `${item.name}.json`)
    const built = JSON.parse(await readFile(file, "utf8")) as {
      registryDependencies?: string[]
    }
    if (!built.registryDependencies?.some((dep) => dep.startsWith(prefix))) {
      continue
    }
    built.registryDependencies = built.registryDependencies.map((dep) =>
      dep.startsWith(prefix)
        ? `${SERVED_URL}/${dep.slice(prefix.length)}.json`
        : dep
    )
    await writeFile(file, `${JSON.stringify(built, null, 2)}\n`, "utf8")
    rewritten++
  }
  log("dependency urls", `${rewritten} items -> ${SERVED_URL}`)
}

/**
 * The compact catalog. One entry per item, deliberately tiny: a name, a type,
 * a category and a single sentence. An agent lists the whole registry for
 * roughly the cost of reading one component's source.
 */
function toCatalogEntry(item: RegistryItem) {
  const status = item.meta?.fujin?.status
  const frameworks = item.meta?.fujin?.frameworks
  return {
    name: item.name,
    type: item.type.replace("registry:", ""),
    summary: item.meta?.fujin?.summary ?? item.description,
    // Defaults are omitted to keep every entry as small as possible.
    ...(item.categories?.length ? { categories: item.categories } : {}),
    ...(status && status !== "stable" ? { status } : {}),
    ...(frameworks && frameworks.length < 2 ? { frameworks } : {}),
  }
}

/** The full agent-facing document for a single item - still no source code. */
function toMcpDoc(item: RegistryItem) {
  const fujin = item.meta?.fujin

  return {
    name: item.name,
    type: item.type.replace("registry:", ""),
    title: item.title,
    description: item.description,
    categories: item.categories ?? [],
    install: `npx shadcn@latest add @fujin/${item.name}`,
    summary: fujin?.summary,
    whenToUse: fujin?.whenToUse ?? [],
    whenNotToUse: fujin?.whenNotToUse ?? [],
    anatomy: fujin?.anatomy,
    props: fujin?.props ?? [],
    examples: fujin?.examples ?? [],
    pitfalls: fujin?.pitfalls ?? [],
    a11y: fujin?.a11y ?? [],
    tokens: fujin?.tokens ?? [],
    related: fujin?.related ?? [],
    editing: fujin?.editing,
    status: fujin?.status ?? "stable",
    frameworks: fujin?.frameworks ?? ["react", "next"],
    dependencies: item.dependencies ?? [],
    registryDependencies: item.registryDependencies ?? [],
    files: (item.files ?? []).map((file) => ({
      path: file.path,
      type: file.type.replace("registry:", ""),
      target: file.target,
    })),
    docs: item.docs,
  }
}

async function buildMcpArtifacts(items: RegistryItem[]) {
  await mkdir(MCP_DIR, { recursive: true })

  const catalog = items.map(toCatalogEntry)

  await writeFile(
    path.join(MCP_DIR, "index.json"),
    // Minified on purpose: whitespace is pure token cost for an agent.
    JSON.stringify({
      name: registry.name,
      homepage: registry.homepage,
      items: catalog,
    }),
    "utf8"
  )

  await Promise.all(
    items.map((item) =>
      writeFile(
        path.join(MCP_DIR, `${item.name}.json`),
        JSON.stringify(toMcpDoc(item)),
        "utf8"
      )
    )
  )

  const documented = items.filter((item) => item.meta?.fujin).length
  log("mcp artifacts", `${items.length} items, ${documented} with metadata`)

  const undocumented = items
    .filter((item) => !item.meta?.fujin && !INTERNAL_TYPES.has(item.type))
    .map((item) => item.name)

  if (undocumented.length > 0) {
    log("", `missing meta.fujin: ${undocumented.join(", ")}`)
  }
}

/**
 * Generates the map the docs site uses to render live previews, so demos are
 * always the same code the registry ships.
 */
async function buildComponentIndex(items: RegistryItem[]) {
  const previewable = items.filter(
    (item) => item.type === "registry:example" && item.files?.[0]
  )

  const entries = previewable
    .map((item) => {
      const file = item.files![0]!
      const importPath = `@/registry/${file.path.replace(/^registry\//, "").replace(/\.tsx?$/, "")}`
      return `  "${item.name}": {
    name: "${item.name}",
    component: React.lazy(() => import("${importPath}")),
  },`
    })
    .join("\n")

  const contents = `// GENERATED BY scripts/build-registry.ts - DO NOT EDIT.
import * as React from "react"

export const Index: Record<
  string,
  { name: string; component: React.LazyExoticComponent<React.ComponentType> }
> = {
${entries}
}
`

  await writeFile(
    path.join(APP_ROOT, "registry", "__index__.ts"),
    contents,
    "utf8"
  )
  log("preview index", `${previewable.length} examples`)
}

async function main() {
  process.stdout.write("\n  Building the Fujin registry\n\n")

  if (existsSync(OUTPUT_DIR)) {
    await rm(OUTPUT_DIR, { recursive: true, force: true })
  }
  await mkdir(OUTPUT_DIR, { recursive: true })

  const publicItems = await buildRegistryJson()
  runShadcnBuild()
  await absolutizeDependencies(publicItems)

  const allItems = registry.items as RegistryItem[]
  await buildMcpArtifacts(publicItems)
  await buildComponentIndex(allItems)

  const written = await readdir(OUTPUT_DIR)
  log("output", `public/r (${written.length} entries)`)
  process.stdout.write("\n  Done.\n\n")
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
