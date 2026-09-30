import type * as React from "react"

import { cn } from "@/registry/fujin/lib/utils"

/*
 * Differences from shadcn/ui's kbd:
 * - Text is `foreground`, not `muted-foreground`: grey 12px text on a `muted`
 *   chip lands around 4.3:1, under the 4.5:1 WCAG 1.4.3 needs.
 * - `KbdGroup` renders a `<kbd>` too, so a combination is marked up the way
 *   HTML specifies: `<kbd><kbd>Ctrl</kbd>+<kbd>K</kbd></kbd>`.
 *
 * Inside a tooltip (`bg-foreground`) the chip inverts automatically.
 */
type KbdProps = React.ComponentProps<"kbd">

function Kbd({ className, ...props }: KbdProps) {
  return (
    <kbd
      data-slot="kbd"
      className={cn(
        "pointer-events-none inline-flex h-5 w-fit min-w-5 items-center justify-center gap-1 rounded-sm border border-border bg-muted px-1 font-sans text-xs font-medium text-foreground select-none",
        "[&_svg:not([class*='size-'])]:size-3",
        "in-data-[slot=tooltip-content]:border-transparent in-data-[slot=tooltip-content]:bg-background/20 in-data-[slot=tooltip-content]:text-background",
        className
      )}
      {...props}
    />
  )
}

type KbdGroupProps = React.ComponentProps<"kbd">

function KbdGroup({ className, ...props }: KbdGroupProps) {
  return (
    <kbd
      data-slot="kbd-group"
      className={cn("inline-flex items-center gap-1 font-sans", className)}
      {...props}
    />
  )
}

export { Kbd, KbdGroup, type KbdProps, type KbdGroupProps }
