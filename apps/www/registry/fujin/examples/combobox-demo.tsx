"use client"

import * as React from "react"

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/registry/fujin/ui/combobox"
import { Field, FieldDescription, FieldLabel } from "@/registry/fujin/ui/field"

type Framework = { value: string; label: string }

const frameworks: Framework[] = [
  { value: "next", label: "Next.js" },
  { value: "remix", label: "React Router" },
  { value: "astro", label: "Astro" },
  { value: "nuxt", label: "Nuxt" },
  { value: "sveltekit", label: "SvelteKit" },
  { value: "solid-start", label: "SolidStart" },
  { value: "tanstack-start", label: "TanStack Start" },
  { value: "gatsby", label: "Gatsby" },
]

export default function ComboboxDemo() {
  const [value, setValue] = React.useState<Framework | null>(null)

  return (
    <div className="flex w-full max-w-xs flex-col gap-3">
      <Field name="framework">
        <FieldLabel>Framework</FieldLabel>
        <Combobox items={frameworks} value={value} onValueChange={setValue}>
          <ComboboxInput placeholder="Search frameworks..." showClear />
          <ComboboxContent>
            <ComboboxEmpty>No framework found.</ComboboxEmpty>
            <ComboboxList>
              {(framework: Framework) => (
                <ComboboxItem key={framework.value} value={framework}>
                  {framework.label}
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
        <FieldDescription>
          The form submits the value, e.g. &quot;next&quot;.
        </FieldDescription>
      </Field>
      <p className="text-sm text-muted-foreground" role="status">
        Selected: {value ? value.label : "none"}
      </p>
    </div>
  )
}
