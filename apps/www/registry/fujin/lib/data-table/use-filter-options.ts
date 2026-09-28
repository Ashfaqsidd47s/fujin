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
    const controller = new AbortController()
    resolve(missingKey.split("\u0000"), controller.signal).then(
      (options) => {
        if (controller.signal.aborted) return
        remember(def.key, options)
        setResolved(options)
      },
      () => {}
    )
    return () => controller.abort()
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
