import { GITHUB_REPOSITORY, SITE_URL } from "@fujin/schema"

/**
 * Set NEXT_PUBLIC_SITE_URL when deploying to a domain other than the default
 * (preview deployments, staging, self-hosting).
 */
const url = (process.env.NEXT_PUBLIC_SITE_URL ?? SITE_URL).replace(/\/+$/, "")

export const siteConfig = {
  name: "Fujin",
  url,
  registryUrl: `${url}/r`,
  description:
    "Production-ready React components you own. Full data tables, full forms, full features - not primitives you have to assemble.",
  tagline: "Components that are already finished.",
  links: {
    github: `https://github.com/${GITHUB_REPOSITORY}`,
  },
} as const

export type SiteConfig = typeof siteConfig
