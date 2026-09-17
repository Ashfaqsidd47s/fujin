"use server"

import { z } from "zod"

const subscribeSchema = z.object({
  email: z.email("Enter a valid email address."),
})

export type SubscribeState = {
  status: "idle" | "success" | "error"
  errors?: { email?: string[] }
  message?: string
  /**
   * Submitted values, echoed back. React resets a form after its action
   * runs; feeding these into `defaultValue` keeps what the user typed when
   * validation fails (WCAG 3.3.7, Redundant Entry).
   */
  values?: { email?: string }
}

/**
 * Example server action. Validates on the server and returns field errors in
 * a shape `FieldError` accepts directly.
 */
export async function subscribe(
  _previous: SubscribeState,
  formData: FormData
): Promise<SubscribeState> {
  const values = { email: String(formData.get("email") ?? "") }
  const parsed = subscribeSchema.safeParse(values)

  if (!parsed.success) {
    return {
      status: "error",
      errors: z.flattenError(parsed.error).fieldErrors,
      values,
    }
  }

  // Persist parsed.data here.
  return { status: "success", message: `Subscribed ${parsed.data.email}.` }
}
