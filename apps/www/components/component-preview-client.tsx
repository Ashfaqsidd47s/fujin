"use client"

import * as React from "react"

import { Index } from "@/registry/__index__"

export function ComponentPreviewRenderer({ name }: { name: string }) {
  const Component = Index[name]?.component

  if (!Component) {
    return (
      <p className="text-sm text-muted-foreground">
        Preview <code>{name}</code> not found. Run{" "}
        <code>pnpm registry:build</code>.
      </p>
    )
  }

  return (
    <React.Suspense
      fallback={<div className="text-sm text-muted-foreground">Loading...</div>}
    >
      <Component />
    </React.Suspense>
  )
}
