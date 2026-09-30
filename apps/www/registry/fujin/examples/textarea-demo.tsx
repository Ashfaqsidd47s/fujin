"use client"

import * as React from "react"

import { Field, FieldDescription, FieldLabel } from "@/registry/fujin/ui/field"
import { Textarea } from "@/registry/fujin/ui/textarea"

const MAX_LENGTH = 280

export default function TextareaDemo() {
  const [note, setNote] = React.useState("")

  return (
    <Field name="note" className="w-full max-w-sm">
      <FieldLabel optional>Note to the courier</FieldLabel>
      <Textarea
        value={note}
        onValueChange={setNote}
        maxLength={MAX_LENGTH}
        placeholder="Gate code, where to leave the parcel..."
        className="max-h-40"
      />
      <FieldDescription>
        Grows as you type. {note.length}/{MAX_LENGTH} characters.
      </FieldDescription>
    </Field>
  )
}
