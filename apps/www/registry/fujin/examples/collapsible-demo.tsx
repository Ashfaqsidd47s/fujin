import { ChevronsUpDownIcon } from "lucide-react"

import { Button } from "@/registry/fujin/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/registry/fujin/ui/collapsible"

const keys = ["alien-bean-pasta", "wild-irish-burrito", "horse-battery-staple"]

export default function CollapsibleDemo() {
  return (
    <Collapsible className="flex w-72 flex-col gap-2">
      <div className="flex items-center justify-between gap-4">
        <h4 className="text-sm font-medium">Recovery keys</h4>
        <CollapsibleTrigger
          render={
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Show all recovery keys"
            />
          }
        >
          <ChevronsUpDownIcon />
        </CollapsibleTrigger>
      </div>
      <div className="rounded-md border px-4 py-2 font-mono text-sm">
        {keys[0]}
      </div>
      <CollapsibleContent>
        <div className="flex flex-col gap-2">
          {keys.slice(1).map((key) => (
            <div
              key={key}
              className="rounded-md border px-4 py-2 font-mono text-sm"
            >
              {key}
            </div>
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
