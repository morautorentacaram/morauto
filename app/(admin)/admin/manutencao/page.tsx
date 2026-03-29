import { getMaintenances, updateMaintenanceStatus, deleteMaintenance } from "@/app/actions/maintenance.actions"
import { getVehicles } from "@/app/actions/vehicle.actions"
import MaintenanceForm from "@/components/admin/MaintenanceForm"
import { formatCurrency } from "@/lib/utils"
import { Wrench, Trash2, CheckCircle, PlayCircle } from "lucide-react"

export const dynamic = "force-dynamic"
export const metadata = { title: "Manutenção — Morauto Admin" }

const statusLabel: Record<string, { label: string; class: string }> = {
  SCHEDULED:   { label: "Agendada",     class: "text-amber-400 bg-amber-400/10 border-amber-400/20" },
  IN_PROGRESS: { label: "Em Andamento", class: "text-blue-400 bg-blue-400/10 border-blue-400/20" },
  COMPLETED:   { label: "Concluída",    class: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" },
  CANCELLED:   { label: "Cancelada",    class: "text-zinc-400 bg-zinc-400/10 border-zinc-400/20" },
}

export default async function MaintenancePage() {
  const [maintenances, vehicles] = await Promise.all([getMaintenances(), getVehicles()])

  const totalCost = maintenances
    .filter((m) => m.status === "COMPLETED")
    .reduce((acc, m) => acc + Number(m.cost), 0)

  return (
    <div className="space-y-8 p-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-3xl font-outfit font-bold text-white tracking-tight">Manutenção da Frota</h2>
          <p className="text-zinc-400 mt-2">Controle de revisões preventivas e corretivas.</p>
        </div>
        <div className="text-right">
          <p className="text-zinc-500 text-xs uppercase tracking-wider">Custo Total</p>
          <p className="text-2xl font-bold text-orange-400">{formatCurrency(totalCost)}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {["SCHEDULED", "IN_PROGRESS", "COMPLETED", "CANCELLED"].map((s) => {
          const count = maintenances.filter((m) => m.status === s).length
          const cfg = statusLabel[s]
          return (
            <div key={s} className={`bg-zinc-900 border border-zinc-800 rounded-xl p-4`}>
              <p className="text-zinc-500 text-xs uppercase tracking-wider">{cfg.label}</p>
              <p className="text-3xl font-bold text-white mt-1">{count}</p>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        <div className="xl:col-span-1">
          <MaintenanceForm vehicles={vehicles.map((v) => ({ id: v.id, brand: v.brand, model: v.model, plate: v.plate }))} />
        </div>

        <div className="xl:col-span-3">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-zinc-950/50 border-b border-zinc-800 text-zinc-400 text-sm">
                    <th className="px-6 py-4 font-medium uppercase tracking-wider">Veículo</th>
                    <th className="px-6 py-4 font-medium uppercase tracking-wider">Tipo</th>
                    <th className="px-6 py-4 font-medium uppercase tracking-wider">Descrição</th>
                    <th className="px-6 py-4 font-medium uppercase tracking-wider">Data</th>
                    <th className="px-6 py-4 font-medium uppercase tracking-wider">Custo</th>
                    <th className="px-6 py-4 font-medium uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 font-medium uppercase tracking-wider text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {maintenances.map((m) => {
                    const cfg = statusLabel[m.status] ?? { label: m.status, class: "text-zinc-400" }
                    return (
                      <tr key={m.id} className="hover:bg-zinc-800/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Wrench className="w-4 h-4 text-orange-400" />
                            <div>
                              <div className="text-white font-medium text-sm">{m.vehicle.brand} {m.vehicle.model}</div>
                              <div className="text-zinc-500 text-xs">{m.vehicle.plate}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-xs">
                          <span className={`px-2 py-1 rounded border ${m.type === "PREVENTIVE" ? "text-blue-400 bg-blue-400/10 border-blue-400/20" : "text-red-400 bg-red-400/10 border-red-400/20"}`}>
                            {m.type === "PREVENTIVE" ? "Preventiva" : "Corretiva"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-zinc-300 text-sm max-w-48 truncate">{m.description}</td>
                        <td className="px-6 py-4 text-zinc-400 text-sm">{new Date(m.date).toLocaleDateString("pt-BR")}</td>
                        <td className="px-6 py-4 text-amber-400 font-semibold text-sm">{formatCurrency(Number(m.cost))}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-bold border ${cfg.class}`}>{cfg.label}</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {m.status === "SCHEDULED" && (
                              <form action={async () => { "use server"; await updateMaintenanceStatus(m.id, "IN_PROGRESS") }}>
                                <button type="submit" title="Iniciar" className="text-blue-400 hover:text-blue-300 p-1 rounded hover:bg-blue-900/20 transition-colors">
                                  <PlayCircle className="w-4 h-4" />
                                </button>
                              </form>
                            )}
                            {m.status === "IN_PROGRESS" && (
                              <form action={async () => { "use server"; await updateMaintenanceStatus(m.id, "COMPLETED") }}>
                                <button type="submit" title="Concluir" className="text-emerald-400 hover:text-emerald-300 p-1 rounded hover:bg-emerald-900/20 transition-colors">
                                  <CheckCircle className="w-4 h-4" />
                                </button>
                              </form>
                            )}
                            <form action={async () => { "use server"; await deleteMaintenance(m.id) }}>
                              <button type="submit" title="Excluir" className="text-red-400 hover:text-red-300 p-1 rounded hover:bg-red-900/20 transition-colors">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </form>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                  {maintenances.length === 0 && (
                    <tr><td colSpan={7} className="px-6 py-12 text-center text-zinc-500">Nenhuma manutenção registrada.</td></tr>
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
