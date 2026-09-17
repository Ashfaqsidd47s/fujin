import { existsSync } from "node:fs"
import { cp, mkdir, readdir, readFile, writeFile } from "node:fs/promises"
import path from "node:path"

import { execa } from "execa"
import pc from "picocolors"
import { DEFAULT_REGISTRY_URL, GITHUB_REPOSITORY } from "@fujin/schema"

import {
  CliError,
  detectPackageManager,
  ensureRegistry,
  fetchJson,
  logger,
  majorOf,
  readComponentsJson,
  readPackageJson,
  REGISTRY_URL,
  qualify,
  runnerFor,
  runShadcn,
  type PackageManager,
} from "./utils"

export const TEMPLATES = ["next", "react"] as const
export type Template = (typeof TEMPLATES)[number]

const TEMPLATE_REPO = `gh:${GITHUB_REPOSITORY}/templates`

/* -------------------------------------------------------------------------- */
/* create                                                                     */
/* -------------------------------------------------------------------------- */

export async function create(
  name: string,
  options: {
    template: Template
    packageManager?: PackageManager
    install: boolean
  }
) {
  const target = path.resolve(name)
  if (existsSync(target) && (await readdir(target)).length > 0) {
    throw new CliError(`${name} already exists and is not empty.`)
  }

  logger.step(`Creating ${pc.bold(name)} from the ${options.template} template`)

  // FUJIN_TEMPLATE_DIR points at a local checkout's templates/ for development.
  const localTemplates = process.env.FUJIN_TEMPLATE_DIR
  if (localTemplates) {
    const source = path.join(localTemplates, options.template)
    if (!existsSync(source)) throw new CliError(`Template not found: ${source}`)
    await mkdir(target, { recursive: true })
    await cp(source, target, {
      recursive: true,
      filter: (file) =>
        !/[\\/](node_modules|\.next|dist|\.turbo)([\\/]|$)/.test(file),
    })
  } else {
    await execa(
      "npx",
      ["--yes", "giget@latest", `${TEMPLATE_REPO}/${options.template}`, target],
      { stdio: "inherit" }
    )
  }

  const packageFile = path.join(target, "package.json")
  const pkg = JSON.parse(await readFile(packageFile, "utf8"))
  pkg.name = path.basename(target)
  // Templates are workspace packages in the Fujin repo; make them standalone.
  pkg.private = true
  pkg.version = "0.1.0"
  await writeFile(packageFile, `${JSON.stringify(pkg, null, 2)}\n`, "utf8")

  const manager = options.packageManager ?? detectPackageManager(process.cwd())

  if (options.install) {
    logger.step(`Installing dependencies with ${manager}`)
    await execa(manager, ["install"], { cwd: target, stdio: "inherit" })
  }

  await ensureRegistry(target)

  logger.success(`Created ${name}`)
  logger.info(`
  ${pc.dim("Next steps:")}
    cd ${name}
    ${options.install ? "" : `${manager} install\n    `}${manager} run dev

  ${pc.dim("Add components:")}  npx @fujin/cli add button field
`)
}

/* -------------------------------------------------------------------------- */
/* init                                                                       */
/* -------------------------------------------------------------------------- */

export async function init(cwd: string, options: { yes: boolean }) {
  const pkg = await readPackageJson(cwd)
  if (!pkg) {
    throw new CliError(
      "No package.json here. To start a new app run `npx @fujin/cli create my-app`."
    )
  }

  if (!(await readComponentsJson(cwd))) {
    logger.step("No components.json - running shadcn init (Base UI)")
    await runShadcn(cwd, [
      "init",
      "--base",
      "base",
      "--preset",
      "nova",
      "--no-monorepo",
      ...(options.yes ? ["--yes"] : []),
    ])
  }

  if (await ensureRegistry(cwd)) {
    logger.success(`Registered ${pc.bold("@fujin")} -> ${REGISTRY_URL}`)
  }

  logger.step("Installing theme tokens and utilities")
  await runShadcn(cwd, ["add", "@fujin/theme", "@fujin/utils", "--yes"])

  if (await repairFontVariable(cwd)) {
    logger.success("Fixed a self-referencing --font-sans in your CSS")
  }

  logger.success("Fujin is ready.")
  logger.info(`
  ${pc.dim("Add components:")}  npx @fujin/cli add button field
  ${pc.dim("Agent setup:")}     npx @fujin/cli mcp init
`)
}

const SELF_REFERENCING_FONT = /--font-sans:\s*var\(--font-sans\)\s*;/

/**
 * `shadcn init` writes `--font-sans: var(--font-sans)` into the stylesheet and
 * expects the root layout to define `--font-sans` via next/font. When it
 * leaves an existing layout alone (e.g. create-next-app's, which defines
 * `--font-geist-sans`), the variable resolves to nothing and text falls back
 * to the browser's serif font. Point it at a font that actually exists.
 */
async function repairFontVariable(cwd: string) {
  const cssFile = (await readComponentsJson(cwd))?.tailwind
  const cssPath =
    typeof cssFile === "object" && cssFile && "css" in cssFile
      ? path.join(cwd, String(cssFile.css))
      : null
  if (!cssPath || !existsSync(cssPath)) return false

  const css = await readFile(cssPath, "utf8")
  if (!SELF_REFERENCING_FONT.test(css)) return false

  const layouts = [
    "app/layout.tsx",
    "src/app/layout.tsx",
    "app/layout.jsx",
    "src/app/layout.jsx",
  ]
    .map((file) => path.join(cwd, file))
    .filter((file) => existsSync(file))
  const layoutSource = (
    await Promise.all(layouts.map((file) => readFile(file, "utf8")))
  ).join("\n")

  // The layout provides --font-sans itself: nothing to fix.
  if (/["']--font-sans["']/.test(layoutSource)) return false

  const fallback = "ui-sans-serif, system-ui, sans-serif"
  const replacement = layoutSource.includes("--font-geist-sans")
    ? `var(--font-geist-sans), ${fallback}`
    : fallback

  await writeFile(
    cssPath,
    css.replace(SELF_REFERENCING_FONT, `--font-sans: ${replacement};`),
    "utf8"
  )
  return true
}

/* -------------------------------------------------------------------------- */
/* add                                                                        */
/* -------------------------------------------------------------------------- */

export async function add(
  cwd: string,
  names: string[],
  options: {
    yes: boolean
    overwrite: boolean
    dryRun: boolean
    path?: string
  }
) {
  if (names.length === 0) {
    throw new CliError("Name at least one item, e.g. `fujin add button`.")
  }
  await ensureRegistry(cwd)

  await runShadcn(cwd, [
    "add",
    ...names.map(qualify),
    ...(options.yes ? ["--yes"] : []),
    ...(options.overwrite ? ["--overwrite"] : []),
    ...(options.dryRun ? ["--dry-run"] : []),
    ...(options.path ? ["--path", options.path] : []),
  ])
}

/* -------------------------------------------------------------------------- */
/* list / info                                                                */
/* -------------------------------------------------------------------------- */

type CatalogEntry = {
  name: string
  type: string
  summary?: string
  categories?: string[]
  status?: string
}

export async function list(options: {
  type?: string
  category?: string
  json: boolean
}) {
  const { items } = await fetchJson<{ items: CatalogEntry[] }>("mcp/index.json")
  const filtered = items.filter(
    (item) =>
      (!options.type || item.type === options.type) &&
      (!options.category || item.categories?.includes(options.category))
  )

  if (options.json) {
    console.log(JSON.stringify(filtered, null, 2))
    return
  }
  if (filtered.length === 0) {
    logger.info("No matching items.")
    return
  }

  const width = Math.max(...filtered.map((item) => item.name.length))
  for (const item of filtered) {
    const status = item.status ? pc.yellow(` [${item.status}]`) : ""
    logger.info(
      `${pc.bold(item.name.padEnd(width))}  ${pc.dim(item.type.padEnd(9))} ${item.summary ?? ""}${status}`
    )
  }
}

type ItemDoc = {
  name: string
  type: string
  summary?: string
  install: string
  whenToUse: string[]
  whenNotToUse: string[]
  props: {
    name: string
    type: string
    default?: string
    description: string
    owner?: string
  }[]
  pitfalls: string[]
  examples: { title: string; code: string }[]
  related: string[]
}

export async function info(name: string, options: { json: boolean }) {
  const key = name.replace(/^@fujin\//, "")
  const doc = await fetchJson<ItemDoc>(`mcp/${encodeURIComponent(key)}.json`)

  if (options.json) {
    console.log(JSON.stringify(doc, null, 2))
    return
  }

  const section = (title: string, lines: string[]) => {
    if (lines.length === 0) return
    logger.info(`\n${pc.bold(title)}`)
    for (const line of lines) logger.info(`  - ${line}`)
  }

  logger.info(`${pc.bold(doc.name)} ${pc.dim(`(${doc.type})`)}`)
  if (doc.summary) logger.info(doc.summary)
  logger.info(pc.dim(`\n  ${doc.install}`))
  section("Use when", doc.whenToUse)
  section("Do not use when", doc.whenNotToUse)
  section(
    "Props",
    doc.props.map(
      (prop) =>
        `${prop.owner ? `${prop.owner}.` : ""}${pc.cyan(prop.name)}: ${prop.type}${prop.default ? pc.dim(` = ${prop.default}`) : ""}`
    )
  )
  section("Pitfalls", doc.pitfalls)
  if (doc.examples[0]) {
    logger.info(`\n${pc.bold(`Example: ${doc.examples[0].title}`)}`)
    logger.info(doc.examples[0].code.replace(/^/gm, "  "))
  }
  if (doc.related.length)
    logger.info(`\n${pc.dim(`Related: ${doc.related.join(", ")}`)}`)
}

/* -------------------------------------------------------------------------- */
/* mcp init                                                                   */
/* -------------------------------------------------------------------------- */

export const MCP_CLIENTS = {
  claude: { file: ".mcp.json", key: "mcpServers" },
  cursor: { file: ".cursor/mcp.json", key: "mcpServers" },
  vscode: { file: ".vscode/mcp.json", key: "servers" },
} as const
export type McpClient = keyof typeof MCP_CLIENTS

export async function mcpInit(cwd: string, client: McpClient) {
  const { file, key } = MCP_CLIENTS[client]
  const target = path.join(cwd, file)

  let config: Record<string, Record<string, unknown>> = {}
  if (existsSync(target)) {
    try {
      config = JSON.parse(await readFile(target, "utf8"))
    } catch {
      throw new CliError(`${file} exists but is not valid JSON.`)
    }
  }

  const server: Record<string, unknown> = {
    command: "npx",
    args: ["-y", "@fujin/mcp@latest"],
  }
  if (REGISTRY_URL !== DEFAULT_REGISTRY_URL) {
    server.env = { FUJIN_REGISTRY_URL: REGISTRY_URL }
  }
  if (client === "vscode") server.type = "stdio"

  config[key] = { ...config[key], fujin: server }

  await mkdir(path.dirname(target), { recursive: true })
  await writeFile(target, `${JSON.stringify(config, null, 2)}\n`, "utf8")
  logger.success(`Wrote the fujin MCP server to ${file}`)
  logger.info(pc.dim("Restart your editor or agent to pick it up."))
}

/* -------------------------------------------------------------------------- */
/* doctor                                                                     */
/* -------------------------------------------------------------------------- */

export async function doctor(cwd: string) {
  const problems: string[] = []
  const ok = (message: string) => logger.success(message)

  const pkg = await readPackageJson(cwd)
  if (!pkg) throw new CliError("No package.json in this directory.")
  const deps = { ...pkg.dependencies, ...pkg.devDependencies }

  const react = majorOf(deps.react)
  if (react === null) problems.push("React is not installed.")
  else if (react < 19)
    problems.push(`React ${react} found; Fujin needs React 19.`)
  else ok(`React ${react}`)

  const tailwind = majorOf(deps.tailwindcss)
  if (tailwind === null) problems.push("Tailwind CSS is not installed.")
  else if (tailwind < 4)
    problems.push(`Tailwind ${tailwind} found; Fujin needs Tailwind v4.`)
  else ok(`Tailwind CSS ${tailwind}`)

  const config = await readComponentsJson(cwd)
  if (!config) {
    problems.push("No components.json. Run `npx @fujin/cli init`.")
  } else {
    ok("components.json")
    const registry = config.registries?.["@fujin"]
    if (!registry)
      problems.push(
        "The @fujin registry is not configured. Run `npx @fujin/cli init`."
      )
    else
      ok(`@fujin -> ${typeof registry === "string" ? registry : registry.url}`)
  }

  if (!deps["@base-ui/react"]) {
    logger.warn(
      "@base-ui/react is not installed yet (it is added with the first component)."
    )
  }

  const [runner, prefix] = runnerFor(detectPackageManager(cwd))
  logger.info(pc.dim(`Package runner: ${[runner, ...prefix].join(" ")}`))

  if (problems.length) {
    for (const problem of problems) logger.error(problem)
    process.exitCode = 1
  } else {
    logger.success("No problems found.")
  }
}
