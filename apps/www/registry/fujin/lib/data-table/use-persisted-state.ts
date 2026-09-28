"use client"

import * as React from "react"

/*
 * `useState` that survives a reload, in `localStorage` under `key`. With no
 * key it is plain `useState`. It reads storage after mount, so server and
 * client render the same first frame (no hydration mismatch), and every
 * storage access is guarded: private windows and blocked storage just fall
 * back to memory. Tabs showing the same key stay in sync.
 */

const listeners = new Map<string, Set<() => void>>()

function read<T>(key: string, isValid: (value: unknown) => value is T) {
  try {
    const raw = window.localStorage.getItem(key)
    if (raw === null) return undefined
    const parsed: unknown = JSON.parse(raw)
    return isValid(parsed) ? parsed : undefined
  } catch {
    return undefined
  }
}

function write(key: string, value: unknown) {
  try {
    if (value === undefined) window.localStorage.removeItem(key)
    else window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Storage full or blocked: the value still lives in memory.
  }
  for (const listener of listeners.get(key) ?? []) listener()
}

export function usePersistedState<T>(
  key: string | undefined,
  initial: T,
  isValid: (value: unknown) => value is T
): [T, (next: T | ((prev: T) => T)) => void, () => void] {
  const [value, setValue] = React.useState(initial)
  const latest = React.useRef(value)
  React.useEffect(() => {
    latest.current = value
  }, [value])

  const validate = React.useRef(isValid)
  React.useEffect(() => {
    validate.current = isValid
  }, [isValid])

  React.useEffect(() => {
    if (!key) return
    const sync = () => {
      const stored = read(key, validate.current)
      if (stored !== undefined) setValue(stored)
    }
    sync()
    let set = listeners.get(key)
    if (!set) {
      set = new Set()
      listeners.set(key, set)
    }
    set.add(sync)
    const onStorage = (event: StorageEvent) => {
      if (event.key === key) sync()
    }
    window.addEventListener("storage", onStorage)
    return () => {
      set.delete(sync)
      window.removeEventListener("storage", onStorage)
    }
  }, [key])

  const update = React.useCallback(
    (next: T | ((prev: T) => T)) => {
      const resolved =
        typeof next === "function"
          ? (next as (prev: T) => T)(latest.current)
          : next
      latest.current = resolved
      setValue(resolved)
      if (key) write(key, resolved)
    },
    [key]
  )

  const reset = React.useCallback(() => {
    latest.current = initial
    setValue(initial)
    if (key) write(key, undefined)
  }, [initial, key])

  return [value, update, reset]
}
