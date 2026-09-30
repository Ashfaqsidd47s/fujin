"use client"

import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
} from "@/registry/fujin/ui/combobox"
import { Field, FieldLabel } from "@/registry/fujin/ui/field"

type Label = { value: string; label: string }

const labels: Label[] = [
  { value: "bug", label: "Bug" },
  { value: "feature", label: "Feature" },
  { value: "docs", label: "Documentation" },
  { value: "a11y", label: "Accessibility" },
  { value: "perf", label: "Performance" },
  { value: "security", label: "Security" },
  { value: "design", label: "Design" },
]

export default function ComboboxMultipleDemo() {
  return (
    <Field name="labels" className="max-w-sm">
      <FieldLabel>Labels</FieldLabel>
      <Combobox items={labels} multiple defaultValue={[labels[0], labels[3]]}>
        <ComboboxChips aria-label="Selected labels">
          <ComboboxValue>
            {(selected: Label[]) => (
              <>
                {selected.map((item) => (
                  <ComboboxChip key={item.value}>{item.label}</ComboboxChip>
                ))}
                <ComboboxChipsInput
                  placeholder={selected.length > 0 ? "" : "Add labels..."}
                />
              </>
            )}
          </ComboboxValue>
        </ComboboxChips>
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
    </Field>
  )
}
