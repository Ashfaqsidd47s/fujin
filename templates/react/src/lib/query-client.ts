import { QueryClient } from "@tanstack/react-query"

import { ApiError } from "@/lib/api"

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        refetchOnWindowFocus: false,
        // Retrying a 4xx never helps; retry network and server errors twice.
        retry: (failureCount, error) =>
          !(error instanceof ApiError && error.status < 500) &&
          failureCount < 2,
      },
    },
  })
}
