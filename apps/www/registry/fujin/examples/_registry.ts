import type { RegistryItemInput } from "@fujin/schema"

// Demo files rendered on the docs site. Never published.
export const examples: RegistryItemInput[] = [
  {
    name: "button-demo",
    type: "registry:example",
    registryDependencies: ["button"],
    files: [
      {
        path: "registry/fujin/examples/button-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "field-demo",
    type: "registry:example",
    registryDependencies: ["field", "input", "button"],
    files: [
      {
        path: "registry/fujin/examples/field-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "table-demo",
    type: "registry:example",
    registryDependencies: ["table"],
    files: [
      {
        path: "registry/fujin/examples/table-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "checkbox-demo",
    type: "registry:example",
    registryDependencies: ["checkbox"],
    files: [
      {
        path: "registry/fujin/examples/checkbox-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "separator-demo",
    type: "registry:example",
    registryDependencies: ["separator"],
    files: [
      {
        path: "registry/fujin/examples/separator-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "skeleton-demo",
    type: "registry:example",
    registryDependencies: ["skeleton"],
    files: [
      {
        path: "registry/fujin/examples/skeleton-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "badge-demo",
    type: "registry:example",
    registryDependencies: ["badge"],
    files: [
      {
        path: "registry/fujin/examples/badge-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "popover-demo",
    type: "registry:example",
    registryDependencies: ["popover", "button"],
    files: [
      {
        path: "registry/fujin/examples/popover-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "tooltip-demo",
    type: "registry:example",
    registryDependencies: ["tooltip", "button"],
    files: [
      {
        path: "registry/fujin/examples/tooltip-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "dropdown-menu-demo",
    type: "registry:example",
    registryDependencies: ["dropdown-menu", "button"],
    files: [
      {
        path: "registry/fujin/examples/dropdown-menu-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "command-demo",
    type: "registry:example",
    registryDependencies: ["command"],
    files: [
      {
        path: "registry/fujin/examples/command-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "data-table-demo",
    type: "registry:example",
    registryDependencies: ["data-table", "badge"],
    files: [
      {
        path: "registry/fujin/examples/data-table-demo.tsx",
        type: "registry:example",
      },
    ],
  },
]
