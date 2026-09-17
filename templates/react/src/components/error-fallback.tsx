import type { FallbackProps } from "react-error-boundary"

import { Button } from "@/components/ui/button"

export function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <main
      role="alert"
      className="mx-auto flex min-h-svh max-w-md flex-col items-start justify-center gap-4 p-6"
    >
      <h1 className="text-xl font-semibold">Something went wrong</h1>
      <p className="text-sm text-muted-foreground">
        {error instanceof Error ? error.message : "Please try again."}
      </p>
      <Button onClick={resetErrorBoundary}>Try again</Button>
    </main>
  )
}
