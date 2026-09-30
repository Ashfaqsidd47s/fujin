import { getPageWindow } from "@/registry/fujin/lib/pagination"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/registry/fujin/ui/pagination"

// Link mode from low-level parts - the shape a Server Component uses, since
// it cannot pass `getHref` to `PaginationControls`. Here the current page is
// fixed; a real page reads it from `searchParams`.
export default function PaginationPartsDemo() {
  const page = 6
  const pageCount = 12
  const href = (to: number) => `?page=${to}`

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious href={href(page - 1)} disabled={page <= 1} />
        </PaginationItem>
        {getPageWindow({ page, pageCount }).map((item, index) =>
          item === "ellipsis" ? (
            <PaginationItem key={`ellipsis-${index}`}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={item}>
              <PaginationLink
                href={href(item)}
                isActive={item === page}
                aria-label={`Page ${item}`}
              >
                {item}
              </PaginationLink>
            </PaginationItem>
          )
        )}
        <PaginationItem>
          <PaginationNext href={href(page + 1)} disabled={page >= pageCount} />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}
