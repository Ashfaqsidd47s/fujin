import { Button } from "@/registry/fujin/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  type SheetContentProps,
} from "@/registry/fujin/ui/sheet"

const sides = ["top", "right", "bottom", "left"] as const satisfies Array<
  SheetContentProps["side"]
>

export default function SheetSideDemo() {
  return (
    <div className="grid grid-cols-2 gap-2">
      {sides.map((side) => (
        <Sheet key={side}>
          <SheetTrigger
            render={
              <Button variant="outline" className="capitalize">
                {side}
              </Button>
            }
          />
          <SheetContent side={side}>
            <SheetHeader>
              <SheetTitle className="capitalize">{side} sheet</SheetTitle>
              <SheetDescription>
                Slides in from the {side} edge. Press Esc or click outside to
                close.
              </SheetDescription>
            </SheetHeader>
          </SheetContent>
        </Sheet>
      ))}
    </div>
  )
}
