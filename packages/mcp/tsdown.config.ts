import { readFileSync } from "node:fs"

import { defineConfig } from "tsdown"

const pkg = JSON.parse(readFileSync("./package.json", "utf8")) as {
  version: string
}

export default defineConfig({
  entry: ["src/index.ts", "src/bin.ts"],
  format: ["esm"],
  dts: true,
  clean: true,
  target: "node22",
  define: {
    __FUJIN_VERSION__: JSON.stringify(pkg.version),
  },
})
