import * as React from "react"

import { cn } from "@/registry/fujin/lib/utils"

type LabelProps = React.ComponentProps<"label">

/**
 * For controls outside a <Field>. Inside a Field use `FieldLabel`, which is
 * linked to the control automatically.
 *
 * Dims when the control before it (`peer`) or an enclosing `group` is
 * disabled. When it wraps a disabled Base UI control it only mutes the text,
 * because the control already dims itself and opacity would compound.
 */
function Label({ className, ...props }: LabelProps) {
  return (
    <label
      data-slot="label"
      className={cn(
        "flex items-center gap-2 text-sm leading-none font-medium select-none",
        "peer-disabled:cursor-not-allowed peer-disabled:opacity-50 peer-data-[disabled]:cursor-not-allowed peer-data-[disabled]:opacity-50",
        "group-data-[disabled]:pointer-events-none group-data-[disabled]:opacity-50",
        "has-disabled:cursor-not-allowed has-disabled:text-muted-foreground has-data-[disabled]:cursor-not-allowed has-data-[disabled]:text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}

export { Label, type LabelProps }
