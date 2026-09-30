"use client"

import * as React from "react"

import { Field, FieldGroup, FieldLabel } from "@/registry/fujin/ui/field"
import { Switch } from "@/registry/fujin/ui/switch"

export default function SwitchDemo() {
  const [digest, setDigest] = React.useState(true)

  return (
    <FieldGroup className="max-w-sm">
      <Field name="digest" orientation="horizontal">
        <FieldLabel>Weekly digest</FieldLabel>
        <Switch checked={digest} onCheckedChange={setDigest} />
      </Field>
      <Field name="mentions" orientation="horizontal">
        <FieldLabel>Only notify me for mentions</FieldLabel>
        <Switch size="sm" defaultChecked />
      </Field>
      <Field name="sms" orientation="horizontal" disabled>
        <FieldLabel>SMS alerts</FieldLabel>
        <Switch />
      </Field>
      <p className="text-sm text-muted-foreground">
        Digest is {digest ? "on" : "off"}. SMS alerts need a verified phone
        number.
      </p>
    </FieldGroup>
  )
}
