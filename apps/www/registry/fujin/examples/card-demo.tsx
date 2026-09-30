import { EllipsisIcon } from "lucide-react"

import { Badge } from "@/registry/fujin/ui/badge"
import { Button } from "@/registry/fujin/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/registry/fujin/ui/card"

export default function CardDemo() {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle role="heading" aria-level={3}>
          Revenue
        </CardTitle>
        <CardDescription>Last 30 days, all currencies in USD</CardDescription>
        <CardAction>
          <Button variant="ghost" size="icon-sm" aria-label="Revenue options">
            <EllipsisIcon />
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="flex items-baseline gap-2">
        <span className="text-3xl font-semibold tabular-nums">$48,210</span>
        <Badge variant="success">+12.4%</Badge>
      </CardContent>
      <CardFooter className="border-t">
        <Button variant="outline" size="sm" className="w-full">
          View report
        </Button>
      </CardFooter>
    </Card>
  )
}
