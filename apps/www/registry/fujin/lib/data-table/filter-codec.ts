import type { FilterDef, FilterValue, FilterValues } from "./types"

/*
 * Filter values <-> flat URL / API params, plus the client-mode matcher. The
 * encoding is readable and doubles as a backend contract:
 *
 *   status=active,draft        any of            status_not=archived   none of
 *   title=halo                 contains          featured=true         yes / no
 *   price_gte=10&price_lte=20  number range      created_gte=2026-01-01  date range
 *
 * Commas inside a value are escaped as %2C.
 */

type FilterField = Pick<FilterDef, "key" | "type"> & { negatable?: boolean }

const LIST_SEPARATOR = ","
const ESCAPED_SEPARATOR = "%2C"

/** `["a", "b,c"]` -> `"a,b%2Cc"`. */
export function encodeList(values: readonly string[]): string {
  return values
    .map((value) => value.trim())
    .filter(Boolean)
    .map((value) => value.replaceAll(LIST_SEPARATOR, ESCAPED_SEPARATOR))
    .join(LIST_SEPARATOR)
}

/** `"a,b%2Cc"` -> `["a", "b,c"]`. */
export function decodeList(raw: string): string[] {
  return raw
    .split(LIST_SEPARATOR)
    .map((value) => value.trim().replaceAll(ESCAPED_SEPARATOR, LIST_SEPARATOR))
    .filter(Boolean)
}

/** The param names one filter occupies in the URL and the API query string. */
export function filterParamKeys(def: FilterField): string[] {
  switch (def.type) {
    case "enum":
    case "async":
      return def.negatable ? [def.key, `${def.key}_not`] : [def.key]
    case "text":
    case "boolean":
      return [def.key]
    case "number-range":
    case "date-range":
      return [`${def.key}_gte`, `${def.key}_lte`]
  }
}

function readParam(
  params: Readonly<Record<string, unknown>>,
  key: string
): string | undefined {
  const raw = params[key]
  if (typeof raw === "number") return String(raw)
  if (typeof raw !== "string") return undefined
  const trimmed = raw.trim()
  return trimmed === "" ? undefined : trimmed
}

/** Enum filters drop values that are not among their options (stale links, typos). */
function knownOnly(def: FilterField | FilterDef, values: string[]): string[] {
  if (!("options" in def)) return values
  const known = new Set(def.options.map((option) => option.value))
  return values.filter((value) => known.has(value))
}

/** Reads one filter from flat params. Malformed input is dropped, never thrown. */
export function parseFilterValue(
  def: FilterField | FilterDef,
  params: Readonly<Record<string, unknown>>
): FilterValue | undefined {
  switch (def.type) {
    case "enum":
    case "async": {
      const included = readParam(params, def.key)
      if (included) {
        const values = knownOnly(def, decodeList(included))
        if (values.length > 0) return { op: "in", values }
      }
      if (def.negatable) {
        const excluded = readParam(params, `${def.key}_not`)
        if (excluded) {
          const values = knownOnly(def, decodeList(excluded))
          if (values.length > 0) return { op: "not_in", values }
        }
      }
      return undefined
    }
    case "text": {
      const value = readParam(params, def.key)
      return value ? { op: "contains", value } : undefined
    }
    case "boolean": {
      const value = readParam(params, def.key)?.toLowerCase()
      if (value === "true" || value === "1" || value === "yes") {
        return { op: "eq", value: true }
      }
      if (value === "false" || value === "0" || value === "no") {
        return { op: "eq", value: false }
      }
      return undefined
    }
    case "number-range":
    case "date-range": {
      const min = readParam(params, `${def.key}_gte`)
      const max = readParam(params, `${def.key}_lte`)
      if (!min && !max) return undefined
      return {
        op: "between",
        ...(min ? { min } : {}),
        ...(max ? { max } : {}),
      }
    }
  }
}

export function parseFilterValues(
  defs: ReadonlyArray<FilterField | FilterDef>,
  params: Readonly<Record<string, unknown>>
): FilterValues {
  const out: Record<string, FilterValue> = {}
  for (const def of defs) {
    const value = parseFilterValue(def, params)
    if (value) out[def.key] = value
  }
  return out
}

/** Flat params for one filter value; an empty value produces none. */
export function serializeFilterValue(
  def: FilterField,
  value: FilterValue | undefined
): Record<string, string> {
  if (!value) return {}
  switch (value.op) {
    case "in":
      return value.values.length > 0
        ? { [def.key]: encodeList(value.values) }
        : {}
    case "not_in":
      return value.values.length > 0
        ? { [`${def.key}_not`]: encodeList(value.values) }
        : {}
    case "contains":
      return value.value.trim() ? { [def.key]: value.value.trim() } : {}
    case "eq":
      return { [def.key]: String(value.value) }
    case "between": {
      const out: Record<string, string> = {}
      if (value.min) out[`${def.key}_gte`] = value.min
      if (value.max) out[`${def.key}_lte`] = value.max
      return out
    }
  }
}

/**
 * Flat params for every filter. Params of filters that are not set come back
 * as `null`, so spreading the result over the current params clears them.
 * This is also the shape to send to an API: drop the nulls and you have the
 * query string.
 */
export function serializeFilterValues(
  defs: readonly FilterField[],
  values: FilterValues
): Record<string, string | null> {
  const out: Record<string, string | null> = {}
  for (const def of defs) {
    for (const key of filterParamKeys(def)) out[key] = null
    Object.assign(out, serializeFilterValue(def, values[def.key]))
  }
  return out
}

export function isEmptyFilterValue(value: FilterValue | undefined): boolean {
  if (!value) return true
  switch (value.op) {
    case "in":
    case "not_in":
      return value.values.length === 0
    case "contains":
      return value.value.trim() === ""
    case "eq":
      return false
    case "between":
      return !value.min && !value.max
  }
}

/** Drops empty values, so `{}` always means "no filters". */
export function normalizeFilterValues(values: FilterValues): FilterValues {
  const out: Record<string, FilterValue> = {}
  for (const [key, value] of Object.entries(values)) {
    if (!isEmptyFilterValue(value)) out[key] = value
  }
  return out
}

/** A copy of `values` with one filter set, or removed when `value` is undefined. */
export function withFilter(
  values: FilterValues,
  key: string,
  value: FilterValue | undefined
): FilterValues {
  const rest: Record<string, FilterValue> = { ...values }
  delete rest[key]
  return value && !isEmptyFilterValue(value) ? { ...rest, [key]: value } : rest
}

function sameList(a: readonly string[], b: readonly string[]): boolean {
  if (a.length !== b.length) return false
  const sorted = [...b].sort()
  return [...a].sort().every((value, index) => value === sorted[index])
}

export function filterValueEquals(
  a: FilterValue | undefined,
  b: FilterValue | undefined
): boolean {
  if (isEmptyFilterValue(a) && isEmptyFilterValue(b)) return true
  if (!a || !b || a.op !== b.op) return false
  switch (a.op) {
    case "in":
    case "not_in":
      return sameList(a.values, (b as typeof a).values)
    case "contains":
      return a.value.trim() === (b as typeof a).value.trim()
    case "eq":
      return a.value === (b as typeof a).value
    case "between":
      return (
        (a.min ?? "") === ((b as typeof a).min ?? "") &&
        (a.max ?? "") === ((b as typeof a).max ?? "")
      )
  }
}

export function filterValuesEqual(a: FilterValues, b: FilterValues): boolean {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)])
  for (const key of keys) {
    if (!filterValueEquals(a[key], b[key])) return false
  }
  return true
}

/* -------------------------------------------------------------------------- */
/* Client-mode matching                                                       */
/* -------------------------------------------------------------------------- */

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

/** Text of a cell value for matching: strings and numbers as-is, arrays joined, dates as ISO. */
export function cellText(cell: unknown): string {
  if (typeof cell === "string") return cell
  if (typeof cell === "number" || typeof cell === "boolean") return String(cell)
  if (cell instanceof Date) return cell.toISOString()
  if (Array.isArray(cell)) return cell.map(cellText).join(" ")
  return ""
}

function asNumber(value: unknown): number | undefined {
  if (typeof value === "number")
    return Number.isFinite(value) ? value : undefined
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : undefined
  }
  return undefined
}

function asTime(value: unknown): number | undefined {
  if (value instanceof Date) return value.getTime()
  if (typeof value === "string") {
    const time = Date.parse(value)
    return Number.isNaN(time) ? undefined : time
  }
  if (typeof value === "number") return value
  return undefined
}

/**
 * Local-calendar bounds of a `YYYY-MM-DD` day: "created on 2026-09-28" means
 * that day where the user is, not in UTC.
 */
function dayStart(key: string): number {
  const [y, m, d] = key.split("-").map(Number)
  return new Date(y ?? 0, (m ?? 1) - 1, d ?? 1).getTime()
}

function dayEnd(key: string): number {
  const [y, m, d] = key.split("-").map(Number)
  return new Date(y ?? 0, (m ?? 1) - 1, (d ?? 1) + 1).getTime() - 1
}

/** Does a cell value satisfy the filter? Client mode only; a server applies filters itself. */
export function matchFilterValue(cell: unknown, filter: FilterValue): boolean {
  switch (filter.op) {
    case "in":
    case "not_in": {
      const cells = Array.isArray(cell) ? cell : [cell]
      const hit = cells.some((c) => filter.values.includes(cellText(c)))
      return filter.op === "in" ? hit : !hit
    }
    case "contains":
      return cellText(cell)
        .toLowerCase()
        .includes(filter.value.trim().toLowerCase())
    case "eq": {
      const bool =
        typeof cell === "string" ? cell.toLowerCase() === "true" : Boolean(cell)
      return bool === filter.value
    }
    case "between": {
      const bound = filter.min ?? filter.max ?? ""
      if (ISO_DATE.test(bound)) {
        const time = asTime(cell)
        if (time === undefined) return false
        if (filter.min && time < dayStart(filter.min)) return false
        if (filter.max && time > dayEnd(filter.max)) return false
        return true
      }
      const value = asNumber(cell)
      if (value === undefined) return false
      const min = asNumber(filter.min)
      const max = asNumber(filter.max)
      if (min !== undefined && value < min) return false
      if (max !== undefined && value > max) return false
      return true
    }
  }
}

/* -------------------------------------------------------------------------- */
/* Sort                                                                       */
/* -------------------------------------------------------------------------- */

export type SortState = { field: string; direction: "asc" | "desc" }

/** `"-price"` -> `{ field: "price", direction: "desc" }`. */
export function parseSort(sort: string | undefined): SortState | undefined {
  const value = sort?.trim()
  if (!value) return undefined
  return value.startsWith("-")
    ? { field: value.slice(1), direction: "desc" }
    : { field: value, direction: "asc" }
}

export function formatSort(state: SortState | undefined): string | undefined {
  if (!state) return undefined
  return state.direction === "desc" ? `-${state.field}` : state.field
}

/** Header click: none -> ascending -> descending -> none. */
export function toggleSort(
  sort: string | undefined,
  field: string
): string | undefined {
  const current = parseSort(sort)
  if (current?.field !== field) return field
  return current.direction === "asc" ? `-${field}` : undefined
}
