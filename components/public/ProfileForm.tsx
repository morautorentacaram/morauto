"use client"

import { useTransition, useState } from "react"
import { updateCustomer } from "@/app/actions/customer.actions"
import { Loader2, CheckCircle, ShieldAlert } from "lucide-react"

type ProfileFormProps = {
  customerId: string
  defaultValues: {
    name: string
    phone: string
    cnh: string
    cnhExpiration: string
    email: string
    document: string
    type: string
    score: number
    memberSince: string
  }
}

export default function ProfileForm({ customerId, defaultValues }: ProfileFormProps) {
  const [isPending, startTransition] = useTransition()
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSuccess(false)
    setError(null)

    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      const result = await updateCustomer(customerId, formData)
      if (result.error) {
        setError(result.error)
      } else {
        setSuccess(true)
        setTimeout(() => setSuccess(false), 4000)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {success && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-2 text-emerald-400 text-sm">
          <CheckCircle size={16} className="flex-shrink-0" /> Perfil atualizado com sucesso!
        </div>
      )}
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 text-red-400 text-sm">
          <ShieldAlert size={16} className="flex-shrink-0" /> {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Editable fields */}
        <div className="md:col-span-2">
          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-widest block mb-1.5">
            Nome completo
          </label>
          <input
            name="name"
            type="text"
            required
            defaultValue={defaultValues.name}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 outline-none focus:border-[#d4a017]/50 focus:bg-white/10 transition-all"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-widest block mb-1.5">
            Telefone
          </label>
          <input
            name="phone"
            type="tel"
            defaultValue={defaultValues.phone}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 outline-none focus:border-[#d4a017]/50 focus:bg-white/10 transition-all"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-widest block mb-1.5">
            CNH
          </label>
          <input
            name="cnh"
            type="text"
            defaultValue={defaultValues.cnh}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 outline-none focus:border-[#d4a017]/50 focus:bg-white/10 transition-all"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-widest block mb-1.5">
            Vencimento CNH
          </label>
          <input
            name="cnhExpiration"
            type="date"
            defaultValue={defaultValues.cnhExpiration}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-[#d4a017]/50 focus:bg-white/10 transition-all"
            style={{ colorScheme: "dark" }}
          />
        </div>

        {/* Read-only fields */}
        <div>
          <label className="text-xs font-semibold text-zinc-500 uppercase tracking-widest block mb-1.5">
            E-mail <span className="text-zinc-600 normal-case">(somente leitura)</span>
          </label>
          <input
            type="email"
            value={defaultValues.email}
            readOnly
            className="w-full bg-zinc-800/50 border border-zinc-700 rounded-xl px-4 py-3 text-zinc-500 cursor-not-allowed"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-zinc-500 uppercase tracking-widest block mb-1.5">
            CPF <span className="text-zinc-600 normal-case">(somente leitura)</span>
          </label>
          <input
            type="text"
            value={defaultValues.document}
            readOnly
            className="w-full bg-zinc-800/50 border border-zinc-700 rounded-xl px-4 py-3 text-zinc-500 cursor-not-allowed font-mono"
          />
        </div>
      </div>

      {/* Info chips */}
      <div className="flex flex-wrap gap-3 pt-2">
        <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl px-4 py-2">
          <span className="text-zinc-500 text-xs uppercase tracking-wider">Tipo: </span>
          <span className="text-zinc-300 text-sm font-semibold">{defaultValues.type}</span>
        </div>
        <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl px-4 py-2">
          <span className="text-zinc-500 text-xs uppercase tracking-wider">Score: </span>
          <span className={`text-sm font-bold ${
            defaultValues.score >= 70 ? "text-emerald-400"
            : defaultValues.score >= 40 ? "text-amber-400"
            : "text-red-400"
          }`}>{defaultValues.score}/100</span>
        </div>
        <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl px-4 py-2">
          <span className="text-zinc-500 text-xs uppercase tracking-wider">Cliente desde: </span>
          <span className="text-zinc-300 text-sm">{defaultValues.memberSince}</span>
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="bg-[#d4a017] hover:bg-[#b8860b] text-black font-bold px-8 py-3 rounded-xl transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {isPending ? (
          <><Loader2 size={18} className="animate-spin" /> Salvando...</>
        ) : (
          "Salvar Alterações"
        )}
      </button>
    </form>
  )
}
