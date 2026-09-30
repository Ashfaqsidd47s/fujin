"use client"

import * as React from "react"

import {
  OtpVerifyCard,
  type OtpVerifyCardAnimation,
} from "@/registry/fujin/blocks/otp-verify-card/otp-verify-card"
import { Button } from "@/registry/fujin/ui/button"

const VARIANTS: OtpVerifyCardAnimation["variant"][] = [
  "orbit",
  "flip",
  "spin",
  "wave",
  "pulse",
]
const LENGTHS = [4, 6, 8]
const MODES = ["auto", "manual"] as const
const DELAYS = [300, 1500, 4000]

const wait = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms))

function Segmented<T extends string | number>({
  label,
  options,
  value,
  onChange,
  format = String,
}: {
  label: string
  options: readonly T[]
  value: T
  onChange: (value: T) => void
  format?: (value: T) => string
}) {
  return (
    <div role="group" aria-label={label} className="flex items-center gap-2">
      <span className="w-20 shrink-0 text-xs text-muted-foreground">
        {label}
      </span>
      <div className="flex flex-wrap gap-1">
        {options.map((option) => (
          <Button
            key={option}
            size="xs"
            variant={option === value ? "default" : "outline"}
            aria-pressed={option === value}
            onClick={() => onChange(option)}
          >
            {format(option)}
          </Button>
        ))}
      </div>
    </div>
  )
}

export default function OtpVerifyCardDemo() {
  const [variant, setVariant] =
    React.useState<OtpVerifyCardAnimation["variant"]>("orbit")
  const [length, setLength] = React.useState(6)
  const [mode, setMode] = React.useState<(typeof MODES)[number]>("auto")
  const [delay, setDelay] = React.useState(1500)
  const [attempt, setAttempt] = React.useState(0)

  // Any code of ascending digits (1234, 123456, …) passes; the rest fail.
  const correct = "12345678".slice(0, length)

  return (
    <div className="flex w-full flex-col items-center gap-6">
      <OtpVerifyCard
        key={`${variant}-${length}-${mode}-${attempt}`}
        length={length}
        submitMode={mode}
        groupSize={length === 8 ? 4 : length === 6 ? 3 : 0}
        animation={{ variant }}
        onVerify={async (code) => {
          await wait(delay)
          return code === correct
            ? true
            : { ok: false, message: `Wrong code - try ${correct}.` }
        }}
        onResend={() => wait(600)}
        resendCooldown={15}
        footer={
          <Button
            variant="ghost"
            size="xs"
            onClick={() => setAttempt((n) => n + 1)}
          >
            Start over
          </Button>
        }
      />
      <div className="flex w-full max-w-sm flex-col gap-2 rounded-lg border border-dashed p-3">
        <Segmented
          label="Animation"
          options={VARIANTS}
          value={variant}
          onChange={setVariant}
        />
        <Segmented
          label="Length"
          options={LENGTHS}
          value={length}
          onChange={setLength}
        />
        <Segmented
          label="Submit"
          options={MODES}
          value={mode}
          onChange={setMode}
        />
        <Segmented
          label="Server"
          options={DELAYS}
          value={delay}
          onChange={setDelay}
          format={(ms) => `${ms / 1000}s`}
        />
        <p className="text-xs text-muted-foreground">
          Correct code: <code>{correct}</code>. Even a 0.3s server gets one full
          rotation.
        </p>
      </div>
    </div>
  )
}
