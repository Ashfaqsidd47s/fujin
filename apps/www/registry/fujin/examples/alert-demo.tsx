import {
  CircleAlertIcon,
  CircleCheckIcon,
  InfoIcon,
  TriangleAlertIcon,
} from "lucide-react"

import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@/registry/fujin/ui/alert"
import { Button } from "@/registry/fujin/ui/button"

export default function AlertDemo() {
  return (
    <div className="grid w-full max-w-xl gap-4">
      <Alert>
        <InfoIcon />
        <AlertTitle>Invoices now sync every 15 minutes</AlertTitle>
        <AlertDescription>
          Changes made in your accounting tool show up here automatically.
        </AlertDescription>
      </Alert>
      <Alert variant="destructive">
        <CircleAlertIcon />
        <AlertTitle>Payment failed</AlertTitle>
        <AlertDescription>
          <p>
            The card ending in 4242 was declined. Update it to keep your plan.
          </p>
        </AlertDescription>
        <AlertAction>
          <Button size="xs" variant="outline">
            Update card
          </Button>
        </AlertAction>
      </Alert>
      <Alert variant="success">
        <CircleCheckIcon />
        <AlertTitle>Export complete</AlertTitle>
        <AlertDescription>
          1,204 rows were written to invoices.csv.
        </AlertDescription>
      </Alert>
      <Alert variant="warning">
        <TriangleAlertIcon />
        <AlertTitle>Warning: 3 days left on your trial</AlertTitle>
        <AlertDescription>
          Add a payment method to avoid losing access to reports.
        </AlertDescription>
      </Alert>
      <Alert variant="info">
        <AlertTitle>Scheduled maintenance</AlertTitle>
        <AlertDescription>
          The API is read-only on Sunday from 02:00 to 03:00 UTC.
        </AlertDescription>
      </Alert>
    </div>
  )
}
