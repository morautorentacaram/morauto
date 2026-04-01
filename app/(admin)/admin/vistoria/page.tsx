import { getInspections } from "@/app/actions/inspection.actions"
import { getContracts } from "@/app/actions/contract.actions"
import InspectionForm from "@/components/admin/InspectionForm"
import { ClipboardCheck, CheckCircle, XCircle } from "lucide-react"

export const dynamic = "force-dynamic"
export const metadata = { title: "Vistoria — Morauto Admin" }

export default async function InspectionPage() {
  const inspections = await getInspections()
  const contracts   = await getContracts()

  const formContracts = contracts.map((c) => ({
    id: c.id,
    number: c.number,
    reservation: {
      vehicle: {
        id: c.reservation.vehicle.id,
        brand: c.reservation.vehicle.brand,
        model: c.reservation.vehicle.model,
        plate: c.reservation.vehicle.plate,
        km: c.reservation.vehicle.km,
      },
      customer: { user: { name: c.customer.user.name } },
    },
  }))

  return (
    <div className="space-y-8 p-6">
      <div>
        <h2 className="text-3xl font-outfit font-bold text-white tracking-tight">Vistoria de Veículos</h2>
        <p className="text-zinc-400 mt-2">Checklist de retirada e devolução com registro de avarias.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <p className="text-zinc-500 text-xs uppercase tracking-wider">Total de Vistorias</p>
          <p className="text-3xl font-bold text-white mt-1">{inspections.length}</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <p className="text-zinc-500 text-xs uppercase tracking-wider">Retiradas</p>
          <p className="text-3xl font-bold text-blue-400 mt-1">{inspections.filter((i) => i.type === "DEPARTURE").length}</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <p className="text-zinc-500 text-xs uppercase tracking-wider">Devoluções</p>
          <p className="text-3xl font-bold text-emerald-400 mt-1">{inspections.filter((i) => i.type === "RETURN").length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        <div className="xl:col-span-1">
          <InspectionForm contracts={formContracts} />
        </div>

        <div className="xl:col-span-3">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-zinc-950/50 border-b border-zinc-800 text-zinc-400 text-sm">
                    <th className="px-6 py-4 font-medium uppercase tracking-wider">Veículo</th>
                    <th className="px-6 py-4 font-medium uppercase tracking-wider">Tipo</th>
                    <th className="px-6 py-4 font-medium uppercase tracking-wider">KM</th>
                    <th className="px-6 py-4 font-medium uppercase tracking-wider">Combustível</th>
                    <th className="px-6 py-4 font-medium uppercase tracking-wider">Checklist</th>
                    <th className="px-6 py-4 font-medium uppercase tracking-wider">Vistoriador</th>
                    <th className="px-6 py-4 font-medium uppercase tracking-wider">Data</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {inspections.map((insp) => {
                    const checkItems = [insp.tiresOk, insp.lightsOk, insp.wiperOk, insp.windowsOk, insp.bodyOk, insp.interiorOk, insp.documentsOk, insp.spareTireOk, insp.jackOk]
                    const failCount = checkItems.filter((v) => !v).length
                    return (
                      <tr key={insp.id} className="hover:bg-zinc-800/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <ClipboardCheck className="w-4 h-4 text-emerald-400" />
                            <div>
                              <div className="text-white font-medium text-sm">{insp.vehicle.brand} {insp.vehicle.model}</div>
                              <div className="text-zinc-500 text-xs">{insp.vehicle.plate}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-bold border ${insp.type === "DEPARTURE" ? "text-blue-400 bg-blue-400/10 border-blue-400/20" : "text-emerald-400 bg-emerald-400/10 border-emerald-400/20"}`}>
                            {insp.type === "DEPARTURE" ? "Retirada" : "Devolução"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-zinc-300 text-sm">{insp.km.toLocaleString("pt-BR")} km</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-2 bg-zinc-700 rounded-full overflow-hidden">
                              <div className="h-full bg-[#d4a017] rounded-full" style={{ width: `${insp.fuelLevel}%` }} />
                            </div>
                            <span className="text-zinc-400 text-xs">{insp.fuelLevel}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {failCount === 0 ? (
                            <div className="flex items-center gap-1 text-emerald-400 text-sm">
                              <CheckCircle className="w-4 h-4" /> OK
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 text-red-400 text-sm">
                              <XCircle className="w-4 h-4" /> {failCount} item(s)
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-zinc-400 text-sm">{insp.inspectorName}</td>
                        <td className="px-6 py-4 text-zinc-400 text-sm">{new Date(insp.createdAt).toLocaleDateString("pt-BR")}</td>
                      </tr>
                    )
                  })}
                  {inspections.length === 0 && (
                    <tr><td colSpan={7} className="px-6 py-12 text-center text-zinc-500">Nenhuma vistoria registrada.</td></tr>
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
