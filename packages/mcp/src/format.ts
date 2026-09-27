import type { CatalogEntry, ItemDoc } from "./registry"

/*
 * Responses are compact markdown rather than JSON: models read it just as
 * well, and it costs noticeably fewer tokens than quoted keys and braces.
 */

export function formatCatalog(items: CatalogEntry[]) {
  if (items.length === 0) return "No matching items."
  return items
    .map((item) => {
      const tags = [
        item.type,
        item.status && item.status !== "stable" ? item.status : null,
        item.frameworks?.length === 1 ? `${item.frameworks[0]} only` : null,
      ]
        .filter(Boolean)
        .join(", ")
      return `- ${item.name} (${tags}): ${item.summary ?? ""}`
    })
    .join("\n")
}

const list = (title: string, items: string[]) =>
  items.length
    ? `## ${title}\n${items.map((item) => `- ${item}`).join("\n")}`
    : ""

export type DocSection =
  "usage" | "props" | "examples" | "pitfalls" | "a11y" | "files"

export const ALL_SECTIONS: DocSection[] = [
  "usage",
  "props",
  "examples",
  "pitfalls",
  "a11y",
  "files",
]

export function formatDoc(doc: ItemDoc, sections: DocSection[] = ALL_SECTIONS) {
  const want = new Set(sections)
  const parts: string[] = [
    `# ${doc.name} (${doc.type}${doc.status !== "stable" ? `, ${doc.status}` : ""})`,
    doc.summary ?? doc.description ?? "",
    `Install: \`${doc.install}\``,
  ]

  if (doc.frameworks.length === 1) {
    parts.push(`Framework: ${doc.frameworks[0]} only.`)
  }

  if (want.has("usage")) {
    parts.push(list("Use when", doc.whenToUse))
    parts.push(list("Do not use when", doc.whenNotToUse))
    if (doc.anatomy) parts.push(`## Anatomy\n\`\`\`tsx\n${doc.anatomy}\n\`\`\``)
  }

  if (want.has("props") && doc.props.length) {
    const rows = doc.props.map((prop) => {
      const name = prop.owner ? `${prop.owner}.${prop.name}` : prop.name
      const meta = [
        prop.required ? "required" : null,
        prop.default ? `default ${prop.default}` : null,
      ]
        .filter(Boolean)
        .join(", ")
      return `- ${name}: \`${prop.type}\`${meta ? ` (${meta})` : ""} - ${prop.description}`
    })
    parts.push(`## Props\n${rows.join("\n")}`)
  }

  if (want.has("examples") && doc.examples.length) {
    parts.push(
      `## Examples\n${doc.examples
        .map(
          (example) =>
            `### ${example.title}\n${example.description ? `${example.description}\n` : ""}\`\`\`tsx\n${example.code}\n\`\`\``
        )
        .join("\n")}`
    )
  }

  if (want.has("pitfalls")) parts.push(list("Pitfalls", doc.pitfalls))
  if (want.has("a11y")) parts.push(list("Accessibility", doc.a11y))

  if (want.has("files")) {
    parts.push(
      list(
        "Files",
        doc.files.map(
          (file) =>
            `${file.path} (${file.type})${file.target ? ` -> ${file.target}` : ""}`
        )
      )
    )
    if (doc.editing) {
      parts.push(
        list("Safe to restyle", doc.editing.ui),
        list("Behaviour (edit with care)", doc.editing.logic)
      )
    }
    if (doc.dependencies.length)
      parts.push(`npm: ${doc.dependencies.join(", ")}`)
    if (doc.registryDependencies.length) {
      parts.push(`Registry deps: ${doc.registryDependencies.join(", ")}`)
    }
  }

  if (doc.related.length) parts.push(`Related: ${doc.related.join(", ")}`)
  if (doc.tokens.length && want.has("usage")) {
    parts.push(`CSS tokens: ${doc.tokens.join(", ")}`)
  }

  return parts.filter(Boolean).join("\n\n")
}
