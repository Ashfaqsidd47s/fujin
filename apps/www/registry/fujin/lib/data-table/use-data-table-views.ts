"use client"

import * as React from "react"

import { filterValuesEqual, normalizeFilterValues } from "./filter-codec"
import type { DataTableView, ListQuery, ListState } from "./types"
import { nonEmpty } from "./use-list-state"
import { usePersistedState } from "./use-persisted-state"

/** A view is active when the list shows exactly its query (sort only when the view sets one). */
export function isViewActive(view: DataTableView, list: ListQuery): boolean {
  if (nonEmpty(view.query.q) !== nonEmpty(list.q)) return false
  if (!filterValuesEqual(view.query.filters ?? {}, list.filters)) return false
  return view.query.sort === undefined || view.query.sort === list.sort
}

/** Only what a view restores: text, filters, and sort when one is set. */
function snapshot(query: ListQuery): ListQuery {
  const q = nonEmpty(query.q)
  const sort = nonEmpty(query.sort)
  return {
    ...(q ? { q } : {}),
    ...(sort ? { sort } : {}),
    filters: normalizeFilterValues(query.filters),
  }
}

function isViewList(value: unknown): value is DataTableView[] {
  return (
    Array.isArray(value) &&
    value.every(
      (view) =>
        typeof view === "object" &&
        view !== null &&
        typeof (view as DataTableView).id === "string" &&
        typeof (view as DataTableView).label === "string" &&
        typeof (view as DataTableView).query === "object"
    )
  )
}

function newViewId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? `view-${crypto.randomUUID()}`
    : `view-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`
}

const NO_VIEWS: DataTableView[] = []

export type UseDataTableViewsOptions = {
  list: ListState
  /** Built-in views; the first is the default ("All"). They cannot be renamed or deleted. */
  views?: readonly DataTableView[]
  /**
   * Saved views, controlled - for storing them on a server so they are shared
   * with the team, as Shopify does. Omit to keep them in this browser under
   * `storageKey`.
   */
  savedViews?: readonly DataTableView[]
  onSavedViewsChange?: (views: DataTableView[]) => void
  /** `localStorage` key for uncontrolled saved views. Without it (and without `savedViews`) views cannot be saved. */
  storageKey?: string
}

export function useDataTableViews({
  list,
  views = NO_VIEWS,
  savedViews: savedProp,
  onSavedViewsChange,
  storageKey,
}: UseDataTableViewsOptions) {
  const [stored, setStored] = usePersistedState<DataTableView[]>(
    savedProp ? undefined : storageKey,
    NO_VIEWS,
    isViewList
  )
  const saved = savedProp ?? stored
  const canPersist = savedProp !== undefined || storageKey !== undefined
  const writeSaved = React.useCallback(
    (next: DataTableView[]) => {
      if (!savedProp) setStored(next)
      onSavedViewsChange?.(next)
    },
    [onSavedViewsChange, savedProp, setStored]
  )

  const all = React.useMemo(() => [...views, ...saved], [saved, views])
  const active = all.find((view) => isViewActive(view, list))

  // As in Shopify, the selected view is the one picked (or the one the URL
  // matched on arrival). Filters added on top keep its name, and "Cancel"
  // returns to its query.
  const [selectedId, setSelectedId] = React.useState(
    () => active?.id ?? views[0]?.id
  )
  const selected = all.find((view) => view.id === selectedId) ?? views[0]
  const isSaved = (id: string | undefined) =>
    id !== undefined && saved.some((view) => view.id === id)
  const selectedIsSaved = isSaved(selected?.id)

  const baseQuery: ListQuery = selected
    ? { filters: {}, ...selected.query }
    : { filters: {} }
  const isModified =
    nonEmpty(list.q) !== nonEmpty(baseQuery.q) ||
    !filterValuesEqual(list.filters, baseQuery.filters) ||
    (baseQuery.sort !== undefined && baseQuery.sort !== list.sort)

  const current = (): ListQuery => ({
    q: list.q,
    sort: list.sort,
    filters: list.filters,
  })

  const select = (view: DataTableView) => {
    setSelectedId(view.id)
    list.update({
      q: view.query.q,
      filters: view.query.filters ?? {},
      ...(view.query.sort !== undefined ? { sort: view.query.sort } : {}),
    })
  }

  /** Back to the selected view's own query ("Cancel" / the clear button). */
  const revert = () => {
    list.update({
      q: baseQuery.q,
      filters: baseQuery.filters,
      ...(baseQuery.sort !== undefined ? { sort: baseQuery.sort } : {}),
    })
  }

  /** "Save as": a new view from the current query, which becomes selected. */
  const saveAs = (label: string) => {
    const view: DataTableView = {
      id: newViewId(),
      label: label.trim(),
      query: snapshot(current()),
    }
    writeSaved([...saved, view])
    setSelectedId(view.id)
    return view
  }

  /** "Save": write the current query into the selected saved view. */
  const saveSelected = () => {
    if (!selected || !selectedIsSaved) return
    writeSaved(
      saved.map((view) =>
        view.id === selected.id ? { ...view, query: snapshot(current()) } : view
      )
    )
  }

  const rename = (id: string, label: string) => {
    writeSaved(
      saved.map((view) =>
        view.id === id ? { ...view, label: label.trim() } : view
      )
    )
  }

  const duplicate = (id: string, label: string) => {
    const source = all.find((view) => view.id === id)
    if (!source) return undefined
    const view: DataTableView = {
      id: newViewId(),
      label: label.trim(),
      query: source.query,
    }
    writeSaved([...saved, view])
    return view
  }

  const remove = (id: string) => {
    writeSaved(saved.filter((view) => view.id !== id))
    if (id === selectedId && views[0]) select(views[0])
  }

  /** Whether `label` is free (view names are unique, case-insensitively). */
  const isLabelAvailable = (label: string, exceptId?: string) => {
    const wanted = label.trim().toLowerCase()
    return (
      wanted !== "" &&
      !all.some(
        (view) => view.id !== exceptId && view.label.toLowerCase() === wanted
      )
    )
  }

  return {
    enabled: views.length > 0,
    views,
    savedViews: saved,
    selected,
    activeId: active?.id,
    isSaved,
    selectedIsSaved,
    isModified,
    canSave: canPersist && views.length > 0,
    select,
    revert,
    saveAs,
    saveSelected,
    rename,
    duplicate,
    remove,
    isLabelAvailable,
  }
}

export type UseDataTableViewsResult = ReturnType<typeof useDataTableViews>
