"use client"

import type * as React from "react"
import { Dialog as SheetPrimitive } from "@base-ui/react/dialog"
import { XIcon } from "lucide-react"

import { cn } from "@/registry/fujin/lib/utils"
import { Button } from "@/registry/fujin/ui/button"

/*
 * A Dialog positioned against an edge of the screen. Same focus trap, inert
 * page and focus return as `dialog`; it only differs in layout and motion.
 * It has no swipe-to-dismiss - that is what Base UI's Drawer is for.
 */

type SheetProps = SheetPrimitive.Root.Props
type SheetTriggerProps = SheetPrimitive.Trigger.Props
type SheetCloseProps = SheetPrimitive.Close.Props

function Sheet(props: SheetProps) {
  return <SheetPrimitive.Root data-slot="sheet" {...props} />
}

function SheetTrigger(props: SheetTriggerProps) {
  return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />
}

function SheetClose(props: SheetCloseProps) {
  return <SheetPrimitive.Close data-slot="sheet-close" {...props} />
}

const sideClassNames = {
  top: "inset-x-0 top-0 max-h-[calc(100dvh-2rem)] border-b data-[ending-style]:-translate-y-full data-[starting-style]:-translate-y-full",
  right:
    "inset-y-0 right-0 h-full w-3/4 border-l data-[ending-style]:translate-x-full data-[starting-style]:translate-x-full sm:max-w-sm",
  bottom:
    "inset-x-0 bottom-0 max-h-[calc(100dvh-2rem)] border-t data-[ending-style]:translate-y-full data-[starting-style]:translate-y-full",
  left: "inset-y-0 left-0 h-full w-3/4 border-r data-[ending-style]:-translate-x-full data-[starting-style]:-translate-x-full sm:max-w-sm",
} as const

type SheetContentProps = SheetPrimitive.Popup.Props & {
  /** The screen edge the sheet slides in from. */
  side?: keyof typeof sideClassNames
  /** Renders a labelled close button in the top-right corner. */
  showCloseButton?: boolean
}

function SheetContent({
  className,
  children,
  side = "right",
  showCloseButton = true,
  ...props
}: SheetContentProps) {
  return (
    <SheetPrimitive.Portal>
      <SheetPrimitive.Backdrop
        data-slot="sheet-overlay"
        className="fixed inset-0 z-50 bg-black/50 transition-opacity duration-300 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 supports-[-webkit-touch-callout:none]:absolute motion-reduce:transition-none"
      />
      <SheetPrimitive.Popup
        data-slot="sheet-content"
        data-side={side}
        className={cn(
          "fixed z-50 flex flex-col gap-4 overflow-y-auto overscroll-contain bg-background text-foreground shadow-lg outline-none",
          "transition-[translate] duration-300 ease-out data-[ending-style]:duration-200 data-[ending-style]:ease-in motion-reduce:transition-none",
          sideClassNames[side],
          className
        )}
        {...props}
      >
        {children}
        {showCloseButton ? (
          <SheetPrimitive.Close
            data-slot="sheet-close"
            aria-label="Close"
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                className="absolute top-3 right-3 text-muted-foreground"
              />
            }
          >
            <XIcon aria-hidden />
          </SheetPrimitive.Close>
        ) : null}
      </SheetPrimitive.Popup>
    </SheetPrimitive.Portal>
  )
}

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-header"
      className={cn("flex flex-col gap-1.5 p-4 pr-12", className)}
      {...props}
    />
  )
}

function SheetFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-footer"
      className={cn("mt-auto flex flex-col gap-2 p-4", className)}
      {...props}
    />
  )
}

function SheetTitle({ className, ...props }: SheetPrimitive.Title.Props) {
  return (
    <SheetPrimitive.Title
      data-slot="sheet-title"
      className={cn("text-base font-semibold text-foreground", className)}
      {...props}
    />
  )
}

function SheetDescription({
  className,
  ...props
}: SheetPrimitive.Description.Props) {
  return (
    <SheetPrimitive.Description
      data-slot="sheet-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
  type SheetProps,
  type SheetTriggerProps,
  type SheetCloseProps,
  type SheetContentProps,
}
