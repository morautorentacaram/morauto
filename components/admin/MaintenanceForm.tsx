"use client"

import { useRef, useState } from "react"
import { createMaintenance } from "@/app/actions/maintenance.actions"
import { Wrench, Plus } from "lucide-react"

type Vehicle = { id: string; brand: string; model: string; plate: string }

export default function MaintenanceForm({ vehicles }: { vehicles: Vehicle[] }) {
  const formRef = useRef<HTMLFormElement>(null)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError("")
    setSuccess(false)
    const result = await createMaintenance(formData)
    setLoading(false)
    if (result?.error) {
      setError(result.error)
    } else {
      setSuccess(true)
      formRef.current?.reset()
      setTimeout(() => setSuccess(false), 3000)
    }
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center">
          <Wrench className="w-5 h-5 text-orange-400" />
        </div>
        <div>
          <h3 className="text-white font-semibold">Nova Manutenção</h3>
          <p className="text-zinc-500 text-xs">Registrar preventiva ou corretiva</p>
        </div>
      </div>

      <form ref={formRef} action={handleSubmit} className="space-y-4">
        <div>
          <label className="text-zinc-400 text-xs font-medium uppercase tracking-wider block mb-1">Veículo *</label>
          <select name="vehicleId" required className="w-full bg-zinc-950 border border-zinc-700 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-[#d4a017]">
            <option value="">Selecione...</option>
            {vehicles.map((v) => (
              <option key={v.id} value={v.id}>{v.brand} {v.model} — {v.plate}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-zinc-400 text-xs font-medium uppercase tracking-wider block mb-1">Tipo *</label>
            <select name="type" required className="w-full bg-zinc-950 border border-zinc-700 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-[#d4a017]">
              <option value="PREVENTIVE">Preventiva</option>
              <option value="CORRECTIVE">Corretiva</option>
            </select>
          </div>
          <div>
            <label className="text-zinc-400 text-xs font-medium uppercase tracking-wider block mb-1">Data *</label>
            <input name="date" type="date" required className="w-full bg-zinc-950 border border-zinc-700 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-[#d4a017]" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-zinc-400 text-xs font-medium uppercase tracking-wider block mb-1">KM Atual *</label>
            <input name="kmAtMaintenance" type="number" required placeholder="Ex: 45000" className="w-full bg-zinc-950 border border-zinc-700 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-[#d4a017]" />
          </div>
          <div>
            <label className="text-zinc-400 text-xs font-medium uppercase tracking-wider block mb-1">Custo (R$) *</label>
            <input name="cost" type="number" step="0.01" required placeholder="0,00" className="w-full bg-zinc-950 border border-zinc-700 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-[#d4a017]" />
          </div>
        </div>

        <div>
          <label className="text-zinc-400 text-xs font-medium uppercase tracking-wider block mb-1">Descrição *</label>
          <input name="description" required placeholder="Ex: Troca de óleo e filtro" className="w-full bg-zinc-950 border border-zinc-700 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-[#d4a017]" />
        </div>

        <div>
          <label className="text-zinc-400 text-xs font-medium uppercase tracking-wider block mb-1">Oficina/Prestador</label>
          <input name="provider" placeholder="Nome da oficina" className="w-full bg-zinc-950 border border-zinc-700 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-[#d4a017]" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-zinc-400 text-xs font-medium uppercase tracking-wider block mb-1">Próx. KM</label>
            <input name="nextServiceKm" type="number" placeholder="Ex: 55000" className="w-full bg-zinc-950 border border-zinc-700 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-[#d4a017]" />
          </div>
          <div>
            <label className="text-zinc-400 text-xs font-medium uppercase tracking-wider block mb-1">Próx. Data</label>
            <input name="nextServiceDate" type="date" className="w-full bg-zinc-950 border border-zinc-700 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-[#d4a017]" />
          </div>
        </div>

        <div>
          <label className="text-zinc-400 text-xs font-medium uppercase tracking-wider block mb-1">Obs.</label>
          <textarea name="notes" rows={2} placeholder="Observações adicionais..." className="w-full bg-zinc-950 border border-zinc-700 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-[#d4a017] resize-none" />
        </div>

        {error && <p className="text-red-400 text-sm bg-red-900/20 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>}
        {success && <p className="text-emerald-400 text-sm bg-emerald-900/20 border border-emerald-500/20 rounded-lg px-3 py-2">Manutenção registrada com sucesso!</p>}

        <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl transition-colors">
          <Plus size={18} />
          {loading ? "Registrando..." : "Registrar Manutenção"}
        </button>
      </form>
    </div>
  )
}
