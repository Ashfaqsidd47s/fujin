"use client"

import {
  ArchiveIcon,
  CopyIcon,
  DownloadIcon,
  PencilIcon,
  TrashIcon,
} from "lucide-react"

import { DataTable } from "@/registry/fujin/components/data-table/data-table"
import {
  downloadCsv,
  exportableRows,
  rowsToCsv,
} from "@/registry/fujin/lib/data-table/csv-export"
import type {
  DataTableColumnDef,
  DataTableView,
  FilterDef,
  FilterOption,
} from "@/registry/fujin/lib/data-table/types"
import { useDataTable } from "@/registry/fujin/lib/data-table/use-data-table"
import { uniqueOptions } from "@/registry/fujin/lib/data-table/use-filter-options"
import { Badge } from "@/registry/fujin/ui/badge"
import { Button } from "@/registry/fujin/ui/button"

type Product = {
  id: string
  title: string
  status: "active" | "draft" | "archived"
  vendor: string
  type: string
  inventory: number
  price: number
  giftCard: boolean
  tags: string[]
  createdAt: string
}

/* A deterministic catalog, so server and client render the same rows. */
const NAMES = [
  "Halo",
  "Aurora",
  "Summit",
  "Drift",
  "Ember",
  "Tide",
  "Nova",
  "Grove",
]
const KINDS = [
  ["Ring", "Jewelry"],
  ["Necklace", "Jewelry"],
  ["Hoodie", "Apparel"],
  ["Tee", "Apparel"],
  ["Mug", "Home"],
  ["Candle", "Home"],
  ["Gift card", "Gift cards"],
  ["Backpack", "Accessories"],
] as const
const VENDORS = ["Acme Co", "Globex", "Initech", "Umbrella", "Hooli"]
const STATUSES: Product["status"][] = ["active", "active", "draft", "archived"]
const TAGS = ["new", "sale", "bestseller", "limited", "eco", "gift"]

const products: Product[] = Array.from({ length: 64 }, (_, i) => {
  const [kind, type] = KINDS[i % KINDS.length]!
  const day = 1 + ((i * 7) % 28)
  const month = 1 + ((i * 5) % 9)
  return {
    id: `P-${String(1001 + i)}`,
    title: `${NAMES[(i * 3) % NAMES.length]} ${kind}${i >= 32 ? " II" : ""}`,
    status: STATUSES[(i * 5) % STATUSES.length]!,
    vendor: VENDORS[(i * 7) % VENDORS.length]!,
    type,
    inventory: type === "Gift cards" ? 0 : (i * 37) % 180,
    price: 12 + ((i * 53) % 240),
    giftCard: type === "Gift cards",
    tags: [TAGS[i % TAGS.length]!, TAGS[(i * 3 + 1) % TAGS.length]!],
    createdAt: `2026-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
  }
})

const statusBadge = {
  active: { label: "Active", variant: "success" },
  draft: { label: "Draft", variant: "info" },
  archived: { label: "Archived", variant: "secondary" },
} as const

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
})

/** Stands in for an API: tags are searched on the server as you type. */
async function searchTags(
  query: string,
  signal: AbortSignal
): Promise<FilterOption[]> {
  await new Promise((resolve) => setTimeout(resolve, 200))
  if (signal.aborted) return []
  return TAGS.filter((tag) => tag.includes(query.toLowerCase())).map((tag) => ({
    value: tag,
    label: tag,
  }))
}

const filters: FilterDef<Product>[] = [
  {
    key: "status",
    label: "Status",
    type: "enum",
    pinned: true,
    negatable: true,
    options: [
      { value: "active", label: "Active" },
      { value: "draft", label: "Draft" },
      { value: "archived", label: "Archived" },
    ],
  },
  {
    key: "vendor",
    label: "Vendor",
    type: "enum",
    pinned: true,
    negatable: true,
    options: uniqueOptions(products, (p) => p.vendor),
  },
  {
    key: "type",
    label: "Product type",
    type: "enum",
    aliases: ["product_type"],
    options: uniqueOptions(products, (p) => p.type),
  },
  {
    key: "tag",
    label: "Tagged with",
    type: "async",
    aliases: ["tags"],
    loadOptions: searchTags,
    getValue: (p) => p.tags,
  },
  { key: "price", label: "Price", type: "number-range", prefix: "$", min: 0 },
  { key: "inventory", label: "Inventory", type: "number-range", min: 0 },
  {
    key: "created",
    label: "Created",
    type: "date-range",
    getValue: (p) => p.createdAt,
  },
  {
    key: "giftCard",
    label: "Gift card",
    type: "boolean",
    getValue: (p) => p.giftCard,
  },
  { key: "title", label: "Title", type: "text" },
]

const columns: DataTableColumnDef<Product>[] = [
  {
    id: "title",
    accessorKey: "title",
    header: "Product",
    cell: ({ row }) => (
      <span className="font-medium">{row.original.title}</span>
    ),
    meta: { lockVisibility: true },
  },
  {
    id: "status",
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const badge = statusBadge[row.original.status]
      return <Badge variant={badge.variant}>{badge.label}</Badge>
    },
  },
  {
    id: "inventory",
    accessorKey: "inventory",
    header: "Inventory",
    cell: ({ row }) =>
      row.original.giftCard ? (
        <span className="text-muted-foreground">Not tracked</span>
      ) : (
        `${row.original.inventory} in stock`
      ),
    meta: { align: "end" },
  },
  {
    id: "price",
    accessorKey: "price",
    header: "Price",
    cell: ({ row }) => money.format(row.original.price),
    meta: { align: "end" },
  },
  { id: "type", accessorKey: "type", header: "Type" },
  { id: "vendor", accessorKey: "vendor", header: "Vendor" },
  {
    id: "created",
    accessorKey: "createdAt",
    header: "Created",
    meta: { searchable: false },
  },
]

const views: DataTableView[] = [
  { id: "all", label: "All", query: {} },
  {
    id: "active",
    label: "Active",
    query: { filters: { status: { op: "in", values: ["active"] } } },
  },
  {
    id: "draft",
    label: "Draft",
    query: { filters: { status: { op: "in", values: ["draft"] } } },
  },
  {
    id: "archived",
    label: "Archived",
    query: { filters: { status: { op: "in", values: ["archived"] } } },
  },
]

export default function DataTableDemo() {
  const table = useDataTable({
    data: products,
    columns,
    filters,
    getRowId: (row) => row.id,
    defaultPageSize: 10,
    tableId: "fujin-docs-products",
  })

  return (
    <DataTable
      table={table}
      views={views}
      search={{ placeholder: "Search products or type status:active" }}
      resourceName={{ singular: "product", plural: "products" }}
      getRowLabel={(row) => row.title}
      className="w-full"
      toolbarActions={
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            downloadCsv(
              rowsToCsv(table.core, exportableRows(table)),
              "products.csv"
            )
          }
        >
          <DownloadIcon aria-hidden />
          Export
        </Button>
      }
      bulkActions={[
        {
          id: "activate",
          label: "Set as active",
          promoted: true,
          onAction: () => {},
        },
        {
          id: "draft",
          label: "Set as draft",
          promoted: true,
          onAction: () => {},
        },
        {
          id: "archive",
          label: "Archive products",
          icon: <ArchiveIcon aria-hidden />,
          supportsAllMatching: true,
          onAction: () => {},
        },
        {
          id: "delete",
          label: "Delete products",
          icon: <TrashIcon aria-hidden />,
          variant: "destructive",
          onAction: () => {},
        },
      ]}
      rowActions={[
        {
          id: "edit",
          label: "Edit",
          icon: <PencilIcon aria-hidden />,
          onAction: () => {},
        },
        {
          id: "duplicate",
          label: "Duplicate",
          icon: <CopyIcon aria-hidden />,
          onAction: () => {},
        },
        {
          id: "delete",
          label: "Delete",
          icon: <TrashIcon aria-hidden />,
          variant: "destructive",
          separatorBefore: true,
          onAction: () => {},
        },
      ]}
    />
  )
}
