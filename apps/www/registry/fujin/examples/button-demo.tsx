"use client"

import * as React from "react"
import { ArrowRightIcon, TrashIcon } from "lucide-react"

import { Button } from "@/registry/fujin/ui/button"

export default function ButtonDemo() {
  const [saving, setSaving] = React.useState(false)

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        loading={saving}
        loadingText="Saving..."
        onClick={() => {
          setSaving(true)
          setTimeout(() => setSaving(false), 1500)
        }}
      >
        Save changes
      </Button>
      <Button variant="outline">
        Continue <ArrowRightIcon />
      </Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="destructive" size="icon" aria-label="Delete">
        <TrashIcon />
      </Button>
    </div>
  )
}
