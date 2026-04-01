"use client"

import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { useCallback, useTransition } from "react"
import { Search, Filter, X } from "lucide-react"

const STATUSES = [
  { value: "",          label: "Todos os status" },
  { value: "PENDING",   label: "Pendente" },
  { value: "CONFIRMED", label: "Confirmada" },
  { value: "ACTIVE",    label: "Ativa" },
  { value: "COMPLETED", label: "Concluída" },
  { value: "CANCELLED", label: "Cancelada" },
]

export default function ReservationSearch({
  currentSearch,
  currentStatus,
}: {
  currentSearch: string
  currentStatus: string
}) {
  const router   = useRouter()
  const pathname = usePathname()
  const sp       = useSearchParams()
  const [, startTransition] = useTransition()

  const push = useCallback(
    (search: string, status: string) => {
      const params = new URLSearchParams(sp.toString())
      if (search)  params.set("q", search);  else params.delete("q")
      if (status)  params.set("status", status); else params.delete("status")
      startTransition(() => router.push(`${pathname}?${params.toString()}`))
    },
    [router, pathname, sp]
  )

  const hasFilters = currentSearch || currentStatus

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Search */}
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
        <input
          type="text"
          placeholder="Buscar por cliente ou CPF/CNPJ..."
          defaultValue={currentSearch}
          onChange={(e) => push(e.target.value, currentStatus)}
          className="pl-9 pr-4 py-2.5 bg-zinc-900 border border-zinc-700 text-white text-sm rounded-xl w-72 focus:outline-none focus:border-[#d4a017] placeholder-zinc-600 transition-colors"
        />
      </div>

      {/* Status filter */}
      <div className="relative">
        <Filter size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
        <select
          defaultValue={currentStatus}
          onChange={(e) => push(currentSearch, e.target.value)}
          className="pl-8 pr-8 py-2.5 bg-zinc-900 border border-zinc-700 text-white text-sm rounded-xl appearance-none focus:outline-none focus:border-[#d4a017] cursor-pointer transition-colors"
        >
          {STATUSES.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      {/* Clear filters */}
      {hasFilters && (
        <button
          onClick={() => push("", "")}
          className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white px-3 py-2 rounded-lg border border-zinc-700 hover:border-zinc-500 transition-colors"
        >
          <X size={12} /> Limpar filtros
        </button>
      )}
    </div>
  )
}
