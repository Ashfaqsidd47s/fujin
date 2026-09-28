"use client"

import type { RowData } from "@tanstack/react-table"
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react"

import type { DataTableInstance } from "@/registry/fujin/lib/data-table/use-data-table"
import { Button } from "@/registry/fujin/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/registry/fujin/ui/dropdown-menu"

export type DataTablePaginationProps<TData extends RowData> = {
  table: DataTableInstance<TData>
  pageSizeOptions?: readonly number[]
}

function DataTablePagination<TData extends RowData>({
  table,
  pageSizeOptions = [10, 20, 50, 100],
}: DataTablePaginationProps<TData>) {
  const { pageIndex, pageSize } = table.pagination
  const { rowCount } = table
  const pageCount = Math.max(Math.ceil(rowCount / pageSize), 1)
  const from = rowCount === 0 ? 0 : pageIndex * pageSize + 1
  const to = Math.min((pageIndex + 1) * pageSize, rowCount)
  const go = (index: number) =>
    table.setPagination({ pageIndex: index, pageSize })

  return (
    <nav
      aria-label="Pagination"
      data-slot="data-table-pagination"
      className="flex flex-wrap items-center justify-between gap-3 border-t px-3 py-2 text-sm text-muted-foreground"
    >
      <div className="flex items-center gap-2">
        <span aria-hidden>Rows per page</span>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="outline"
                size="sm"
                aria-label={`Rows per page: ${pageSize}`}
              />
            }
          >
            {pageSize}
            <ChevronDownIcon aria-hidden />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuRadioGroup
              value={pageSize}
              onValueChange={(size) =>
                table.setPagination({ pageIndex: 0, pageSize: Number(size) })
              }
            >
              {pageSizeOptions.map((size) => (
                <DropdownMenuRadioItem key={size} value={size} closeOnClick>
                  {size}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <span className="tabular-nums">
        {rowCount === 0 ? "No results" : `${from}–${to} of ${rowCount}`}
      </span>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon-sm"
          aria-label="Previous page"
          disabled={pageIndex === 0}
          onClick={() => go(pageIndex - 1)}
        >
          <ChevronLeftIcon aria-hidden />
        </Button>
        <span className="px-1 tabular-nums">
          Page {pageIndex + 1} of {pageCount}
        </span>
        <Button
          variant="outline"
          size="icon-sm"
          aria-label="Next page"
          disabled={pageIndex >= pageCount - 1}
          onClick={() => go(pageIndex + 1)}
        >
          <ChevronRightIcon aria-hidden />
        </Button>
      </div>
    </nav>
  )
}

export { DataTablePagination }
