import { getDashboardMetrics } from "@/app/actions/reports.actions"
import { formatCurrency } from "@/lib/utils"
import {
  Car, Users, CalendarSync, Wrench,
  AlertTriangle, TrendingUp, CheckCircle, Clock
} from "lucide-react"

export const dynamic = "force-dynamic"
export const metadata = { title: "Dashboard — Morauto Admin" }

export default async function AdminDashboardPage() {
  const metrics = await getDashboardMetrics()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold font-outfit text-white">Dashboard Geral</h1>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-zinc-400 text-sm">Dados em tempo real</span>
        </div>
      </div>

      {/* Main KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total de Veículos"
          value={String(metrics.totalVehicles)}
          icon={<Car size={24} />}
          trend={`${metrics.availableVehicles} disponíveis`}
          trendColor="text-emerald-400"
        />
        <StatCard
          title="Locações Ativas"
          value={String(metrics.activeRentals)}
          icon={<CalendarSync size={24} />}
          trend={`${metrics.pendingReservations} pendentes`}
          trendColor="text-amber-400"
        />
        <StatCard
          title="Total de Clientes"
          value={String(metrics.totalCustomers)}
          icon={<Users size={24} />}
          trend="Cadastros ativos"
          trendColor="text-blue-400"
        />
        <StatCard
          title="Receita do Mês"
          value={formatCurrency(metrics.monthlyRevenue)}
          icon={<TrendingUp size={24} />}
          trend={`${metrics.occupancyRate}% de ocupação`}
          trendColor="text-[#d4a017]"
          isLarge
        />
      </div>

      {/* Secondary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-black/30 border border-white/5 p-4 rounded-xl flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center flex-shrink-0">
            <Wrench className="w-4 h-4 text-orange-400" />
          </div>
          <div>
            <p className="text-zinc-500 text-xs">Manutenções</p>
            <p className="text-white font-bold">{metrics.scheduledMaintenance} abertas</p>
          </div>
        </div>
        <div className="bg-black/30 border border-white/5 p-4 rounded-xl flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-4 h-4 text-red-400" />
          </div>
          <div>
            <p className="text-zinc-500 text-xs">Multas</p>
            <p className="text-white font-bold">{metrics.pendingFines} pendentes</p>
          </div>
        </div>
        <div className="bg-black/30 border border-white/5 p-4 rounded-xl flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <p className="text-zinc-500 text-xs">Disponíveis</p>
            <p className="text-white font-bold">{metrics.availableVehicles} veículos</p>
          </div>
        </div>
        <div className="bg-black/30 border border-white/5 p-4 rounded-xl flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center flex-shrink-0">
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <p className="text-zinc-500 text-xs">Pendentes</p>
            <p className="text-white font-bold">{metrics.pendingReservations} reservas</p>
          </div>
        </div>
      </div>

      {/* Activity + Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-black/30 border border-white/5 p-6 rounded-2xl">
          <h3 className="text-xl font-bold text-white mb-4">Reservas Recentes</h3>
          <div className="space-y-4">
            {metrics.recentReservations.length === 0 ? (
              <p className="text-zinc-500 text-sm">Nenhuma reserva recente.</p>
            ) : (
              metrics.recentReservations.map((r) => (
                <ActivityItem
                  key={r.id}
                  text={`${r.customer.user.name} — ${r.vehicle.brand} ${r.vehicle.model}`}
                  time={new Date(r.createdAt).toLocaleDateString("pt-BR")}
                  status={r.status}
                />
              ))
            )}
          </div>
        </div>
        <div className="bg-black/30 border border-white/5 p-6 rounded-2xl">
          <h3 className="text-xl font-bold text-white mb-4">
            Alertas da Frota
            {(metrics.scheduledMaintenance > 0 || metrics.pendingFines > 0) && (
              <span className="ml-2 w-5 h-5 bg-red-500 rounded-full text-xs text-white inline-flex items-center justify-center">
                {metrics.scheduledMaintenance + metrics.pendingFines}
              </span>
            )}
          </h3>
          <div className="space-y-4">
            {metrics.fleetAlerts.length === 0 && metrics.pendingFines === 0 ? (
              <div className="flex items-center gap-2 text-emerald-400">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm">Frota sem alertas</span>
              </div>
            ) : (
              <>
                {(metrics.fleetAlerts as any[]).map((m) => (
                  <ActivityItem
                    key={m.id}
                    text={`${m.vehicle?.brand ?? ""} ${m.vehicle?.model ?? ""} — ${m.description}`}
                    time={new Date(m.date).toLocaleDateString("pt-BR")}
                    alert
                  />
                ))}
                {metrics.pendingFines > 0 && (
                  <ActivityItem
                    text={`${metrics.pendingFines} multa(s) pendentes de resolução`}
                    time="Multas"
                    alert
                  />
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({
  title, value, icon, trend, trendColor = "text-[#d4a017]", isLarge = false
}: {
  title: string; value: string; icon: React.ReactNode; trend: string; trendColor?: string; isLarge?: boolean
}) {
  return (
    <div className="bg-black/30 border border-white/5 p-6 rounded-2xl flex flex-col relative overflow-hidden group hover:border-white/10 transition-colors">
      <div className="absolute top-0 right-0 p-6 text-zinc-700 group-hover:text-[#d4a017]/30 transition-colors">
        {icon}
      </div>
      <span className="text-zinc-400 text-sm font-medium uppercase tracking-wider mb-2">{title}</span>
      <span className={`font-black text-white font-outfit mb-4 ${isLarge ? "text-2xl" : "text-4xl"}`}>{value}</span>
      <span className={`text-xs font-semibold ${trendColor}`}>{trend}</span>
    </div>
  )
}

function ActivityItem({
  text, time, alert = false, status
}: {
  text: string; time: string; alert?: boolean; status?: string
}) {
  const dotColor = alert
    ? "bg-red-500"
    : status === "ACTIVE" ? "bg-emerald-400"
    : status === "CONFIRMED" ? "bg-blue-400"
    : "bg-[#d4a017]"

  return (
    <div className="flex items-start justify-between pb-4 border-b border-white/5 last:border-0 last:pb-0">
      <div className="flex items-start gap-3">
        <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${dotColor}`} />
        <span className="text-zinc-300 font-light text-sm leading-tight">{text}</span>
      </div>
      <span className="text-xs text-zinc-500 ml-2 flex-shrink-0">{time}</span>
    </div>
  )
}
