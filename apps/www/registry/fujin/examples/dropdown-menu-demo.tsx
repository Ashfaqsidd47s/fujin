"use client"

import * as React from "react"

import { Button } from "@/registry/fujin/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/registry/fujin/ui/dropdown-menu"

export default function DropdownMenuDemo() {
  const [showEmail, setShowEmail] = React.useState(true)
  const [showStatus, setShowStatus] = React.useState(true)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="outline">Columns</Button>}
      />
      <DropdownMenuContent align="start">
        <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
        <DropdownMenuCheckboxItem
          checked={showEmail}
          onCheckedChange={setShowEmail}
        >
          Email
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={showStatus}
          onCheckedChange={setShowStatus}
        >
          Status
        </DropdownMenuCheckboxItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive">
          Reset to default
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
