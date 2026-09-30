"use client"

import * as React from "react"
import { CircleAlertIcon, XIcon } from "lucide-react"

import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@/registry/fujin/ui/alert"
import { Button } from "@/registry/fujin/ui/button"

export default function AlertLiveDemo() {
  const [error, setError] = React.useState<string | null>(null)

  return (
    <div className="grid w-full max-w-xl gap-4">
      <Button
        variant="outline"
        className="w-fit"
        onClick={() => setError("The server did not respond. Try again.")}
      >
        Save changes
      </Button>
      {error ? (
        // Inserted in response to the click, so it announces itself.
        <Alert variant="destructive" role="alert">
          <CircleAlertIcon />
          <AlertTitle>Error: changes not saved</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
          <AlertAction>
            <Button
              size="icon-xs"
              variant="ghost"
              aria-label="Dismiss"
              onClick={() => setError(null)}
            >
              <XIcon />
            </Button>
          </AlertAction>
        </Alert>
      ) : null}
    </div>
  )
}
