import { ReceiptIcon, UploadIcon } from "lucide-react"

import { Button } from "@/registry/fujin/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/registry/fujin/ui/empty"

export default function EmptyDemo() {
  return (
    <Empty className="border">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <ReceiptIcon />
        </EmptyMedia>
        <EmptyTitle>No invoices yet</EmptyTitle>
        <EmptyDescription>
          Create your first invoice or import existing ones from a CSV file.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <div className="flex gap-2">
          <Button>Create invoice</Button>
          <Button variant="outline">
            <UploadIcon />
            Import CSV
          </Button>
        </div>
        <EmptyDescription>
          Need help? <a href="#">Read the invoicing guide</a>.
        </EmptyDescription>
      </EmptyContent>
    </Empty>
  )
}
