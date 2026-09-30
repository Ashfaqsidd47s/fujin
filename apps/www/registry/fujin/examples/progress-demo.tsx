"use client"

import * as React from "react"

import {
  Progress,
  ProgressLabel,
  ProgressValue,
} from "@/registry/fujin/ui/progress"

export default function ProgressDemo() {
  const [value, setValue] = React.useState(12)

  React.useEffect(() => {
    // Simulated upload: advance until done, then start over.
    const id = window.setInterval(() => {
      setValue((v) => (v >= 100 ? 0 : Math.min(100, v + 11)))
    }, 900)
    return () => window.clearInterval(id)
  }, [])

  return (
    <div className="grid w-full max-w-sm gap-8">
      <Progress value={value}>
        <ProgressLabel>Uploading invoices.csv</ProgressLabel>
        <ProgressValue />
      </Progress>
      <Progress value={null}>
        <ProgressLabel>Preparing export</ProgressLabel>
      </Progress>
    </div>
  )
}
