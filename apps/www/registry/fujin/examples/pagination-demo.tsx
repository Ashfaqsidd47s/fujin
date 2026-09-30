"use client"

import * as React from "react"

import { PaginationControls } from "@/registry/fujin/ui/pagination"

const PAGE_SIZE = 10
const TOTAL = 243

export default function PaginationDemo() {
  const [page, setPage] = React.useState(1)
  const pageCount = Math.ceil(TOTAL / PAGE_SIZE)
  const from = (page - 1) * PAGE_SIZE + 1
  const to = Math.min(page * PAGE_SIZE, TOTAL)

  return (
    <div className="flex flex-col items-center gap-3">
      <PaginationControls
        aria-label="Invoices pages"
        page={page}
        pageCount={pageCount}
        onPageChange={setPage}
      />
      <p className="text-sm text-muted-foreground" aria-live="polite">
        Showing invoices {from}-{to} of {TOTAL}
      </p>
    </div>
  )
}
