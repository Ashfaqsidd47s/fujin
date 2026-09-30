"use client"

import * as React from "react"
import { CheckIcon, KeyRoundIcon, XIcon } from "lucide-react"

import type { OtpLoaderOptions } from "@/registry/fujin/lib/otp-verify/otp-loader-animation"
import {
  useOtpVerify,
  type OtpVerifyStatus,
  type UseOtpVerifyOptions,
} from "@/registry/fujin/lib/otp-verify/use-otp-verify"
import { cn } from "@/registry/fujin/lib/utils"
import { Button } from "@/registry/fujin/ui/button"
import {
  OTPField,
  OTPFieldSeparator,
  OTPFieldSlot,
  type OTPFieldProps,
} from "@/registry/fujin/ui/otp-field"

export type OtpVerifyCardLabels = {
  /** Accessible name of the code field. */
  field: string
  submit: string
  verifying: string
  success: string
  /** Prompt before the resend action. */
  resendPrompt: string
  resend: string
  resending: string
  /** Countdown text while resend is cooling down. */
  resendIn: (seconds: number) => string
  /** Accessible name of each slot after the first. */
  slot: (index: number, length: number) => string
}

const defaultLabels: OtpVerifyCardLabels = {
  field: "Verification code",
  submit: "Verify",
  verifying: "Verifying code…",
  success: "Code verified",
  resendPrompt: "Didn't get a code?",
  resend: "Resend code",
  resending: "Sending…",
  resendIn: (seconds) => `Resend in ${seconds}s`,
  slot: (index, length) => `Character ${index} of ${length}`,
}

type OtpVerifyCardProps = Omit<
  React.ComponentProps<"div">,
  "title" | "defaultValue" | "onError"
> &
  UseOtpVerifyOptions & {
    title?: React.ReactNode
    description?: React.ReactNode
    /** Replaces the header badge icon. `null` hides the badge. */
    icon?: React.ReactNode | null
    /** Characters accepted. Defaults to digits. */
    validationType?: OTPFieldProps["validationType"]
    /** Hide entered characters. */
    mask?: boolean
    /** Form field name, for native form submission. */
    name?: string
    /** Draw a separator every N slots (e.g. 3 for `123-456`). 0 for none. */
    groupSize?: number
    /**
     * Show the submit button. Defaults to `true` in `"manual"` mode and
     * `false` in `"auto"` mode.
     */
    showSubmit?: boolean
    autoFocus?: boolean
    labels?: Partial<OtpVerifyCardLabels>
    /** Rendered under the resend row, e.g. "Use another method". */
    footer?: React.ReactNode
  }

function OtpVerifyCard({
  length = 6,
  value,
  defaultValue,
  onValueChange,
  submitMode = "auto",
  onVerify,
  onSuccess,
  onError,
  onResend,
  resendCooldown,
  clearOnError,
  errorMessage,
  incompleteMessage,
  animation,
  title = "Check your inbox",
  description,
  icon,
  validationType,
  mask,
  name,
  groupSize = 0,
  showSubmit,
  autoFocus,
  labels: labelsProp,
  footer,
  className,
  ...props
}: OtpVerifyCardProps) {
  const labels = { ...defaultLabels, ...labelsProp }
  const resolvedDescription =
    description === undefined
      ? `Enter the ${length}-${!validationType || validationType === "numeric" ? "digit" : "character"} code we just sent you.`
      : description
  const { stageRef, ...otp } = useOtpVerify({
    length,
    value,
    defaultValue,
    onValueChange,
    submitMode,
    onVerify,
    onSuccess,
    onError,
    onResend,
    resendCooldown,
    clearOnError,
    errorMessage,
    incompleteMessage,
    animation,
  })

  const id = React.useId()
  const fieldId = `${id}-code`
  const descriptionId = `${id}-description`
  const messageId = `${id}-message`
  const isOrbit = (animation?.variant ?? "orbit") === "orbit"
  const shouldShowSubmit = showSubmit ?? submitMode === "manual"

  const message =
    otp.status === "verifying"
      ? labels.verifying
      : otp.status === "success"
        ? labels.success
        : otp.status === "error"
          ? otp.error
          : null

  return (
    <div
      data-slot="otp-verify-card"
      data-status={otp.status}
      className={cn(
        "group/otp-verify flex w-full max-w-sm flex-col gap-6 rounded-xl border bg-card p-6 text-card-foreground shadow-sm",
        className
      )}
      {...props}
    >
      <div
        data-slot="otp-verify-card-header"
        className="flex flex-col items-center gap-2 text-center"
      >
        {icon === null ? null : (
          <OtpVerifyBadge status={otp.status} icon={icon} />
        )}
        <h2
          data-slot="otp-verify-card-title"
          className="text-lg leading-tight font-semibold"
        >
          {title}
        </h2>
        {resolvedDescription ? (
          <p
            id={descriptionId}
            data-slot="otp-verify-card-description"
            className="text-sm text-muted-foreground"
          >
            {resolvedDescription}
          </p>
        ) : null}
      </div>

      <form
        data-slot="otp-verify-card-form"
        className="flex flex-col gap-4"
        noValidate
        onSubmit={(event) => {
          event.preventDefault()
          void otp.submit()
        }}
      >
        <label htmlFor={fieldId} className="sr-only">
          {labels.field}
        </label>
        <div
          ref={stageRef}
          data-slot="otp-verify-card-stage"
          className="relative flex items-center justify-center"
        >
          <OTPField
            id={fieldId}
            name={name}
            length={length}
            value={otp.value}
            onValueChange={otp.setValue}
            onValueComplete={otp.handleComplete}
            validationType={validationType}
            mask={mask}
            readOnly={otp.isLocked}
            aria-busy={otp.status === "verifying" || undefined}
            aria-describedby={
              resolvedDescription ? `${descriptionId} ${messageId}` : messageId
            }
            className="gap-2"
          >
            {Array.from({ length }, (_, index) => (
              <React.Fragment key={index}>
                {groupSize > 0 && index > 0 && index % groupSize === 0 ? (
                  <OTPFieldSeparator className="transition-opacity duration-300 group-data-[status=verifying]/otp-verify:opacity-0" />
                ) : null}
                <OTPFieldSlot
                  autoFocus={autoFocus && index === 0}
                  aria-label={
                    index === 0 ? undefined : labels.slot(index + 1, length)
                  }
                  aria-invalid={otp.status === "error" || undefined}
                  className={cn(
                    // Separate boxes: undo the joined-group borders and radii.
                    "ml-0 rounded-md first:ml-0",
                    "size-11 text-lg group-data-[status=verifying]/otp-verify:will-change-transform",
                    // No caret, selection or focus ring flying around the ring.
                    "group-data-[status=success]/otp-verify:selection:bg-transparent group-data-[status=success]/otp-verify:selection:text-inherit group-data-[status=verifying]/otp-verify:selection:bg-transparent group-data-[status=verifying]/otp-verify:selection:text-inherit",
                    "group-data-[status=verifying]/otp-verify:border-primary group-data-[status=verifying]/otp-verify:bg-background group-data-[status=verifying]/otp-verify:caret-transparent group-data-[status=verifying]/otp-verify:shadow-md group-data-[status=verifying]/otp-verify:ring-0",
                    "group-data-[status=success]/otp-verify:border-success group-data-[status=success]/otp-verify:bg-success/10 group-data-[status=success]/otp-verify:text-success",
                    "group-data-[status=error]/otp-verify:border-destructive group-data-[status=error]/otp-verify:text-destructive"
                  )}
                />
              </React.Fragment>
            ))}
          </OTPField>
          {isOrbit ? <OtpVerifyOrbitCenter status={otp.status} /> : null}
        </div>

        <p
          id={messageId}
          data-slot="otp-verify-card-message"
          role="status"
          aria-live="polite"
          className={cn(
            "min-h-5 text-center text-sm transition-colors",
            otp.status === "error" && "text-destructive",
            otp.status === "success" && "text-success",
            otp.status === "verifying" && "text-muted-foreground"
          )}
        >
          {message}
        </p>

        {shouldShowSubmit ? (
          <Button
            type="submit"
            className="w-full"
            // The status line already says "Verifying"; keep the label, add a spinner.
            loading={otp.status === "verifying"}
            disabled={otp.status === "success"}
          >
            {otp.status === "success" ? labels.success : labels.submit}
          </Button>
        ) : null}
      </form>

      {onResend || footer ? (
        <div
          data-slot="otp-verify-card-footer"
          className="flex flex-col items-center gap-2 text-sm text-muted-foreground"
        >
          {onResend ? (
            <p className="flex flex-wrap items-center justify-center gap-1">
              <span>{labels.resendPrompt}</span>
              <Button
                variant="link"
                size="xs"
                className="px-1 tabular-nums"
                disabled={!otp.canResend}
                loading={otp.resending}
                loadingText={labels.resending}
                onClick={() => void otp.resend()}
              >
                {otp.resendIn > 0
                  ? labels.resendIn(otp.resendIn)
                  : labels.resend}
              </Button>
            </p>
          ) : null}
          {footer}
        </div>
      ) : null}
    </div>
  )
}

/** Header badge: cross-fades between the idle, success and error icons. */
function OtpVerifyBadge({
  status,
  icon,
}: {
  status: OtpVerifyStatus
  icon: React.ReactNode
}) {
  const layer =
    "absolute inset-0 flex items-center justify-center transition-[opacity,transform] duration-300 ease-out [&_svg]:size-5"

  return (
    <div
      data-slot="otp-verify-card-badge"
      aria-hidden
      className={cn(
        "relative mb-1 flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors duration-300",
        status === "success" && "bg-success/15 text-success",
        status === "error" && "bg-destructive/10 text-destructive"
      )}
    >
      <span
        className={cn(
          layer,
          status === "verifying" && "animate-pulse",
          (status === "success" || status === "error") && "scale-50 opacity-0"
        )}
      >
        {icon ?? <KeyRoundIcon />}
      </span>
      <span
        className={cn(
          layer,
          status === "success" ? "scale-100 opacity-100" : "scale-50 opacity-0"
        )}
      >
        <CheckIcon />
      </span>
      <span
        className={cn(
          layer,
          status === "error" ? "scale-100 opacity-100" : "scale-50 opacity-0"
        )}
      >
        <XIcon />
      </span>
    </div>
  )
}

/** A soft hub that fades in at the centre of the orbit ring. */
function OtpVerifyOrbitCenter({ status }: { status: OtpVerifyStatus }) {
  const active = status === "verifying"
  return (
    <span
      data-slot="otp-verify-card-orbit-center"
      aria-hidden
      className={cn(
        "pointer-events-none absolute top-1/2 left-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary transition-[opacity,scale] ease-out",
        active
          ? "scale-100 opacity-100 delay-300 duration-500"
          : "scale-0 opacity-0 duration-200"
      )}
    >
      {active ? (
        <span className="absolute inset-0 animate-ping rounded-full bg-primary/40 motion-reduce:animate-none" />
      ) : null}
    </span>
  )
}

export {
  OtpVerifyCard,
  type OtpVerifyCardProps,
  type OtpLoaderOptions as OtpVerifyCardAnimation,
}
