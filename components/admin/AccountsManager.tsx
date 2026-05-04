"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Pencil,
  Trash2,
  X,
  CheckCircle,
  RotateCcw,
  Ban,
  TrendingUp,
  TrendingDown,
  Filter,
} from "lucide-react"
import type { AccountEntry } from "@prisma/client"
import {
  markAsPaid,
  markAsPending,
  cancelAccount,
  deleteAccount,
} from "@/app/actions/accounts.actions"
import { formatCurrency } from "@/lib/utils"
import AccountForm from "./AccountForm"

const statusConfig: Record<string, { label: string; cls: string }> = {
  PENDING:   { label: "Pendente",  cls: "text-amber-400 bg-amber-400/10 border-amber-400/20" },
  PAID:      { label: "Pago",      cls: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" },
  OVERDUE:   { label: "Vencido",   cls: "text-red-400 bg-red-400/10 border-red-400/20" },
  CANCELLED: { label: "Cancelado", cls: "text-zinc-500 bg-zinc-500/10 border-zinc-500/20" },
}

interface Props {
  accounts: AccountEntry[]
}

export default function AccountsManager({ accounts }: Props) {
  const router = useRouter()
  const [editing, setEditing] = useState<AccountEntry | null>(null)
  const [filterType, setFilterType] = useState<"ALL" | "PAYABLE" | "RECEIVABLE">("ALL")
  const [filterStatus, setFilterStatus] = useState<"ALL" | "PENDING" | "PAID" | "OVERDUE" | "CANCELLED">("ALL")
  const [busy, setBusy] = useState<string | null>(null)

  const filtered = accounts.filter((a) => {
    if (filterType !== "ALL" && a.type !== filterType) return false
    if (filterStatus !== "ALL" && a.status !== filterStatus) return false
    return true
  })

  async function run(id: string, action: (id: string) => Promise<void>) {
    setBusy(id)
    await action(id)
    setBusy(null)
    router.refresh()
  }

  async function handleDelete(id: string) {
    if (!confirm("Excluir este lançamento permanentemente?")) return
    await run(id, deleteAccount)
  }

  function formatDate(d: Date | string) {
    return new Date(d).toLocaleDateString("pt-BR")
  }

  return (
    <>
      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-lg">
            <button
              onClick={() => setEditing(null)}
              className="absolute -top-3 -right-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 rounded-full p-1.5 transition-colors z-10"
            >
              <X className="w-4 h-4" />
            </button>
            <AccountForm account={editing} onSuccess={() => setEditing(null)} />
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-wrap gap-3 items-center">
        <Filter className="w-4 h-4 text-zinc-500 flex-shrink-0" />

        <div className="flex gap-1">
          {(["ALL", "PAYABLE", "RECEIVABLE"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filterType === t
                  ? "bg-[#d4a017] text-black"
                  : "text-zinc-400 hover:text-white bg-zinc-800"
              }`}
            >
              {t === "ALL" ? "Todos" : t === "PAYABLE" ? "A Pagar" : "A Receber"}
            </button>
          ))}
        </div>

        <div className="w-px h-5 bg-zinc-700" />

        <div className="flex gap-1 flex-wrap">
          {(["ALL", "PENDING", "PAID", "OVERDUE", "CANCELLED"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filterStatus === s
                  ? "bg-[#d4a017] text-black"
                  : "text-zinc-400 hover:text-white bg-zinc-800"
              }`}
            >
              {s === "ALL"
                ? "Todos status"
                : statusConfig[s]?.label ?? s}
            </button>
          ))}
        </div>

        <span className="ml-auto text-zinc-500 text-xs">
          {filtered.length} registro{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-950/50 border-b border-zinc-800 text-zinc-400 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-medium">Tipo</th>
                <th className="px-6 py-4 font-medium">Descrição / Categoria</th>
                <th className="px-6 py-4 font-medium">Vencimento</th>
                <th className="px-6 py-4 font-medium">Valor</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {filtered.map((account) => {
                const st = statusConfig[account.status] ?? statusConfig.PENDING
                const isPayable = account.type === "PAYABLE"
                const isBusy = busy === account.id

                return (
                  <tr key={account.id} className="hover:bg-zinc-800/30 transition-colors">
                    {/* Tipo */}
                    <td className="px-6 py-4">
                      <div className={`flex items-center gap-1.5 text-xs font-semibold ${isPayable ? "text-red-400" : "text-emerald-400"}`}>
                        {isPayable
                          ? <TrendingDown className="w-3.5 h-3.5" />
                          : <TrendingUp className="w-3.5 h-3.5" />}
                        {isPayable ? "A Pagar" : "A Receber"}
                      </div>
                    </td>

                    {/* Descrição */}
                    <td className="px-6 py-4">
                      <p className="text-white text-sm font-medium truncate max-w-[220px]">
                        {account.description}
                      </p>
                      <p className="text-zinc-500 text-xs mt-0.5">{account.category}</p>
                    </td>

                    {/* Vencimento */}
                    <td className="px-6 py-4 text-sm text-zinc-300">
                      {formatDate(account.dueDate)}
                      {account.paidAt && (
                        <p className="text-xs text-zinc-500 mt-0.5">
                          Pago em {formatDate(account.paidAt)}
                        </p>
                      )}
                    </td>

                    {/* Valor */}
                    <td className="px-6 py-4">
                      <span className={`font-bold text-sm ${isPayable ? "text-red-400" : "text-emerald-400"}`}>
                        {isPayable ? "- " : "+ "}
                        {formatCurrency(Number(account.amount))}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${st.cls}`}>
                        {st.label}
                      </span>
                    </td>

                    {/* Ações */}
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        {account.status !== "PAID" && account.status !== "CANCELLED" && (
                          <button
                            onClick={() => run(account.id, markAsPaid)}
                            disabled={isBusy}
                            title="Marcar como pago"
                            className="text-emerald-400 hover:text-emerald-300 p-2 rounded-lg hover:bg-emerald-900/20 transition-colors disabled:opacity-40"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}

                        {account.status === "PAID" && (
                          <button
                            onClick={() => run(account.id, markAsPending)}
                            disabled={isBusy}
                            title="Reverter para pendente"
                            className="text-amber-400 hover:text-amber-300 p-2 rounded-lg hover:bg-amber-900/20 transition-colors disabled:opacity-40"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        )}

                        {account.status !== "CANCELLED" && account.status !== "PAID" && (
                          <button
                            onClick={() => run(account.id, cancelAccount)}
                            disabled={isBusy}
                            title="Cancelar"
                            className="text-zinc-400 hover:text-zinc-300 p-2 rounded-lg hover:bg-zinc-700/30 transition-colors disabled:opacity-40"
                          >
                            <Ban className="w-4 h-4" />
                          </button>
                        )}

                        <button
                          onClick={() => setEditing(account)}
                          disabled={isBusy}
                          title="Editar"
                          className="text-amber-400 hover:text-amber-300 p-2 rounded-lg hover:bg-amber-900/20 transition-colors disabled:opacity-40"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDelete(account.id)}
                          disabled={isBusy}
                          title="Excluir"
                          className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-900/20 transition-colors disabled:opacity-40"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-zinc-500">
                    Nenhum lançamento encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
