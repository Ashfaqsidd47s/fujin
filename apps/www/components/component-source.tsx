import { DynamicCodeBlock } from "fumadocs-ui/components/dynamic-codeblock"

import { getRegistryFileSource, getRegistryItem } from "@/lib/registry"

export async function ComponentSource({
  name,
  fileIndex = 0,
  title,
}: {
  name: string
  fileIndex?: number
  title?: string
}) {
  const source = await getRegistryFileSource(name, fileIndex)
  if (source === null) {
    return <p className="text-destructive">Unknown registry item: {name}</p>
  }

  const file = getRegistryItem(name)?.files?.[fileIndex]
  const lang = file?.path.endsWith(".ts") ? "ts" : "tsx"

  return (
    <DynamicCodeBlock
      lang={lang}
      code={source}
      codeblock={{ title: title ?? file?.path.split("/").pop() }}
    />
  )
}
