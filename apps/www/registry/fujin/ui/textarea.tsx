"use client"

import * as React from "react"
import { Field as FieldPrimitive } from "@base-ui/react/field"

import { cn } from "@/registry/fujin/lib/utils"

type TextareaProps = React.ComponentProps<"textarea"> & {
  /** Called with the string value. `onChange` also works. */
  onValueChange?: FieldPrimitive.Control.Props["onValueChange"]
}

/**
 * Rendered through Base UI's Field.Control, so inside a <Field> it is
 * labelled, described, validated and marked invalid like `Input`.
 *
 * Grows with its content (`field-sizing: content`) from `min-h-16`. Cap it
 * with a `max-h-*` class, or pass `field-sizing-fixed` to size with `rows`.
 * Browsers without `field-sizing` fall back to `rows`.
 */
function Textarea({ className, ...props }: TextareaProps) {
  return (
    <FieldPrimitive.Control
      data-slot="textarea"
      render={<textarea />}
      className={cn(
        "flex field-sizing-content min-h-16 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none selection:bg-primary selection:text-primary-foreground placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30",
        // Solid ring: meets the 3:1 non-text contrast requirement (WCAG 1.4.11).
        "focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring",
        "aria-invalid:border-destructive aria-invalid:focus-visible:ring-destructive data-[invalid]:border-destructive",
        className
      )}
      // Field.Control is typed for <input>; every textarea attribute is
      // forwarded unchanged to the rendered <textarea>.
      {...(props as FieldPrimitive.Control.Props)}
    />
  )
}

export { Textarea, type TextareaProps }
