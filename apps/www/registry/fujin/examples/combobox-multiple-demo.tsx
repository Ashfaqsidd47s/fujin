"use client"

import {
  Combobox,
  ComboboxChips,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
} from "@/registry/fujin/ui/combobox"
import { Field, FieldDescription, FieldLabel } from "@/registry/fujin/ui/field"

type Label = { value: string; label: string }

const labels: Label[] = [
  { value: "bug", label: "Bug" },
  { value: "feature", label: "Feature" },
  { value: "docs", label: "Documentation" },
  { value: "a11y", label: "Accessibility" },
  { value: "perf", label: "Performance" },
  { value: "security", label: "Security" },
  { value: "design", label: "Design" },
  { value: "i18n", label: "Internationalization" },
  { value: "dx", label: "Developer experience" },
  { value: "infra", label: "Infrastructure" },
  { value: "mobile", label: "Mobile" },
  { value: "regression", label: "Regression" },
]

export default function ComboboxMultipleDemo() {
  return (
    <Field name="labels" className="max-w-sm">
      <FieldLabel>Labels</FieldLabel>
      <Combobox
        items={labels}
        multiple
        defaultValue={[labels[0], labels[3], labels[4], labels[6], labels[7]]}
      >
        <ComboboxChips
          aria-label="Selected labels"
          placeholder="Add labels..."
          limit={3}
          showClear
        />
        <ComboboxContent>
          <ComboboxEmpty>No labels found.</ComboboxEmpty>
          <ComboboxList>
            {(item: Label) => (
              <ComboboxItem key={item.value} value={item}>
                {item.label}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
      <FieldDescription>
        Shows 3 chips until you focus the field; long selections scroll.
      </FieldDescription>
    </Field>
  )
}
