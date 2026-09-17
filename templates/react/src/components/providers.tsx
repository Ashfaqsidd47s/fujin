import * as React from "react"
import { QueryClientProvider } from "@tanstack/react-query"
import { ErrorBoundary } from "react-error-boundary"

import { ErrorFallback } from "@/components/error-fallback"
import { ThemeProvider } from "@/components/theme-provider"
import { createQueryClient } from "@/lib/query-client"

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = React.useState(createQueryClient)

  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <ErrorBoundary
          FallbackComponent={ErrorFallback}
          onReset={() => queryClient.resetQueries()}
        >
          {children}
        </ErrorBoundary>
      </QueryClientProvider>
    </ThemeProvider>
  )
}
