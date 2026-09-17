/**
 * End-to-end check: spawns the built server over stdio, as an editor would,
 * and calls every tool.
 *
 *   FUJIN_REGISTRY_URL=http://localhost:4100/r pnpm --filter @fujin/mcp smoke
 */
import path from "node:path"
import { fileURLToPath } from "node:url"

import { Client } from "@modelcontextprotocol/sdk/client/index.js"
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")

const transport = new StdioClientTransport({
  command: process.execPath,
  args: [path.join(root, "dist", "bin.mjs")],
  env: {
    ...(process.env as Record<string, string>),
    FUJIN_REGISTRY_URL:
      process.env.FUJIN_REGISTRY_URL ??
      path.resolve(root, "../../apps/www/public/r"),
  },
})

const client = new Client({ name: "fujin-smoke", version: "0.0.0" })
await client.connect(transport)

let failed = false

async function call(name: string, args: Record<string, unknown>) {
  const result = await client.callTool({ name, arguments: args })
  const body = (result.content as { type: string; text: string }[])
    .map((part) => part.text)
    .join("\n")
  const tokens = Math.ceil(body.length / 4)
  console.log(
    `\n=== ${name} ${JSON.stringify(args)}  (~${tokens} tokens)${result.isError ? "  [error]" : ""}`
  )
  console.log(body.length > 900 ? `${body.slice(0, 900)}\n...` : body)
  return result
}

const tools = await client.listTools()
console.log("tools:", tools.tools.map((tool) => tool.name).join(", "))

await call("list_items", {})
await call("search_items", { query: "form error label" })
await call("get_item", {
  name: "@fujin/field",
  sections: ["usage", "pitfalls"],
})
await call("get_item", { name: "button" })
await call("get_item_source", { name: "spinner" })
await call("get_install_command", {
  names: ["button", "field"],
  packageManager: "pnpm",
})

const missing = await call("get_item", { name: "buton" })
if (!missing.isError) failed = true

const resources = await client.listResources()
console.log(
  "\nresources:",
  resources.resources.map((resource) => resource.uri).join(", ")
)

await client.close()
if (failed) {
  console.error("\nsmoke test failed")
  process.exit(1)
}
