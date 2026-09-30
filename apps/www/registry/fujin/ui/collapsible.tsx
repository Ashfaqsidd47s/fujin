"use client"

import { Collapsible as CollapsiblePrimitive } from "@base-ui/react/collapsible"

import { cn } from "@/registry/fujin/lib/utils"

/*
 * Base UI's Collapsible. The trigger is unstyled on purpose - render your own
 * control with `render={<Button variant="ghost" />}`. The content animates its
 * height using the `--collapsible-panel-height` variable Base UI measures.
 */

type CollapsibleProps = CollapsiblePrimitive.Root.Props
type CollapsibleTriggerProps = CollapsiblePrimitive.Trigger.Props
type CollapsibleContentProps = CollapsiblePrimitive.Panel.Props

function Collapsible(props: CollapsibleProps) {
  return <CollapsiblePrimitive.Root data-slot="collapsible" {...props} />
}

function CollapsibleTrigger(props: CollapsibleTriggerProps) {
  return (
    <CollapsiblePrimitive.Trigger data-slot="collapsible-trigger" {...props} />
  )
}

function CollapsibleContent({ className, ...props }: CollapsibleContentProps) {
  return (
    <CollapsiblePrimitive.Panel
      data-slot="collapsible-content"
      className={cn(
        "h-(--collapsible-panel-height) overflow-hidden transition-[height] duration-200 ease-out data-[ending-style]:h-0 data-[starting-style]:h-0 motion-reduce:transition-none",
        className
      )}
      {...props}
    />
  )
}

export {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
  type CollapsibleProps,
  type CollapsibleTriggerProps,
  type CollapsibleContentProps,
}
