/** @type {import("prettier").Config} */
export default {
  semi: false,
  singleQuote: false,
  trailingComma: "es5",
  printWidth: 80,
  plugins: ["prettier-plugin-tailwindcss", "prettier-plugin-packagejson"],
  // Same tokens as the docs site, without the Fumadocs preset (which the
  // plugin cannot parse).
  tailwindStylesheet: "./templates/next/app/globals.css",
  tailwindFunctions: ["cn", "cva"],
}
