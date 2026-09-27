import { readFile } from "node:fs/promises"
import path from "node:path"
import { notFound } from "next/navigation"

import { source } from "@/lib/source"

export const dynamic = "force-static"

/**
 * Raw markdown for every docs page (`/docs/button.md` rewrites here).
 * Agents get the content without navigation chrome or HTML.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug?: string[] }> }
) {
  const { slug } = await params
  const page = source.getPage(slug)
  if (!page) notFound()

  const raw = await readFile(
    path.join(
      /*turbopackIgnore: true*/ process.cwd(),
      "content/docs",
      page.path
    ),
    "utf8"
  )
  const body = raw.replace(/^---[\s\S]*?---\s*/, "")
  const markdown = `# ${page.data.title}\n\n${page.data.description ?? ""}\n\n${body}`

  return new Response(markdown, {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  })
}

// Every docs page is known at build time; anything else is a 404.
export const dynamicParams = false

export function generateStaticParams() {
  return source.generateParams()
}
