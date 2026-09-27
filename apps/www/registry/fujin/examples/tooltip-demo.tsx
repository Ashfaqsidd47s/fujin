import { TrashIcon } from "lucide-react"

import { Button } from "@/registry/fujin/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/registry/fujin/ui/tooltip"

export default function TooltipDemo() {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger
          render={
            <Button variant="ghost" size="icon" aria-label="Delete row">
              <TrashIcon />
            </Button>
          }
        />
        <TooltipContent>Delete row</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
