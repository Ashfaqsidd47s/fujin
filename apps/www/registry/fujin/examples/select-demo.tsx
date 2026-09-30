"use client"

import * as React from "react"

import { Button } from "@/registry/fujin/ui/button"
import { Field, FieldDescription, FieldLabel } from "@/registry/fujin/ui/field"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/registry/fujin/ui/select"

const regions = [
  {
    label: "Americas",
    items: [
      { value: "us-east", label: "US East (Virginia)" },
      { value: "us-west", label: "US West (Oregon)" },
      { value: "sa-east", label: "South America (Sao Paulo)" },
    ],
  },
  {
    label: "Europe",
    items: [
      { value: "eu-west", label: "EU West (Ireland)" },
      { value: "eu-central", label: "EU Central (Frankfurt)" },
    ],
  },
  {
    label: "Asia Pacific",
    items: [
      { value: "ap-south", label: "Asia Pacific (Mumbai)" },
      { value: "ap-northeast", label: "Asia Pacific (Tokyo)" },
    ],
  },
]

// A flat list lets `SelectValue` show the label for the selected value.
const items = regions.flatMap((region) => region.items)

export default function SelectDemo() {
  const [submitted, setSubmitted] = React.useState<string>()

  return (
    <form
      className="flex w-full max-w-sm flex-col gap-6"
      onSubmit={(event) => {
        event.preventDefault()
        const region = new FormData(event.currentTarget).get("region")
        setSubmitted(typeof region === "string" && region ? region : "(none)")
      }}
    >
      <Field name="region">
        {/* A non-<label> label focuses the trigger without opening it. */}
        <FieldLabel>
          Region
        </FieldLabel>
        <Select items={items}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a region" />
          </SelectTrigger>
          <SelectContent>
            {regions.map((region, index) => (
              <React.Fragment key={region.label}>
                {index > 0 ? <SelectSeparator /> : null}
                <SelectGroup>
                  <SelectLabel>{region.label}</SelectLabel>
                  {region.items.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </React.Fragment>
            ))}
          </SelectContent>
        </Select>
        <FieldDescription>Where your data is stored.</FieldDescription>
      </Field>
      <div className="flex items-center gap-3">
        <Button type="submit">Create project</Button>
        {submitted ? (
          <p className="text-sm text-muted-foreground" role="status">
            Submitted region: {submitted}
          </p>
        ) : null}
      </div>
    </form>
  )
}
