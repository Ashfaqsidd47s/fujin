"use client"

import * as React from "react"

import {
  defaultOtpLoaderOptions,
  playOtpFeedback,
  startOtpLoader,
  type OtpLoader,
  type OtpLoaderOptions,
} from "@/registry/fujin/lib/otp-verify/otp-loader-animation"

/**
 * State machine for a one-time-code verification step:
 *
 *   idle ──submit──▶ verifying ──▶ success
 *     ▲                  │
 *     └──edit / resend── error
 *
 * `onVerify` and the loader animation run side by side. The outcome is only
 * shown once *both* are done, so a fast server still gets the full motion
 * (at least `animation.minRotations` rotations) and a slow one keeps the
 * loader going for as long as it takes.
 */

export type OtpVerifyStatus = "idle" | "verifying" | "success" | "error"

/**
 * What `onVerify` may return. `false` or `{ ok: false }` is a rejected code;
 * throwing does the same and uses the error's message. Anything else passes.
 */
export type OtpVerifyResult =
  boolean | void | undefined | { ok: boolean; message?: string }

export type UseOtpVerifyOptions = {
  /** Number of slots. */
  length?: number
  /** Controlled code. */
  value?: string
  /** Uncontrolled initial code. */
  defaultValue?: string
  onValueChange?: (value: string) => void
  /**
   * `"auto"` verifies as soon as the last slot is filled (or a full code is
   * pasted); `"manual"` waits for `submit()` - a button or the Enter key.
   */
  submitMode?: "auto" | "manual"
  /** Checks the code. Return `false`/`{ ok: false }` or throw to reject it. */
  onVerify: (code: string) => OtpVerifyResult | Promise<OtpVerifyResult>
  /** Runs after the success animation has started. */
  onSuccess?: (code: string) => void
  /** Runs after a rejected code has been shown. */
  onError?: (message: string, code: string) => void
  /** Sends a new code. Omit to hide the resend action. */
  onResend?: () => void | Promise<void>
  /** Seconds before resend is allowed, counted from mount and from each resend. 0 disables. */
  resendCooldown?: number
  /**
   * Clear the slots after a rejected code. Off by default so the user can
   * fix a single mistyped character (WCAG 3.3.7, redundant entry).
   */
  clearOnError?: boolean
  /** Shown when `onVerify` rejects without its own message. */
  errorMessage?: string
  /** Shown when `submit()` is called before every slot is filled. */
  incompleteMessage?: string
  /** Loader motion. Every field is optional; see `OtpLoaderOptions`. */
  animation?: Partial<OtpLoaderOptions>
}

export type UseOtpVerifyResult = {
  value: string
  /** Wire to `OTPField`'s `onValueChange`. Ignored while verifying or verified. */
  setValue: (value: string) => void
  status: OtpVerifyStatus
  /** Message for the current `error` status, else `null`. */
  error: string | null
  isComplete: boolean
  /** True while verifying or verified: the slots should be read-only. */
  isLocked: boolean
  /** Verifies `code`, or the current value. No-op while busy or verified. */
  submit: (code?: string) => Promise<void>
  /** Wire to `OTPField`'s `onValueComplete`. Submits in `"auto"` mode. */
  handleComplete: (code: string) => void
  /** Back to an empty, idle field. */
  reset: () => void
  /** Calls `onResend` and restarts the cooldown. */
  resend: () => Promise<void>
  /** Seconds until resend is allowed; 0 when it is. */
  resendIn: number
  resending: boolean
  canResend: boolean
  /**
   * Attach to the element wrapping the slots. It must lay them out in one
   * row, vertically centred, and is what grows while the ring is shown.
   */
  stageRef: React.RefObject<HTMLDivElement | null>
}

const SLOT_SELECTOR = '[data-slot="otp-field-slot"]'

function useLatest<T>(value: T) {
  const ref = React.useRef(value)
  React.useEffect(() => {
    ref.current = value
  })
  return ref
}

function interpret(
  result: OtpVerifyResult,
  fallback: string
): { ok: true } | { ok: false; message: string } {
  if (result === false) return { ok: false, message: fallback }
  if (typeof result === "object" && result !== null && !result.ok) {
    return { ok: false, message: result.message || fallback }
  }
  return { ok: true }
}

export function useOtpVerify(options: UseOtpVerifyOptions): UseOtpVerifyResult {
  const {
    length = 6,
    value: valueProp,
    defaultValue = "",
    submitMode = "auto",
    resendCooldown = 30,
    clearOnError = false,
    errorMessage = "That code didn't work. Check it and try again.",
    incompleteMessage = `Enter all ${length} characters of the code.`,
  } = options

  const latest = useLatest(options)
  const stageRef = React.useRef<HTMLDivElement | null>(null)
  const loaderRef = React.useRef<OtpLoader | null>(null)
  const mountedRef = React.useRef(true)

  const [internalValue, setInternalValue] = React.useState(defaultValue)
  const isControlled = valueProp !== undefined
  const value = isControlled ? valueProp : internalValue
  const valueRef = useLatest(value)

  const [status, setStatusState] = React.useState<OtpVerifyStatus>("idle")
  const statusRef = React.useRef<OtpVerifyStatus>("idle")
  const setStatus = React.useCallback((next: OtpVerifyStatus) => {
    statusRef.current = next
    setStatusState(next)
  }, [])

  const [error, setError] = React.useState<string | null>(null)
  const [resendIn, setResendIn] = React.useState(resendCooldown)
  const [resending, setResending] = React.useState(false)

  React.useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      loaderRef.current?.cancel()
    }
  }, [])

  React.useEffect(() => {
    if (resendIn <= 0) return
    const timer = window.setTimeout(() => setResendIn((s) => s - 1), 1000)
    return () => window.clearTimeout(timer)
  }, [resendIn])

  const commitValue = React.useCallback(
    (next: string) => {
      valueRef.current = next
      if (!isControlled) setInternalValue(next)
      latest.current.onValueChange?.(next)
    },
    [isControlled, latest, valueRef]
  )

  const setValue = React.useCallback(
    (next: string) => {
      if (
        statusRef.current === "verifying" ||
        statusRef.current === "success"
      ) {
        return
      }
      if (statusRef.current === "error") {
        setStatus("idle")
        setError(null)
      }
      commitValue(next)
    },
    [commitValue, setStatus]
  )

  const getSlots = React.useCallback(
    () =>
      Array.from(
        stageRef.current?.querySelectorAll<HTMLElement>(SLOT_SELECTOR) ?? []
      ),
    []
  )

  const submit = React.useCallback(
    async (codeArg?: string) => {
      const code = codeArg ?? valueRef.current
      if (
        statusRef.current === "verifying" ||
        statusRef.current === "success"
      ) {
        return
      }
      if (code.length < length) {
        setStatus("error")
        setError(incompleteMessage)
        void playOtpFeedback(stageRef.current, getSlots(), "error", {
          ...defaultOtpLoaderOptions,
          ...latest.current.animation,
        })
        return
      }

      const { animation, onVerify } = latest.current
      setStatus("verifying")
      setError(null)

      loaderRef.current?.cancel()
      const loader = startOtpLoader(stageRef.current, getSlots(), animation)
      loaderRef.current = loader

      let outcome: ReturnType<typeof interpret>
      try {
        outcome = interpret(await onVerify(code), errorMessage)
      } catch (cause) {
        outcome = {
          ok: false,
          message:
            cause instanceof Error && cause.message
              ? cause.message
              : errorMessage,
        }
      }

      await loader.stop()
      if (!mountedRef.current || loaderRef.current !== loader) return
      loaderRef.current = null

      const feedbackOptions = { ...defaultOtpLoaderOptions, ...animation }
      if (outcome.ok) {
        setStatus("success")
        void playOtpFeedback(
          stageRef.current,
          getSlots(),
          "success",
          feedbackOptions
        )
        latest.current.onSuccess?.(code)
        return
      }

      setStatus("error")
      setError(outcome.message)
      if (clearOnError) commitValue("")
      void playOtpFeedback(
        stageRef.current,
        getSlots(),
        "error",
        feedbackOptions
      )
      // Put the user straight back in the field to correct or re-enter it.
      const first = getSlots()[0]
      if (first instanceof HTMLInputElement) {
        first.focus()
        first.select()
      }
      latest.current.onError?.(outcome.message, code)
    },
    [
      clearOnError,
      commitValue,
      errorMessage,
      getSlots,
      incompleteMessage,
      latest,
      length,
      setStatus,
      valueRef,
    ]
  )

  const handleComplete = React.useCallback(
    (code: string) => {
      if (submitMode === "auto") void submit(code)
    },
    [submit, submitMode]
  )

  const reset = React.useCallback(() => {
    loaderRef.current?.cancel()
    loaderRef.current = null
    setStatus("idle")
    setError(null)
    commitValue("")
  }, [commitValue, setStatus])

  const resend = React.useCallback(async () => {
    const { onResend } = latest.current
    if (!onResend || resendIn > 0 || resending) return
    if (statusRef.current === "verifying" || statusRef.current === "success") {
      return
    }
    setResending(true)
    try {
      await onResend()
      if (!mountedRef.current) return
      setStatus("idle")
      setError(null)
      commitValue("")
      setResendIn(resendCooldown)
    } catch (cause) {
      if (!mountedRef.current) return
      setStatus("error")
      setError(
        cause instanceof Error && cause.message
          ? cause.message
          : "Couldn't send a new code. Try again."
      )
    } finally {
      if (mountedRef.current) setResending(false)
    }
  }, [commitValue, latest, resendCooldown, resendIn, resending, setStatus])

  const isLocked = status === "verifying" || status === "success"

  return {
    value,
    setValue,
    status,
    error,
    isComplete: value.length === length,
    isLocked,
    submit,
    handleComplete,
    reset,
    resend,
    resendIn,
    resending,
    canResend: !!options.onResend && resendIn <= 0 && !resending && !isLocked,
    stageRef,
  }
}
