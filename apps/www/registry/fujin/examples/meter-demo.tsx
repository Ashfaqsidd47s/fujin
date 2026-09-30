"use client"

import { Meter, MeterLabel, MeterValue } from "@/registry/fujin/ui/meter"

export default function MeterDemo() {
  return (
    <div className="grid w-full max-w-sm gap-8">
      <Meter
        value={32.4}
        max={50}
        // MeterValue is aria-hidden; keep the announced text identical.
        getAriaValueText={(_, value) => `${value} of 50 GB`}
      >
        <MeterLabel>Storage used</MeterLabel>
        <MeterValue>{(_, value) => `${value} of 50 GB`}</MeterValue>
      </Meter>
      <Meter value={92}>
        <MeterLabel>API quota this month</MeterLabel>
        <MeterValue />
      </Meter>
    </div>
  )
}
