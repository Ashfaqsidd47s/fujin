"use client"

import { Radio as RadioPrimitive } from "@base-ui/react/radio"
import { RadioGroup as RadioGroupPrimitive } from "@base-ui/react/radio-group"

import { cn } from "@/registry/fujin/lib/utils"

/*
 * Labelling: the group needs a name (a `FieldSet` legend or
 * `aria-labelledby`) and every item needs its own label. Wrap each item in a
 * `<label>` - `RadioGroupItem` renders a `<span>` precisely so an enclosing
 * label works. Don't use `FieldLabel` per item: inside one `Field` it points
 * at the group's control id, not at the individual radio.
 */

type RadioGroupProps<Value = unknown> = RadioGroupPrimitive.Props<Value> & {
  orientation?: "vertical" | "horizontal"
}

function RadioGroup<Value = unknown>({
  className,
  orientation = "vertical",
  ...props
}: RadioGroupProps<Value>) {
  return (
    <RadioGroupPrimitive
      data-slot="radio-group"
      data-orientation={orientation}
      className={cn(
        "flex gap-3",
        orientation === "vertical" ? "flex-col" : "flex-row flex-wrap",
        className
      )}
      {...props}
    />
  )
}

type RadioGroupItemProps = RadioPrimitive.Root.Props

function RadioGroupItem({ className, ...props }: RadioGroupItemProps) {
  return (
    <RadioPrimitive.Root
      data-slot="radio-group-item"
      className={cn(
        // The visual circle is 16px; the ::after pads the hit area to 24px
        // (WCAG 2.5.8) without changing layout.
        "relative flex size-4 shrink-0 cursor-pointer items-center justify-center rounded-full border border-input bg-background text-primary shadow-xs transition-shadow outline-none after:absolute after:-inset-1 after:rounded-full",
        "hover:border-ring",
        "focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring",
        "data-[checked]:border-primary",
        "data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50",
        "aria-invalid:border-destructive data-[invalid]:border-destructive",
        className
      )}
      {...props}
    >
      <RadioPrimitive.Indicator
        data-slot="radio-group-indicator"
        className="size-2 rounded-full bg-current"
      />
    </RadioPrimitive.Root>
  )
}

export {
  RadioGroup,
  RadioGroupItem,
  type RadioGroupProps,
  type RadioGroupItemProps,
}
