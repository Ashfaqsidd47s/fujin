"use client"

import * as React from "react"
import { Field as FieldPrimitive } from "@base-ui/react/field"
import { ChevronDownIcon } from "lucide-react"

import { cn } from "@/registry/fujin/lib/utils"

type NativeSelectProps = Omit<React.ComponentProps<"select">, "size"> & {
  size?: "default" | "sm"
  /** Called with the selected option's value. `onChange` also works. */
  onValueChange?: FieldPrimitive.Control.Props["onValueChange"]
}

/**
 * A styled native <select>: the OS picker on mobile, typeahead, form
 * submission and autofill all come for free.
 *
 * Rendered through Base UI's Field.Control, so inside a <Field> it is
 * labelled, described and marked invalid like `Input`.
 *
 * Unlike shadcn/ui, `className` goes on the wrapper, which is full width by
 * default - it is what you size. The <select> always fills it.
 */
function NativeSelect({
  className,
  size = "default",
  ...props
}: NativeSelectProps) {
  return (
    <div
      data-slot="native-select-wrapper"
      className={cn(
        "relative w-full min-w-0 has-[select:disabled]:opacity-50",
        className
      )}
    >
      <FieldPrimitive.Control
        data-slot="native-select"
        data-size={size}
        render={<select />}
        className={cn(
          "w-full min-w-0 cursor-pointer appearance-none rounded-md border border-input bg-transparent py-1 pr-9 pl-3 text-base shadow-xs transition-[color,box-shadow] outline-none disabled:cursor-not-allowed md:text-sm dark:bg-input/30",
          size === "sm" ? "h-8" : "h-9",
          // Solid ring: meets the 3:1 non-text contrast requirement (WCAG 1.4.11).
          "focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring",
          "aria-invalid:border-destructive aria-invalid:focus-visible:ring-destructive data-[invalid]:border-destructive"
        )}
        // Field.Control is typed for <input>; every select attribute and the
        // <option> children are forwarded unchanged to the rendered <select>.
        {...(props as FieldPrimitive.Control.Props)}
      />
      <ChevronDownIcon
        aria-hidden
        data-slot="native-select-icon"
        className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground"
      />
    </div>
  )
}

function NativeSelectOption({
  className,
  ...props
}: React.ComponentProps<"option">) {
  return (
    <option
      data-slot="native-select-option"
      // Only honoured where the platform renders options itself (Windows,
      // Linux); keeps the list readable in dark mode there.
      className={cn("bg-popover text-popover-foreground", className)}
      {...props}
    />
  )
}

function NativeSelectOptGroup({
  className,
  ...props
}: React.ComponentProps<"optgroup">) {
  return (
    <optgroup
      data-slot="native-select-optgroup"
      className={cn("bg-popover text-popover-foreground", className)}
      {...props}
    />
  )
}

export {
  NativeSelect,
  NativeSelectOptGroup,
  NativeSelectOption,
  type NativeSelectProps,
}
