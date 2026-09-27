import {
  McpServer,
  ResourceTemplate,
} from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"

import {
  ALL_SECTIONS,
  formatCatalog,
  formatDoc,
  type DocSection,
} from "./format"
import { normalizeName, NotFoundError, RegistryClient } from "./registry"
import { closestNames, searchCatalog } from "./search"

// Injected from package.json at build time (tsdown.config.ts).
const VERSION = __FUJIN_VERSION__

const text = (value: string) => ({
  content: [{ type: "text" as const, text: value }],
})
const failure = (value: string) => ({ ...text(value), isError: true })

async function suggest(client: RegistryClient, name: string) {
  const { items } = await client.catalog()
  const close = closestNames(items, name)
  return close.length ? ` Did you mean: ${close.join(", ")}?` : ""
}

async function notFoundOr<T>(
  client: RegistryClient,
  name: string,
  run: () => Promise<T>
) {
  try {
    return await run()
  } catch (error) {
    if (error instanceof NotFoundError) {
      return failure(`No item named "${name}".${await suggest(client, name)}`)
    }
    throw error
  }
}

export function createServer(client = new RegistryClient()) {
  const server = new McpServer(
    { name: "fujin", version: VERSION },
    {
      instructions: [
        "Fujin is a registry of production-ready React components (Base UI + Tailwind v4, shadcn-compatible).",
        "Work from cheap to expensive: list_items or search_items first, then get_item for the one you need.",
        "Call get_item_source only when you must read or change the implementation.",
        "Install with the command from get_install_command; never hand-copy files.",
      ].join(" "),
    }
  )

  server.registerTool(
    "list_items",
    {
      title: "List registry items",
      description:
        "Every Fujin item as one line: name, type, one-sentence summary. Optionally filter by type (ui, component, block, item, hook, lib, theme) or category.",
      inputSchema: {
        type: z.string().optional().describe("e.g. ui, component, block, item"),
        category: z.string().optional().describe("e.g. forms, data, auth"),
      },
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async ({ type, category }) => {
      const { items } = await client.catalog()
      const wantedType = type?.replace("registry:", "")
      const filtered = items.filter(
        (item) =>
          (!wantedType || item.type === wantedType) &&
          (!category || item.categories?.includes(category))
      )
      return text(formatCatalog(filtered))
    }
  )

  server.registerTool(
    "search_items",
    {
      title: "Search registry items",
      description:
        "Find items for a need, for example: table with pagination, date range, sign in. Returns ranked one-line results.",
      inputSchema: {
        query: z.string().min(1),
        limit: z.number().int().min(1).max(50).optional(),
      },
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async ({ query, limit }) => {
      const { items } = await client.catalog()
      return text(formatCatalog(searchCatalog(items, query, limit ?? 10)))
    }
  )

  server.registerTool(
    "get_item",
    {
      title: "Get item guidance",
      description:
        "How to use one item correctly: when (not) to use it, anatomy, props, examples, pitfalls, accessibility, files. No source code. Pass `sections` to fetch less.",
      inputSchema: {
        name: z.string().describe("Item name, e.g. field or @fujin/field"),
        sections: z
          .array(z.enum(ALL_SECTIONS as [DocSection, ...DocSection[]]))
          .optional()
          .describe("Subset of: usage, props, examples, pitfalls, a11y, files"),
      },
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async ({ name, sections }) => {
      const key = normalizeName(name)
      return notFoundOr(client, key, async () =>
        text(formatDoc(await client.doc(key), sections))
      )
    }
  )

  server.registerTool(
    "get_item_source",
    {
      title: "Get item source",
      description:
        "The exact files an item installs. Expensive: use only when you need to read or change the implementation.",
      inputSchema: {
        name: z.string(),
        file: z
          .string()
          .optional()
          .describe("Only return files whose path contains this string"),
      },
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async ({ name, file }) => {
      const key = normalizeName(name)
      return notFoundOr(client, key, async () => {
        const item = await client.item(key)
        const files = (item.files ?? []).filter(
          (entry) => !file || entry.path.includes(file)
        )
        if (files.length === 0) return failure(`No matching files in "${key}".`)
        return text(
          files
            .map(
              (entry) =>
                `// ${entry.target ?? entry.path}\n${entry.content ?? "(no content)"}`
            )
            .join("\n\n")
        )
      })
    }
  )

  server.registerTool(
    "get_install_command",
    {
      title: "Get install command",
      description:
        "One shell command that installs the given items, and their registry dependencies, into the current project.",
      inputSchema: {
        names: z.array(z.string()).min(1),
        packageManager: z.enum(["npm", "pnpm", "yarn", "bun"]).optional(),
      },
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async ({ names, packageManager }) => {
      const { items } = await client.catalog()
      const known = new Set(items.map((item) => item.name))
      const keys = names.map(normalizeName)
      const missing = keys.filter((key) => !known.has(key))
      if (missing.length) {
        return failure(`Unknown item(s): ${missing.join(", ")}.`)
      }
      const runner = {
        npm: "npx",
        pnpm: "pnpm dlx",
        yarn: "yarn dlx",
        bun: "bunx --bun",
      }[packageManager ?? "npm"]
      return text(
        [
          `${runner} shadcn@latest add ${keys.map((key) => `@fujin/${key}`).join(" ")}`,
          `Requires "@fujin": "${client.baseUrl}/{name}.json" under "registries" in components.json (\`npx fujin init\` adds it).`,
        ].join("\n")
      )
    }
  )

  server.registerResource(
    "catalog",
    "fujin://catalog",
    {
      title: "Fujin catalog",
      description: "One line per registry item.",
      mimeType: "text/markdown",
    },
    async (uri) => {
      const { items } = await client.catalog()
      return {
        contents: [
          {
            uri: uri.href,
            mimeType: "text/markdown",
            text: formatCatalog(items),
          },
        ],
      }
    }
  )

  server.registerResource(
    "item",
    new ResourceTemplate("fujin://item/{name}", {
      list: async () => {
        const { items } = await client.catalog()
        return {
          resources: items.map((item) => ({
            uri: `fujin://item/${item.name}`,
            name: item.name,
            description: item.summary,
            mimeType: "text/markdown",
          })),
        }
      },
    }),
    {
      title: "Fujin item guidance",
      description: "Usage guidance for one item (same content as get_item).",
      mimeType: "text/markdown",
    },
    async (uri, { name }) => {
      const doc = await client.doc(normalizeName(String(name)))
      return {
        contents: [
          { uri: uri.href, mimeType: "text/markdown", text: formatDoc(doc) },
        ],
      }
    }
  )

  return server
}
