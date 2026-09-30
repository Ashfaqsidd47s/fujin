"use client"

import * as React from "react"
import { Slider as SliderPrimitive } from "@base-ui/react/slider"

import { cn } from "@/registry/fujin/lib/utils"

/*
 * One thumb is rendered per value: `defaultValue={50}` gives a single
 * thumb, `defaultValue={[20, 80]}` gives a range. Clicking anywhere on the
 * track moves the nearest thumb there, and every thumb is keyboard
 * operable (arrows, Page Up/Down, Home/End), so dragging is never the only
 * way to set a value (WCAG 2.5.7).
 *
 * Each thumb is a native range input and needs an accessible name:
 * - single thumb inside a `<Field>`: `FieldLabel` names it automatically;
 * - single thumb elsewhere: pass `aria-label` (forwarded to the thumb);
 * - range: pass `getAriaLabel={(i) => ["Minimum price", "Maximum price"][i]}`
 *   so the two thumbs are distinguishable.
 */

type SliderProps<Value extends number | readonly number[] = number | number[]> =
  SliderPrimitive.Root.Props<Value> & {
    /** Accessible name for each thumb, by index. Takes precedence over `aria-label`. */
    getAriaLabel?: (index: number) => string
    /** Formats the announced value per thumb, e.g. `(formatted) => \`${formatted} per night\``. */
    getAriaValueText?: (
      formattedValue: string,
      value: number,
      index: number
    ) => string
  }

function Slider<Value extends number | readonly number[] = number | number[]>({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  orientation = "horizontal",
  getAriaLabel,
  getAriaValueText,
  "aria-label": ariaLabel,
  ...props
}: SliderProps<Value>) {
  // How many thumbs to render. Falls back to one thumb at `min`.
  const thumbCount = React.useMemo(() => {
    const current = value ?? defaultValue
    return Array.isArray(current) ? current.length : 1
  }, [value, defaultValue])

  return (
    <SliderPrimitive.Root
      data-slot="slider"
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      orientation={orientation}
      className={cn(
        "relative w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-40 data-[orientation=vertical]:w-auto",
        className
      )}
      {...props}
    >
      <SliderPrimitive.Control
        data-slot="slider-control"
        className={cn(
          // The control, not the 6px track, receives presses: it is 24px
          // tall so the whole strip is an easy target.
          "flex w-full touch-none items-center select-none data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50",
          "data-[orientation=horizontal]:h-6",
          "data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-40 data-[orientation=vertical]:w-6 data-[orientation=vertical]:flex-col"
        )}
      >
        <SliderPrimitive.Track
          data-slot="slider-track"
          className="relative grow overflow-visible rounded-full bg-muted select-none data-[orientation=horizontal]:h-1.5 data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-1.5"
        >
          <SliderPrimitive.Indicator
            data-slot="slider-range"
            className="rounded-full bg-primary select-none"
          />
          {Array.from({ length: thumbCount }, (_, index) => (
            <SliderPrimitive.Thumb
              data-slot="slider-thumb"
              key={index}
              index={index}
              getAriaLabel={getAriaLabel}
              getAriaValueText={getAriaValueText}
              aria-label={getAriaLabel ? undefined : ariaLabel}
              className={cn(
                // 16px visual, 24px hit area via ::after (WCAG 2.5.8).
                "block size-4 shrink-0 rounded-full border border-primary bg-background shadow-sm transition-[color,box-shadow] select-none after:absolute after:-inset-1 after:rounded-full",
                // The focusable element is the nested <input>, so style on :has.
                "has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-background",
                "data-[disabled]:pointer-events-none data-[dragging]:cursor-grabbing"
              )}
            />
          ))}
        </SliderPrimitive.Track>
      </SliderPrimitive.Control>
    </SliderPrimitive.Root>
  )
}

export { Slider, type SliderProps }
