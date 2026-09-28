"use client"

import * as React from "react"
import {
  ChevronsUpDownIcon,
  CopyIcon,
  PencilIcon,
  TrashIcon,
} from "lucide-react"

import type { DataTableView } from "@/registry/fujin/lib/data-table/types"
import type { UseDataTableViewsResult } from "@/registry/fujin/lib/data-table/use-data-table-views"
import { Button } from "@/registry/fujin/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/registry/fujin/ui/dropdown-menu"
import { Input } from "@/registry/fujin/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTitle,
} from "@/registry/fujin/ui/popover"

/** Shopify's limit on view names. */
const MAX_VIEW_NAME = 40

export type DataTableViewNameFormProps = {
  title: string
  submitLabel: string
  initialName?: string
  isAvailable: (name: string) => boolean
  onSubmit: (name: string) => void
  onCancel: () => void
}

/** Name a view: trimmed, at most 40 characters, unique case-insensitively. */
function DataTableViewNameForm({
  title,
  submitLabel,
  initialName = "",
  isAvailable,
  onSubmit,
  onCancel,
}: DataTableViewNameFormProps) {
  const id = React.useId()
  const [name, setName] = React.useState(initialName)
  const [touched, setTouched] = React.useState(false)
  const trimmed = name.trim()
  const unchanged = trimmed === initialName.trim() && initialName !== ""
  const error =
    trimmed === ""
      ? "Enter a name."
      : !unchanged && !isAvailable(trimmed)
        ? "A view with this name already exists. Choose a different name."
        : null

  return (
    <form
      data-slot="data-table-view-name-form"
      className="flex flex-col gap-3"
      onSubmit={(event) => {
        event.preventDefault()
        setTouched(true)
        if (error) return
        if (!unchanged) onSubmit(trimmed)
        else onCancel()
      }}
    >
      <PopoverTitle>{title}</PopoverTitle>
      <div className="flex flex-col gap-1.5">
        <label htmlFor={id} className="text-sm font-medium">
          Name
        </label>
        <Input
          id={id}
          autoFocus
          value={name}
          maxLength={MAX_VIEW_NAME}
          aria-invalid={touched && error ? true : undefined}
          aria-describedby={touched && error ? `${id}-error` : `${id}-count`}
          onChange={(event) => setName(event.target.value)}
        />
        {touched && error ? (
          <p id={`${id}-error`} className="text-sm text-destructive">
            {error}
          </p>
        ) : (
          <p id={`${id}-count`} className="text-xs text-muted-foreground">
            {name.length}/{MAX_VIEW_NAME}
          </p>
        )}
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" size="sm">
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}

type Dialog = "rename" | "duplicate" | "delete" | null

export type DataTableViewMenuProps = {
  views: UseDataTableViewsResult
}

/**
 * The view switcher at the start of the search bar ("All ⇅"), as in the
 * Shopify admin. Built-in views are listed first, saved ones after; a saved
 * view can be renamed, duplicated or deleted from the same menu.
 */
function DataTableViewMenu({ views }: DataTableViewMenuProps) {
  const triggerRef = React.useRef<HTMLButtonElement>(null)
  const [dialog, setDialog] = React.useState<Dialog>(null)
  const selected = views.selected
  if (!selected) return null

  const all = [...views.views, ...views.savedViews]
  const select = (id: string) => {
    const view = all.find((v) => v.id === id)
    if (view) views.select(view)
  }
  const canManage = views.selectedIsSaved
  const close = () => setDialog(null)

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          ref={triggerRef}
          render={
            <Button
              variant="ghost"
              size="sm"
              className="h-7 shrink-0 gap-1 px-2 font-medium"
              aria-label={`View: ${selected.label}${views.isModified ? " (edited)" : ""}. Change view`}
            />
          }
        >
          <span className="max-w-40 truncate">{selected.label}</span>
          {views.isModified ? (
            <span
              aria-hidden
              title="Unsaved changes"
              className="size-1.5 shrink-0 rounded-full bg-primary"
            />
          ) : null}
          <ChevronsUpDownIcon
            className="size-3.5 text-muted-foreground"
            aria-hidden
          />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="max-w-72 min-w-52">
          <DropdownMenuGroup>
            <DropdownMenuLabel>Views</DropdownMenuLabel>
            <DropdownMenuRadioGroup
              value={views.activeId ?? ""}
              onValueChange={(id) => select(String(id))}
            >
              {views.views.map((view) => (
                <ViewItem key={view.id} view={view} />
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuGroup>
          {views.savedViews.length > 0 ? (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuLabel>Saved views</DropdownMenuLabel>
                <DropdownMenuRadioGroup
                  value={views.activeId ?? ""}
                  onValueChange={(id) => select(String(id))}
                >
                  {views.savedViews.map((view) => (
                    <ViewItem key={view.id} view={view} />
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuGroup>
            </>
          ) : null}
          {canManage ? (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setDialog("rename")}>
                <PencilIcon aria-hidden />
                Rename view
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setDialog("duplicate")}>
                <CopyIcon aria-hidden />
                Duplicate view
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onClick={() => setDialog("delete")}
              >
                <TrashIcon aria-hidden />
                Delete view
              </DropdownMenuItem>
            </>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>
      <Popover
        open={dialog !== null}
        onOpenChange={(open) => {
          if (!open) close()
        }}
      >
        <PopoverContent
          anchor={triggerRef}
          align="start"
          className="w-80"
          finalFocus={triggerRef}
        >
          {dialog === "rename" ? (
            <DataTableViewNameForm
              title="Rename view"
              submitLabel="Save"
              initialName={selected.label}
              isAvailable={(name) => views.isLabelAvailable(name, selected.id)}
              onSubmit={(name) => {
                views.rename(selected.id, name)
                close()
              }}
              onCancel={close}
            />
          ) : dialog === "duplicate" ? (
            <DataTableViewNameForm
              title="Duplicate view"
              submitLabel="Create view"
              initialName={`Copy of ${selected.label}`.slice(0, MAX_VIEW_NAME)}
              isAvailable={(name) => views.isLabelAvailable(name)}
              onSubmit={(name) => {
                const copy = views.duplicate(selected.id, name)
                if (copy) views.select(copy)
                close()
              }}
              onCancel={close}
            />
          ) : dialog === "delete" ? (
            <div className="flex flex-col gap-3">
              <PopoverTitle>Delete view?</PopoverTitle>
              <p className="text-sm text-muted-foreground">
                This can&apos;t be undone. The {selected.label} view will no
                longer be available.
              </p>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" size="sm" onClick={close}>
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  autoFocus
                  onClick={() => {
                    views.remove(selected.id)
                    close()
                  }}
                >
                  Delete view
                </Button>
              </div>
            </div>
          ) : null}
        </PopoverContent>
      </Popover>
    </>
  )
}

function ViewItem({ view }: { view: DataTableView }) {
  return (
    <DropdownMenuRadioItem value={view.id} closeOnClick>
      <span className="flex-1 truncate">{view.label}</span>
    </DropdownMenuRadioItem>
  )
}

export { DataTableViewMenu, DataTableViewNameForm, MAX_VIEW_NAME }
