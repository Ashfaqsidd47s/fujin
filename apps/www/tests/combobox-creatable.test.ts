import { act, renderHook } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import {
  isComboboxCreateItem,
  useComboboxCreatable,
  type UseComboboxCreatableOptions,
} from "@/registry/fujin/lib/combobox-creatable"

type Handler = (value: unknown, details: unknown) => void

const details = { reason: "none" }
const fruits = ["Apple", "Banana"]

function setup<Value>(options: UseComboboxCreatableOptions<Value>) {
  return renderHook(() => useComboboxCreatable(options))
}

function type(
  result: { current: ReturnType<typeof useComboboxCreatable> },
  text: string
) {
  act(() => {
    ;(result.current.rootProps.onInputValueChange as Handler)(text, details)
  })
}

function items(result: { current: ReturnType<typeof useComboboxCreatable> }) {
  return result.current.rootProps.items as unknown[]
}

function createItem(result: {
  current: ReturnType<typeof useComboboxCreatable>
}) {
  return items(result).find(isComboboxCreateItem)
}

function pick(
  result: { current: ReturnType<typeof useComboboxCreatable> },
  item: unknown
) {
  act(() => {
    ;(result.current.rootProps.onValueChange as Handler)(item, details)
  })
}

describe("useComboboxCreatable", () => {
  it("passes everything through when onCreate is not set", () => {
    const { result } = setup({ items: fruits })
    expect(result.current.enabled).toBe(false)
    expect(result.current.rootProps).toEqual({})
    expect(result.current.onInputKeyDown).toBeUndefined()
  })

  it("offers a create option for unmatched text", () => {
    const { result } = setup({ items: fruits, onCreate: vi.fn() })
    expect(createItem(result)).toBeUndefined()

    type(result, "  Kiwi ")
    const option = createItem(result)
    expect(option).toMatchObject({
      query: "Kiwi",
      label: 'Create "Kiwi"',
      pending: false,
    })
    expect(items(result)).toEqual([...fruits, option])
  })

  it("uses formatCreateLabel for the option label", () => {
    const { result } = setup({
      items: fruits,
      onCreate: vi.fn(),
      formatCreateLabel: (query) => `Add ${query}`,
    })
    type(result, "Kiwi")
    expect(createItem(result)?.label).toBe("Add Kiwi")
  })

  it("offers no create option for an exact, case-insensitive match", () => {
    const onCreate = vi.fn()
    const onValueChange = vi.fn()
    const { result } = setup({ items: fruits, onCreate, onValueChange })

    type(result, " apple ")
    expect(createItem(result)).toBeUndefined()

    // Enter with nothing highlighted selects the existing item instead.
    const preventDefault = vi.fn()
    act(() => {
      result.current.onInputKeyDown?.({
        key: "Enter",
        nativeEvent: new KeyboardEvent("keydown", { key: "Enter" }),
        preventDefault,
      } as never)
    })
    expect(preventDefault).toHaveBeenCalled()
    expect(onCreate).not.toHaveBeenCalled()
    expect(onValueChange).toHaveBeenCalledWith("Apple", expect.anything())
    expect(result.current.rootProps.value).toBe("Apple")
  })

  it("selects what a sync onCreate returns", () => {
    const onCreate = vi.fn((query: string) => query.toUpperCase())
    const { result } = setup({ items: fruits, onCreate })

    type(result, "Kiwi")
    pick(result, createItem(result))

    expect(onCreate).toHaveBeenCalledWith("Kiwi")
    expect(result.current.rootProps.value).toBe("KIWI")
    expect(result.current.rootProps.inputValue).toBe("KIWI")
  })

  it("shows a pending option while an async onCreate runs, then selects the result", async () => {
    let resolve!: (value: string) => void
    const onCreate = vi.fn(
      () => new Promise<string>((done) => (resolve = done))
    )
    const { result } = setup({ items: fruits, onCreate })

    type(result, "Kiwi")
    pick(result, createItem(result))

    expect(result.current.pendingQuery).toBe("Kiwi")
    expect(createItem(result)).toMatchObject({
      pending: true,
      label: 'Creating "Kiwi"...',
    })

    // Picking the pending option again does not create twice.
    pick(result, createItem(result))
    expect(onCreate).toHaveBeenCalledTimes(1)

    await act(async () => resolve("Kiwi"))

    expect(result.current.pendingQuery).toBeNull()
    expect(result.current.rootProps.value).toBe("Kiwi")
  })

  it("appends an async result to the selection in multiple mode", async () => {
    const onCreate = vi.fn(async (query: string) => query)
    const { result } = setup({
      items: fruits,
      multiple: true,
      defaultValue: ["Apple"],
      onCreate,
    })

    type(result, "Kiwi")
    const option = createItem(result)
    pick(result, ["Apple", option])
    // The input clears straight away so the next entry can be typed.
    expect(result.current.rootProps.inputValue).toBe("")

    await act(async () => {})

    expect(result.current.rootProps.value).toEqual(["Apple", "Kiwi"])
  })

  it("selects nothing and keeps the typed text when a sync onCreate cancels", () => {
    const onValueChange = vi.fn()
    const { result } = setup({
      items: fruits,
      onCreate: () => undefined,
      onValueChange,
    })

    type(result, "Kiwi")
    pick(result, createItem(result))

    expect(onValueChange).not.toHaveBeenCalled()
    expect(result.current.rootProps.value).toBeNull()
    expect(result.current.rootProps.inputValue).toBe("Kiwi")
  })

  it("selects nothing when an async onCreate resolves to undefined", async () => {
    const onValueChange = vi.fn()
    const { result } = setup({
      items: fruits,
      onCreate: async () => undefined,
      onValueChange,
    })

    type(result, "Kiwi")
    pick(result, createItem(result))
    await act(async () => {})

    expect(result.current.pendingQuery).toBeNull()
    expect(onValueChange).not.toHaveBeenCalled()
    expect(result.current.rootProps.value).toBeNull()
    expect(createItem(result)?.query).toBe("Kiwi")
  })
})
