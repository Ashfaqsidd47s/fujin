import { createFromSource } from "fumadocs-core/search/server"

import { source } from "@/lib/source"

// Powers the docs search dialog (Ctrl+K).
export const { GET } = createFromSource(source, { language: "english" })
