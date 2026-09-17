import { z } from "zod"

/**
 * Structured, agent-facing metadata attached to every Fujin registry item.
 *
 * This is the whole point of the `meta.fujin` block: an agent should be able to
 * use a component correctly after reading a few hundred tokens of *this*,
 * instead of several thousand tokens of source. Everything here is written for
 * a reader that cannot see the rendered component.
 *
 * Authored alongside the item definition and emitted verbatim into
 * `public/r/{name}.json` (and, compacted, into `public/r/mcp/*`).
 */

export const propSchema = z.object({
  name: z.string(),
  type: z.string(),
  default: z.string().optional(),
  required: z.boolean().optional(),
  description: z.string(),
  /** Which sub-component this prop belongs to, e.g. `DataTableToolbar`. */
  owner: z.string().optional(),
})

export const exampleSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  /** Runnable TSX. Keep it minimal and copy-pasteable. */
  code: z.string(),
})

export const fujinMetaSchema = z.object({
  /** One sentence. Shown in list results, so it must stand alone. */
  summary: z.string(),

  /** Concrete situations this item is the right answer for. */
  whenToUse: z.array(z.string()).default([]),

  /**
   * Situations where an agent should reach for something else, and what.
   * This is the single highest-value field: it prevents wrong-component picks.
   */
  whenNotToUse: z.array(z.string()).default([]),

  /** JSX skeleton showing how the parts nest. */
  anatomy: z.string().optional(),

  props: z.array(propSchema).default([]),

  examples: z.array(exampleSchema).default([]),

  /** Non-obvious behaviour that causes bugs if unknown. */
  pitfalls: z.array(z.string()).default([]),

  /** Accessibility contract: what is handled, what the consumer must supply. */
  a11y: z.array(z.string()).default([]),

  /** CSS custom properties the item reads, so theming is discoverable. */
  tokens: z.array(z.string()).default([]),

  /** Other registry item names worth knowing about. */
  related: z.array(z.string()).default([]),

  /** Which files a consumer is expected to edit vs leave alone. */
  editing: z
    .object({
      /** Presentational files - safe and expected to customise. */
      ui: z.array(z.string()).default([]),
      /** Behavioural files - editing these changes semantics. */
      logic: z.array(z.string()).default([]),
    })
    .optional(),

  status: z.enum(["stable", "beta", "experimental"]).default("stable"),

  /** Framework constraints, when an item is not universal. */
  frameworks: z.array(z.enum(["react", "next"])).default(["react", "next"]),
})

export type FujinProp = z.infer<typeof propSchema>
export type FujinExample = z.infer<typeof exampleSchema>
export type FujinMeta = z.infer<typeof fujinMetaSchema>
export type FujinMetaInput = z.input<typeof fujinMetaSchema>
