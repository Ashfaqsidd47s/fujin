"use client"

import * as React from "react"

import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
  CommandPopup,
} from "@/registry/fujin/ui/command"

const frameworks = [
  { value: "next", label: "Next.js" },
  { value: "react", label: "React (Vite)" },
  { value: "remix", label: "Remix" },
  { value: "astro", label: "Astro" },
]

export default function CommandDemo() {
  const [value, setValue] = React.useState<(typeof frameworks)[number] | null>(
    null
  )

  return (
    <Command items={frameworks} value={value} onValueChange={setValue}>
      <CommandInput placeholder="Search frameworks..." />
      <CommandPopup>
        <CommandEmpty>No framework found.</CommandEmpty>
        <CommandList>
          {(framework: (typeof frameworks)[number]) => (
            <CommandItem key={framework.value} value={framework}>
              {framework.label}
            </CommandItem>
          )}
        </CommandList>
      </CommandPopup>
    </Command>
  )
}
