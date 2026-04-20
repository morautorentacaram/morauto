import { getReservations } from "@/app/actions/reservation.actions"
type ReservationType = Awaited<ReturnType<typeof getReservations>>[0]
import { getCustomers } from "@/app/actions/customer.actions"
import { getAvailableVehicles } from "@/app/actions/vehicle.actions"
import { formatCurrency } from "@/lib/utils"
import StatusSelector from "@/components/admin/StatusSelector"
import ReservationNewButton from "@/components/admin/ReservationNewButton"
import ReservationActions from "@/components/admin/ReservationActions"
import ReservationSearch from "@/components/admin/ReservationSearch"
import GenerateContractInline from "@/components/admin/GenerateContractInline"
import Link from "next/link"
import {
  CalendarDays, Car, FileText,
  DollarSign, AlertCircle,
} from "lucide-react"

export const dynamic = "force-dynamic"
export const metadata = { title: "Reservas — Morauto Admin" }

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  PENDING:   { label: "Pendente",   color: "text-amber-400 bg-amber-400/10 border-amber-400/20" },
  CONFIRMED: { label: "Confirmada", color: "text-blue-400 bg-blue-400/10 border-blue-400/20" },
  ACTIVE:    { label: "Ativa",      color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" },
  COMPLETED: { label: "Concluída",  color: "text-purple-400 bg-purple-400/10 border-purple-400/20" },
  CANCELLED: { label: "Cancelada",  color: "text-red-400 bg-red-400/10 border-red-400/20" },
}

export default async function ReservationsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>
}) {
  const { q = "", status = "" } = await searchParams

  const [reservations, customers, vehicles] = await Promise.all([
    getReservations({ search: q, status }),
    getCustomers(),
    getAvailableVehicles(),
  ])

  const pending   = reservations.filter((r: ReservationType) => r.status === "PENDING").length
  const confirmed = reservations.filter((r: ReservationType) => r.status === "CONFIRMED").length
  const active    = reservations.filter((r: ReservationType) => r.status === "ACTIVE").length
  const totalRevenue = reservations
    .filter((r: ReservationType) => r.status === "COMPLETED")
    .reduce((acc: number, r: ReservationType) => acc + Number(r.totalValue), 0)

  const today = new Date()
  const overdueCount = reservations.filter(
    (r: ReservationType) => r.status === "ACTIVE" && new Date(r.endDate) < today
  ).length

  return (
    <div className="space-y-8 p-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-3xl font-outfit font-bold text-white tracking-tight">Reservas e Locações</h2>
          <p className="text-zinc-400 mt-2">Crie, edite e gerencie todas as locações da frota.</p>
        </div>
        <ReservationNewButton customers={customers} vehicles={vehicles} />
      </div>

      {/* Search + filters */}
      <ReservationSearch currentSearch={q} currentStatus={status} />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
          <p className="text-zinc-500 text-xs uppercase tracking-wider">Total</p>
          <p className="text-3xl font-bold text-white mt-1">{reservations.length}</p>
        </div>
        <div className="bg-zinc-900 border border-amber-900/30 rounded-xl p-4 text-center">
          <p className="text-zinc-500 text-xs uppercase tracking-wider">Pendentes</p>
          <p className="text-3xl font-bold text-amber-400 mt-1">{pending}</p>
        </div>
        <div className="bg-zinc-900 border border-blue-900/30 rounded-xl p-4 text-center">
          <p className="text-zinc-500 text-xs uppercase tracking-wider">Confirmadas</p>
          <p className="text-3xl font-bold text-blue-400 mt-1">{confirmed}</p>
        </div>
        <div className="bg-zinc-900 border border-emerald-900/30 rounded-xl p-4 text-center">
          <p className="text-zinc-500 text-xs uppercase tracking-wider">Ativas</p>
          <p className="text-3xl font-bold text-emerald-400 mt-1">{active}</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
          <p className="text-zinc-500 text-xs uppercase tracking-wider">Faturado</p>
          <p className="text-xl font-bold text-[#d4a017] mt-1">{formatCurrency(totalRevenue)}</p>
        </div>
      </div>

      {overdueCount > 0 && (
        <div className="flex items-center gap-3 bg-red-900/20 border border-red-700/40 rounded-xl px-5 py-3 text-red-300 text-sm">
          <AlertCircle size={16} className="text-red-400 flex-shrink-0" />
          <span><strong>{overdueCount}</strong> locação{overdueCount > 1 ? "ões" : ""} com prazo de devolução vencido.</span>
        </div>
      )}

      {/* Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-950/50 border-b border-zinc-800 text-zinc-400 text-xs uppercase tracking-wider">
                <th className="px-5 py-3 font-medium">Cliente</th>
                <th className="px-5 py-3 font-medium">Veículo</th>
                <th className="px-5 py-3 font-medium">Período</th>
                <th className="px-5 py-3 font-medium">Valor</th>
                <th className="px-5 py-3 font-medium">Pgto</th>
                <th className="px-5 py-3 font-medium">Contrato</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {reservations.map((r: ReservationType) => {
                const payment   = (r as any).payments?.[0]
                const isOverdue = r.status === "ACTIVE" && new Date(r.endDate) < today
                const daysLeft  = Math.ceil((new Date(r.endDate).getTime() - today.getTime()) / 86400000)

                return (
                  <tr key={r.id} className={`hover:bg-zinc-800/30 transition-colors ${isOverdue ? "bg-red-950/10" : ""}`}>
                    {/* Cliente */}
                    <td className="px-5 py-4">
                      <Link href={`/admin/clientes/${r.customer.id}`} className="flex items-center gap-2 group/link">
                        <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-bold text-[#d4a017] flex-shrink-0">
                          {r.customer.user.name?.charAt(0).toUpperCase() ?? "?"}
                        </div>
                        <div>
                          <p className="text-white text-sm font-medium group-hover/link:text-[#d4a017] transition-colors">{r.customer.user.name}</p>
                          <p className="text-zinc-500 text-xs font-mono">{r.customer.document}</p>
                        </div>
                      </Link>
                    </td>

                    {/* Veículo */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <Car size={14} className="text-[#d4a017] flex-shrink-0" />
                        <div>
                          <p className="text-white text-sm font-medium">{r.vehicle.brand} {r.vehicle.model}</p>
                          <p className="text-zinc-500 text-xs">{r.vehicle.plate} · {r.vehicle.category.name}</p>
                        </div>
                      </div>
                    </td>

                    {/* Período */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5 text-zinc-300 text-sm">
                        <CalendarDays size={13} className="text-zinc-500 flex-shrink-0" />
                        <span>
                          {new Date(r.startDate).toLocaleDateString("pt-BR")}
                          <span className="text-zinc-600 mx-1">→</span>
                          {new Date(r.endDate).toLocaleDateString("pt-BR")}
                        </span>
                      </div>
                      {r.status === "ACTIVE" && (
                        <p className={`text-xs mt-0.5 ${isOverdue ? "text-red-400 font-semibold" : "text-zinc-500"}`}>
                          {isOverdue ? `${Math.abs(daysLeft)}d em atraso` : `${daysLeft}d restante${daysLeft !== 1 ? "s" : ""}`}
                        </p>
                      )}
                    </td>

                    {/* Valor */}
                    <td className="px-5 py-4 text-[#d4a017] font-bold text-sm whitespace-nowrap">
                      {formatCurrency(Number(r.totalValue))}
                    </td>

                    {/* Pagamento */}
                    <td className="px-5 py-4">
                      {payment ? (
                        <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full border ${
                          payment.status === "PAID"
                            ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/20"
                            : "text-amber-400 bg-amber-400/10 border-amber-400/20"
                        }`}>
                          <DollarSign size={10} />
                          {payment.status === "PAID" ? "Pago" : "Pendente"}
                        </span>
                      ) : <span className="text-zinc-600 text-xs">—</span>}
                    </td>

                    {/* Contrato */}
                    <td className="px-5 py-4">
                      {r.contract ? (
                        <Link href={`/admin/contratos/${r.contract.id}`}
                          className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 bg-blue-400/10 border border-blue-400/20 px-2 py-1 rounded-lg transition-colors">
                          <FileText size={11} /> {r.contract.number}
                        </Link>
                      ) : r.status !== "CANCELLED" ? (
                        <GenerateContractInline reservationId={r.id} />
                      ) : <span className="text-zinc-600 text-xs">—</span>}
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4">
                      <StatusSelector id={r.id} currentStatus={r.status} />
                    </td>

                    {/* Ações */}
                    <td className="px-5 py-4">
                      <ReservationActions reservation={r} />
                    </td>
                  </tr>
                )
              })}
              {reservations.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-zinc-500">
                    Nenhuma reserva registrada. Clique em "Nova Reserva" para começar.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
