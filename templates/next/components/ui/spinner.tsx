import * as React from "react"
import { Loader2Icon } from "lucide-react"

import { cn } from "@/lib/utils"

type SpinnerProps = React.ComponentProps<"span"> & {
  /**
   * Text announced to assistive technology. Always rendered (visually hidden)
   * so the live region is never empty. Pass `null` when the spinner is purely
   * decorative, e.g. inside a button that already sets `aria-busy`.
   */
  label?: string | null
}

function Spinner({ className, label = "Loading", ...props }: SpinnerProps) {
  const decorative = label === null

  return (
    <span
      data-slot="spinner"
      role={decorative ? undefined : "status"}
      aria-hidden={decorative || undefined}
      className={cn("inline-flex items-center justify-center", className)}
      {...props}
    >
      <Loader2Icon
        aria-hidden
        className="size-4 animate-spin motion-reduce:animate-[spin_1.5s_linear_infinite]"
      />
      {decorative ? null : <span className="sr-only">{label}</span>}
    </span>
  )
}

export { Spinner, type SpinnerProps }
