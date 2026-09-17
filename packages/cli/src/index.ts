#!/usr/bin/env node
import { Command, InvalidArgumentError, Option } from "commander"

import {
  add,
  create,
  doctor,
  info,
  init,
  list,
  MCP_CLIENTS,
  mcpInit,
  TEMPLATES,
  type McpClient,
  type Template,
} from "./commands"
import { CliError, logger } from "./utils"

// Injected from package.json at build time (tsdown.config.ts).
const VERSION = __FUJIN_VERSION__

const program = new Command()
  .name("fujin")
  .description(
    "Add production-ready Fujin components, blocks and recipes to your project."
  )
  .version(VERSION, "-v, --version")
  .option("-c, --cwd <path>", "working directory", process.cwd())

const cwd = () => program.opts<{ cwd: string }>().cwd

program
  .command("create")
  .description("create a new app from a Fujin template")
  .argument("<name>", "directory for the new app")
  .addOption(
    new Option("-t, --template <template>", "template to use")
      .choices(TEMPLATES)
      .default("next")
  )
  .addOption(
    new Option("--package-manager <pm>", "package manager").choices([
      "npm",
      "pnpm",
      "yarn",
      "bun",
    ])
  )
  .option("--no-install", "skip installing dependencies")
  .action((name: string, options) =>
    create(name, {
      template: options.template as Template,
      packageManager: options.packageManager,
      install: options.install,
    })
  )

program
  .command("init")
  .description("configure an existing project for Fujin")
  .option("-y, --yes", "skip prompts", false)
  .action((options) => init(cwd(), options))

program
  .command("add")
  .description("add components, blocks or recipes")
  .argument("[items...]", "item names, e.g. button field")
  .option("-y, --yes", "skip confirmation", false)
  .option("-o, --overwrite", "overwrite existing files", false)
  .option("--dry-run", "preview changes without writing files", false)
  .option("-p, --path <path>", "install into this directory")
  .action((items: string[], options) => add(cwd(), items, options))

program
  .command("list")
  .alias("ls")
  .description("list registry items")
  .option("-t, --type <type>", "ui, component, block, item, hook, lib")
  .option("--category <category>", "forms, data, auth, ...")
  .option("--json", "output JSON", false)
  .action((options) => list(options))

program
  .command("info")
  .description("show usage guidance for an item")
  .argument("<item>")
  .option("--json", "output JSON", false)
  .action((item: string, options) => info(item, options))

const mcp = program.command("mcp").description("MCP server configuration")

mcp
  .command("init")
  .description("add the Fujin MCP server to your editor config")
  .option(
    "--client <client>",
    `one of: ${Object.keys(MCP_CLIENTS).join(", ")}`,
    (value: string) => {
      if (!(value in MCP_CLIENTS)) {
        throw new InvalidArgumentError(
          `Expected one of ${Object.keys(MCP_CLIENTS).join(", ")}.`
        )
      }
      return value
    },
    "claude"
  )
  .action((options: { client: McpClient }) => mcpInit(cwd(), options.client))

program
  .command("doctor")
  .description("check the project for problems")
  .action(() => doctor(cwd()))

try {
  await program.parseAsync()
} catch (error) {
  if (error instanceof CliError) {
    logger.error(error.message)
  } else {
    // execa already printed the child's output; keep the summary short.
    logger.error(
      error instanceof Error ? error.message.split("\n")[0]! : String(error)
    )
  }
  process.exit(1)
}
