"use client"

import * as React from "react"
import { Combobox as ComboboxPrimitive } from "@base-ui/react/combobox"

/*
 * Behaviour for a creatable combobox: when the typed text matches no item
 * exactly, offer a `Create "<text>"` option, and turn picking it (or pressing
 * Enter with nothing highlighted) into an `onCreate(text)` call. No markup -
 * `ui/combobox.tsx` wires this into Base UI's Combobox and renders the option.
 *
 * The create option is a real item appended to `items`, so Base UI's keyboard
 * navigation, highlighting and live-region announcements treat it like any
 * other option. It is never committed as a value: selecting it is intercepted
 * here and replaced by whatever `onCreate` returns.
 */

const CREATE_KEY = "__fujinCreate" as const

/** The synthetic item standing in for "create what I typed". */
type ComboboxCreateItem = {
  [CREATE_KEY]: true
  /** The trimmed text the item would create. */
  query: string
  /** True while an async `onCreate` is in flight. */
  pending: boolean
  // `{ id, value, label }` so list renderers keyed on any of them keep working.
  id: string
  value: string
  label: string
}

function isComboboxCreateItem(item: unknown): item is ComboboxCreateItem {
  return typeof item === "object" && item !== null && CREATE_KEY in item
}

type ComboboxCreateHandler<Value> = (
  query: string
) => Value | void | Promise<Value | void>

/** Mirrors Base UI's default: `{ label }` objects use `label`, anything else is stringified. */
function defaultItemToLabel(item: unknown): string {
  if (typeof item === "object" && item !== null && "label" in item) {
    return String((item as { label: unknown }).label)
  }
  return item == null ? "" : String(item)
}

function normalize(text: string) {
  return text.trim().toLocaleLowerCase()
}

/** Base UI's change details, minimally, for commits that no Base UI event produced. */
function syntheticDetails(event: Event) {
  return {
    reason: "none" as const,
    event,
    cancel() {},
    allowPropagation() {},
    isCanceled: false,
    isPropagationAllowed: false,
    trigger: undefined,
  }
}

/* Loosely typed on purpose: the public, generic types live on `Combobox`. */
/* eslint-disable @typescript-eslint/no-explicit-any */
type AnyHandler = (...args: any[]) => void

type UseComboboxCreatableOptions<Value> = {
  /** Turns the behaviour on. Without it every other option passes straight through. */
  onCreate?: ComboboxCreateHandler<Value>
  /** Label of the create option. Defaults to `Create "<query>"`. */
  formatCreateLabel?: (query: string) => string
  multiple?: boolean
  items?: readonly any[]
  value?: any
  defaultValue?: any
  onValueChange?: AnyHandler
  inputValue?: string | number | readonly string[]
  defaultInputValue?: string | number | readonly string[]
  onInputValueChange?: AnyHandler
  onItemHighlighted?: AnyHandler
  filter?: ((item: any, query: string, itemToString?: any) => boolean) | null
  itemToStringLabel?: (item: any) => string
  itemToStringValue?: (item: any) => string
  isItemEqualToValue?: (item: any, value: any) => boolean
}

type ComboboxCreatableInputKeyDown = (
  event: React.KeyboardEvent<HTMLInputElement> & {
    preventBaseUIHandler?: () => void
  }
) => void

type UseComboboxCreatableResult = {
  /** False when `onCreate` is not set; `rootProps` is then empty. */
  enabled: boolean
  /** Spread over the Base UI Combobox root, after the caller's own props. */
  rootProps: Record<string, unknown>
  /** Attach to the combobox `<input>`: Enter with nothing highlighted creates. */
  onInputKeyDown: ComboboxCreatableInputKeyDown | undefined
  /** The query being created by an async `onCreate`, or null. */
  pendingQuery: string | null
}

function useComboboxCreatable<Value>(
  options: UseComboboxCreatableOptions<Value>
): UseComboboxCreatableResult {
  const {
    onCreate,
    formatCreateLabel = (query) => `Create "${query}"`,
    multiple = false,
    items,
    value: valueProp,
    defaultValue,
    onValueChange,
    inputValue: inputValueProp,
    defaultInputValue,
    onInputValueChange,
    onItemHighlighted,
    filter,
    itemToStringLabel,
    itemToStringValue,
    isItemEqualToValue,
  } = options
  const enabled = onCreate !== undefined

  // Value and input text are always passed to Base UI as controlled props
  // while creatable, so a created item can be committed from outside a Base
  // UI event. Uncontrolled callers get internal state instead.
  const [internalValue, setInternalValue] = React.useState<unknown>(
    () => defaultValue ?? (multiple ? [] : null)
  )
  const value = valueProp !== undefined ? valueProp : internalValue
  // An async `onCreate` resolves later; append to the selection as it is then.
  const valueRef = React.useRef(value)
  React.useEffect(() => {
    valueRef.current = value
  })

  const [internalInput, setInternalInput] = React.useState(() =>
    String(defaultInputValue ?? "")
  )
  const query =
    inputValueProp !== undefined ? String(inputValueProp) : internalInput

  const [pendingQuery, setPendingQuery] = React.useState<string | null>(null)
  const highlightedRef = React.useRef<unknown>(undefined)

  const toLabel = React.useCallback(
    (item: unknown) =>
      isComboboxCreateItem(item)
        ? item.label
        : (itemToStringLabel ?? defaultItemToLabel)(item),
    [itemToStringLabel]
  )

  const flatItems = React.useMemo(() => {
    const list = items ?? []
    const grouped =
      list.length > 0 &&
      typeof list[0] === "object" &&
      list[0] !== null &&
      Array.isArray((list[0] as { items?: unknown }).items)
    if (grouped && enabled && process.env.NODE_ENV !== "production") {
      console.warn(
        "Combobox: `onCreate` supports flat `items` only; grouped items get no create option."
      )
    }
    return grouped ? null : list
  }, [items, enabled])

  const trimmed = query.trim()
  const exactMatch = React.useMemo(() => {
    if (!trimmed || !flatItems) return undefined
    const needle = normalize(trimmed)
    return flatItems.find((item) => normalize(toLabel(item)) === needle)
  }, [flatItems, trimmed, toLabel])

  const createItem = React.useMemo<ComboboxCreateItem | null>(() => {
    const createQuery = pendingQuery ?? (exactMatch ? "" : trimmed)
    if (!enabled || !flatItems || !createQuery) return null
    return {
      [CREATE_KEY]: true,
      query: createQuery,
      pending: pendingQuery !== null,
      id: `${CREATE_KEY}:${createQuery}`,
      value: `${CREATE_KEY}:${createQuery}`,
      label:
        pendingQuery !== null
          ? `Creating "${createQuery}"...`
          : formatCreateLabel(createQuery),
    }
    // formatCreateLabel is usually an inline function; its output is keyed by the query.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, flatItems, pendingQuery, exactMatch, trimmed])

  const setValue = React.useCallback(
    (next: unknown, details: unknown) => {
      if (valueProp === undefined) setInternalValue(next)
      onValueChange?.(next, details)
    },
    [valueProp, onValueChange]
  )

  const setQuery = React.useCallback(
    (next: string, details: unknown) => {
      if (inputValueProp === undefined) setInternalInput(next)
      onInputValueChange?.(next, details)
    },
    [inputValueProp, onInputValueChange]
  )

  const equals = React.useCallback(
    (a: unknown, b: unknown) =>
      isItemEqualToValue && !isComboboxCreateItem(a) && !isComboboxCreateItem(b)
        ? isItemEqualToValue(a, b)
        : Object.is(a, b),
    [isItemEqualToValue]
  )

  /** Selects `item`: appended in multiple mode (once), replaces in single mode. */
  const select = React.useCallback(
    (item: unknown, base: unknown, details: unknown) => {
      if (multiple) {
        const current = Array.isArray(base) ? base : []
        if (!current.some((entry) => equals(item, entry))) {
          setValue([...current, item], details)
        }
        setQuery("", details)
      } else {
        setValue(item, details)
        setQuery(toLabel(item), details)
      }
    },
    [multiple, equals, setValue, setQuery, toLabel]
  )

  const create = React.useCallback(
    (text: string, base: unknown, details: unknown) => {
      if (!onCreate || pendingQuery !== null) return
      if (exactMatch !== undefined) {
        select(exactMatch, base, details)
        return
      }

      const result = onCreate(text)
      if (result instanceof Promise) {
        setPendingQuery(text)
        // A rejection is left unhandled on purpose so it surfaces; handle
        // errors (toast, field error) inside `onCreate`.
        void result
          .then((created) => {
            if (created !== undefined) {
              select(
                created,
                valueRef.current,
                syntheticDetails(new Event("create"))
              )
            }
          })
          .finally(() => setPendingQuery(null))
        if (multiple) setQuery("", details)
        return
      }
      if (result !== undefined) select(result, base, details)
      else setQuery(multiple ? "" : query, details)
    },
    [onCreate, pendingQuery, exactMatch, select, multiple, setQuery, query]
  )

  const handleValueChange = React.useCallback(
    (next: unknown, details: unknown) => {
      if (multiple && Array.isArray(next)) {
        const picked = next.find(isComboboxCreateItem)
        if (picked) {
          if (!picked.pending) {
            create(
              picked.query,
              next.filter((entry) => entry !== picked),
              details
            )
          }
          return
        }
      } else if (isComboboxCreateItem(next)) {
        if (!next.pending) create(next.query, value, details)
        return
      }
      setValue(next, details)
    },
    [multiple, create, value, setValue]
  )

  const handleInputValueChange = React.useCallback(
    (next: string, details: unknown) => {
      // Picking the create option makes Base UI write its label into the input.
      if (createItem && next === createItem.label) return
      setQuery(next, details)
    },
    [createItem, setQuery]
  )

  const handleItemHighlighted = React.useCallback(
    (item: unknown, details: unknown) => {
      highlightedRef.current = item
      onItemHighlighted?.(item, details)
    },
    [onItemHighlighted]
  )

  const onInputKeyDown = React.useCallback<ComboboxCreatableInputKeyDown>(
    (event) => {
      if (event.key !== "Enter" || event.nativeEvent.isComposing) return
      if (highlightedRef.current !== undefined || !trimmed) return
      // Keep the form from submitting and the popup open for the next entry.
      event.preventDefault()
      event.preventBaseUIHandler?.()
      create(trimmed, value, syntheticDetails(event.nativeEvent))
    },
    [trimmed, create, value]
  )

  // Base UI's own default matcher (collator-based, case/accent-insensitive).
  const { contains } = ComboboxPrimitive.useFilter({ multiple: true })
  const wrappedFilter = React.useMemo(() => {
    if (filter === null) return null
    const base = filter ?? contains
    return (item: unknown, text: string, itemToString?: unknown) =>
      isComboboxCreateItem(item) ||
      base(item, text, itemToString as (item: unknown) => string)
  }, [filter, contains])

  if (!enabled) {
    return {
      enabled,
      rootProps: {},
      onInputKeyDown: undefined,
      pendingQuery: null,
    }
  }

  return {
    enabled,
    rootProps: {
      items: createItem && flatItems ? [...flatItems, createItem] : items,
      value,
      onValueChange: handleValueChange,
      inputValue: query,
      onInputValueChange: handleInputValueChange,
      onItemHighlighted: handleItemHighlighted,
      filter: wrappedFilter,
      itemToStringLabel: toLabel,
      itemToStringValue: itemToStringValue
        ? (item: unknown) =>
            isComboboxCreateItem(item) ? item.value : itemToStringValue(item)
        : undefined,
      isItemEqualToValue: isItemEqualToValue ? equals : undefined,
    },
    onInputKeyDown,
    pendingQuery,
  }
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export {
  isComboboxCreateItem,
  useComboboxCreatable,
  type ComboboxCreateHandler,
  type ComboboxCreateItem,
  type ComboboxCreatableInputKeyDown,
  type UseComboboxCreatableOptions,
  type UseComboboxCreatableResult,
}
