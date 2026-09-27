"use client"

import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import type { ReactTable, RowData } from "@tanstack/react-table"

import type { DataTableFeatures } from "@/registry/fujin/lib/data-table/features"
import { Button } from "@/registry/fujin/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/registry/fujin/ui/dropdown-menu"

export type DataTablePaginationProps<TData extends RowData> = {
  table: ReactTable<DataTableFeatures, TData>
  pageSizeOptions?: number[]
}

function DataTablePagination<TData extends RowData>({
  table,
  pageSizeOptions = [10, 20, 50, 100],
}: DataTablePaginationProps<TData>) {
  const { pageIndex, pageSize } = table.state.pagination
  const rowCount = table.getRowCount()
  const pageCount = table.getPageCount()
  const from = rowCount === 0 ? 0 : pageIndex * pageSize + 1
  const to = Math.min((pageIndex + 1) * pageSize, rowCount)

  return (
    <div
      data-slot="data-table-pagination"
      className="flex flex-wrap items-center justify-between gap-3 border-t px-3 py-2 text-sm text-muted-foreground"
    >
      <div className="flex items-center gap-2">
        <span>Rows per page</span>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="outline" size="sm">
                {pageSize}
              </Button>
            }
          />
          <DropdownMenuContent align="start">
            {pageSizeOptions.map((size) => (
              <DropdownMenuItem
                key={size}
                onClick={() => table.setPageSize(size)}
              >
                {size}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <span>{rowCount === 0 ? "No rows" : `${from}-${to} of ${rowCount}`}</span>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon-sm"
          aria-label="Previous page"
          disabled={!table.getCanPreviousPage()}
          onClick={() => table.previousPage()}
        >
          <ChevronLeftIcon />
        </Button>
        <span className="px-1 tabular-nums">
          Page {pageCount === 0 ? 0 : pageIndex + 1} of {pageCount}
        </span>
        <Button
          variant="outline"
          size="icon-sm"
          aria-label="Next page"
          disabled={!table.getCanNextPage()}
          onClick={() => table.nextPage()}
        >
          <ChevronRightIcon />
        </Button>
      </div>
    </div>
  )
}

export { DataTablePagination }
