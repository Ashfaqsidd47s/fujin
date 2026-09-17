# @fujin/cli

Add production-ready [Fujin](https://fujin.dev) components, blocks and recipes
to your React project. Fujin is a shadcn-compatible registry built on Base UI
and Tailwind CSS v4; the code is copied into your project, so you own it.

## Usage

```bash
# New app
npx @fujin/cli create my-app --template next   # or --template react

# Existing app (React 19 + Tailwind v4)
npx @fujin/cli init
npx @fujin/cli add button field

# Explore
npx @fujin/cli list --type ui
npx @fujin/cli info field

# Agent setup (Claude Code, Cursor, VS Code)
npx @fujin/cli mcp init --client claude

npx @fujin/cli doctor
```

| Command          | What it does                                                                      |
| ---------------- | --------------------------------------------------------------------------------- |
| `create <name>`  | Scaffold an app from the `next` or `react` template                               |
| `init`           | Run `shadcn init` if needed, register `@fujin`, install theme tokens              |
| `add <items...>` | Install items (and their dependencies) via the shadcn CLI                         |
| `list`           | List registry items (`--type`, `--category`, `--json`)                            |
| `info <item>`    | Usage guidance: when to use it, props, pitfalls, examples                         |
| `mcp init`       | Add the Fujin MCP server to `.mcp.json`, `.cursor/mcp.json` or `.vscode/mcp.json` |
| `doctor`         | Check React, Tailwind and `components.json`                                       |

Global option: `-c, --cwd <path>`.

## Environment

| Variable             | Default               | Purpose                                      |
| -------------------- | --------------------- | -------------------------------------------- |
| `FUJIN_REGISTRY_URL` | `https://fujin.dev/r` | Use a self-hosted or local registry          |
| `FUJIN_TEMPLATE_DIR` | -                     | Create apps from a local `templates/` folder |

Everything the CLI installs can also be installed with
`npx shadcn@latest add @fujin/<name>`.

Docs: https://fujin.dev/docs/cli · Source: https://github.com/ashfaqaxe-stack/fujin

MIT
