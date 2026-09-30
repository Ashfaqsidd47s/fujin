import { ScrollArea } from "@/registry/fujin/ui/scroll-area"
import { Separator } from "@/registry/fujin/ui/separator"

const releases = Array.from({ length: 40 }, (_, index) => `v1.${40 - index}.0`)

export default function ScrollAreaDemo() {
  return (
    <ScrollArea
      className="h-72 w-48 rounded-md border"
      viewportProps={{ role: "region", "aria-label": "Releases" }}
    >
      <div className="p-4">
        <h4 className="mb-4 text-sm leading-none font-medium">Releases</h4>
        {releases.map((release) => (
          <div key={release}>
            <div className="text-sm">{release}</div>
            <Separator className="my-2" />
          </div>
        ))}
      </div>
    </ScrollArea>
  )
}
