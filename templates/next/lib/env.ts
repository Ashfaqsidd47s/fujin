import { z } from "zod"

/**
 * Validated environment. Import `env` instead of reading `process.env`, so a
 * missing or malformed variable fails at startup rather than mid-request.
 * Only `NEXT_PUBLIC_*` values are available in client components.
 */
const schema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  NEXT_PUBLIC_APP_URL: z.url().default("http://localhost:3000"),
})

const parsed = schema.safeParse({
  NODE_ENV: process.env.NODE_ENV,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
})

if (!parsed.success) {
  console.error(
    "Invalid environment variables:",
    z.flattenError(parsed.error).fieldErrors
  )
  throw new Error("Invalid environment variables")
}

export const env = parsed.data
