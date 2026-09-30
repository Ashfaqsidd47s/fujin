"use client"

import * as React from "react"
import {
  AlignCenterIcon,
  AlignLeftIcon,
  AlignRightIcon,
  BoldIcon,
  ItalicIcon,
  UnderlineIcon,
} from "lucide-react"

import { ToggleGroup, ToggleGroupItem } from "@/registry/fujin/ui/toggle-group"

export default function ToggleGroupDemo() {
  // Base UI always uses an array, even for single selection.
  const [align, setAlign] = React.useState(["left"])

  return (
    <div className="flex flex-col items-start gap-4">
      <ToggleGroup
        aria-label="Text alignment"
        variant="outline"
        value={align}
        // Keep one item pressed: ignore the "unpress the active item" change.
        onValueChange={(next) => {
          if (next.length > 0) setAlign(next)
        }}
      >
        <ToggleGroupItem value="left" aria-label="Align left">
          <AlignLeftIcon />
        </ToggleGroupItem>
        <ToggleGroupItem value="center" aria-label="Align center">
          <AlignCenterIcon />
        </ToggleGroupItem>
        <ToggleGroupItem value="right" aria-label="Align right">
          <AlignRightIcon />
        </ToggleGroupItem>
      </ToggleGroup>

      <ToggleGroup
        aria-label="Text formatting"
        multiple
        spacing={1}
        size="sm"
        defaultValue={["bold"]}
      >
        <ToggleGroupItem value="bold" aria-label="Bold">
          <BoldIcon />
        </ToggleGroupItem>
        <ToggleGroupItem value="italic" aria-label="Italic">
          <ItalicIcon />
        </ToggleGroupItem>
        <ToggleGroupItem value="underline" aria-label="Underline">
          <UnderlineIcon />
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  )
}
