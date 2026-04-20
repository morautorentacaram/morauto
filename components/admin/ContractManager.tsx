"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Pencil, Trash2, Eye, X, FileText, CheckCircle } from "lucide-react"
import { deleteContract, updateContractTerms } from "@/app/actions/contract.actions"
import { formatCurrency } from "@/lib/utils"
import Link from "next/link"

type Contract = {
  id: string
  number: string
  terms: string
  signedAt: Date | string | null
  createdAt: Date | string
  reservation: {
    startDate: Date | string
    endDate: Date | string
    totalValue: number | string
    vehicle: { brand: string; model: string; plate: string }
  }
  customer: { user: { name: string | null } }
}

const fmtDate = (d: Date | string) =>
  new Date(d).toLocaleDateString("pt-BR", { timeZone: "America/Manaus" })

export default function ContractManager({ contracts }: { contracts: Contract[] }) {
  const [editing, setEditing] = useState<Contract | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  async function handleDelete(id: string) {
    if (!confirm("Excluir este contrato? Esta ação não pode ser desfeita.")) return
    setDeleting(id)
    await deleteContract(id)
    setDeleting(null)
    router.refresh()
  }

  async function handleSave(formData: FormData) {
    if (!editing) return
    setLoading(true)
    setError("")
    const res = await updateContractTerms(editing.id, formData)
    if (res?.error) {
      setError(res.error)
    } else {
      setEditing(null)
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <>
      {/* Modal de Edição */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl my-8 bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
              <h3 className="text-white font-bold text-lg flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-400" />
                Editar Contrato
              </h3>
              <button onClick={() => setEditing(null)} className="text-zinc-400 hover:text-white p-1.5 rounded-lg hover:bg-zinc-800 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form action={handleSave} className="p-6 space-y-4">
              {error && <div className="text-red-400 text-sm bg-red-900/20 p-3 rounded-lg border border-red-900/50">{error}</div>}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm text-zinc-400 font-medium">Número do Contrato</label>
                  <input
                    name="number"
                    required
                    defaultValue={editing.number}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white font-mono focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-zinc-400 font-medium">Data de Assinatura</label>
                  <input
                    name="signedAt"
                    type="datetime-local"
                    defaultValue={editing.signedAt ? new Date(editing.signedAt).toISOString().slice(0, 16) : ""}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-zinc-400 font-medium">Termos do Contrato</label>
                <textarea
                  name="terms"
                  required
                  rows={16}
                  defaultValue={editing.terms}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white text-sm font-mono focus:outline-none focus:border-amber-500 transition-colors resize-y"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  className="flex-1 py-3 border border-zinc-700 text-zinc-300 hover:text-white rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold rounded-lg transition-colors disabled:opacity-50"
                >
                  {loading ? "Salvando..." : "Salvar Alterações"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tabela */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-950/50 border-b border-zinc-800 text-zinc-400 text-sm">
                <th className="px-6 py-4 font-medium uppercase tracking-wider">Contrato</th>
                <th className="px-6 py-4 font-medium uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-4 font-medium uppercase tracking-wider">Veículo</th>
                <th className="px-6 py-4 font-medium uppercase tracking-wider">Período</th>
                <th className="px-6 py-4 font-medium uppercase tracking-wider">Valor</th>
                <th className="px-6 py-4 font-medium uppercase tracking-wider">Assinado</th>
                <th className="px-6 py-4 font-medium uppercase tracking-wider text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {contracts.map((c) => (
                <tr key={c.id} className="hover:bg-zinc-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-[#d4a017]" />
                      <span className="text-white font-mono text-sm">{c.number}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-zinc-300 text-sm">{c.customer.user.name}</td>
                  <td className="px-6 py-4">
                    <div className="text-zinc-300 text-sm">{c.reservation.vehicle.brand} {c.reservation.vehicle.model}</div>
                    <div className="text-zinc-500 text-xs">{c.reservation.vehicle.plate}</div>
                  </td>
                  <td className="px-6 py-4 text-zinc-400 text-sm">
                    {fmtDate(c.reservation.startDate)} →<br />
                    {fmtDate(c.reservation.endDate)}
                  </td>
                  <td className="px-6 py-4 text-[#d4a017] font-bold text-sm">
                    {formatCurrency(Number(c.reservation.totalValue))}
                  </td>
                  <td className="px-6 py-4">
                    {c.signedAt ? (
                      <div className="flex items-center gap-1 text-emerald-400 text-sm">
                        <CheckCircle className="w-4 h-4" />
                        {fmtDate(c.signedAt)}
                      </div>
                    ) : (
                      <span className="text-amber-400 text-xs">Pendente</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/admin/contratos/${c.id}`}
                        className="text-zinc-400 hover:text-white p-2 rounded-lg hover:bg-white/5 transition-colors inline-flex"
                        title="Visualizar"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => setEditing(c)}
                        className="text-amber-400 hover:text-amber-300 p-2 rounded-lg hover:bg-amber-900/20 transition-colors"
                        title="Editar"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(c.id)}
                        disabled={!!deleting}
                        className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-900/20 transition-colors disabled:opacity-30"
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {contracts.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-zinc-500">
                    Nenhum contrato gerado ainda.
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
