import { Checkbox } from "@/registry/fujin/ui/checkbox"
import { Label } from "@/registry/fujin/ui/label"
import { Switch } from "@/registry/fujin/ui/switch"

export default function LabelDemo() {
  return (
    <div className="flex flex-col gap-4">
      <Label>
        <Checkbox defaultChecked />
        Email me a receipt for every order
      </Label>
      <Label>
        <Checkbox disabled />
        Send SMS updates (add a phone number first)
      </Label>
      <Label>
        <Switch />
        Compact rows
      </Label>
    </div>
  )
}
