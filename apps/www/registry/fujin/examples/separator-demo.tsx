import { Separator } from "@/registry/fujin/ui/separator"

export default function SeparatorDemo() {
  return (
    <div>
      <div className="space-y-1">
        <h4 className="text-sm font-medium">Fujin</h4>
        <p className="text-sm text-muted-foreground">
          A shadcn-compatible component registry.
        </p>
      </div>
      <Separator className="my-4" />
      <div className="flex h-5 items-center gap-4 text-sm">
        <span>Docs</span>
        <Separator orientation="vertical" />
        <span>Registry</span>
        <Separator orientation="vertical" />
        <span>MCP</span>
      </div>
    </div>
  )
}
