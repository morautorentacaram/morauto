"use client"

import { useState, useTransition } from "react"
import { updateReservation, deleteReservation } from "@/app/actions/reservation.actions"
import { useRouter } from "next/navigation"
import { Pencil, Trash2, Loader2, X, Save } from "lucide-react"

type Reservation = {
  id: string
  startDate: Date
  endDate: Date
  status: string
  notes?: string | null
  vehicle: { brand: string; model: string; plate: string; category: { dailyRate: any } }
  customer: { user: { name: string | null } }
}

export default function ReservationActions({ reservation }: { reservation: Reservation }) {
  const [showEdit, setShowEdit]         = useState(false)
  const [showDelete, setShowDelete]     = useState(false)
  const [error, setError]               = useState("")
  const [isPending, startTransition]    = useTransition()
  const [preview, setPreview]           = useState<{ days: number; total: number } | null>(null)
  const router = useRouter()

  const fmtDate = (d: Date) => new Date(d).toISOString().split("T")[0]

  function recalc(sd: string, ed: string) {
    if (!sd || !ed) return setPreview(null)
    const days = Math.max(1, Math.ceil((new Date(ed).getTime() - new Date(sd).getTime()) / 86400000))
    setPreview({ days, total: days * Number(reservation.vehicle.category.dailyRate) })
  }

  function handleEdit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError("")
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      const res = await updateReservation(reservation.id, fd)
      if (res?.error) setError(res.error)
      else { router.refresh(); setShowEdit(false) }
    })
  }

  function handleDelete() {
    startTransition(async () => {
      const res = await deleteReservation(reservation.id)
      if (res?.error) setError(res.error)
      else { router.refresh(); setShowDelete(false) }
    })
  }

  const canDelete = reservation.status !== "ACTIVE"
  const inp = "w-full bg-zinc-950 border border-zinc-700 text-white px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:border-[#d4a017]"

  return (
    <>
      <div className="flex items-center gap-1">
        <button onClick={() => { setPreview(null); setError(""); setShowEdit(true) }}
          title="Editar período"
          className="text-zinc-400 hover:text-[#d4a017] p-1.5 rounded hover:bg-[#d4a017]/10 transition-colors">
          <Pencil size={14} />
        </button>
        <button onClick={() => { setError(""); setShowDelete(true) }}
          title={canDelete ? "Excluir" : "Locação ativa — cancele antes de excluir"}
          disabled={!canDelete}
          className="text-zinc-400 hover:text-red-400 p-1.5 rounded hover:bg-red-900/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
          <Trash2 size={14} />
        </button>
      </div>

      {/* Edit modal */}
      {showEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
              <div>
                <h2 className="text-white font-bold">Editar Reserva</h2>
                <p className="text-zinc-500 text-xs">{reservation.vehicle.brand} {reservation.vehicle.model} — {reservation.vehicle.plate}</p>
              </div>
              <button onClick={() => setShowEdit(false)} className="text-zinc-400 hover:text-white"><X size={20} /></button>
            </div>
            <form onSubmit={handleEdit} className="p-6 space-y-4">
              {error && <div className="text-red-400 text-sm bg-red-900/20 border border-red-900/40 p-3 rounded-lg">{error}</div>}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-zinc-400 text-sm">Retirada *</label>
                  <input type="date" name="startDate" required className={inp}
                    defaultValue={fmtDate(reservation.startDate)}
                    onChange={(e) => recalc(e.target.value, (document.querySelector('[name=endDate]') as HTMLInputElement)?.value ?? "")} />
                </div>
                <div className="space-y-1">
                  <label className="text-zinc-400 text-sm">Devolução *</label>
                  <input type="date" name="endDate" required className={inp}
                    defaultValue={fmtDate(reservation.endDate)}
                    onChange={(e) => recalc((document.querySelector('[name=startDate]') as HTMLInputElement)?.value ?? "", e.target.value)} />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-zinc-400 text-sm">Observações</label>
                <textarea name="notes" rows={2} className={inp + " resize-none"} defaultValue={reservation.notes ?? ""} />
              </div>

              {preview && (
                <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-3 text-sm flex justify-between items-center">
                  <span className="text-zinc-400">{preview.days} dia(s)</span>
                  <span className="text-[#d4a017] font-bold">
                    {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(preview.total)}
                  </span>
                </div>
              )}

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowEdit(false)}
                  className="flex-1 py-2.5 rounded-xl border border-zinc-700 text-zinc-400 hover:text-white text-sm font-medium transition-colors">
                  Cancelar
                </button>
                <button type="submit" disabled={isPending}
                  className="flex-1 py-2.5 rounded-xl bg-[#d4a017] hover:bg-[#b8860b] text-black font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-60">
                  {isPending ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {showDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-sm p-6 shadow-2xl space-y-4">
            <h3 className="text-white font-bold text-lg">Excluir reserva?</h3>
            <p className="text-zinc-400 text-sm">
              Reserva de <strong className="text-white">{reservation.customer.user.name}</strong> para o{" "}
              <strong className="text-white">{reservation.vehicle.brand} {reservation.vehicle.model}</strong> será excluída permanentemente.
            </p>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <div className="flex gap-3">
              <button onClick={() => setShowDelete(false)}
                className="flex-1 py-2.5 rounded-xl border border-zinc-700 text-zinc-400 hover:text-white text-sm font-medium transition-colors">
                Cancelar
              </button>
              <button onClick={handleDelete} disabled={isPending}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-60">
                {isPending ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
