"use client"

import * as React from "react"

import { Button } from "@/registry/fujin/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/registry/fujin/ui/dialog"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/registry/fujin/ui/field"
import { Input } from "@/registry/fujin/ui/input"

type Profile = { name: string; username: string }

export default function DialogDemo() {
  const [open, setOpen] = React.useState(false)
  const [profile, setProfile] = React.useState<Profile>({
    name: "Ada Lovelace",
    username: "ada",
  })
  // The draft lives outside the dialog, so closing it (Esc, backdrop, the
  // close button) never throws away what was typed.
  const [draft, setDraft] = React.useState(profile)

  return (
    <div className="flex flex-col items-center gap-3">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger
          render={<Button variant="outline">Edit profile</Button>}
        />
        <DialogContent>
          <form
            className="grid gap-6"
            onSubmit={(event) => {
              event.preventDefault()
              setProfile(draft)
              setOpen(false)
            }}
          >
            <DialogHeader>
              <DialogTitle>Edit profile</DialogTitle>
              <DialogDescription>
                Unsaved edits are kept if you close this dialog.
              </DialogDescription>
            </DialogHeader>
            <FieldGroup className="gap-4">
              <Field name="name">
                <FieldLabel>Name</FieldLabel>
                <Input
                  required
                  autoComplete="name"
                  value={draft.name}
                  onValueChange={(name) =>
                    setDraft((current) => ({ ...current, name }))
                  }
                />
              </Field>
              <Field name="username">
                <FieldLabel>Username</FieldLabel>
                <Input
                  required
                  autoComplete="username"
                  value={draft.username}
                  onValueChange={(username) =>
                    setDraft((current) => ({ ...current, username }))
                  }
                />
                <FieldDescription>
                  Shown on your public profile.
                </FieldDescription>
              </Field>
            </FieldGroup>
            <DialogFooter>
              <Button type="submit">Save changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <p className="text-sm text-muted-foreground">
        {profile.name} (@{profile.username})
      </p>
    </div>
  )
}
