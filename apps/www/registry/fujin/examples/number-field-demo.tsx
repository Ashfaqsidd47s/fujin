"use client"

import * as React from "react"

import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/registry/fujin/ui/field"
import { NumberField } from "@/registry/fujin/ui/number-field"

export default function NumberFieldDemo() {
  const [price, setPrice] = React.useState<number | null>(24.5)

  return (
    <FieldGroup className="max-w-xs">
      <Field name="quantity">
        <FieldLabel>Quantity</FieldLabel>
        <NumberField defaultValue={1} min={1} max={99} />
        <FieldDescription>Between 1 and 99.</FieldDescription>
      </Field>
      <Field name="price">
        <FieldLabel>Unit price</FieldLabel>
        <NumberField
          value={price}
          onValueChange={setPrice}
          min={0}
          step={0.5}
          format={{ style: "currency", currency: "USD" }}
        />
        <FieldDescription>
          Stored as {price === null ? "empty" : price}.
        </FieldDescription>
      </Field>
      <Field name="discount">
        <FieldLabel>Discount</FieldLabel>
        <NumberField
          defaultValue={0.1}
          min={0}
          max={1}
          step={0.05}
          format={{ style: "percent" }}
        />
        <FieldDescription>
          Percent values are fractions: 10% is 0.1.
        </FieldDescription>
      </Field>
    </FieldGroup>
  )
}
