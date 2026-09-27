import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared"

import { siteConfig } from "@/lib/site"

export const baseOptions: BaseLayoutProps = {
  nav: {
    title: (
      <span className="inline-flex items-center gap-2 font-semibold tracking-tight">
        <span
          aria-hidden
          className="inline-flex size-5 items-center justify-center rounded-[5px] bg-primary text-[11px] font-bold text-primary-foreground"
        >
          F
        </span>
        {siteConfig.name}
      </span>
    ),
    transparentMode: "top",
  },
  githubUrl: siteConfig.links.github,
  links: [
    { text: "Docs", url: "/docs", active: "nested-url" },
    {
      text: "Components",
      url: "/docs/components/button",
      active: "nested-url",
    },
    { text: "Recipes", url: "/docs/recipes", active: "nested-url" },
  ],
}
