"use client"

import * as React from "react"

import { Field, FieldDescription, FieldLabel } from "@/registry/fujin/ui/field"
import { Slider } from "@/registry/fujin/ui/slider"

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
})

export default function SliderDemo() {
  const [price, setPrice] = React.useState<[number, number]>([200, 600])

  return (
    <div className="flex w-full max-w-sm flex-col gap-8">
      <Field name="volume">
        <FieldLabel>Volume</FieldLabel>
        <Slider defaultValue={40} />
      </Field>

      <Field name="price">
        <div className="flex items-center justify-between">
          <FieldLabel>Price per night</FieldLabel>
          <span className="text-sm text-muted-foreground tabular-nums">
            {currency.format(price[0])} - {currency.format(price[1])}
          </span>
        </div>
        <Slider
          value={price}
          // A two-value slider always reports two values.
          onValueChange={(next) => setPrice(next as [number, number])}
          min={0}
          max={1000}
          step={10}
          minStepsBetweenValues={5}
          format={{
            style: "currency",
            currency: "USD",
            maximumFractionDigits: 0,
          }}
          getAriaLabel={(index) =>
            index === 0 ? "Minimum price" : "Maximum price"
          }
        />
        <FieldDescription>
          Click the track or use the arrow keys - no dragging needed.
        </FieldDescription>
      </Field>

      <div className="flex h-40 items-center gap-6">
        <Slider orientation="vertical" defaultValue={70} aria-label="Bass" />
        <Slider orientation="vertical" defaultValue={30} aria-label="Treble" />
      </div>
    </div>
  )
}
