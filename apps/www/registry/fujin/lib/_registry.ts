import type { RegistryItemInput } from "@fujin/schema"

export const lib: RegistryItemInput[] = [
  {
    name: "utils",
    type: "registry:lib",
    title: "Utils",
    description: "The `cn` class-name helper every Fujin component imports.",
    dependencies: ["cn"],
    files: [{ path: "registry/fujin/lib/utils.ts", type: "registry:lib" }],
    meta: {
      fujin: {
        summary:
          "Merges Tailwind class names, resolving conflicts (last wins).",
        whenToUse: [
          "Combining a component's base classes with a `className` prop.",
        ],
        examples: [
          {
            title: "Merge classes",
            code: 'cn("px-2 py-1", isActive && "bg-accent", className)',
          },
        ],
      },
    },
  },
  {
    // Named after its main export, the hook. The file is lib/pagination.ts so
    // the import reads `@/lib/pagination`, and the item name stays distinct
    // from the `pagination` ui item that depends on it.
    name: "use-pagination",
    type: "registry:lib",
    title: "usePagination",
    categories: ["navigation"],
    description:
      "Headless pagination: a stable-width page window (`getPageWindow`) and page state (`usePagination`).",
    dependencies: [],
    files: [{ path: "registry/fujin/lib/pagination.ts", type: "registry:lib" }],
    meta: {
      fujin: {
        summary:
          "`getPageWindow` returns the page numbers and ellipses to render; `usePagination` adds controlled/uncontrolled page state. No markup.",
        whenToUse: [
          "Building custom pagination markup (a compact pager, a mobile 'Page 3 of 12' select).",
          "Computing the page window in a Server Component for link-mode pagination.",
        ],
        whenNotToUse: [
          "Standard pagination UI - use `pagination` (`PaginationControls`), which already uses this.",
          "Tables built with `data-table` - its pagination state lives in the table.",
          "Cursor-based APIs with no total count - there is no window to compute.",
        ],
        props: [
          {
            name: "page",
            type: "number",
            required: true,
            description: "Current page, 1-based. Clamped to [1, pageCount].",
            owner: "getPageWindow",
          },
          {
            name: "pageCount",
            type: "number",
            required: true,
            description: "Total pages. 0 returns [].",
            owner: "getPageWindow",
          },
          {
            name: "siblings",
            type: "number",
            default: "1",
            description: "Pages on each side of the current page.",
            owner: "getPageWindow",
          },
          {
            name: "boundaries",
            type: "number",
            default: "1",
            description: "Pages always shown at each end.",
            owner: "getPageWindow",
          },
          {
            name: "page / defaultPage / onPageChange",
            type: "number / number / (page: number) => void",
            description:
              "Controlled when `page` is passed, uncontrolled otherwise. `onPageChange` gets the clamped page and fires only on change.",
            owner: "usePagination",
          },
          {
            name: "return",
            type: "{ page, pageCount, items, canPrev, canNext, setPage, prev, next }",
            description:
              "`items` is `getPageWindow` output for the current page.",
            owner: "usePagination",
          },
        ],
        examples: [
          {
            title: "Page window",
            code: `getPageWindow({ page: 10, pageCount: 20 })
// [1, "ellipsis", 9, 10, 11, "ellipsis", 20]`,
          },
          {
            title: "Custom pager",
            code: `const { page, pageCount, canPrev, canNext, prev, next } = usePagination({
  pageCount: 12,
  onPageChange: fetchPage,
})

<Button onClick={prev} disabled={!canPrev}>Previous</Button>
<span>Page {page} of {pageCount}</span>
<Button onClick={next} disabled={!canNext}>Next</Button>`,
          },
        ],
        pitfalls: [
          "Pages are 1-based; TanStack Table's pageIndex is 0-based.",
          'Two "ellipsis" entries can appear in one window - key them by index, key pages by number.',
          "Once pageCount exceeds 2*boundaries + 2*siblings + 3, the length is constant - do not rely on it matching pageCount.",
          'The module has no "use client" so `getPageWindow` works on the server; `usePagination` still needs a Client Component.',
          "`page` beyond pageCount is clamped for display; the hook does not rewrite a controlled value.",
        ],
        a11y: [
          'No markup. Render the current page with aria-current="page" and give page buttons a name containing the number.',
        ],
        related: ["pagination"],
      },
    },
  },
  {
    // Named after its main export. Lives in lib/ because it is behaviour with
    // no markup; `combobox` depends on it and wires it into Base UI.
    name: "use-combobox-creatable",
    type: "registry:lib",
    title: "useComboboxCreatable",
    categories: ["forms"],
    description:
      'Headless creatable-combobox behaviour: a `Create "<text>"` option when nothing matches, and `onCreate` on pick or Enter.',
    dependencies: ["@base-ui/react"],
    files: [
      {
        path: "registry/fujin/lib/combobox-creatable.ts",
        type: "registry:lib",
      },
    ],
    meta: {
      fujin: {
        summary:
          "Turns Base UI Combobox root props into creatable ones: appends a create option for unmatched text and swaps picking it for `onCreate(text)`. No markup.",
        whenToUse: [
          "Building a custom creatable picker on Base UI Combobox without Fujin's `combobox` markup.",
        ],
        whenNotToUse: [
          "A creatable form field - pass `onCreate` to `combobox`, which already uses this hook.",
          "Free text where any string is valid - use `input`; nothing needs creating.",
        ],
        props: [
          {
            name: "onCreate",
            type: "(query: string) => Value | void | Promise<Value | void>",
            description:
              "Enables the behaviour. Return the new item (or a promise) to select it; return nothing to cancel.",
          },
          {
            name: "formatCreateLabel",
            type: "(query: string) => string",
            default: '(q) => `Create "${q}"`',
            description: "Label of the create option.",
          },
          {
            name: "return",
            type: "{ enabled, rootProps, onInputKeyDown, pendingQuery }",
            description:
              "Spread `rootProps` over `Combobox.Root` after your own props; put `onInputKeyDown` on the input.",
          },
        ],
        examples: [
          {
            title: "On a bare Base UI Combobox",
            code: `const creatable = useComboboxCreatable({ ...rootProps, onCreate })

<Combobox.Root {...rootProps} {...creatable.rootProps}>
  <Combobox.Input onKeyDown={creatable.onInputKeyDown} />
  ...
  <Combobox.List>
    {(item) => isComboboxCreateItem(item)
      ? <Combobox.Item value={item}>{item.label}</Combobox.Item>
      : <Combobox.Item value={item}>{item.label}</Combobox.Item>}
  </Combobox.List>
</Combobox.Root>`,
          },
        ],
        pitfalls: [
          "Value and input text become controlled props on the root while enabled; uncontrolled callers get internal state, so pass `defaultValue` to the hook, not the root.",
          "Flat `items` only - grouped items get no create option (dev warning).",
          "Exact matches are compared on the item label, case-insensitively and trimmed; an exact match selects the existing item instead of creating.",
        ],
        related: ["combobox"],
      },
    },
  },
]
