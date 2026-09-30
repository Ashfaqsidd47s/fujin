"use client"

import { Progress as ProgressPrimitive } from "@base-ui/react/progress"

import { cn } from "@/registry/fujin/lib/utils"

/*
 * `Progress` renders the track and indicator for you; put `ProgressLabel`
 * and `ProgressValue` inside it as children. Base UI links `ProgressLabel` to
 * the bar with `aria-labelledby` - without one, pass `aria-label`, or the
 * progressbar has no accessible name.
 *
 * `value={null}` is indeterminate: a sliding bar driven by the
 * `progress-indeterminate` keyframes this item adds to your CSS. With
 * reduced motion it becomes a gentle full-width pulse instead.
 */
type ProgressProps = ProgressPrimitive.Root.Props

function Progress({ className, children, ...props }: ProgressProps) {
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      className={cn(
        "flex w-full flex-wrap items-center gap-x-3 gap-y-2",
        className
      )}
      {...props}
    >
      {children}
      <ProgressTrack>
        <ProgressIndicator />
      </ProgressTrack>
    </ProgressPrimitive.Root>
  )
}

type ProgressTrackProps = ProgressPrimitive.Track.Props

function ProgressTrack({ className, ...props }: ProgressTrackProps) {
  return (
    <ProgressPrimitive.Track
      data-slot="progress-track"
      className={cn(
        "relative block h-2 w-full overflow-hidden rounded-full bg-muted",
        className
      )}
      {...props}
    />
  )
}

type ProgressIndicatorProps = ProgressPrimitive.Indicator.Props

function ProgressIndicator({ className, ...props }: ProgressIndicatorProps) {
  return (
    <ProgressPrimitive.Indicator
      data-slot="progress-indicator"
      className={cn(
        "block h-full rounded-full bg-primary transition-[width] duration-500 ease-out motion-reduce:transition-none",
        "data-[indeterminate]:w-1/3 data-[indeterminate]:animate-[progress-indeterminate_1.5s_ease-in-out_infinite]",
        "motion-reduce:data-[indeterminate]:w-full motion-reduce:data-[indeterminate]:animate-pulse",
        className
      )}
      {...props}
    />
  )
}

type ProgressLabelProps = ProgressPrimitive.Label.Props

function ProgressLabel({ className, ...props }: ProgressLabelProps) {
  return (
    <ProgressPrimitive.Label
      data-slot="progress-label"
      className={cn("text-sm font-medium", className)}
      {...props}
    />
  )
}

type ProgressValueProps = ProgressPrimitive.Value.Props

/**
 * Shows the formatted value (a percentage unless `format` is set on
 * `Progress`). Renders nothing while indeterminate.
 */
function ProgressValue({ className, ...props }: ProgressValueProps) {
  return (
    <ProgressPrimitive.Value
      data-slot="progress-value"
      className={cn(
        "ml-auto text-sm text-muted-foreground tabular-nums",
        className
      )}
      {...props}
    />
  )
}

export {
  Progress,
  ProgressTrack,
  ProgressIndicator,
  ProgressLabel,
  ProgressValue,
  type ProgressProps,
  type ProgressTrackProps,
  type ProgressIndicatorProps,
  type ProgressLabelProps,
  type ProgressValueProps,
}
