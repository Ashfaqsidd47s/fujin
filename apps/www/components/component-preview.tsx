import { Tab, Tabs } from "fumadocs-ui/components/tabs"

import { cn } from "@/lib/utils"
import { ComponentPreviewRenderer } from "@/components/component-preview-client"
import { ComponentSource } from "@/components/component-source"

export function ComponentPreview({
  name,
  align = "center",
  className,
}: {
  name: string
  align?: "center" | "start" | "end"
  className?: string
}) {
  return (
    <Tabs items={["Preview", "Code"]} className="not-prose my-6">
      <Tab value="Preview" className="p-0">
        <div
          data-align={align}
          className={cn(
            "flex min-h-[280px] w-full justify-center p-10 data-[align=end]:justify-end data-[align=start]:justify-start",
            "items-center",
            className
          )}
        >
          <ComponentPreviewRenderer name={name} />
        </div>
      </Tab>
      <Tab value="Code" className="p-0">
        <ComponentSource name={name} />
      </Tab>
    </Tabs>
  )
}
