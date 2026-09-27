import { readFileSync } from "node:fs"

import { defineConfig } from "tsdown"

const pkg = JSON.parse(readFileSync("./package.json", "utf8")) as {
  version: string
}

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  dts: true,
  clean: true,
  target: "node22",
  // Inlined, not externalised: it is 6 kB of constants and schemas, and
  // bundling it keeps `fujin` installable without publishing the @fujin scope.
  noExternal: ["@fujin/schema"],
  define: {
    __FUJIN_VERSION__: JSON.stringify(pkg.version),
  },
})
