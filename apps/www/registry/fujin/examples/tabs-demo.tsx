import { Button } from "@/registry/fujin/ui/button"
import { Field, FieldGroup, FieldLabel } from "@/registry/fujin/ui/field"
import { Input } from "@/registry/fujin/ui/input"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/registry/fujin/ui/tabs"

export default function TabsDemo() {
  return (
    <Tabs defaultValue="account" className="w-full max-w-sm">
      <TabsList indicator>
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="password">Password</TabsTrigger>
        <TabsTrigger value="billing" disabled>
          Billing
        </TabsTrigger>
      </TabsList>
      <TabsContent value="account" className="pt-2">
        <FieldGroup className="gap-4">
          <Field name="name">
            <FieldLabel>Name</FieldLabel>
            <Input autoComplete="name" defaultValue="Ada Lovelace" />
          </Field>
          <Button className="self-start">Save account</Button>
        </FieldGroup>
      </TabsContent>
      <TabsContent value="password" className="pt-2">
        <FieldGroup className="gap-4">
          <Field name="current-password">
            <FieldLabel>Current password</FieldLabel>
            <Input type="password" autoComplete="current-password" />
          </Field>
          <Field name="new-password">
            <FieldLabel>New password</FieldLabel>
            <Input type="password" autoComplete="new-password" />
          </Field>
          <Button className="self-start">Change password</Button>
        </FieldGroup>
      </TabsContent>
    </Tabs>
  )
}
