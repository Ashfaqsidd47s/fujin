"use client"

import { BoldIcon, BookmarkIcon, ItalicIcon } from "lucide-react"

import { Toggle } from "@/registry/fujin/ui/toggle"

export default function ToggleDemo() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Toggle aria-label="Bold" defaultPressed>
        <BoldIcon />
      </Toggle>
      <Toggle aria-label="Italic" size="sm">
        <ItalicIcon />
      </Toggle>
      <Toggle variant="outline">
        <BookmarkIcon />
        Bookmark
      </Toggle>
    </div>
  )
}
