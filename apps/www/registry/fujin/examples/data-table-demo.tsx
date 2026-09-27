"use client"

import { ArchiveIcon, TrashIcon } from "lucide-react"

import { DataTable } from "@/registry/fujin/components/data-table/data-table"
import { DataTableColumnHeader } from "@/registry/fujin/components/data-table/data-table-column-header"
import type {
  DataTableColumnDef,
  FilterOption,
} from "@/registry/fujin/lib/data-table/types"
import { useDataTable } from "@/registry/fujin/lib/data-table/use-data-table"
import { useDataTableSelection } from "@/registry/fujin/lib/data-table/use-data-table-selection"
import { Badge } from "@/registry/fujin/ui/badge"

type Invoice = {
  id: string
  title: string
  status: "paid" | "pending" | "overdue"
  customer: string
  amount: number
}

const invoices: Invoice[] = [
  {
    id: "INV-001",
    title: "Website redesign",
    status: "paid",
    customer: "Acme Co",
    amount: 2400,
  },
  {
    id: "INV-002",
    title: "Onboarding flow",
    status: "pending",
    customer: "Globex",
    amount: 1200,
  },
  {
    id: "INV-003",
    title: "Q3 security audit",
    status: "overdue",
    customer: "Initech",
    amount: 3600,
  },
  {
    id: "INV-004",
    title: "Brand refresh",
    status: "paid",
    customer: "Acme Co",
    amount: 900,
  },
  {
    id: "INV-005",
    title: "Support retainer",
    status: "pending",
    customer: "Umbrella Corp",
    amount: 500,
  },
]

const statusOptions: FilterOption[] = [
  { value: "paid", label: "Paid" },
  { value: "pending", label: "Pending" },
  { value: "overdue", label: "Overdue" },
]

const customerOptions: FilterOption[] = Array.from(
  new Set(invoices.map((invoice) => invoice.customer))
).map((customer) => ({ value: customer, label: customer }))

const statusVariant = {
  paid: "success",
  pending: "warning",
  overdue: "destructive",
} as const

async function getColumnOptions(columnId: string): Promise<FilterOption[]> {
  if (columnId === "status") return statusOptions
  if (columnId === "customer") return customerOptions
  return []
}

const columns: DataTableColumnDef<Invoice>[] = [
  {
    id: "title",
    accessorKey: "title",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Title" />
    ),
    meta: { label: "Title", filter: { type: "text" } },
  },
  {
    id: "customer",
    accessorKey: "customer",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Customer"
        getColumnOptions={getColumnOptions}
      />
    ),
    meta: {
      label: "Customer",
      filter: { type: "multi-select", getOptions: getColumnOptions },
    },
  },
  {
    id: "status",
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Status"
        getColumnOptions={getColumnOptions}
      />
    ),
    cell: ({ getValue }) => {
      const status = getValue() as Invoice["status"]
      return <Badge variant={statusVariant[status]}>{status}</Badge>
    },
    meta: {
      label: "Status",
      filter: { type: "multi-select", getOptions: getColumnOptions },
    },
  },
  {
    id: "amount",
    accessorKey: "amount",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Amount" />
    ),
    cell: ({ getValue }) => `$${(getValue() as number).toLocaleString()}`,
    meta: { label: "Amount" },
  },
]

export default function DataTableDemo() {
  const table = useDataTable({
    data: invoices,
    columns,
    mode: "client",
    getRowId: (row) => row.id,
  })
  const selection = useDataTableSelection({
    pageRowIds: table.getRowModel().rows.map((row) => row.id),
  })

  return (
    <DataTable
      table={table}
      selection={selection}
      bulkActions={[
        { label: "Archive", icon: <ArchiveIcon />, onAction: () => {} },
        {
          label: "Delete",
          icon: <TrashIcon />,
          variant: "destructive",
          onAction: () => {},
        },
      ]}
      emptyState={{ title: "No invoices match your filters" }}
    />
  )
}
