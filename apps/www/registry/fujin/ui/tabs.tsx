"use client"

import * as React from "react"
import { Tabs as TabsPrimitive } from "@base-ui/react/tabs"
import { cva } from "class-variance-authority"

import { cn } from "@/registry/fujin/lib/utils"

/*
 * Base UI's Tabs: arrow keys move between tabs (Left/Right, or Up/Down when
 * vertical), Home/End jump to the ends, and Enter/Space activates. Panels are
 * linked to their tab with `aria-controls`/`aria-labelledby`.
 */

type TabsVariant = "default" | "line"

const TabsListContext = React.createContext<{
  variant: TabsVariant
  indicator: boolean
}>({ variant: "default", indicator: false })

type TabsProps = TabsPrimitive.Root.Props

function Tabs({ className, orientation = "horizontal", ...props }: TabsProps) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      orientation={orientation}
      className={cn(
        "flex gap-2 data-[orientation=horizontal]:flex-col",
        className
      )}
      {...props}
    />
  )
}

const tabsListVariants = cva(
  "relative isolate inline-flex w-fit items-center text-muted-foreground data-[orientation=vertical]:flex-col data-[orientation=vertical]:items-stretch",
  {
    variants: {
      variant: {
        default: "rounded-lg bg-muted p-[3px]",
        line: "gap-1 data-[orientation=horizontal]:border-b data-[orientation=vertical]:border-r",
      },
    },
    defaultVariants: { variant: "default" },
  }
)

type TabsListProps = TabsPrimitive.List.Props & {
  /** `default` is a segmented pill; `line` underlines the active tab. */
  variant?: TabsVariant
  /**
   * Slides a single indicator between tabs instead of restyling the active
   * tab. Uses Base UI's `Tabs.Indicator`.
   */
  indicator?: boolean
}

function TabsList({
  className,
  variant = "default",
  indicator = false,
  children,
  ...props
}: TabsListProps) {
  const context = React.useMemo(
    () => ({ variant, indicator }),
    [variant, indicator]
  )

  return (
    <TabsListContext.Provider value={context}>
      <TabsPrimitive.List
        data-slot="tabs-list"
        data-variant={variant}
        className={cn(tabsListVariants({ variant }), className)}
        {...props}
      >
        {children}
        {indicator ? <TabsIndicator variant={variant} /> : null}
      </TabsPrimitive.List>
    </TabsListContext.Provider>
  )
}

const tabsIndicatorVariants = cva(
  "absolute top-0 left-0 -z-10 transition-[translate,width,height] duration-200 ease-out motion-reduce:transition-none",
  {
    variants: {
      variant: {
        default:
          "h-(--active-tab-height) w-(--active-tab-width) translate-x-(--active-tab-left) translate-y-(--active-tab-top) rounded-md border border-transparent bg-background shadow-sm dark:border-input dark:bg-input/30",
        line: "bg-foreground data-[orientation=horizontal]:top-auto data-[orientation=horizontal]:-bottom-px data-[orientation=horizontal]:h-0.5 data-[orientation=horizontal]:w-(--active-tab-width) data-[orientation=horizontal]:translate-x-(--active-tab-left) data-[orientation=vertical]:right-[-1px] data-[orientation=vertical]:left-auto data-[orientation=vertical]:h-(--active-tab-height) data-[orientation=vertical]:w-0.5 data-[orientation=vertical]:translate-y-(--active-tab-top)",
      },
    },
  }
)

function TabsIndicator({
  className,
  variant,
  ...props
}: TabsPrimitive.Indicator.Props & { variant: TabsVariant }) {
  return (
    <TabsPrimitive.Indicator
      data-slot="tabs-indicator"
      // Paint on the server too, so the active tab is marked before hydration.
      renderBeforeHydration
      className={cn(tabsIndicatorVariants({ variant }), className)}
      {...props}
    />
  )
}

const tabsTriggerVariants = cva(
  "relative inline-flex min-h-7 items-center justify-center gap-1.5 rounded-md px-3 py-1 text-sm font-medium whitespace-nowrap text-muted-foreground transition-[color,background-color,box-shadow] outline-none select-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring data-[active]:text-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[orientation=vertical]:justify-start [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "flex-1",
        line: "",
      },
      indicator: {
        true: "",
        false: "",
      },
    },
    compoundVariants: [
      {
        variant: "default",
        indicator: false,
        className:
          "border border-transparent data-[active]:bg-background data-[active]:shadow-sm dark:data-[active]:border-input dark:data-[active]:bg-input/30",
      },
      {
        variant: "line",
        indicator: false,
        className:
          "after:absolute after:bg-transparent data-[active]:after:bg-foreground data-[orientation=horizontal]:after:inset-x-0 data-[orientation=horizontal]:after:-bottom-px data-[orientation=horizontal]:after:h-0.5 data-[orientation=vertical]:after:inset-y-0 data-[orientation=vertical]:after:right-[-1px] data-[orientation=vertical]:after:w-0.5",
      },
    ],
  }
)

type TabsTriggerProps = TabsPrimitive.Tab.Props

function TabsTrigger({ className, ...props }: TabsTriggerProps) {
  const { variant, indicator } = React.useContext(TabsListContext)

  return (
    <TabsPrimitive.Tab
      data-slot="tabs-trigger"
      className={cn(tabsTriggerVariants({ variant, indicator }), className)}
      {...props}
    />
  )
}

type TabsContentProps = TabsPrimitive.Panel.Props

function TabsContent({ className, ...props }: TabsContentProps) {
  return (
    <TabsPrimitive.Panel
      data-slot="tabs-content"
      className={cn(
        "flex-1 rounded-md text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className
      )}
      {...props}
    />
  )
}

export {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  tabsListVariants,
  type TabsProps,
  type TabsListProps,
  type TabsTriggerProps,
  type TabsContentProps,
}
