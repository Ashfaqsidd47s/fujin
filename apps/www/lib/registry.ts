import "server-only"

import { readFile } from "node:fs/promises"
import path from "node:path"

import { registry } from "@/registry/registry"

const items = new Map(registry.items.map((item) => [item.name, item]))

export function getRegistryItem(name: string) {
  return items.get(name)
}

/**
 * Reads a registry file from disk. Docs code blocks are always the exact
 * source the registry ships, never a hand-maintained copy.
 */
export async function getRegistryFileSource(name: string, index = 0) {
  const file = items.get(name)?.files?.[index]
  if (!file) return null

  const source = await readFile(
    path.join(/*turbopackIgnore: true*/ process.cwd(), file.path),
    "utf8"
  )

  // Show consumer-facing import paths, as the shadcn CLI will rewrite them.
  return source
    .replaceAll("@/registry/fujin/ui/", "@/components/ui/")
    .replaceAll("@/registry/fujin/components/", "@/components/")
    .replaceAll("@/registry/fujin/hooks/", "@/hooks/")
    .replaceAll("@/registry/fujin/lib/", "@/lib/")
    .replace(/^export default function (\w+)/m, "export function $1")
}
