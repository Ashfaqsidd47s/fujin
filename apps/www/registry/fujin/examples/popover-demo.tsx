import { Button } from "@/registry/fujin/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverTitle,
  PopoverTrigger,
} from "@/registry/fujin/ui/popover"

export default function PopoverDemo() {
  return (
    <Popover>
      <PopoverTrigger render={<Button variant="outline">Filters</Button>} />
      <PopoverContent showClose>
        <PopoverTitle>Filters</PopoverTitle>
        <PopoverDescription>
          Narrow the table down before exporting.
        </PopoverDescription>
      </PopoverContent>
    </Popover>
  )
}
