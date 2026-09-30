"use client"

import { Switch as SwitchPrimitive } from "@base-ui/react/switch"

import { cn } from "@/registry/fujin/lib/utils"

/*
 * Differences from shadcn/ui's switch, all deliberate:
 * - The off track is `muted-foreground`, not `input`, so the control and its
 *   thumb reach the 3:1 non-text contrast WCAG 1.4.11 requires.
 * - Both sizes have a 24px-tall hit area (WCAG 2.5.8) via a transparent
 *   `::after`, even though the `sm` track is drawn at 16px.
 */

type SwitchProps = SwitchPrimitive.Root.Props & {
  size?: "default" | "sm"
}

function Switch({ className, size = "default", ...props }: SwitchProps) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size}
      className={cn(
        "peer relative inline-flex shrink-0 cursor-pointer items-center rounded-full p-0.5 transition-colors outline-none",
        "after:absolute after:inset-x-0 after:top-1/2 after:h-6 after:-translate-y-1/2",
        size === "sm" ? "h-4 w-7" : "h-5 w-9",
        "bg-muted-foreground data-[checked]:bg-primary",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "aria-invalid:ring-2 aria-invalid:ring-destructive aria-invalid:ring-offset-2 aria-invalid:ring-offset-background data-[invalid]:ring-2 data-[invalid]:ring-destructive data-[invalid]:ring-offset-2 data-[invalid]:ring-offset-background",
        "data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50 data-[readonly]:cursor-default",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "pointer-events-none block rounded-full bg-background shadow-sm transition-transform",
          size === "sm"
            ? "size-3 data-[checked]:translate-x-3 rtl:data-[checked]:-translate-x-3"
            : "size-4 data-[checked]:translate-x-4 rtl:data-[checked]:-translate-x-4"
        )}
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch, type SwitchProps }
