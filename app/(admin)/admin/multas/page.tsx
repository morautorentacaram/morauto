import { getFines, updateFineStatus, deleteFine } from "@/app/actions/fine.actions"
import { getVehicles } from "@/app/actions/vehicle.actions"
import { getReservations } from "@/app/actions/reservation.actions"
import FineForm from "@/components/admin/FineForm"
import FinePhotosCell from "@/components/admin/FinePhotosCell"
import { formatCurrency } from "@/lib/utils"
import { AlertTriangle, Trash2 } from "lucide-react"

export const dynamic = "force-dynamic"
export const metadata = { title: "Multas — Morauto Admin" }

const fineStatusConfig: Record<string, { label: string; class: string }> = {
  PENDING:        { label: "Pendente",      class: "text-amber-400 bg-amber-400/10 border-amber-400/20" },
  PAID:           { label: "Paga",          class: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" },
  APPEAL:         { label: "Em Recurso",    class: "text-blue-400 bg-blue-400/10 border-blue-400/20" },
  CHARGED_CLIENT: { label: "Cobrado Cliente", class: "text-purple-400 bg-purple-400/10 border-purple-400/20" },
  SETTLED:        { label: "Quitada",       class: "text-zinc-400 bg-zinc-400/10 border-zinc-400/20" },
}

export default async function FinesPage() {
  const [fines, vehicles, reservations] = await Promise.all([
    getFines(),
    getVehicles(),
    getReservations(),
  ])

  const totalPending = fines.filter((f) => f.status === "PENDING").reduce((a, f) => a + Number(f.amount), 0)
  const totalPaid = fines.filter((f) => f.status === "PAID" || f.status === "SETTLED").reduce((a, f) => a + Number(f.amount), 0)

  const vehicleList = vehicles.map((v) => ({ id: v.id, brand: v.brand, model: v.model, plate: v.plate }))
  const reservationList = reservations.map((r) => ({
    id: r.id,
    vehicle: { plate: r.vehicle.plate },
    customer: { user: { name: r.customer.user.name } },
  }))

  return (
    <div className="space-y-8 p-6">
      <div>
        <h2 className="text-3xl font-outfit font-bold text-white tracking-tight">Multas e Infrações</h2>
        <p className="text-zinc-400 mt-2">Gerencie multas de trânsito vinculadas aos veículos da frota.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <p className="text-zinc-500 text-xs uppercase tracking-wider">Total de Multas</p>
          <p className="text-3xl font-bold text-white mt-1">{fines.length}</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <p className="text-zinc-500 text-xs uppercase tracking-wider">Valor Pendente</p>
          <p className="text-3xl font-bold text-red-400 mt-1">{formatCurrency(totalPending)}</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <p className="text-zinc-500 text-xs uppercase tracking-wider">Pagas/Quitadas</p>
          <p className="text-3xl font-bold text-emerald-400 mt-1">{formatCurrency(totalPaid)}</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <p className="text-zinc-500 text-xs uppercase tracking-wider">Cobradas ao Cliente</p>
          <p className="text-3xl font-bold text-purple-400 mt-1">{fines.filter((f) => f.chargedToClient).length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        <div className="xl:col-span-1">
          <FineForm vehicles={vehicleList} reservations={reservationList} />
        </div>

        <div className="xl:col-span-3">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-zinc-950/50 border-b border-zinc-800 text-zinc-400 text-sm">
                    <th className="px-6 py-4 font-medium uppercase tracking-wider">Veículo</th>
                    <th className="px-6 py-4 font-medium uppercase tracking-wider">Infração</th>
                    <th className="px-6 py-4 font-medium uppercase tracking-wider">Data</th>
                    <th className="px-6 py-4 font-medium uppercase tracking-wider">Valor</th>
                    <th className="px-6 py-4 font-medium uppercase tracking-wider">Fotos</th>
                    <th className="px-6 py-4 font-medium uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 font-medium uppercase tracking-wider text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {fines.map((fine) => {
                    const cfg = fineStatusConfig[fine.status] ?? { label: fine.status, class: "text-zinc-400" }
                    return (
                      <tr key={fine.id} className="hover:bg-zinc-800/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-red-400" />
                            <div>
                              <div className="text-white font-medium text-sm">{fine.vehicle.brand} {fine.vehicle.model}</div>
                              <div className="text-zinc-500 text-xs">{fine.vehicle.plate}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-zinc-300 text-sm">{fine.description}</div>
                          <div className="text-zinc-500 text-xs">Cód: {fine.infractionCode}{fine.agencyName ? ` • ${fine.agencyName}` : ""}</div>
                        </td>
                        <td className="px-6 py-4 text-zinc-400 text-sm">{new Date(fine.date).toLocaleDateString("pt-BR")}</td>
                        <td className="px-6 py-4 text-red-400 font-semibold text-sm">{formatCurrency(Number(fine.amount))}</td>
                        <td className="px-6 py-4">
                          <FinePhotosCell photos={fine.photos} />
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-bold border ${cfg.class}`}>{cfg.label}</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {fine.status === "PENDING" && (
                              <>
                                <form action={async () => { "use server"; await updateFineStatus(fine.id, "APPEAL") }}>
                                  <button type="submit" className="text-blue-400 text-xs hover:underline px-2 py-1">Recurso</button>
                                </form>
                                <form action={async () => { "use server"; await updateFineStatus(fine.id, "PAID") }}>
                                  <button type="submit" className="text-emerald-400 text-xs hover:underline px-2 py-1">Pagar</button>
                                </form>
                              </>
                            )}
                            <form action={async () => { "use server"; await deleteFine(fine.id) }}>
                              <button type="submit" className="text-red-400 hover:text-red-300 p-1 rounded hover:bg-red-900/20 transition-colors">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </form>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                  {fines.length === 0 && (
                    <tr><td colSpan={6} className="px-6 py-12 text-center text-zinc-500">Nenhuma multa cadastrada.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
