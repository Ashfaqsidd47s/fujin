#!/usr/bin/env node
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js"

import { createServer } from "./server"

const server = createServer()
await server.connect(new StdioServerTransport())
// stdout is the protocol channel; diagnostics go to stderr.
console.error("fujin-mcp: ready")
