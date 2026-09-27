import * as React from "react"

import { cn } from "@/registry/fujin/lib/utils"

/*
 * Plain semantic HTML, not a Base UI part - a <table> already has the ARIA
 * semantics it needs. `TableHeader` accepts `sticky` so callers (data-table's
 * column-header row included) can stick it to the viewport without
 * repeating the position/z-index/background classes by hand.
 */

type TableProps = React.ComponentProps<"table">

function Table({ className, ...props }: TableProps) {
  return (
    <div
      data-slot="table-container"
      className="relative w-full overflow-x-auto"
    >
      <table
        data-slot="table"
        className={cn("w-full caption-bottom text-sm", className)}
        {...props}
      />
    </div>
  )
}

type TableHeaderProps = React.ComponentProps<"thead"> & {
  /** Sticks the header to the top of the nearest scroll ancestor. */
  sticky?: boolean
}

function TableHeader({ className, sticky, ...props }: TableHeaderProps) {
  return (
    <thead
      data-slot="table-header"
      data-sticky={sticky || undefined}
      className={cn(
        "[&_tr]:border-b",
        sticky &&
          "sticky top-[var(--fujin-data-table-offset,0px)] z-10 bg-background after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-border",
        className
      )}
      {...props}
    />
  )
}

type TableBodyProps = React.ComponentProps<"tbody">

function TableBody({ className, ...props }: TableBodyProps) {
  return (
    <tbody
      data-slot="table-body"
      className={cn("[&_tr:last-child]:border-0", className)}
      {...props}
    />
  )
}

type TableFooterProps = React.ComponentProps<"tfoot">

function TableFooter({ className, ...props }: TableFooterProps) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn(
        "border-t bg-muted/50 font-medium [&>tr]:last:border-b-0",
        className
      )}
      {...props}
    />
  )
}

type TableRowProps = React.ComponentProps<"tr">

function TableRow({ className, ...props }: TableRowProps) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        "border-b transition-colors hover:bg-muted/50 data-[selected=true]:bg-accent/50",
        className
      )}
      {...props}
    />
  )
}

type TableHeadProps = React.ComponentProps<"th">

function TableHead({ className, ...props }: TableHeadProps) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        "h-10 px-3 text-left align-middle font-medium whitespace-nowrap text-muted-foreground [&:has([role=checkbox])]:pr-0",
        className
      )}
      {...props}
    />
  )
}

type TableCellProps = React.ComponentProps<"td">

function TableCell({ className, ...props }: TableCellProps) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        "px-3 py-2.5 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0",
        className
      )}
      {...props}
    />
  )
}

type TableCaptionProps = React.ComponentProps<"caption">

function TableCaption({ className, ...props }: TableCaptionProps) {
  return (
    <caption
      data-slot="table-caption"
      className={cn("mt-4 text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
  type TableProps,
  type TableHeaderProps,
  type TableBodyProps,
  type TableFooterProps,
  type TableRowProps,
  type TableHeadProps,
  type TableCellProps,
  type TableCaptionProps,
}
