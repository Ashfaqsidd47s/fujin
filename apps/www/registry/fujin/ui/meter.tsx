"use client"

import { Meter as MeterPrimitive } from "@base-ui/react/meter"

import { cn } from "@/registry/fujin/lib/utils"

/*
 * A meter is a *measurement* inside a known range - storage used, quota
 * consumed, password strength. It is not progress towards finishing a task;
 * that is `progress`. The difference matters to screen readers: this renders
 * `role="meter"`, `progress` renders `role="progressbar"`.
 *
 * Like `progress`, `Meter` renders the track and indicator for you. Put
 * `MeterLabel` (wired to `aria-labelledby` by Base UI) and `MeterValue`
 * inside it; without a label, pass `aria-label`.
 */
type MeterProps = MeterPrimitive.Root.Props

function Meter({ className, children, ...props }: MeterProps) {
  return (
    <MeterPrimitive.Root
      data-slot="meter"
      className={cn(
        "flex w-full flex-wrap items-center gap-x-3 gap-y-2",
        className
      )}
      {...props}
    >
      {children}
      <MeterTrack>
        <MeterIndicator />
      </MeterTrack>
    </MeterPrimitive.Root>
  )
}

type MeterTrackProps = MeterPrimitive.Track.Props

function MeterTrack({ className, ...props }: MeterTrackProps) {
  return (
    <MeterPrimitive.Track
      data-slot="meter-track"
      className={cn(
        "relative block h-2 w-full overflow-hidden rounded-full bg-muted",
        className
      )}
      {...props}
    />
  )
}

type MeterIndicatorProps = MeterPrimitive.Indicator.Props

function MeterIndicator({ className, ...props }: MeterIndicatorProps) {
  return (
    <MeterPrimitive.Indicator
      data-slot="meter-indicator"
      className={cn(
        "block h-full rounded-full bg-primary transition-[width] duration-500 ease-out motion-reduce:transition-none",
        className
      )}
      {...props}
    />
  )
}

type MeterLabelProps = MeterPrimitive.Label.Props

function MeterLabel({ className, ...props }: MeterLabelProps) {
  return (
    <MeterPrimitive.Label
      data-slot="meter-label"
      className={cn("text-sm font-medium", className)}
      {...props}
    />
  )
}

type MeterValueProps = MeterPrimitive.Value.Props

/**
 * Shows the formatted value - a percentage of the range unless `format` is
 * set on `Meter`. Pass a function child for custom text, e.g.
 * `{(_, value) => `${value} of 50 GB`}`.
 */
function MeterValue({ className, ...props }: MeterValueProps) {
  return (
    <MeterPrimitive.Value
      data-slot="meter-value"
      className={cn(
        "ml-auto text-sm text-muted-foreground tabular-nums",
        className
      )}
      {...props}
    />
  )
}

export {
  Meter,
  MeterTrack,
  MeterIndicator,
  MeterLabel,
  MeterValue,
  type MeterProps,
  type MeterTrackProps,
  type MeterIndicatorProps,
  type MeterLabelProps,
  type MeterValueProps,
}
