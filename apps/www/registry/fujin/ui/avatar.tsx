"use client"

import type * as React from "react"
import { Avatar as AvatarPrimitive } from "@base-ui/react/avatar"

import { cn } from "@/registry/fujin/lib/utils"

/*
 * Sizes live on the root (`data-size`) so the image, the fallback text and
 * the "+N" count inside an `AvatarGroup` all follow one prop.
 *
 * Base UI keeps the image `aria-hidden` until it has loaded and only shows
 * the fallback when it has not, so the accessible text is whichever one is
 * on screen: give the image an `alt`, and make the fallback say the same.
 */
type AvatarProps = AvatarPrimitive.Root.Props & {
  size?: "sm" | "default" | "lg"
}

function Avatar({ className, size = "default", ...props }: AvatarProps) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      data-size={size}
      className={cn(
        "group/avatar relative inline-flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted align-middle text-sm text-foreground select-none",
        "data-[size=sm]:size-6 data-[size=sm]:text-xs",
        "data-[size=lg]:size-10 data-[size=lg]:text-base",
        className
      )}
      {...props}
    />
  )
}

type AvatarImageProps = AvatarPrimitive.Image.Props

function AvatarImage({ className, ...props }: AvatarImageProps) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn("aspect-square size-full object-cover", className)}
      {...props}
    />
  )
}

type AvatarFallbackProps = AvatarPrimitive.Fallback.Props

/**
 * Pass `delay` (ms) to avoid flashing initials while a fast image loads.
 */
function AvatarFallback({ className, ...props }: AvatarFallbackProps) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        "flex size-full items-center justify-center rounded-full bg-muted leading-none font-medium text-foreground [&_svg:not([class*='size-'])]:size-1/2",
        className
      )}
      {...props}
    />
  )
}

type AvatarGroupProps = React.ComponentProps<"div">

/**
 * Overlapping stack. Each avatar gets a `background`-coloured ring so the
 * overlap reads as a cut-out. Set the same `size` on each `Avatar`;
 * `AvatarGroupCount` picks it up from them.
 */
function AvatarGroup({ className, ...props }: AvatarGroupProps) {
  return (
    <div
      data-slot="avatar-group"
      className={cn(
        "group/avatar-group flex -space-x-2 *:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:ring-background",
        className
      )}
      {...props}
    />
  )
}

type AvatarGroupCountProps = React.ComponentProps<"span">

/** The "+3" bubble at the end of an `AvatarGroup`. */
function AvatarGroupCount({ className, ...props }: AvatarGroupCountProps) {
  return (
    <span
      data-slot="avatar-group-count"
      className={cn(
        "relative inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-medium text-foreground ring-2 ring-background select-none",
        "group-has-[[data-slot=avatar][data-size=sm]]/avatar-group:size-6 group-has-[[data-slot=avatar][data-size=sm]]/avatar-group:text-xs",
        "group-has-[[data-slot=avatar][data-size=lg]]/avatar-group:size-10",
        "[&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    />
  )
}

export {
  Avatar,
  AvatarImage,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  type AvatarProps,
  type AvatarImageProps,
  type AvatarFallbackProps,
  type AvatarGroupProps,
  type AvatarGroupCountProps,
}
