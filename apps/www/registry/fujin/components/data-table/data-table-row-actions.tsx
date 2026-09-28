"use client"

import { MoreHorizontalIcon } from "lucide-react"

import type { RowAction } from "@/registry/fujin/lib/data-table/types"
import { Button } from "@/registry/fujin/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/registry/fujin/ui/dropdown-menu"

export type DataTableRowActionsProps<TData> = {
  row: TData
  actions: readonly RowAction<TData>[]
  /** Screen-reader name of the row: "Actions for Halo ring". */
  label: string
}

/** The per-row "..." menu in the column that sticks to the end edge. */
function DataTableRowActions<TData>({
  row,
  actions,
  label,
}: DataTableRowActionsProps<TData>) {
  const visible = actions.filter((action) => !action.hidden?.(row))
  if (visible.length === 0) return null
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            className="size-7"
            aria-label={`Actions for ${label}`}
          />
        }
      >
        <MoreHorizontalIcon aria-hidden />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-40">
        {visible.map((action, index) => (
          <RowActionItem
            key={action.id}
            action={action}
            row={row}
            separator={index > 0 && action.separatorBefore === true}
          />
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function RowActionItem<TData>({
  action,
  row,
  separator,
}: {
  action: RowAction<TData>
  row: TData
  separator: boolean
}) {
  return (
    <>
      {separator ? <DropdownMenuSeparator /> : null}
      <DropdownMenuItem
        variant={action.variant}
        disabled={action.disabled?.(row)}
        onClick={() => void action.onAction(row)}
      >
        {action.icon}
        {action.label}
      </DropdownMenuItem>
    </>
  )
}

export { DataTableRowActions }
