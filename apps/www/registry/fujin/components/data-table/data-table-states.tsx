import { AlertCircleIcon, InboxIcon } from "lucide-react"

import { Skeleton } from "@/registry/fujin/ui/skeleton"
import { TableCell, TableRow } from "@/registry/fujin/ui/table"

export type DataTableEmptyStateProps = {
  colSpan: number
  title?: string
  description?: string
}

function DataTableEmptyState({
  colSpan,
  title = "No results",
  description,
}: DataTableEmptyStateProps) {
  return (
    <TableRow className="hover:bg-transparent">
      <TableCell
        colSpan={colSpan}
        className="h-32 text-center whitespace-normal"
      >
        <div className="flex flex-col items-center gap-1 text-muted-foreground">
          <InboxIcon className="size-6" />
          <span className="font-medium text-foreground">{title}</span>
          {description ? <span className="text-sm">{description}</span> : null}
        </div>
      </TableCell>
    </TableRow>
  )
}

export type DataTableErrorStateProps = {
  colSpan: number
  message?: string
  onRetry?: () => void
}

function DataTableErrorState({
  colSpan,
  message = "Something went wrong.",
  onRetry,
}: DataTableErrorStateProps) {
  return (
    <TableRow className="hover:bg-transparent">
      <TableCell
        colSpan={colSpan}
        className="h-32 text-center whitespace-normal"
      >
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <AlertCircleIcon className="size-6 text-destructive" />
          <span className="font-medium text-foreground">{message}</span>
          {onRetry ? (
            <button
              type="button"
              onClick={onRetry}
              className="rounded-sm text-sm text-primary underline-offset-2 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
            >
              Try again
            </button>
          ) : null}
        </div>
      </TableCell>
    </TableRow>
  )
}

export type DataTableLoadingStateProps = {
  colSpan: number
  rows?: number
}

function DataTableLoadingState({
  colSpan,
  rows = 5,
}: DataTableLoadingStateProps) {
  return (
    <>
      <TableRow className="sr-only hover:bg-transparent" aria-live="polite">
        <TableCell colSpan={colSpan} role="status">
          Loading rows
        </TableCell>
      </TableRow>
      {Array.from({ length: rows }).map((_, index) => (
        <TableRow key={index} aria-hidden className="hover:bg-transparent">
          <TableCell colSpan={colSpan}>
            <Skeleton className="h-4 w-full max-w-64" />
          </TableCell>
        </TableRow>
      ))}
    </>
  )
}

export { DataTableEmptyState, DataTableErrorState, DataTableLoadingState }
