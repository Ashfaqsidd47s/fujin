import { Badge } from "@/registry/fujin/ui/badge"

export default function BadgeDemo() {
  return (
    <div className="flex flex-wrap gap-2">
      <Badge>Default</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="destructive">Overdue</Badge>
      <Badge variant="success">Paid</Badge>
      <Badge variant="warning">Pending</Badge>
      <Badge variant="info">Draft</Badge>
      <Badge variant="outline">Outline</Badge>
    </div>
  )
}
