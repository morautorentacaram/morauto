"use client"

import { useRef, useState } from "react"
import { createInspection } from "@/app/actions/inspection.actions"
import { ClipboardCheck, Plus } from "lucide-react"

type Contract = {
  id: string
  number: string
  reservation: {
    vehicle: { id: string; brand: string; model: string; plate: string; km: number }
    customer: { user: { name: string | null } }
  }
}

const checklistItems = [
  { key: "tiresOk", label: "Pneus" },
  { key: "lightsOk", label: "Faróis/Lanternas" },
  { key: "wiperOk", label: "Limpadores" },
  { key: "windowsOk", label: "Vidros" },
  { key: "bodyOk", label: "Lataria" },
  { key: "interiorOk", label: "Interior" },
  { key: "documentsOk", label: "Documentos" },
  { key: "spareTireOk", label: "Estepe" },
  { key: "jackOk", label: "Macaco" },
]

export default function InspectionForm({ contracts }: { contracts: Contract[] }) {
  const formRef = useRef<HTMLFormElement>(null)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null)
  const [checklist, setChecklist] = useState<Record<string, boolean>>(
    Object.fromEntries(checklistItems.map((i) => [i.key, true]))
  )

  function handleContractChange(id: string) {
    const c = contracts.find((c) => c.id === id) || null
    setSelectedContract(c)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess(false)
    const form = e.currentTarget
    const fd = new FormData(form)
    // Add checklist
    for (const [key, value] of Object.entries(checklist)) {
      fd.set(key, String(value))
    }
    if (selectedContract) {
      fd.set("vehicleId", selectedContract.reservation.vehicle.id)
    }
    const result = await createInspection(fd)
    setLoading(false)
    if (result?.error) setError(result.error)
    else {
      setSuccess(true)
      formRef.current?.reset()
      setSelectedContract(null)
      setChecklist(Object.fromEntries(checklistItems.map((i) => [i.key, true])))
      setTimeout(() => setSuccess(false), 3000)
    }
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
          <ClipboardCheck className="w-5 h-5 text-emerald-400" />
        </div>
        <div>
          <h3 className="text-white font-semibold">Nova Vistoria</h3>
          <p className="text-zinc-500 text-xs">Retirada ou devolução</p>
        </div>
      </div>

      <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-zinc-400 text-xs font-medium uppercase tracking-wider block mb-1">Contrato *</label>
          <select name="contractId" required onChange={(e) => handleContractChange(e.target.value)} className="w-full bg-zinc-950 border border-zinc-700 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-[#d4a017]">
            <option value="">Selecione o contrato...</option>
            {contracts.map((c) => (
              <option key={c.id} value={c.id}>
                {c.number} — {c.reservation.vehicle.plate} ({c.reservation.customer.user.name})
              </option>
            ))}
          </select>
        </div>

        {selectedContract && (
          <div className="bg-zinc-950/50 border border-zinc-700/50 rounded-lg p-3 text-sm">
            <p className="text-zinc-300">{selectedContract.reservation.vehicle.brand} {selectedContract.reservation.vehicle.model}</p>
            <p className="text-zinc-500 text-xs">KM atual: {selectedContract.reservation.vehicle.km.toLocaleString("pt-BR")}</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-zinc-400 text-xs font-medium uppercase tracking-wider block mb-1">Tipo *</label>
            <select name="type" required className="w-full bg-zinc-950 border border-zinc-700 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-[#d4a017]">
              <option value="DEPARTURE">Retirada</option>
              <option value="RETURN">Devolução</option>
            </select>
          </div>
          <div>
            <label className="text-zinc-400 text-xs font-medium uppercase tracking-wider block mb-1">KM *</label>
            <input name="km" type="number" required placeholder="Ex: 45230" className="w-full bg-zinc-950 border border-zinc-700 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-[#d4a017]" />
          </div>
        </div>

        <div>
          <label className="text-zinc-400 text-xs font-medium uppercase tracking-wider block mb-1">Nível Combustível (%) *</label>
          <input name="fuelLevel" type="range" min={0} max={100} step={5} defaultValue={100} className="w-full accent-[#d4a017]" />
        </div>

        <div>
          <label className="text-zinc-400 text-xs font-medium uppercase tracking-wider block mb-1">Vistoriador *</label>
          <input name="inspectorName" required placeholder="Nome do vistoriador" className="w-full bg-zinc-950 border border-zinc-700 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-[#d4a017]" />
        </div>

        <div>
          <label className="text-zinc-400 text-xs font-medium uppercase tracking-wider block mb-2">Checklist</label>
          <div className="grid grid-cols-3 gap-2">
            {checklistItems.map((item) => (
              <label key={item.key} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={checklist[item.key]}
                  onChange={(e) => setChecklist((prev) => ({ ...prev, [item.key]: e.target.checked }))}
                  className="w-4 h-4 accent-[#d4a017]"
                />
                <span className={`text-xs ${checklist[item.key] ? "text-zinc-300" : "text-red-400"}`}>{item.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="text-zinc-400 text-xs font-medium uppercase tracking-wider block mb-1">Observações</label>
          <textarea name="observations" rows={3} placeholder="Avarias, riscos, observações..." className="w-full bg-zinc-950 border border-zinc-700 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-[#d4a017] resize-none" />
        </div>

        {error && <p className="text-red-400 text-sm bg-red-900/20 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>}
        {success && <p className="text-emerald-400 text-sm bg-emerald-900/20 border border-emerald-500/20 rounded-lg px-3 py-2">Vistoria registrada com sucesso!</p>}

        <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl transition-colors">
          <Plus size={18} />
          {loading ? "Registrando..." : "Registrar Vistoria"}
        </button>
      </form>
    </div>
  )
}
