import { readFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

import { DEFAULT_REGISTRY_URL } from "@fujin/schema"

export { DEFAULT_REGISTRY_URL }

export type CatalogEntry = {
  name: string
  type: string
  summary?: string
  categories?: string[]
  status?: string
  frameworks?: string[]
}

export type Catalog = { name: string; homepage: string; items: CatalogEntry[] }

type Prop = {
  name: string
  type: string
  default?: string
  required?: boolean
  description: string
  owner?: string
}

export type ItemDoc = {
  name: string
  type: string
  title?: string
  description?: string
  install: string
  summary?: string
  whenToUse: string[]
  whenNotToUse: string[]
  anatomy?: string
  props: Prop[]
  examples: { title: string; description?: string; code: string }[]
  pitfalls: string[]
  a11y: string[]
  tokens: string[]
  related: string[]
  editing?: { ui: string[]; logic: string[] }
  status: string
  frameworks: string[]
  dependencies: string[]
  registryDependencies: string[]
  files: { path: string; type: string; target?: string }[]
  docs?: string
}

export type RegistryItem = {
  name: string
  files?: { path: string; type: string; target?: string; content?: string }[]
}

/**
 * Reads registry artifacts over HTTP, or from disk when the base is a
 * `file://` URL or a path - handy for developing against a local build.
 */
export class RegistryClient {
  readonly baseUrl: string
  private cache = new Map<string, Promise<unknown>>()

  constructor(
    baseUrl = process.env.FUJIN_REGISTRY_URL ?? DEFAULT_REGISTRY_URL
  ) {
    this.baseUrl = baseUrl.replace(/\/+$/, "")
  }

  private load<T>(relative: string): Promise<T> {
    let pending = this.cache.get(relative)
    if (!pending) {
      pending = this.fetchJson(relative)
      // Do not cache failures: a later call may succeed.
      pending.catch(() => this.cache.delete(relative))
      this.cache.set(relative, pending)
    }
    return pending as Promise<T>
  }

  private async fetchJson(relative: string): Promise<unknown> {
    if (/^https?:\/\//.test(this.baseUrl)) {
      const response = await fetch(`${this.baseUrl}/${relative}`)
      if (response.status === 404) throw new NotFoundError(relative)
      if (!response.ok) {
        throw new Error(
          `Registry request failed: ${response.status} ${relative}`
        )
      }
      return response.json()
    }

    const root = this.baseUrl.startsWith("file:")
      ? fileURLToPath(this.baseUrl)
      : this.baseUrl
    try {
      return JSON.parse(await readFile(path.join(root, relative), "utf8"))
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        throw new NotFoundError(relative)
      }
      throw error
    }
  }

  catalog() {
    return this.load<Catalog>("mcp/index.json")
  }

  doc(name: string) {
    return this.load<ItemDoc>(`mcp/${encodeURIComponent(name)}.json`)
  }

  item(name: string) {
    return this.load<RegistryItem>(`${encodeURIComponent(name)}.json`)
  }
}

export class NotFoundError extends Error {
  constructor(resource: string) {
    super(`Not found in registry: ${resource}`)
  }
}

/** Strips an optional `@fujin/` prefix. */
export function normalizeName(name: string) {
  return name.trim().replace(/^@fujin\//, "")
}
