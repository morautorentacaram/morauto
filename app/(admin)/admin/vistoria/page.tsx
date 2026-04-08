import { getInspections } from "@/app/actions/inspection.actions"
import { getContracts } from "@/app/actions/contract.actions"
import InspectionForm from "@/components/admin/InspectionForm"
import InspectionManager from "@/components/admin/InspectionManager"

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
          <InspectionManager inspections={inspections} />
        </div>
      </div>
    </div>
  )
}
