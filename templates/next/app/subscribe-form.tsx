"use client"

import * as React from "react"

import { subscribe, type SubscribeState } from "@/app/actions"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

const initialState: SubscribeState = { status: "idle" }

export function SubscribeForm() {
  const [state, action, pending] = React.useActionState(subscribe, initialState)
  const emailErrors = state.errors?.email

  return (
    <form action={action} noValidate>
      <FieldGroup>
        <Field name="email" invalid={Boolean(emailErrors?.length)}>
          <FieldLabel required>Email</FieldLabel>
          <Input
            type="email"
            required
            autoComplete="email"
            defaultValue={state.values?.email}
            placeholder="you@company.com"
          />
          <FieldDescription>Validated by a server action.</FieldDescription>
          <FieldError errors={emailErrors} />
        </Field>
        <Button type="submit" loading={pending} loadingText="Subscribing...">
          Subscribe
        </Button>
        {state.status === "success" ? (
          <p role="status" className="text-sm text-success">
            {state.message}
          </p>
        ) : null}
      </FieldGroup>
    </form>
  )
}
