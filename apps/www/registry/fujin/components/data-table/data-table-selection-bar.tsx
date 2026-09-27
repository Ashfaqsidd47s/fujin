"use client"

import type * as React from "react"
import { MoreHorizontalIcon, XIcon } from "lucide-react"

import type { SelectionDescriptor } from "@/registry/fujin/lib/data-table/types"
import { cn } from "@/registry/fujin/lib/utils"
import { Button } from "@/registry/fujin/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/registry/fujin/ui/dropdown-menu"

export type DataTableBulkAction = {
  label: string
  icon?: React.ReactNode
  onAction: (selection: SelectionDescriptor) => void
  variant?: "default" | "destructive"
}

export type DataTableSelectionBarProps = {
  selection: SelectionDescriptor
  selectedCount: number
  /** Every row on the page is selected and more rows exist beyond it. */
  showSelectAllBanner: boolean
  totalRowCount?: number
  allMatchingSelected: boolean
  onSelectAllMatching?: () => void
  onClear: () => void
  actions: DataTableBulkAction[]
  className?: string
}

const MAX_INLINE_ACTIONS = 2

/**
 * Replaces the header row (same height: `h-10`, matching `TableHead`) the
 * moment any row is selected - the header is useless mid-selection, but
 * actions are exactly what's needed. Sticks along with the rest of the
 * header via the same `--fujin-data-table-offset`.
 */
function DataTableSelectionBar({
  selection,
  selectedCount,
  showSelectAllBanner,
  totalRowCount,
  allMatchingSelected,
  onSelectAllMatching,
  onClear,
  actions,
  className,
}: DataTableSelectionBarProps) {
  const inlineActions = actions.slice(0, MAX_INLINE_ACTIONS)
  const overflowActions = actions.slice(MAX_INLINE_ACTIONS)

  return (
    <div
      data-slot="data-table-selection-bar"
      className={cn(
        "flex h-10 items-center gap-3 border-b bg-accent px-2 text-sm",
        className
      )}
    >
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label="Clear selection"
        onClick={onClear}
      >
        <XIcon />
      </Button>
      <span className="font-medium whitespace-nowrap">
        {selectedCount} selected
      </span>
      {showSelectAllBanner && !allMatchingSelected && onSelectAllMatching ? (
        <button
          type="button"
          onClick={onSelectAllMatching}
          className="rounded-sm text-primary underline-offset-2 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
        >
          Select all {totalRowCount}
        </button>
      ) : null}
      <div className="ml-auto flex items-center gap-1.5">
        {inlineActions.map((action) => (
          <Button
            key={action.label}
            variant="outline"
            size="sm"
            onClick={() => action.onAction(selection)}
            className={
              action.variant === "destructive"
                ? "text-destructive hover:text-destructive"
                : undefined
            }
          >
            {action.icon}
            {action.label}
          </Button>
        ))}
        {overflowActions.length > 0 ? (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="outline"
                  size="icon-sm"
                  aria-label="More actions"
                >
                  <MoreHorizontalIcon />
                </Button>
              }
            />
            <DropdownMenuContent align="end">
              {overflowActions.map((action) => (
                <DropdownMenuItem
                  key={action.label}
                  variant={action.variant}
                  onClick={() => action.onAction(selection)}
                >
                  {action.icon}
                  {action.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}
      </div>
    </div>
  )
}

export { DataTableSelectionBar }
