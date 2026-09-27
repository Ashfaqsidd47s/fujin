"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  React.useEffect(() => {
    // Report to your error tracker here.
    console.error(error)
  }, [error])

  return (
    <main className="mx-auto flex min-h-svh max-w-md flex-col items-start justify-center gap-4 p-6">
      <h1 className="text-xl font-semibold">Something went wrong</h1>
      <p className="text-sm text-muted-foreground">
        {error.digest ? `Reference: ${error.digest}` : "Please try again."}
      </p>
      <Button onClick={reset}>Try again</Button>
    </main>
  )
}
