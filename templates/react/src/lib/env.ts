import { z } from "zod"

/**
 * Validated client environment. Vite only exposes `VITE_*` variables, and
 * everything here ends up in the bundle - never put secrets in it.
 */
const schema = z.object({
  VITE_API_URL: z.url().default("http://localhost:8787"),
})

const parsed = schema.safeParse(import.meta.env)

if (!parsed.success) {
  console.error(
    "Invalid environment variables:",
    z.flattenError(parsed.error).fieldErrors
  )
  throw new Error("Invalid environment variables")
}

export const env = parsed.data
