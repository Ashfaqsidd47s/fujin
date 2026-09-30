import { Button } from "@/registry/fujin/ui/button"
import { Field, FieldGroup, FieldLabel } from "@/registry/fujin/ui/field"
import { Input } from "@/registry/fujin/ui/input"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/registry/fujin/ui/sheet"

export default function SheetDemo() {
  return (
    <Sheet>
      <SheetTrigger
        render={<Button variant="outline">Edit shipping address</Button>}
      />
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Shipping address</SheetTitle>
          <SheetDescription>
            Used for this order only. Your saved address is not changed.
          </SheetDescription>
        </SheetHeader>
        <FieldGroup className="gap-4 px-4">
          <Field name="street">
            <FieldLabel>Street address</FieldLabel>
            <Input autoComplete="street-address" />
          </Field>
          <Field name="city">
            <FieldLabel>City</FieldLabel>
            <Input autoComplete="address-level2" />
          </Field>
          <Field name="postal-code">
            <FieldLabel>Postal code</FieldLabel>
            <Input autoComplete="postal-code" />
          </Field>
        </FieldGroup>
        <SheetFooter>
          <SheetClose render={<Button />}>Use this address</SheetClose>
          <SheetClose render={<Button variant="outline" />}>Cancel</SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
