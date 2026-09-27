"use client"

import * as React from "react"

import { Button } from "@/registry/fujin/ui/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/registry/fujin/ui/field"
import { Input } from "@/registry/fujin/ui/input"

export default function FieldDemo() {
  const [error, setError] = React.useState<string>()

  return (
    <form
      noValidate
      className="w-full max-w-sm"
      onSubmit={(event) => {
        event.preventDefault()
        const email = new FormData(event.currentTarget).get("email")
        setError(
          typeof email === "string" && email.includes("@")
            ? undefined
            : "Enter a valid email address."
        )
      }}
    >
      <FieldGroup>
        <Field name="email" invalid={Boolean(error)}>
          <FieldLabel required>Email</FieldLabel>
          <Input
            type="email"
            required
            autoComplete="email"
            placeholder="you@company.com"
          />
          <FieldDescription>
            We only use this to send receipts.
          </FieldDescription>
          <FieldError errors={[error]} />
        </Field>
        <Button type="submit">Subscribe</Button>
      </FieldGroup>
    </form>
  )
}
