import * as React from "react"

/**
 * Every piece of data-table state (sorting, filters, pagination, search,
 * column visibility) works both controlled (server mode - the app owns the
 * value and fetches on change) and uncontrolled (client mode - data-table
 * owns it). This is the one pattern behind all of them.
 *
 * `set` accepts a value or an updater function, resolved against a ref
 * (not the closed-over `current`) so that two synchronous calls in the same
 * event handler - before React re-renders - compose instead of the second
 * one clobbering the first. The ref is written by `set` itself (event-handler
 * time) and mirrored from the latest render in an effect - never during
 * render, which React refs must not be used for.
 */
export function useControllableState<T>(
  value: T | undefined,
  defaultValue: T,
  onChange?: (value: T) => void
): [T, (next: T | ((prev: T) => T)) => void] {
  const [internal, setInternal] = React.useState(defaultValue)
  const isControlled = value !== undefined
  const current = isControlled ? value : internal

  const currentRef = React.useRef(current)
  React.useEffect(() => {
    currentRef.current = current
  }, [current])

  const set = React.useCallback(
    (next: T | ((prev: T) => T)) => {
      const resolved =
        typeof next === "function"
          ? (next as (prev: T) => T)(currentRef.current)
          : next
      currentRef.current = resolved
      if (!isControlled) setInternal(resolved)
      onChange?.(resolved)
    },
    [isControlled, onChange]
  )

  return [current, set]
}
