import { env } from "@/lib/env"

/**
 * Error thrown for non-2xx responses. `fieldErrors` follows the same
 * `{ field: string[] }` shape `FieldError` accepts, so server validation
 * errors can be shown next to the right input.
 */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly fieldErrors?: Record<string, string[] | undefined>
  ) {
    super(message)
    this.name = "ApiError"
  }
}

type RequestOptions = Omit<RequestInit, "body"> & { body?: unknown }

/** Thin JSON fetch wrapper. Replace the base URL or auth handling as needed. */
export async function api<T>(path: string, options: RequestOptions = {}) {
  const { body, headers, ...init } = options
  const response = await fetch(new URL(path, env.VITE_API_URL), {
    ...init,
    credentials: "include",
    headers: {
      Accept: "application/json",
      ...(body === undefined ? {} : { "Content-Type": "application/json" }),
      ...headers,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  })

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as {
      message?: string
      errors?: Record<string, string[]>
    } | null
    throw new ApiError(
      response.status,
      payload?.message ?? response.statusText,
      payload?.errors
    )
  }

  if (response.status === 204) return undefined as T
  return (await response.json()) as T
}
