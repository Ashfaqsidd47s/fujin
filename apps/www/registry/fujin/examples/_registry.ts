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
]
