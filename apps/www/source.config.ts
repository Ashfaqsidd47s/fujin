import {
  defineConfig,
  defineDocs,
  frontmatterSchema,
} from "fumadocs-mdx/config"
import { remarkInstall } from "fumadocs-docgen"
import rehypePrettyCode from "rehype-pretty-code"
import { z } from "zod"

export const docs = defineDocs({
  dir: "content/docs",
  docs: {
    schema: frontmatterSchema.extend({
      /** Registry item this page documents. Powers <ComponentPreview /> and the install snippet. */
      component: z.string().optional(),
      /** Links surfaced under the page title. */
      links: z
        .object({
          doc: z.string().optional(),
          api: z.string().optional(),
          source: z.string().optional(),
        })
        .optional(),
      /** Shown as a "New"/"Updated" badge in the sidebar. */
      status: z.enum(["new", "updated", "beta", "deprecated"]).optional(),
    }),
  },
})

export default defineConfig({
  mdxOptions: {
    remarkPlugins: (plugins) => [
      [remarkInstall, { persist: { id: "package-manager" } }],
      ...plugins,
    ],
    // Swap fumadocs' default highlighter for rehype-pretty-code: it keeps the
    // raw source on the node, which the copy button and LLM routes rely on.
    rehypePlugins: (plugins) => [
      [
        rehypePrettyCode,
        {
          theme: { dark: "vesper", light: "github-light-default" },
          keepBackground: false,
        },
      ],
      ...plugins.slice(1),
    ],
  },
})
