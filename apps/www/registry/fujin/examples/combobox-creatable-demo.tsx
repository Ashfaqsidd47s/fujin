"use client"

import * as React from "react"

import {
  Combobox,
  ComboboxChips,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
} from "@/registry/fujin/ui/combobox"
import { Field, FieldDescription, FieldLabel } from "@/registry/fujin/ui/field"

type Tag = { value: string; label: string }

const initialTags: Tag[] = [
  { value: "design", label: "Design" },
  { value: "engineering", label: "Engineering" },
  { value: "marketing", label: "Marketing" },
  { value: "research", label: "Research" },
  { value: "sales", label: "Sales" },
]

/** Stands in for a POST to your API. */
function saveTag(label: string) {
  return new Promise<Tag>((resolve) =>
    setTimeout(
      () =>
        resolve({
          value: label.toLocaleLowerCase().replace(/\s+/g, "-"),
          label,
        }),
      600
    )
  )
}

export default function ComboboxCreatableDemo() {
  const [tags, setTags] = React.useState(initialTags)
  const [selected, setSelected] = React.useState<Tag[]>(initialTags.slice(0, 1))

  return (
    <div className="flex w-full max-w-sm flex-col gap-3">
      <Field name="tags">
        <FieldLabel>Tags</FieldLabel>
        <Combobox
          items={tags}
          multiple
          value={selected}
          onValueChange={setSelected}
          onCreate={async (label) => {
            const tag = await saveTag(label)
            setTags((current) => [...current, tag])
            return tag
          }}
        >
          <ComboboxChips
            aria-label="Selected tags"
            placeholder="Add or create tags..."
            limit={4}
            showClear
          />
          <ComboboxContent>
            <ComboboxEmpty>No tags found.</ComboboxEmpty>
            <ComboboxList>
              {(tag: Tag) => (
                <ComboboxItem key={tag.value} value={tag}>
                  {tag.label}
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
        <FieldDescription>
          Type a tag that doesn&apos;t exist and press Enter to create it.
        </FieldDescription>
      </Field>
      <p className="text-sm text-muted-foreground" role="status">
        {selected.length} selected:{" "}
        {selected.map((tag) => tag.label).join(", ")}
      </p>
    </div>
  )
}
