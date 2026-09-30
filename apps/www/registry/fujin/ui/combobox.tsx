"use client"

import { Combobox as ComboboxPrimitive } from "@base-ui/react/combobox"
import { CheckIcon, ChevronDownIcon, XIcon } from "lucide-react"

import { cn } from "@/registry/fujin/lib/utils"

/*
 * A form control: a text input that filters a fixed list of options and
 * commits one (or, with `multiple`, several) of them. Not the same thing as
 * `command`, which is the search-list primitive behind data-table's filter
 * bar - that one is for pickers embedded in other UI, this one is for a
 * labelled field in a form.
 *
 * Filtering is driven by the `items` prop on `Combobox`; `ComboboxList`'s
 * child function renders whatever matched. Item objects shaped
 * `{ value, label }` need no extra config: `label` is shown in the input and
 * `value` is what the form submits.
 *
 * Typed text is not a value. In single mode, when the popup closes the input
 * snaps back to the selected item's label (or empties if nothing is
 * selected); in multiple mode the filter text is cleared. For free text with
 * suggestions, use Base UI's Autocomplete instead.
 */

type ComboboxProps<
  Value,
  Multiple extends boolean | undefined = false,
  Item = Value,
> = ComboboxPrimitive.Root.Props<Value, Multiple, Item>

function Combobox<
  Value,
  Multiple extends boolean | undefined = false,
  Item = Value,
>(props: ComboboxProps<Value, Multiple, Item>) {
  return <ComboboxPrimitive.Root {...props} />
}

/** Renders the selected value(s); a function child receives them. */
function ComboboxValue(props: ComboboxPrimitive.Value.Props) {
  return <ComboboxPrimitive.Value {...props} />
}

const iconButtonClassName =
  "flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-sm text-muted-foreground outline-none hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4"

type ComboboxInputProps = ComboboxPrimitive.Input.Props & {
  /** Renders the chevron button that opens the list. */
  showTrigger?: boolean
  /** Renders a clear button while there is a value or typed text. */
  showClear?: boolean
}

/**
 * The input plus its buttons, in one bordered box that the popup anchors to.
 * `className` styles the box; every other prop goes to the `<input>`.
 * Inside a `<Field>`, `FieldLabel` labels the input automatically.
 */
function ComboboxInput({
  className,
  showTrigger = true,
  showClear = false,
  disabled,
  ...props
}: ComboboxInputProps) {
  return (
    <ComboboxPrimitive.InputGroup
      data-slot="combobox-input-group"
      className={cn(
        "flex h-9 w-full min-w-0 items-center gap-0.5 rounded-md border border-input bg-transparent pr-1.5 shadow-xs transition-[color,box-shadow] dark:bg-input/30",
        // Solid ring: meets the 3:1 non-text contrast requirement (WCAG 1.4.11).
        "focus-within:border-ring focus-within:ring-2 focus-within:ring-ring",
        "data-[invalid]:border-destructive data-[invalid]:focus-within:ring-destructive",
        "data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50",
        className
      )}
    >
      <ComboboxPrimitive.Input
        data-slot="combobox-input"
        disabled={disabled}
        className="h-full min-w-0 flex-1 bg-transparent px-3 text-base outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed md:text-sm"
        {...props}
      />
      {showClear ? (
        <ComboboxPrimitive.Clear
          data-slot="combobox-clear"
          aria-label="Clear"
          disabled={disabled}
          className={iconButtonClassName}
        >
          <XIcon />
        </ComboboxPrimitive.Clear>
      ) : null}
      {showTrigger ? (
        <ComboboxPrimitive.Trigger
          data-slot="combobox-trigger"
          aria-label="Show options"
          disabled={disabled}
          className={iconButtonClassName}
        >
          <ChevronDownIcon />
        </ComboboxPrimitive.Trigger>
      ) : null}
    </ComboboxPrimitive.InputGroup>
  )
}

type ComboboxContentProps = ComboboxPrimitive.Popup.Props &
  Pick<
    ComboboxPrimitive.Positioner.Props,
    "side" | "align" | "sideOffset" | "alignOffset" | "anchor"
  >

function ComboboxContent({
  className,
  side = "bottom",
  align = "start",
  sideOffset = 4,
  alignOffset = 0,
  anchor,
  ...props
}: ComboboxContentProps) {
  return (
    <ComboboxPrimitive.Portal>
      <ComboboxPrimitive.Positioner
        side={side}
        align={align}
        sideOffset={sideOffset}
        alignOffset={alignOffset}
        anchor={anchor}
        className="z-50 outline-none"
      >
        <ComboboxPrimitive.Popup
          data-slot="combobox-content"
          className={cn(
            "w-[var(--anchor-width)] max-w-[var(--available-width)] origin-[var(--transform-origin)] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md transition-[transform,scale,opacity] outline-none data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0",
            className
          )}
          {...props}
        />
      </ComboboxPrimitive.Positioner>
    </ComboboxPrimitive.Portal>
  )
}

type ComboboxListProps = ComboboxPrimitive.List.Props

function ComboboxList({ className, ...props }: ComboboxListProps) {
  return (
    <ComboboxPrimitive.List
      data-slot="combobox-list"
      className={cn(
        "max-h-[min(var(--available-height),20rem)] scroll-py-1 overflow-y-auto overscroll-contain p-1 data-[empty]:p-0",
        className
      )}
      {...props}
    />
  )
}

/**
 * Shown when nothing matches. The element stays mounted (it is a polite
 * live region) and collapses via `:empty` while there are results.
 */
function ComboboxEmpty({ className, ...props }: ComboboxPrimitive.Empty.Props) {
  return (
    <ComboboxPrimitive.Empty
      data-slot="combobox-empty"
      className={cn(
        "px-2 py-6 text-center text-sm text-muted-foreground empty:p-0",
        className
      )}
      {...props}
    />
  )
}

type ComboboxItemProps = ComboboxPrimitive.Item.Props

function ComboboxItem({ className, children, ...props }: ComboboxItemProps) {
  return (
    <ComboboxPrimitive.Item
      data-slot="combobox-item"
      className={cn(
        "relative flex min-h-8 w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-none select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      {children}
      <ComboboxPrimitive.ItemIndicator
        data-slot="combobox-item-indicator"
        className="absolute right-2 flex size-4 items-center justify-center"
      >
        <CheckIcon />
      </ComboboxPrimitive.ItemIndicator>
    </ComboboxPrimitive.Item>
  )
}

function ComboboxGroup({ className, ...props }: ComboboxPrimitive.Group.Props) {
  return (
    <ComboboxPrimitive.Group
      data-slot="combobox-group"
      className={cn("py-1 first:pt-0 last:pb-0", className)}
      {...props}
    />
  )
}

function ComboboxGroupLabel({
  className,
  ...props
}: ComboboxPrimitive.GroupLabel.Props) {
  return (
    <ComboboxPrimitive.GroupLabel
      data-slot="combobox-group-label"
      className={cn(
        "px-2 py-1.5 text-xs font-medium text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}

/** Renders a group's filtered items; use inside `ComboboxGroup`. */
function ComboboxCollection(props: ComboboxPrimitive.Collection.Props) {
  return <ComboboxPrimitive.Collection {...props} />
}

function ComboboxSeparator({
  className,
  ...props
}: ComboboxPrimitive.Separator.Props) {
  return (
    <ComboboxPrimitive.Separator
      data-slot="combobox-separator"
      className={cn("-mx-1 my-1 h-px bg-border", className)}
      {...props}
    />
  )
}

type ComboboxChipsProps = ComboboxPrimitive.Chips.Props

/**
 * The bordered box for `multiple` mode: holds the chips and a
 * `ComboboxChipsInput`, and is what the popup anchors to. Give it an
 * `aria-label` such as "Selected frameworks" - it becomes a toolbar once
 * there are chips.
 */
function ComboboxChips({ className, ...props }: ComboboxChipsProps) {
  return (
    <ComboboxPrimitive.InputGroup
      data-slot="combobox-chips"
      className={cn(
        "flex min-h-9 w-full cursor-text items-center rounded-md border border-input bg-transparent px-1.5 py-1 shadow-xs transition-[color,box-shadow] dark:bg-input/30",
        "focus-within:border-ring focus-within:ring-2 focus-within:ring-ring",
        "data-[invalid]:border-destructive data-[invalid]:focus-within:ring-destructive",
        "data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50",
        className
      )}
    >
      <ComboboxPrimitive.Chips
        data-slot="combobox-chips-list"
        className="flex min-w-0 flex-1 flex-wrap items-center gap-1"
        {...props}
      />
    </ComboboxPrimitive.InputGroup>
  )
}

type ComboboxChipProps = ComboboxPrimitive.Chip.Props & {
  /** Renders the remove button. Backspace/Delete removes a focused chip either way. */
  showRemove?: boolean
}

function ComboboxChip({
  className,
  children,
  showRemove = true,
  ...props
}: ComboboxChipProps) {
  return (
    <ComboboxPrimitive.Chip
      data-slot="combobox-chip"
      className={cn(
        "flex h-6 max-w-full items-center gap-0.5 rounded-sm bg-secondary pl-2 text-xs font-medium text-secondary-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring",
        showRemove ? "pr-0" : "pr-2",
        className
      )}
      {...props}
    >
      <span className="truncate">{children}</span>
      {showRemove ? (
        <ComboboxChipRemove
          aria-label={
            typeof children === "string" ? `Remove ${children}` : "Remove"
          }
        />
      ) : null}
    </ComboboxPrimitive.Chip>
  )
}

/**
 * Removes its chip. Not in the tab order (Base UI moves focus between chips
 * with the arrow keys and removes with Backspace), so it is a pointer target:
 * 24px square, sitting flush with the chip's 24px height.
 */
function ComboboxChipRemove({
  className,
  ...props
}: ComboboxPrimitive.ChipRemove.Props) {
  return (
    <ComboboxPrimitive.ChipRemove
      data-slot="combobox-chip-remove"
      className={cn(
        "flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-sm text-muted-foreground outline-none hover:bg-accent hover:text-accent-foreground [&_svg]:size-3.5",
        className
      )}
      {...props}
    >
      <XIcon />
    </ComboboxPrimitive.ChipRemove>
  )
}

/** The text input inside `ComboboxChips`. */
function ComboboxChipsInput({
  className,
  ...props
}: ComboboxPrimitive.Input.Props) {
  return (
    <ComboboxPrimitive.Input
      data-slot="combobox-chips-input"
      className={cn(
        "h-7 min-w-16 flex-1 bg-transparent px-1.5 text-base outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed md:text-sm",
        className
      )}
      {...props}
    />
  )
}

export {
  Combobox,
  ComboboxValue,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxGroup,
  ComboboxGroupLabel,
  ComboboxCollection,
  ComboboxSeparator,
  ComboboxChips,
  ComboboxChip,
  ComboboxChipRemove,
  ComboboxChipsInput,
  type ComboboxProps,
  type ComboboxInputProps,
  type ComboboxContentProps,
  type ComboboxListProps,
  type ComboboxItemProps,
  type ComboboxChipsProps,
  type ComboboxChipProps,
}
