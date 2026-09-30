import { ScrollArea } from "@/registry/fujin/ui/scroll-area"

const swatches = [
  { name: "Primary", className: "bg-primary" },
  { name: "Secondary", className: "bg-secondary" },
  { name: "Accent", className: "bg-accent" },
  { name: "Muted", className: "bg-muted" },
  { name: "Destructive", className: "bg-destructive" },
  { name: "Border", className: "bg-border" },
  { name: "Ring", className: "bg-ring" },
  { name: "Popover", className: "bg-popover" },
]

// No extra <ScrollBar orientation="horizontal" />: both scrollbars are built
// in and only appear on the axis that overflows.
export default function ScrollAreaHorizontalDemo() {
  return (
    <ScrollArea
      className="w-full max-w-96 rounded-md border"
      viewportProps={{ role: "region", "aria-label": "Theme colours" }}
    >
      <ul className="flex w-max gap-4 p-4">
        {swatches.map((swatch) => (
          <li key={swatch.name} className="flex flex-col gap-2">
            <div
              className={`h-24 w-32 rounded-md border ${swatch.className}`}
            />
            <span className="text-xs text-muted-foreground">{swatch.name}</span>
          </li>
        ))}
      </ul>
    </ScrollArea>
  )
}
