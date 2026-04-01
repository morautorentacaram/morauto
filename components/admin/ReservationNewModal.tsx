"use client"

import { useState, useTransition } from "react"
import { createReservation } from "@/app/actions/reservation.actions"
import { useRouter } from "next/navigation"
import { X, Loader2, Plus } from "lucide-react"

type Customer = { id: string; document: string; user: { name: string | null } }
type Vehicle  = { id: string; brand: string; model: string; plate: string; category: { name: string; dailyRate: any } }

export default function ReservationNewModal({
  customers,
  vehicles,
  onClose,
}: {
  customers: Customer[]
  vehicles:  Vehicle[]
  onClose:   () => void
}) {
  const [error, setError]           = useState("")
  const [isPending, startTransition] = useTransition()
  const [preview, setPreview]        = useState<{ days: number; total: number } | null>(null)
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)
  const [startDate, setStartDate]    = useState("")
  const [endDate, setEndDate]        = useState("")
  const router = useRouter()

  function recalc(vid: string, sd: string, ed: string) {
    const v = vehicles.find((v) => v.id === vid)
    setSelectedVehicle(v ?? null)
    if (v && sd && ed) {
      const days = Math.max(1, Math.ceil((new Date(ed).getTime() - new Date(sd).getTime()) / 86400000))
      setPreview({ days, total: days * Number(v.category.dailyRate) })
    } else {
      setPreview(null)
    }
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError("")
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      const res = await createReservation(fd)
      if (res?.error) setError(res.error)
      else { router.refresh(); onClose() }
    })
  }

  const inp = "w-full bg-zinc-950 border border-zinc-700 text-white px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:border-[#d4a017]"

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 sticky top-0 bg-zinc-900 z-10">
          <h2 className="text-white font-bold text-lg">Nova Reserva</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-white"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="text-red-400 text-sm bg-red-900/20 border border-red-900/40 p-3 rounded-lg">{error}</div>}

          <div className="space-y-1">
            <label className="text-zinc-400 text-sm">Cliente *</label>
            <select name="customerId" required className={inp}>
              <option value="">Selecione o cliente...</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>{c.user.name} — {c.document}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-zinc-400 text-sm">Veículo *</label>
            <select name="vehicleId" required className={inp}
              onChange={(e) => recalc(e.target.value, startDate, endDate)}>
              <option value="">Selecione o veículo...</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.brand} {v.model} — {v.plate} ({v.category.name})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-zinc-400 text-sm">Retirada *</label>
              <input type="date" name="startDate" required className={inp}
                value={startDate}
                onChange={(e) => { setStartDate(e.target.value); recalc((document.querySelector('[name=vehicleId]') as HTMLSelectElement)?.value ?? "", e.target.value, endDate) }} />
            </div>
            <div className="space-y-1">
              <label className="text-zinc-400 text-sm">Devolução *</label>
              <input type="date" name="endDate" required className={inp}
                value={endDate}
                onChange={(e) => { setEndDate(e.target.value); recalc((document.querySelector('[name=vehicleId]') as HTMLSelectElement)?.value ?? "", startDate, e.target.value) }} />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-zinc-400 text-sm">Observações</label>
            <textarea name="notes" rows={2} className={inp + " resize-none"} placeholder="Opcional..." />
          </div>

          {preview && (
            <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-4 text-sm space-y-1">
              <div className="flex justify-between text-zinc-400">
                <span>Duração</span><span className="text-white">{preview.days} dia(s)</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Diária</span>
                <span className="text-white">
                  {selectedVehicle && new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(selectedVehicle.category.dailyRate))}
                </span>
              </div>
              <div className="flex justify-between font-bold border-t border-zinc-700 pt-2 mt-2">
                <span className="text-zinc-300">Total</span>
                <span className="text-[#d4a017] text-base">
                  {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(preview.total)}
                </span>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-zinc-700 text-zinc-400 hover:text-white text-sm font-medium transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={isPending}
              className="flex-1 py-2.5 rounded-xl bg-[#d4a017] hover:bg-[#b8860b] text-black font-bold text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
              {isPending ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
              Criar Reserva
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
