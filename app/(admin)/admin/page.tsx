import { getDashboardMetrics } from "@/app/actions/reports.actions"
type DashMetrics = Awaited<ReturnType<typeof getDashboardMetrics>>
type RecentReservationType = DashMetrics["recentReservations"][0]
import { formatCurrency } from "@/lib/utils"
import Link from "next/link"
import {
  Car, Users, CalendarCheck2, Wrench, AlertTriangle,
  TrendingUp, TrendingDown, CheckCircle, Clock, DollarSign,
  ShieldOff, CalendarClock, ArrowRight, BarChart3,
} from "lucide-react"

export const dynamic = "force-dynamic"
export const metadata = { title: "Dashboard — Morauto Admin" }

export default async function AdminDashboardPage() {
  const m = await getDashboardMetrics()

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-outfit text-white">Dashboard</h1>
          <p className="text-zinc-500 text-sm mt-1">
            {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-zinc-400 text-sm">Tempo real</span>
        </div>
      </div>

      {/* Alerts bar */}
      {(m.overdueRentals > 0 || m.pendingFines > 0) && (
        <div className="flex flex-wrap gap-3">
          {m.overdueRentals > 0 && (
            <Link href="/admin/reservas" className="flex items-center gap-2 bg-red-900/20 border border-red-700/40 text-red-300 text-sm px-4 py-2 rounded-xl hover:bg-red-900/30 transition-colors">
              <CalendarClock size={14} /> {m.overdueRentals} locação{m.overdueRentals > 1 ? "ões" : ""} em atraso
            </Link>
          )}
          {m.pendingFines > 0 && (
            <Link href="/admin/multas" className="flex items-center gap-2 bg-amber-900/20 border border-amber-700/40 text-amber-300 text-sm px-4 py-2 rounded-xl hover:bg-amber-900/30 transition-colors">
              <AlertTriangle size={14} /> {m.pendingFines} multa{m.pendingFines > 1 ? "s" : ""} pendente{m.pendingFines > 1 ? "s" : ""}
            </Link>
          )}
          {m.scheduledMaintenance > 0 && (
            <Link href="/admin/manutencao" className="flex items-center gap-2 bg-orange-900/20 border border-orange-700/40 text-orange-300 text-sm px-4 py-2 rounded-xl hover:bg-orange-900/30 transition-colors">
              <Wrench size={14} /> {m.scheduledMaintenance} manutenção{m.scheduledMaintenance > 1 ? "ões" : ""} em aberto
            </Link>
          )}
        </div>
      )}

      {/* Main KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Receita do Mês"
          value={formatCurrency(m.monthlyRevenue)}
          sub={m.revenueGrowth >= 0
            ? `+${m.revenueGrowth}% vs. mês anterior`
            : `${m.revenueGrowth}% vs. mês anterior`}
          icon={<DollarSign size={20} />}
          accent="gold"
          trend={m.revenueGrowth >= 0 ? "up" : "down"}
        />
        <KpiCard
          title="Locações Ativas"
          value={String(m.activeRentals)}
          sub={`${m.pendingReservations} pendentes de confirmação`}
          icon={<CalendarCheck2 size={20} />}
          accent="blue"
        />
        <KpiCard
          title="Taxa de Ocupação"
          value={`${m.occupancyRate}%`}
          sub={`${m.availableVehicles} de ${m.totalVehicles} disponíveis`}
          icon={<Car size={20} />}
          accent="emerald"
        />
        <KpiCard
          title="Total de Clientes"
          value={String(m.totalCustomers)}
          sub={`${m.blockedCustomers} bloqueado${m.blockedCustomers !== 1 ? "s" : ""}`}
          icon={<Users size={20} />}
          accent="purple"
        />
      </div>

      {/* Secondary row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MiniCard label="Ticket Médio"       value={formatCurrency(m.avgTicket)}           color="text-[#d4a017]" />
        <MiniCard label="Receita Total"       value={formatCurrency(m.totalRevenue)}         color="text-emerald-400" />
        <MiniCard label="Locações Concluídas" value={String(m.completedReservations)}        color="text-blue-400" />
        <MiniCard label="Locações em Atraso"  value={String(m.overdueRentals)}               color={m.overdueRentals > 0 ? "text-red-400" : "text-zinc-400"} />
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { href: "/admin/reservas",  label: "Nova Reserva",    icon: <CalendarCheck2 size={16} />, color: "border-blue-700/40 hover:border-blue-500/60" },
          { href: "/admin/clientes",  label: "Novo Cliente",    icon: <Users size={16} />,           color: "border-zinc-700 hover:border-zinc-500" },
          { href: "/admin/veiculos",  label: "Cadastrar Veículo", icon: <Car size={16} />,           color: "border-zinc-700 hover:border-zinc-500" },
          { href: "/admin/relatorios",label: "Ver Relatórios",  icon: <BarChart3 size={16} />,       color: "border-[#d4a017]/40 hover:border-[#d4a017]/70" },
        ].map((a) => (
          <Link key={a.href} href={a.href}
            className={`flex items-center justify-between bg-zinc-900 border ${a.color} rounded-xl px-4 py-3 text-sm text-white transition-all group`}>
            <span className="flex items-center gap-2 text-zinc-400 group-hover:text-white">{a.icon} {a.label}</span>
            <ArrowRight size={14} className="text-zinc-600 group-hover:text-white" />
          </Link>
        ))}
      </div>

      {/* Activity + Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent reservations */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-white font-semibold">Reservas Recentes</h3>
            <Link href="/admin/reservas" className="text-[#d4a017] text-xs hover:underline">Ver todas</Link>
          </div>
          <div className="space-y-3">
            {m.recentReservations.length === 0 ? (
              <p className="text-zinc-500 text-sm">Nenhuma reserva.</p>
            ) : (
              m.recentReservations.map((r: RecentReservationType) => {
                const statusColor =
                  r.status === "ACTIVE"     ? "bg-emerald-400" :
                  r.status === "CONFIRMED"  ? "bg-blue-400" :
                  r.status === "COMPLETED"  ? "bg-purple-400" :
                  r.status === "CANCELLED"  ? "bg-red-400" : "bg-amber-400"
                const statusLabel =
                  r.status === "ACTIVE"     ? "Ativa" :
                  r.status === "CONFIRMED"  ? "Confirmada" :
                  r.status === "COMPLETED"  ? "Concluída" :
                  r.status === "CANCELLED"  ? "Cancelada" : "Pendente"
                return (
                  <div key={r.id} className="flex items-center justify-between py-2.5 border-b border-zinc-800 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${statusColor}`} />
                      <div>
                        <p className="text-white text-sm font-medium leading-tight">{r.customer.user.name}</p>
                        <p className="text-zinc-500 text-xs">{r.vehicle.brand} {r.vehicle.model}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${statusColor.replace("bg-", "text-").replace("400", "400")} bg-transparent border-current/30`}>
                        {statusLabel}
                      </span>
                      <p className="text-zinc-600 text-xs mt-0.5">{new Date(r.createdAt).toLocaleDateString("pt-BR")}</p>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Fleet + alerts */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-white font-semibold flex items-center gap-2">
              Alertas da Frota
              {(m.scheduledMaintenance + m.pendingFines + m.overdueRentals) > 0 && (
                <span className="w-5 h-5 bg-red-500 rounded-full text-xs text-white inline-flex items-center justify-center">
                  {m.scheduledMaintenance + m.pendingFines + m.overdueRentals}
                </span>
              )}
            </h3>
            <Link href="/admin/manutencao" className="text-zinc-500 text-xs hover:text-white">Ver manutenções</Link>
          </div>
          <div className="space-y-3">
            {m.overdueRentals > 0 && (
              <AlertRow icon={<CalendarClock size={14} />} color="text-red-400 bg-red-400/10 border-red-400/20"
                text={`${m.overdueRentals} locação${m.overdueRentals > 1 ? "ões" : ""} com devolução em atraso`} />
            )}
            {m.pendingFines > 0 && (
              <AlertRow icon={<AlertTriangle size={14} />} color="text-amber-400 bg-amber-400/10 border-amber-400/20"
                text={`${m.pendingFines} multa${m.pendingFines > 1 ? "s" : ""} aguardando resolução`} />
            )}
            {m.blockedCustomers > 0 && (
              <AlertRow icon={<ShieldOff size={14} />} color="text-red-400 bg-red-400/10 border-red-400/20"
                text={`${m.blockedCustomers} cliente${m.blockedCustomers > 1 ? "s" : ""} bloqueado${m.blockedCustomers > 1 ? "s" : ""}`} />
            )}
            {(m.fleetAlerts as any[]).map((mnt) => (
              <AlertRow key={mnt.id} icon={<Wrench size={14} />} color="text-orange-400 bg-orange-400/10 border-orange-400/20"
                text={`${mnt.vehicle?.brand} ${mnt.vehicle?.model} — ${mnt.description}`} />
            ))}
            {m.scheduledMaintenance === 0 && m.pendingFines === 0 && m.overdueRentals === 0 && m.blockedCustomers === 0 && (
              <div className="flex items-center gap-2 text-emerald-400 text-sm">
                <CheckCircle size={16} /> Frota sem alertas
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function KpiCard({ title, value, sub, icon, accent, trend }: {
  title: string; value: string; sub: string; icon: React.ReactNode
  accent: "gold" | "blue" | "emerald" | "purple"; trend?: "up" | "down"
}) {
  const colors = {
    gold:    { bg: "bg-[#d4a017]/10 border-[#d4a017]/20", icon: "text-[#d4a017]", value: "text-[#d4a017]" },
    blue:    { bg: "bg-blue-500/10 border-blue-500/20",   icon: "text-blue-400",   value: "text-white" },
    emerald: { bg: "bg-emerald-500/10 border-emerald-500/20", icon: "text-emerald-400", value: "text-white" },
    purple:  { bg: "bg-purple-500/10 border-purple-500/20",   icon: "text-purple-400",  value: "text-white" },
  }
  const c = colors[accent]
  return (
    <div className={`bg-zinc-900 border ${c.bg} rounded-2xl p-5`}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-zinc-400 text-xs uppercase tracking-wider font-medium">{title}</p>
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${c.bg} ${c.icon}`}>{icon}</div>
      </div>
      <p className={`text-3xl font-black font-outfit ${c.value}`}>{value}</p>
      <p className="text-zinc-500 text-xs mt-2 flex items-center gap-1">
        {trend === "up" && <TrendingUp size={11} className="text-emerald-400" />}
        {trend === "down" && <TrendingDown size={11} className="text-red-400" />}
        {sub}
      </p>
    </div>
  )
}

function MiniCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
      <p className="text-zinc-500 text-xs uppercase tracking-wider">{label}</p>
      <p className={`text-xl font-bold mt-1 ${color}`}>{value}</p>
    </div>
  )
}

function AlertRow({ icon, color, text }: { icon: React.ReactNode; color: string; text: string }) {
  return (
    <div className={`flex items-center gap-2 text-sm px-3 py-2 rounded-lg border ${color}`}>
      {icon} <span>{text}</span>
    </div>
  )
}
