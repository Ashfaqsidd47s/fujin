"use client"

import * as React from "react"
import { CheckIcon, SearchIcon } from "lucide-react"

import { DEFAULT_DATE_PRESETS } from "@/registry/fujin/lib/data-table/filter-summary"
import type {
  AsyncFilterDef,
  BooleanFilterDef,
  DateRangeFilterDef,
  EnumFilterDef,
  FilterDef,
  FilterOption,
  FilterValue,
  NumberRangeFilterDef,
  TextFilterDef,
} from "@/registry/fujin/lib/data-table/types"
import {
  useDebouncedSearch,
  useFilterOptions,
  useResolvedOptions,
} from "@/registry/fujin/lib/data-table/use-filter-options"
import { cn } from "@/registry/fujin/lib/utils"
import { Button } from "@/registry/fujin/ui/button"
import { Input } from "@/registry/fujin/ui/input"

export type DataTableFilterPickerProps = {
  def: FilterDef<never>
  value: FilterValue | undefined
  /** `undefined` clears the filter. Option lists apply on every toggle, as Shopify's do. */
  onChange: (next: FilterValue | undefined) => void
  /** The edit is finished: a single choice was made, or Enter / Apply. */
  onDone?: () => void
}

/** The editor for one filter's value; its UI depends on the filter type. */
function DataTableFilterPicker({
  def,
  value,
  onChange,
  onDone,
}: DataTableFilterPickerProps) {
  const shared = { value, onChange, onDone }
  switch (def.type) {
    case "enum":
      return <EnumPicker def={def} {...shared} />
    case "async":
      return <AsyncPicker def={def} {...shared} />
    case "text":
      return <TextPicker def={def} {...shared} />
    case "boolean":
      return <BooleanPicker def={def} {...shared} />
    case "number-range":
      return <RangePicker def={def} {...shared} />
    case "date-range":
      return <RangePicker def={def} {...shared} />
  }
}

type PickerProps<TDef> = {
  def: TDef
  value: FilterValue | undefined
  onChange: (next: FilterValue | undefined) => void
  onDone?: () => void
}

/* -------------------------------------------------------------------------- */
/* Option lists                                                               */
/* -------------------------------------------------------------------------- */

type ListOp = "in" | "not_in"

function listValues(value: FilterValue | undefined): string[] {
  return value && (value.op === "in" || value.op === "not_in")
    ? value.values
    : []
}

function listOp(value: FilterValue | undefined): ListOp | undefined {
  return value && (value.op === "in" || value.op === "not_in")
    ? value.op
    : undefined
}

type OptionListProps = PickerProps<
  EnumFilterDef<never> | AsyncFilterDef<never>
> & {
  options: readonly FilterOption[]
  /** Chosen values missing from `options` (async: another page, or the URL). */
  extraSelected?: readonly FilterOption[]
  /** Remote search: the caller filters. Otherwise the list filters itself. */
  search?: string
  onSearchChange?: (search: string) => void
  status?: "loading" | "error" | "ready"
}

/** Options whose label or description contains the search text. */
function matchOptions(
  options: readonly FilterOption[],
  search: string
): readonly FilterOption[] {
  const needle = search.trim().toLowerCase()
  if (!needle) return options
  return options.filter(
    (option) =>
      option.label.toLowerCase().includes(needle) ||
      option.description?.toLowerCase().includes(needle)
  )
}

/**
 * Checkboxes (or radios, for single choice) in a listbox with a search box
 * on top. Arrow keys move, Enter or Space toggles, and focus never leaves the
 * search box, so typing narrows the list at any time (once typing pauses).
 */
function OptionList({
  def,
  options,
  extraSelected = [],
  value,
  onChange,
  onDone,
  search: remoteSearch,
  onSearchChange,
  status = "ready",
}: OptionListProps) {
  const id = React.useId()
  const multiple = def.multiple !== false
  const selected = listValues(value)
  const [localOp, setLocalOp] = React.useState<ListOp>(listOp(value) ?? "in")
  const op = listOp(value) ?? localOp
  const remote = onSearchChange !== undefined
  const [localSearch, setLocalSearch] = React.useState("")
  const search = remote ? (remoteSearch ?? "") : localSearch
  const [highlight, setHighlight] = React.useState(0)
  // The list narrows once typing pauses (a remote search debounces itself).
  const settled = useDebouncedSearch(search)

  const all = React.useMemo(
    () => [
      ...extraSelected.filter(
        (option) => !options.some((o) => o.value === option.value)
      ),
      ...options,
    ],
    [extraSelected, options]
  )
  const listed = React.useMemo(
    () => (remote ? all : matchOptions(all, settled.value)),
    [all, remote, settled.value]
  )

  const active = Math.min(highlight, Math.max(listed.length - 1, 0))

  const toggle = (optionValue: string) => {
    if (!multiple) {
      onChange({ op, values: [optionValue] })
      onDone?.()
      return
    }
    const next = selected.includes(optionValue)
      ? selected.filter((v) => v !== optionValue)
      : [...selected, optionValue]
    onChange(next.length > 0 ? { op, values: next } : undefined)
  }

  const changeOp = (next: ListOp) => {
    setLocalOp(next)
    if (selected.length > 0) onChange({ op: next, values: selected })
  }

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    // Keys that act on the list first catch it up with what was typed.
    if (
      !remote &&
      settled.pending &&
      (event.key === "ArrowDown" ||
        event.key === "ArrowUp" ||
        event.key === "Enter")
    ) {
      settled.flush()
      const fresh = matchOptions(all, search)
      if (event.key === "Enter") {
        const option = fresh[0]
        if (!option) return
        event.preventDefault()
        toggle(option.value)
        return
      }
      event.preventDefault()
      setHighlight(
        event.key === "ArrowDown" ? 0 : Math.max(fresh.length - 1, 0)
      )
      return
    }
    if (event.key === "ArrowDown") {
      event.preventDefault()
      setHighlight((active + 1) % Math.max(listed.length, 1))
    } else if (event.key === "ArrowUp") {
      event.preventDefault()
      setHighlight((active - 1 + listed.length) % Math.max(listed.length, 1))
    } else if (event.key === "Enter" || (event.key === " " && search === "")) {
      const option = listed[active]
      if (!option) return
      event.preventDefault()
      toggle(option.value)
    }
  }

  const listboxId = `${id}-options`
  const optionId = (index: number) => `${id}-option-${index}`

  return (
    <div data-slot="data-table-filter-options" className="flex w-64 flex-col">
      {def.negatable ? (
        <div
          role="radiogroup"
          aria-label={`${def.label} condition`}
          className="flex gap-1 border-b p-1.5"
        >
          {(
            [
              ["in", "is"],
              ["not_in", "is not"],
            ] as const
          ).map(([operator, label]) => (
            <button
              key={operator}
              type="button"
              role="radio"
              aria-checked={op === operator}
              onClick={() => changeOp(operator)}
              className={cn(
                "h-7 flex-1 rounded-sm px-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring",
                op === operator
                  ? "bg-accent font-medium text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      ) : null}
      <div className="flex items-center gap-2 border-b px-2.5">
        <SearchIcon
          aria-hidden
          className="size-4 shrink-0 text-muted-foreground"
        />
        <input
          autoFocus
          role="combobox"
          aria-expanded
          aria-controls={listboxId}
          aria-autocomplete="list"
          aria-activedescendant={
            listed.length > 0 ? optionId(active) : undefined
          }
          aria-label={`Search ${def.label}`}
          placeholder={`Search ${def.label.toLowerCase()}`}
          value={search}
          onChange={(event) => {
            setHighlight(0)
            if (remote) onSearchChange(event.target.value)
            else setLocalSearch(event.target.value)
          }}
          onKeyDown={onKeyDown}
          autoComplete="off"
          className="h-9 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
      </div>
      <div
        id={listboxId}
        role="listbox"
        aria-label={def.label}
        aria-multiselectable={multiple || undefined}
        className="max-h-64 overflow-y-auto p-1"
      >
        {status === "loading" && listed.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Loading...
          </p>
        ) : status === "error" ? (
          <p role="alert" className="py-6 text-center text-sm text-destructive">
            Couldn&apos;t load {def.label.toLowerCase()}.
          </p>
        ) : listed.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No matches.
          </p>
        ) : (
          listed.map((option, index) => {
            const checked = selected.includes(option.value)
            return (
              // Combobox pattern: the input keeps focus and handles keys.
              <div
                key={option.value}
                id={optionId(index)}
                role="option"
                aria-selected={checked}
                data-highlighted={index === active || undefined}
                onMouseDown={(event) => event.preventDefault()}
                onMouseMove={() => setHighlight(index)}
                onClick={() => toggle(option.value)}
                className="flex min-h-8 cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm select-none data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground"
              >
                <span
                  aria-hidden
                  className={cn(
                    "flex size-4 shrink-0 items-center justify-center border",
                    multiple ? "rounded-[4px]" : "rounded-full",
                    checked
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-input bg-background"
                  )}
                >
                  {checked ? <CheckIcon className="size-3" /> : null}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate">{option.label}</span>
                  {option.description ? (
                    <span className="block truncate text-xs text-muted-foreground">
                      {option.description}
                    </span>
                  ) : null}
                </span>
                {option.count !== undefined ? (
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {option.count}
                  </span>
                ) : null}
              </div>
            )
          })
        )}
      </div>
      {selected.length > 0 ? (
        <div className="flex justify-end border-t p-1.5">
          <Button variant="ghost" size="sm" onClick={() => onChange(undefined)}>
            Clear
          </Button>
        </div>
      ) : null}
    </div>
  )
}

function EnumPicker(props: PickerProps<EnumFilterDef<never>>) {
  return <OptionList {...props} options={props.def.options} />
}

function AsyncPicker(props: PickerProps<AsyncFilterDef<never>>) {
  const [search, setSearch] = React.useState("")
  const { options, isLoading, isError } = useFilterOptions(props.def, search)
  const selectedValues = listValues(props.value)
  const resolved = useResolvedOptions(props.def, selectedValues)
  const extraSelected = selectedValues.map(
    (value) => resolved.get(value) ?? { value, label: value }
  )
  return (
    <OptionList
      {...props}
      options={options}
      extraSelected={extraSelected}
      search={search}
      onSearchChange={setSearch}
      status={isError ? "error" : isLoading ? "loading" : "ready"}
    />
  )
}

/* -------------------------------------------------------------------------- */
/* Text, boolean, ranges                                                      */
/* -------------------------------------------------------------------------- */

/** Clear and Apply. Apply submits the picker's form, so Enter in any field applies. */
function PickerFooter({
  canClear,
  onClear,
}: {
  canClear: boolean
  onClear: () => void
}) {
  return (
    <div className="flex justify-end gap-2">
      {canClear ? (
        <Button type="button" variant="ghost" size="sm" onClick={onClear}>
          Clear
        </Button>
      ) : null}
      <Button type="submit" size="sm">
        Apply
      </Button>
    </div>
  )
}

function TextPicker({
  def,
  value,
  onChange,
  onDone,
}: PickerProps<TextFilterDef<never>>) {
  const id = React.useId()
  const current = value?.op === "contains" ? value.value : ""
  const [text, setText] = React.useState(current)
  const apply = () => {
    const trimmed = text.trim()
    onChange(trimmed ? { op: "contains", value: trimmed } : undefined)
    onDone?.()
  }
  return (
    <form
      data-slot="data-table-filter-text"
      className="flex w-64 flex-col gap-2 p-2.5"
      onSubmit={(event) => {
        event.preventDefault()
        apply()
      }}
    >
      <label htmlFor={id} className="text-xs font-medium text-muted-foreground">
        {def.label} contains
      </label>
      <Input
        id={id}
        autoFocus
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder={def.placeholder}
      />
      <PickerFooter
        canClear={current !== ""}
        onClear={() => {
          setText("")
          onChange(undefined)
        }}
      />
    </form>
  )
}

function BooleanPicker({
  def,
  value,
  onChange,
  onDone,
}: PickerProps<BooleanFilterDef<never>>) {
  const current = value?.op === "eq" ? value.value : undefined
  const choices: Array<[boolean, string]> = [
    [true, def.trueLabel ?? "Yes"],
    [false, def.falseLabel ?? "No"],
  ]
  return (
    <div
      data-slot="data-table-filter-boolean"
      role="radiogroup"
      aria-label={def.label}
      className="flex w-56 flex-col p-1"
    >
      {choices.map(([choice, label], index) => (
        <button
          key={label}
          type="button"
          role="radio"
          aria-checked={current === choice}
          autoFocus={index === 0}
          onClick={() => {
            onChange({ op: "eq", value: choice })
            onDone?.()
          }}
          className="flex min-h-8 items-center gap-2 rounded-sm px-2 text-left text-sm outline-none hover:bg-accent focus-visible:bg-accent focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span
            aria-hidden
            className={cn(
              "flex size-4 shrink-0 items-center justify-center rounded-full border",
              current === choice
                ? "border-primary bg-primary text-primary-foreground"
                : "border-input bg-background"
            )}
          >
            {current === choice ? <CheckIcon className="size-3" /> : null}
          </span>
          {label}
        </button>
      ))}
      {current !== undefined ? (
        <div className="mt-1 flex justify-end border-t pt-1">
          <Button variant="ghost" size="sm" onClick={() => onChange(undefined)}>
            Clear
          </Button>
        </div>
      ) : null}
    </div>
  )
}

function RangePicker({
  def,
  value,
  onChange,
  onDone,
}: PickerProps<NumberRangeFilterDef<never> | DateRangeFilterDef<never>>) {
  const id = React.useId()
  const isDate = def.type === "date-range"
  const current = value?.op === "between" ? value : undefined
  const [min, setMin] = React.useState(current?.min ?? "")
  const [max, setMax] = React.useState(current?.max ?? "")
  // Resync when the value changes from outside (chip removed, typed qualifier).
  const [synced, setSynced] = React.useState(value)
  if (synced !== value) {
    setSynced(value)
    setMin(current?.min ?? "")
    setMax(current?.max ?? "")
  }

  const presets =
    def.type === "date-range"
      ? def.presets === false
        ? []
        : (def.presets ?? DEFAULT_DATE_PRESETS)
      : []

  const commit = (nextMin: string, nextMax: string) => {
    const a = nextMin.trim()
    const b = nextMax.trim()
    onChange(
      a || b
        ? { op: "between", ...(a ? { min: a } : {}), ...(b ? { max: b } : {}) }
        : undefined
    )
  }

  const inputProps =
    def.type === "number-range"
      ? {
          type: "number",
          inputMode: "decimal" as const,
          min: def.min,
          max: def.max,
          step: def.step ?? "any",
        }
      : { type: "date" }

  return (
    <form
      data-slot="data-table-filter-range"
      className="flex w-72 flex-col gap-3 p-2.5"
      onSubmit={(event) => {
        event.preventDefault()
        commit(min, max)
        onDone?.()
      }}
    >
      {presets.length > 0 ? (
        <div
          role="group"
          aria-label={`${def.label} presets`}
          className="flex flex-col"
        >
          {presets.map((preset) => {
            const range = preset.range()
            const on =
              (current?.min ?? "") === (range.from ?? "") &&
              (current?.max ?? "") === (range.to ?? "")
            return (
              <button
                key={preset.id}
                type="button"
                aria-pressed={on}
                onClick={() => {
                  setMin(range.from ?? "")
                  setMax(range.to ?? "")
                  commit(range.from ?? "", range.to ?? "")
                  onDone?.()
                }}
                className="flex min-h-8 items-center gap-2 rounded-sm px-2 text-left text-sm outline-none hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span
                  aria-hidden
                  className={cn(
                    "flex size-4 shrink-0 items-center justify-center rounded-full border",
                    on
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-input bg-background"
                  )}
                >
                  {on ? <CheckIcon className="size-3" /> : null}
                </span>
                {preset.label}
              </button>
            )
          })}
        </div>
      ) : null}
      <fieldset className="grid grid-cols-2 gap-2">
        <legend className="mb-1.5 text-xs font-medium text-muted-foreground">
          {presets.length > 0 ? "Custom range" : def.label}
        </legend>
        <div className="flex flex-col gap-1">
          <label
            htmlFor={`${id}-min`}
            className="text-xs text-muted-foreground"
          >
            {isDate ? "Starting" : "Min"}
          </label>
          <Input
            id={`${id}-min`}
            autoFocus={presets.length === 0}
            value={min}
            onChange={(event) => setMin(event.target.value)}
            placeholder={
              def.type === "number-range"
                ? (def.prefix ?? def.suffix)
                : undefined
            }
            {...inputProps}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label
            htmlFor={`${id}-max`}
            className="text-xs text-muted-foreground"
          >
            {isDate ? "Ending" : "Max"}
          </label>
          <Input
            id={`${id}-max`}
            value={max}
            onChange={(event) => setMax(event.target.value)}
            placeholder={
              def.type === "number-range"
                ? (def.prefix ?? def.suffix)
                : undefined
            }
            {...inputProps}
          />
        </div>
      </fieldset>
      <PickerFooter
        canClear={current !== undefined}
        onClear={() => {
          setMin("")
          setMax("")
          onChange(undefined)
        }}
      />
    </form>
  )
}

export { DataTableFilterPicker }
