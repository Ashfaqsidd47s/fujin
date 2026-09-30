"use client"

import { NumberField as NumberFieldPrimitive } from "@base-ui/react/number-field"
import { MinusIcon, PlusIcon } from "lucide-react"

import { cn } from "@/registry/fujin/lib/utils"

/*
 * Base UI's NumberField parses and formats with `Intl.NumberFormat`, so
 * `format={{ style: "currency", currency: "EUR" }}` and locale-specific
 * separators work while typing. Arrow keys step, Shift steps by `largeStep`,
 * Alt by `smallStep`; the stepper buttons are skipped by Tab (the keys cover
 * them) and are labelled "Increase"/"Decrease" by Base UI.
 */

type NumberFieldProps = NumberFieldPrimitive.Root.Props

/**
 * Renders `- [input] +` when no children are given. Pass the parts as
 * children to rearrange them or to set input props such as `placeholder`.
 */
function NumberField({ className, children, ...props }: NumberFieldProps) {
  return (
    <NumberFieldPrimitive.Root
      data-slot="number-field"
      className={cn("w-full", className)}
      {...props}
    >
      {children ?? (
        <NumberFieldGroup>
          <NumberFieldDecrement />
          <NumberFieldInput />
          <NumberFieldIncrement />
        </NumberFieldGroup>
      )}
    </NumberFieldPrimitive.Root>
  )
}

function NumberFieldGroup({
  className,
  ...props
}: NumberFieldPrimitive.Group.Props) {
  return (
    <NumberFieldPrimitive.Group
      data-slot="number-field-group"
      className={cn(
        "flex h-9 w-full min-w-0 overflow-hidden rounded-md border border-input bg-transparent shadow-xs transition-[color,box-shadow] dark:bg-input/30",
        // Solid ring: meets the 3:1 non-text contrast requirement (WCAG 1.4.11).
        "has-[input:focus-visible]:border-ring has-[input:focus-visible]:ring-2 has-[input:focus-visible]:ring-ring",
        "has-[input[aria-invalid=true]]:border-destructive data-[invalid]:border-destructive data-[invalid]:has-[input:focus-visible]:ring-destructive",
        "data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50",
        className
      )}
      {...props}
    />
  )
}

function NumberFieldInput({
  className,
  ...props
}: NumberFieldPrimitive.Input.Props) {
  return (
    <NumberFieldPrimitive.Input
      data-slot="number-field-input"
      className={cn(
        "min-w-0 flex-1 bg-transparent px-3 text-center text-base tabular-nums outline-none selection:bg-primary selection:text-primary-foreground placeholder:text-muted-foreground disabled:cursor-not-allowed md:text-sm",
        className
      )}
      {...props}
    />
  )
}

const stepperClassName =
  "flex w-9 shrink-0 cursor-pointer items-center justify-center text-muted-foreground transition-colors outline-none select-none hover:bg-accent hover:text-accent-foreground active:bg-accent data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50 data-[disabled]:hover:bg-transparent data-[readonly]:pointer-events-none [&_svg]:pointer-events-none [&_svg]:size-4"

function NumberFieldDecrement({
  className,
  children,
  ...props
}: NumberFieldPrimitive.Decrement.Props) {
  return (
    <NumberFieldPrimitive.Decrement
      data-slot="number-field-decrement"
      className={cn(stepperClassName, "border-r border-input", className)}
      {...props}
    >
      {children ?? <MinusIcon aria-hidden />}
    </NumberFieldPrimitive.Decrement>
  )
}

function NumberFieldIncrement({
  className,
  children,
  ...props
}: NumberFieldPrimitive.Increment.Props) {
  return (
    <NumberFieldPrimitive.Increment
      data-slot="number-field-increment"
      className={cn(stepperClassName, "border-l border-input", className)}
      {...props}
    >
      {children ?? <PlusIcon aria-hidden />}
    </NumberFieldPrimitive.Increment>
  )
}

export {
  NumberField,
  NumberFieldDecrement,
  NumberFieldGroup,
  NumberFieldIncrement,
  NumberFieldInput,
  type NumberFieldProps,
}
