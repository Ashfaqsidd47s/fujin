import * as React from "react"
import { useMutation } from "@tanstack/react-query"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

const subscribeSchema = z.object({
  email: z.email("Enter a valid email address."),
})

// Stand-in for `api("/subscribe", { method: "POST", body })`.
async function subscribe(input: z.infer<typeof subscribeSchema>) {
  await new Promise((resolve) => setTimeout(resolve, 600))
  return { email: input.email }
}

export function App() {
  const [errors, setErrors] = React.useState<{ email?: string[] }>({})
  const mutation = useMutation({ mutationFn: subscribe })

  return (
    <main className="mx-auto flex min-h-svh max-w-md flex-col justify-center gap-8 p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">Project ready</h1>
        <p className="text-sm text-muted-foreground">
          Add components with <code className="font-mono">npx fujin add</code>.
          Press <kbd className="font-mono">d</kbd> to toggle dark mode.
        </p>
      </div>

      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault()
          const parsed = subscribeSchema.safeParse(
            Object.fromEntries(new FormData(event.currentTarget))
          )
          if (!parsed.success) {
            setErrors(z.flattenError(parsed.error).fieldErrors)
            return
          }
          setErrors({})
          mutation.mutate(parsed.data)
        }}
      >
        <FieldGroup>
          <Field name="email" invalid={Boolean(errors.email?.length)}>
            <FieldLabel required>Email</FieldLabel>
            <Input
              type="email"
              required
              autoComplete="email"
              placeholder="you@company.com"
            />
            <FieldDescription>
              Validated with zod on the client.
            </FieldDescription>
            <FieldError errors={errors.email} />
          </Field>
          <Button
            type="submit"
            loading={mutation.isPending}
            loadingText="Subscribing..."
          >
            Subscribe
          </Button>
          {mutation.isSuccess ? (
            <p role="status" className="text-sm text-success">
              Subscribed {mutation.data.email}.
            </p>
          ) : null}
        </FieldGroup>
      </form>
    </main>
  )
}
