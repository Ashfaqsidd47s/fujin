"use client"

import { Button } from "@/registry/fujin/ui/button"
import { Toaster, toast } from "@/registry/fujin/ui/toast"

function saveInvoice() {
  return new Promise<{ number: string }>((resolve) =>
    setTimeout(() => resolve({ number: "INV-1042" }), 1500)
  )
}

export default function ToastDemo() {
  return (
    <div className="flex flex-wrap justify-center gap-2">
      <Button variant="outline" onClick={() => toast("Event created")}>
        Default
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          toast.success("Changes saved", {
            description: "Your profile is up to date.",
          })
        }
      >
        Success
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          toast.error("Payment failed", {
            description: "The card was declined. Try another card.",
          })
        }
      >
        Error
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          toast.warning("Storage almost full", {
            description: "You have used 92% of 10 GB.",
          })
        }
      >
        Warning
      </Button>
      <Button
        variant="outline"
        onClick={() => toast.info("A new version is available")}
      >
        Info
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          toast.promise(saveInvoice(), {
            loading: "Saving invoice...",
            success: (invoice) => `Invoice ${invoice.number} saved`,
            error: "Could not save the invoice",
          })
        }
      >
        Promise
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          toast("Message archived", {
            action: {
              label: "Undo",
              onClick: () => toast.success("Message restored"),
            },
          })
        }
      >
        With action
      </Button>
      {/* In an app, render <Toaster /> once in the root layout instead. */}
      <Toaster />
    </div>
  )
}
