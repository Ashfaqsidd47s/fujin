import { z } from "zod"

import { fujinMetaSchema } from "./mcp"

/**
 * A typed mirror of the shadcn registry schema
 * (https://ui.shadcn.com/schema/registry-item.json), narrowed to what Fujin
 * actually uses and widened with `meta.fujin`.
 *
 * Staying schema-compatible is deliberate: `npx shadcn@latest add @fujin/...`
 * must work for people who never install the Fujin CLI.
 */

export const registryItemTypeSchema = z.enum([
  "registry:lib",
  "registry:block",
  "registry:component",
  "registry:ui",
  "registry:hook",
  "registry:page",
  "registry:file",
  "registry:theme",
  "registry:style",
  "registry:item",
  "registry:base",
  "registry:font",
  // Internal to this repo; never published as an installable item.
  "registry:example",
  "registry:internal",
])

export type RegistryItemType = z.infer<typeof registryItemTypeSchema>

export const registryItemFileSchema = z.object({
  path: z.string(),
  type: registryItemTypeSchema,
  /**
   * Destination in the consumer's project. Required for `registry:file` and
   * `registry:page`. Supports the placeholders `@ui/`, `@lib/`, `@hooks/` and
   * `@components/`, which resolve against the consumer's `components.json`.
   */
  target: z.string().optional(),
  content: z.string().optional(),
})

export const registryItemCssVarsSchema = z.object({
  theme: z.record(z.string(), z.string()).optional(),
  light: z.record(z.string(), z.string()).optional(),
  dark: z.record(z.string(), z.string()).optional(),
})

export const registryItemMetaSchema = z
  .object({
    fujin: fujinMetaSchema.optional(),
    links: z
      .object({
        doc: z.string().optional(),
        api: z.string().optional(),
        source: z.string().optional(),
      })
      .optional(),
  })
  .loose()

export const registryItemSchema = z.object({
  $schema: z.string().optional(),
  name: z.string(),
  type: registryItemTypeSchema,
  title: z.string().optional(),
  description: z.string().optional(),
  author: z.string().optional(),
  dependencies: z.array(z.string()).optional(),
  devDependencies: z.array(z.string()).optional(),
  registryDependencies: z.array(z.string()).optional(),
  files: z.array(registryItemFileSchema).optional(),
  cssVars: registryItemCssVarsSchema.optional(),
  css: z.record(z.string(), z.any()).optional(),
  envVars: z.record(z.string(), z.string()).optional(),
  meta: registryItemMetaSchema.optional(),
  docs: z.string().optional(),
  categories: z.array(z.string()).optional(),
  extends: z.string().optional(),
})

export const registrySchema = z.object({
  $schema: z.string().optional(),
  name: z.string(),
  homepage: z.string(),
  items: z.array(registryItemSchema),
})

export type RegistryItemFile = z.infer<typeof registryItemFileSchema>
export type RegistryItem = z.infer<typeof registryItemSchema>
export type Registry = z.infer<typeof registrySchema>

/** Item types a consumer can install, in the order we show them. */
export const INSTALLABLE_TYPES = [
  "registry:ui",
  "registry:component",
  "registry:block",
  "registry:item",
  "registry:hook",
  "registry:lib",
  "registry:base",
] as const satisfies readonly RegistryItemType[]

export const CATEGORIES = [
  "primitives",
  "forms",
  "data",
  "navigation",
  "feedback",
  "overlays",
  "layout",
  "charts",
  "auth",
  "billing",
  "recipes",
] as const

export type Category = (typeof CATEGORIES)[number]

/** Authoring type: what you write in `_registry.ts` (defaults not yet applied). */
export type RegistryItemInput = z.input<typeof registryItemSchema>
export type RegistryInput = z.input<typeof registrySchema>
