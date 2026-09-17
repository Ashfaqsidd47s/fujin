import { fileURLToPath } from "node:url"
import { createMDX } from "fumadocs-mdx/next"

const withMDX = createMDX()

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
]

/**
 * Registry JSON is fetched by the shadcn CLI, the Fujin CLI/MCP server and
 * browser tools (e.g. "open in v0"), so it is public and cross-origin. It only
 * changes on deploy: cache briefly in browsers, longer at the CDN.
 */
const registryHeaders = [
  { key: "Access-Control-Allow-Origin", value: "*" },
  { key: "Access-Control-Allow-Methods", value: "GET, HEAD, OPTIONS" },
  {
    key: "Cache-Control",
    value: "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400",
  },
]

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  poweredByHeader: false,
  typedRoutes: true,
  // `NEXT_OUTPUT=standalone` builds a self-contained server for Docker.
  output: process.env.NEXT_OUTPUT === "standalone" ? "standalone" : undefined,
  outputFileTracingRoot: fileURLToPath(new URL("../../", import.meta.url)),
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      { source: "/r/:path*", headers: registryHeaders },
      { source: "/schema/:path*", headers: registryHeaders },
    ]
  },
  async rewrites() {
    return [
      // LLM-readable markdown for every docs page: /docs/x.md -> raw markdown.
      { source: "/docs/:path*.md", destination: "/llm/:path*" },
      { source: "/docs.md", destination: "/llm" },
      // Registry index aliases so `@fujin` resolves with or without the suffix.
      { source: "/r/registry", destination: "/r/registry.json" },
    ]
  },
  async redirects() {
    return [
      {
        source: "/docs/components",
        destination: "/docs/components/button",
        permanent: false,
      },
    ]
  },
}

export default withMDX(config)
