"use client"

import * as React from "react"
import { Select as SelectPrimitive } from "@base-ui/react/select"
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from "lucide-react"

import { cn } from "@/registry/fujin/lib/utils"

/*
 * Pass `items` to `Select` so `SelectValue` can show the selected item's
 * label instead of its raw value (and so the label renders on the server,
 * before the popup has ever mounted). Without `items`, `SelectValue` shows
 * the value itself unless you give it a formatter function as children.
 *
 * Popup placement: by default (`alignItemWithTrigger`) the popup overlaps
 * the trigger so the selected item sits exactly over the trigger's text,
 * like a native macOS select. `side`/`align` are ignored in that mode. It
 * falls back to a normal dropdown on touch input or when there is not
 * enough room. Pass `alignItemWithTrigger={false}` to `SelectContent` for a
 * plain dropdown below the trigger.
 */

type SelectProps<
  Value,
  Multiple extends boolean | undefined = false,
> = SelectPrimitive.Root.Props<Value, Multiple>

function Select<Value, Multiple extends boolean | undefined = false>(
  props: SelectProps<Value, Multiple>
) {
  return <SelectPrimitive.Root {...props} />
}

function SelectGroup({ className, ...props }: SelectPrimitive.Group.Props) {
  return (
    <SelectPrimitive.Group
      data-slot="select-group"
      className={cn("scroll-my-1", className)}
      {...props}
    />
  )
}

type SelectValueProps = SelectPrimitive.Value.Props

function SelectValue({ className, ...props }: SelectValueProps) {
  return (
    <SelectPrimitive.Value
      data-slot="select-value"
      className={cn(
        "flex min-w-0 flex-1 items-center gap-2 truncate text-left data-[placeholder]:text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}

type SelectTriggerProps = SelectPrimitive.Trigger.Props & {
  size?: "sm" | "default"
}

/**
 * Makes a native `<label>` for the trigger (e.g. `FieldLabel`) behave like
 * one for a native `<select>`: clicking it focuses the trigger instead of
 * opening the popup. A label click is forwarded to the button as a real
 * click, which the trigger cannot tell apart from a mouse or screen-reader
 * activation - so the label's activation is cancelled at the source.
 */
function useLabelFocusesTrigger(ref: SelectTriggerProps["ref"]) {
  const [trigger, setTrigger] = React.useState<HTMLButtonElement | null>(null)

  React.useEffect(() => {
    if (!trigger) return
    const doc = trigger.ownerDocument
    function onClick(event: MouseEvent) {
      const target = event.target
      if (!(target instanceof Element) || trigger!.contains(target)) return
      const label = target.closest("label")
      if (!label || label.control !== trigger) return
      event.preventDefault()
      trigger!.focus()
    }
    doc.addEventListener("click", onClick, true)
    return () => doc.removeEventListener("click", onClick, true)
  }, [trigger])

  return React.useCallback(
    (node: HTMLButtonElement | null) => {
      setTrigger(node)
      if (typeof ref === "function") ref(node)
      else if (ref) ref.current = node
    },
    [ref]
  )
}

/**
 * Inside a `<Field>`, the trigger is labelled and described automatically,
 * and clicking `FieldLabel` focuses it without opening the popup.
 * Outside one, give it an `aria-label` or `aria-labelledby`.
 */
function SelectTrigger({
  className,
  size = "default",
  children,
  ref,
  ...props
}: SelectTriggerProps) {
  const triggerRef = useLabelFocusesTrigger(ref)

  return (
    <SelectPrimitive.Trigger
      ref={triggerRef}
      data-slot="select-trigger"
      data-size={size}
      className={cn(
        "flex w-fit min-w-40 cursor-pointer items-center justify-between gap-2 rounded-md border border-input bg-transparent px-3 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none select-none dark:bg-input/30 dark:hover:bg-input/50",
        "data-[size=default]:h-9 data-[size=sm]:h-8",
        // Solid ring: meets the 3:1 non-text contrast requirement (WCAG 1.4.11).
        "focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring",
        "aria-invalid:border-destructive data-[invalid]:border-destructive data-[invalid]:focus-visible:ring-destructive",
        "disabled:cursor-not-allowed disabled:opacity-50 data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50",
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon
        data-slot="select-icon"
        className="flex text-muted-foreground"
      >
        <ChevronDownIcon />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
}

type SelectContentProps = SelectPrimitive.Popup.Props &
  Pick<
    SelectPrimitive.Positioner.Props,
    | "side"
    | "align"
    | "sideOffset"
    | "alignOffset"
    | "alignItemWithTrigger"
    | "anchor"
  >

function SelectContent({
  className,
  side = "bottom",
  align = "start",
  sideOffset = 4,
  alignOffset = 0,
  alignItemWithTrigger = true,
  anchor,
  children,
  ...props
}: SelectContentProps) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Positioner
        side={side}
        align={align}
        sideOffset={sideOffset}
        alignOffset={alignOffset}
        alignItemWithTrigger={alignItemWithTrigger}
        anchor={anchor}
        className="z-50 outline-none select-none"
      >
        <SelectPrimitive.Popup
          data-slot="select-content"
          className={cn(
            "relative min-w-[var(--anchor-width)] origin-[var(--transform-origin)] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md transition-[transform,scale,opacity] outline-none",
            "data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0",
            // Item-aligned mode grows out of the trigger, so it fades only.
            "data-[side=none]:data-[ending-style]:scale-100 data-[side=none]:data-[starting-style]:scale-100",
            className
          )}
          {...props}
        >
          <SelectPrimitive.ScrollUpArrow
            data-slot="select-scroll-up-button"
            className="top-0 z-10 flex h-6 w-full cursor-default items-center justify-center bg-popover text-muted-foreground"
          >
            <ChevronUpIcon className="size-4" />
          </SelectPrimitive.ScrollUpArrow>
          <SelectPrimitive.List
            data-slot="select-list"
            className="relative max-h-[var(--available-height)] scroll-py-6 overflow-y-auto p-1"
          >
            {children}
          </SelectPrimitive.List>
          <SelectPrimitive.ScrollDownArrow
            data-slot="select-scroll-down-button"
            className="bottom-0 z-10 flex h-6 w-full cursor-default items-center justify-center bg-popover text-muted-foreground"
          >
            <ChevronDownIcon className="size-4" />
          </SelectPrimitive.ScrollDownArrow>
        </SelectPrimitive.Popup>
      </SelectPrimitive.Positioner>
    </SelectPrimitive.Portal>
  )
}

/** A heading for a `SelectGroup` (Base UI's `GroupLabel`). */
function SelectLabel({
  className,
  ...props
}: SelectPrimitive.GroupLabel.Props) {
  return (
    <SelectPrimitive.GroupLabel
      data-slot="select-label"
      className={cn(
        "px-2 py-1.5 text-xs font-medium text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}

type SelectItemProps = SelectPrimitive.Item.Props

function SelectItem({ className, children, ...props }: SelectItemProps) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        "relative flex min-h-8 w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-none select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      <SelectPrimitive.ItemText
        data-slot="select-item-text"
        className="flex min-w-0 flex-1 items-center gap-2"
      >
        {children}
      </SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator
        data-slot="select-item-indicator"
        className="absolute right-2 flex size-4 items-center justify-center"
      >
        <CheckIcon />
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  )
}

function SelectSeparator({
  className,
  ...props
}: SelectPrimitive.Separator.Props) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn("pointer-events-none -mx-1 my-1 h-px bg-border", className)}
      {...props}
    />
  )
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
  type SelectProps,
  type SelectTriggerProps,
  type SelectValueProps,
  type SelectContentProps,
  type SelectItemProps,
}
