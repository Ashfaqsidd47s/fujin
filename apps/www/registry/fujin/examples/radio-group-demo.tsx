"use client"

import * as React from "react"

import { Button } from "@/registry/fujin/ui/button"
import { Field, FieldLegend, FieldSet } from "@/registry/fujin/ui/field"
import { RadioGroup, RadioGroupItem } from "@/registry/fujin/ui/radio-group"

const plans = [
  {
    value: "hobby",
    label: "Hobby",
    description: "One project, community support.",
  },
  {
    value: "pro",
    label: "Pro",
    description: "Unlimited projects and email support.",
  },
  {
    value: "team",
    label: "Team",
    description: "Shared billing, roles and SSO.",
  },
]

export default function RadioGroupDemo() {
  const id = React.useId()
  const [submitted, setSubmitted] = React.useState<string>()

  return (
    <form
      className="flex w-full max-w-sm flex-col gap-6"
      onSubmit={(event) => {
        event.preventDefault()
        const plan = new FormData(event.currentTarget).get("plan")
        setSubmitted(typeof plan === "string" ? plan : undefined)
      }}
    >
      <Field name="plan">
        {/* The fieldset *is* the radio group, so the legend names it. */}
        <FieldSet render={<RadioGroup defaultValue="pro" />} className="gap-3">
          <FieldLegend className="text-sm">Plan</FieldLegend>
          {plans.map((plan) => (
            <div key={plan.value} className="flex flex-col gap-1">
              <label className="flex items-center gap-3 text-sm font-medium">
                <RadioGroupItem
                  value={plan.value}
                  aria-describedby={`${id}-${plan.value}`}
                />
                {plan.label}
              </label>
              <p
                id={`${id}-${plan.value}`}
                className="pl-7 text-sm text-muted-foreground"
              >
                {plan.description}
              </p>
            </div>
          ))}
        </FieldSet>
      </Field>
      <div className="flex items-center gap-3">
        <Button type="submit">Continue</Button>
        {submitted ? (
          <p className="text-sm text-muted-foreground" role="status">
            Submitted plan: {submitted}
          </p>
        ) : null}
      </div>
    </form>
  )
}
