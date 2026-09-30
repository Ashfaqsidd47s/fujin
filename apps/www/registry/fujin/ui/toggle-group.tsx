"use client"

import * as React from "react"
import { Toggle as TogglePrimitive } from "@base-ui/react/toggle"
import { ToggleGroup as ToggleGroupPrimitive } from "@base-ui/react/toggle-group"
import { type VariantProps } from "class-variance-authority"

import { cn } from "@/registry/fujin/lib/utils"
import { toggleVariants } from "@/registry/fujin/ui/toggle"

/*
 * Base UI's ToggleGroup always works with an array value, even in the
 * default single-select mode: `value={["left"]}`, and `onValueChange`
 * receives `string[]`. Pass `multiple` to allow several pressed items.
 * shadcn/ui's `type="single" | "multiple"` prop does not exist here.
 */

type ToggleGroupContextValue = VariantProps<typeof toggleVariants> & {
  spacing: number
  orientation: "horizontal" | "vertical"
}

const ToggleGroupContext = React.createContext<ToggleGroupContextValue>({
  variant: "default",
  size: "default",
  spacing: 0,
  orientation: "horizontal",
})

type ToggleGroupProps<Value extends string = string> =
  ToggleGroupPrimitive.Props<Value> &
    VariantProps<typeof toggleVariants> & {
      /**
       * Gap between items, in Tailwind spacing units. `0` (the default)
       * joins the items into one segmented control with shared borders.
       */
      spacing?: number
    }

function ToggleGroup<Value extends string = string>({
  className,
  variant = "default",
  size = "default",
  spacing = 0,
  orientation = "horizontal",
  style,
  children,
  ...props
}: ToggleGroupProps<Value>) {
  const context = React.useMemo(
    () => ({ variant, size, spacing, orientation }),
    [variant, size, spacing, orientation]
  )

  return (
    <ToggleGroupPrimitive
      data-slot="toggle-group"
      data-variant={variant}
      data-size={size}
      data-spacing={spacing}
      orientation={orientation}
      style={(state) =>
        ({
          "--gap": spacing,
          ...(typeof style === "function" ? style(state) : style),
        }) as React.CSSProperties
      }
      className={cn(
        "group/toggle-group flex w-fit items-center gap-[--spacing(var(--gap))] rounded-md",
        "data-[orientation=vertical]:flex-col data-[orientation=vertical]:items-stretch",
        "data-[spacing=0]:data-[variant=outline]:shadow-xs",
        className
      )}
      {...props}
    >
      <ToggleGroupContext.Provider value={context}>
        {children}
      </ToggleGroupContext.Provider>
    </ToggleGroupPrimitive>
  )
}

type ToggleGroupItemProps<Value extends string = string> =
  TogglePrimitive.Props<Value> & VariantProps<typeof toggleVariants>

/** A `Toggle` that inherits `variant` and `size` from the group unless set. */
function ToggleGroupItem<Value extends string = string>({
  className,
  variant,
  size,
  ...props
}: ToggleGroupItemProps<Value>) {
  const context = React.useContext(ToggleGroupContext)
  const resolvedVariant = variant ?? context.variant
  const resolvedSize = size ?? context.size
  const joined = context.spacing === 0

  return (
    <TogglePrimitive
      data-slot="toggle-group-item"
      data-variant={resolvedVariant}
      data-size={resolvedSize}
      data-spacing={context.spacing}
      className={cn(
        toggleVariants({ variant: resolvedVariant, size: resolvedSize }),
        // Lift the focused item so its ring is not clipped by its neighbours.
        "shrink-0 focus-visible:z-10",
        joined && "shadow-none",
        joined &&
          (context.orientation === "vertical"
            ? "rounded-none first:rounded-t-md last:rounded-b-md data-[variant=outline]:border-t-0 data-[variant=outline]:first:border-t"
            : "rounded-none first:rounded-l-md last:rounded-r-md data-[variant=outline]:border-l-0 data-[variant=outline]:first:border-l"),
        className
      )}
      {...props}
    />
  )
}

export {
  ToggleGroup,
  ToggleGroupItem,
  type ToggleGroupProps,
  type ToggleGroupItemProps,
}
