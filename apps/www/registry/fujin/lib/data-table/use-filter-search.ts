"use client"

import * as React from "react"

import { decodeList, encodeList, withFilter } from "./filter-codec"
import {
  caretContext,
  findFilterDef,
  parseQualifierValue,
  parseQuery,
  quoteIfNeeded,
  replaceRange,
  tokenizeQuery,
  type QueryToken,
} from "./query-syntax"
import type {
  AsyncFilterDef,
  DataTableView,
  FilterDef,
  FilterOption,
  FilterValue,
  FilterValues,
  ListState,
} from "./types"
import { useFilterOptions } from "./use-filter-options"

/*
 * The behaviour of the search box inside the filter bar, as an ARIA 1.2
 * combobox (focus stays in the input; the highlighted option is announced
 * through `aria-activedescendant`). No markup: the component spreads
 * `inputProps` and renders `groups`.
 *
 * - On focus it lists the filters (pinned first). Picking one asks the bar to
 *   open that filter's chip so a value can be chosen (Shopify).
 * - Typing offers matching filters and matching values: "dr" -> "Status is
 *   Draft". Picking a value applies it at once.
 * - Typed qualifiers (`status:active`, `-vendor:acme`, `price:>=10`) become
 *   chips on space, Enter or blur (GitHub); after `status:` it lists values.
 * - Anything else is free text, committed to `q` after a short pause.
 */

export type FilterSuggestion =
  | {
      kind: "field"
      id: string
      def: FilterDef<never>
      apply: () => void
    }
  | {
      kind: "value"
      id: string
      def: FilterDef<never>
      option: FilterOption
      negated: boolean
      apply: () => void
    }
  | {
      kind: "view"
      id: string
      view: DataTableView
      apply: () => void
    }
  | { kind: "hint"; id: string; message: string }

export type FilterSuggestionGroup = {
  id: "views" | "fields" | "values"
  heading: string
  items: Array<Exclude<FilterSuggestion, { kind: "hint" }>>
}

export type UseFilterSearchOptions = {
  defs: readonly FilterDef<never>[]
  list: ListState
  /** Commit free text to `q`. Off when the table has no search: text then only finds filters. */
  allowText?: boolean
  /** Offer filters and matching values in the list. */
  showFilters?: boolean
  /** A filter was picked: open its chip so a value can be chosen. */
  onOpenFilter: (key: string) => void
  /** Backspace / Left at the very start of the box: move focus to the last chip. */
  onFocusLastChip?: () => void
  /** Pause before free text becomes `q`. Default 300 ms. */
  debounceMs?: number
  /** Views to offer when a typed word matches their name (Shopify). */
  views?: readonly DataTableView[]
  onSelectView?: (view: DataTableView) => void
}

/** Value suggestions offered for one typed word. */
const MAX_VALUE_SUGGESTIONS = 8

const NO_ASYNC: AsyncFilterDef<never> | undefined = undefined

function matchesWord(def: FilterDef<never>, word: string): boolean {
  const needle = word.toLowerCase()
  return (
    def.label.toLowerCase().includes(needle) ||
    def.key.toLowerCase().startsWith(needle) ||
    (def.aliases ?? []).some((alias) => alias.toLowerCase().startsWith(needle))
  )
}

function booleanOptions(def: FilterDef<never>): FilterOption[] {
  if (def.type !== "boolean") return []
  return [
    { value: "true", label: def.trueLabel ?? "Yes" },
    { value: "false", label: def.falseLabel ?? "No" },
  ]
}

/**
 * The text with every qualifier that became a filter cut out (with the space
 * after it), everything else kept exactly as typed, and the caret moved by
 * however much was cut before it.
 */
function withoutAppliedQualifiers(
  input: string,
  caret: number,
  defs: readonly FilterDef<never>[]
): { text: string; caret: number } {
  let text = ""
  let nextCaret = caret
  let from = 0
  for (const token of tokenizeQuery(input)) {
    if (token.kind !== "qualifier") continue
    const def = findFilterDef(defs, token.key)
    if (!def || !parseQualifierValue(def, token)) continue
    let end = token.end
    while (end < input.length && /\s/.test(input.charAt(end))) end += 1
    text += input.slice(from, token.start)
    if (caret > token.start) nextCaret -= Math.min(caret, end) - token.start
    from = end
  }
  text += input.slice(from)
  return { text, caret: Math.max(0, Math.min(nextCaret, text.length)) }
}

/** Adds `value` to a multi-value filter, otherwise replaces the filter's value. */
export function withPickedValue(
  def: FilterDef<never>,
  current: FilterValue | undefined,
  value: string,
  negated = false
): FilterValue {
  if (def.type === "boolean") return { op: "eq", value: value === "true" }
  const op = negated ? "not_in" : "in"
  const multiple =
    (def.type === "enum" || def.type === "async") && def.multiple !== false
  if (multiple && current?.op === op && !current.values.includes(value)) {
    return { op, values: [...current.values, value] }
  }
  return { op, values: [value] }
}

export function useFilterSearch({
  defs,
  list,
  allowText = true,
  showFilters = true,
  onOpenFilter,
  onFocusLastChip,
  debounceMs = 300,
  views,
  onSelectView,
}: UseFilterSearchOptions) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const id = React.useId()
  const listboxId = `${id}-listbox`

  const external = list.q ?? ""
  const [draft, setDraft] = React.useState(external)
  const [lastExternal, setLastExternal] = React.useState(external)
  const [caret, setCaret] = React.useState(external.length)
  // Where to put the caret after the code replaced the text.
  const [caretRequest, setCaretRequest] = React.useState<{
    text: string
    position: number
  } | null>(null)
  const [focused, setFocused] = React.useState(false)
  const [dismissed, setDismissed] = React.useState(false)
  // -1: nothing highlighted, so Enter runs the search instead of picking.
  const [highlight, setHighlight] = React.useState(-1)
  // After Enter, warn about the qualifier under the caret too.
  const [submitted, setSubmitted] = React.useState(false)
  // Focus the code moves (after Clear all, a removed chip, a closed picker)
  // must not pop the list open over the table; only the user's focus does.
  const quietFocus = React.useRef(false)

  const parsed = React.useMemo(() => parseQuery(draft, defs), [draft, defs])

  // `q` changed from outside (clear all, a view, Back): show it.
  if (external !== lastExternal) {
    setLastExternal(external)
    if (external !== parsed.text) {
      setDraft(external)
      setCaret(external.length)
    }
  }

  const setText = React.useCallback(
    (text: string, position: number = text.length) => {
      setDraft(text)
      setCaret(position)
      setCaretRequest({ text, position })
    },
    []
  )

  // A layout effect, so the caret moves before the next keystroke lands; and
  // only while the box still holds that text, or a fast typist's next
  // character would be yanked back to the old caret position.
  React.useLayoutEffect(() => {
    const input = inputRef.current
    if (!caretRequest || !input || input.value !== caretRequest.text) return
    if (document.activeElement !== input) return
    input.setSelectionRange(caretRequest.position, caretRequest.position)
  }, [caretRequest])

  /** Typed qualifiers become chips (merged into the filters); the rest is `q`. */
  const commit = React.useCallback(
    (text: string) => {
      const next = parseQuery(text, defs)
      const typed = Object.keys(next.filters).length > 0
      if (typed) {
        const rest = withoutAppliedQualifiers(
          text,
          inputRef.current?.selectionStart ?? text.length,
          defs
        )
        setText(rest.text, rest.caret)
      }
      const nextQ = allowText ? next.text || undefined : list.q
      if (!typed && nextQ === list.q) return
      setLastExternal(nextQ ?? "")
      list.update({
        ...(allowText ? { q: nextQ } : {}),
        ...(typed ? { filters: { ...list.filters, ...next.filters } } : {}),
      })
    },
    [allowText, defs, list, setText]
  )

  const context = React.useMemo(
    () => caretContext(draft, caret),
    [draft, caret]
  )
  const activeDef =
    context.token?.kind === "qualifier" && context.valuePart !== null
      ? findFilterDef(defs, context.keyPart)
      : undefined
  // `status:active,dr|` -> chosen ["active"], still typing "dr".
  const valuePart = (context.valuePart ?? "").replace(/"$/, "")
  const lastComma = valuePart.lastIndexOf(",")
  const partial = valuePart.slice(lastComma + 1)
  const prefixKey = lastComma === -1 ? "" : valuePart.slice(0, lastComma)
  const prefixValues = React.useMemo(() => decodeList(prefixKey), [prefixKey])
  const asyncDef = activeDef?.type === "async" ? activeDef : NO_ASYNC
  const asyncOptions = useFilterOptions(
    asyncDef,
    partial,
    asyncDef !== undefined
  )
  const editingQualifier = focused && context.token?.kind === "qualifier"

  // Free text commits after a pause; a finished qualifier (caret moved past
  // it) at once. Qualifiers that don't parse stay in the box, with a warning,
  // and never hold the valid ones back.
  React.useEffect(() => {
    if (!focused || editingQualifier) return
    const typed = Object.keys(parsed.filters).length > 0
    if (!typed && (!allowText || (parsed.text || undefined) === list.q)) return
    const timer = window.setTimeout(
      () => {
        // Typed on since this was scheduled: the next run commits that instead.
        if (inputRef.current && inputRef.current.value !== draft) return
        commit(draft)
      },
      typed ? 0 : debounceMs
    )
    return () => window.clearTimeout(timer)
  }, [
    allowText,
    commit,
    debounceMs,
    draft,
    editingQualifier,
    focused,
    list.q,
    parsed,
  ])

  /** Drops the word under the caret (it found a filter) and applies `filters`. */
  const consumeWord = React.useCallback(
    (token: QueryToken | null, filters?: FilterValues) => {
      const rest = token
        ? replaceRange(draft, token.start, token.end, "")
            .value.replace(/\s+/g, " ")
            .trim()
        : draft
      setText(rest)
      setHighlight(-1)
      setDismissed(true)
      const nextQ = allowText
        ? parseQuery(rest, defs).text || undefined
        : list.q
      if (!filters && nextQ === list.q) return
      setLastExternal(nextQ ?? "")
      list.update({
        ...(allowText ? { q: nextQ } : {}),
        ...(filters ? { filters } : {}),
      })
    },
    [allowText, defs, draft, list, setText]
  )

  const replaceToken = React.useCallback(
    (token: QueryToken | null, replacement: string) => {
      const start = token ? token.start : caret
      const end = token ? token.end : caret
      setHighlight(-1)
      setDismissed(true)
      commit(replaceRange(draft, start, end, replacement).value)
    },
    [caret, commit, draft]
  )

  const { hints, groups } = React.useMemo(() => {
    const hints: Array<Extract<FilterSuggestion, { kind: "hint" }>> = []
    const groups: FilterSuggestionGroup[] = []
    if (!showFilters) return { hints, groups }

    // A typed qualifier: offer that field's values.
    if (context.valuePart !== null) {
      if (!activeDef) {
        hints.push({
          kind: "hint",
          id: "unknown",
          message: `No filter named “${context.keyPart}”.`,
        })
        return { hints, groups }
      }
      const negation = context.negated ? "-" : ""
      const toItem = (option: FilterOption) => ({
        kind: "value" as const,
        id: `value-${option.value}`,
        def: activeDef,
        option,
        negated: context.negated,
        apply: () =>
          replaceToken(
            context.token,
            `${negation}${activeDef.key}:${quoteIfNeeded(
              encodeList([...prefixValues, option.value])
            )} `
          ),
      })
      const needle = partial.toLowerCase()
      const matches = (option: FilterOption) =>
        !prefixValues.includes(option.value) &&
        (option.label.toLowerCase().includes(needle) ||
          option.value.toLowerCase().includes(needle))

      switch (activeDef.type) {
        case "enum":
          groups.push({
            id: "values",
            heading: `${activeDef.label} values`,
            items: activeDef.options.filter(matches).map(toItem),
          })
          break
        case "boolean":
          groups.push({
            id: "values",
            heading: `${activeDef.label} values`,
            items: booleanOptions(activeDef).filter(matches).map(toItem),
          })
          break
        case "async":
          if (asyncOptions.isLoading) {
            hints.push({ kind: "hint", id: "loading", message: "Loading..." })
          } else if (asyncOptions.isError) {
            hints.push({
              kind: "hint",
              id: "error",
              message: "Couldn't load values.",
            })
          } else {
            groups.push({
              id: "values",
              heading: `${activeDef.label} values`,
              items: asyncOptions.options
                .filter((o) => !prefixValues.includes(o.value))
                .map(toItem),
            })
          }
          break
        case "text":
          hints.push({
            kind: "hint",
            id: "hint",
            message: `${activeDef.key}:word or ${activeDef.key}:"two words"`,
          })
          break
        case "number-range":
          hints.push({
            kind: "hint",
            id: "hint",
            message: `${activeDef.key}:10..20, ${activeDef.key}:>=10 or ${activeDef.key}:<=20`,
          })
          break
        case "date-range":
          hints.push({
            kind: "hint",
            id: "hint",
            message: `${activeDef.key}:2026-01-01..2026-01-31 or ${activeDef.key}:>=2026-01-01`,
          })
          break
      }
      return { hints, groups }
    }

    const word = context.token?.kind === "text" ? context.keyPart.trim() : ""
    const ordered = [
      ...defs.filter((def) => def.pinned),
      ...defs.filter((def) => !def.pinned),
    ]
    const fields = ordered
      .filter((def) => !word || matchesWord(def, word))
      .map((def) => ({
        kind: "field" as const,
        id: `field-${def.key}`,
        def,
        apply: () => {
          consumeWord(word ? context.token : null)
          onOpenFilter(def.key)
        },
      }))
    if (fields.length > 0) {
      groups.push({ id: "fields", heading: "Filters", items: fields })
    }
    if (!word) return { hints, groups }

    // Typing a view's name offers the view.
    const viewNeedle = word.toLowerCase()
    const matchingViews = (views ?? [])
      .filter((view) => view.label.toLowerCase().includes(viewNeedle))
      .map((view) => ({
        kind: "view" as const,
        id: `view-${view.id}`,
        view,
        apply: () => {
          setText("")
          setHighlight(-1)
          setDismissed(true)
          onSelectView?.(view)
        },
      }))
    if (onSelectView && matchingViews.length > 0) {
      groups.unshift({ id: "views", heading: "Views", items: matchingViews })
    }

    // "dr" -> "Status is Draft": option values whose label matches the word.
    const needle = word.toLowerCase()
    const values: FilterSuggestionGroup["items"] = []
    for (const def of ordered) {
      const options = def.type === "enum" ? def.options : booleanOptions(def)
      for (const option of options) {
        if (!option.label.toLowerCase().includes(needle)) continue
        values.push({
          kind: "value",
          id: `match-${def.key}-${option.value}`,
          def,
          option,
          negated: false,
          apply: () =>
            consumeWord(
              context.token,
              withFilter(
                list.filters,
                def.key,
                withPickedValue(def, list.filters[def.key], option.value)
              )
            ),
        })
      }
    }
    if (values.length > 0) {
      groups.push({
        id: "values",
        heading: "Suggestions",
        items: values.slice(0, MAX_VALUE_SUGGESTIONS),
      })
    }
    return { hints, groups }
  }, [
    activeDef,
    asyncOptions,
    consumeWord,
    context,
    defs,
    list.filters,
    onOpenFilter,
    partial,
    prefixValues,
    replaceToken,
    setText,
    showFilters,
    onSelectView,
    views,
  ])

  const selectable = React.useMemo(
    () => groups.flatMap((group) => group.items),
    [groups]
  )
  const open =
    focused && !dismissed && (selectable.length > 0 || hints.length > 0)
  const activeIndex = highlight < selectable.length ? highlight : -1
  const optionId = (index: number) => `${listboxId}-option-${index}`

  const warnings = React.useMemo(() => {
    const messages: string[] = []
    for (const token of parsed.unknown) {
      if (focused && !submitted && context.token?.start === token.start)
        continue
      const def = findFilterDef(defs, token.key)
      messages.push(
        def
          ? `“${token.value}” isn't a valid value for ${def.label}.`
          : `No filter named “${token.key ?? token.raw}”.`
      )
    }
    return messages
  }, [context.token, defs, focused, parsed.unknown, submitted])

  const syncCaret = () => {
    const position = inputRef.current?.selectionStart
    if (typeof position === "number") setCaret(position)
  }

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    const input = event.currentTarget
    const atStart = input.selectionStart === 0 && input.selectionEnd === 0
    if (
      (event.key === "Backspace" || event.key === "ArrowLeft") &&
      atStart &&
      onFocusLastChip
    ) {
      event.preventDefault()
      setDismissed(true)
      onFocusLastChip()
      return
    }
    if (!open && event.key === "ArrowDown" && selectable.length > 0) {
      event.preventDefault()
      setDismissed(false)
      setHighlight(0)
      return
    }
    if (open && selectable.length > 0) {
      if (event.key === "ArrowDown") {
        event.preventDefault()
        setHighlight(
          activeIndex < 0 ? 0 : (activeIndex + 1) % selectable.length
        )
        return
      }
      if (event.key === "ArrowUp") {
        event.preventDefault()
        setHighlight(
          activeIndex < 0
            ? selectable.length - 1
            : (activeIndex - 1 + selectable.length) % selectable.length
        )
        return
      }
      if (event.key === "Home" && activeIndex >= 0) {
        event.preventDefault()
        setHighlight(0)
        return
      }
      if (event.key === "End" && activeIndex >= 0) {
        event.preventDefault()
        setHighlight(selectable.length - 1)
        return
      }
      if (event.key === "Enter" && activeIndex >= 0) {
        event.preventDefault()
        selectable[activeIndex]?.apply()
        return
      }
    }
    if (event.key === "Enter") {
      event.preventDefault()
      commit(draft)
      setDismissed(true)
      setSubmitted(true)
      return
    }
    if (event.key === "Escape") {
      if (open) {
        event.preventDefault()
        setDismissed(true)
        setHighlight(-1)
      } else if (draft !== "") {
        // A second Escape clears the text, as in GitHub's filter box.
        event.preventDefault()
        setText("")
        commit("")
      }
    }
  }

  const inputProps = {
    ref: inputRef,
    id,
    role: "combobox" as const,
    "aria-expanded": open,
    "aria-controls": listboxId,
    "aria-autocomplete": "list" as const,
    "aria-activedescendant":
      open && activeIndex >= 0 ? optionId(activeIndex) : undefined,
    value: draft,
    autoComplete: "off",
    autoCorrect: "off",
    spellCheck: false,
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
      setSubmitted(false)
      setDraft(event.target.value)
      setCaret(event.target.selectionStart ?? event.target.value.length)
      setDismissed(false)
      setHighlight(-1)
    },
    onSelect: syncCaret,
    onKeyUp: syncCaret,
    onClick: () => {
      syncCaret()
      setDismissed(false)
    },
    onKeyDown,
    onFocus: () => {
      setFocused(true)
      setDismissed(quietFocus.current)
      quietFocus.current = false
    },
    onBlur: () => {
      setFocused(false)
      setHighlight(-1)
      commit(draft)
    },
  }

  return {
    inputRef,
    inputProps,
    listboxId,
    open,
    hints,
    groups,
    /** Index of an item across all groups, for `optionId` and highlighting. */
    indexOf: (item: FilterSuggestionGroup["items"][number]) =>
      selectable.indexOf(item),
    activeIndex,
    optionId,
    setHighlight,
    warnings,
    /** Focus the box; the list opens only with `{ open: true }` (the ⊕ button). */
    focus: (options?: { open?: boolean }) => {
      quietFocus.current = !options?.open
      inputRef.current?.focus()
      if (options?.open) setDismissed(false)
    },
    /** The next focus (a popover handing focus back) leaves the list closed. */
    suppressNextOpen: () => {
      quietFocus.current = true
    },
  }
}

export type UseFilterSearchResult = ReturnType<typeof useFilterSearch>
