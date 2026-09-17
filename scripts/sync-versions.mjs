/**
 * Runs after `changeset version`: copies the new @fujin/mcp version into
 * packages/mcp/server.json, which the MCP Registry requires to match npm.
 */
import { readFileSync, writeFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const pkgPath = path.join(root, "packages/mcp/package.json")
const serverPath = path.join(root, "packages/mcp/server.json")

const { version, name, mcpName } = JSON.parse(readFileSync(pkgPath, "utf8"))
const server = JSON.parse(readFileSync(serverPath, "utf8"))

server.name = mcpName
server.version = version
for (const entry of server.packages) {
  if (entry.registryType === "npm" && entry.identifier === name) {
    entry.version = version
  }
}

writeFileSync(serverPath, `${JSON.stringify(server, null, 2)}\n`)
console.log(`server.json -> ${name}@${version}`)
