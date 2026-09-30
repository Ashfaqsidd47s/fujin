"use client"

import * as React from "react"

import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/registry/fujin/ui/field"
import {
  OTPField,
  OTPFieldGroup,
  OTPFieldSeparator,
  OTPFieldSlot,
} from "@/registry/fujin/ui/otp-field"

// The demo "server" accepts this code; anything else is rejected.
const VALID_CODE = "123456"

export default function OTPFieldDemo() {
  const [code, setCode] = React.useState("")
  const [status, setStatus] = React.useState<"idle" | "valid" | "invalid">(
    "idle"
  )

  return (
    <Field name="code" invalid={status === "invalid"} className="w-auto">
      <FieldLabel>Verification code</FieldLabel>
      <OTPField
        length={6}
        value={code}
        onValueChange={(value) => {
          setCode(value)
          setStatus("idle")
        }}
        onValueComplete={(value) =>
          setStatus(value === VALID_CODE ? "valid" : "invalid")
        }
      >
        <OTPFieldGroup>
          <OTPFieldSlot />
          <OTPFieldSlot />
          <OTPFieldSlot />
        </OTPFieldGroup>
        <OTPFieldSeparator />
        <OTPFieldGroup>
          <OTPFieldSlot />
          <OTPFieldSlot />
          <OTPFieldSlot />
        </OTPFieldGroup>
      </OTPField>
      <FieldDescription>
        {status === "valid"
          ? "Code accepted."
          : `Enter or paste the 6-digit code we sent you (try ${VALID_CODE}).`}
      </FieldDescription>
      <FieldError
        errors={[status === "invalid" ? "That code is not valid." : null]}
      />
      <p className="text-xs text-muted-foreground tabular-nums">
        Value: &quot;{code}&quot;
      </p>
    </Field>
  )
}
