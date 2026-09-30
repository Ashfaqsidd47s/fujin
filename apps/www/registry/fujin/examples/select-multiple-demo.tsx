"use client"

import * as React from "react"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/registry/fujin/ui/select"

const channels = [
  { value: "email", label: "Email" },
  { value: "sms", label: "SMS" },
  { value: "push", label: "Push notification" },
  { value: "slack", label: "Slack" },
]

export default function SelectMultipleDemo() {
  const [value, setValue] = React.useState<string[]>(["email"])

  return (
    <Select items={channels} multiple value={value} onValueChange={setValue}>
      <SelectTrigger aria-label="Notification channels" className="w-64">
        <SelectValue placeholder="No channels" />
      </SelectTrigger>
      {/* Multi-select keeps the popup open; a plain dropdown reads better. */}
      <SelectContent alignItemWithTrigger={false}>
        {channels.map((channel) => (
          <SelectItem key={channel.value} value={channel.value}>
            {channel.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
