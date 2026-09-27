"use client"

import type * as React from "react"
import { Combobox as ComboboxPrimitive } from "@base-ui/react/combobox"
import { CheckIcon, SearchIcon, XIcon } from "lucide-react"

import { cn } from "@/registry/fujin/lib/utils"

/*
 * A data-driven listbox-with-search, built on Base UI's Combobox rather than
 * cmdk. The difference that matters: filtering is driven by the `items` prop
 * on `Command`, not by scanning rendered children's text - pass the list you
 * want searchable, `CommandList`'s children render each matched item.
 *
 * Two ways to anchor the popup: render `CommandInput` on its own (it is the
 * anchor - the popup positions below it, and it must not be nested inside
 * `CommandPopup`), or render `CommandTrigger` as the anchor instead and put
 * `CommandInput` inside `CommandPopup` for a searchable-dropdown pattern
 * (click a button, then search the opened list).
 */

type CommandProps<
  Value,
  Multiple extends boolean | undefined = false,
> = ComboboxPrimitive.Root.Props<Value, Multiple>

function Command<Value, Multiple extends boolean | undefined = false>(
  props: CommandProps<Value, Multiple>
) {
  return <ComboboxPrimitive.Root {...props} />
}

/**
 * Opens the popup on click without a visible text input - for a trigger
 * that is its own control, like a filter pill. Render your own trigger
 * content through `render`, same as any other Base UI trigger.
 */
type CommandTriggerProps = ComboboxPrimitive.Trigger.Props

function CommandTrigger(props: CommandTriggerProps) {
  return <ComboboxPrimitive.Trigger data-slot="command-trigger" {...props} />
}

type CommandInputProps = ComboboxPrimitive.Input.Props & {
  /** Hides the search icon - useful when a caller renders its own prefix. */
  hideIcon?: boolean
  /**
   * Skips the bordered wrapper (icon, clear button, box styling) and renders
   * just the input - for embedding inside a caller-styled container, like
   * data-table's pills-and-input search bar.
   */
  bare?: boolean
}

function CommandInput({
  className,
  hideIcon = false,
  bare = false,
  ...props
}: CommandInputProps) {
  if (bare) {
    return (
      <ComboboxPrimitive.Input
        data-slot="command-input"
        className={cn(
          "h-7 min-w-24 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      />
    )
  }

  return (
    <div
      data-slot="command-input-wrapper"
      className="flex h-9 items-center gap-2 rounded-md border border-input bg-transparent px-3 shadow-xs has-[input:focus-visible]:border-ring has-[input:focus-visible]:ring-2 has-[input:focus-visible]:ring-ring"
    >
      {hideIcon ? null : (
        <SearchIcon className="size-4 shrink-0 text-muted-foreground" />
      )}
      <ComboboxPrimitive.Input
        data-slot="command-input"
        className={cn(
          "h-full flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      />
      <ComboboxPrimitive.Clear
        data-slot="command-clear"
        aria-label="Clear"
        className="-mr-1.5 flex size-6 shrink-0 items-center justify-center rounded-xs text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
      >
        <XIcon className="size-3.5" />
      </ComboboxPrimitive.Clear>
    </div>
  )
}

type CommandPopupProps = ComboboxPrimitive.Popup.Props &
  Pick<
    ComboboxPrimitive.Positioner.Props,
    "side" | "align" | "sideOffset" | "alignOffset"
  >

function CommandPopup({
  className,
  side = "bottom",
  align = "start",
  sideOffset = 6,
  alignOffset = 0,
  children,
  ...props
}: CommandPopupProps) {
  return (
    <ComboboxPrimitive.Portal>
      <ComboboxPrimitive.Positioner
        side={side}
        align={align}
        sideOffset={sideOffset}
        alignOffset={alignOffset}
        className="z-50 w-[var(--anchor-width)] min-w-56 outline-none"
      >
        <ComboboxPrimitive.Popup
          data-slot="command-popup"
          className={cn(
            "max-h-80 origin-[var(--transform-origin)] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md transition-[transform,scale,opacity] data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0",
            className
          )}
          {...props}
        >
          {children}
        </ComboboxPrimitive.Popup>
      </ComboboxPrimitive.Positioner>
    </ComboboxPrimitive.Portal>
  )
}

type CommandListProps = ComboboxPrimitive.List.Props

function CommandList({ className, ...props }: CommandListProps) {
  return (
    <ComboboxPrimitive.List
      data-slot="command-list"
      className={cn(
        "max-h-80 overflow-x-hidden overflow-y-auto p-1",
        className
      )}
      {...props}
    />
  )
}

type CommandEmptyProps = ComboboxPrimitive.Empty.Props

function CommandEmpty({ className, ...props }: CommandEmptyProps) {
  return (
    <ComboboxPrimitive.Empty
      data-slot="command-empty"
      className={cn(
        "py-6 text-center text-sm text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}

type CommandGroupProps = ComboboxPrimitive.Group.Props & {
  heading?: React.ReactNode
}

function CommandGroup({
  className,
  heading,
  children,
  ...props
}: CommandGroupProps) {
  return (
    <ComboboxPrimitive.Group
      data-slot="command-group"
      className={cn("py-1", className)}
      {...props}
    >
      {heading ? (
        <ComboboxPrimitive.GroupLabel
          data-slot="command-group-heading"
          className="px-2 py-1.5 text-xs font-medium text-muted-foreground"
        >
          {heading}
        </ComboboxPrimitive.GroupLabel>
      ) : null}
      {children}
    </ComboboxPrimitive.Group>
  )
}

type CommandItemProps = ComboboxPrimitive.Item.Props & {
  /** Shows a checkmark when the item is selected - on by default in `multiple` mode. */
  showIndicator?: boolean
}

function CommandItem({
  className,
  children,
  showIndicator = true,
  ...props
}: CommandItemProps) {
  return (
    <ComboboxPrimitive.Item
      data-slot="command-item"
      className={cn(
        "relative flex min-h-8 cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
        showIndicator && "pl-7",
        className
      )}
      {...props}
    >
      {showIndicator ? (
        <ComboboxPrimitive.ItemIndicator className="absolute left-2 flex size-3.5 items-center justify-center">
          <CheckIcon className="size-4" />
        </ComboboxPrimitive.ItemIndicator>
      ) : null}
      {children}
    </ComboboxPrimitive.Item>
  )
}

function CommandSeparator({
  className,
  ...props
}: ComboboxPrimitive.Separator.Props) {
  return (
    <ComboboxPrimitive.Separator
      data-slot="command-separator"
      className={cn("-mx-1 my-1 h-px bg-border", className)}
      {...props}
    />
  )
}

const CommandChips = ComboboxPrimitive.Chips
const CommandChip = ComboboxPrimitive.Chip
const CommandChipRemove = ComboboxPrimitive.ChipRemove

export {
  Command,
  CommandTrigger,
  CommandInput,
  CommandPopup,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
  CommandChips,
  CommandChip,
  CommandChipRemove,
  type CommandProps,
  type CommandTriggerProps,
  type CommandInputProps,
  type CommandPopupProps,
  type CommandListProps,
  type CommandEmptyProps,
  type CommandGroupProps,
  type CommandItemProps,
}
