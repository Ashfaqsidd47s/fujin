"use client"

import * as React from "react"
import { Field as FieldPrimitive } from "@base-ui/react/field"
import { Fieldset as FieldsetPrimitive } from "@base-ui/react/fieldset"

import { cn } from "@/lib/utils"

/*
 * Built on Base UI's Field, which generates ids and wires `htmlFor`,
 * `aria-labelledby`, `aria-describedby` and `aria-invalid` between the parts.
 * shadcn/ui's Field is presentational only, so its descriptions and errors are
 * never programmatically associated with the control.
 */

type FieldProps = FieldPrimitive.Root.Props & {
  orientation?: "vertical" | "horizontal"
}

function Field({ className, orientation = "vertical", ...props }: FieldProps) {
  return (
    <FieldPrimitive.Root
      data-slot="field"
      data-orientation={orientation}
      className={cn(
        "group/field flex w-full gap-2 data-[disabled]:opacity-60",
        orientation === "vertical"
          ? "flex-col"
          : "flex-row items-center [&>[data-slot=field-label]]:flex-auto",
        className
      )}
      {...props}
    />
  )
}

type FieldLabelProps = FieldPrimitive.Label.Props & {
  /** Appends a visual required marker. Set `required` on the control too. */
  required?: boolean
  /** Appends "(optional)". Prefer this over marking every other field required. */
  optional?: boolean
}

function FieldLabel({
  className,
  required,
  optional,
  children,
  ...props
}: FieldLabelProps) {
  return (
    <FieldPrimitive.Label
      data-slot="field-label"
      className={cn(
        "flex items-center gap-1 text-sm leading-none font-medium select-none group-data-[disabled]/field:cursor-not-allowed data-[invalid]:text-destructive",
        className
      )}
      {...props}
    >
      {children}
      {required ? (
        // Hidden from AT: the control's own `required` is what gets announced.
        <span aria-hidden className="text-destructive">
          *
        </span>
      ) : null}
      {optional ? (
        <span className="font-normal text-muted-foreground">(optional)</span>
      ) : null}
    </FieldPrimitive.Label>
  )
}

function FieldControl({ className, ...props }: FieldPrimitive.Control.Props) {
  return (
    <FieldPrimitive.Control
      data-slot="field-control"
      className={cn(className)}
      {...props}
    />
  )
}

function FieldDescription({
  className,
  ...props
}: FieldPrimitive.Description.Props) {
  return (
    <FieldPrimitive.Description
      data-slot="field-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

type FieldErrorProps = FieldPrimitive.Error.Props & {
  /**
   * Errors from a form library (react-hook-form, zod issues, server actions).
   * When provided, the error is shown whenever the list is non-empty.
   */
  errors?: Array<string | { message?: string } | undefined | null>
}

function FieldError({
  className,
  errors,
  match,
  children,
  ...props
}: FieldErrorProps) {
  const messages = React.useMemo(
    () => [
      ...new Set(
        (errors ?? [])
          .map((error) => (typeof error === "string" ? error : error?.message))
          .filter((message): message is string => Boolean(message))
      ),
    ],
    [errors]
  )

  const external = errors !== undefined
  const content =
    children ??
    (messages.length > 1 ? (
      <ul className="ml-4 list-disc">
        {messages.map((message) => (
          <li key={message}>{message}</li>
        ))}
      </ul>
    ) : (
      messages[0]
    ))

  return (
    <FieldPrimitive.Error
      data-slot="field-error"
      match={external ? messages.length > 0 : match}
      className={cn("text-sm font-medium text-destructive", className)}
      {...props}
    >
      {content}
    </FieldPrimitive.Error>
  )
}

function FieldSet({ className, ...props }: FieldsetPrimitive.Root.Props) {
  return (
    <FieldsetPrimitive.Root
      data-slot="field-set"
      className={cn("flex flex-col gap-6", className)}
      {...props}
    />
  )
}

function FieldLegend({ className, ...props }: FieldsetPrimitive.Legend.Props) {
  return (
    <FieldsetPrimitive.Legend
      data-slot="field-legend"
      className={cn("mb-1 text-base font-medium", className)}
      {...props}
    />
  )
}

function FieldGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="field-group"
      className={cn("flex w-full flex-col gap-6", className)}
      {...props}
    />
  )
}

export {
  Field,
  FieldControl,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
  type FieldErrorProps,
  type FieldLabelProps,
  type FieldProps,
}
