# @fujin/mcp

MCP server for the [Fujin](https://fujin.dev) component registry. It gives
coding agents a structured, token-efficient view of every component: what it
is for, when **not** to use it, props, pitfalls, accessibility notes and
examples, with source only on request.

## Setup

```bash
npx @fujin/cli mcp init --client claude   # or cursor, vscode
```

or add it yourself:

```json
{
  "mcpServers": {
    "fujin": { "command": "npx", "args": ["-y", "@fujin/mcp@latest"] }
  }
}
```

## Tools

| Tool                  | Returns                                            |
| --------------------- | -------------------------------------------------- |
| `list_items`          | One line per item (filter by `type`, `category`)   |
| `search_items`        | Ranked one-line matches for a query                |
| `get_item`            | Usage guidance for one item; `sections` narrows it |
| `get_item_source`     | The files the item installs                        |
| `get_install_command` | A single install command                           |

Resources: `fujin://catalog`, `fujin://item/{name}`.

## Configuration

| Variable             | Default                                            |
| -------------------- | -------------------------------------------------- |
| `FUJIN_REGISTRY_URL` | `https://fujin.dev/r` (a URL or a local directory) |

## Programmatic use

```ts
import { createServer, RegistryClient } from "@fujin/mcp"

const server = createServer(
  new RegistryClient("https://registry.example.com/r")
)
```

MIT
