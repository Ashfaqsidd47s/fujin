"use client"

import type * as React from "react"
import {
  Toast as ToastPrimitive,
  type ToastManager,
  type ToastManagerEvent,
  type ToastManagerUpdateOptions,
} from "@base-ui/react/toast"
import {
  CircleCheckIcon,
  CircleXIcon,
  InfoIcon,
  TriangleAlertIcon,
  XIcon,
} from "lucide-react"

import { cn } from "@/registry/fujin/lib/utils"
import { Button } from "@/registry/fujin/ui/button"
import { Spinner } from "@/registry/fujin/ui/spinner"

/*
 * Base UI's Toast behind a sonner-shaped API: mount <Toaster /> once, then
 * call `toast.success("Saved")` from anywhere - event handlers, effects, or
 * plain modules outside React.
 *
 * What Base UI handles: the viewport is a labelled landmark (`role="region"`,
 * "Notifications") that is also a polite live region; `priority: "high"`
 * toasts are announced through an assertive `role="alert"`. Hovering or
 * focusing the stack pauses every timer, F6 jumps into the stack, and toasts
 * can be swiped away - but every toast also has a close button, so swiping
 * is never the only way to dismiss one.
 */

// ---------------------------------------------------------------------------
// Manager
// ---------------------------------------------------------------------------

type Listener = (event: ToastManagerEvent) => void

const baseManager = ToastPrimitive.createToastManager()
const toasters: Listener[] = []
// Toasts fired before any <Toaster /> has subscribed - e.g. from a page's
// mount effect, which runs before the layout's Toaster effect.
const pending: ToastManagerEvent[] = []

baseManager[" subscribe"]((event) => {
  const active = toasters[0]
  if (active) {
    active(event)
    return
  }
  // Module state is shared between requests on the server: never queue there.
  if (typeof window === "undefined") return
  if (event.action === "promise") {
    // The handled promise is created later, when a Toaster picks this up.
    // Nobody awaits that copy, so keep its rejection from going unhandled.
    const setPromise = event.options.setPromise as (p: Promise<unknown>) => void
    event.options.setPromise = (promise: Promise<unknown>) => {
      promise.catch(() => {})
      setPromise(promise)
    }
  }
  pending.push(event)
})

/**
 * Only the first mounted <Toaster /> receives toasts, so a second one (say, in
 * a nested layout) cannot render every toast twice.
 */
const toastManager: ToastManager = {
  ...baseManager,
  " subscribe"(listener) {
    toasters.push(listener)
    if (toasters.length > 1 && process.env.NODE_ENV !== "production") {
      console.warn(
        "[fujin] More than one <Toaster /> is mounted. Only the first one shows toasts - render it once, in the root layout."
      )
    }
    if (toasters[0] === listener) {
      pending.splice(0).forEach(listener)
    }
    return () => {
      const index = toasters.indexOf(listener)
      if (index !== -1) toasters.splice(index, 1)
    }
  },
}

// ---------------------------------------------------------------------------
// Imperative API
// ---------------------------------------------------------------------------

type ToastType =
  "default" | "success" | "error" | "warning" | "info" | "loading"

type ToastAction = {
  label: React.ReactNode
  /** Closes the toast afterwards unless you call `event.preventDefault()`. */
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void
}

type ToastOptions = {
  /** Reuse an id to update a toast in place instead of stacking a new one. */
  id?: string
  description?: React.ReactNode
  /** Milliseconds before auto-dismiss. `0` keeps it open. Default 5000, or 10000 with an `action`. */
  timeout?: number
  /** `"high"` announces assertively. Defaults to `"high"` for `toast.error`. */
  priority?: "low" | "high"
  action?: ToastAction
  onClose?: () => void
  onRemove?: () => void
}

type ToastContent = ToastOptions & {
  title?: React.ReactNode
  type?: ToastType
}

/** A title string, or the full set of options. */
type ToastMessage = string | Omit<ToastContent, "type" | "id">

type ToastPromiseOptions<T> = {
  id?: string
  loading: ToastMessage
  success: ToastMessage | ((value: T) => ToastMessage)
  error: ToastMessage | ((error: unknown) => ToastMessage)
}

// Long enough to read the message and reach the button (WCAG 2.2.1).
const ACTION_TIMEOUT = 10_000

let count = 0
function nextId() {
  count += 1
  return `fujin-toast-${count}`
}

function resolve(
  { action, ...content }: ToastContent,
  id: string
): ToastManagerUpdateOptions<object> {
  if (!action) return content
  return {
    ...content,
    timeout: content.timeout ?? ACTION_TIMEOUT,
    actionProps: {
      children: action.label,
      onClick(event) {
        action.onClick(event)
        if (!event.defaultPrevented) toastManager.close(id)
      },
    },
  }
}

function toMessage(message: ToastMessage): ToastContent {
  return typeof message === "string" ? { title: message } : message
}

function show(
  type: ToastType,
  title: React.ReactNode,
  options: ToastOptions = {}
) {
  const id = options.id ?? nextId()
  toastManager.add({ ...resolve({ ...options, title, type }, id), id })
  return id
}

function promise<T>(
  input: Promise<T> | (() => Promise<T>),
  { id = nextId(), loading, success, error }: ToastPromiseOptions<T>
): Promise<T> {
  // Base UI adds the loading toast with this id, so actions can close it.
  const loadingOptions = Object.assign(resolve(toMessage(loading), id), { id })
  const result = toastManager.promise(
    typeof input === "function" ? input() : input,
    {
      loading: loadingOptions,
      success: (value: T) =>
        resolve(
          toMessage(typeof success === "function" ? success(value) : success),
          id
        ),
      error: (reason: unknown) =>
        resolve(
          {
            priority: "high",
            ...toMessage(typeof error === "function" ? error(reason) : error),
          },
          id
        ),
    }
  )
  // The toast already reports the failure; awaiting callers still see it.
  result.catch(() => {})
  return result
}

const toast = Object.assign(
  (title: React.ReactNode, options?: ToastOptions) =>
    show("default", title, options),
  {
    success: (title: React.ReactNode, options?: ToastOptions) =>
      show("success", title, options),
    error: (title: React.ReactNode, options?: ToastOptions) =>
      show("error", title, { priority: "high", ...options }),
    warning: (title: React.ReactNode, options?: ToastOptions) =>
      show("warning", title, options),
    info: (title: React.ReactNode, options?: ToastOptions) =>
      show("info", title, options),
    /** Stays open until updated or dismissed. */
    loading: (title: React.ReactNode, options?: ToastOptions) =>
      show("loading", title, options),
    promise,
    update: (id: string, content: Omit<ToastContent, "id">) =>
      toastManager.update(id, resolve(content, id)),
    /** Closes one toast, or all of them when called without an id. */
    dismiss: (id?: string) => toastManager.close(id),
  }
)

// ---------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------

type ToasterPosition =
  | "top-left"
  | "top-center"
  | "top-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right"

type ToasterProps = Omit<
  ToastPrimitive.Provider.Props,
  "toastManager" | "children"
> & {
  position?: ToasterPosition
  /** Applied to the viewport. */
  className?: string
}

const positionClassNames: Record<ToasterPosition, string> = {
  "top-left": "top-4 left-4 sm:top-6 sm:left-6",
  "top-center": "inset-x-0 top-4 mx-auto sm:top-6",
  "top-right": "top-4 right-4 sm:top-6 sm:right-6",
  "bottom-left": "bottom-4 left-4 sm:bottom-6 sm:left-6",
  "bottom-center": "inset-x-0 bottom-4 mx-auto sm:bottom-6",
  "bottom-right": "right-4 bottom-4 sm:right-6 sm:bottom-6",
}

/** Render once, in the root layout. Toasts added with `toast()` show here. */
function Toaster({
  position = "bottom-right",
  className,
  ...props
}: ToasterProps) {
  const top = position.startsWith("top")

  return (
    <ToastPrimitive.Provider toastManager={toastManager} {...props}>
      <ToastPrimitive.Portal>
        <ToastPrimitive.Viewport
          data-slot="toaster"
          data-position={position}
          // +1 stacks toasts downwards from the top, -1 upwards from the bottom.
          style={{ "--toast-sign": top ? 1 : -1 } as React.CSSProperties}
          className={cn(
            "fixed z-[100] w-[calc(100%-2rem)] outline-none sm:w-[22.5rem]",
            positionClassNames[position],
            className
          )}
        >
          <ToastList position={position} />
        </ToastPrimitive.Viewport>
      </ToastPrimitive.Portal>
    </ToastPrimitive.Provider>
  )
}

/*
 * Stacking and swipe styles follow Base UI's reference implementation, with
 * the vertical direction folded into `--toast-sign` so one class list serves
 * both top and bottom positions.
 */
const toastRootClassName = [
  "[--gap:0.75rem] [--peek:0.75rem] [--scale:calc(max(0,1-(var(--toast-index)*0.1)))] [--shrink:calc(1-var(--scale))] [--height:var(--toast-frontmost-height,var(--toast-height))]",
  "[--offset-y:calc(var(--toast-sign)*(var(--toast-offset-y)+var(--toast-index)*var(--gap))+var(--toast-swipe-movement-y))]",
  "absolute inset-x-0 z-[calc(1000-var(--toast-index))] h-(--height) w-full rounded-lg border bg-popover text-popover-foreground shadow-lg outline-none select-none focus-visible:ring-2 focus-visible:ring-ring",
  "[transform:translateX(var(--toast-swipe-movement-x))_translateY(calc(var(--toast-swipe-movement-y)+var(--toast-sign)*(var(--toast-index)*var(--peek)+var(--shrink)*var(--height))))_scale(var(--scale))]",
  "[transition:transform_0.5s_cubic-bezier(0.22,1,0.36,1),opacity_0.5s,height_0.15s] motion-reduce:[transition:opacity_0.2s]",
  "data-[expanded]:h-(--toast-height) data-[expanded]:[transform:translateX(var(--toast-swipe-movement-x))_translateY(var(--offset-y))]",
  "data-[ending-style]:opacity-0 data-[limited]:opacity-0",
  "data-[starting-style]:[transform:translateY(calc(var(--toast-sign)*-150%))]",
  "[&[data-ending-style]:not([data-limited]):not([data-swipe-direction])]:[transform:translateY(calc(var(--toast-sign)*-150%))]",
  "data-[ending-style]:data-[swipe-direction=down]:[transform:translateY(calc(var(--toast-swipe-movement-y)+150%))] data-[expanded]:data-[ending-style]:data-[swipe-direction=down]:[transform:translateY(calc(var(--toast-swipe-movement-y)+150%))]",
  "data-[ending-style]:data-[swipe-direction=up]:[transform:translateY(calc(var(--toast-swipe-movement-y)-150%))] data-[expanded]:data-[ending-style]:data-[swipe-direction=up]:[transform:translateY(calc(var(--toast-swipe-movement-y)-150%))]",
  "data-[ending-style]:data-[swipe-direction=left]:[transform:translateX(calc(var(--toast-swipe-movement-x)-150%))_translateY(var(--offset-y))] data-[expanded]:data-[ending-style]:data-[swipe-direction=left]:[transform:translateX(calc(var(--toast-swipe-movement-x)-150%))_translateY(var(--offset-y))]",
  "data-[ending-style]:data-[swipe-direction=right]:[transform:translateX(calc(var(--toast-swipe-movement-x)+150%))_translateY(var(--offset-y))] data-[expanded]:data-[ending-style]:data-[swipe-direction=right]:[transform:translateX(calc(var(--toast-swipe-movement-x)+150%))_translateY(var(--offset-y))]",
  // Bridges the gap between expanded toasts so the stack stays hovered.
  "after:absolute after:left-0 after:h-[calc(var(--gap)+1px)] after:w-full after:content-['']",
].join(" ")

const toastIcons: Partial<Record<string, React.ReactNode>> = {
  success: <CircleCheckIcon aria-hidden className="text-success" />,
  error: <CircleXIcon aria-hidden className="text-destructive" />,
  warning: <TriangleAlertIcon aria-hidden className="text-warning" />,
  info: <InfoIcon aria-hidden className="text-info" />,
  loading: <Spinner label={null} />,
}

function ToastList({ position }: { position: ToasterPosition }) {
  const { toasts } = ToastPrimitive.useToastManager()
  const [vertical, horizontal] = position.split("-") as [
    "top" | "bottom",
    "left" | "center" | "right",
  ]
  const swipeDirection: ToastPrimitive.Root.Props["swipeDirection"] =
    horizontal === "center"
      ? vertical === "top"
        ? "up"
        : "down"
      : [vertical === "top" ? "up" : "down", horizontal]

  return toasts.map((item) => {
    const icon = item.type ? toastIcons[item.type] : undefined

    return (
      <ToastPrimitive.Root
        key={item.id}
        toast={item}
        swipeDirection={swipeDirection}
        data-slot="toast"
        className={cn(
          toastRootClassName,
          vertical === "top"
            ? "top-0 origin-top after:bottom-full"
            : "bottom-0 origin-bottom after:top-full"
        )}
      >
        <ToastPrimitive.Content
          data-slot="toast-content"
          className="flex items-start gap-3 overflow-hidden p-4 transition-opacity duration-250 data-[behind]:opacity-0 data-[expanded]:opacity-100"
        >
          {icon ? (
            <span
              data-slot="toast-icon"
              className="flex h-5 shrink-0 items-center [&_svg:not([class*='size-'])]:size-4"
            >
              {icon}
            </span>
          ) : null}
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <ToastPrimitive.Title
              data-slot="toast-title"
              className="text-sm leading-5 font-medium"
            />
            <ToastPrimitive.Description
              data-slot="toast-description"
              className="text-sm text-muted-foreground"
            />
          </div>
          <ToastPrimitive.Action
            data-slot="toast-action"
            render={<Button size="xs" variant="outline" className="mt-0.5" />}
          />
          <ToastPrimitive.Close
            data-slot="toast-close"
            aria-label="Close"
            render={
              <Button
                size="icon-xs"
                variant="ghost"
                className="-mr-1 text-muted-foreground"
              />
            }
          >
            <XIcon aria-hidden />
          </ToastPrimitive.Close>
        </ToastPrimitive.Content>
      </ToastPrimitive.Root>
    )
  })
}

export {
  Toaster,
  toast,
  type ToasterProps,
  type ToasterPosition,
  type ToastType,
  type ToastOptions,
  type ToastAction,
  type ToastContent,
  type ToastMessage,
  type ToastPromiseOptions,
}
