"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { createAccount, updateAccount } from "@/app/actions/accounts.actions"
import type { AccountEntry } from "@prisma/client"

const PAYABLE_CATEGORIES = [
  "Aluguel",
  "Combustível",
  "Manutenção",
  "Seguro",
  "Impostos",
  "Fornecedor",
  "Funcionários",
  "Marketing",
  "Outros",
]

const RECEIVABLE_CATEGORIES = [
  "Locação",
  "Venda de Veículo",
  "Multa Cobrada",
  "Receita Extra",
  "Outros",
]

const inputCls =
  "w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#d4a017] text-sm"

const labelCls = "block text-zinc-400 text-xs font-medium mb-1.5 uppercase tracking-wider"

interface Props {
  account?: AccountEntry
  onSuccess?: () => void
}

export default function AccountForm({ account, onSuccess }: Props) {
  const isEditing = !!account
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [type, setType] = useState<"PAYABLE" | "RECEIVABLE">(
    (account?.type as "PAYABLE" | "RECEIVABLE") ?? "PAYABLE"
  )
  const formRef = useRef<HTMLFormElement>(null)
  const router = useRouter()

  const categories = type === "PAYABLE" ? PAYABLE_CATEGORIES : RECEIVABLE_CATEGORIES

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError("")

    const res = isEditing
      ? await updateAccount(account.id, formData)
      : await createAccount(formData)

    setLoading(false)

    if (res?.error) {
      setError(res.error)
      return
    }

    formRef.current?.reset()
    setType("PAYABLE")
    router.refresh()
    onSuccess?.()
  }

  const defaultDate = account?.dueDate
    ? new Date(account.dueDate).toISOString().split("T")[0]
    : ""

  return (
    <form
      ref={formRef}
      action={handleSubmit}
      className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-5"
    >
      <h3 className="text-white font-semibold text-base">
        {isEditing ? "Editar Lançamento" : "Novo Lançamento"}
      </h3>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Tipo */}
      <div>
        <label className={labelCls}>Tipo</label>
        <div className="flex gap-2">
          {(["PAYABLE", "RECEIVABLE"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all border ${
                type === t
                  ? t === "PAYABLE"
                    ? "bg-red-500/10 border-red-500/40 text-red-400"
                    : "bg-emerald-500/10 border-emerald-500/40 text-emerald-400"
                  : "border-zinc-800 text-zinc-500 hover:border-zinc-600"
              }`}
            >
              {t === "PAYABLE" ? "A Pagar" : "A Receber"}
            </button>
          ))}
        </div>
        <input type="hidden" name="type" value={type} />
      </div>

      {/* Categoria */}
      <div>
        <label className={labelCls}>Categoria</label>
        <select
          name="category"
          defaultValue={account?.category ?? ""}
          required
          className={inputCls}
        >
          <option value="">Selecione...</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* Descrição */}
      <div>
        <label className={labelCls}>Descrição</label>
        <input
          type="text"
          name="description"
          defaultValue={account?.description ?? ""}
          required
          placeholder="Ex: Aluguel sede — Maio/2026"
          className={inputCls}
        />
      </div>

      {/* Valor e Vencimento */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Valor (R$)</label>
          <input
            type="number"
            name="amount"
            step="0.01"
            min="0.01"
            defaultValue={account ? Number(account.amount) : ""}
            required
            placeholder="0,00"
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Vencimento</label>
          <input
            type="date"
            name="dueDate"
            defaultValue={defaultDate}
            required
            className={inputCls}
          />
        </div>
      </div>

      {/* Observações */}
      <div>
        <label className={labelCls}>Observações</label>
        <textarea
          name="notes"
          defaultValue={account?.notes ?? ""}
          rows={2}
          placeholder="Opcional"
          className={`${inputCls} resize-none`}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[#d4a017] hover:bg-[#c9940f] disabled:opacity-50 text-black font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        {isEditing ? "Salvar Alterações" : "Criar Lançamento"}
      </button>
    </form>
  )
}
