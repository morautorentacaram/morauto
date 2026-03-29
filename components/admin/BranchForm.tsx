"use client"

import { useRef, useState } from "react"
import { createBranch } from "@/app/actions/branch.actions"
import { Building2, Plus } from "lucide-react"

export default function BranchForm() {
  const formRef = useRef<HTMLFormElement>(null)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError("")
    setSuccess(false)
    const result = await createBranch(formData)
    setLoading(false)
    if (result?.error) setError(result.error)
    else {
      setSuccess(true)
      formRef.current?.reset()
      setTimeout(() => setSuccess(false), 3000)
    }
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
          <Building2 className="w-5 h-5 text-blue-400" />
        </div>
        <div>
          <h3 className="text-white font-semibold">Nova Filial</h3>
          <p className="text-zinc-500 text-xs">Cadastrar unidade</p>
        </div>
      </div>

      <form ref={formRef} action={handleSubmit} className="space-y-4">
        <div>
          <label className="text-zinc-400 text-xs font-medium uppercase tracking-wider block mb-1">Nome *</label>
          <input name="name" required placeholder="Ex: Unidade Centro" className="w-full bg-zinc-950 border border-zinc-700 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-[#d4a017]" />
        </div>
        <div>
          <label className="text-zinc-400 text-xs font-medium uppercase tracking-wider block mb-1">Endereço *</label>
          <input name="address" required placeholder="Rua, número, bairro" className="w-full bg-zinc-950 border border-zinc-700 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-[#d4a017]" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-zinc-400 text-xs font-medium uppercase tracking-wider block mb-1">Cidade *</label>
            <input name="city" required placeholder="São Paulo" className="w-full bg-zinc-950 border border-zinc-700 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-[#d4a017]" />
          </div>
          <div>
            <label className="text-zinc-400 text-xs font-medium uppercase tracking-wider block mb-1">Estado *</label>
            <input name="state" required placeholder="SP" maxLength={2} className="w-full bg-zinc-950 border border-zinc-700 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-[#d4a017]" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-zinc-400 text-xs font-medium uppercase tracking-wider block mb-1">Telefone</label>
            <input name="phone" placeholder="(11) 99999-9999" className="w-full bg-zinc-950 border border-zinc-700 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-[#d4a017]" />
          </div>
          <div>
            <label className="text-zinc-400 text-xs font-medium uppercase tracking-wider block mb-1">E-mail</label>
            <input name="email" type="email" placeholder="filial@morauto.com.br" className="w-full bg-zinc-950 border border-zinc-700 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-[#d4a017]" />
          </div>
        </div>

        {error && <p className="text-red-400 text-sm bg-red-900/20 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>}
        {success && <p className="text-emerald-400 text-sm bg-emerald-900/20 border border-emerald-500/20 rounded-lg px-3 py-2">Filial cadastrada!</p>}

        <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl transition-colors">
          <Plus size={18} />
          {loading ? "Cadastrando..." : "Cadastrar Filial"}
        </button>
      </form>
    </div>
  )
}
