import { getContracts } from "@/app/actions/contract.actions"
import { getReservations } from "@/app/actions/reservation.actions"
type ReservationType = Awaited<ReturnType<typeof getReservations>>[0]
import { formatCurrency } from "@/lib/utils"
import { FilePlus } from "lucide-react"
import ContractManager from "@/components/admin/ContractManager"
import GenerateContractButton from "@/components/admin/GenerateContractButton"

const fmtDate = (d: Date | string) =>
  new Date(d).toLocaleDateString("pt-BR", { timeZone: "America/Manaus" })

export const dynamic = "force-dynamic"
export const metadata = { title: "Contratos — Morauto Admin" }

export default async function ContractsPage() {
  const [contracts, reservations] = await Promise.all([getContracts(), getReservations()])

  // Reservations without contracts
  const reservationsWithoutContract = reservations.filter(
    (r) => !r.contract && (r.status === "PENDING" || r.status === "CONFIRMED")
  )

  return (
    <div className="space-y-8 p-6">
      <div>
        <h2 className="text-3xl font-outfit font-bold text-white tracking-tight">Contratos de Locação</h2>
        <p className="text-zinc-400 mt-2">Gere e gerencie contratos com assinatura digital.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <p className="text-zinc-500 text-xs uppercase tracking-wider">Contratos Gerados</p>
          <p className="text-3xl font-bold text-white mt-1">{contracts.length}</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <p className="text-zinc-500 text-xs uppercase tracking-wider">Assinados</p>
          <p className="text-3xl font-bold text-emerald-400 mt-1">{contracts.filter((c) => c.signedAt).length}</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <p className="text-zinc-500 text-xs uppercase tracking-wider">Aguardando Contrato</p>
          <p className="text-3xl font-bold text-amber-400 mt-1">{reservationsWithoutContract.length}</p>
        </div>
      </div>

      {/* Generate contracts for reservations without one */}
      {reservationsWithoutContract.length > 0 && (
        <div className="bg-amber-900/20 border border-amber-500/30 rounded-xl p-6">
          <h3 className="text-amber-400 font-semibold mb-4 flex items-center gap-2">
            <FilePlus className="w-5 h-5" />
            Reservas sem Contrato
          </h3>
          <div className="space-y-3">
            {reservationsWithoutContract.map((r: ReservationType) => (
              <div key={r.id} className="flex items-center justify-between bg-zinc-900/50 rounded-lg p-4 border border-zinc-800">
                <div>
                  <p className="text-white font-medium">{r.customer.user.name} — {r.vehicle.brand} {r.vehicle.model}</p>
                  <p className="text-zinc-400 text-sm">{fmtDate(r.startDate)} → {fmtDate(r.endDate)} • {formatCurrency(Number(r.totalValue))}</p>
                </div>
                <GenerateContractButton reservationId={r.id} />
              </div>
            ))}
          </div>
        </div>
      )}

      <ContractManager contracts={contracts as any} />
    </div>
  )
}
