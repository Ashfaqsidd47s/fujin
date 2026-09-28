import type { FilterDef, FilterOption, FilterValue } from "./types"

export type FilterSummary = {
  /** "is", "is not", "contains", "is between", "is at least", "is at most". */
  verb: string
  /** "Active, Draft", "“gold”", "$10 and $20". */
  detail: string
  /** `${label} ${verb} ${detail}`: the chip's accessible name. */
  text: string
}

/** A value's label: the enum option, a resolved async option, or the raw value. */
export function optionLabel(
  def: FilterDef<never>,
  value: string,
  resolved?: ReadonlyMap<string, FilterOption>
): string {
  if (def.type === "enum") {
    return def.options.find((option) => option.value === value)?.label ?? value
  }
  return resolved?.get(value)?.label ?? value
}

/** "Sep 28, 2026" for a `YYYY-MM-DD` key, with no timezone drift. */
export function formatDateKey(key: string, locale?: string): string {
  const date = new Date(`${key}T00:00:00.000Z`)
  if (Number.isNaN(date.getTime())) return key
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(date)
}

export type FilterSummaryOptions = {
  resolved?: ReadonlyMap<string, FilterOption>
  locale?: string
  /** Values listed before "+N more". Default 2, as Shopify's chips do. */
  maxListed?: number
}

/** The human summary of an applied filter, for chips, tooltips and screen readers. */
export function filterSummary(
  def: FilterDef<never>,
  value: FilterValue,
  { resolved, locale, maxListed = 2 }: FilterSummaryOptions = {}
): FilterSummary {
  const done = (verb: string, detail: string): FilterSummary => ({
    verb,
    detail,
    text: `${def.label} ${verb} ${detail}`,
  })
  switch (value.op) {
    case "in":
    case "not_in": {
      const labels = value.values.map((v) => optionLabel(def, v, resolved))
      const shown = labels.slice(0, maxListed)
      const rest = labels.length - shown.length
      const detail =
        rest > 0 ? `${shown.join(", ")} +${rest} more` : shown.join(", ")
      return done(value.op === "in" ? "is" : "is not", detail)
    }
    case "contains":
      return done("contains", `“${value.value}”`)
    case "eq": {
      const yes = def.type === "boolean" ? def.trueLabel : undefined
      const no = def.type === "boolean" ? def.falseLabel : undefined
      return done("is", value.value ? (yes ?? "Yes") : (no ?? "No"))
    }
    case "between": {
      const format = (v: string) => {
        if (def.type === "date-range") return formatDateKey(v, locale)
        if (def.type === "number-range") {
          return `${def.prefix ?? ""}${v}${def.suffix ?? ""}`
        }
        return v
      }
      if (value.min && value.max) {
        return value.min === value.max
          ? done(def.type === "date-range" ? "is on" : "is", format(value.min))
          : done("is between", `${format(value.min)} and ${format(value.max)}`)
      }
      if (value.min) {
        return done(
          def.type === "date-range" ? "is on or after" : "is at least",
          format(value.min)
        )
      }
      return done(
        def.type === "date-range" ? "is on or before" : "is at most",
        format(value.max ?? "")
      )
    }
  }
}

/* -------------------------------------------------------------------------- */
/* Date presets                                                               */
/* -------------------------------------------------------------------------- */

/** `YYYY-MM-DD` of a local calendar day. */
export function toDateKey(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

function daysAgo(days: number): string {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return toDateKey(date)
}

/** Shopify's date filter choices. Ranges end today, in the user's timezone. */
export const DEFAULT_DATE_PRESETS = [
  {
    id: "today",
    label: "Today",
    range: () => ({ from: daysAgo(0), to: daysAgo(0) }),
  },
  {
    id: "last-7-days",
    label: "Last 7 days",
    range: () => ({ from: daysAgo(6), to: daysAgo(0) }),
  },
  {
    id: "last-30-days",
    label: "Last 30 days",
    range: () => ({ from: daysAgo(29), to: daysAgo(0) }),
  },
  {
    id: "last-90-days",
    label: "Last 90 days",
    range: () => ({ from: daysAgo(89), to: daysAgo(0) }),
  },
  {
    id: "last-12-months",
    label: "Last 12 months",
    range: () => ({ from: daysAgo(364), to: daysAgo(0) }),
  },
] as const
