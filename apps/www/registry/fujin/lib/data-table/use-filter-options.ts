"use client"

import * as React from "react"

import type { AsyncFilterDef, FilterDef, FilterOption } from "./types"

/*
 * Option loading for `async` filters, with no data library: debounced,
 * aborted when superseded, cached per filter and query for a minute, and
 * every option seen is remembered so a chip can label a value the moment it
 * is picked (or when it comes back from the URL, via `resolveOptions`).
 */

const CACHE_MS = 60_000
const optionCache = new Map<
  string,
  { at: number; options: readonly FilterOption[] }
>()
const seenOptions = new Map<string, Map<string, FilterOption>>()
// `resolveOptions` calls in flight, so chips showing the same values (the
// search bar measures a hidden copy of each) share one request.
const resolving = new Map<string, Promise<readonly FilterOption[]>>()

function remember(filterKey: string, options: readonly FilterOption[]) {
  let known = seenOptions.get(filterKey)
  if (!known) {
    known = new Map()
    seenOptions.set(filterKey, known)
  }
  for (const option of options) known.set(option.value, option)
}

export function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = React.useState(value)
  React.useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), delay)
    return () => window.clearTimeout(id)
  }, [value, delay])
  return debounced
}

/** How long typing must pause before a list of options narrows. */
export const OPTION_SEARCH_DEBOUNCE_MS = 250

/**
 * Search text for filtering a list, settled after a pause in typing.
 * `pending` says the list still shows an older search; `flush` catches up
 * at once, for keys that act on the list (arrows, Enter). A new `scope` (a
 * different field being searched) starts from the typed text immediately.
 */
export function useDebouncedSearch(
  text: string,
  delay: number = OPTION_SEARCH_DEBOUNCE_MS,
  scope: string = ""
) {
  const [settled, setSettled] = React.useState({ scope, text })
  const value = settled.scope === scope ? settled.text : text

  React.useEffect(() => {
    if (settled.scope === scope && settled.text === text) return
    const id = window.setTimeout(
      () => setSettled({ scope, text }),
      settled.scope === scope ? delay : 0
    )
    return () => window.clearTimeout(id)
  }, [delay, scope, settled, text])

  return {
    value,
    pending: value !== text,
    flush: () => setSettled({ scope, text }),
  }
}

type OptionsState = {
  key: string
  options: readonly FilterOption[]
  status: "loading" | "ready" | "error"
}

const NO_OPTIONS: readonly FilterOption[] = []

/** Options of an async filter for the picker's search text. */
export function useFilterOptions(
  def: AsyncFilterDef<never> | undefined,
  query: string,
  enabled = true
) {
  const debounced = useDebouncedValue(query.trim(), def?.debounceMs ?? 250)
  const requestKey = def && enabled ? `${def.key}\u0000${debounced}` : null
  const [state, setState] = React.useState<OptionsState | null>(null)
  // A cached answer shows at once; the effect refreshes it once it is stale.
  const cached = requestKey ? optionCache.get(requestKey)?.options : undefined

  React.useEffect(() => {
    if (!def || !requestKey) return
    const entry = optionCache.get(requestKey)
    if (entry && Date.now() - entry.at < CACHE_MS) return
    const controller = new AbortController()
    def.loadOptions(debounced, controller.signal).then(
      (options) => {
        if (controller.signal.aborted) return
        optionCache.set(requestKey, { at: Date.now(), options })
        remember(def.key, options)
        setState({ key: requestKey, options, status: "ready" })
      },
      () => {
        if (controller.signal.aborted) return
        setState((prev) => ({
          key: requestKey,
          options: prev?.options ?? NO_OPTIONS,
          status: "error",
        }))
      }
    )
    return () => controller.abort()
  }, [debounced, def, requestKey])

  if (cached) return { options: cached, isLoading: false, isError: false }
  // While a new query loads, keep showing the previous result (no flicker).
  const current = state?.key === requestKey ? state : null
  return {
    options: current?.options ?? state?.options ?? NO_OPTIONS,
    isLoading: requestKey !== null && current === null,
    isError: current?.status === "error",
  }
}

/**
 * Labels for the values applied to a filter: enum options, then options seen
 * in earlier pickers, then `resolveOptions` for anything still unknown.
 */
export function useResolvedOptions(
  def: FilterDef<never>,
  values: readonly string[]
): ReadonlyMap<string, FilterOption> {
  const resolve = def.type === "async" ? def.resolveOptions : undefined
  const known = seenOptions.get(def.key)
  const missing = React.useMemo(
    () =>
      resolve ? [...values].filter((value) => !known?.has(value)).sort() : [],
    [known, resolve, values]
  )
  const missingKey = missing.join("\u0000")
  const [resolved, setResolved] =
    React.useState<readonly FilterOption[]>(NO_OPTIONS)

  React.useEffect(() => {
    if (!resolve || missingKey === "") return
    const requestKey = `${def.key}\u0000\u0000${missingKey}`
    let request = resolving.get(requestKey)
    if (!request) {
      // Shared, so no one caller may abort it; each ignores a late answer.
      request = resolve(
        missingKey.split("\u0000"),
        new AbortController().signal
      )
      resolving.set(requestKey, request)
      request.then(
        (options) => remember(def.key, options),
        () => {}
      )
      request.finally(() => resolving.delete(requestKey)).catch(() => {})
    }
    let cancelled = false
    request.then(
      (options) => {
        if (!cancelled) setResolved(options)
      },
      () => {}
    )
    return () => {
      cancelled = true
    }
  }, [def.key, missingKey, resolve])

  // Rebuilt when `values` change: `known` is filled in place as options load.
  return React.useMemo(() => {
    const map = new Map<string, FilterOption>()
    for (const value of values) {
      const option =
        (def.type === "enum"
          ? def.options.find((o) => o.value === value)
          : undefined) ??
        resolved.find((o) => o.value === value) ??
        known?.get(value)
      if (option) map.set(value, option)
    }
    return map
  }, [def, known, resolved, values])
}

/**
 * Enum options from the loaded rows, for client-mode tables whose values are
 * not known up front: `options: uniqueOptions(products, (p) => p.vendor)`.
 */
export function uniqueOptions<TData>(
  rows: readonly TData[],
  getValue: (row: TData) => unknown,
  getLabel: (value: string) => string = (value) => value
): FilterOption[] {
  const counts = new Map<string, number>()
  for (const row of rows) {
    const raw = getValue(row)
    const values = Array.isArray(raw) ? raw : [raw]
    for (const value of values) {
      if (value == null || value === "") continue
      const key = String(value)
      counts.set(key, (counts.get(key) ?? 0) + 1)
    }
  }
  return [...counts.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([value, count]) => ({ value, label: getLabel(value), count }))
}
