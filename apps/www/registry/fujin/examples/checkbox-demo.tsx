"use client"

import * as React from "react"

import { Checkbox } from "@/registry/fujin/ui/checkbox"

export default function CheckboxDemo() {
  const [rows, setRows] = React.useState([
    { id: 1, label: "Invoice #1", checked: true },
    { id: 2, label: "Invoice #2", checked: false },
    { id: 3, label: "Invoice #3", checked: false },
  ])

  const allChecked = rows.every((row) => row.checked)
  const someChecked = rows.some((row) => row.checked)

  return (
    <div className="flex flex-col gap-3">
      <label className="flex items-center gap-2 text-sm font-medium">
        <Checkbox
          checked={allChecked}
          indeterminate={someChecked && !allChecked}
          onCheckedChange={(checked) =>
            setRows(rows.map((row) => ({ ...row, checked })))
          }
        />
        Select all
      </label>
      <div className="flex flex-col gap-2 border-t pt-3">
        {rows.map((row) => (
          <label key={row.id} className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={row.checked}
              onCheckedChange={(checked) =>
                setRows(
                  rows.map((r) => (r.id === row.id ? { ...r, checked } : r))
                )
              }
            />
            {row.label}
          </label>
        ))}
      </div>
    </div>
  )
}
