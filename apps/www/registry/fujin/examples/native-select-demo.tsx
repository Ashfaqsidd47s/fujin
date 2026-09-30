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
import {
  NativeSelect,
  NativeSelectOptGroup,
  NativeSelectOption,
} from "@/registry/fujin/ui/native-select"

export default function NativeSelectDemo() {
  const [error, setError] = React.useState<string>()
  const [saved, setSaved] = React.useState<string>()

  return (
    <form
      noValidate
      className="w-full max-w-sm"
      onSubmit={(event) => {
        event.preventDefault()
        const timezone = new FormData(event.currentTarget).get("timezone")
        if (!timezone) {
          setError("Choose a time zone.")
          setSaved(undefined)
          return
        }
        setSaved(String(timezone))
      }}
    >
      <FieldGroup>
        <Field name="timezone" invalid={Boolean(error)}>
          <FieldLabel required>Time zone</FieldLabel>
          <NativeSelect
            required
            defaultValue=""
            onValueChange={() => setError(undefined)}
          >
            <NativeSelectOption value="" disabled>
              Select a time zone
            </NativeSelectOption>
            <NativeSelectOptGroup label="Europe">
              <NativeSelectOption value="Europe/London">
                London
              </NativeSelectOption>
              <NativeSelectOption value="Europe/Berlin">
                Berlin
              </NativeSelectOption>
            </NativeSelectOptGroup>
            <NativeSelectOptGroup label="Americas">
              <NativeSelectOption value="America/New_York">
                New York
              </NativeSelectOption>
              <NativeSelectOption value="America/Los_Angeles">
                Los Angeles
              </NativeSelectOption>
            </NativeSelectOptGroup>
          </NativeSelect>
          <FieldDescription>
            {saved ? `Saved: ${saved}` : "Used for invoice due dates."}
          </FieldDescription>
          <FieldError errors={[error]} />
        </Field>
        <Button type="submit">Save</Button>
      </FieldGroup>
    </form>
  )
}
