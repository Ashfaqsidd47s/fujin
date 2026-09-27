import { existsSync } from "node:fs"
import { readFile, writeFile } from "node:fs/promises"
import path from "node:path"

import { execa } from "execa"
import pc from "picocolors"
import { DEFAULT_REGISTRY_URL, REGISTRY_NAMESPACE } from "@fujin/schema"

export const REGISTRY_URL = (
  process.env.FUJIN_REGISTRY_URL ?? DEFAULT_REGISTRY_URL
).replace(/\/+$/, "")

export const NAMESPACE = REGISTRY_NAMESPACE

export const logger = {
  info: (message: string) => console.log(message),
  step: (message: string) => console.log(`${pc.cyan("›")} ${message}`),
  success: (message: string) => console.log(`${pc.green("✔")} ${message}`),
  warn: (message: string) => console.warn(`${pc.yellow("!")} ${message}`),
  error: (message: string) => console.error(`${pc.red("✖")} ${message}`),
}

export class CliError extends Error {}

export type PackageManager = "npm" | "pnpm" | "yarn" | "bun"

export function detectPackageManager(cwd: string): PackageManager {
  const lockfiles: [string, PackageManager][] = [
    ["pnpm-lock.yaml", "pnpm"],
    ["bun.lock", "bun"],
    ["bun.lockb", "bun"],
    ["yarn.lock", "yarn"],
    ["package-lock.json", "npm"],
  ]
  for (const [file, manager] of lockfiles) {
    if (existsSync(path.join(cwd, file))) return manager
  }
  const agent = process.env.npm_config_user_agent ?? ""
  if (agent.startsWith("pnpm")) return "pnpm"
  if (agent.startsWith("yarn")) return "yarn"
  if (agent.startsWith("bun")) return "bun"
  return "npm"
}

/** `npx`-style runner for the given package manager. */
export function runnerFor(manager: PackageManager): [string, string[]] {
  switch (manager) {
    case "pnpm":
      return ["pnpm", ["dlx"]]
    case "yarn":
      return ["yarn", ["dlx"]]
    case "bun":
      return ["bunx", []]
    default:
      return ["npx", ["--yes"]]
  }
}

/** Runs the shadcn CLI, pinned to a known-good major. */
export async function runShadcn(cwd: string, args: string[]) {
  const [command, prefix] = runnerFor(detectPackageManager(cwd))
  await execa(command, [...prefix, "shadcn@^4", ...args], {
    cwd,
    stdio: "inherit",
    env: { FUJIN_REGISTRY_URL: REGISTRY_URL },
  })
}

export type ComponentsJson = {
  registries?: Record<string, string | { url: string }>
  rsc?: boolean
  [key: string]: unknown
}

export function componentsJsonPath(cwd: string) {
  return path.join(cwd, "components.json")
}

export async function readComponentsJson(
  cwd: string
): Promise<ComponentsJson | null> {
  const file = componentsJsonPath(cwd)
  if (!existsSync(file)) return null
  try {
    return JSON.parse(await readFile(file, "utf8")) as ComponentsJson
  } catch {
    throw new CliError(`components.json is not valid JSON: ${file}`)
  }
}

/**
 * Adds (or updates) the `@fujin` registry in components.json, preserving
 * everything else. Returns true if the file changed.
 */
export async function ensureRegistry(cwd: string) {
  const config = await readComponentsJson(cwd)
  if (!config) {
    throw new CliError("No components.json found. Run `npx fujin init` first.")
  }
  const url = `${REGISTRY_URL}/{name}.json`
  const current = config.registries?.[NAMESPACE]
  const currentUrl = typeof current === "string" ? current : current?.url
  if (currentUrl === url) return false

  config.registries = { ...config.registries, [NAMESPACE]: url }
  await writeFile(
    componentsJsonPath(cwd),
    `${JSON.stringify(config, null, 2)}\n`,
    "utf8"
  )
  return true
}

/** `button` -> `@fujin/button`; namespaced names and URLs pass through. */
export function qualify(name: string) {
  if (name.startsWith("@") || /^https?:\/\//.test(name) || name.includes("/")) {
    return name
  }
  return `${NAMESPACE}/${name}`
}

export async function fetchJson<T>(relative: string): Promise<T> {
  let response: Response
  try {
    response = await fetch(`${REGISTRY_URL}/${relative}`)
  } catch {
    throw new CliError(
      `Could not reach the registry at ${REGISTRY_URL}. Check your connection or FUJIN_REGISTRY_URL.`
    )
  }
  if (response.status === 404) throw new CliError(`Not found: ${relative}`)
  if (!response.ok) {
    throw new CliError(
      `Registry request failed (${response.status}): ${REGISTRY_URL}/${relative}`
    )
  }
  return (await response.json()) as T
}

export async function readPackageJson(cwd: string) {
  const file = path.join(cwd, "package.json")
  if (!existsSync(file)) return null
  return JSON.parse(await readFile(file, "utf8")) as {
    name?: string
    dependencies?: Record<string, string>
    devDependencies?: Record<string, string>
  }
}

/** Major version from a semver range such as `^19.2.0` or `~4.3`. */
export function majorOf(range: string | undefined) {
  const match = range?.match(/(\d+)/)
  return match ? Number(match[1]) : null
}
