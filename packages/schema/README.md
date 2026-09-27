# @fujin/schema

Zod schemas and types shared by the [Fujin](https://fujin.dev) CLI, MCP server
and registry build.

- `registryItemSchema`, `registrySchema`: shadcn-compatible registry items,
  with `meta.fujin` typed.
- `fujinMetaSchema`: agent-facing guidance attached to every item.
- `SITE_URL`, `DEFAULT_REGISTRY_URL`, `REGISTRY_NAMESPACE`.

```ts
import { registryItemSchema, type FujinMeta } from "@fujin/schema"
```

MIT
