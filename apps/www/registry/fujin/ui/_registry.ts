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
  {
    name: "table",
    type: "registry:ui",
    title: "Table",
    description:
      "Semantic table parts with a sticky-header option, built for data-table.",
    categories: ["primitives", "data"],
    dependencies: [],
    registryDependencies: ["@fujin/utils"],
    files: [{ path: "registry/fujin/ui/table.tsx", type: "registry:ui" }],
    meta: {
      fujin: {
        summary:
          "Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableFooter, TableCaption - plain semantic HTML, wrapped for horizontal scroll.",
        whenToUse: [
          "Tabular data with column headers.",
          "As the base for `data-table` - it does not do sorting, filtering or selection itself.",
        ],
        whenNotToUse: [
          "Sortable, filterable or selectable data - use `data-table`, which composes this.",
          "A list of cards or a single-column list - a `<table>` adds no value there.",
        ],
        anatomy: `<Table>
  <TableHeader sticky?>
    <TableRow><TableHead /></TableRow>
  </TableHeader>
  <TableBody>
    <TableRow><TableCell /></TableRow>
  </TableBody>
  <TableFooter />
  <TableCaption />
</Table>`,
        props: [
          {
            owner: "TableHeader",
            name: "sticky",
            type: "boolean",
            default: "false",
            description:
              "Sticks the header to the top of the table's scroll container using `--fujin-data-table-offset` for the top offset.",
          },
        ],
        examples: [
          {
            title: "Basic",
            code: `<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Name</TableHead>
      <TableHead>Status</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>Invoice #1</TableCell>
      <TableCell>Paid</TableCell>
    </TableRow>
  </TableBody>
</Table>`,
          },
        ],
        pitfalls: [
          "`Table` already wraps itself in a scrolling container - do not add another `overflow-x-auto` wrapper around it.",
          "`TableHeader sticky` needs `--fujin-data-table-offset` set on an ancestor (data-table sets this for you) or it defaults to 0.",
        ],
        a11y: [
          "Uses native `<table>`/`<th>`/`<td>` - screen readers get row/column semantics for free, no ARIA grid role needed.",
          "A sticky header keeps `scroll-margin-top` in mind for focused cells (WCAG 2.4.11) when composed by `data-table`.",
        ],
        related: ["data-table", "pagination"],
      },
    },
  },
  {
    name: "checkbox",
    type: "registry:ui",
    title: "Checkbox",
    description: "A tri-state checkbox: checked, unchecked or indeterminate.",
    categories: ["primitives", "forms"],
    dependencies: ["@base-ui/react", "lucide-react"],
    registryDependencies: ["@fujin/utils"],
    files: [{ path: "registry/fujin/ui/checkbox.tsx", type: "registry:ui" }],
    meta: {
      links: { api: "https://base-ui.com/react/components/checkbox" },
      fujin: {
        summary:
          "Single boolean or tri-state (indeterminate) toggle, for one setting or a table's row selection.",
        whenToUse: [
          "One on/off setting inside a form - pair with `Field`.",
          "Row selection in `data-table` (the header checkbox uses `indeterminate` for a partial page selection).",
        ],
        whenNotToUse: [
          "A list of options where only one can be chosen - use `radio-group`.",
          "An immediate setting with no surrounding form - `switch` reads better for that.",
        ],
        props: [
          {
            name: "checked",
            type: "boolean",
            description: "Controlled checked state.",
          },
          {
            name: "onCheckedChange",
            type: "(checked: boolean, details) => void",
            description: "Called when the checked state changes.",
          },
          {
            name: "indeterminate",
            type: "boolean",
            default: "false",
            description:
              'Visual "some, not all" state. Sets `aria-checked="mixed"`; does not affect `checked`.',
          },
        ],
        examples: [
          {
            title: "Select all rows",
            code: `<Checkbox
  checked={allSelected}
  indeterminate={someSelected && !allSelected}
  onCheckedChange={toggleAll}
  aria-label="Select all rows"
/>`,
          },
        ],
        pitfalls: [
          "`indeterminate` is visual only - it does not change what `checked`/`onCheckedChange` report.",
          "A standalone checkbox (not inside `Field`) needs its own `aria-label` or `aria-labelledby`.",
        ],
        a11y: [
          "Focus ring is solid to meet the 3:1 non-text contrast requirement (WCAG 1.4.11).",
          'Renders `aria-checked="mixed"` automatically while `indeterminate`.',
        ],
        tokens: [
          "--primary",
          "--primary-foreground",
          "--ring",
          "--destructive",
        ],
        related: ["field", "data-table", "radio-group"],
      },
    },
  },
  {
    name: "separator",
    type: "registry:ui",
    title: "Separator",
    description: "A visual divider between groups of content.",
    categories: ["primitives", "layout"],
    dependencies: ["@base-ui/react"],
    registryDependencies: ["@fujin/utils"],
    files: [{ path: "registry/fujin/ui/separator.tsx", type: "registry:ui" }],
    meta: {
      links: { api: "https://base-ui.com/react/components/separator" },
      fujin: {
        summary: "A horizontal or vertical rule with the correct ARIA role.",
        whenToUse: ["Dividing sections of a page, a toolbar, or menu groups."],
        whenNotToUse: [
          'Purely decorative spacing - use margin/gap; a separator announces `role="separator"` to screen readers.',
        ],
        props: [
          {
            name: "orientation",
            type: '"horizontal" | "vertical"',
            default: '"horizontal"',
            description: "Axis of the divider.",
          },
        ],
        examples: [
          {
            title: "Toolbar divider",
            code: `<div className="flex items-center gap-2">
  <Button variant="ghost" size="sm">Cut</Button>
  <Separator orientation="vertical" className="h-5" />
  <Button variant="ghost" size="sm">Copy</Button>
</div>`,
          },
        ],
        a11y: [
          'Renders with `role="separator"` and the correct `aria-orientation`.',
        ],
        related: ["dropdown-menu", "command"],
      },
    },
  },
  {
    name: "skeleton",
    type: "registry:ui",
    title: "Skeleton",
    description:
      "A pulsing placeholder that mirrors the shape of loading content.",
    categories: ["primitives", "feedback"],
    dependencies: [],
    registryDependencies: ["@fujin/utils"],
    files: [{ path: "registry/fujin/ui/skeleton.tsx", type: "registry:ui" }],
    meta: {
      fujin: {
        summary:
          "A `div` with a pulse animation, sized to match the content it stands in for.",
        whenToUse: [
          "Content with a known shape is loading - rows in `data-table`, cards, avatars.",
        ],
        whenNotToUse: [
          "The shape is unknown or the region is small - use `spinner`.",
          "A busy button - use `<Button loading>`.",
        ],
        examples: [
          {
            title: "Table row skeleton",
            code: `<TableRow>
  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
</TableRow>`,
          },
        ],
        a11y: [
          'Purely visual - wrap the loading region in `aria-busy` and a `role="status"` announcement (or use `spinner`/`data-table`\'s loading state, which does this).',
          "Honours `prefers-reduced-motion` by disabling the pulse.",
        ],
        tokens: ["--accent"],
        related: ["spinner", "data-table"],
      },
    },
  },
  {
    name: "badge",
    type: "registry:ui",
    title: "Badge",
    description: "A small status or count label with 7 variants.",
    categories: ["primitives", "feedback"],
    dependencies: ["class-variance-authority"],
    registryDependencies: ["@fujin/utils"],
    files: [{ path: "registry/fujin/ui/badge.tsx", type: "registry:ui" }],
    meta: {
      fujin: {
        summary:
          "Inline label for a status, count or filter pill - `default`, `secondary`, `destructive`, `success`, `warning`, `info`, `outline`.",
        whenToUse: [
          "A status value in a table cell or card (paid/draft/overdue).",
          "A count (unread, selected).",
          "The base for `data-table`'s filter pills.",
        ],
        whenNotToUse: [
          "An interactive, removable tag - build on `badge` but add your own button; `badge` itself has no built-in dismiss.",
        ],
        props: [
          {
            name: "variant",
            type: '"default" | "secondary" | "destructive" | "success" | "warning" | "info" | "outline"',
            default: '"default"',
            description: "Visual style.",
          },
        ],
        examples: [
          { title: "Status", code: '<Badge variant="success">Paid</Badge>' },
          {
            title: "Removable (composed)",
            code: `<Badge variant="secondary" className="gap-1 pr-1">
  Draft
  <button type="button" aria-label="Remove filter" className="rounded-xs hover:bg-black/10">
    <XIcon className="size-3" />
  </button>
</Badge>`,
          },
        ],
        pitfalls: [
          "`success`/`warning`/`info` need `@fujin/theme` installed - those tokens are not part of shadcn's default palette.",
        ],
        tokens: [
          "--primary",
          "--secondary",
          "--destructive",
          "--success",
          "--warning",
          "--info",
        ],
        related: ["data-table"],
      },
    },
  },
  {
    name: "popover",
    type: "registry:ui",
    title: "Popover",
    description: "A non-modal panel anchored to a trigger.",
    categories: ["primitives", "overlays"],
    dependencies: ["@base-ui/react", "lucide-react"],
    registryDependencies: ["@fujin/utils"],
    files: [{ path: "registry/fujin/ui/popover.tsx", type: "registry:ui" }],
    meta: {
      links: { api: "https://base-ui.com/react/components/popover" },
      fujin: {
        summary:
          "Anchored floating panel for supplementary content or a small form - not modal, closes on outside click or Escape.",
        whenToUse: [
          "A settings panel, filter form, or extra detail anchored to a trigger.",
        ],
        whenNotToUse: [
          "A list of choices to pick from - use `command` or `dropdown-menu`.",
          "Content that must block the rest of the page - use `dialog`.",
        ],
        anatomy: `<Popover>
  <PopoverTrigger />
  <PopoverContent side align sideOffset showClose>
    <PopoverTitle /> <PopoverDescription />
  </PopoverContent>
</Popover>`,
        props: [
          {
            owner: "PopoverContent",
            name: "side",
            type: '"top" | "right" | "bottom" | "left"',
            default: '"bottom"',
            description: "Preferred side relative to the trigger.",
          },
          {
            owner: "PopoverContent",
            name: "showClose",
            type: "boolean",
            default: "false",
            description: "Renders a close button in the corner.",
          },
        ],
        examples: [
          {
            title: "Basic",
            code: `<Popover>
  <PopoverTrigger render={<Button variant="outline">Filters</Button>} />
  <PopoverContent>
    <PopoverTitle>Filters</PopoverTitle>
    <PopoverDescription>Narrow down the results.</PopoverDescription>
  </PopoverContent>
</Popover>`,
          },
        ],
        pitfalls: [
          "The popup renders in a portal - style it directly, `className` on `Popover` itself has nowhere to land.",
        ],
        a11y: [
          "Focus moves into the popup on open and returns to the trigger on close.",
          "Closes on Escape and outside click/tap.",
        ],
        related: ["command", "dropdown-menu", "tooltip"],
      },
    },
  },
  {
    name: "tooltip",
    type: "registry:ui",
    title: "Tooltip",
    description: "A hover/focus hint. Not a substitute for an accessible name.",
    categories: ["primitives", "overlays"],
    dependencies: ["@base-ui/react"],
    registryDependencies: ["@fujin/utils"],
    files: [{ path: "registry/fujin/ui/tooltip.tsx", type: "registry:ui" }],
    meta: {
      links: { api: "https://base-ui.com/react/components/tooltip" },
      fujin: {
        summary:
          "Small floating hint shown on hover or keyboard focus. `TooltipProvider` groups nearby tooltips so the second one opens instantly.",
        whenToUse: [
          "Labelling an icon-only button visually, in addition to `aria-label`.",
          "A short clarification for a truncated value or an abbreviation.",
        ],
        whenNotToUse: [
          "The only source of a control's accessible name - always set `aria-label` too; touch users never see hover tooltips.",
          "Content someone needs to interact with (links, buttons) - use `popover`.",
        ],
        anatomy: `<TooltipProvider>
  <Tooltip>
    <TooltipTrigger />
    <TooltipContent side align sideOffset />
  </Tooltip>
</TooltipProvider>`,
        examples: [
          {
            title: "Icon button",
            code: `<Tooltip>
  <TooltipTrigger render={<Button variant="ghost" size="icon" aria-label="Delete row"><TrashIcon /></Button>} />
  <TooltipContent>Delete row</TooltipContent>
</Tooltip>`,
          },
        ],
        pitfalls: [
          "Never put the only accessible name in a tooltip - touch and some screen-reader interactions never trigger hover.",
          "Wrap a group of tooltips in one `TooltipProvider` so the shared delay applies; without it every tooltip opens on its own full delay.",
        ],
        a11y: [
          "Opens on both hover and keyboard focus, closes on Escape.",
          "Uses `aria-describedby`, not `aria-labelledby` - it supplements, never replaces, the trigger's own label.",
        ],
        related: ["popover"],
      },
    },
  },
  {
    name: "dropdown-menu",
    type: "registry:ui",
    title: "Dropdown Menu",
    description:
      "An anchored menu of actions, with checkbox items, radio items and submenus.",
    categories: ["primitives", "overlays", "navigation"],
    dependencies: ["@base-ui/react", "lucide-react"],
    registryDependencies: ["@fujin/utils"],
    files: [
      { path: "registry/fujin/ui/dropdown-menu.tsx", type: "registry:ui" },
    ],
    meta: {
      links: { api: "https://base-ui.com/react/components/menu" },
      fujin: {
        summary:
          "Anchored list of actions - plain items, checkbox items, a radio group, submenus. Full keyboard navigation and type-ahead.",
        whenToUse: [
          "A '...' actions menu (row actions, bulk-action overflow).",
          "Toggleable settings as a group, e.g. column visibility.",
          "A single-choice list, e.g. sort direction, as `DropdownMenuRadioGroup`.",
        ],
        whenNotToUse: [
          "A searchable list with many options - use `command`.",
          "Primary page navigation - use `navigation-menu` or plain links.",
        ],
        anatomy: `<DropdownMenu>
  <DropdownMenuTrigger />
  <DropdownMenuContent side align>
    <DropdownMenuLabel />
    <DropdownMenuItem variant="default" | "destructive" />
    <DropdownMenuCheckboxItem checked onCheckedChange />
    <DropdownMenuRadioGroup value onValueChange>
      <DropdownMenuRadioItem value />
    </DropdownMenuRadioGroup>
    <DropdownMenuSeparator />
    <DropdownMenuSub>
      <DropdownMenuSubTrigger />
      <DropdownMenuSubContent />
    </DropdownMenuSub>
  </DropdownMenuContent>
</DropdownMenu>`,
        props: [
          {
            owner: "DropdownMenuItem",
            name: "variant",
            type: '"default" | "destructive"',
            default: '"default"',
            description:
              "Destructive tints the item red for delete-style actions.",
          },
        ],
        examples: [
          {
            title: "Column visibility",
            code: `<DropdownMenu>
  <DropdownMenuTrigger render={<Button variant="outline" size="sm">Columns</Button>} />
  <DropdownMenuContent align="end">
    {columns.map((column) => (
      <DropdownMenuCheckboxItem
        key={column.id}
        checked={column.getIsVisible()}
        onCheckedChange={column.toggleVisibility}
      >
        {column.label}
      </DropdownMenuCheckboxItem>
    ))}
  </DropdownMenuContent>
</DropdownMenu>`,
          },
          {
            title: "Row actions",
            code: `<DropdownMenu>
  <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" aria-label="Row actions"><MoreHorizontalIcon /></Button>} />
  <DropdownMenuContent align="end">
    <DropdownMenuItem onClick={() => edit(row)}>Edit</DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuItem variant="destructive" onClick={() => remove(row)}>Delete</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>`,
          },
        ],
        pitfalls: [
          "An icon-only trigger needs `aria-label` - the menu's own accessible name does not cover it.",
          "Setting `closeOnClick={false}` on an item is how multi-pick menus stay open - `DropdownMenuCheckboxItem` already does this for you.",
        ],
        a11y: [
          "Full arrow-key/Home/End/type-ahead navigation; Escape closes and returns focus to the trigger.",
          "Every interactive row is at least 32px tall; pair with a trigger of at least 24px (WCAG 2.5.8).",
        ],
        related: ["command", "popover", "data-table"],
      },
    },
  },
  {
    name: "command",
    type: "registry:ui",
    title: "Command",
    description:
      "A searchable, data-driven listbox - the picker behind data-table's filter search bar.",
    categories: ["primitives", "overlays", "data"],
    dependencies: ["@base-ui/react", "lucide-react"],
    registryDependencies: ["@fujin/utils"],
    files: [{ path: "registry/fujin/ui/command.tsx", type: "registry:ui" }],
    meta: {
      links: { api: "https://base-ui.com/react/components/combobox" },
      fujin: {
        summary:
          "Type-ahead list anchored to its input, built on Base UI Combobox. Filtering is driven by the `items` prop, not by scanning rendered text.",
        whenToUse: [
          "A search-to-pick UI: type to narrow a list, select one or more values.",
          "data-table's unified search bar (pick a column, then pick its values) and its per-column header filter popover both use this.",
        ],
        whenNotToUse: [
          "A short, fixed list of actions with no need to search - use `dropdown-menu`, it is lighter.",
          "Free text with no list to pick from - use `input`.",
        ],
        anatomy: `<Command items value onValueChange multiple?>
  <CommandInput placeholder />
  <CommandPopup side align>
    <CommandEmpty>No results.</CommandEmpty>
    <CommandList>
      {(item) => (
        <CommandGroup heading={item.group}>
          <CommandItem value={item}>{item.label}</CommandItem>
        </CommandGroup>
      )}
    </CommandList>
  </CommandPopup>
</Command>`,
        props: [
          {
            owner: "Command",
            name: "items",
            type: "readonly Item[] | readonly Group<Item>[]",
            description:
              "The full, unfiltered list. Built-in filtering matches against these, not against rendered children.",
          },
          {
            owner: "Command",
            name: "multiple",
            type: "boolean",
            default: "false",
            description:
              "Allows selecting more than one item; `value` becomes an array. Pairs with `CommandChips`/`CommandChip`/`CommandChipRemove` to render the current selection as removable chips.",
          },
          {
            owner: "Command",
            name: "filter",
            type: "(item, query, itemToString?) => boolean",
            description: "Overrides the default substring match.",
          },
          {
            owner: "CommandInput",
            name: "bare",
            type: "boolean",
            default: "false",
            description:
              "Skips the bordered wrapper - for embedding inside a caller-styled container, like data-table's search bar.",
          },
          {
            owner: "CommandTrigger",
            name: "render",
            type: "ReactElement | (props, state) => ReactElement",
            description:
              "Renders the trigger as another element - a filter pill, an icon button.",
          },
        ],
        examples: [
          {
            title: "Single select",
            code: `<Command items={columns} value={picked} onValueChange={setPicked}>
  <CommandInput placeholder="Filter by..." />
  <CommandPopup>
    <CommandEmpty>No matching columns.</CommandEmpty>
    <CommandList>
      {(column) => <CommandItem key={column.id} value={column}>{column.label}</CommandItem>}
    </CommandList>
  </CommandPopup>
</Command>`,
          },
          {
            title: "Multi-select with chips",
            code: `<Command items={statuses} value={selected} onValueChange={setSelected} multiple>
  <CommandChips>
    {selected.map((status) => (
      <CommandChip key={status.value}>
        {status.label}
        <CommandChipRemove />
      </CommandChip>
    ))}
    <CommandInput placeholder="Add status..." />
  </CommandChips>
  <CommandPopup>
    <CommandList>
      {(status) => <CommandItem key={status.value} value={status}>{status.label}</CommandItem>}
    </CommandList>
  </CommandPopup>
</Command>`,
          },
        ],
        pitfalls: [
          "Without an `items` prop, the built-in filter has nothing to match against - static children never get filtered (unlike cmdk).",
          "`CommandInput` used alone is the popup's anchor - do not nest it inside `CommandPopup`. To search inside an already-opened popup instead, anchor with `CommandTrigger` and put `CommandInput` inside `CommandPopup`.",
        ],
        a11y: [
          "Full ARIA combobox pattern: arrow keys move the active descendant, Enter selects, Escape closes.",
          "`CommandEmpty` announces politely to screen readers when the filtered list becomes empty.",
        ],
        related: ["data-table", "dropdown-menu", "popover"],
      },
    },
  },
  {
    name: "alert",
    type: "registry:ui",
    title: "Alert",
    description:
      "A callout for a message the user should notice - info, success, warning or error.",
    categories: ["feedback", "primitives"],
    dependencies: ["class-variance-authority"],
    registryDependencies: ["@fujin/utils"],
    files: [{ path: "registry/fujin/ui/alert.tsx", type: "registry:ui" }],
    meta: {
      links: { doc: "/docs/components/alert" },
      fujin: {
        summary:
          "Bordered callout with an optional icon, title, description and top-right action; 5 variants. No live role unless you add one.",
        whenToUse: [
          "A page- or section-level message that stays on screen: trial ending, sync failed, maintenance window.",
          'Inline feedback after a form submit (add `role="alert"` when it is inserted dynamically).',
        ],
        whenNotToUse: [
          "A transient confirmation that should disappear on its own - use `toast`.",
          "An error for one form field - use `FieldError` inside `field`.",
          "A decision the user must make before continuing - use `alert-dialog`.",
          "A short status word in a table cell - use `badge`.",
        ],
        anatomy: `<Alert variant role?>
  <SvgIcon />            // optional, must be a direct child
  <AlertTitle />
  <AlertDescription />
  <AlertAction />        // optional, top-right column
</Alert>`,
        props: [
          {
            owner: "Alert",
            name: "variant",
            type: '"default" | "destructive" | "success" | "warning" | "info"',
            default: '"default"',
            description:
              "Colours the border, a 5% tint and the icon. Text stays foreground for contrast.",
          },
          {
            owner: "Alert",
            name: "role",
            type: '"alert" | "status"',
            description:
              'Not set by default. `"alert"` for urgent dynamically inserted messages, `"status"` for polite ones.',
          },
        ],
        examples: [
          {
            title: "Static notice",
            code: `<Alert variant="warning">
  <TriangleAlertIcon />
  <AlertTitle>Warning: 3 days left on your trial</AlertTitle>
  <AlertDescription>Add a payment method to keep access.</AlertDescription>
</Alert>`,
          },
          {
            title: "Error after submit, with action",
            code: `{error ? (
  <Alert variant="destructive" role="alert">
    <CircleAlertIcon />
    <AlertTitle>Error: changes not saved</AlertTitle>
    <AlertDescription>{error}</AlertDescription>
    <AlertAction>
      <Button size="icon-xs" variant="ghost" aria-label="Dismiss" onClick={() => setError(null)}>
        <XIcon />
      </Button>
    </AlertAction>
  </Alert>
) : null}`,
          },
        ],
        pitfalls: [
          'Unlike shadcn, there is no default `role="alert"` - a dynamically inserted error will be silent unless you add `role="alert"` (or `role="status"`).',
          'Do not put `role="alert"` on alerts rendered with the page - it interrupts screen readers on load or is ignored.',
          "The icon only gets its grid column when it is a direct child `<svg>` of `Alert`; wrapping it in a span breaks the layout.",
          "`success`/`warning`/`info` need `@fujin/theme` - those tokens are not in shadcn's default palette.",
          "`AlertTitle` is a `div`, not a heading.",
        ],
        a11y: [
          "Title and description keep `foreground`/`muted-foreground`, so text contrast holds at 4.5:1 in every variant.",
          'Severity must be in the text ("Error: ..."), not only the colour (WCAG 1.4.1).',
          "Lucide icons are `aria-hidden` by default; other icons need it set.",
          'Pass `role="heading" aria-level={n}` on `AlertTitle` to put it in the outline.',
        ],
        tokens: [
          "--card",
          "--card-foreground",
          "--muted-foreground",
          "--border",
          "--destructive",
          "--success",
          "--warning",
          "--info",
        ],
        related: ["badge", "empty", "field", "toast", "alert-dialog"],
      },
    },
  },
  {
    name: "card",
    type: "registry:ui",
    title: "Card",
    description: "A bordered surface that groups a header, content and footer.",
    categories: ["layout", "primitives"],
    dependencies: [],
    registryDependencies: ["@fujin/utils"],
    files: [{ path: "registry/fujin/ui/card.tsx", type: "registry:ui" }],
    meta: {
      links: { doc: "/docs/components/card" },
      fujin: {
        summary:
          "Surface with header (title, description, top-right action), content and footer. Server-component safe.",
        whenToUse: [
          "A dashboard metric, a settings section, a form panel, an item in a grid of records.",
        ],
        whenNotToUse: [
          "Rows of homogeneous records - use `table` or `data-table`; cards make comparison hard.",
          "A message the user must notice - use `alert`.",
          "A section that needs no visual boundary - a heading and spacing is lighter.",
          "Nothing to show yet - put `empty` inside the card rather than an empty card.",
        ],
        anatomy: `<Card size>
  <CardHeader>
    <CardTitle />
    <CardDescription />
    <CardAction />      // optional, top-right
  </CardHeader>
  <CardContent />
  <CardFooter />
</Card>`,
        props: [
          {
            owner: "Card",
            name: "size",
            type: '"default" | "sm"',
            default: '"default"',
            description:
              "`sm` tightens padding (16px) and gaps for dense layouts.",
          },
        ],
        examples: [
          {
            title: "Metric card",
            code: `<Card>
  <CardHeader>
    <CardTitle role="heading" aria-level={3}>Revenue</CardTitle>
    <CardDescription>Last 30 days</CardDescription>
    <CardAction>
      <Button variant="ghost" size="icon-sm" aria-label="Revenue options">
        <EllipsisIcon />
      </Button>
    </CardAction>
  </CardHeader>
  <CardContent className="text-3xl font-semibold">$48,210</CardContent>
</Card>`,
          },
          {
            title: "Dividers",
            code: `<Card>
  <CardHeader className="border-b">...</CardHeader>
  <CardContent>...</CardContent>
  <CardFooter className="border-t">...</CardFooter>
</Card>`,
          },
        ],
        pitfalls: [
          '`CardTitle` is a `div`: add `role="heading" aria-level={n}` (or nest an `<hN>`) when the card is a page section.',
          "`CardAction` only gets its column when it is a direct child of `CardHeader`.",
          "Add `border-b`/`border-t` to `CardHeader`/`CardFooter` for dividers - the padding adjusts via `[.border-b]`; a `Separator` between parts does not.",
          "Do not make the whole card a link wrapping buttons - nested interactive elements are invalid. Link the title and use a stretched pseudo-element if needed.",
        ],
        a11y: [
          "No implicit landmark or heading; supply heading semantics on `CardTitle` yourself.",
          "`CardHeader` is a container query context (`@container/card-header`) for width-responsive headers.",
        ],
        tokens: [
          "--card",
          "--card-foreground",
          "--muted-foreground",
          "--border",
          "--radius",
        ],
        related: ["empty", "alert", "table", "separator"],
      },
    },
  },
  {
    name: "avatar",
    type: "registry:ui",
    title: "Avatar",
    description:
      "A user's picture with an initials fallback, in 3 sizes, plus an overlapping group.",
    categories: ["primitives", "data"],
    dependencies: ["@base-ui/react"],
    registryDependencies: ["@fujin/utils"],
    files: [{ path: "registry/fujin/ui/avatar.tsx", type: "registry:ui" }],
    meta: {
      links: {
        doc: "/docs/components/avatar",
        api: "https://base-ui.com/react/components/avatar",
      },
      fujin: {
        summary:
          "Round image with a fallback that shows while loading or on error; `AvatarGroup` stacks them with a `+N` count.",
        whenToUse: [
          "Identifying a person or organisation next to their content: comment authors, assignees, account menu.",
          "Showing several collaborators compactly - `AvatarGroup` + `AvatarGroupCount`.",
        ],
        whenNotToUse: [
          "A product or file thumbnail - use a plain `<img>` with a fixed aspect ratio; avatars are round and fall back to initials.",
          "A status label - use `badge`.",
          'An icon-only button - use `<Button size="icon">`; wrap the avatar in a Button (`render`) only when it opens an account menu.',
        ],
        anatomy: `<AvatarGroup>
  <Avatar size>
    <AvatarImage src alt />
    <AvatarFallback delay />
  </Avatar>
  <AvatarGroupCount>+3</AvatarGroupCount>
</AvatarGroup>`,
        props: [
          {
            owner: "Avatar",
            name: "size",
            type: '"sm" | "default" | "lg"',
            default: '"default"',
            description:
              "24px / 32px / 40px. Fallback text and group count scale with it.",
          },
          {
            owner: "AvatarFallback",
            name: "delay",
            type: "number",
            default: "0",
            description:
              "Milliseconds before the fallback shows, so fast images do not flash initials.",
          },
          {
            owner: "AvatarImage",
            name: "onLoadingStatusChange",
            type: '(status: "idle" | "loading" | "loaded" | "error") => void',
            description: "Observe image loading.",
          },
        ],
        examples: [
          {
            title: "With fallback",
            code: `<Avatar>
  <AvatarImage src={user.imageUrl} alt={user.name} />
  <AvatarFallback delay={300}>{user.initials}</AvatarFallback>
</Avatar>`,
          },
          {
            title: "Group",
            code: `<AvatarGroup role="group" aria-label="Assigned to 6 people">
  {shown.map((u) => (
    <Avatar key={u.id}>
      <AvatarImage src={u.imageUrl} alt={u.name} />
      <AvatarFallback>{u.initials}</AvatarFallback>
    </Avatar>
  ))}
  <AvatarGroupCount>
    <span aria-hidden>+3</span>
    <span className="sr-only">and 3 more</span>
  </AvatarGroupCount>
</AvatarGroup>`,
          },
        ],
        pitfalls: [
          'Size via the `size` prop, not `className="size-12"` - a className resizes the circle but not the fallback text or the group count.',
          "Give every avatar in an `AvatarGroup` the same `size`; `AvatarGroupCount` reads it from them.",
          'Initials are read letter by letter. When the avatar stands alone, render `<span aria-hidden>LT</span><span className="sr-only">Lena Torres</span>` in the fallback.',
          'Next to a visible name, use `alt=""` and `aria-hidden` on the fallback so the name is not read twice.',
          "`next/image` needs `keepMounted` on `AvatarImage` (Base UI) to load in place.",
        ],
        a11y: [
          "Base UI sets `aria-hidden` on the image until it loads, so only the visible part is announced.",
          '`AvatarGroup` is a plain div - add `role="group"` and an `aria-label` summarising the people.',
          '`AvatarGroupCount` is a plain span, where `aria-label` is ignored - hide "+3" with `aria-hidden` and add sr-only text like "and 3 more".',
        ],
        tokens: ["--muted", "--foreground", "--background"],
        related: ["badge", "dropdown-menu", "tooltip"],
      },
    },
  },
  {
    name: "kbd",
    type: "registry:ui",
    title: "Kbd",
    description:
      "A keyboard key or shortcut, rendered as a native kbd element.",
    categories: ["primitives"],
    dependencies: [],
    registryDependencies: ["@fujin/utils"],
    files: [{ path: "registry/fujin/ui/kbd.tsx", type: "registry:ui" }],
    meta: {
      links: { doc: "/docs/components/kbd" },
      fujin: {
        summary:
          "Styled `<kbd>` for a key; `KbdGroup` (also `<kbd>`) marks up a combination. Inverts inside tooltips.",
        whenToUse: [
          "Showing a keyboard shortcut in help text, a menu item, a tooltip or a command palette.",
        ],
        whenNotToUse: [
          "Inline code or a value to copy - use `<code>`.",
          "A clickable key or on-screen keyboard - use `button`; `Kbd` has `pointer-events: none`.",
          "A status or count chip - use `badge`.",
        ],
        anatomy: `<KbdGroup>
  <Kbd>Ctrl</Kbd>+<Kbd>K</Kbd>
</KbdGroup>`,
        props: [],
        examples: [
          {
            title: "Shortcut",
            code: `<KbdGroup>
  <Kbd>Ctrl</Kbd>+<Kbd>K</Kbd>
</KbdGroup>`,
          },
          {
            title: "Symbol with a spoken name",
            code: `<Kbd>
  <span aria-hidden>⌘</span>
  <span className="sr-only">Command</span>
</Kbd>`,
          },
          {
            title: "In a tooltip",
            code: `<TooltipContent>
  Search <Kbd>/</Kbd>
</TooltipContent>`,
          },
        ],
        pitfalls: [
          "Symbols (⌘ ⌥ ⇧ ⌃) are announced inconsistently - hide the glyph and add sr-only text.",
          "Showing a shortcut does not create it; wire the key handler yourself.",
          "Show platform-correct keys (⌘ on macOS, Ctrl elsewhere).",
        ],
        a11y: [
          "Text is `foreground` on `muted` for 4.5:1 contrast (shadcn's muted-on-muted is ~4.3:1).",
          "Renders native `<kbd>`; combinations nest `<kbd>` as the HTML spec describes.",
        ],
        tokens: ["--muted", "--foreground", "--border", "--background"],
        related: ["tooltip", "command", "dropdown-menu"],
      },
    },
  },
  {
    name: "progress",
    type: "registry:ui",
    title: "Progress",
    description:
      "How far a task has got - determinate, or animated indeterminate while the total is unknown.",
    categories: ["feedback", "primitives"],
    dependencies: ["@base-ui/react"],
    registryDependencies: ["@fujin/utils"],
    files: [{ path: "registry/fujin/ui/progress.tsx", type: "registry:ui" }],
    css: {
      "@keyframes progress-indeterminate": {
        "0%": { transform: "translateX(-100%)" },
        "100%": { transform: "translateX(300%)" },
      },
    },
    meta: {
      links: {
        doc: "/docs/components/progress",
        api: "https://base-ui.com/react/components/progress",
      },
      fujin: {
        summary:
          'Progress bar (`role="progressbar"`) with optional label and value; `value={null}` is an animated indeterminate state.',
        whenToUse: [
          "A task moving towards completion: file upload, import, export, multi-step setup.",
          "Work of unknown length that will finish - `value={null}`.",
        ],
        whenNotToUse: [
          'A level within a range that is not "finishing" (storage used, quota, strength) - use `meter`.',
          "A short wait with no measurable progress in a small space - use `spinner`.",
          "Content with a known shape loading - use `skeleton`.",
          "A busy button - use `<Button loading>`.",
        ],
        anatomy: `<Progress value min max format>
  <ProgressLabel />   // optional; else aria-label
  <ProgressValue />   // optional
  {/* track + indicator are rendered for you */}
</Progress>`,
        props: [
          {
            owner: "Progress",
            name: "value",
            type: "number | null",
            required: true,
            description: "Current value. `null` = indeterminate.",
          },
          {
            owner: "Progress",
            name: "min / max",
            type: "number",
            default: "0 / 100",
            description: "Range.",
          },
          {
            owner: "Progress",
            name: "format",
            type: "Intl.NumberFormatOptions",
            description: "Value formatting; defaults to a percentage.",
          },
          {
            owner: "Progress",
            name: "getAriaValueText",
            type: "(formattedValue: string, value: number | null) => string",
            description:
              "Announced text. Match it to what `ProgressValue` shows.",
          },
          {
            owner: "ProgressValue",
            name: "children",
            type: "(formattedValue: string, value: number | null) => ReactNode",
            description:
              'Custom display. `formattedValue` is the string "indeterminate" while indeterminate.',
          },
        ],
        examples: [
          {
            title: "Upload",
            code: `<Progress value={uploaded}>
  <ProgressLabel>Uploading invoices.csv</ProgressLabel>
  <ProgressValue />
</Progress>`,
          },
          {
            title: "Indeterminate, no visible label",
            code: `<Progress value={null} aria-label="Preparing export" />`,
          },
        ],
        pitfalls: [
          'Needs an accessible name: a `ProgressLabel` child or `aria-label`. Without one it is announced as just "progress bar".',
          "`value` is required - pass `null` for indeterminate, not `undefined`.",
          "The indeterminate animation uses the `progress-indeterminate` keyframes the install adds to your CSS; if you copy the file by hand, add them or the bar sits still.",
          'The track and indicator are rendered for you - do not nest `ProgressTrack` inside `Progress`. Restyle the bar from the root: `className="[&_[data-slot=progress-indicator]]:bg-success"`.',
          "`ProgressValue` is `aria-hidden`; customised display text must be mirrored in `getAriaValueText`.",
        ],
        a11y: [
          '`role="progressbar"` with `aria-valuenow/min/max/valuetext` set by Base UI; `ProgressLabel` is linked via `aria-labelledby`.',
          "Indeterminate bar becomes a full-width pulse under `prefers-reduced-motion`; the width transition is disabled too.",
          'For completion announcements, pair with a `role="status"` message - progressbars are not live regions.',
        ],
        tokens: ["--primary", "--muted", "--muted-foreground"],
        related: ["meter", "spinner", "skeleton"],
      },
    },
  },
  {
    name: "empty",
    type: "registry:ui",
    title: "Empty",
    description: "An empty state - what is missing, why, and what to do next.",
    categories: ["feedback", "layout"],
    dependencies: ["class-variance-authority"],
    registryDependencies: ["@fujin/utils"],
    files: [{ path: "registry/fujin/ui/empty.tsx", type: "registry:ui" }],
    meta: {
      links: { doc: "/docs/components/empty" },
      fujin: {
        summary:
          "Centred empty state with decorative media, title, description and actions. Server-component safe.",
        whenToUse: [
          "A list, table or page with no records yet, or no results for the current filter/search.",
          "A feature that needs setup before it shows anything.",
        ],
        whenNotToUse: [
          'Data is still loading - use `skeleton` or `spinner`; showing "No invoices" before the fetch finishes is a bug.',
          "Something failed - use `alert` (variant `destructive`) with a retry.",
          "Inside `data-table` - pass its `emptyState` prop instead; the table renders its own empty row.",
        ],
        anatomy: `<Empty>
  <EmptyHeader>
    <EmptyMedia variant="default|icon" />
    <EmptyTitle />
    <EmptyDescription />
  </EmptyHeader>
  <EmptyContent>{actions}</EmptyContent>
</Empty>`,
        props: [
          {
            owner: "EmptyMedia",
            name: "variant",
            type: '"default" | "icon"',
            default: '"default"',
            description: "`icon` places the icon on a 40px muted tile.",
          },
        ],
        examples: [
          {
            title: "No records yet",
            code: `<Empty>
  <EmptyHeader>
    <EmptyMedia variant="icon"><ReceiptIcon /></EmptyMedia>
    <EmptyTitle>No invoices yet</EmptyTitle>
    <EmptyDescription>Create your first invoice to get started.</EmptyDescription>
  </EmptyHeader>
  <EmptyContent><Button>Create invoice</Button></EmptyContent>
</Empty>`,
          },
          {
            title: "No results",
            code: `<Empty>
  <EmptyHeader>
    <EmptyTitle>No invoices match "overdue"</EmptyTitle>
    <EmptyDescription>Try a different search or clear the filters.</EmptyDescription>
  </EmptyHeader>
  <EmptyContent>
    <Button variant="outline" onClick={clearFilters}>Clear filters</Button>
  </EmptyContent>
</Empty>`,
          },
        ],
        pitfalls: [
          "`EmptyMedia` is `aria-hidden` by default; pass `aria-hidden={false}` if it conveys information.",
          "`Empty` has `flex-1` - it grows to fill a flex parent; set a height or wrap it if that is not wanted.",
          'The dashed border needs `border` added: `<Empty className="border">`.',
          'No-results states should offer "Clear filters", not "Create".',
        ],
        a11y: [
          '`EmptyTitle` is a `div`; add `role="heading" aria-level={n}` when the empty state replaces a page section.',
          'When the empty state appears after a search, announce the result count via a `role="status"` region.',
        ],
        tokens: [
          "--muted",
          "--muted-foreground",
          "--foreground",
          "--primary",
          "--border",
        ],
        related: ["card", "alert", "skeleton", "data-table"],
      },
    },
  },
  {
    name: "meter",
    type: "registry:ui",
    title: "Meter",
    description:
      "A measurement within a known range, like storage used or quota consumed.",
    categories: ["feedback", "data"],
    dependencies: ["@base-ui/react"],
    registryDependencies: ["@fujin/utils"],
    files: [{ path: "registry/fujin/ui/meter.tsx", type: "registry:ui" }],
    meta: {
      links: {
        doc: "/docs/components/meter",
        api: "https://base-ui.com/react/components/meter",
      },
      fujin: {
        summary:
          'Horizontal gauge (`role="meter"`) for a value inside a known range, with optional label and value text.',
        whenToUse: [
          "Storage used, seats taken, API quota consumed, budget spent, password strength.",
        ],
        whenNotToUse: [
          "Progress of a task that will complete (upload, import, onboarding steps) - use `progress`; screen readers announce it as a progressbar.",
          "Unknown total or indeterminate work - use `progress` with `value={null}` or `spinner`; a meter always has a value.",
          "Comparing many values - use a bar chart.",
          "A value the user sets - use `slider`.",
        ],
        anatomy: `<Meter value min max format getAriaValueText>
  <MeterLabel />   // optional; else aria-label
  <MeterValue />   // optional
  {/* track + indicator are rendered for you */}
</Meter>`,
        props: [
          {
            owner: "Meter",
            name: "value",
            type: "number",
            required: true,
            description: "Current value, clamped to min..max.",
          },
          {
            owner: "Meter",
            name: "min / max",
            type: "number",
            default: "0 / 100",
            description: "Range.",
          },
          {
            owner: "Meter",
            name: "format",
            type: "Intl.NumberFormatOptions",
            description:
              "Value formatting; defaults to a percentage of the range.",
          },
          {
            owner: "Meter",
            name: "getAriaValueText",
            type: "(formattedValue: string, value: number) => string",
            description: "Announced text. Match it to what `MeterValue` shows.",
          },
          {
            owner: "MeterValue",
            name: "children",
            type: "(formattedValue: string, value: number) => ReactNode",
            description: "Custom display text.",
          },
        ],
        examples: [
          {
            title: "Storage",
            code: `<Meter
  value={32.4}
  max={50}
  getAriaValueText={(_, v) => \`\${v} of 50 GB\`}
>
  <MeterLabel>Storage used</MeterLabel>
  <MeterValue>{(_, v) => \`\${v} of 50 GB\`}</MeterValue>
</Meter>`,
          },
          {
            title: "Nearly full, coloured",
            code: `<Meter value={92} className="[&_[data-slot=meter-indicator]]:bg-destructive">
  <MeterLabel>API quota (nearly used up)</MeterLabel>
  <MeterValue />
</Meter>`,
          },
        ],
        pitfalls: [
          "Needs an accessible name: a `MeterLabel` child or `aria-label`.",
          "`MeterValue` is `aria-hidden`; screen readers hear `aria-valuetext` (a percentage by default). Mirror custom display text in `getAriaValueText`.",
          "Function children and `getAriaValueText` require the calling component to be a Client Component.",
          "The track and indicator are rendered for you; restyle the bar from the root with `[&_[data-slot=meter-indicator]]:...`.",
          "Colour alone (red = nearly full) fails WCAG 1.4.1 - say it in the label or value text.",
        ],
        a11y: [
          '`role="meter"` with `aria-valuenow/min/max/valuetext` from Base UI; `MeterLabel` is linked via `aria-labelledby`.',
          '`role="meter"` is ARIA 1.2; older screen readers may fall back to reading only the value text, so keep `getAriaValueText` meaningful.',
        ],
        tokens: ["--primary", "--muted", "--muted-foreground"],
        related: ["progress", "slider"],
      },
    },
  },
  {
    name: "label",
    type: "registry:ui",
    title: "Label",
    description:
      "A standalone label for controls that are not inside a Field, such as a checkbox with text beside it.",
    categories: ["primitives", "forms"],
    dependencies: [],
    registryDependencies: ["@fujin/utils"],
    files: [{ path: "registry/fujin/ui/label.tsx", type: "registry:ui" }],
    meta: {
      fujin: {
        summary:
          "Plain `<label>` styled for form text; dims when the control it labels is disabled.",
        whenToUse: [
          "A checkbox or switch with inline text and no description or error - wrap both in `<Label>`.",
          "Labelling a native `<input>`/`<select>` outside a Field with `htmlFor`.",
        ],
        whenNotToUse: [
          "Inside `<Field>` - use `FieldLabel`, which links itself to the control and reflects the invalid state.",
          "Naming a group of controls - use `FieldSet` + `FieldLegend`.",
          "Visually hidden names for icon buttons - use `aria-label` on the button.",
        ],
        anatomy: `<Label>
  <Checkbox /> Text
</Label>
<Label htmlFor="id">Text</Label>`,
        props: [
          {
            name: "htmlFor",
            type: "string",
            description:
              "Id of a native control. Not needed when the label wraps the control.",
          },
        ],
        examples: [
          {
            title: "Wrapping a checkbox",
            code: `<Label>
  <Checkbox name="terms" required />
  I accept the terms
</Label>`,
          },
          {
            title: "Native input",
            code: `<Label htmlFor="coupon">Coupon</Label>
<input id="coupon" name="coupon" />`,
          },
        ],
        pitfalls: [
          "Base UI `Checkbox`/`Switch` render a `<span>` plus a hidden input - wrap them in `<Label>`; `htmlFor` would point at the hidden input, not the visible control.",
          "Only dims for a disabled control that is its previous sibling (`peer`), inside it, or inside a `group` with `data-disabled`.",
          'No `"use client"` - it is a plain element, safe in Server Components.',
        ],
        a11y: [
          "Wrapping or `htmlFor` gives the control its accessible name and makes the text a click target, enlarging small controls' hit area.",
          "When wrapping a disabled control it mutes the text instead of lowering opacity, so the control is not dimmed twice.",
        ],
        tokens: ["--muted-foreground"],
        related: ["field", "checkbox", "switch"],
      },
    },
  },
  {
    name: "textarea",
    type: "registry:ui",
    title: "Textarea",
    description:
      "A multi-line text input that grows with its content and wires itself into the surrounding Field.",
    categories: ["primitives", "forms"],
    dependencies: ["@base-ui/react"],
    registryDependencies: ["@fujin/utils"],
    files: [{ path: "registry/fujin/ui/textarea.tsx", type: "registry:ui" }],
    meta: {
      links: { api: "https://base-ui.com/react/components/field" },
      fujin: {
        summary:
          "Auto-growing `<textarea>` rendered through Base UI Field.Control; labelled, described and validated inside `<Field>`.",
        whenToUse: [
          "Free text longer than one line: notes, descriptions, messages, addresses.",
        ],
        whenNotToUse: [
          "Single-line values - use `input`.",
          "Formatted rich text - use an editor component; a textarea is plain text only.",
          "Code or JSON entry that needs syntax highlighting - use a code editor.",
        ],
        props: [
          {
            name: "onValueChange",
            type: "(value: string, details) => void",
            description: "Called with the string value. `onChange` also works.",
          },
          {
            name: "maxLength",
            type: "number",
            description:
              "Native limit. Show a count yourself in `FieldDescription` (see example).",
          },
          {
            name: "className",
            type: "string",
            description:
              "Add `max-h-*` to cap the auto-grow, or `field-sizing-fixed` to size by `rows`.",
          },
        ],
        examples: [
          {
            title: "In a field with a character count",
            code: `const [bio, setBio] = React.useState("")

<Field name="bio">
  <FieldLabel>Bio</FieldLabel>
  <Textarea value={bio} onValueChange={setBio} maxLength={160} />
  <FieldDescription>{bio.length}/160</FieldDescription>
</Field>`,
          },
        ],
        pitfalls: [
          "Grows by default (`field-sizing: content`) with no maximum - add `max-h-*` in long forms. Browsers without `field-sizing` use `rows` instead.",
          "There is no built-in character counter; render one in `FieldDescription`. Do not put it in an `aria-live` region - announcing every keystroke is noisy.",
          "Do not pass `id`/`aria-describedby` by hand inside `<Field>`.",
        ],
        a11y: [
          "Inside `<Field>`, label/description/error association and `aria-invalid` are automatic.",
          "Solid 2px focus ring (WCAG 1.4.11).",
        ],
        tokens: ["--input", "--ring", "--destructive", "--muted-foreground"],
        related: ["input", "field"],
      },
    },
  },
  {
    name: "native-select",
    type: "registry:ui",
    title: "Native Select",
    description:
      "A styled native <select> with a chevron. Uses the OS picker and works inside Field.",
    categories: ["primitives", "forms"],
    dependencies: ["@base-ui/react", "lucide-react"],
    registryDependencies: ["@fujin/utils"],
    files: [
      { path: "registry/fujin/ui/native-select.tsx", type: "registry:ui" },
    ],
    meta: {
      links: { api: "https://base-ui.com/react/components/field" },
      fujin: {
        summary:
          "Native `<select>` with Fujin styling, `sm`/`default` sizes, and Field wiring via Base UI Field.Control.",
        whenToUse: [
          "Picking one value from a short, static list where the platform picker is fine (country, time zone, sort order).",
          "Mobile-heavy forms - the OS picker is the most usable option on touch devices.",
          "Plain HTML form posts / server actions with no client state.",
        ],
        whenNotToUse: [
          "Options need icons, descriptions or custom rendering - use `select`.",
          "Long lists that need search - use `combobox`.",
          "Choosing several values - use `checkbox` group or a multi `combobox`; `<select multiple>` is hard to use.",
          "Two to five options that should all be visible - use `radio-group`.",
        ],
        anatomy: `<NativeSelect size?>
  <NativeSelectOption value="" disabled>Placeholder</NativeSelectOption>
  <NativeSelectOptGroup label>
    <NativeSelectOption value />
  </NativeSelectOptGroup>
</NativeSelect>`,
        props: [
          {
            owner: "NativeSelect",
            name: "size",
            type: '"default" | "sm"',
            default: '"default"',
            description: "36px or 32px tall.",
          },
          {
            owner: "NativeSelect",
            name: "className",
            type: "string",
            description:
              "Applied to the wrapper (full width by default); the select fills it. Size with `w-*` here.",
          },
          {
            owner: "NativeSelect",
            name: "onValueChange",
            type: "(value: string, details) => void",
            description:
              "Called with the selected value. `onChange` also works.",
          },
        ],
        examples: [
          {
            title: "Required, with a placeholder",
            code: `<Field name="country" invalid={Boolean(error)}>
  <FieldLabel required>Country</FieldLabel>
  <NativeSelect required defaultValue="" onValueChange={() => setError(undefined)}>
    <NativeSelectOption value="" disabled>Select a country</NativeSelectOption>
    <NativeSelectOption value="DE">Germany</NativeSelectOption>
    <NativeSelectOption value="FR">France</NativeSelectOption>
  </NativeSelect>
  <FieldError errors={[error]} />
</Field>
// in the form's onSubmit: if (!formData.get("country")) setError("Choose a country.")`,
          },
        ],
        pitfalls: [
          "`className` sizes the wrapper, not the `<select>` (shadcn puts it on the select).",
          'For a placeholder, use a first option with `value=""` and `disabled`, plus `defaultValue=""` - `placeholder` does nothing on a select.',
          "Base UI only reports `valueMissing` once the value has changed, so an untouched placeholder select never errors on blur. Check it on submit and pass `invalid` + `FieldError errors`.",
          "`size` is the visual size; the native `size` (visible rows) attribute is not supported.",
          "Option styling is ignored on macOS/iOS - do not rely on it.",
        ],
        a11y: [
          "Native semantics and keyboard (typeahead, arrow keys) - nothing to wire up.",
          "Inside `<Field>`, label/description/error and `aria-invalid` are automatic.",
          "Chevron is decorative (`aria-hidden`).",
        ],
        tokens: [
          "--input",
          "--ring",
          "--destructive",
          "--muted-foreground",
          "--popover",
        ],
        related: ["select", "combobox", "radio-group", "field"],
      },
    },
  },
  {
    name: "number-field",
    type: "registry:ui",
    title: "Number Field",
    description:
      "A numeric input with stepper buttons, min/max/step and locale-aware currency or percent formatting.",
    categories: ["primitives", "forms"],
    dependencies: ["@base-ui/react", "lucide-react"],
    registryDependencies: ["@fujin/utils"],
    files: [
      { path: "registry/fujin/ui/number-field.tsx", type: "registry:ui" },
    ],
    meta: {
      links: { api: "https://base-ui.com/react/components/number-field" },
      fujin: {
        summary:
          "Base UI NumberField: `- [input] +` with clamping, stepping, arrow keys and `Intl.NumberFormat` formatting.",
        whenToUse: [
          "Quantities, prices, percentages and other bounded numbers.",
          "Currency or percent entry that should display formatted (`format`).",
        ],
        whenNotToUse: [
          'Identifiers made of digits (phone numbers, card numbers, ZIP codes, OTPs) - use `input` with `inputMode="numeric"`, or `otp-field` for codes.',
          "Picking an approximate value from a range - use `slider`.",
          "Years or dates - use a date picker.",
        ],
        anatomy: `<NumberField min max step format />  // default layout
<NumberField>
  <NumberFieldGroup>
    <NumberFieldDecrement />
    <NumberFieldInput />
    <NumberFieldIncrement />
  </NumberFieldGroup>
</NumberField>`,
        props: [
          {
            owner: "NumberField",
            name: "value",
            type: "number | null",
            description: "Controlled value. `null` when the input is empty.",
          },
          {
            owner: "NumberField",
            name: "onValueChange",
            type: "(value: number | null, details) => void",
            description: "Called on every parseable change.",
          },
          {
            owner: "NumberField",
            name: "onValueCommitted",
            type: "(value: number | null, details) => void",
            description:
              "Called on blur or when a stepper press ends - use it for saves.",
          },
          {
            owner: "NumberField",
            name: "min / max",
            type: "number",
            description: "Clamp bounds. Steppers disable at the bounds.",
          },
          {
            owner: "NumberField",
            name: "step",
            type: "number | 'any'",
            default: "1",
            description:
              "Button/arrow-key increment. Shift uses `largeStep` (10), Alt uses `smallStep` (0.1).",
          },
          {
            owner: "NumberField",
            name: "format",
            type: "Intl.NumberFormatOptions",
            description:
              'e.g. `{ style: "currency", currency: "USD" }` or `{ style: "percent" }`.',
          },
          {
            owner: "NumberField",
            name: "children",
            type: "ReactNode",
            description:
              "Omit for the default `- [input] +` layout; pass the parts to customise.",
          },
        ],
        examples: [
          {
            title: "Quantity",
            code: `<Field name="quantity">
  <FieldLabel>Quantity</FieldLabel>
  <NumberField defaultValue={1} min={1} max={99} />
</Field>`,
          },
          {
            title: "Currency",
            code: `<NumberField
  value={price}
  onValueChange={setPrice}
  min={0}
  step={0.5}
  format={{ style: "currency", currency: "EUR" }}
/>`,
          },
          {
            title: "Custom input props",
            code: `<NumberField min={0}>
  <NumberFieldGroup>
    <NumberFieldInput placeholder="0" />
    <NumberFieldIncrement />
  </NumberFieldGroup>
</NumberField>`,
          },
        ],
        pitfalls: [
          '`format={{ style: "percent" }}` treats values as fractions: 0.15 displays as "15%", so use `step={0.01}` and `max={1}`.',
          "`value` is `number | null`, never a string; empty input gives `null`.",
          "Input props such as `placeholder` go on `NumberFieldInput` - compose the parts instead of passing them to `NumberField`.",
          "Steppers are not in the Tab order by design (Base UI); Arrow Up/Down provide the same action for keyboard users.",
          "Do not use for digit strings where leading zeros matter.",
        ],
        a11y: [
          'Steppers are labelled "Increase"/"Decrease" and are 36px wide (WCAG 2.5.8).',
          "Inside `<Field>`, label/description/error association and invalid state are automatic.",
          "Solid 2px ring on the group while the input has focus.",
        ],
        tokens: [
          "--input",
          "--ring",
          "--destructive",
          "--accent",
          "--muted-foreground",
        ],
        related: ["input", "slider", "field", "otp-field"],
      },
    },
  },
  {
    name: "otp-field",
    type: "registry:ui",
    title: "OTP Field",
    description:
      "One-time code input with a slot per character - Fujin's equivalent of shadcn/ui's input-otp. Supports full-code paste and SMS autofill.",
    categories: ["primitives", "forms"],
    dependencies: ["@base-ui/react", "lucide-react"],
    registryDependencies: ["@fujin/utils"],
    files: [{ path: "registry/fujin/ui/otp-field.tsx", type: "registry:ui" }],
    meta: {
      links: { api: "https://base-ui.com/react/components/otp-field" },
      fujin: {
        summary:
          "Base UI OTPField (the input-otp equivalent): one real input per character, numeric by default, paste and `one-time-code` autofill built in.",
        whenToUse: [
          "Verification codes from SMS, email or an authenticator app (2FA, sign-in links).",
          'Fixed-length recovery or invite codes (`validationType="alphanumeric"`).',
        ],
        whenNotToUse: [
          'Passwords or PINs of variable length - use `input` with `type="password"`.',
          "Codes longer than ~8 characters (license keys, gift cards) - one `input` is easier to paste into and edit.",
          "Numbers that are quantities - use `number-field`.",
        ],
        anatomy: `<OTPField length={6} />  // default: one group of 6 slots
<OTPField length={6}>
  <OTPFieldGroup>
    <OTPFieldSlot /><OTPFieldSlot /><OTPFieldSlot />
  </OTPFieldGroup>
  <OTPFieldSeparator />
  <OTPFieldGroup>
    <OTPFieldSlot /><OTPFieldSlot /><OTPFieldSlot />
  </OTPFieldGroup>
</OTPField>`,
        props: [
          {
            owner: "OTPField",
            name: "length",
            type: "number",
            required: true,
            description:
              "Number of characters. Must match the number of slots when you pass children.",
          },
          {
            owner: "OTPField",
            name: "value / onValueChange",
            type: "string / (value: string, details) => void",
            description: "Controlled value. `defaultValue` for uncontrolled.",
          },
          {
            owner: "OTPField",
            name: "onValueComplete",
            type: "(value: string, details) => void",
            description:
              "Fires once every slot is filled (typed or pasted). Verify the code here.",
          },
          {
            owner: "OTPField",
            name: "autoSubmit",
            type: "boolean",
            default: "false",
            description: "Submits the owning form when complete.",
          },
          {
            owner: "OTPField",
            name: "validationType",
            type: '"numeric" | "alpha" | "alphanumeric" | "none"',
            default: '"numeric"',
            description: "Allowed characters; also sets the mobile keyboard.",
          },
          {
            owner: "OTPField",
            name: "mask",
            type: "boolean",
            default: "false",
            description: "Obscures characters like a password.",
          },
          {
            owner: "OTPField",
            name: "autoComplete",
            type: "string",
            default: '"one-time-code"',
            description:
              "Applied to the first slot for SMS/password-manager autofill.",
          },
          {
            owner: "OTPFieldSlot",
            name: "aria-label",
            type: "string",
            description:
              'Defaults to "Character n of m" on slots after the first. Pass to localise.',
          },
        ],
        examples: [
          {
            title: "Verify on completion",
            code: `<Field name="code" invalid={invalid}>
  <FieldLabel>Verification code</FieldLabel>
  <OTPField
    length={6}
    onValueChange={() => setInvalid(false)}
    onValueComplete={async (code) => setInvalid(!(await verify(code)))}
  />
  <FieldError errors={[invalid ? "That code is not valid." : null]} />
</Field>`,
          },
          {
            title: "Grouped 3-3",
            code: `<OTPField length={6}>
  <OTPFieldGroup>
    <OTPFieldSlot /><OTPFieldSlot /><OTPFieldSlot />
  </OTPFieldGroup>
  <OTPFieldSeparator />
  <OTPFieldGroup>
    <OTPFieldSlot /><OTPFieldSlot /><OTPFieldSlot />
  </OTPFieldGroup>
</OTPField>`,
          },
        ],
        pitfalls: [
          "Coming from shadcn's `input-otp`: slots have no `index` prop (order comes from the DOM) and the root takes `length`, not `maxLength`.",
          "`length` is required even when you render the slots yourself; keep it equal to the slot count.",
          "Needs an accessible name: put it in `<Field>` with `FieldLabel`, or give the root an `id` and use `<label htmlFor>`. `aria-label` on the first slot is ignored.",
          "Do not clear the slots on a wrong code - keep the value and show `FieldError` so the user can correct it.",
          "Never intercept `onPaste`; pasting the whole code into any slot is handled.",
        ],
        a11y: [
          "Each slot is a real input with a solid focus ring on the active one; arrow keys, Backspace and Home/End move between slots.",
          "Only the active slot is in the Tab order, so the field is a single Tab stop.",
          'Slots after the first get "Character n of m" labels automatically.',
          "`aria-invalid` is set on every slot when the Field is invalid.",
        ],
        tokens: ["--input", "--ring", "--destructive", "--muted-foreground"],
        related: ["input", "field", "number-field"],
      },
    },
  },
  {
    name: "switch",
    type: "registry:ui",
    title: "Switch",
    description:
      "An on/off toggle for settings that apply immediately. Two sizes, both with a 24px target.",
    categories: ["primitives", "forms"],
    dependencies: ["@base-ui/react"],
    registryDependencies: ["@fujin/utils"],
    files: [{ path: "registry/fujin/ui/switch.tsx", type: "registry:ui" }],
    meta: {
      links: { api: "https://base-ui.com/react/components/switch" },
      fujin: {
        summary:
          'Base UI Switch (track + thumb) in `default` and `sm` sizes; pair with `<Field orientation="horizontal">`.',
        whenToUse: [
          "A setting that takes effect immediately (notifications, dark mode, feature toggles).",
          "Settings lists where each row is label + switch.",
        ],
        whenNotToUse: [
          'A choice that only applies when a form is submitted, or consent ("I accept the terms") - use `checkbox`.',
          "Selecting rows or items in a list - use `checkbox`.",
          "Toolbar on/off buttons (bold, italic) - use `toggle`.",
          "More than two states - use `radio-group` or `toggle-group`.",
        ],
        anatomy: `<Field orientation="horizontal">
  <FieldLabel />
  <Switch size? />
</Field>`,
        props: [
          {
            name: "checked / onCheckedChange",
            type: "boolean / (checked: boolean, details) => void",
            description: "Controlled state. `defaultChecked` for uncontrolled.",
          },
          {
            name: "size",
            type: '"default" | "sm"',
            default: '"default"',
            description:
              "36x20px or 28x16px track; both keep a 24px-tall hit area.",
          },
          {
            name: "name / value / uncheckedValue",
            type: "string",
            description:
              'Form submission. Submits "on" when checked and nothing when off, unless `uncheckedValue` is set.',
          },
        ],
        examples: [
          {
            title: "Settings row",
            code: `<Field orientation="horizontal">
  <FieldLabel>Weekly digest</FieldLabel>
  <Switch checked={digest} onCheckedChange={setDigest} />
</Field>`,
          },
          {
            title: "Inline, outside a Field",
            code: `<Label>
  <Switch size="sm" />
  Compact rows
</Label>`,
          },
        ],
        pitfalls: [
          'Renders a `<span role="switch">` plus a hidden input, so a sibling `<label htmlFor>` does not label it - use `FieldLabel` inside `Field`, or wrap it in `Label`.',
          "Unchecked switches submit nothing, like checkboxes; set `uncheckedValue` if the server needs an explicit off value.",
          "Standalone switches need `aria-label` or `aria-labelledby`.",
        ],
        a11y: [
          "Off track uses `muted-foreground` so the track and thumb reach 3:1 contrast (WCAG 1.4.11); shadcn's pale `input` track does not.",
          "Both sizes have a 24px-tall hit area (WCAG 2.5.8).",
          "Solid 2px focus ring with offset; Space toggles.",
        ],
        tokens: [
          "--primary",
          "--muted-foreground",
          "--background",
          "--ring",
          "--destructive",
        ],
        related: ["checkbox", "toggle", "field", "label"],
      },
    },
  },
  {
    name: "breadcrumb",
    type: "registry:ui",
    title: "Breadcrumb",
    description:
      "The path from the site root to the current page. Server-component safe.",
    categories: ["navigation"],
    dependencies: ["@base-ui/react", "lucide-react"],
    registryDependencies: ["@fujin/utils"],
    files: [{ path: "registry/fujin/ui/breadcrumb.tsx", type: "registry:ui" }],
    meta: {
      links: {
        doc: "/docs/components/breadcrumb",
        api: "https://base-ui.com/react/utils/use-render",
      },
      fujin: {
        summary:
          "Breadcrumb trail (nav > ol > li) with router-link support via `render` and `aria-current` on the current page.",
        whenToUse: [
          "Showing where a page sits in a hierarchy (settings > billing > invoices).",
          "Letting users jump back up to a parent level in one click.",
        ],
        whenNotToUse: [
          "Flat sites with no hierarchy - a breadcrumb of one item adds noise.",
          "Wizard or checkout steps - that is a stepper, the steps are not ancestors.",
          "Primary navigation between sibling sections - use `tabs` or a nav menu.",
          "Browser-history style 'back' - a breadcrumb shows location, not history.",
        ],
        anatomy: `<Breadcrumb>
  <BreadcrumbList>
    <BreadcrumbItem>
      <BreadcrumbLink render={<Link href="/" />}>Home</BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem>
      <BreadcrumbEllipsis />   {/* inside a menu trigger */}
    </BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem>
      <BreadcrumbPage>Current</BreadcrumbPage>
    </BreadcrumbItem>
  </BreadcrumbList>
</Breadcrumb>`,
        props: [
          {
            name: "aria-label",
            type: "string",
            default: '"Breadcrumb"',
            description: "Landmark name of the <nav>.",
            owner: "Breadcrumb",
          },
          {
            name: "render",
            type: "ReactElement | (props, state) => ReactElement",
            description:
              "Render a router link instead of a plain <a>: `render={<Link href='/x' />}`. Replaces shadcn's `asChild`.",
            owner: "BreadcrumbLink",
          },
          {
            name: "children",
            type: "ReactNode",
            default: "<ChevronRightIcon />",
            description: "Custom separator glyph. Always aria-hidden.",
            owner: "BreadcrumbSeparator",
          },
          {
            name: "label",
            type: "string",
            default: '"More"',
            description: "Screen-reader text for the collapsed-levels marker.",
            owner: "BreadcrumbEllipsis",
          },
        ],
        examples: [
          {
            title: "With Next.js links",
            code: `<Breadcrumb>
  <BreadcrumbList>
    <BreadcrumbItem>
      <BreadcrumbLink render={<Link href="/" />}>Home</BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem>
      <BreadcrumbLink render={<Link href="/settings" />}>Settings</BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem>
      <BreadcrumbPage>Billing</BreadcrumbPage>
    </BreadcrumbItem>
  </BreadcrumbList>
</Breadcrumb>`,
          },
          {
            title: "Collapsed levels in a menu",
            code: `<BreadcrumbItem>
  <DropdownMenu>
    <DropdownMenuTrigger aria-label="Show hidden levels">
      <BreadcrumbEllipsis />
    </DropdownMenuTrigger>
    <DropdownMenuContent align="start">
      <DropdownMenuItem render={<Link href="/docs" />}>Documentation</DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</BreadcrumbItem>`,
          },
        ],
        pitfalls: [
          "`asChild` does not exist - use `render` on `BreadcrumbLink`.",
          "`BreadcrumbSeparator` is an <li>: place it between items as a sibling, never inside a `BreadcrumbItem`.",
          "The last item is `BreadcrumbPage`, not a link to the current URL.",
          "`BreadcrumbEllipsis` alone hides levels with no way to reach them - wrap it in a menu trigger that lists them.",
          "Two breadcrumbs on one page need distinct `aria-label`s.",
        ],
        a11y: [
          'Renders <nav aria-label="Breadcrumb"> with an ordered list, per the APG breadcrumb pattern.',
          '`BreadcrumbPage` sets `aria-current="page"` and is not a link (no fake `role="link"`).',
          "Separators are aria-hidden; the list structure conveys order.",
          "Links are at least 24px tall (WCAG 2.5.8) with a solid focus ring.",
        ],
        tokens: ["--muted-foreground", "--foreground", "--ring"],
        related: ["dropdown-menu", "pagination"],
      },
    },
  },
  {
    name: "pagination",
    type: "registry:ui",
    title: "Pagination",
    description:
      "Page navigation with a stable-width page window, in button or link mode.",
    categories: ["navigation"],
    dependencies: [
      "@base-ui/react",
      "class-variance-authority",
      "lucide-react",
    ],
    registryDependencies: [
      "@fujin/utils",
      "@fujin/button",
      "@fujin/use-pagination",
    ],
    files: [{ path: "registry/fujin/ui/pagination.tsx", type: "registry:ui" }],
    meta: {
      links: {
        doc: "/docs/components/pagination",
        api: "https://base-ui.com/react/utils/use-render",
      },
      fujin: {
        summary:
          "Previous/Next plus a page window with ellipses (`PaginationControls`), or low-level parts for custom markup. 1-based pages.",
        whenToUse: [
          "Paging through a server-paginated list where the total page count is known.",
          "Shareable page URLs - use link mode (`getHref`).",
        ],
        whenNotToUse: [
          "Paging a TanStack table built with `data-table` - it ships its own `DataTablePagination`.",
          "Feeds and chat logs without a known total - use a 'Load more' button or infinite scroll.",
          "Fewer than ~2 pages - render nothing rather than a single disabled control.",
          "Stepping through a multi-step form - that is a stepper, not pagination.",
        ],
        anatomy: `<PaginationControls page pageCount onPageChange />

// or, from parts:
<Pagination>
  <PaginationContent>
    <PaginationItem><PaginationPrevious href disabled /></PaginationItem>
    <PaginationItem><PaginationLink href isActive>1</PaginationLink></PaginationItem>
    <PaginationItem><PaginationEllipsis /></PaginationItem>
    <PaginationItem><PaginationNext href disabled /></PaginationItem>
  </PaginationContent>
</Pagination>`,
        props: [
          {
            name: "page",
            type: "number",
            description:
              "Current page, 1-based. Omit (and use `defaultPage`) for uncontrolled. Clamped to [1, pageCount].",
            owner: "PaginationControls",
          },
          {
            name: "defaultPage",
            type: "number",
            default: "1",
            description: "Initial page when uncontrolled.",
            owner: "PaginationControls",
          },
          {
            name: "pageCount",
            type: "number",
            required: true,
            description: "Total number of pages.",
            owner: "PaginationControls",
          },
          {
            name: "onPageChange",
            type: "(page: number) => void",
            description:
              "Button mode: called with the requested page. Not called in link mode.",
            owner: "PaginationControls",
          },
          {
            name: "getHref",
            type: "(page: number) => string",
            description:
              "Switches to link mode: pages render as links to these URLs.",
            owner: "PaginationControls",
          },
          {
            name: "renderLink",
            type: "(href: string, page: number) => ReactElement",
            description:
              "Link mode: the link element, e.g. `(href) => <Link href={href} />`. Defaults to <a>.",
            owner: "PaginationControls",
          },
          {
            name: "siblings",
            type: "number",
            default: "1",
            description: "Pages shown on each side of the current page.",
            owner: "PaginationControls",
          },
          {
            name: "boundaries",
            type: "number",
            default: "1",
            description: "Pages always shown at the start and end.",
            owner: "PaginationControls",
          },
          {
            name: "labels",
            type: "{ previous?: ReactNode; next?: ReactNode; page?: (n: number) => string; ellipsis?: string }",
            description:
              'Translatable text. `page` defaults to "Page n" and must contain the number.',
            owner: "PaginationControls",
          },
          {
            name: "isActive",
            type: "boolean",
            default: "false",
            description: 'Current page: outline style and aria-current="page".',
            owner: "PaginationLink",
          },
          {
            name: "disabled",
            type: "boolean",
            default: "false",
            description:
              "Sets aria-disabled, drops href and ignores clicks. Also on PaginationPrevious/Next.",
            owner: "PaginationLink",
          },
          {
            name: "render",
            type: "ReactElement | (props, state) => ReactElement",
            description:
              'An <a> by default. `render={<Link href="?page=2" />}` for a router link, `render={<button type="button" />}` for a button.',
            owner: "PaginationLink",
          },
          {
            name: "size",
            type: "Button size",
            default: '"icon"',
            description: "Same sizes as `button`. Keep >= 24px.",
            owner: "PaginationLink",
          },
          {
            name: "label",
            type: "ReactNode",
            default: '"Previous" / "Next"',
            description:
              "Visible text and accessible name; visually hidden below `sm`.",
            owner: "PaginationPrevious",
          },
        ],
        examples: [
          {
            title: "Button mode",
            code: `const [page, setPage] = React.useState(1)

<PaginationControls page={page} pageCount={24} onPageChange={setPage} />`,
          },
          {
            title: "Link mode (Client Component)",
            code: `<PaginationControls
  page={page}
  pageCount={pageCount}
  getHref={(p) => \`?page=\${p}\`}
  renderLink={(href) => <Link href={href} />}
/>`,
          },
          {
            title: "Server Component, from parts",
            code: `const page = Number(searchParams.page ?? 1)

<Pagination>
  <PaginationContent>
    <PaginationItem>
      <PaginationPrevious href={\`?page=\${page - 1}\`} disabled={page <= 1} />
    </PaginationItem>
    {getPageWindow({ page, pageCount }).map((item, i) =>
      item === "ellipsis" ? (
        <PaginationItem key={\`e\${i}\`}><PaginationEllipsis /></PaginationItem>
      ) : (
        <PaginationItem key={item}>
          <PaginationLink href={\`?page=\${item}\`} isActive={item === page} aria-label={\`Page \${item}\`}>
            {item}
          </PaginationLink>
        </PaginationItem>
      )
    )}
    <PaginationItem>
      <PaginationNext href={\`?page=\${page + 1}\`} disabled={page >= pageCount} />
    </PaginationItem>
  </PaginationContent>
</Pagination>`,
          },
          {
            title: "TanStack Table (0-based pageIndex)",
            code: `<PaginationControls
  page={table.getState().pagination.pageIndex + 1}
  pageCount={table.getPageCount()}
  onPageChange={(p) => table.setPageIndex(p - 1)}
/>`,
          },
        ],
        pitfalls: [
          "Pages are 1-based. TanStack Table's pageIndex is 0-based - add/subtract 1 at the boundary.",
          "The file is a client module: a Server Component cannot pass `getHref`/`renderLink`/`onPageChange`. Build from the parts + `getPageWindow` (server-safe) instead.",
          "In link mode `onPageChange` is not called and `page` must come from the URL - clicks navigate.",
          "A router link passed via `render` keeps its own href: do not render a disabled Previous/Next as a <Link>, pass `disabled` without `render`.",
          "`asChild` does not exist - use `render` on `PaginationLink`.",
          "`page` beyond `pageCount` is clamped for display only; reset your own state when a filter shrinks `pageCount`.",
          "Two paginations on one page (top and bottom) need distinct `aria-label`s on the nav.",
        ],
        a11y: [
          'Renders <nav aria-label="Pagination"> with a list; the current page has aria-current="page".',
          'Page buttons are named "Page n" (contains the visible number, WCAG 2.5.3).',
          "Previous/Next are named by their visible text, which becomes sr-only below `sm`.",
          "Disabled ends use aria-disabled, so a focused Next button keeps focus on the last page.",
          "Page buttons are keyed by page number: the clicked page keeps focus as the window re-centres.",
          "All targets are 36px (>= 24px, WCAG 2.5.8) with a solid focus ring; the window has a fixed item count so targets do not move under the pointer.",
        ],
        tokens: ["--accent", "--input", "--ring", "--muted-foreground"],
        related: ["use-pagination", "button", "data-table"],
        editing: {
          ui: ["components/ui/pagination.tsx"],
          logic: ["lib/pagination.ts"],
        },
      },
    },
  },
  {
    name: "scroll-area",
    type: "registry:ui",
    title: "Scroll Area",
    description:
      "A native scroll container with styled, auto-hiding scrollbars on both axes.",
    categories: ["layout"],
    dependencies: ["@base-ui/react"],
    registryDependencies: ["@fujin/utils"],
    files: [{ path: "registry/fujin/ui/scroll-area.tsx", type: "registry:ui" }],
    meta: {
      links: {
        doc: "/docs/components/scroll-area",
        api: "https://base-ui.com/react/components/scroll-area",
      },
      fujin: {
        summary:
          "Native scrolling with themed scrollbars that show on hover, scroll or focus; keyboard-focusable while it overflows.",
        whenToUse: [
          "A fixed-height panel whose content can overflow: lists in a popover, sidebars, code blocks.",
          "Horizontal strips (tabs, chips, cards) where the default scrollbar looks out of place.",
        ],
        whenNotToUse: [
          "The whole page - let the document scroll natively.",
          "Thousands of rows - use a virtualised list; ScrollArea renders everything.",
          "Tables - `table` already wraps itself in an overflow container.",
          "Hiding overflow you never want scrolled - use `overflow-hidden`.",
        ],
        anatomy: `<ScrollArea className="h-72" viewportProps={{ role: "region", "aria-label": "..." }}>
  {content}
</ScrollArea>

// custom composition only:
<ScrollBar orientation="vertical" />`,
        props: [
          {
            name: "viewportProps",
            type: "ScrollArea.Viewport.Props",
            description:
              "Props for the scrolling element: `ref` (scrollTo), `onScroll`, `role`/`aria-label`.",
            owner: "ScrollArea",
          },
          {
            name: "className",
            type: "string",
            description:
              "Size the root: `h-72` or `max-h-72` (the viewport inherits max-height).",
            owner: "ScrollArea",
          },
          {
            name: "orientation",
            type: '"vertical" | "horizontal"',
            default: '"vertical"',
            description: "Which axis the scrollbar controls.",
            owner: "ScrollBar",
          },
        ],
        examples: [
          {
            title: "Vertical list",
            code: `<ScrollArea className="h-72 w-48 rounded-md border">
  <div className="p-4">{items.map((item) => <div key={item}>{item}</div>)}</div>
</ScrollArea>`,
          },
          {
            title: "Horizontal strip",
            code: `<ScrollArea className="w-96 rounded-md border">
  <div className="flex w-max gap-4 p-4">{cards}</div>
</ScrollArea>`,
          },
          {
            title: "Scroll to top",
            code: `const viewportRef = React.useRef<HTMLDivElement>(null)

<ScrollArea className="h-72" viewportProps={{ ref: viewportRef }}>...</ScrollArea>
<Button onClick={() => viewportRef.current?.scrollTo({ top: 0 })}>Top</Button>`,
          },
        ],
        pitfalls: [
          'Both scrollbars are built in. Do NOT add `<ScrollBar orientation="horizontal" />` as a child (the shadcn habit) - it renders a duplicate inside the content.',
          "The root needs a height or max-height, otherwise it grows with its content and never scrolls.",
          "Wide content must not wrap to overflow horizontally - give it `w-max` or `whitespace-nowrap`.",
          "`className` on ScrollArea styles the root; to reach the scrolling element (ref, onScroll) use `viewportProps`.",
          'The viewport has `role="presentation"` from Base UI; `aria-label` alone is ignored - pass `role: "region"` with it.',
        ],
        a11y: [
          "Base UI puts the viewport in the tab order only while it overflows, so keyboard users can scroll it (WCAG 2.1.1).",
          "Focused viewport shows a solid inset outline in `--ring`, which a clipping parent cannot hide.",
          'Name focusable scroll regions: `viewportProps={{ role: "region", "aria-label": "..." }}`.',
          "The thumb is `--muted-foreground` at 80% (>= 3:1 on the background). Scrolling never requires dragging it: wheel, touch and keyboard all work.",
        ],
        tokens: ["--muted-foreground", "--ring"],
        related: ["table", "command", "popover"],
      },
    },
  },
  {
    name: "radio-group",
    type: "registry:ui",
    title: "Radio Group",
    description: "A set of options where exactly one can be chosen.",
    categories: ["primitives", "forms"],
    dependencies: ["@base-ui/react"],
    registryDependencies: ["@fujin/utils"],
    files: [{ path: "registry/fujin/ui/radio-group.tsx", type: "registry:ui" }],
    meta: {
      links: { api: "https://base-ui.com/react/components/radio" },
      fujin: {
        summary:
          "Single-choice list of visible options, with arrow-key navigation and form submission of the chosen value.",
        whenToUse: [
          "Two to about six mutually exclusive options that should all be visible at once (plan, shipping speed, density).",
          "The choice matters enough that users should compare options side by side, often with a description each.",
        ],
        whenNotToUse: [
          "More than about six options, or space is tight - use `select`.",
          "A long or searchable list - use `combobox`.",
          "Several options can be on at once - use `checkbox` per option.",
          "A single on/off setting - use `checkbox` (in a form) or `switch` (applies immediately).",
          "Switching views or formatting in a toolbar - use `toggle-group` or `tabs`.",
        ],
        anatomy: `<Field name="plan">
  <FieldSet render={<RadioGroup defaultValue="pro" />}>
    <FieldLegend>Plan</FieldLegend>
    <label>
      <RadioGroupItem value="hobby" />
      Hobby
    </label>
    <label>
      <RadioGroupItem value="pro" />
      Pro
    </label>
  </FieldSet>
</Field>`,
        props: [
          {
            owner: "RadioGroup",
            name: "value",
            type: "Value",
            description: "Controlled selected value.",
          },
          {
            owner: "RadioGroup",
            name: "defaultValue",
            type: "Value",
            description: "Initial value when uncontrolled.",
          },
          {
            owner: "RadioGroup",
            name: "onValueChange",
            type: "(value: Value, details) => void",
            description: "Called with the newly selected item's value.",
          },
          {
            owner: "RadioGroup",
            name: "orientation",
            type: '"vertical" | "horizontal"',
            default: '"vertical"',
            description:
              "Layout only; arrow keys move between options in both directions either way.",
          },
          {
            owner: "RadioGroup",
            name: "name",
            type: "string",
            description:
              "Form field name. A surrounding `Field`'s `name` takes precedence.",
          },
          {
            owner: "RadioGroupItem",
            name: "value",
            type: "Value",
            required: true,
            description: "The value this option submits.",
          },
        ],
        examples: [
          {
            title: "In a form, labelled by a legend",
            code: `<Field name="plan">
  <FieldSet render={<RadioGroup defaultValue="pro" />} className="gap-3">
    <FieldLegend className="text-sm">Plan</FieldLegend>
    <label className="flex items-center gap-3 text-sm">
      <RadioGroupItem value="hobby" />
      Hobby
    </label>
    <label className="flex items-center gap-3 text-sm">
      <RadioGroupItem value="pro" />
      Pro
    </label>
  </FieldSet>
</Field>`,
          },
          {
            title: "Standalone, horizontal",
            code: `<RadioGroup orientation="horizontal" defaultValue="md" aria-label="Size">
  {["sm", "md", "lg"].map((size) => (
    <label key={size} className="flex items-center gap-2 text-sm">
      <RadioGroupItem value={size} />
      {size.toUpperCase()}
    </label>
  ))}
</RadioGroup>`,
          },
        ],
        pitfalls: [
          'Label each item by wrapping it in a `<label>`. `RadioGroupItem` renders a `<span role="radio">`, so `id` + `htmlFor` does not work.',
          "Do not use `FieldLabel` per item inside a `Field` - it points at the group's control id, so every label targets the same element.",
          "The group needs its own name too: render `FieldSet` as the group (`render={<RadioGroup />}`) so the legend labels it, or pass `aria-label`/`aria-labelledby`.",
          '`FieldSet` has `gap-6` by default; pass `className="gap-3"` when it renders the group.',
          "Style the checked state with `data-[checked]:`, not Radix's `data-[state=checked]:`.",
        ],
        a11y: [
          'Renders `role="radiogroup"` with `role="radio"` items; arrow keys move and select, Tab enters and leaves the group.',
          "The 16px circle has a 24px hit area via `::after` (WCAG 2.5.8); focus ring is solid 2px.",
          "Picks up `data-invalid` and `aria-invalid` from a surrounding `Field`.",
        ],
        tokens: [
          "--input",
          "--background",
          "--primary",
          "--ring",
          "--destructive",
        ],
        related: ["field", "checkbox", "select", "toggle-group"],
      },
    },
  },
  {
    name: "select",
    type: "registry:ui",
    title: "Select",
    description:
      "Choose one or more options from a short list in a popup, with form integration.",
    categories: ["primitives", "forms", "overlays"],
    dependencies: ["@base-ui/react", "lucide-react"],
    registryDependencies: ["@fujin/utils"],
    files: [{ path: "registry/fujin/ui/select.tsx", type: "registry:ui" }],
    meta: {
      links: { api: "https://base-ui.com/react/components/select" },
      fujin: {
        summary:
          "Button-triggered listbox for picking from a short, fixed list; pass `items` so the trigger shows labels, not raw values.",
        whenToUse: [
          "Picking one value from a short, known list (roughly under 15) in a form: country region, role, sort order.",
          "Picking several values when a comma-separated summary in the trigger is enough (`multiple`).",
        ],
        whenNotToUse: [
          "A long list users will want to type into - use `combobox`.",
          "Two to about six options that should be visible at once - use `radio-group`.",
          "A menu of actions (edit, delete) rather than a value - use `dropdown-menu`.",
          "A search-to-pick picker embedded in other UI (filter bars, command palettes) - use `command`.",
          "Free text input - use `input`.",
        ],
        anatomy: `<Select items={items} value onValueChange multiple?>
  <SelectTrigger size="default" | "sm">
    <SelectValue placeholder="..." />
  </SelectTrigger>
  <SelectContent alignItemWithTrigger side align>
    <SelectGroup>
      <SelectLabel />
      <SelectItem value />
    </SelectGroup>
    <SelectSeparator />
  </SelectContent>
</Select>`,
        props: [
          {
            owner: "Select",
            name: "items",
            type: "{ value, label }[] | Record<string, ReactNode>",
            description:
              "Lets `SelectValue` render the selected item's label (also before the popup has mounted, e.g. on the server).",
          },
          {
            owner: "Select",
            name: "value",
            type: "Value | Value[] | null",
            description: "Controlled value; an array when `multiple`.",
          },
          {
            owner: "Select",
            name: "onValueChange",
            type: "(value, details) => void",
            description: "Receives `null` when nothing is selected.",
          },
          {
            owner: "Select",
            name: "multiple",
            type: "boolean",
            default: "false",
            description:
              "Allow several values; the trigger shows labels comma-separated.",
          },
          {
            owner: "SelectTrigger",
            name: "size",
            type: '"sm" | "default"',
            default: '"default"',
            description: "32px or 36px tall.",
          },
          {
            owner: "SelectValue",
            name: "placeholder",
            type: "ReactNode",
            description: "Shown while there is no value.",
          },
          {
            owner: "SelectContent",
            name: "alignItemWithTrigger",
            type: "boolean",
            default: "true",
            description:
              "Overlap the trigger so the selected item sits over the trigger text. `side`/`align` are ignored while active. Falls back to a dropdown on touch or when space is short.",
          },
          {
            owner: "SelectContent",
            name: "side",
            type: '"top" | "right" | "bottom" | "left"',
            default: '"bottom"',
            description:
              "Only used when `alignItemWithTrigger` is off or falls back.",
          },
        ],
        examples: [
          {
            title: "In a form with a placeholder",
            code: `<Field name="region">
  <FieldLabel nativeLabel={false} render={<div />}>Region</FieldLabel>
  <Select items={regions}>
    <SelectTrigger className="w-full">
      <SelectValue placeholder="Select a region" />
    </SelectTrigger>
    <SelectContent>
      {regions.map((region) => (
        <SelectItem key={region.value} value={region.value}>
          {region.label}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
</Field>`,
          },
          {
            title: "Multiple",
            code: `<Select items={channels} multiple value={value} onValueChange={setValue}>
  <SelectTrigger aria-label="Notification channels">
    <SelectValue placeholder="No channels" />
  </SelectTrigger>
  <SelectContent alignItemWithTrigger={false}>
    {channels.map((channel) => (
      <SelectItem key={channel.value} value={channel.value}>{channel.label}</SelectItem>
    ))}
  </SelectContent>
</Select>`,
          },
        ],
        pitfalls: [
          'Without `items` on `Select`, `SelectValue` renders the raw value ("us-east"), not its label.',
          "`SelectLabel` is a group heading inside the popup, not the field label. Label the select with `FieldLabel` or `aria-label` on `SelectTrigger`.",
          "A plain `FieldLabel` is a native `<label>`, so clicking it opens the popup. Use `<FieldLabel nativeLabel={false} render={<div />}>` to only focus the trigger.",
          "`side`/`align` on `SelectContent` do nothing while `alignItemWithTrigger` is active (the default). Set it to `false` for a regular dropdown.",
          "`onValueChange` can receive `null`; type your state accordingly.",
          "Required-field messaging needs a validation layer (Base UI `Form` or your form library); the hidden input alone does not show a `FieldError`.",
        ],
        a11y: [
          'Trigger is `role="combobox"` with `aria-haspopup="listbox"`; inside a `Field` it gets `aria-labelledby`, `aria-describedby` and `aria-invalid` automatically.',
          "Full keyboard support: Enter/Space/Arrow opens, arrows move, type-ahead jumps, Escape closes and restores focus.",
          "Items are at least 32px tall; scroll arrows appear for long lists on pointer devices.",
          "Solid 2px focus ring on the trigger (WCAG 1.4.11).",
        ],
        tokens: [
          "--input",
          "--ring",
          "--popover",
          "--popover-foreground",
          "--accent",
          "--accent-foreground",
          "--muted-foreground",
          "--destructive",
        ],
        related: ["combobox", "radio-group", "field", "dropdown-menu"],
      },
    },
  },
  {
    name: "combobox",
    type: "registry:ui",
    title: "Combobox",
    description:
      "A form field that filters a list of options as you type, with single or chip-based multiple selection and an optional create-new option.",
    categories: ["primitives", "forms", "overlays"],
    dependencies: ["@base-ui/react", "lucide-react"],
    registryDependencies: [
      "@fujin/utils",
      "@fujin/spinner",
      "@fujin/use-combobox-creatable",
    ],
    files: [{ path: "registry/fujin/ui/combobox.tsx", type: "registry:ui" }],
    meta: {
      links: { api: "https://base-ui.com/react/components/combobox" },
      fujin: {
        summary:
          "Text input that filters the `items` list and commits one option (or several, as chips); the value is always one of the options.",
        whenToUse: [
          "Choosing from a long list in a form (country, timezone, assignee, framework) where typing to narrow it is faster than scrolling.",
          "Tagging-style multi-select where each selection should stay visible and removable (`multiple` + chips).",
          "The list is open-ended and people may need to add a missing option (tags, labels, a new company) - pass `onCreate`.",
        ],
        whenNotToUse: [
          "A short list (roughly under 15) where scanning is faster than typing - use `select`.",
          "A search-to-pick list embedded in other UI - a filter bar, a command palette, data-table's column filters - use `command`, which is the unlabelled picker primitive.",
          "The typed text itself is the value (search box, free text with suggestions) - use `input` or Base UI Autocomplete; a combobox discards text that matches no option.",
          "Two to six options that should all be visible - use `radio-group`.",
          "Actions rather than values - use `dropdown-menu`.",
        ],
        anatomy: `<Combobox items value onValueChange multiple? onCreate? formatCreateLabel?>
  <ComboboxInput showTrigger showClear />          // single
  <ComboboxChips aria-label placeholder limit showClear />  // multiple, chips built in
  // or take over the chips:
  <ComboboxChips aria-label>
    <ComboboxValue>
      {(selected) => <>
        <ComboboxChip showRemove removeLabel />
        <ComboboxChipsInput />
      </>}
    </ComboboxValue>
  </ComboboxChips>
  <ComboboxContent side align>
    <ComboboxEmpty />
    <ComboboxList>
      {(item) => <ComboboxItem value={item} />}
      // or groups:
      {(group) => (
        <ComboboxGroup items={group.items}>
          <ComboboxGroupLabel />
          <ComboboxCollection>{(item) => <ComboboxItem value={item} />}</ComboboxCollection>
        </ComboboxGroup>
      )}
    </ComboboxList>
  </ComboboxContent>
</Combobox>`,
        props: [
          {
            owner: "Combobox",
            name: "items",
            type: "Item[] | { value, items }[]",
            required: true,
            description:
              "The full, unfiltered list. Filtering and `ComboboxEmpty` both depend on it.",
          },
          {
            owner: "Combobox",
            name: "value",
            type: "Value | Value[] | null",
            description:
              "Controlled selection - the item object itself unless you use `createItems`.",
          },
          {
            owner: "Combobox",
            name: "onValueChange",
            type: "(value, details) => void",
            description: "Called when the selection changes (not on typing).",
          },
          {
            owner: "Combobox",
            name: "multiple",
            type: "boolean",
            default: "false",
            description: "Allow several selections; render chips.",
          },
          {
            owner: "Combobox",
            name: "autoHighlight",
            type: "boolean",
            default: "false",
            description:
              "Highlight the first match while typing so Enter picks it.",
          },
          {
            owner: "Combobox",
            name: "onCreate",
            type: "(query: string) => Value | void | Promise<Value | void>",
            description:
              'Makes it creatable: unmatched text shows a `Create "<text>"` option, and Enter with nothing highlighted picks it. Return the new item (or a promise) to select it and add it to `items` yourself; return nothing to cancel. While a promise is pending the option shows a spinner and is disabled.',
          },
          {
            owner: "Combobox",
            name: "formatCreateLabel",
            type: "(query: string) => string",
            default: '(q) => `Create "${q}"`',
            description: "Label of the create option.",
          },
          {
            owner: "ComboboxInput",
            name: "showTrigger",
            type: "boolean",
            default: "true",
            description: "Chevron button (24px) that opens the list.",
          },
          {
            owner: "ComboboxInput",
            name: "showClear",
            type: "boolean",
            default: "false",
            description:
              "Clear button (24px), visible while there is a value or text.",
          },
          {
            owner: "ComboboxChips",
            name: "limit",
            type: "number",
            description:
              'While focus is outside the field, show only this many chips plus "+N more"; focusing shows them all. Built-in chips only.',
          },
          {
            owner: "ComboboxChips",
            name: "showClear",
            type: "boolean",
            default: "false",
            description:
              'A 24px "Clear all" button, shown while anything is selected.',
          },
          {
            owner: "ComboboxChips",
            name: "placeholder / renderChip / inputProps",
            type: "string / (item) => ReactNode / ComboboxChipsInput props",
            description:
              "Built-in mode: input placeholder (shown while empty), chip content (defaults to the label), props for the input.",
          },
          {
            owner: "ComboboxChip",
            name: "showRemove",
            type: "boolean",
            default: "true",
            description: "Renders the chip's remove button.",
          },
        ],
        examples: [
          {
            title: "Single, in a form",
            code: `<Field name="framework">
  <FieldLabel>Framework</FieldLabel>
  <Combobox items={frameworks} value={value} onValueChange={setValue}>
    <ComboboxInput placeholder="Search frameworks..." showClear />
    <ComboboxContent>
      <ComboboxEmpty>No framework found.</ComboboxEmpty>
      <ComboboxList>
        {(framework) => (
          <ComboboxItem key={framework.value} value={framework}>
            {framework.label}
          </ComboboxItem>
        )}
      </ComboboxList>
    </ComboboxContent>
  </Combobox>
</Field>`,
          },
          {
            title: "Multiple with chips",
            code: `<Combobox items={labels} multiple defaultValue={[labels[0]]}>
  <ComboboxChips aria-label="Selected labels" placeholder="Add labels..." limit={3} showClear />
  <ComboboxContent>
    <ComboboxEmpty>No labels found.</ComboboxEmpty>
    <ComboboxList>
      {(item) => <ComboboxItem key={item.value} value={item}>{item.label}</ComboboxItem>}
    </ComboboxList>
  </ComboboxContent>
</Combobox>`,
          },
          {
            title: "Creatable tags (async)",
            code: `const [tags, setTags] = React.useState(initialTags)

<Combobox
  items={tags}
  multiple
  onCreate={async (label) => {
    const tag = await api.createTag(label) // { value, label }
    setTags((current) => [...current, tag])
    return tag
  }}
>
  <ComboboxChips aria-label="Selected tags" placeholder="Add tags..." />
  <ComboboxContent>
    <ComboboxEmpty>No tags found.</ComboboxEmpty>
    <ComboboxList>
      {(tag) => <ComboboxItem key={tag.value} value={tag}>{tag.label}</ComboboxItem>}
    </ComboboxList>
  </ComboboxContent>
</Combobox>`,
          },
        ],
        pitfalls: [
          "Pass the full list as `items` and render with `ComboboxList`'s child function. Mapping your own array inside `ComboboxList` bypasses filtering.",
          "Item values are the item objects. `{ value, label }` objects work out of the box (label shown, value submitted); other shapes need `itemToStringLabel` and `itemToStringValue`, and `isItemEqualToValue` if you recreate objects.",
          "Typed text is not kept: in single mode the input snaps back to the selected label (or empties) when the popup closes; in multiple mode it clears after each pick.",
          "`ComboboxInput`'s `className` styles the bordered box; every other prop goes to the `<input>`.",
          "In multiple mode, give `ComboboxChips` an `aria-label`. Without children it renders the chips and input itself; if you pass children, render chips and `ComboboxChipsInput` inside `ComboboxValue`'s function child so they update, and `limit` no longer applies.",
          "`onCreate` does not add the new item to `items` - do it yourself, or it disappears from the list once deselected. Handle errors inside `onCreate`; a rejected promise selects nothing.",
          "`onCreate` works with flat `items` only; grouped items get no create option.",
          "With `onCreate`, value and input text are passed to Base UI as controlled props. `defaultValue`/`defaultInputValue` still work - the wrapper holds the state.",
          "`ComboboxItem` renders the create option itself (plus icon + label) and ignores its children for it, so one `ComboboxList` renderer covers both - key on `value`/`id`/`label`, which the create option also has.",
          "Keep `ComboboxEmpty` mounted (it is a live region); it collapses itself while there are matches.",
          "Not the same as `command`: don't use `command` for a labelled form field, and don't use this for a filter bar or palette.",
        ],
        a11y: [
          "The input is the form control: `FieldLabel` labels it, `FieldDescription`/`FieldError` describe it, via `Field`.",
          "Arrow keys move through matches, Enter selects, Escape closes; in multiple mode Left Arrow from the start of the input walks the chips and Backspace/Delete removes one.",
          "Clear, trigger and chip-remove buttons are 24px targets with `aria-label`s (WCAG 2.5.8). Chip remove buttons are pointer-only; keyboard users remove with Backspace.",
          '`ComboboxEmpty` announces "no results" politely. With `onCreate` the create option replaces it, and is announced like any other option.',
          '"+N more" is plain text read in reading order; hidden chips are `display: none` only while focus is outside the field, so keyboard users always reach every chip.',
          "The chips box scrolls past `--combobox-chips-max-height` (default 8.5rem) instead of growing without bound; the focused input scrolls into view.",
          "Solid 2px focus ring around the whole input box (WCAG 1.4.11).",
        ],
        tokens: [
          "--input",
          "--ring",
          "--popover",
          "--popover-foreground",
          "--accent",
          "--accent-foreground",
          "--secondary",
          "--secondary-foreground",
          "--muted-foreground",
          "--destructive",
        ],
        related: ["select", "command", "field", "input"],
      },
    },
  },
  {
    name: "slider",
    type: "registry:ui",
    title: "Slider",
    description:
      "Pick a number or a range by clicking the track, dragging a thumb or using the keyboard.",
    categories: ["primitives", "forms"],
    dependencies: ["@base-ui/react"],
    registryDependencies: ["@fujin/utils"],
    files: [{ path: "registry/fujin/ui/slider.tsx", type: "registry:ui" }],
    meta: {
      links: { api: "https://base-ui.com/react/components/slider" },
      fujin: {
        summary:
          "Single-value or range slider; one thumb per value, each a labelled native range input, operable without dragging.",
        whenToUse: [
          "An approximate value on a bounded scale where relative position matters more than the exact number: volume, opacity, zoom.",
          "A min/max range filter (price, date span) - pass an array for two thumbs.",
        ],
        whenNotToUse: [
          "The exact number matters (quantity, age, amount) - use a number input; a slider is imprecise and slow for exact entry.",
          "A small set of discrete named options - use `radio-group` or `toggle-group`.",
          "An unbounded or very large range where one step is a tiny fraction of the track.",
          "Showing progress or a measurement - use `progress`/`meter`; a slider is an input.",
        ],
        anatomy: `<Slider defaultValue={40 | [20, 80]} min max step orientation getAriaLabel />
// renders: Root > Control > Track > (Indicator "slider-range" + one Thumb per value)`,
        props: [
          {
            name: "value",
            type: "number | number[]",
            description:
              "Controlled value. A number renders one thumb; an array renders one thumb per entry.",
          },
          {
            name: "defaultValue",
            type: "number | number[]",
            description:
              "Initial value when uncontrolled. Defaults to one thumb at `min`.",
          },
          {
            name: "onValueChange",
            type: "(value: number | number[], details) => void",
            description: "Fires continuously while dragging.",
          },
          {
            name: "onValueCommitted",
            type: "(value: number | number[], details) => void",
            description:
              "Fires once when the user releases or finishes a key press - use this for saves and network requests.",
          },
          {
            name: "min / max / step",
            type: "number",
            default: "0 / 100 / 1",
            description: "Bounds and granularity.",
          },
          {
            name: "orientation",
            type: '"horizontal" | "vertical"',
            default: '"horizontal"',
            description:
              "Vertical sliders fill their parent's height (min 160px); give the parent a height.",
          },
          {
            name: "getAriaLabel",
            type: "(index: number) => string",
            description:
              "Accessible name per thumb. Required for ranges so thumbs are distinguishable; wins over `aria-label`.",
          },
          {
            name: "aria-label",
            type: "string",
            description:
              "Forwarded to the thumb(s), not the root. Use for a single thumb with no visible label.",
          },
          {
            name: "getAriaValueText",
            type: "(formatted: string, value: number, index: number) => string",
            description:
              "Custom announced value; or pass `format` (Intl.NumberFormat options).",
          },
        ],
        examples: [
          {
            title: "Labelled by a Field",
            code: `<Field name="volume">
  <FieldLabel>Volume</FieldLabel>
  <Slider defaultValue={40} />
</Field>`,
          },
          {
            title: "Range",
            code: `<Slider
  defaultValue={[200, 600]}
  max={1000}
  step={10}
  format={{ style: "currency", currency: "USD", maximumFractionDigits: 0 }}
  getAriaLabel={(i) => (i === 0 ? "Minimum price" : "Maximum price")}
/>`,
          },
        ],
        pitfalls: [
          "`onValueChange` fires on every pixel of a drag. Debounce, or use `onValueCommitted` for anything expensive.",
          "A range slider needs `getAriaLabel`; a single shared `aria-label` makes both thumbs announce the same name.",
          "The value shape follows the input: `defaultValue={40}` reports a number, `defaultValue={[40]}` reports an array.",
          "Thumb count comes from `value`/`defaultValue` at render; changing the array length re-renders thumbs.",
          "A vertical slider needs a parent with a height.",
        ],
        a11y: [
          'Each thumb is a native `<input type="range">`: Arrow keys step, Page Up/Down and Shift+Arrow take `largeStep`, Home/End jump to the bounds.',
          "Clicking the track moves the nearest thumb there, so dragging is never required (WCAG 2.5.7).",
          "Thumbs are 16px with a 24px hit area; the control strip is 24px tall (WCAG 2.5.8).",
          "Inside a `Field`, a single thumb is labelled by `FieldLabel` automatically.",
          "Solid focus ring on the focused thumb.",
        ],
        tokens: ["--muted", "--primary", "--background", "--ring"],
        related: ["field", "input", "radio-group"],
      },
    },
  },
  {
    name: "toggle",
    type: "registry:ui",
    title: "Toggle",
    description: "A two-state button that can be on or off.",
    categories: ["primitives", "forms"],
    dependencies: ["@base-ui/react", "class-variance-authority"],
    registryDependencies: ["@fujin/utils"],
    files: [{ path: "registry/fujin/ui/toggle.tsx", type: "registry:ui" }],
    meta: {
      links: { api: "https://base-ui.com/react/components/toggle" },
      fujin: {
        summary:
          "Pressable on/off button (`aria-pressed`) for toolbar-style state such as bold or bookmark; exports `toggleVariants`.",
        whenToUse: [
          "A toolbar button that stays on: bold, italic, mute, bookmark, pin.",
          "A standalone on/off control that reads as a button rather than a form field.",
        ],
        whenNotToUse: [
          "A setting in a form that is submitted - use `checkbox`.",
          "A setting that applies immediately and reads as on/off (notifications, dark mode) - use `switch`.",
          "One-of-several choices - use `toggle-group` (or `radio-group` in a form).",
          "A one-off action (save, delete) - use `button`.",
        ],
        props: [
          {
            name: "pressed",
            type: "boolean",
            description: "Controlled pressed state.",
          },
          {
            name: "defaultPressed",
            type: "boolean",
            default: "false",
            description: "Initial state when uncontrolled.",
          },
          {
            name: "onPressedChange",
            type: "(pressed: boolean, details) => void",
            description: "Called when the pressed state changes.",
          },
          {
            name: "variant",
            type: '"default" | "outline"',
            default: '"default"',
            description: "Outline adds a border.",
          },
          {
            name: "size",
            type: '"sm" | "default" | "lg"',
            default: '"default"',
            description:
              "32px, 36px or 40px square minimum - all above the 24px target minimum.",
          },
        ],
        examples: [
          {
            title: "Icon toggle",
            code: `<Toggle aria-label="Bold" pressed={bold} onPressedChange={setBold}>
  <BoldIcon />
</Toggle>`,
          },
          {
            title: "Outline with text",
            code: `<Toggle variant="outline">
  <BookmarkIcon />
  Bookmark
</Toggle>`,
          },
        ],
        pitfalls: [
          'Icon-only toggles need `aria-label` naming the thing ("Bold"), not the action ("Toggle bold") - the pressed state is announced separately.',
          "Style the on state with `data-[pressed]:`, not Radix's `data-[state=on]:`.",
          'Don\'t change the label when pressed ("Mute" -> "Unmute"); that double-announces the state. Use a plain `button` if the label must change.',
        ],
        a11y: [
          "Renders a native `<button>` with `aria-pressed`.",
          "Pressed is shown by background and a darker foreground, not background alone; hover never paints the background, so pressed stays distinguishable from hover.",
          "Solid 2px focus ring (WCAG 1.4.11).",
        ],
        tokens: [
          "--accent",
          "--accent-foreground",
          "--muted-foreground",
          "--foreground",
          "--input",
          "--ring",
        ],
        related: ["toggle-group", "button", "checkbox"],
      },
    },
  },
  {
    name: "toggle-group",
    type: "registry:ui",
    title: "Toggle Group",
    description:
      "A set of toggles with shared single or multiple selection, joined or spaced.",
    categories: ["primitives", "forms"],
    dependencies: ["@base-ui/react", "class-variance-authority"],
    registryDependencies: ["@fujin/utils", "@fujin/toggle"],
    files: [
      { path: "registry/fujin/ui/toggle-group.tsx", type: "registry:ui" },
    ],
    meta: {
      links: { api: "https://base-ui.com/react/components/toggle-group" },
      fujin: {
        summary:
          "Row of toggles sharing one array value - single-select by default, `multiple` for several; joined into a segmented control unless `spacing` is set.",
        whenToUse: [
          "Toolbar choices: text alignment (single), bold/italic/underline (multiple).",
          "A compact segmented control that changes a view setting in place (list/grid, day/week/month).",
        ],
        whenNotToUse: [
          "Switching between panels of content - use `tabs` (it manages the panels and their ARIA).",
          "Choosing a value in a submitted form - use `radio-group` (single) or checkboxes (multiple).",
          "A single on/off button - use `toggle`.",
          "Many options or long labels - use `select`.",
        ],
        anatomy: `<ToggleGroup value defaultValue onValueChange multiple variant size spacing orientation aria-label>
  <ToggleGroupItem value="left" aria-label="Align left" />
  <ToggleGroupItem value="center" aria-label="Align center" />
</ToggleGroup>`,
        props: [
          {
            owner: "ToggleGroup",
            name: "value",
            type: "string[]",
            description:
              "Controlled pressed values. Always an array, even in single mode.",
          },
          {
            owner: "ToggleGroup",
            name: "onValueChange",
            type: "(value: string[], details) => void",
            description: "Called with the new array of pressed values.",
          },
          {
            owner: "ToggleGroup",
            name: "multiple",
            type: "boolean",
            default: "false",
            description: "Allow several pressed items.",
          },
          {
            owner: "ToggleGroup",
            name: "variant",
            type: '"default" | "outline"',
            default: '"default"',
            description: "Passed to every item unless the item sets its own.",
          },
          {
            owner: "ToggleGroup",
            name: "size",
            type: '"sm" | "default" | "lg"',
            default: '"default"',
            description: "Passed to every item unless the item sets its own.",
          },
          {
            owner: "ToggleGroup",
            name: "spacing",
            type: "number",
            default: "0",
            description:
              "Gap in Tailwind spacing units. `0` joins items with shared borders and rounded outer corners.",
          },
          {
            owner: "ToggleGroup",
            name: "orientation",
            type: '"horizontal" | "vertical"',
            default: '"horizontal"',
            description: "Stacks items and switches arrow keys to Up/Down.",
          },
          {
            owner: "ToggleGroupItem",
            name: "value",
            type: "string",
            required: true,
            description: "The value this item adds to the group's array.",
          },
        ],
        examples: [
          {
            title: "Single choice that can't be emptied",
            code: `const [align, setAlign] = React.useState(["left"])

<ToggleGroup
  aria-label="Text alignment"
  variant="outline"
  value={align}
  onValueChange={(next) => next.length > 0 && setAlign(next)}
>
  <ToggleGroupItem value="left" aria-label="Align left"><AlignLeftIcon /></ToggleGroupItem>
  <ToggleGroupItem value="center" aria-label="Align center"><AlignCenterIcon /></ToggleGroupItem>
  <ToggleGroupItem value="right" aria-label="Align right"><AlignRightIcon /></ToggleGroupItem>
</ToggleGroup>`,
          },
          {
            title: "Multiple, spaced",
            code: `<ToggleGroup aria-label="Formatting" multiple spacing={1} size="sm" defaultValue={["bold"]}>
  <ToggleGroupItem value="bold" aria-label="Bold"><BoldIcon /></ToggleGroupItem>
  <ToggleGroupItem value="italic" aria-label="Italic"><ItalicIcon /></ToggleGroupItem>
</ToggleGroup>`,
          },
        ],
        pitfalls: [
          'There is no `type="single" | "multiple"` prop (that is Radix/shadcn). Use `multiple`; the value is `string[]` in both modes.',
          "In single mode, clicking the pressed item unpresses it and reports `[]`. Ignore empty changes if a selection is required.",
          "Give the group an `aria-label` and every icon-only item its own `aria-label`.",
          "Item `variant`/`size` override the group's; leave them unset to inherit.",
        ],
        a11y: [
          "One tab stop for the group; arrow keys move between items, Home/End jump to the ends.",
          "Each item is a `<button>` with `aria-pressed`.",
          "The focused item is raised (`z-10`) so its solid focus ring is not clipped by neighbours in the joined layout.",
          "All sizes are at least 32px, above the 24px target minimum (WCAG 2.5.8).",
        ],
        tokens: [
          "--accent",
          "--accent-foreground",
          "--muted-foreground",
          "--input",
          "--ring",
        ],
        related: ["toggle", "tabs", "radio-group"],
      },
    },
  },
  {
    name: "dialog",
    type: "registry:ui",
    title: "Dialog",
    description:
      "A modal window for a short, focused task - focus trapped, focus returned, labelled close button.",
    categories: ["primitives", "overlays"],
    dependencies: ["@base-ui/react", "lucide-react"],
    registryDependencies: ["@fujin/utils", "@fujin/button"],
    files: [{ path: "registry/fujin/ui/dialog.tsx", type: "registry:ui" }],
    meta: {
      links: {
        doc: "/docs/components/dialog",
        api: "https://base-ui.com/react/components/dialog",
      },
      fujin: {
        summary:
          "Centered modal popup with backdrop, focus trap, scroll lock and focus return; scrolls internally when taller than the viewport.",
        whenToUse: [
          "A short task that needs the user's full attention without leaving the page: edit a record, create an item, a small settings form.",
          "Showing details that do not fit inline and should block the page while open.",
        ],
        whenNotToUse: [
          "Confirming a destructive or irreversible action - use `alert-dialog` (no outside-click dismiss, cancel focused first).",
          "A side panel for filters, details or secondary navigation - use `sheet`.",
          "A small form or hint anchored to a control where the page should stay usable - use `popover`.",
          "Reporting that something happened - use `toast`.",
          "Long, multi-step flows - give them a page; dialogs should stay short.",
        ],
        anatomy: `<Dialog open? onOpenChange?>
  <DialogTrigger render={<Button />} />
  <DialogContent showCloseButton?>
    <DialogHeader>
      <DialogTitle />
      <DialogDescription />
    </DialogHeader>
    ...
    <DialogFooter>
      <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
      <Button type="submit" />
    </DialogFooter>
  </DialogContent>
</Dialog>`,
        props: [
          {
            owner: "Dialog",
            name: "open",
            type: "boolean",
            description: "Controlled open state. Pair with `onOpenChange`.",
          },
          {
            owner: "Dialog",
            name: "onOpenChange",
            type: "(open: boolean, details: { reason, cancel() }) => void",
            description:
              'Called on open/close. `details.reason` is e.g. "escape-key", "outside-press", "close-press"; `details.cancel()` keeps it open.',
          },
          {
            owner: "Dialog",
            name: "modal",
            type: 'boolean | "trap-focus"',
            default: "true",
            description:
              '`"trap-focus"` traps focus but leaves page scroll and outside pointer events enabled.',
          },
          {
            owner: "Dialog",
            name: "disablePointerDismissal",
            type: "boolean",
            default: "false",
            description: "Ignore clicks on the backdrop.",
          },
          {
            owner: "DialogContent",
            name: "showCloseButton",
            type: "boolean",
            default: "true",
            description:
              'Renders a 32px ghost Button labelled "Close" in the top-right corner.',
          },
          {
            owner: "DialogContent",
            name: "initialFocus",
            type: "boolean | RefObject<HTMLElement> | (interactionType) => HTMLElement | boolean | null",
            description:
              "Element focused on open. Defaults to the first tabbable element (the popup itself on touch).",
          },
          {
            owner: "DialogContent",
            name: "finalFocus",
            type: "boolean | RefObject<HTMLElement> | (interactionType) => HTMLElement | boolean | null",
            description: "Element focused on close. Defaults to the trigger.",
          },
        ],
        examples: [
          {
            title: "Form that keeps its draft",
            description:
              "State lives outside the dialog, so Esc or a backdrop click never loses input.",
            code: `const [open, setOpen] = React.useState(false)
const [name, setName] = React.useState(user.name)

<Dialog open={open} onOpenChange={setOpen}>
  <DialogTrigger render={<Button variant="outline">Edit profile</Button>} />
  <DialogContent>
    <form
      className="grid gap-6"
      onSubmit={(event) => {
        event.preventDefault()
        save({ name })
        setOpen(false)
      }}
    >
      <DialogHeader>
        <DialogTitle>Edit profile</DialogTitle>
        <DialogDescription>Update your display name.</DialogDescription>
      </DialogHeader>
      <Field name="name">
        <FieldLabel>Name</FieldLabel>
        <Input value={name} onValueChange={setName} autoComplete="name" required />
      </Field>
      <DialogFooter>
        <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
        <Button type="submit">Save</Button>
      </DialogFooter>
    </form>
  </DialogContent>
</Dialog>`,
          },
          {
            title: "Open from a dropdown menu item",
            code: `const [open, setOpen] = React.useState(false)

<DropdownMenuItem onClick={() => setOpen(true)}>Rename...</DropdownMenuItem>
<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent>...</DialogContent>
</Dialog>`,
          },
        ],
        pitfalls: [
          "`asChild` does not exist - use `render={<Button />}` on `DialogTrigger`/`DialogClose`.",
          "Base UI unmounts the popup on close: uncontrolled inputs reset every time it reopens. Hold form state outside the dialog if closing must not lose input.",
          "Do not nest `<Dialog>` inside `DropdownMenuContent` - the menu unmounts it when it closes. Control `open` from the menu item's `onClick` instead.",
          'Always render a `DialogTitle` - it is the dialog\'s accessible name. Visually hide it with `className="sr-only"` rather than omitting it.',
          '`DialogClose` inside a `<form>` is `type="button"`; the submit button needs `type="submit"` (Fujin Button defaults to "button").',
        ],
        a11y: [
          'Popup has `role="dialog"`, `aria-labelledby` (title) and `aria-describedby` (description) wired automatically.',
          "Focus moves inside on open, is trapped while open, and returns to the trigger on close. Esc closes.",
          "The rest of the page is inert and scroll-locked while a modal dialog is open.",
          "Close button is 32px with a solid focus ring (WCAG 2.5.8, 1.4.11) and an accessible name.",
          "Transitions are disabled under `prefers-reduced-motion`.",
        ],
        tokens: [
          "--background",
          "--foreground",
          "--muted-foreground",
          "--border",
          "--ring",
          "--radius",
        ],
        related: ["alert-dialog", "sheet", "popover", "button", "field"],
      },
    },
  },
  {
    name: "alert-dialog",
    type: "registry:ui",
    title: "Alert Dialog",
    description:
      "A modal confirmation that cannot be dismissed by clicking outside. For destructive or irreversible actions.",
    categories: ["primitives", "overlays"],
    dependencies: ["@base-ui/react"],
    registryDependencies: ["@fujin/utils", "@fujin/button"],
    files: [
      { path: "registry/fujin/ui/alert-dialog.tsx", type: "registry:ui" },
    ],
    meta: {
      links: {
        doc: "/docs/components/alert-dialog",
        api: "https://base-ui.com/react/components/alert-dialog",
      },
      fujin: {
        summary:
          'Modal confirmation (`role="alertdialog"`) with Cancel/Action buttons; outside clicks do not dismiss it.',
        whenToUse: [
          "Confirming a destructive or irreversible action: delete, discard unsaved changes, revoke access.",
          "Asking the user to acknowledge something before they can continue.",
        ],
        whenNotToUse: [
          "A form or any task with inputs - use `dialog`.",
          "Reversible actions - skip the confirmation and offer undo via `toast(..., { action })`.",
          "Informational messages that need no decision - use `toast` or `alert`.",
        ],
        anatomy: `<AlertDialog open? onOpenChange?>
  <AlertDialogTrigger render={<Button variant="destructive" />} />
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle />
      <AlertDialogDescription />
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel />            {/* first: receives initial focus */}
      <AlertDialogAction variant? />   {/* closes on click */}
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>`,
        props: [
          {
            owner: "AlertDialog",
            name: "open",
            type: "boolean",
            description: "Controlled open state. Pair with `onOpenChange`.",
          },
          {
            owner: "AlertDialogAction",
            name: "variant",
            type: '"default" | "destructive" | "outline" | "secondary" | "ghost" | "link"',
            default: '"default"',
            description:
              "Button variant. Use `destructive` for delete/discard.",
          },
          {
            owner: "AlertDialogCancel",
            name: "variant",
            type: '"default" | "destructive" | "outline" | "secondary" | "ghost" | "link"',
            default: '"outline"',
            description: "Button variant.",
          },
          {
            owner: "AlertDialogAction",
            name: "size",
            type: "Button size",
            default: '"default"',
            description: "Also on `AlertDialogCancel`.",
          },
        ],
        examples: [
          {
            title: "Delete confirmation",
            code: `<AlertDialog>
  <AlertDialogTrigger render={<Button variant="destructive">Delete project</Button>} />
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Delete "Acme website"?</AlertDialogTitle>
      <AlertDialogDescription>This can't be undone.</AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction variant="destructive" onClick={deleteProject}>
        Delete project
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>`,
          },
          {
            title: "Async action that can fail",
            description:
              "Use a plain Button with `loading` and close via controlled state once the request succeeds.",
            code: `const [open, setOpen] = React.useState(false)
const [pending, startTransition] = React.useTransition()

<AlertDialog open={open} onOpenChange={setOpen}>
  <AlertDialogContent>
    ...
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <Button
        variant="destructive"
        loading={pending}
        onClick={() => startTransition(async () => {
          await deleteProject()
          setOpen(false)
        })}
      >
        Delete
      </Button>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>`,
          },
        ],
        pitfalls: [
          "`AlertDialogAction` closes the dialog immediately on click - it cannot show a loading state or an error. For async work use a plain `<Button loading>` with a controlled `open`.",
          "Keep `AlertDialogCancel` before `AlertDialogAction` in the DOM: initial focus goes to the first button, so Enter cancels instead of confirming. The footer's `flex-col-reverse sm:flex-row` still displays the action last.",
          "There is no close (X) button and backdrop clicks do nothing by design; Esc still cancels.",
          "`AlertDialogAction`/`AlertDialogCancel` take Button's `variant`/`size` directly - do not pass `className={buttonVariants(...)}`.",
        ],
        a11y: [
          'Popup has `role="alertdialog"` with title and description wired to `aria-labelledby`/`aria-describedby`.',
          "Focus is trapped while open and returns to the trigger on close.",
          'Write the title as the question ("Delete project?") and the action label as the verb ("Delete project"), not "OK"/"Yes".',
        ],
        tokens: [
          "--background",
          "--foreground",
          "--muted-foreground",
          "--destructive",
          "--border",
          "--ring",
        ],
        related: ["dialog", "button", "toast"],
      },
    },
  },
  {
    name: "sheet",
    type: "registry:ui",
    title: "Sheet",
    description:
      "A dialog that slides in from the top, right, bottom or left edge of the screen.",
    categories: ["primitives", "overlays"],
    dependencies: ["@base-ui/react", "lucide-react"],
    registryDependencies: ["@fujin/utils", "@fujin/button"],
    files: [{ path: "registry/fujin/ui/sheet.tsx", type: "registry:ui" }],
    meta: {
      links: {
        doc: "/docs/components/sheet",
        api: "https://base-ui.com/react/components/dialog",
      },
      fujin: {
        summary:
          "Edge-anchored modal panel (Base UI Dialog) with slide transitions; `side` picks the edge.",
        whenToUse: [
          "Secondary forms or details that benefit from more height than a dialog: filters, record details, shipping address.",
          "Mobile navigation menus opened from a hamburger button.",
        ],
        whenNotToUse: [
          "A mobile bottom sheet that should be swipeable or snap to heights - a `drawer` (Base UI Drawer) is planned for that; sheet has no gestures.",
          "A short centered task - use `dialog`.",
          "Confirming a destructive action - use `alert-dialog`.",
          "Persistent side navigation that stays open alongside content - use a layout sidebar, not a modal.",
        ],
        anatomy: `<Sheet open? onOpenChange?>
  <SheetTrigger render={<Button />} />
  <SheetContent side="top" | "right" | "bottom" | "left" showCloseButton?>
    <SheetHeader>
      <SheetTitle />
      <SheetDescription />
    </SheetHeader>
    ...
    <SheetFooter>
      <SheetClose render={<Button />} />
    </SheetFooter>
  </SheetContent>
</Sheet>`,
        props: [
          {
            owner: "SheetContent",
            name: "side",
            type: '"top" | "right" | "bottom" | "left"',
            default: '"right"',
            description: "Edge the sheet is attached to and slides in from.",
          },
          {
            owner: "SheetContent",
            name: "showCloseButton",
            type: "boolean",
            default: "true",
            description:
              'Renders a 32px button labelled "Close" in the top-right corner.',
          },
          {
            owner: "Sheet",
            name: "open",
            type: "boolean",
            description: "Controlled open state. Pair with `onOpenChange`.",
          },
        ],
        examples: [
          {
            title: "Right-side form",
            code: `<Sheet>
  <SheetTrigger render={<Button variant="outline">Edit address</Button>} />
  <SheetContent side="right">
    <SheetHeader>
      <SheetTitle>Shipping address</SheetTitle>
      <SheetDescription>Used for this order only.</SheetDescription>
    </SheetHeader>
    <FieldGroup className="px-4">...</FieldGroup>
    <SheetFooter>
      <SheetClose render={<Button />}>Save</SheetClose>
    </SheetFooter>
  </SheetContent>
</Sheet>`,
          },
          {
            title: "Wider sheet",
            code: `<SheetContent side="right" className="sm:max-w-lg">...</SheetContent>`,
          },
        ],
        pitfalls: [
          "`SheetHeader` and `SheetFooter` carry their own `p-4`, but content between them does not - add `px-4` to your body wrapper.",
          'Left/right sheets cap at `sm:max-w-sm`; override with `className="sm:max-w-lg"`, not `w-*` alone.',
          "Like dialog, contents unmount on close - hold form state outside if it must survive closing.",
          "Always render a `SheetTitle`; it is the accessible name.",
        ],
        a11y: [
          'Same contract as `dialog`: `role="dialog"`, focus trapped and returned to the trigger, Esc closes, page inert.',
          "Close button is 32px with a solid focus ring.",
          "Slide transitions are disabled under `prefers-reduced-motion`.",
        ],
        tokens: [
          "--background",
          "--foreground",
          "--muted-foreground",
          "--border",
          "--ring",
        ],
        related: ["dialog", "alert-dialog", "button"],
      },
    },
  },
  {
    name: "tabs",
    type: "registry:ui",
    title: "Tabs",
    description:
      "Switch between related panels as a segmented control or underlined tabs, horizontally or vertically.",
    categories: ["primitives", "navigation", "layout"],
    dependencies: ["@base-ui/react", "class-variance-authority"],
    registryDependencies: ["@fujin/utils"],
    files: [{ path: "registry/fujin/ui/tabs.tsx", type: "registry:ui" }],
    meta: {
      links: {
        doc: "/docs/components/tabs",
        api: "https://base-ui.com/react/components/tabs",
      },
      fujin: {
        summary:
          "Tab list + panels with `default` (segmented pill) and `line` (underline) variants, vertical orientation and an optional animated indicator.",
        whenToUse: [
          "Switching between sibling views of the same object: account/password, overview/analytics/reports.",
          "Route-level section navigation, with triggers rendered as links.",
        ],
        whenNotToUse: [
          "Choosing a value that feeds a form or filter (e.g. list/grid view) - use `toggle-group`.",
          "Content the user needs to compare side by side - show it together.",
          "Progressive disclosure of many sections on one page - use `accordion`.",
          "Sequential steps the user must complete in order - use a stepper, not tabs.",
        ],
        anatomy: `<Tabs defaultValue orientation?>
  <TabsList variant="default" | "line" indicator?>
    <TabsTrigger value />
  </TabsList>
  <TabsContent value />
</Tabs>`,
        props: [
          {
            owner: "Tabs",
            name: "defaultValue",
            type: "any",
            default: "0",
            description:
              "Initially active tab (uncontrolled). Use `value`/`onValueChange` to control.",
          },
          {
            owner: "Tabs",
            name: "orientation",
            type: '"horizontal" | "vertical"',
            default: '"horizontal"',
            description: "Layout and arrow-key axis.",
          },
          {
            owner: "TabsList",
            name: "variant",
            type: '"default" | "line"',
            default: '"default"',
            description: "Segmented pill or underline.",
          },
          {
            owner: "TabsList",
            name: "indicator",
            type: "boolean",
            default: "false",
            description:
              "Slide one animated highlight between tabs (Base UI `Tabs.Indicator`) instead of restyling the active tab.",
          },
          {
            owner: "TabsList",
            name: "activateOnFocus",
            type: "boolean",
            default: "false",
            description:
              "Activate tabs as arrow keys move focus (otherwise Enter/Space).",
          },
          {
            owner: "TabsTrigger",
            name: "value",
            type: "any",
            required: true,
            description: "Matches a `TabsContent` value.",
          },
          {
            owner: "TabsContent",
            name: "keepMounted",
            type: "boolean",
            default: "false",
            description:
              "Keep the hidden panel in the DOM, preserving uncontrolled input state.",
          },
        ],
        examples: [
          {
            title: "Segmented tabs",
            code: `<Tabs defaultValue="account">
  <TabsList indicator>
    <TabsTrigger value="account">Account</TabsTrigger>
    <TabsTrigger value="password">Password</TabsTrigger>
  </TabsList>
  <TabsContent value="account">...</TabsContent>
  <TabsContent value="password">...</TabsContent>
</Tabs>`,
          },
          {
            title: "Vertical line tabs",
            code: `<Tabs defaultValue="general" orientation="vertical">
  <TabsList variant="line">
    <TabsTrigger value="general">General</TabsTrigger>
    <TabsTrigger value="security">Security</TabsTrigger>
  </TabsList>
  <TabsContent value="general">...</TabsContent>
  <TabsContent value="security">...</TabsContent>
</Tabs>`,
          },
          {
            title: "Tabs as Next.js links",
            code: `<Tabs value={pathname}>
  <TabsList variant="line">
    <TabsTrigger value="/settings" nativeButton={false} render={<Link href="/settings" />}>
      General
    </TabsTrigger>
  </TabsList>
</Tabs>`,
          },
        ],
        pitfalls: [
          "`variant` and `indicator` go on `TabsList`, not `Tabs` - triggers read them from the list.",
          "Hidden panels unmount by default, so uncontrolled inputs in them reset when you switch tabs. Pass `keepMounted` to `TabsContent` or hold the state above `Tabs`.",
          "Pass a `defaultValue` (or `value`) that matches a trigger's `value`. The implicit default is `0`; with string values Base UI falls back to the first enabled tab at runtime, so the server-rendered HTML may show no active tab.",
          "Link tabs need `nativeButton={false}` alongside `render={<Link />}`.",
        ],
        a11y: [
          'Base UI wires `role="tablist"`/`"tab"`/`"tabpanel"`, `aria-selected`, `aria-controls` and `aria-labelledby`.',
          "Arrow keys move focus along the orientation axis, Home/End jump to the ends; Enter/Space activates.",
          "Triggers are at least 28px tall (WCAG 2.5.8) with a solid focus ring; panels are focusable and show a ring too.",
          "The indicator animation is disabled under `prefers-reduced-motion`.",
        ],
        tokens: [
          "--muted",
          "--muted-foreground",
          "--background",
          "--foreground",
          "--input",
          "--ring",
        ],
        related: ["toggle-group", "accordion"],
      },
    },
  },
  {
    name: "accordion",
    type: "registry:ui",
    title: "Accordion",
    description:
      "A stack of headings that each expand a section of content, one or several at a time.",
    categories: ["primitives", "layout"],
    dependencies: ["@base-ui/react", "lucide-react"],
    registryDependencies: ["@fujin/utils"],
    files: [{ path: "registry/fujin/ui/accordion.tsx", type: "registry:ui" }],
    meta: {
      links: {
        doc: "/docs/components/accordion",
        api: "https://base-ui.com/react/components/accordion",
      },
      fujin: {
        summary:
          "Vertically stacked disclosure sections with animated height and a rotating chevron; `multiple` allows several open.",
        whenToUse: [
          "FAQs and help content.",
          "Long settings or detail pages broken into sections the user scans and opens as needed.",
        ],
        whenNotToUse: [
          "A single show/hide region - use `collapsible`.",
          "Switching between mutually exclusive views - use `tabs`.",
          "Content everyone needs to read - do not hide it behind a click.",
        ],
        anatomy: `<Accordion multiple? defaultValue={[...]}>
  <AccordionItem value>
    <AccordionTrigger>Heading</AccordionTrigger>
    <AccordionContent>Body</AccordionContent>
  </AccordionItem>
</Accordion>`,
        props: [
          {
            owner: "Accordion",
            name: "multiple",
            type: "boolean",
            default: "false",
            description: "Allow more than one item open at a time.",
          },
          {
            owner: "Accordion",
            name: "defaultValue",
            type: "any[]",
            description:
              "Initially open items. Always an array, even when `multiple` is false.",
          },
          {
            owner: "Accordion",
            name: "value",
            type: "any[]",
            description:
              "Controlled open items. Pair with `onValueChange(value: any[])`.",
          },
          {
            owner: "Accordion",
            name: "hiddenUntilFound",
            type: "boolean",
            default: "false",
            description:
              'Hide closed panels with `hidden="until-found"` so find-in-page can reveal them.',
          },
          {
            owner: "AccordionItem",
            name: "value",
            type: "any",
            description:
              "Identifies the item. Auto-generated if omitted; set it to control or pre-open.",
          },
          {
            owner: "AccordionItem",
            name: "disabled",
            type: "boolean",
            default: "false",
            description: "Prevents toggling this item.",
          },
          {
            owner: "AccordionContent",
            name: "className",
            type: "string",
            description:
              "Applied to the inner padding box, not the animated panel.",
          },
        ],
        examples: [
          {
            title: "FAQ",
            code: `<Accordion defaultValue={["shipping"]}>
  <AccordionItem value="shipping">
    <AccordionTrigger>How long does shipping take?</AccordionTrigger>
    <AccordionContent>2-5 business days.</AccordionContent>
  </AccordionItem>
  <AccordionItem value="returns">
    <AccordionTrigger>What is your return policy?</AccordionTrigger>
    <AccordionContent>30 days, full refund.</AccordionContent>
  </AccordionItem>
</Accordion>`,
          },
          {
            title: "Several open, searchable",
            code: `<Accordion multiple hiddenUntilFound>...</Accordion>`,
          },
        ],
        pitfalls: [
          'There is no `type="single" | "multiple"` or `collapsible` prop (those are Radix) - use `multiple`, and every item can always be closed.',
          '`defaultValue`/`value` are arrays: `defaultValue={["a"]}`, not `defaultValue="a"`.',
          "Set `value` on every `AccordionItem` if you pre-open or control items - auto-generated values cannot be referenced.",
          "Each trigger sits inside an `<h3>`; adjust `AccordionPrimitive.Header` in the source if your heading outline needs another level.",
        ],
        a11y: [
          "Trigger is a button inside a heading, with `aria-expanded` and `aria-controls`; the panel is labelled by its trigger.",
          "Tab moves between triggers (no roving focus, per current APG guidance); Enter/Space toggles.",
          "Focus ring is solid; the height and chevron animations are disabled under `prefers-reduced-motion`.",
        ],
        tokens: ["--border", "--muted-foreground", "--ring"],
        related: ["collapsible", "tabs"],
      },
    },
  },
  {
    name: "collapsible",
    type: "registry:ui",
    title: "Collapsible",
    description: "Show and hide one section of content with a trigger.",
    categories: ["primitives", "layout"],
    dependencies: ["@base-ui/react"],
    registryDependencies: ["@fujin/utils"],
    files: [{ path: "registry/fujin/ui/collapsible.tsx", type: "registry:ui" }],
    meta: {
      links: {
        doc: "/docs/components/collapsible",
        api: "https://base-ui.com/react/components/collapsible",
      },
      fujin: {
        summary:
          "One disclosure region: an unstyled trigger plus content that animates its height.",
        whenToUse: [
          '"Show more" / "Advanced options" sections in a form or card.',
          "Expandable rows or sidebar groups.",
        ],
        whenNotToUse: [
          "Several related sections - use `accordion`.",
          "Content that floats over the page - use `popover`.",
          "Switching between views - use `tabs`.",
        ],
        anatomy: `<Collapsible open? defaultOpen? onOpenChange?>
  <CollapsibleTrigger render={<Button variant="ghost" />} />
  <CollapsibleContent>...</CollapsibleContent>
</Collapsible>`,
        props: [
          {
            owner: "Collapsible",
            name: "defaultOpen",
            type: "boolean",
            default: "false",
            description: "Initially open (uncontrolled).",
          },
          {
            owner: "Collapsible",
            name: "open",
            type: "boolean",
            description: "Controlled open state. Pair with `onOpenChange`.",
          },
          {
            owner: "Collapsible",
            name: "disabled",
            type: "boolean",
            default: "false",
            description: "Ignore trigger presses.",
          },
          {
            owner: "CollapsibleContent",
            name: "keepMounted",
            type: "boolean",
            default: "false",
            description:
              "Keep the content in the DOM while closed (preserves input state).",
          },
          {
            owner: "CollapsibleContent",
            name: "hiddenUntilFound",
            type: "boolean",
            default: "false",
            description: "Let find-in-page search and open the content.",
          },
        ],
        examples: [
          {
            title: "Advanced options",
            code: `<Collapsible>
  <CollapsibleTrigger render={<Button variant="ghost" size="sm">Advanced options</Button>} />
  <CollapsibleContent>
    <FieldGroup className="pt-4">...</FieldGroup>
  </CollapsibleContent>
</Collapsible>`,
          },
        ],
        pitfalls: [
          "`CollapsibleTrigger` has no styles - render a `Button` through `render`.",
          'Put padding on a wrapper inside `CollapsibleContent`, not on the content itself - padding on the animated element shows while "closed".',
          "Closed content unmounts by default; use `keepMounted` if it contains inputs whose values must survive closing.",
        ],
        a11y: [
          "Trigger gets `aria-expanded` and `aria-controls` automatically.",
          "An icon-only trigger needs an `aria-label` naming the section (not its state - `aria-expanded` conveys that).",
          "The height animation is disabled under `prefers-reduced-motion`.",
        ],
        related: ["accordion", "button"],
      },
    },
  },
  {
    name: "toast",
    type: "registry:ui",
    title: "Toast",
    description:
      "Non-blocking notifications with a sonner-style API: toast(), toast.success(), toast.promise().",
    categories: ["primitives", "feedback", "overlays"],
    dependencies: ["@base-ui/react", "lucide-react"],
    registryDependencies: ["@fujin/utils", "@fujin/button", "@fujin/spinner"],
    files: [{ path: "registry/fujin/ui/toast.tsx", type: "registry:ui" }],
    meta: {
      links: {
        doc: "/docs/components/toast",
        api: "https://base-ui.com/react/components/toast",
      },
      fujin: {
        summary:
          "`<Toaster />` once in the root layout, then `toast.success('Saved')` from anywhere - stacked, swipeable, paused on hover/focus, announced to screen readers.",
        whenToUse: [
          "Confirming that an action finished: saved, sent, copied, deleted (with Undo).",
          "Reporting the progress and result of an async operation via `toast.promise`.",
          "Background events the user should notice but not act on immediately.",
        ],
        whenNotToUse: [
          "Validation errors on a form field - show them inline with `FieldError`.",
          "Anything the user must decide before continuing - use `alert-dialog`.",
          "Persistent page-level status (offline, trial ending) - use `alert` in the layout.",
          "The only path to an important action - toasts disappear and are easy to miss.",
        ],
        anatomy: `// app/layout.tsx
<body>
  {children}
  <Toaster position? limit? timeout? />
</body>

// anywhere
toast(title, { description?, id?, timeout?, priority?, action?: { label, onClick }, onClose? })
toast.success | toast.error | toast.warning | toast.info | toast.loading
toast.promise(promiseOrFn, { loading, success, error })
toast.update(id, { title?, type?, ... })
toast.dismiss(id?)`,
        props: [
          {
            owner: "Toaster",
            name: "position",
            type: '"top-left" | "top-center" | "top-right" | "bottom-left" | "bottom-center" | "bottom-right"',
            default: '"bottom-right"',
            description: "Where the stack sits; swipe directions follow it.",
          },
          {
            owner: "Toaster",
            name: "limit",
            type: "number",
            default: "3",
            description:
              "Toasts visible at once; older ones are hidden (inert), not removed.",
          },
          {
            owner: "Toaster",
            name: "timeout",
            type: "number",
            default: "5000",
            description:
              "Default auto-dismiss delay in ms. `0` disables auto-dismiss.",
          },
          {
            owner: "toast",
            name: "description",
            type: "ReactNode",
            description: "Secondary text under the title.",
          },
          {
            owner: "toast",
            name: "id",
            type: "string",
            description:
              "Reusing an id updates that toast in place (e.g. loading -> success).",
          },
          {
            owner: "toast",
            name: "timeout",
            type: "number",
            description:
              "Per-toast delay. Defaults to 10000 when `action` is set; `loading` toasts never time out.",
          },
          {
            owner: "toast",
            name: "priority",
            type: '"low" | "high"',
            default: '"low" ("high" for toast.error)',
            description: '`high` announces assertively via `role="alert"`.',
          },
          {
            owner: "toast",
            name: "action",
            type: "{ label: ReactNode; onClick: (event) => void }",
            description:
              "Renders a button; the toast closes after `onClick` unless it calls `event.preventDefault()`.",
          },
          {
            owner: "toast.promise",
            name: "options",
            type: "{ loading, success, error, id? } - each a title string or options object; success/error may be functions of the result/error",
            description:
              "Returns the original promise; rejections are handled for you.",
          },
        ],
        examples: [
          {
            title: "Setup",
            code: `// app/layout.tsx
import { Toaster } from "@/components/ui/toast"

<body>
  {children}
  <Toaster />
</body>`,
          },
          {
            title: "Success with description",
            code: `toast.success("Changes saved", { description: "Your profile is up to date." })`,
          },
          {
            title: "Undo",
            code: `toast("Message archived", {
  action: { label: "Undo", onClick: () => restore(id) },
})`,
          },
          {
            title: "Promise",
            code: `toast.promise(saveInvoice(), {
  loading: "Saving invoice...",
  success: (invoice) => \`Invoice \${invoice.number} saved\`,
  error: "Could not save the invoice",
})`,
          },
          {
            title: "After a server action",
            code: `const result = await updateProfile(formData)
if (result.ok) toast.success("Profile updated")
else toast.error("Could not update profile", { description: result.error })`,
          },
        ],
        pitfalls: [
          "`<Toaster />` must be mounted (once, in the root layout) or nothing shows. A second Toaster is ignored with a dev warning.",
          "`toast()` is client-only - call it from event handlers, effects or client code after a server action returns, never during render or in a Server Component.",
          "Strings passed as the first argument (and to `toast.promise` states) are the **title**, as in sonner - not Base UI's description shortcut.",
          "`toast.promise` returns the original promise, not sonner's `{ unwrap() }`.",
          "High-priority (error) toasts are announced from their `title`/`description` strings only; ReactNode content is not read out.",
          "Import from `@/components/ui/toast`, not `sonner` - there is no sonner dependency.",
        ],
        a11y: [
          'The stack is a landmark (`role="region"`, "Notifications") and a polite live region; `priority: "high"` uses an assertive `role="alert"`.',
          "Hovering or focusing any toast pauses all timers; F6 moves focus into the stack.",
          'Every toast has a 24px close button labelled "Close" - swiping is never the only way to dismiss (WCAG 2.5.7).',
          "Toasts with an action default to 10s so there is time to reach the button (WCAG 2.2.1).",
          "Type is conveyed by an icon and the text, never colour alone; motion collapses to a fade under `prefers-reduced-motion`.",
        ],
        tokens: [
          "--popover",
          "--popover-foreground",
          "--muted-foreground",
          "--success",
          "--destructive",
          "--warning",
          "--info",
          "--border",
          "--ring",
        ],
        related: ["alert", "alert-dialog", "button", "spinner"],
      },
    },
  },
]
