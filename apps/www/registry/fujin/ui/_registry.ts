import type { RegistryItemInput } from "@fujin/schema"

/*
 * Primitives. Cross-item dependencies use the `@fujin/` namespace so they
 * resolve from this registry rather than shadcn's. `fujin init` adds the
 * namespace to components.json; see /docs/installation.
 */
export const ui: RegistryItemInput[] = [
  {
    name: "spinner",
    type: "registry:ui",
    title: "Spinner",
    description: "An accessible loading indicator.",
    categories: ["feedback", "primitives"],
    dependencies: ["lucide-react"],
    registryDependencies: ["@fujin/utils"],
    files: [{ path: "registry/fujin/ui/spinner.tsx", type: "registry:ui" }],
    meta: {
      fujin: {
        summary:
          "Animated loading indicator that announces itself to screen readers.",
        whenToUse: [
          "A region is loading and there is no layout to show a skeleton for.",
        ],
        whenNotToUse: [
          "A button is busy - use `<Button loading>` instead.",
          "Content with a known shape is loading - use `skeleton`.",
        ],
        props: [
          {
            name: "label",
            type: "string | null",
            default: '"Loading"',
            description:
              "Announced text. `null` makes the spinner decorative (no live region).",
          },
        ],
        examples: [
          { title: "Basic", code: "<Spinner />" },
          {
            title: "Custom label",
            code: '<Spinner label="Loading invoices" />',
          },
        ],
        a11y: [
          'Renders `role="status"` with visually hidden text, so the live region is never empty.',
          "Honours `prefers-reduced-motion` by slowing the animation.",
        ],
        related: ["button", "skeleton"],
      },
    },
  },
  {
    name: "button",
    type: "registry:ui",
    title: "Button",
    description:
      "A button with variants, sizes and a built-in loading state. Never submits a form by accident.",
    categories: ["primitives", "forms"],
    dependencies: ["@base-ui/react", "class-variance-authority"],
    registryDependencies: ["@fujin/utils", "@fujin/spinner"],
    files: [{ path: "registry/fujin/ui/button.tsx", type: "registry:ui" }],
    meta: {
      links: {
        doc: "/docs/components/button",
        api: "https://base-ui.com/react/components/button",
      },
      fujin: {
        summary:
          "Clickable action with 6 variants, 8 sizes and a `loading` state.",
        whenToUse: [
          "Triggering an action: submit, save, open a dialog, run a mutation.",
          "Async actions - pass `loading` while the request is in flight.",
        ],
        whenNotToUse: [
          "Navigating to another page - render a link: `<Button render={<Link href='/x' />} nativeButton={false}>`.",
          "Toggling on/off state - use `toggle`.",
        ],
        anatomy: "<Button variant size loading loadingText>{label}</Button>",
        props: [
          {
            name: "variant",
            type: '"default" | "destructive" | "outline" | "secondary" | "ghost" | "link"',
            default: '"default"',
            description: "Visual style.",
          },
          {
            name: "size",
            type: '"default" | "xs" | "sm" | "lg" | "icon" | "icon-xs" | "icon-sm" | "icon-lg"',
            default: '"default"',
            description: "Height and padding. `icon*` sizes are square.",
          },
          {
            name: "type",
            type: '"button" | "submit" | "reset"',
            default: '"button"',
            description: 'Defaults to "button" (the HTML default is "submit").',
          },
          {
            name: "loading",
            type: "boolean",
            default: "false",
            description:
              "Shows a spinner, sets aria-busy, blocks clicks, keeps focus and width.",
          },
          {
            name: "loadingText",
            type: "ReactNode",
            description:
              "Label shown while loading. Omit to keep the label (hidden) and overlay a spinner.",
          },
          {
            name: "render",
            type: "ReactElement | (props, state) => ReactElement",
            description:
              "Render as another element (Base UI). Replaces shadcn's `asChild`. Set `nativeButton={false}` for non-button elements.",
          },
        ],
        examples: [
          {
            title: "Async submit",
            code: `const [pending, startTransition] = React.useTransition()

<Button
  type="submit"
  loading={pending}
  loadingText="Saving..."
  onClick={() => startTransition(() => save())}
>
  Save
</Button>`,
          },
          {
            title: "Icon button",
            code: `<Button variant="ghost" size="icon" aria-label="Delete row">
  <TrashIcon />
</Button>`,
          },
          {
            title: "As a Next.js link",
            code: `<Button render={<Link href="/billing" />} nativeButton={false}>
  Billing
</Button>`,
          },
        ],
        pitfalls: [
          "`asChild` does not exist - use `render` (Base UI).",
          'Submit buttons need an explicit `type="submit"`.',
          "Icon-only buttons need `aria-label`.",
        ],
        a11y: [
          "Focus ring is solid (not alpha) to meet 3:1 non-text contrast (WCAG 1.4.11).",
          "`xs` and `icon-xs` are 24px - the WCAG 2.5.8 minimum. Do not shrink further.",
          "While loading the button stays focusable and announces `aria-busy`.",
        ],
        tokens: [
          "--primary",
          "--primary-foreground",
          "--destructive",
          "--ring",
          "--radius",
        ],
        related: ["spinner", "toggle"],
      },
    },
  },
  {
    name: "input",
    type: "registry:ui",
    title: "Input",
    description: "A text input that wires itself into the surrounding Field.",
    categories: ["primitives", "forms"],
    dependencies: ["@base-ui/react"],
    registryDependencies: ["@fujin/utils"],
    files: [{ path: "registry/fujin/ui/input.tsx", type: "registry:ui" }],
    meta: {
      links: { api: "https://base-ui.com/react/components/input" },
      fujin: {
        summary:
          "Single-line text input; auto-labelled and described inside `<Field>`.",
        whenToUse: ["Free-text, email, password, search and URL entry."],
        whenNotToUse: [
          "Numbers with steppers or locale formatting - use `number-field`.",
          "Picking from a list - use `select` or `combobox`.",
          "One-time codes - use `otp-field`.",
        ],
        props: [
          {
            name: "onValueChange",
            type: "(value: string, details) => void",
            description: "Called with the string value. `onChange` also works.",
          },
        ],
        examples: [
          {
            title: "In a field",
            code: `<Field name="email">
  <FieldLabel>Email</FieldLabel>
  <Input type="email" autoComplete="email" required />
  <FieldError />
</Field>`,
          },
        ],
        pitfalls: [
          "Set `autoComplete` tokens (`email`, `current-password`, `one-time-code`) - password managers and WCAG 3.3.8 depend on them.",
          "Never block paste on password or code inputs.",
        ],
        a11y: [
          "Inside `<Field>`, label/description/error association is automatic.",
        ],
        related: ["field", "form"],
      },
    },
  },
  {
    name: "field",
    type: "registry:ui",
    title: "Field",
    description:
      "Label, description and error for a form control - with the ARIA wiring done for you.",
    categories: ["primitives", "forms"],
    dependencies: ["@base-ui/react"],
    registryDependencies: ["@fujin/utils"],
    files: [{ path: "registry/fujin/ui/field.tsx", type: "registry:ui" }],
    meta: {
      links: { api: "https://base-ui.com/react/components/field" },
      fujin: {
        summary:
          "Groups a control with its label, description and error, and links them for assistive tech.",
        whenToUse: [
          "Every labelled form control.",
          "Showing validation errors from react-hook-form, zod or a server action.",
        ],
        whenNotToUse: [
          "A whole schema-driven form - use the `form` component, which renders Fields for you.",
        ],
        anatomy: `<FieldGroup>
  <Field name invalid disabled>
    <FieldLabel required|optional />
    <Input /> | <FieldControl />
    <FieldDescription />
    <FieldError errors? match? />
  </Field>
</FieldGroup>
<FieldSet><FieldLegend />...</FieldSet>`,
        props: [
          {
            owner: "Field",
            name: "name",
            type: "string",
            description: "Form field name.",
          },
          {
            owner: "Field",
            name: "invalid",
            type: "boolean",
            description: "Force invalid state (e.g. from a form library).",
          },
          {
            owner: "Field",
            name: "validate",
            type: "(value, formValues) => string | string[] | null | Promise<...>",
            description: "Built-in validation without a form library.",
          },
          {
            owner: "Field",
            name: "validationMode",
            type: '"onSubmit" | "onBlur" | "onChange"',
            description: "When `validate` runs.",
          },
          {
            owner: "Field",
            name: "orientation",
            type: '"vertical" | "horizontal"',
            default: '"vertical"',
            description:
              "Horizontal puts label and control side by side (switches, checkboxes).",
          },
          {
            owner: "FieldLabel",
            name: "required",
            type: "boolean",
            description:
              "Visual asterisk only. Also set `required` on the control.",
          },
          {
            owner: "FieldLabel",
            name: "optional",
            type: "boolean",
            description: 'Appends "(optional)".',
          },
          {
            owner: "FieldError",
            name: "errors",
            type: "Array<string | { message?: string } | undefined>",
            description:
              "External errors. Shown when non-empty; duplicates removed; multiple render as a list.",
          },
          {
            owner: "FieldError",
            name: "match",
            type: "boolean | keyof ValidityState",
            description:
              "Show only for a specific native validity state, e.g. `valueMissing`.",
          },
        ],
        examples: [
          {
            title: "With react-hook-form",
            code: `<Controller
  name="email"
  control={form.control}
  render={({ field, fieldState }) => (
    <Field name={field.name} invalid={fieldState.invalid}>
      <FieldLabel required>Email</FieldLabel>
      <Input {...field} type="email" required />
      <FieldError errors={[fieldState.error]} />
    </Field>
  )}
/>`,
          },
          {
            title: "Native validation messages",
            code: `<Field name="name">
  <FieldLabel>Name</FieldLabel>
  <Input required />
  <FieldError match="valueMissing">Name is required.</FieldError>
</Field>`,
          },
        ],
        pitfalls: [
          "Do not pass `id`/`htmlFor` by hand - Field generates and links them.",
          "`FieldLabel required` is visual only; the control needs `required` for it to be announced and validated.",
          "With a form library, pass `invalid` to Field and `errors` to FieldError - both are needed.",
        ],
        a11y: [
          "Label is linked to the control; description and error are referenced by `aria-describedby`.",
          "`aria-invalid` is set on the control when the field is invalid.",
          "Required asterisk is `aria-hidden` to avoid double announcements.",
        ],
        tokens: ["--destructive", "--muted-foreground"],
        related: ["input", "form", "button"],
        editing: {
          ui: ["components/ui/field.tsx"],
          logic: [],
        },
      },
    },
  },
]
