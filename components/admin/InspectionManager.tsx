"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { updateInspection, deleteInspection } from "@/app/actions/inspection.actions"
import {
  ClipboardCheck, CheckCircle, XCircle, Pencil, Trash2, Loader2, X, Save
} from "lucide-react"

type Inspection = {
  id: string
  type: string
  km: number
  fuelLevel: number
  observations: string | null
  inspectorName: string
  tiresOk: boolean
  lightsOk: boolean
  wiperOk: boolean
  windowsOk: boolean
  bodyOk: boolean
  interiorOk: boolean
  documentsOk: boolean
  spareTireOk: boolean
  jackOk: boolean
  createdAt: Date | string
  vehicle: { brand: string; model: string; plate: string | null }
  contract: { id: string; number: string } | null
}

const CHECK_LABELS: { key: keyof Pick<Inspection, "tiresOk"|"lightsOk"|"wiperOk"|"windowsOk"|"bodyOk"|"interiorOk"|"documentsOk"|"spareTireOk"|"jackOk">; label: string }[] = [
  { key: "tiresOk",     label: "Pneus" },
  { key: "lightsOk",    label: "Luzes" },
  { key: "wiperOk",     label: "Limpador" },
  { key: "windowsOk",   label: "Vidros" },
  { key: "bodyOk",      label: "Lataria" },
  { key: "interiorOk",  label: "Interior" },
  { key: "documentsOk", label: "Documentos" },
  { key: "spareTireOk", label: "Estepe" },
  { key: "jackOk",      label: "Macaco" },
]

const inp = "w-full bg-zinc-950 border border-zinc-700 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-[#d4a017]"

export default function InspectionManager({ inspections }: { inspections: Inspection[] }) {
  const [editing, setEditing]       = useState<Inspection | null>(null)
  const [confirming, setConfirming] = useState<Inspection | null>(null)
  const [isPending, startTransition] = useTransition()
  const [error, setError]           = useState("")
  const router = useRouter()

  function handleSave(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!editing) return
    setError("")
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      const res = await updateInspection(editing.id, fd)
      if (res?.error) setError(res.error)
      else { setEditing(null); router.refresh() }
    })
  }

  function handleDelete() {
    if (!confirming) return
    startTransition(async () => {
      const res = await deleteInspection(confirming.id)
      if (res?.error) setError(res.error)
      else { setConfirming(null); router.refresh() }
    })
  }

  return (
    <>
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-950/50 border-b border-zinc-800 text-zinc-400 text-sm">
                <th className="px-4 py-4 font-medium uppercase tracking-wider">Veículo</th>
                <th className="px-4 py-4 font-medium uppercase tracking-wider">Tipo</th>
                <th className="px-4 py-4 font-medium uppercase tracking-wider">KM</th>
                <th className="px-4 py-4 font-medium uppercase tracking-wider">Combustível</th>
                <th className="px-4 py-4 font-medium uppercase tracking-wider">Checklist</th>
                <th className="px-4 py-4 font-medium uppercase tracking-wider">Vistoriador</th>
                <th className="px-4 py-4 font-medium uppercase tracking-wider">Data</th>
                <th className="px-4 py-4 font-medium uppercase tracking-wider text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {inspections.map((insp) => {
                const checkItems = [insp.tiresOk, insp.lightsOk, insp.wiperOk, insp.windowsOk, insp.bodyOk, insp.interiorOk, insp.documentsOk, insp.spareTireOk, insp.jackOk]
                const failCount = checkItems.filter((v) => !v).length
                return (
                  <tr key={insp.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <ClipboardCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                        <div>
                          <div className="text-white font-medium text-sm">{insp.vehicle.brand} {insp.vehicle.model}</div>
                          <div className="text-zinc-500 text-xs">{insp.vehicle.plate}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold border ${insp.type === "DEPARTURE" ? "text-blue-400 bg-blue-400/10 border-blue-400/20" : "text-emerald-400 bg-emerald-400/10 border-emerald-400/20"}`}>
                        {insp.type === "DEPARTURE" ? "Retirada" : "Devolução"}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-zinc-300 text-sm">{insp.km.toLocaleString("pt-BR")} km</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-zinc-700 rounded-full overflow-hidden">
                          <div className="h-full bg-[#d4a017] rounded-full" style={{ width: `${insp.fuelLevel}%` }} />
                        </div>
                        <span className="text-zinc-400 text-xs">{insp.fuelLevel}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      {failCount === 0 ? (
                        <div className="flex items-center gap-1 text-emerald-400 text-sm"><CheckCircle className="w-4 h-4" /> OK</div>
                      ) : (
                        <div className="flex items-center gap-1 text-red-400 text-sm"><XCircle className="w-4 h-4" /> {failCount} item(s)</div>
                      )}
                    </td>
                    <td className="px-4 py-4 text-zinc-400 text-sm">{insp.inspectorName}</td>
                    <td className="px-4 py-4 text-zinc-400 text-sm">{new Date(insp.createdAt).toLocaleDateString("pt-BR")}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => setEditing(insp)} title="Editar"
                          className="text-zinc-400 hover:text-[#d4a017] p-1.5 rounded hover:bg-[#d4a017]/10 transition-colors">
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => setConfirming(insp)} title="Excluir"
                          className="text-zinc-400 hover:text-red-400 p-1.5 rounded hover:bg-red-900/20 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {inspections.length === 0 && (
                <tr><td colSpan={8} className="px-6 py-12 text-center text-zinc-500">Nenhuma vistoria registrada.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-lg shadow-2xl max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 flex-shrink-0">
              <div>
                <h2 className="text-white font-bold text-lg">Editar Vistoria</h2>
                <p className="text-zinc-500 text-xs mt-0.5">{editing.vehicle.brand} {editing.vehicle.model} · {editing.type === "DEPARTURE" ? "Retirada" : "Devolução"}</p>
              </div>
              <button onClick={() => setEditing(null)} className="text-zinc-400 hover:text-white transition-colors"><X size={20} /></button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-5 overflow-y-auto">
              {error && <div className="text-red-400 text-sm bg-red-900/20 border border-red-900/40 p-3 rounded-lg">{error}</div>}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-zinc-400 text-sm">KM</label>
                  <input name="km" type="number" required defaultValue={editing.km} className={inp} />
                </div>
                <div className="space-y-1">
                  <label className="text-zinc-400 text-sm">Combustível (%)</label>
                  <input name="fuelLevel" type="number" min={0} max={100} required defaultValue={editing.fuelLevel} className={inp} />
                </div>
                <div className="col-span-2 space-y-1">
                  <label className="text-zinc-400 text-sm">Vistoriador</label>
                  <input name="inspectorName" required defaultValue={editing.inspectorName} className={inp} />
                </div>
                <div className="col-span-2 space-y-1">
                  <label className="text-zinc-400 text-sm">Observações</label>
                  <textarea name="observations" rows={2} defaultValue={editing.observations ?? ""} className={inp + " resize-none"} />
                </div>
              </div>

              {/* Checklist */}
              <div className="space-y-2">
                <p className="text-zinc-400 text-sm font-semibold">Checklist</p>
                <div className="grid grid-cols-3 gap-2">
                  {CHECK_LABELS.map(({ key, label }) => (
                    <CheckItem key={key} name={key} label={label} defaultChecked={editing[key] as boolean} />
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setEditing(null)}
                  className="flex-1 py-2.5 rounded-xl border border-zinc-700 text-zinc-400 hover:text-white text-sm font-medium transition-colors">
                  Cancelar
                </button>
                <button type="submit" disabled={isPending}
                  className="flex-1 py-2.5 rounded-xl bg-[#d4a017] hover:bg-[#b8860b] text-black font-bold text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
                  {isPending ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {confirming && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-sm p-6 shadow-2xl space-y-4">
            <h3 className="text-white font-bold text-lg">Excluir vistoria?</h3>
            <p className="text-zinc-400 text-sm">
              Vistoria de <strong className="text-white">{confirming.vehicle.brand} {confirming.vehicle.model}</strong> ({confirming.type === "DEPARTURE" ? "Retirada" : "Devolução"}) será removida permanentemente.
            </p>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <div className="flex gap-3">
              <button onClick={() => setConfirming(null)}
                className="flex-1 py-2.5 rounded-xl border border-zinc-700 text-zinc-400 hover:text-white text-sm font-medium transition-colors">
                Cancelar
              </button>
              <button onClick={handleDelete} disabled={isPending}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
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

function CheckItem({ name, label, defaultChecked }: { name: string; label: string; defaultChecked: boolean }) {
  const [checked, setChecked] = useState(defaultChecked)
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input type="hidden" name={name} value={checked ? "true" : "false"} />
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => setChecked(e.target.checked)}
        className="w-4 h-4 accent-[#d4a017] cursor-pointer"
      />
      <span className="text-zinc-300 text-sm">{label}</span>
    </label>
  )
}
