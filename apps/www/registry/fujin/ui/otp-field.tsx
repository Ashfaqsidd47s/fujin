"use client"

import * as React from "react"
import { OTPField as OTPFieldPrimitive } from "@base-ui/react/otp-field"
import { MinusIcon } from "lucide-react"

import { cn } from "@/registry/fujin/lib/utils"

/*
 * Fujin's equivalent of shadcn/ui's `input-otp`, built on Base UI's OTPField.
 * Every slot is a real <input>, so there is no hidden overlay input: paste
 * of the whole code into any slot, SMS autofill (`autoComplete="one-time-code"`
 * on the first slot), and per-slot focus all work natively. Digits only by
 * default - set `validationType="alphanumeric"` for recovery codes.
 */

type OTPFieldProps = OTPFieldPrimitive.Root.Props

/**
 * Renders `length` slots in one group when no children are given. Pass
 * groups, slots and separators as children for a `123-456` layout.
 */
function OTPField({ className, children, length, ...props }: OTPFieldProps) {
  return (
    <OTPFieldPrimitive.Root
      data-slot="otp-field"
      length={length}
      className={cn(
        "flex items-center gap-2 data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50",
        className
      )}
      {...props}
    >
      {children ?? (
        <OTPFieldGroup>
          {Array.from({ length }, (_, index) => (
            <OTPFieldSlot key={index} />
          ))}
        </OTPFieldGroup>
      )}
    </OTPFieldPrimitive.Root>
  )
}

/** Visually joins adjacent slots. Plain layout - it has no behaviour. */
function OTPFieldGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="otp-field-group"
      className={cn("flex items-center", className)}
      {...props}
    />
  )
}

type OTPFieldSlotProps = OTPFieldPrimitive.Input.Props

/**
 * One character. The slot index comes from its order in the DOM, so there
 * is no `index` prop. Slots after the first are labelled "Character n of m"
 * unless you pass `aria-label`; the first slot takes the field's label.
 */
function OTPFieldSlot({ className, render, ...props }: OTPFieldSlotProps) {
  const autoLabel = props["aria-label"] === undefined && render === undefined

  return (
    <OTPFieldPrimitive.Input
      data-slot="otp-field-slot"
      className={cn(
        "relative -ml-px size-9 min-w-0 border border-input bg-transparent text-center text-base font-medium tabular-nums shadow-xs transition-[color,box-shadow] outline-none selection:bg-primary selection:text-primary-foreground first:ml-0 first:rounded-l-md last:rounded-r-md disabled:cursor-not-allowed md:text-sm dark:bg-input/30",
        // Solid ring on the active slot (WCAG 1.4.11); z-10 lifts it above its
        // neighbours' shared borders.
        "focus-visible:z-10 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring",
        "aria-invalid:border-destructive aria-invalid:focus-visible:ring-destructive data-[invalid]:border-destructive",
        className
      )}
      render={
        autoLabel
          ? (inputProps, state) => (
              <input
                {...inputProps}
                {...(state.index > 0 && {
                  "aria-label": `Character ${state.index + 1} of ${state.length}`,
                  "aria-labelledby": undefined,
                })}
              />
            )
          : render
      }
      {...props}
    />
  )
}

function OTPFieldSeparator({
  className,
  children,
  ...props
}: OTPFieldPrimitive.Separator.Props) {
  return (
    <OTPFieldPrimitive.Separator
      data-slot="otp-field-separator"
      className={cn(
        "flex items-center text-muted-foreground [&_svg]:size-4",
        className
      )}
      {...props}
    >
      {children ?? <MinusIcon aria-hidden />}
    </OTPFieldPrimitive.Separator>
  )
}

export {
  OTPField,
  OTPFieldGroup,
  OTPFieldSeparator,
  OTPFieldSlot,
  type OTPFieldProps,
  type OTPFieldSlotProps,
}
