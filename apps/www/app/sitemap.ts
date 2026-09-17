import type { MetadataRoute } from "next"

import { siteConfig } from "@/lib/site"
import { source } from "@/lib/source"

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: siteConfig.url, changeFrequency: "weekly", priority: 1 },
    ...source.getPages().map((page) => ({
      url: `${siteConfig.url}${page.url}`,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ]
}
