import {
  SITE_URL,
  type RegistryInput,
  type RegistryItemInput,
} from "@fujin/schema"

import { components } from "./fujin/components/_registry"
import { examples } from "./fujin/examples/_registry"
import { lib } from "./fujin/lib/_registry"
import { ui } from "./fujin/ui/_registry"

/**
 * Status colours that shadcn/ui does not define. Every Fujin component may
 * rely on them, so `@fujin/theme` is a dependency of `fujin init`.
 */
const theme: RegistryItemInput = {
  name: "theme",
  type: "registry:theme",
  title: "Fujin theme tokens",
  description:
    "Adds success, warning and info colour tokens alongside shadcn's defaults.",
  cssVars: {
    theme: {
      "color-success": "var(--success)",
      "color-success-foreground": "var(--success-foreground)",
      "color-warning": "var(--warning)",
      "color-warning-foreground": "var(--warning-foreground)",
      "color-info": "var(--info)",
      "color-info-foreground": "var(--info-foreground)",
      "color-destructive-foreground": "var(--destructive-foreground)",
    },
    light: {
      "destructive-foreground": "oklch(0.985 0 0)",
      success: "oklch(0.596 0.145 163.225)",
      "success-foreground": "oklch(0.985 0 0)",
      warning: "oklch(0.769 0.157 70.08)",
      "warning-foreground": "oklch(0.205 0 0)",
      info: "oklch(0.6 0.153 254.624)",
      "info-foreground": "oklch(0.985 0 0)",
    },
    dark: {
      "destructive-foreground": "oklch(0.985 0 0)",
      success: "oklch(0.696 0.17 162.48)",
      "success-foreground": "oklch(0.145 0 0)",
      warning: "oklch(0.828 0.189 84.429)",
      "warning-foreground": "oklch(0.145 0 0)",
      info: "oklch(0.707 0.165 254.624)",
      "info-foreground": "oklch(0.145 0 0)",
    },
  },
  meta: {
    fujin: {
      summary:
        "Status colour tokens: success, warning, info (+ destructive-foreground).",
      whenToUse: ["Installed once per project by `fujin init`."],
      tokens: ["--success", "--warning", "--info", "--destructive-foreground"],
      examples: [
        { title: "Use a token", code: '<p className="text-success">Paid</p>' },
      ],
    },
  },
}

export const registry = {
  name: "fujin",
  homepage: process.env.NEXT_PUBLIC_SITE_URL ?? SITE_URL,
  items: [theme, ...lib, ...ui, ...components, ...examples],
} satisfies RegistryInput
