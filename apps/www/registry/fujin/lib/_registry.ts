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
]
