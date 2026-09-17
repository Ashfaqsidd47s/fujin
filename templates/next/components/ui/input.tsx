"use client"

import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

type InputProps = InputPrimitive.Props

/**
 * Inside a <Field>, the input is automatically labelled, described and marked
 * invalid - no `id`/`htmlFor`/`aria-describedby` plumbing required.
 */
function Input({ className, type = "text", ...props }: InputProps) {
  return (
    <InputPrimitive
      data-slot="input"
      type={type}
      className={cn(
        "flex h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none selection:bg-primary selection:text-primary-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30",
        // Solid ring: meets the 3:1 non-text contrast requirement (WCAG 1.4.11).
        "focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring",
        "aria-invalid:border-destructive aria-invalid:focus-visible:ring-destructive data-[invalid]:border-destructive",
        className
      )}
      {...props}
    />
  )
}

export { Input, type InputProps }
