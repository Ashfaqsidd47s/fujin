import { decodeList, encodeList } from "./filter-codec"
import type { FilterDef, FilterValue, FilterValues } from "./types"

/*
 * GitHub-style typed qualifiers in the search box:
 *
 *   status:active,draft   -status:archived   title:"halo ring"   price:10..20
 *   price:>=10   created:<=2026-09-01   featured:yes   plain words go to `q`
 *
 * Pure functions; the search box (`use-filter-search.ts`) turns these into
 * filter values and back.
 */

export type QueryToken = {
  raw: string
  /** Offsets into the input; `end` is exclusive. */
  start: number
  end: number
  kind: "qualifier" | "text"
  negated: boolean
  /** Qualifier name as typed, before the colon. */
  key?: string
  /** Qualifier value without surrounding quotes, or the word / phrase. */
  value: string
  quoted: boolean
}

const QUALIFIER = /^(-)?([A-Za-z_][\w.-]*):(.*)$/s

function stripQuotes(value: string): { value: string; quoted: boolean } {
  if (value.length >= 2 && value.startsWith('"') && value.endsWith('"')) {
    return { value: value.slice(1, -1), quoted: true }
  }
  if (value.startsWith('"')) return { value: value.slice(1), quoted: true }
  return { value, quoted: false }
}

/** Splits on whitespace, keeping double-quoted phrases together. */
export function tokenizeQuery(input: string): QueryToken[] {
  const tokens: QueryToken[] = []
  let i = 0
  while (i < input.length) {
    while (i < input.length && /\s/.test(input.charAt(i))) i += 1
    if (i >= input.length) break
    const start = i
    let inQuotes = false
    while (i < input.length && (inQuotes || !/\s/.test(input.charAt(i)))) {
      if (input.charAt(i) === '"') inQuotes = !inQuotes
      i += 1
    }
    const raw = input.slice(start, i)
    const match = QUALIFIER.exec(raw)
    if (match && !match[2]?.includes('"')) {
      const { value, quoted } = stripQuotes(match[3] ?? "")
      tokens.push({
        raw,
        start,
        end: i,
        kind: "qualifier",
        negated: match[1] === "-",
        key: match[2],
        value,
        quoted,
      })
    } else {
      const { value, quoted } = stripQuotes(raw)
      tokens.push({
        raw,
        start,
        end: i,
        kind: "text",
        negated: false,
        value,
        quoted,
      })
    }
  }
  return tokens
}

/** The filter a typed qualifier names: its key or an alias, case-insensitive. */
export function findFilterDef<TDef extends FilterDef<never>>(
  defs: readonly TDef[],
  key: string | undefined
): TDef | undefined {
  if (!key) return undefined
  const lower = key.toLowerCase()
  return defs.find(
    (def) =>
      def.key.toLowerCase() === lower ||
      def.aliases?.some((alias) => alias.toLowerCase() === lower)
  )
}

const NUMBER = String.raw`-?\d+(?:\.\d+)?`
const DATE = String.raw`\d{4}-\d{2}-\d{2}`

function parseRange(value: string, pattern: string): FilterValue | undefined {
  const v = value.trim()
  const tests: Array<[RegExp, (m: RegExpExecArray) => FilterValue]> = [
    [new RegExp(`^>=(${pattern})$`), (m) => ({ op: "between", min: m[1]! })],
    [new RegExp(`^<=(${pattern})$`), (m) => ({ op: "between", max: m[1]! })],
    [new RegExp(`^>(${pattern})$`), (m) => ({ op: "between", min: m[1]! })],
    [new RegExp(`^<(${pattern})$`), (m) => ({ op: "between", max: m[1]! })],
    [
      new RegExp(`^(${pattern})\\.\\.(${pattern})$`),
      (m) => ({ op: "between", min: m[1]!, max: m[2]! }),
    ],
    [
      new RegExp(`^(${pattern})\\.\\.$`),
      (m) => ({ op: "between", min: m[1]! }),
    ],
    [
      new RegExp(`^\\.\\.(${pattern})$`),
      (m) => ({ op: "between", max: m[1]! }),
    ],
    [
      new RegExp(`^(${pattern})$`),
      (m) => ({ op: "between", min: m[1]!, max: m[1]! }),
    ],
  ]
  for (const [regex, build] of tests) {
    const match = regex.exec(v)
    if (match) return build(match)
  }
  return undefined
}

/**
 * The option a typed value names: its value or label, case-insensitively, or
 * failing that the one option whose label or value starts with it
 * (`vendor:acme` finds "Acme Co"). Ambiguous prefixes match nothing.
 */
export function findOption<TOption extends { value: string; label: string }>(
  options: readonly TOption[],
  typed: string
): TOption | undefined {
  const lower = typed.trim().toLowerCase()
  if (!lower) return undefined
  const exact = options.find(
    (o) => o.value.toLowerCase() === lower || o.label.toLowerCase() === lower
  )
  if (exact) return exact
  const prefixed = options.filter(
    (o) =>
      o.value.toLowerCase().startsWith(lower) ||
      o.label.toLowerCase().startsWith(lower)
  )
  return prefixed.length === 1 ? prefixed[0] : undefined
}

const TRUE_WORDS = ["true", "yes", "1"]
const FALSE_WORDS = ["false", "no", "0"]

/**
 * One qualifier token as a filter value, or `undefined` when the value does
 * not fit the filter (unknown option, bad number, negating a filter that
 * cannot be negated).
 */
export function parseQualifierValue(
  def: FilterDef<never>,
  token: QueryToken
): FilterValue | undefined {
  const value = token.value.trim()
  if (value === "") return undefined
  switch (def.type) {
    case "enum": {
      const resolved: string[] = []
      for (const wanted of decodeList(value)) {
        const option = findOption(def.options, wanted)
        if (!option) return undefined
        if (!resolved.includes(option.value)) resolved.push(option.value)
      }
      const values = def.multiple === false ? resolved.slice(0, 1) : resolved
      if (token.negated) {
        return def.negatable ? { op: "not_in", values } : undefined
      }
      return { op: "in", values }
    }
    case "async": {
      const all = decodeList(value)
      const values = def.multiple === false ? all.slice(0, 1) : all
      if (token.negated) {
        return def.negatable ? { op: "not_in", values } : undefined
      }
      return { op: "in", values }
    }
    case "text":
      return token.negated ? undefined : { op: "contains", value }
    case "boolean": {
      if (token.negated) return undefined
      const lower = value.toLowerCase()
      const trueLabel = def.trueLabel?.toLowerCase()
      const falseLabel = def.falseLabel?.toLowerCase()
      if (TRUE_WORDS.includes(lower) || lower === trueLabel) {
        return { op: "eq", value: true }
      }
      if (FALSE_WORDS.includes(lower) || lower === falseLabel) {
        return { op: "eq", value: false }
      }
      return undefined
    }
    case "number-range":
      return token.negated ? undefined : parseRange(value, NUMBER)
    case "date-range":
      return token.negated ? undefined : parseRange(value, DATE)
  }
}

function mergeFilterValue(
  previous: FilterValue | undefined,
  next: FilterValue
): FilterValue {
  if (previous?.op !== next.op) return next
  switch (next.op) {
    case "in":
    case "not_in": {
      const values = [...(previous as typeof next).values]
      for (const value of next.values) {
        if (!values.includes(value)) values.push(value)
      }
      return { op: next.op, values }
    }
    case "between": {
      const prev = previous as typeof next
      const min = next.min ?? prev.min
      const max = next.max ?? prev.max
      return {
        op: "between",
        ...(min ? { min } : {}),
        ...(max ? { max } : {}),
      }
    }
    case "contains":
    case "eq":
      return next
  }
}

export type ParsedQuery = {
  /** Free-text words, joined by single spaces. */
  text: string
  filters: FilterValues
  /** Qualifiers for an unknown field, or with a value the field cannot take. */
  unknown: QueryToken[]
  /** `status:` with nothing after the colon: still being typed. */
  incomplete: QueryToken[]
}

export function parseQuery(
  input: string,
  defs: readonly FilterDef<never>[]
): ParsedQuery {
  const words: string[] = []
  const filters: Record<string, FilterValue> = {}
  const unknown: QueryToken[] = []
  const incomplete: QueryToken[] = []

  for (const token of tokenizeQuery(input)) {
    if (token.kind === "text") {
      const word = token.quoted ? `"${token.value}"` : token.value.trim()
      if (token.value.trim() !== "") words.push(word)
      continue
    }
    const def = findFilterDef(defs, token.key)
    if (!def) {
      unknown.push(token)
      continue
    }
    if (token.value.trim() === "") {
      incomplete.push(token)
      continue
    }
    const value = parseQualifierValue(def, token)
    if (!value) {
      unknown.push(token)
      continue
    }
    filters[def.key] = mergeFilterValue(filters[def.key], value)
  }

  return { text: words.join(" "), filters, unknown, incomplete }
}

/** Wraps a value in double quotes when it contains spaces: `vendor:"Acme Co"`. */
export function quoteIfNeeded(value: string): string {
  return /[\s"]/.test(value) ? `"${value.replaceAll('"', "")}"` : value
}

/** One applied filter as a typed qualifier: `status:active,draft`, `price:10..20`. */
export function qualifierFor(
  def: Pick<FilterDef<never>, "key">,
  value: FilterValue
): string | undefined {
  switch (value.op) {
    case "in":
      return value.values.length
        ? `${def.key}:${quoteIfNeeded(encodeList(value.values))}`
        : undefined
    case "not_in":
      return value.values.length
        ? `-${def.key}:${quoteIfNeeded(encodeList(value.values))}`
        : undefined
    case "contains":
      return value.value.trim()
        ? `${def.key}:${quoteIfNeeded(value.value.trim())}`
        : undefined
    case "eq":
      return `${def.key}:${value.value ? "true" : "false"}`
    case "between": {
      if (value.min && value.max) {
        return value.min === value.max
          ? `${def.key}:${value.min}`
          : `${def.key}:${value.min}..${value.max}`
      }
      if (value.min) return `${def.key}:>=${value.min}`
      if (value.max) return `${def.key}:<=${value.max}`
      return undefined
    }
  }
}

/** The canonical search-box text for a query: qualifiers in definition order, then the text. */
export function stringifyQuery(
  query: { text?: string; filters: FilterValues },
  defs: readonly FilterDef<never>[]
): string {
  const parts: string[] = []
  for (const def of defs) {
    const value = query.filters[def.key]
    if (!value) continue
    const qualifier = qualifierFor(def, value)
    if (qualifier) parts.push(qualifier)
  }
  const text = query.text?.trim()
  if (text) parts.push(text)
  return parts.join(" ")
}

export type CaretContext = {
  /** Token under the caret; null when the caret sits in whitespace. */
  token: QueryToken | null
  /** The field name typed so far ("sta" or "status"). */
  keyPart: string
  /** Text typed after the colon up to the caret; null while still typing the field name. */
  valuePart: string | null
  negated: boolean
}

/** Where the caret is, for autocomplete: a field name being typed, or a value for a field. */
export function caretContext(input: string, caret: number): CaretContext {
  const token =
    tokenizeQuery(input).find((t) => caret >= t.start && caret <= t.end) ?? null
  if (!token)
    return { token: null, keyPart: "", valuePart: null, negated: false }
  const upToCaret = input.slice(token.start, caret)
  if (token.kind === "text") {
    const negated = upToCaret.startsWith("-")
    return {
      token,
      keyPart: negated ? upToCaret.slice(1) : upToCaret,
      valuePart: null,
      negated,
    }
  }
  const colon = upToCaret.indexOf(":")
  if (colon === -1) {
    return {
      token,
      keyPart: token.key ?? "",
      valuePart: null,
      negated: token.negated,
    }
  }
  const rawValue = upToCaret.slice(colon + 1)
  return {
    token,
    keyPart: token.key ?? "",
    valuePart: rawValue.startsWith('"') ? rawValue.slice(1) : rawValue,
    negated: token.negated,
  }
}

/** Replaces `[start, end)` with `replacement` and reports where the caret lands. */
export function replaceRange(
  input: string,
  start: number,
  end: number,
  replacement: string
): { value: string; caret: number } {
  return {
    value: input.slice(0, start) + replacement + input.slice(end),
    caret: start + replacement.length,
  }
}
