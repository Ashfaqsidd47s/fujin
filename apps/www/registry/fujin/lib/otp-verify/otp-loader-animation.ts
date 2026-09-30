/**
 * The motion engine behind `otp-verify-card`: turns the OTP slots themselves
 * into a loading indicator while a code is being verified.
 *
 * Everything runs on the Web Animations API, so the component ships no
 * keyframes CSS and every timing value is a plain option. Two guarantees the
 * API makes easy and CSS animations make hard:
 *
 * 1. **At least `minRotations` full rotations**, however fast the server
 *    answers. `stop()` never cuts a rotation short: it lets the current one
 *    finish (or runs more until the minimum is met) and only then settles.
 * 2. **No visual jump between phases.** The orbit's enter and exit keyframes
 *    are sampled from motion curves whose angular velocity matches the
 *    constant-speed orbit at the hand-off, so the slots accelerate into the
 *    ring and glide back out of it.
 *
 * No classNames live here - the engine only writes `transform`, `opacity` and
 * `padding` through animations it owns and removes when it is done.
 */

export type OtpLoaderVariant = "orbit" | "flip" | "spin" | "wave" | "pulse"

export type OtpLoaderOptions = {
  /**
   * - `orbit`: slots spiral out of the row into a ring, orbit, and glide back.
   * - `flip`: each slot turns 360° around its vertical axis, staggered.
   * - `spin`: each slot turns 360° in place, dipping in scale, staggered.
   * - `wave`: each slot hops and rolls, staggered.
   * - `pulse`: opacity only - the reduced-motion fallback.
   */
  variant: OtpLoaderVariant
  /** Milliseconds for one full rotation (one loop for `pulse`). */
  duration: number
  /** Rotations that always complete, even if verification resolves sooner. */
  minRotations: number
  /** Delay between neighbouring slots for `flip`/`spin`/`wave`/`pulse`. */
  stagger: number
  /** Easing of each rotation for `flip`/`spin`/`wave`/`pulse`. The orbit is always linear. */
  easing: string
  /** `orbit` only: milliseconds to spiral from the row into the ring. */
  enterDuration: number
  /** `orbit` only: milliseconds to glide from the ring back into the row. */
  exitDuration: number
  /** `orbit` only: ring radius in px, or `"auto"` to fit the slots snugly. */
  radius: number | "auto"
  /** `orbit` only: slot scale while in the ring. */
  orbitScale: number
  /** `orbit` only: 1 for clockwise, -1 for counter-clockwise. */
  direction: 1 | -1
  /**
   * `"user"` swaps any variant for `pulse` when the OS asks for reduced
   * motion; `"always"` forces `pulse`; `"never"` ignores the preference.
   */
  reducedMotion: "user" | "always" | "never"
}

export const defaultOtpLoaderOptions: OtpLoaderOptions = {
  variant: "orbit",
  duration: 1100,
  minRotations: 1,
  stagger: 90,
  easing: "cubic-bezier(0.65, 0, 0.35, 1)",
  enterDuration: 650,
  exitDuration: 600,
  radius: "auto",
  orbitScale: 0.82,
  direction: 1,
  reducedMotion: "user",
}

export type OtpLoader = {
  /**
   * Lets the current rotation finish (and more, until `minRotations` is
   * met), plays the exit, and resolves once the slots are back at rest.
   */
  stop: () => Promise<void>
  /** Removes every animation immediately. Safe to call more than once. */
  cancel: () => void
}

type Transform = { x: number; angle: number; radius: number; scale: number }

// Enough samples that linear interpolation between them reads as a curve.
const SAMPLES = 40
const EASE_IN_OUT = "cubic-bezier(0.65, 0, 0.35, 1)"

const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2

/*
 * `rotate(a) translateY(-r) rotate(-a)` places a box on a circle at angle
 * `a` while keeping it upright, and it interpolates as a true arc because
 * every function in the list keeps its shape across keyframes.
 */
function toTransform({ x, angle, radius, scale }: Transform) {
  return `translateX(${x}px) rotate(${angle}deg) translateY(${-radius}px) rotate(${-angle}deg) scale(${scale})`
}

function sampled(fn: (t: number) => Transform): Keyframe[] {
  return Array.from({ length: SAMPLES + 1 }, (_, index) => {
    const t = index / SAMPLES
    return { offset: t, transform: toTransform(fn(t)) }
  })
}

export function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  )
}

function resolveVariant(options: OtpLoaderOptions): OtpLoaderVariant {
  if (options.reducedMotion === "always") return "pulse"
  if (options.reducedMotion === "user" && prefersReducedMotion()) return "pulse"
  return options.variant
}

function canAnimate(element: Element | undefined): element is HTMLElement {
  return !!element && typeof (element as HTMLElement).animate === "function"
}

function settled(animation: Animation) {
  // `finished` rejects when an animation is cancelled; that is not an error here.
  return animation.finished.then(
    () => undefined,
    () => undefined
  )
}

/**
 * Asks each looping animation to end at the next iteration boundary that
 * satisfies `minRotations`, then waits for all of them.
 */
async function finishLoops(loops: Animation[], minRotations: number) {
  for (const animation of loops) {
    const current = animation.effect?.getComputedTiming().currentIteration
    animation.effect?.updateTiming({
      iterations: Math.max(minRotations, (current ?? 0) + 1),
    })
  }
  await Promise.all(loops.map(settled))
}

function keyframesFor(variant: Exclude<OtpLoaderVariant, "orbit">) {
  switch (variant) {
    case "flip":
      return [
        { transform: "perspective(480px) rotateY(0deg)" },
        { transform: "perspective(480px) rotateY(360deg)" },
      ]
    case "spin":
      return [
        { transform: "rotate(0deg) scale(1)" },
        { transform: "rotate(180deg) scale(0.78)" },
        { transform: "rotate(360deg) scale(1)" },
      ]
    case "wave":
      return [
        { transform: "translateY(0%) rotate(0deg)" },
        { transform: "translateY(-45%) rotate(180deg)" },
        { transform: "translateY(0%) rotate(360deg)" },
      ]
    case "pulse":
      return [{ opacity: 1 }, { opacity: 0.35 }, { opacity: 1 }]
  }
}

function startInPlace(
  slots: HTMLElement[],
  variant: Exclude<OtpLoaderVariant, "orbit">,
  options: OtpLoaderOptions
): OtpLoader {
  const keyframes = keyframesFor(variant)
  const loops = slots.map((slot, index) =>
    slot.animate(keyframes, {
      duration: options.duration,
      delay: index * options.stagger,
      easing: options.easing,
      iterations: Infinity,
      fill: "both",
    })
  )

  let cancelled = false
  const cancel = () => {
    cancelled = true
    loops.forEach((animation) => animation.cancel())
  }

  return {
    cancel,
    async stop() {
      // A cancelled animation's `finished` never settles again; don't wait on it.
      if (cancelled) return
      await finishLoops(loops, options.minRotations)
      // Every variant ends on its identity frame, so removing it is invisible.
      cancel()
    },
  }
}

function startOrbit(
  stage: HTMLElement,
  slots: HTMLElement[],
  options: OtpLoaderOptions
): OtpLoader {
  const count = slots.length
  const stageRect = stage.getBoundingClientRect()
  const centerX = stageRect.left + stageRect.width / 2
  const rects = slots.map((slot) => slot.getBoundingClientRect())
  const slotSize = Math.max(
    ...rects.map((rect) => Math.max(rect.width, rect.height))
  )
  const scaled = slotSize * options.orbitScale

  // Fit the ring so neighbouring slots keep a small gap.
  const radius =
    options.radius === "auto"
      ? Math.max(
          scaled * 0.9,
          (scaled + 10) / (2 * Math.sin(Math.PI / Math.max(count, 2)))
        )
      : options.radius

  const direction = options.direction
  // Degrees per millisecond while orbiting.
  const speed = 360 / options.duration
  // Sweep that makes the enter/exit hand-off match the orbit's speed.
  const enterSweep = (speed * options.enterDuration) / 2
  const exitSweep = (speed * options.exitDuration) / 2

  const rows = rects.map((rect, index) => ({
    // Offset from the slot's place in the row to the centre of the stage.
    x: centerX - (rect.left + rect.width / 2),
    angle: (index * 360) / count,
  }))

  // Grow the stage so the ring fits without overlapping neighbouring content.
  const style = getComputedStyle(stage)
  const paddingTop = parseFloat(style.paddingTop) || 0
  const paddingBottom = parseFloat(style.paddingBottom) || 0
  const rowHeight = Math.max(...rects.map((rect) => rect.height))
  const extra = Math.max(0, (2 * radius + scaled + 8 - rowHeight) / 2)
  const collapsed = {
    paddingTop: `${paddingTop}px`,
    paddingBottom: `${paddingBottom}px`,
  }
  const expanded = {
    paddingTop: `${paddingTop + extra}px`,
    paddingBottom: `${paddingBottom + extra}px`,
  }

  const toRing = (index: number) =>
    sampled((t) => {
      const { x, angle } = rows[index]!
      const eased = easeInOutCubic(t)
      return {
        x: x * eased,
        // Starts at rest, reaches orbit speed exactly as it joins the ring.
        angle: direction * (angle - enterSweep + enterSweep * t * t),
        radius: radius * eased,
        scale: 1 + (options.orbitScale - 1) * eased,
      }
    })

  const toRow = (index: number) =>
    sampled((t) => {
      const { x, angle } = rows[index]!
      const eased = 1 - easeInOutCubic(t)
      return {
        x: x * eased,
        // Leaves the ring at orbit speed and eases to a stop.
        angle: direction * (angle + exitSweep * (2 * t - t * t)),
        radius: radius * eased,
        scale: 1 + (options.orbitScale - 1) * eased,
      }
    })

  const around = (index: number) => {
    const { x, angle } = rows[index]!
    const at = (degrees: number) =>
      toTransform({
        x,
        angle: direction * degrees,
        radius,
        scale: options.orbitScale,
      })
    return [{ transform: at(angle) }, { transform: at(angle + 360) }]
  }

  /*
   * Every phase is scheduled up front on the same timeline, with `delay`
   * doing the hand-offs. Starting the next phase from a `finished` callback
   * instead would repeat a frame at each seam.
   */
  const animations: Animation[] = [
    stage.animate([collapsed, expanded], {
      duration: options.enterDuration,
      easing: EASE_IN_OUT,
      fill: "forwards",
    }),
    ...slots.map((slot, index) =>
      slot.animate(toRing(index), {
        duration: options.enterDuration,
        easing: "linear",
        fill: "forwards",
      })
    ),
  ]
  const loops = slots.map((slot, index) =>
    slot.animate(around(index), {
      duration: options.duration,
      delay: options.enterDuration,
      easing: "linear",
      iterations: Infinity,
      fill: "forwards",
    })
  )
  animations.push(...loops)

  let cancelled = false
  const cancel = () => {
    cancelled = true
    animations.forEach((animation) => animation.cancel())
    animations.length = 0
  }

  return {
    cancel,
    async stop() {
      if (cancelled) return

      for (const loop of loops) {
        const current = loop.effect?.getComputedTiming().currentIteration
        loop.effect?.updateTiming({
          iterations: Math.max(options.minRotations, (current ?? 0) + 1),
        })
      }
      // All loops share one timing, so one of them says when the ring stops.
      const [first] = loops
      const endTime = Number(first!.effect?.getComputedTiming().endTime ?? 0)
      const startTime = first!.startTime
      /*
       * Pin the exit to the orbit's own start time so it begins on the exact
       * frame the ring stops. A delay relative to "now" would start a frame
       * late, because a new animation waits a frame before it starts.
       */
      const delay =
        startTime === null
          ? Math.max(0, endTime - Number(first!.currentTime ?? 0))
          : endTime

      const exit = [
        stage.animate([expanded, collapsed], {
          duration: options.exitDuration,
          delay,
          easing: EASE_IN_OUT,
          fill: "forwards",
        }),
        ...slots.map((slot, index) =>
          slot.animate(toRow(index), {
            duration: options.exitDuration,
            delay,
            easing: "linear",
            fill: "forwards",
          })
        ),
      ]
      if (startTime !== null) {
        exit.forEach((animation) => (animation.startTime = startTime))
      }
      animations.push(...exit)
      await Promise.all(exit.map(settled))
      // The last frame is the identity transform and the original padding.
      cancel()
    },
  }
}

/**
 * Starts the loader on `slots`, which must be laid out in a single row
 * inside `stage` and vertically centred in it. Returns a no-op loader when
 * the Web Animations API is unavailable (old browsers, jsdom).
 */
export function startOtpLoader(
  stage: HTMLElement | null,
  slots: HTMLElement[],
  options: Partial<OtpLoaderOptions> = {}
): OtpLoader {
  const resolved = { ...defaultOtpLoaderOptions, ...options }
  resolved.minRotations = Math.max(1, Math.floor(resolved.minRotations))

  if (
    !stage ||
    slots.length === 0 ||
    !canAnimate(stage) ||
    !slots.every(canAnimate)
  ) {
    return { stop: () => Promise.resolve(), cancel: () => {} }
  }

  const variant = resolveVariant(resolved)
  return variant === "orbit"
    ? startOrbit(stage, slots, resolved)
    : startInPlace(slots, variant, resolved)
}

/**
 * The flourish after verification settles: a staggered pop on success, a
 * shake of the whole row on error. Reduced motion gets a single soft fade.
 */
export function playOtpFeedback(
  stage: HTMLElement | null,
  slots: HTMLElement[],
  kind: "success" | "error",
  options: Pick<OtpLoaderOptions, "reducedMotion"> = defaultOtpLoaderOptions
): Promise<void> {
  if (!stage || !canAnimate(stage) || !slots.every(canAnimate)) {
    return Promise.resolve()
  }

  const reduce =
    options.reducedMotion === "always" ||
    (options.reducedMotion === "user" && prefersReducedMotion())

  if (reduce) {
    return settled(
      stage.animate([{ opacity: 0.6 }, { opacity: 1 }], {
        duration: 240,
        easing: "ease-out",
      })
    )
  }

  if (kind === "error") {
    return settled(
      stage.animate(
        [0, -10, 9, -7, 5, -2, 0].map((x) => ({
          transform: `translateX(${x}px)`,
        })),
        { duration: 460, easing: "ease-in-out" }
      )
    )
  }

  return Promise.all(
    slots.map((slot, index) =>
      settled(
        slot.animate(
          [
            { transform: "translateY(0) scale(1)" },
            { transform: "translateY(-6px) scale(1.12)", offset: 0.4 },
            { transform: "translateY(0) scale(1)" },
          ],
          {
            duration: 460,
            delay: index * 50,
            easing: "cubic-bezier(0.34, 1.4, 0.64, 1)",
          }
        )
      )
    )
  ).then(() => undefined)
}
