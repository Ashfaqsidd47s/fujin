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
]
