import { DocsLayout } from "fumadocs-ui/layouts/notebook"

import { baseOptions } from "@/app/layout.config"
import { source } from "@/lib/source"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <DocsLayout
      {...baseOptions}
      tree={source.pageTree}
      sidebar={{ defaultOpenLevel: 1 }}
    >
      {children}
    </DocsLayout>
  )
}
