import { getDashboardMetrics, getFleetReport, getRevenueByCategory, getOccupancyByMonth } from "@/app/actions/reports.actions"
import { formatCurrency } from "@/lib/utils"
import { BarChart3, TrendingUp, Car, Activity } from "lucide-react"

export const dynamic = "force-dynamic"
export const metadata = { title: "Relatórios — Morauto Admin" }

export default async function ReportsPage() {
  const [metrics, fleetReport, revenueByCategory, occupancyByMonth] = await Promise.all([
    getDashboardMetrics(),
    getFleetReport(),
    getRevenueByCategory(),
    getOccupancyByMonth(),
  ])

  const maxRevenue = Math.max(...revenueByCategory.map((c) => c.revenue), 1)
  const maxOccupancy = Math.max(...occupancyByMonth.map((m) => m.reservations), 1)

  return (
    <div className="space-y-8 p-6">
      <div>
        <h2 className="text-3xl font-outfit font-bold text-white tracking-tight">Relatórios e BI</h2>
        <p className="text-zinc-400 mt-2">Análise operacional e financeira da locadora.</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <p className="text-zinc-500 text-xs uppercase tracking-wider">Taxa Ocupação</p>
          <p className="text-4xl font-black text-[#d4a017] mt-1">{metrics.occupancyRate}%</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <p className="text-zinc-500 text-xs uppercase tracking-wider">Receita do Mês</p>
          <p className="text-2xl font-black text-emerald-400 mt-1">{formatCurrency(metrics.monthlyRevenue)}</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <p className="text-zinc-500 text-xs uppercase tracking-wider">Locações Ativas</p>
          <p className="text-4xl font-black text-blue-400 mt-1">{metrics.activeRentals}</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <p className="text-zinc-500 text-xs uppercase tracking-wider">Frota Total</p>
          <p className="text-4xl font-black text-white mt-1">{metrics.totalVehicles}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue by Category */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="w-5 h-5 text-[#d4a017]" />
            <h3 className="text-white font-semibold">Receita por Categoria</h3>
          </div>
          <div className="space-y-4">
            {revenueByCategory.length === 0 ? (
              <p className="text-zinc-500 text-sm">Sem dados de receita.</p>
            ) : (
              revenueByCategory.map((cat) => (
                <div key={cat.name}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-zinc-300">{cat.name}</span>
                    <span className="text-[#d4a017] font-bold">{formatCurrency(cat.revenue)}</span>
                  </div>
                  <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#d4a017] to-amber-600 rounded-full transition-all"
                      style={{ width: `${(cat.revenue / maxRevenue) * 100}%` }}
                    />
                  </div>
                  <p className="text-zinc-600 text-xs mt-0.5">{cat.vehicles} veículo(s)</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Occupancy by Month */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <Activity className="w-5 h-5 text-blue-400" />
            <h3 className="text-white font-semibold">Reservas Últimos 6 Meses</h3>
          </div>
          <div className="flex items-end gap-3 h-32">
            {occupancyByMonth.map((m) => (
              <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs text-zinc-500">{m.reservations}</span>
                <div
                  className="w-full bg-blue-500/20 border border-blue-500/30 rounded-t"
                  style={{ height: `${Math.max((m.reservations / maxOccupancy) * 100, 4)}%` }}
                />
                <span className="text-xs text-zinc-500 text-center leading-tight">{m.month}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Fleet Report */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Car className="w-5 h-5 text-zinc-400" />
          <h3 className="text-white font-semibold">Desempenho por Veículo</h3>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-950/50 border-b border-zinc-800 text-zinc-400 text-sm">
                  <th className="px-6 py-4 font-medium uppercase tracking-wider">Veículo</th>
                  <th className="px-6 py-4 font-medium uppercase tracking-wider">Categoria</th>
                  <th className="px-6 py-4 font-medium uppercase tracking-wider">Reservas</th>
                  <th className="px-6 py-4 font-medium uppercase tracking-wider">Manutenções</th>
                  <th className="px-6 py-4 font-medium uppercase tracking-wider">Custo Manutenção</th>
                  <th className="px-6 py-4 font-medium uppercase tracking-wider">Multas</th>
                  <th className="px-6 py-4 font-medium uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {fleetReport.map((v) => (
                  <tr key={v.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-white font-medium text-sm">{v.brand} {v.model}</div>
                      <div className="text-zinc-500 text-xs">{v.plate} • {v.year}</div>
                    </td>
                    <td className="px-6 py-4 text-zinc-400 text-sm">{v.category.name}</td>
                    <td className="px-6 py-4 text-white font-bold">{v.totalReservations}</td>
                    <td className="px-6 py-4 text-zinc-300 text-sm">{v._count.maintenances}</td>
                    <td className="px-6 py-4 text-orange-400 text-sm font-medium">{formatCurrency(v.totalMaintenanceCost)}</td>
                    <td className="px-6 py-4 text-red-400 text-sm font-medium">{v._count.fines}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold border ${
                        v.status === "AVAILABLE" ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" :
                        v.status === "RENTED" ? "text-blue-400 bg-blue-400/10 border-blue-400/20" :
                        v.status === "MAINTENANCE" ? "text-orange-400 bg-orange-400/10 border-orange-400/20" :
                        "text-zinc-400 bg-zinc-400/10 border-zinc-400/20"
                      }`}>
                        {v.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Financial by Method */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-zinc-400" />
            <p className="text-zinc-400 text-xs uppercase tracking-wider">Frota Disponível</p>
          </div>
          <p className="text-3xl font-bold text-white">{metrics.availableVehicles}</p>
          <p className="text-zinc-500 text-xs mt-1">de {metrics.totalVehicles} veículos</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <p className="text-zinc-400 text-xs uppercase tracking-wider mb-3">Multas Pendentes</p>
          <p className="text-3xl font-bold text-red-400">{metrics.pendingFines}</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <p className="text-zinc-400 text-xs uppercase tracking-wider mb-3">Manutenções Abertas</p>
          <p className="text-3xl font-bold text-orange-400">{metrics.scheduledMaintenance}</p>
        </div>
      </div>
    </div>
  )
}
