import type * as React from "react"

import { cn } from "@/registry/fujin/lib/utils"

type SkeletonProps = React.ComponentProps<"div">

function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "animate-pulse rounded-md bg-accent motion-reduce:animate-none",
        className
      )}
      {...props}
    />
  )
}

export { Skeleton, type SkeletonProps }
