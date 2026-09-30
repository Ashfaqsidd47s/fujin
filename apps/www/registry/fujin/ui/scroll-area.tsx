"use client"

import { ScrollArea as ScrollAreaPrimitive } from "@base-ui/react/scroll-area"

import { cn } from "@/registry/fujin/lib/utils"

/*
 * Differences from shadcn/ui's scroll-area, all deliberate:
 * - Both scrollbars are built in. Base UI only mounts a scrollbar while its
 *   axis overflows, so the horizontal one costs nothing until it is needed -
 *   do not add `<ScrollBar orientation="horizontal" />` as a child.
 * - The viewport inherits `max-height`, so `className="max-h-72"` works, not
 *   just a fixed `h-72`.
 * - Keyboard access (WCAG 2.1.1): Base UI puts the viewport in the tab order
 *   while it overflows (`tabIndex={0}`, -1 otherwise). The focus indicator is
 *   an inset outline, not a ring, so a clipping parent cannot hide it.
 * - Scrollbars show on hover, while scrolling, and while focus is inside;
 *   the thumb meets 3:1 contrast against the background.
 */

type ScrollAreaProps = ScrollAreaPrimitive.Root.Props & {
  /** Props for the scrollable element: `ref`, `onScroll`, `aria-label`... */
  viewportProps?: ScrollAreaPrimitive.Viewport.Props
}

function ScrollArea({
  className,
  children,
  viewportProps,
  ...props
}: ScrollAreaProps) {
  return (
    <ScrollAreaPrimitive.Root
      data-slot="scroll-area"
      className={cn("group/scroll-area relative", className)}
      {...props}
    >
      <ScrollAreaPrimitive.Viewport
        data-slot="scroll-area-viewport"
        {...viewportProps}
        className={(state) =>
          cn(
            "size-full max-h-[inherit] rounded-[inherit] outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring",
            typeof viewportProps?.className === "function"
              ? viewportProps.className(state)
              : viewportProps?.className
          )
        }
      >
        <ScrollAreaPrimitive.Content data-slot="scroll-area-content">
          {children}
        </ScrollAreaPrimitive.Content>
      </ScrollAreaPrimitive.Viewport>
      <ScrollBar orientation="vertical" />
      <ScrollBar orientation="horizontal" />
      <ScrollAreaPrimitive.Corner data-slot="scroll-area-corner" />
    </ScrollAreaPrimitive.Root>
  )
}

type ScrollBarProps = ScrollAreaPrimitive.Scrollbar.Props

/** One scrollbar. `ScrollArea` already renders both; use this in custom compositions. */
function ScrollBar({
  className,
  orientation = "vertical",
  ...props
}: ScrollBarProps) {
  return (
    <ScrollAreaPrimitive.Scrollbar
      data-slot="scroll-area-scrollbar"
      orientation={orientation}
      className={cn(
        "pointer-events-none flex p-px opacity-0 transition-opacity duration-150",
        "group-focus-within/scroll-area:opacity-100 data-[hovering]:pointer-events-auto data-[hovering]:opacity-100 data-[scrolling]:pointer-events-auto data-[scrolling]:opacity-100 data-[scrolling]:duration-0",
        "data-[orientation=horizontal]:h-2.5 data-[orientation=horizontal]:flex-col data-[orientation=vertical]:w-2.5",
        className
      )}
      {...props}
    >
      <ScrollAreaPrimitive.Thumb
        data-slot="scroll-area-thumb"
        className="relative flex-1 rounded-full bg-muted-foreground/80"
      />
    </ScrollAreaPrimitive.Scrollbar>
  )
}

export { ScrollArea, ScrollBar, type ScrollAreaProps, type ScrollBarProps }
