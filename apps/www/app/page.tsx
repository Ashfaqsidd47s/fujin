import Link from "next/link"
import { HomeLayout } from "fumadocs-ui/layouts/home"

import { baseOptions } from "@/app/layout.config"
import { siteConfig } from "@/lib/site"

const pillars = [
  {
    title: "Finished, not assembled",
    body: "A data table with server-side pagination, faceted filters, URL state and export. Forms with real ARIA wiring. Auth with every screen, not just the login card.",
  },
  {
    title: "Logic and looks, separated",
    body: "Behaviour lives in headless hooks under lib/. Markup lives in components/. Restyle freely - the behaviour keeps working.",
  },
  {
    title: "Recipes install features",
    body: "One command adds routes, server actions, schemas and screens for a whole feature, wired and typed.",
  },
  {
    title: "Built for agents",
    body: "Every item ships structured metadata over MCP, so an agent learns a component in a few hundred tokens instead of reading its source.",
  },
]

export default function HomePage() {
  return (
    <HomeLayout {...baseOptions}>
      <main className="container mx-auto flex max-w-5xl flex-1 flex-col gap-16 px-4 py-20 md:py-28">
        <section className="flex flex-col items-start gap-6">
          <span className="rounded-full border px-3 py-1 text-xs text-muted-foreground">
            Base UI · Tailwind v4 · React 19 · shadcn-compatible registry
          </span>
          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-balance md:text-6xl">
            {siteConfig.tagline}
          </h1>
          <p className="max-w-2xl text-lg text-balance text-muted-foreground">
            {siteConfig.description}
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/docs"
              className="inline-flex h-10 items-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              Get started
            </Link>
            <Link
              href="/docs/components/button"
              className="inline-flex h-10 items-center rounded-md border px-6 text-sm font-medium hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              Browse components
            </Link>
          </div>
          <pre className="rounded-lg border bg-muted/50 px-4 py-3 font-mono text-sm">
            npx @fujin/cli@latest init
          </pre>
        </section>
        <section className="grid gap-4 sm:grid-cols-2">
          {pillars.map((pillar) => (
            <div key={pillar.title} className="rounded-xl border p-6">
              <h2 className="font-semibold">{pillar.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {pillar.body}
              </p>
            </div>
          ))}
        </section>
      </main>
    </HomeLayout>
  )
}
