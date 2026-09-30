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

type Company = { value: string; label: string }

const initialCompanies: Company[] = [
  { value: "acme", label: "Acme Corp" },
  { value: "globex", label: "Globex" },
  { value: "initech", label: "Initech" },
  { value: "umbrella", label: "Umbrella" },
]

export default function ComboboxCreatableSingleDemo() {
  const [companies, setCompanies] = React.useState(initialCompanies)
  const [company, setCompany] = React.useState<Company | null>(null)

  return (
    <div className="flex w-full max-w-xs flex-col gap-3">
      <Field name="company">
        <FieldLabel>Company</FieldLabel>
        <Combobox
          items={companies}
          value={company}
          onValueChange={setCompany}
          onCreate={(label) => {
            const created = { value: `new-${companies.length}`, label }
            setCompanies((current) => [...current, created])
            return created
          }}
          formatCreateLabel={(label) => `Add "${label}" as a new company`}
        >
          <ComboboxInput placeholder="Search or add a company..." showClear />
          <ComboboxContent>
            <ComboboxEmpty>No companies found.</ComboboxEmpty>
            <ComboboxList>
              {(item: Company) => (
                <ComboboxItem key={item.value} value={item}>
                  {item.label}
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
        <FieldDescription>Missing? Type the name to add it.</FieldDescription>
      </Field>
      <p className="text-sm text-muted-foreground" role="status">
        Selected: {company ? `${company.label} (${company.value})` : "none"}
      </p>
    </div>
  )
}
