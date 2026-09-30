"use client"

import * as React from "react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/registry/fujin/ui/alert-dialog"
import { Button } from "@/registry/fujin/ui/button"

export default function AlertDialogDemo() {
  const [deleted, setDeleted] = React.useState(false)

  if (deleted) {
    return (
      <div className="flex items-center gap-3 text-sm">
        <span className="text-muted-foreground">Project deleted.</span>
        <Button variant="outline" size="sm" onClick={() => setDeleted(false)}>
          Restore
        </Button>
      </div>
    )
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={<Button variant="destructive">Delete project</Button>}
      />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Delete &ldquo;Acme website&rdquo;?
          </AlertDialogTitle>
          <AlertDialogDescription>
            The project, its deployments and 12 environment variables are
            removed permanently. This can&apos;t be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={() => setDeleted(true)}
          >
            Delete project
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
