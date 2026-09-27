/**
 * Where the docs site and registry are hosted. Change it with
 * `pnpm configure --site <url>` rather than by hand: the same URL also appears
 * in the templates and the docs.
 */
export const SITE_URL = "https://fujin.dev"

/** Base URL of the registry JSON (`{REGISTRY_URL}/{name}.json`). */
export const DEFAULT_REGISTRY_URL = `${SITE_URL}/r`

/** shadcn registry namespace used in `components.json`. */
export const REGISTRY_NAMESPACE = "@fujin"

/** GitHub `owner/repo`. `fujin create` downloads templates from here. */
export const GITHUB_REPOSITORY = "ashfaqaxe-stack/fujin"
