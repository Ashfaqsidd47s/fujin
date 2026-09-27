"use client"

import { SlidersHorizontalIcon } from "lucide-react"
import type { ReactTable, RowData } from "@tanstack/react-table"

import type { DataTableFeatures } from "@/registry/fujin/lib/data-table/features"
import { Button } from "@/registry/fujin/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/registry/fujin/ui/dropdown-menu"

export type DataTableColumnVisibilityMenuProps<TData extends RowData> = {
  table: ReactTable<DataTableFeatures, TData>
}

function DataTableColumnVisibilityMenu<TData extends RowData>({
  table,
}: DataTableColumnVisibilityMenuProps<TData>) {
  const columns = table
    .getAllLeafColumns()
    .filter((column) => column.getCanHide())

  if (columns.length === 0) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="outline" size="sm">
            <SlidersHorizontalIcon />
            Columns
          </Button>
        }
      />
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
        {columns.map((column) => (
          <DropdownMenuCheckboxItem
            key={column.id}
            checked={column.getIsVisible()}
            onCheckedChange={(checked) => column.toggleVisibility(checked)}
          >
            {column.columnDef.meta?.label ?? column.id}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export { DataTableColumnVisibilityMenu }
