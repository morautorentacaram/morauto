import {
  getDashboardMetrics, getFleetReport, getRevenueByCategory,
  getOccupancyByMonth, getMonthlyRevenue12, getPaymentMethodStats,
  getTopCustomers, getMaintenanceSummary, getFinesSummary, getReservationStats,
  getDREData, getRevenueVsCostByMonth, getDailyRevenue30,
  type DateRange,
} from "@/app/actions/reports.actions"
import { formatCurrency } from "@/lib/utils"
import ReportPdfButton from "@/components/admin/ReportPdfButton"
import ReportPeriodFilter from "@/components/admin/ReportPeriodFilter"
import Link from "next/link"
import {
  BarChart3, TrendingUp, TrendingDown, Car, Activity, DollarSign,
  Users, Receipt, Wrench, AlertTriangle, CreditCard,
  CalendarCheck2, Star, ShieldOff, ArrowUpRight, Minus,
  CircleDollarSign, PiggyBank, BadgePercent, TriangleAlert,
  ClockAlert, Flame, Wallet,
} from "lucide-react"

export const dynamic = "force-dynamic"
export const metadata = { title: "Relatórios — Morauto Admin" }

// ── Period resolver ──────────────────────────────────────────────────────────
function resolveRange(period: string, start?: string, end?: string): DateRange | undefined {
  const now = new Date()
  const y = now.getFullYear()
  const m = now.getMonth()
  switch (period) {
    case "this_month":    return { start: new Date(y, m, 1),     end: new Date(y, m + 1, 0, 23, 59, 59) }
    case "last_month":    return { start: new Date(y, m - 1, 1), end: new Date(y, m, 0, 23, 59, 59) }
    case "last_3_months": return { start: new Date(y, m - 2, 1), end: new Date(y, m + 1, 0, 23, 59, 59) }
    case "last_6_months": return { start: new Date(y, m - 5, 1), end: new Date(y, m + 1, 0, 23, 59, 59) }
    case "this_year":     return { start: new Date(y, 0, 1),     end: new Date(y, 11, 31, 23, 59, 59) }
    case "last_year":     return { start: new Date(y - 1, 0, 1), end: new Date(y - 1, 11, 31, 23, 59, 59) }
    case "custom":
      if (start && end) return { start: new Date(start), end: new Date(end + "T23:59:59") }
      return undefined
    default: return undefined
  }
}

function periodLabel(period: string, start?: string, end?: string): string {
  const LABELS: Record<string, string> = {
    this_month: "Este mês", last_month: "Mês passado", last_3_months: "Últimos 3 meses",
    last_6_months: "Últimos 6 meses", this_year: "Este ano", last_year: "Ano passado",
    all: "Todo o período",
  }
  if (period === "custom" && start && end)
    return `${new Date(start).toLocaleDateString("pt-BR")} — ${new Date(end).toLocaleDateString("pt-BR")}`
  return LABELS[period] ?? "Todo o período"
}

const METHOD_LABEL: Record<string, string> = {
  PIX: "PIX", CREDIT_CARD: "Cartão de Crédito", DEBIT_CARD: "Cartão de Débito",
  CASH: "Dinheiro", BANK_TRANSFER: "Transferência",
}
const METHOD_COLOR: Record<string, string> = {
  PIX: "bg-emerald-500", CREDIT_CARD: "bg-blue-500", DEBIT_CARD: "bg-purple-500",
  CASH: "bg-amber-500", BANK_TRANSFER: "bg-cyan-500",
}
const STATUS_LABEL: Record<string, string> = {
  PENDING: "Pendente", CONFIRMED: "Confirmada", ACTIVE: "Ativa",
  COMPLETED: "Concluída", CANCELLED: "Cancelada",
}
const STATUS_COLOR: Record<string, string> = {
  PENDING: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  CONFIRMED: "text-blue-400 bg-blue-400/10 border-blue-400/20",
  ACTIVE: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  COMPLETED: "text-purple-400 bg-purple-400/10 border-purple-400/20",
  CANCELLED: "text-red-400 bg-red-400/10 border-red-400/20",
}
const STATUS_BAR: Record<string, string> = {
  PENDING: "bg-amber-400", CONFIRMED: "bg-blue-400", ACTIVE: "bg-emerald-400",
  COMPLETED: "bg-purple-400", CANCELLED: "bg-red-400",
}
const MAINT_STATUS: Record<string, string> = {
  SCHEDULED: "Agendada", IN_PROGRESS: "Em Andamento", COMPLETED: "Concluída", CANCELLED: "Cancelada",
}
const FINE_STATUS_LABEL: Record<string, string> = {
  PENDING: "Pendente", PAID: "Paga", APPEAL: "Recurso", CHARGED_CLIENT: "Cobrada", SETTLED: "Quitada",
}
const FINE_STATUS_COLOR: Record<string, string> = {
  PENDING: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  PAID: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  SETTLED: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  APPEAL: "text-blue-400 bg-blue-400/10 border-blue-400/20",
  CHARGED_CLIENT: "text-purple-400 bg-purple-400/10 border-purple-400/20",
}

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string; start?: string; end?: string }>
}) {
  const { period = "this_month", start = "", end = "" } = await searchParams
  const range = resolveRange(period, start, end)

  const [
    metrics, fleetReport, revenueByCategory, occupancyByMonth,
    monthlyRevenue12, paymentMethods, topCustomers,
    maintenanceSummary, finesSummary, reservationStats,
    dre, revVsCost, daily30,
  ] = await Promise.all([
    getDashboardMetrics(range), getFleetReport(), getRevenueByCategory(range),
    getOccupancyByMonth(), getMonthlyRevenue12(), getPaymentMethodStats(range),
    getTopCustomers(10, range), getMaintenanceSummary(range), getFinesSummary(range),
    getReservationStats(range), getDREData(range), getRevenueVsCostByMonth(),
    getDailyRevenue30(),
  ])

  const maxRevCat       = Math.max(...revenueByCategory.map((c) => c.revenue), 1)
  const maxRev12        = Math.max(...monthlyRevenue12.map((m) => m.revenue), 1)
  const maxOcc          = Math.max(...occupancyByMonth.map((m) => m.reservations), 1)
  const totalResv       = reservationStats.total || 1
  const totalPayRev     = paymentMethods.reduce((a, m) => a + m.total, 0) || 1
  const maxRevVsCost    = Math.max(...revVsCost.map((m) => Math.max(m.revenue, m.cost)), 1)
  const maxDaily        = Math.max(...daily30.map((d) => d.revenue), 1)

  // Financial health score (0–100)
  const healthScore = Math.min(100, Math.round(
    (dre.margin >= 0 ? Math.min(dre.margin, 60) : 0) +
    (metrics.occupancyRate >= 50 ? 20 : metrics.occupancyRate / 2.5) +
    (metrics.overdueRentals === 0 ? 10 : Math.max(0, 10 - metrics.overdueRentals * 2)) +
    (dre.cancellationRate < 10 ? 10 : Math.max(0, 10 - dre.cancellationRate))
  ))
  const healthLabel = healthScore >= 80 ? "Excelente" : healthScore >= 60 ? "Bom" : healthScore >= 40 ? "Atenção" : "Crítico"
  const healthColor = healthScore >= 80 ? "text-emerald-400" : healthScore >= 60 ? "text-[#d4a017]" : healthScore >= 40 ? "text-orange-400" : "text-red-400"
  const healthBorder = healthScore >= 80 ? "border-emerald-500/30" : healthScore >= 60 ? "border-[#d4a017]/30" : healthScore >= 40 ? "border-orange-500/30" : "border-red-500/30"
  const healthBg = healthScore >= 80 ? "from-emerald-950/40" : healthScore >= 60 ? "from-amber-950/40" : healthScore >= 40 ? "from-orange-950/40" : "from-red-950/40"

  const totalRev12 = monthlyRevenue12.reduce((a, m) => a + m.revenue, 0)
  const avgMonthly = totalRev12 / 12

  return (
    <div className="space-y-8 p-6 pb-12">

      {/* ── HEADER ── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-3xl font-outfit font-bold text-white tracking-tight">Relatórios Financeiros</h2>
          <p className="text-zinc-400 mt-1">
            Período: <span className="text-[#d4a017] font-medium">{periodLabel(period, start, end)}</span>
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <ReportPeriodFilter currentPreset={period} currentStart={start} currentEnd={end} />
          <ReportPdfButton metrics={metrics} fleetReport={fleetReport}
            revenueByCategory={revenueByCategory} occupancyByMonth={occupancyByMonth} />
        </div>
      </div>

      {/* ── SAÚDE FINANCEIRA + DRE ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

        {/* Health Score */}
        <div className={`bg-gradient-to-br ${healthBg} to-zinc-900 border ${healthBorder} rounded-2xl p-6 flex flex-col justify-between`}>
          <div className="flex items-center justify-between mb-4">
            <p className="text-zinc-400 text-xs uppercase tracking-wider font-bold">Saúde Financeira</p>
            <Flame size={16} className={healthColor} />
          </div>
          <div>
            <div className="flex items-end gap-3 mb-3">
              <span className={`text-6xl font-black font-outfit ${healthColor}`}>{healthScore}</span>
              <span className="text-zinc-500 text-lg mb-1">/100</span>
            </div>
            <p className={`text-sm font-bold ${healthColor} mb-4`}>{healthLabel}</p>
            <div className="h-2.5 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  healthScore >= 80 ? "bg-emerald-400" : healthScore >= 60 ? "bg-[#d4a017]" : healthScore >= 40 ? "bg-orange-400" : "bg-red-400"
                }`}
                style={{ width: `${healthScore}%` }}
              />
            </div>
            <div className="mt-4 space-y-1.5 text-xs text-zinc-500">
              <div className="flex justify-between">
                <span>Margem líquida</span>
                <span className={dre.margin >= 0 ? "text-emerald-400 font-bold" : "text-red-400 font-bold"}>{dre.margin.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span>Taxa de ocupação</span>
                <span className="text-white font-bold">{metrics.occupancyRate}%</span>
              </div>
              <div className="flex justify-between">
                <span>Atrasos na devolução</span>
                <span className={metrics.overdueRentals > 0 ? "text-red-400 font-bold" : "text-emerald-400 font-bold"}>{metrics.overdueRentals}</span>
              </div>
              <div className="flex justify-between">
                <span>Taxa de cancelamento</span>
                <span className={dre.cancellationRate > 10 ? "text-red-400 font-bold" : "text-zinc-300 font-bold"}>{dre.cancellationRate.toFixed(1)}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* DRE */}
        <div className="xl:col-span-2 bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-white font-bold text-sm uppercase tracking-wider">Demonstrativo de Resultado (DRE)</h3>
            <span className="text-zinc-500 text-xs">{periodLabel(period, start, end)}</span>
          </div>

          <div className="space-y-0">
            {/* Receita bruta */}
            <DRERow label="Receita Bruta (pagamentos confirmados)" value={dre.revenue} color="text-[#d4a017]" bold large />
            <div className="ml-4 space-y-0 border-l-2 border-zinc-800 pl-4 my-2">
              <DRERow label="Custo com Manutenções" value={-dre.maintCost} color="text-orange-400" />
              <DRERow label="Multas absorvidas pela empresa" value={-dre.netFinesCost} color="text-red-400"
                sub={dre.finesRec > 0 ? `(recuperado do cliente: ${formatCurrency(dre.finesRec)})` : undefined} />
              <DRERow label="Total de Custos Operacionais" value={-dre.totalCosts} color="text-red-400" bold />
            </div>
            <div className="h-px bg-zinc-700 my-3" />
            <DRERow
              label="Resultado Líquido"
              value={dre.netResult}
              color={dre.netResult >= 0 ? "text-emerald-400" : "text-red-400"}
              bold large
              badge={`${dre.margin.toFixed(1)}% margem`}
              badgeColor={dre.margin >= 0 ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" : "text-red-400 bg-red-400/10 border-red-400/20"}
            />
          </div>

          <div className="mt-5 pt-4 border-t border-zinc-800 grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-zinc-500 text-xs uppercase tracking-wider">Recebimentos Pendentes</p>
              <p className="text-amber-400 font-bold text-lg mt-0.5">{formatCurrency(dre.pendingPayments.amount)}</p>
              <p className="text-zinc-600 text-xs">{dre.pendingPayments.count} transações</p>
            </div>
            <div>
              <p className="text-zinc-500 text-xs uppercase tracking-wider">Multas Totais</p>
              <p className="text-red-400 font-bold text-lg mt-0.5">{formatCurrency(dre.finesAmt)}</p>
              <p className="text-zinc-600 text-xs">{formatCurrency(dre.finesRec)} recuperado</p>
            </div>
            <div>
              <p className="text-zinc-500 text-xs uppercase tracking-wider">Estornos</p>
              <p className="text-zinc-300 font-bold text-lg mt-0.5">{formatCurrency(dre.refundedAmount)}</p>
              <p className="text-zinc-600 text-xs">no período</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── KPI CARDS ── */}
      <section>
        <SectionTitle icon={<DollarSign size={16} />} label="KPIs do Período" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            label="Receita do Período"
            value={formatCurrency(metrics.monthlyRevenue)}
            sub={metrics.revenueGrowth >= 0 ? `+${metrics.revenueGrowth}% vs. anterior` : `${metrics.revenueGrowth}% vs. anterior`}
            trend={metrics.revenueGrowth > 0 ? "up" : metrics.revenueGrowth < 0 ? "down" : "flat"}
            color="text-[#d4a017]"
            icon={<CircleDollarSign size={18} className="text-[#d4a017]/60" />}
          />
          <KpiCard
            label="Ticket Médio"
            value={formatCurrency(metrics.avgTicket)}
            sub={`${metrics.completedReservations} locações concluídas`}
            color="text-blue-400"
            icon={<Receipt size={18} className="text-blue-400/60" />}
          />
          <KpiCard
            label="Taxa de Ocupação"
            value={`${metrics.occupancyRate}%`}
            sub={`${metrics.availableVehicles} disponíveis / ${metrics.totalVehicles} total`}
            color={metrics.occupancyRate >= 70 ? "text-emerald-400" : metrics.occupancyRate >= 40 ? "text-[#d4a017]" : "text-red-400"}
            icon={<BadgePercent size={18} className="text-purple-400/60" />}
            progress={metrics.occupancyRate}
          />
          <KpiCard
            label="Clientes Ativos"
            value={String(metrics.totalCustomers)}
            sub={`${metrics.blockedCustomers} bloqueado(s)`}
            color="text-white"
            icon={<Users size={18} className="text-zinc-500/60" />}
          />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          <MiniAlert label="Locações Ativas"       value={metrics.activeRentals}    color="text-emerald-400" />
          <MiniAlert label="Reservas Pendentes"    value={metrics.pendingReservations} color="text-amber-400" />
          <MiniAlert label="Devoluções em Atraso"  value={metrics.overdueRentals}   color={metrics.overdueRentals > 0 ? "text-red-400" : "text-zinc-500"} icon={metrics.overdueRentals > 0 ? <ClockAlert size={14} className="text-red-400" /> : undefined} />
          <MiniAlert label="Manutenções Abertas"   value={metrics.scheduledMaintenance} color={metrics.scheduledMaintenance > 0 ? "text-orange-400" : "text-zinc-500"} />
        </div>
      </section>

      {/* ── RECEITA VS CUSTO (6 meses) + RECEITA 12 MESES ── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        {/* Receita vs Custo 6 meses */}
        <section>
          <SectionTitle icon={<BarChart3 size={16} />} label="Receita vs Custo — 6 Meses" />
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <div className="flex items-end gap-3 h-52">
              {revVsCost.map((m) => {
                const revPct  = Math.max((m.revenue / maxRevVsCost) * 100, m.revenue > 0 ? 3 : 0)
                const costPct = Math.max((m.cost / maxRevVsCost) * 100, m.cost > 0 ? 3 : 0)
                const net     = m.revenue - m.cost
                return (
                  <div key={m.key} className="flex-1 flex flex-col items-center gap-1 group">
                    <div className="text-center mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className={`text-[10px] font-bold ${net >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                        {net >= 0 ? "+" : ""}{formatCurrency(net).replace("R$", "")}
                      </p>
                    </div>
                    <div className="w-full flex items-end gap-0.5 flex-1">
                      <div
                        className="flex-1 bg-[#d4a017]/30 hover:bg-[#d4a017]/60 border border-[#d4a017]/40 rounded-t transition-colors"
                        style={{ height: `${revPct}%`, minHeight: m.revenue > 0 ? "4px" : "0" }}
                        title={`Receita: ${formatCurrency(m.revenue)}`}
                      />
                      <div
                        className="flex-1 bg-orange-500/25 hover:bg-orange-500/50 border border-orange-500/30 rounded-t transition-colors"
                        style={{ height: `${costPct}%`, minHeight: m.cost > 0 ? "4px" : "0" }}
                        title={`Custo: ${formatCurrency(m.cost)}`}
                      />
                    </div>
                    <span className="text-[10px] text-zinc-500 group-hover:text-zinc-300">{m.label}</span>
                  </div>
                )
              })}
            </div>
            <div className="flex items-center gap-5 mt-4 pt-4 border-t border-zinc-800 text-xs text-zinc-500">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-[#d4a017]/50 border border-[#d4a017]/60" />
                Receita
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-orange-500/40 border border-orange-500/40" />
                Custo Manutenção
              </div>
              <div className="ml-auto flex gap-4">
                <span>Receita total: <strong className="text-[#d4a017]">{formatCurrency(revVsCost.reduce((a, m) => a + m.revenue, 0))}</strong></span>
                <span>Custo total: <strong className="text-orange-400">{formatCurrency(revVsCost.reduce((a, m) => a + m.cost, 0))}</strong></span>
              </div>
            </div>
          </div>
        </section>

        {/* Receita 12 meses */}
        <section>
          <SectionTitle icon={<TrendingUp size={16} />} label="Receita — Últimos 12 Meses" />
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <div className="flex items-end gap-1 h-52">
              {monthlyRevenue12.map((m) => {
                const pct = Math.max((m.revenue / maxRev12) * 100, m.revenue > 0 ? 3 : 1)
                const isAboveAvg = m.revenue > avgMonthly
                return (
                  <div key={m.key} className="flex-1 flex flex-col items-center gap-1 group">
                    <span className="text-[10px] text-zinc-600 group-hover:text-white transition-colors opacity-0 group-hover:opacity-100 whitespace-nowrap">
                      {formatCurrency(m.revenue)}
                    </span>
                    <div className="w-full flex-1 flex items-end">
                      <div
                        className={`w-full rounded-t transition-colors ${
                          isAboveAvg
                            ? "bg-[#d4a017]/40 border border-[#d4a017]/50 group-hover:bg-[#d4a017]/70"
                            : "bg-zinc-700/40 border border-zinc-700/50 group-hover:bg-zinc-600/60"
                        }`}
                        style={{ height: `${pct}%` }}
                      />
                    </div>
                    <span className="text-[9px] text-zinc-600 group-hover:text-zinc-400">{m.label}</span>
                  </div>
                )
              })}
            </div>
            {/* Linha de média */}
            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-zinc-800 text-xs text-zinc-500">
              <span><span className="inline-block w-3 h-px bg-zinc-500 mr-1 align-middle" /> Acima da média</span>
              <span className="ml-auto">Total 12m: <strong className="text-[#d4a017]">{formatCurrency(totalRev12)}</strong></span>
              <span>Média: <strong className="text-white">{formatCurrency(avgMonthly)}</strong>/mês</span>
            </div>
          </div>
        </section>
      </div>

      {/* ── HEAT MAP DIÁRIO ── */}
      <section>
        <SectionTitle icon={<Activity size={16} />} label="Receita Diária — Últimos 30 dias" />
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <div className="grid grid-cols-10 gap-1.5">
            {daily30.map((d) => {
              const intensity = maxDaily > 0 ? d.revenue / maxDaily : 0
              const opacity   = d.revenue === 0 ? 0.08 : 0.15 + intensity * 0.85
              const label     = new Date(d.date + "T12:00:00").toLocaleDateString("pt-BR", { day: "numeric", month: "short" })
              return (
                <div
                  key={d.date}
                  className="aspect-square rounded-lg relative group cursor-default"
                  style={{ backgroundColor: `rgba(212,160,23,${opacity})` }}
                  title={`${label}: ${formatCurrency(d.revenue)}`}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[9px] font-bold text-white/60 group-hover:text-white transition-colors">
                      {new Date(d.date + "T12:00:00").getDate()}
                    </span>
                  </div>
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-zinc-950 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-[10px] text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-xl">
                    <p className="font-bold text-[#d4a017]">{formatCurrency(d.revenue)}</p>
                    <p className="text-zinc-400">{label}</p>
                  </div>
                </div>
              )
            })}
          </div>
          <div className="flex items-center gap-3 mt-4 pt-3 border-t border-zinc-800">
            <span className="text-zinc-500 text-xs">Menos</span>
            {[0.08, 0.25, 0.45, 0.65, 0.85, 1].map((o) => (
              <span key={o} className="w-4 h-4 rounded" style={{ backgroundColor: `rgba(212,160,23,${o})` }} />
            ))}
            <span className="text-zinc-500 text-xs">Mais</span>
            <span className="ml-auto text-xs text-zinc-500">
              Maior dia: <strong className="text-[#d4a017]">{formatCurrency(maxDaily)}</strong>
            </span>
          </div>
        </div>
      </section>

      {/* ── CATEGORIAS + MÉTODOS DE PAGAMENTO ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Revenue by category */}
        <section>
          <SectionTitle icon={<BarChart3 size={16} />} label="Receita por Categoria" />
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-5">
            {revenueByCategory.length === 0
              ? <p className="text-zinc-500 text-sm">Sem dados.</p>
              : revenueByCategory.sort((a, b) => b.revenue - a.revenue).map((cat, i) => {
                const pct = maxRevCat > 0 ? Math.max((cat.revenue / maxRevCat) * 100, 2) : 2
                const share = maxRevCat > 0 ? Math.round((cat.revenue / revenueByCategory.reduce((a, c) => a + c.revenue, 0) || 1) * 100) : 0
                return (
                  <div key={cat.name}>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold ${i === 0 ? "bg-[#d4a017]/20 text-[#d4a017]" : "bg-zinc-800 text-zinc-500"}`}>{i + 1}</span>
                        <span className="text-white font-medium">{cat.name}</span>
                        <span className="text-zinc-600 text-xs">{cat.vehicles} veíc. · {formatCurrency(cat.dailyRate)}/dia</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[#d4a017] font-bold">{formatCurrency(cat.revenue)}</span>
                        <span className="text-zinc-600 text-xs ml-1.5">{share}%</span>
                      </div>
                    </div>
                    <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-[#d4a017] to-amber-400 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
          </div>
        </section>

        {/* Payment methods */}
        <section>
          <SectionTitle icon={<CreditCard size={16} />} label="Métodos de Pagamento" />
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            {paymentMethods.length === 0
              ? <p className="text-zinc-500 text-sm">Nenhum pagamento registrado.</p>
              : (
                <>
                  {/* Donut-style distribution */}
                  <div className="flex gap-3 mb-5 flex-wrap">
                    {paymentMethods.sort((a, b) => b.total - a.total).map((pm) => {
                      const pct = Math.round((pm.total / totalPayRev) * 100)
                      return (
                        <div key={pm.method} className="flex-1 min-w-24 bg-zinc-800/50 rounded-xl p-3 border border-zinc-700/50">
                          <div className={`w-2.5 h-2.5 rounded-full ${METHOD_COLOR[pm.method] ?? "bg-zinc-500"} mb-2`} />
                          <p className="text-white font-bold text-base">{pct}%</p>
                          <p className="text-zinc-400 text-xs">{METHOD_LABEL[pm.method] ?? pm.method}</p>
                          <p className="text-zinc-600 text-[10px] mt-0.5">{pm.count} transações</p>
                        </div>
                      )
                    })}
                  </div>
                  <div className="space-y-3">
                    {paymentMethods.sort((a, b) => b.total - a.total).map((pm) => (
                      <div key={pm.method}>
                        <div className="flex justify-between text-sm mb-1.5">
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${METHOD_COLOR[pm.method] ?? "bg-zinc-500"}`} />
                            <span className="text-zinc-300">{METHOD_LABEL[pm.method] ?? pm.method}</span>
                          </div>
                          <span className="text-emerald-400 font-bold">{formatCurrency(pm.total)}</span>
                        </div>
                        <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${METHOD_COLOR[pm.method] ?? "bg-zinc-500"}`}
                            style={{ width: `${Math.max((pm.total / totalPayRev) * 100, 2)}%`, opacity: 0.7 }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
          </div>
        </section>
      </div>

      {/* ── STATUS RESERVAS + OCUPAÇÃO ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Reservations by status */}
        <section>
          <SectionTitle icon={<CalendarCheck2 size={16} />} label="Reservas por Status" />
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <div className="space-y-3">
              {reservationStats.byStatus
                .sort((a, b) => b._count - a._count)
                .map((s) => {
                  const pct = Math.round((s._count / totalResv) * 100)
                  return (
                    <div key={s.status}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${STATUS_COLOR[s.status] ?? "text-zinc-400 bg-zinc-800 border-zinc-700"}`}>
                            {STATUS_LABEL[s.status] ?? s.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                          <span className="text-white font-bold">{s._count}</span>
                          <span className="text-zinc-600 text-xs w-8 text-right">{pct}%</span>
                        </div>
                      </div>
                      <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${STATUS_BAR[s.status] ?? "bg-zinc-600"}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  )
                })}
            </div>
            <div className="mt-5 pt-4 border-t border-zinc-800 flex justify-between text-xs text-zinc-500">
              <span>Total: <strong className="text-white">{reservationStats.total}</strong> reservas</span>
              <Link href="/admin/reservas" className="text-[#d4a017] hover:underline flex items-center gap-1">
                Ver todas <ArrowUpRight size={12} />
              </Link>
            </div>
          </div>
        </section>

        {/* Occupancy 6 months */}
        <section>
          <SectionTitle icon={<Activity size={16} />} label="Volume de Reservas — 6 Meses" />
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <div className="flex items-end gap-2 h-44">
              {occupancyByMonth.map((m) => {
                const pct = Math.max((m.reservations / maxOcc) * 100, m.reservations > 0 ? 4 : 0)
                return (
                  <div key={m.key} className="flex-1 flex flex-col items-center gap-1 group">
                    <div className="text-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-[10px] font-bold text-white block">{m.reservations}</span>
                      <span className="text-[9px] text-[#d4a017] block">{m.occupancy}%</span>
                    </div>
                    <div className="w-full flex-1 flex items-end">
                      <div
                        className="w-full bg-blue-500/25 border border-blue-500/30 rounded-t group-hover:bg-blue-500/50 transition-colors"
                        style={{ height: `${pct}%`, minHeight: m.reservations > 0 ? "6px" : "0" }}
                      />
                    </div>
                    <span className="text-[10px] text-zinc-500 group-hover:text-zinc-300">{m.month}</span>
                  </div>
                )
              })}
            </div>
            <div className="mt-4 pt-4 border-t border-zinc-800 flex justify-between text-xs text-zinc-500">
              <span>Total 6m: <strong className="text-white">{occupancyByMonth.reduce((a, m) => a + m.reservations, 0)}</strong></span>
              <span>Média: <strong className="text-white">{Math.round(occupancyByMonth.reduce((a, m) => a + m.reservations, 0) / 6)}</strong>/mês</span>
            </div>
          </div>
        </section>
      </div>

      {/* ── TOP CLIENTES ── */}
      <section>
        <SectionTitle icon={<Users size={16} />} label="Top 10 Clientes por Receita" />
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-950/60 border-b border-zinc-800 text-zinc-400 text-xs uppercase tracking-wider">
                  <th className="px-5 py-3">#</th>
                  <th className="px-5 py-3">Cliente</th>
                  <th className="px-5 py-3 hidden md:table-cell">Tipo</th>
                  <th className="px-5 py-3 text-center">Reservas</th>
                  <th className="px-5 py-3 text-center hidden md:table-cell">Score</th>
                  <th className="px-5 py-3 text-right">Receita</th>
                  <th className="px-5 py-3 text-right hidden md:table-cell">Ticket Méd.</th>
                  <th className="px-5 py-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {topCustomers.map((c, i) => {
                  const avgTicket = c.reservations > 0 ? c.revenue / c.reservations : 0
                  return (
                    <tr key={c.id} className={`hover:bg-zinc-800/30 transition-colors ${i === 0 ? "bg-[#d4a017]/5" : ""}`}>
                      <td className="px-5 py-3.5">
                        <span className={`text-sm font-black ${i === 0 ? "text-[#d4a017]" : i < 3 ? "text-zinc-400" : "text-zinc-600"}`}>
                          {i < 3 ? ["🥇","🥈","🥉"][i] : `#${i + 1}`}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <Link href={`/admin/clientes/${c.id}`} className="group/link">
                          <p className="text-white text-sm font-medium group-hover/link:text-[#d4a017] transition-colors">{c.name}</p>
                          <p className="text-zinc-500 text-xs">{c.email}</p>
                        </Link>
                      </td>
                      <td className="px-5 py-3.5 hidden md:table-cell">
                        <span className="text-xs font-bold text-amber-500/80 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">{c.type}</span>
                      </td>
                      <td className="px-5 py-3.5 text-center text-white font-bold">{c.reservations}</td>
                      <td className="px-5 py-3.5 text-center hidden md:table-cell">
                        <div className="flex items-center justify-center gap-1">
                          <Star size={10} className="text-[#d4a017]" />
                          <span className={`text-sm font-bold ${c.score >= 70 ? "text-emerald-400" : c.score >= 40 ? "text-amber-400" : "text-red-400"}`}>{c.score}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-right text-[#d4a017] font-bold text-sm">{formatCurrency(c.revenue)}</td>
                      <td className="px-5 py-3.5 text-right text-zinc-400 text-sm hidden md:table-cell">{formatCurrency(avgTicket)}</td>
                      <td className="px-5 py-3.5 text-center">
                        {c.blocked
                          ? <span className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 px-2 py-0.5 rounded-full flex items-center gap-1 justify-center w-fit mx-auto"><ShieldOff size={10} /> Bloq.</span>
                          : <span className="text-xs text-emerald-400">Ativo</span>}
                      </td>
                    </tr>
                  )
                })}
                {topCustomers.length === 0 && (
                  <tr><td colSpan={8} className="px-5 py-10 text-center text-zinc-500">Sem dados.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── DESEMPENHO DA FROTA ── */}
      <section>
        <SectionTitle icon={<Car size={16} />} label="Desempenho por Veículo" />
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-950/60 border-b border-zinc-800 text-zinc-400 text-xs uppercase tracking-wider">
                  <th className="px-5 py-3">Veículo</th>
                  <th className="px-5 py-3 hidden md:table-cell">Categoria</th>
                  <th className="px-5 py-3 text-center">Reservas</th>
                  <th className="px-5 py-3 text-right">Receita</th>
                  <th className="px-5 py-3 text-right hidden lg:table-cell">Manut.</th>
                  <th className="px-5 py-3 text-center hidden lg:table-cell">Multas</th>
                  <th className="px-5 py-3 text-right">Lucro Líq.</th>
                  <th className="px-5 py-3 text-center hidden md:table-cell">ROI</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {fleetReport.sort((a, b) => b.totalRevenue - a.totalRevenue).map((v) => {
                  const net = v.totalRevenue - v.totalMaintenanceCost
                  const roi = v.totalMaintenanceCost > 0 ? (net / v.totalMaintenanceCost) * 100 : null
                  return (
                    <tr key={v.id} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="px-5 py-3.5">
                        <p className="text-white font-medium text-sm">{v.brand} {v.model}</p>
                        <p className="text-zinc-500 text-xs">{v.plate} · {v.year}</p>
                      </td>
                      <td className="px-5 py-3.5 text-zinc-400 text-sm hidden md:table-cell">{v.category.name}</td>
                      <td className="px-5 py-3.5 text-center text-white font-bold">{v.totalReservations}</td>
                      <td className="px-5 py-3.5 text-right text-[#d4a017] font-bold text-sm">{formatCurrency(v.totalRevenue)}</td>
                      <td className="px-5 py-3.5 text-right hidden lg:table-cell">
                        <span className={`text-sm font-medium ${v.totalMaintenanceCost > 0 ? "text-orange-400" : "text-zinc-600"}`}>
                          {formatCurrency(v.totalMaintenanceCost)}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-center hidden lg:table-cell">
                        <span className={`text-sm font-bold ${v._count.fines > 0 ? "text-red-400" : "text-zinc-600"}`}>{v._count.fines}</span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <span className={`text-sm font-bold ${net >= 0 ? "text-emerald-400" : "text-red-400"}`}>{formatCurrency(net)}</span>
                      </td>
                      <td className="px-5 py-3.5 text-center hidden md:table-cell">
                        {roi !== null ? (
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${roi >= 100 ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" : roi >= 0 ? "text-amber-400 bg-amber-400/10 border-amber-400/20" : "text-red-400 bg-red-400/10 border-red-400/20"}`}>
                            {roi.toFixed(0)}%
                          </span>
                        ) : <span className="text-zinc-600 text-xs">—</span>}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${
                          v.status === "AVAILABLE"   ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" :
                          v.status === "RENTED"      ? "text-blue-400 bg-blue-400/10 border-blue-400/20" :
                          v.status === "MAINTENANCE" ? "text-orange-400 bg-orange-400/10 border-orange-400/20" :
                          "text-zinc-400 bg-zinc-400/10 border-zinc-400/20"
                        }`}>
                          {v.status === "AVAILABLE" ? "Livre" : v.status === "RENTED" ? "Alugado" : v.status === "MAINTENANCE" ? "Manut." : v.status}
                        </span>
                      </td>
                    </tr>
                  )
                })}
                {fleetReport.length === 0 && (
                  <tr><td colSpan={9} className="px-5 py-10 text-center text-zinc-500">Nenhum veículo.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── MANUTENÇÕES + MULTAS ── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        {/* Manutenções */}
        <section>
          <SectionTitle icon={<Wrench size={16} />} label="Manutenções" />
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
                <p className="text-zinc-500 text-xs uppercase tracking-wider mb-1">Custo Total</p>
                <p className="text-xl font-bold text-orange-400">{formatCurrency(maintenanceSummary.totalCost)}</p>
              </div>
              {maintenanceSummary.byType.map((t) => (
                <div key={t.type} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
                  <p className="text-zinc-500 text-xs uppercase tracking-wider mb-1">{t.type === "PREVENTIVE" ? "Prevent." : "Corretiva"}</p>
                  <p className="text-xl font-bold text-white">{t._count}</p>
                  <p className="text-zinc-500 text-xs mt-0.5">{formatCurrency(Number(t._sum.cost ?? 0))}</p>
                </div>
              ))}
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden max-h-72 overflow-y-auto">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-zinc-950">
                  <tr className="border-b border-zinc-800 text-zinc-400 text-xs uppercase tracking-wider">
                    <th className="px-4 py-2.5">Veículo</th>
                    <th className="px-4 py-2.5">Data</th>
                    <th className="px-4 py-2.5 text-right">Custo</th>
                    <th className="px-4 py-2.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {maintenanceSummary.recent.map((m) => (
                    <tr key={m.id} className="hover:bg-zinc-800/30">
                      <td className="px-4 py-2.5">
                        <p className="text-white text-xs font-medium">{m.vehicle.brand} {m.vehicle.model}</p>
                        <p className="text-zinc-500 text-[10px]">{m.vehicle.plate} · {m.type === "PREVENTIVE" ? "Prev." : "Corr."}</p>
                      </td>
                      <td className="px-4 py-2.5 text-zinc-400 text-xs">{new Date(m.date).toLocaleDateString("pt-BR")}</td>
                      <td className="px-4 py-2.5 text-right text-orange-400 font-bold text-xs">{formatCurrency(Number(m.cost))}</td>
                      <td className="px-4 py-2.5">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${
                          m.status === "COMPLETED" ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" :
                          m.status === "IN_PROGRESS" ? "text-blue-400 bg-blue-400/10 border-blue-400/20" :
                          "text-amber-400 bg-amber-400/10 border-amber-400/20"
                        }`}>{MAINT_STATUS[m.status] ?? m.status}</span>
                      </td>
                    </tr>
                  ))}
                  {maintenanceSummary.recent.length === 0 && (
                    <tr><td colSpan={4} className="px-4 py-6 text-center text-zinc-500 text-xs">Nenhuma manutenção.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Multas */}
        <section>
          <SectionTitle icon={<AlertTriangle size={16} />} label="Multas e Infrações" />
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
                <p className="text-zinc-500 text-xs uppercase tracking-wider mb-1">Total</p>
                <p className="text-xl font-bold text-red-400">{formatCurrency(finesSummary.totalAmount)}</p>
              </div>
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
                <p className="text-zinc-500 text-xs uppercase tracking-wider mb-1">Recuperado</p>
                <p className="text-xl font-bold text-emerald-400">{formatCurrency(finesSummary.totalCharged)}</p>
              </div>
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
                <p className="text-zinc-500 text-xs uppercase tracking-wider mb-1">Absorvido</p>
                <p className="text-xl font-bold text-orange-400">{formatCurrency(finesSummary.totalAmount - finesSummary.totalCharged)}</p>
              </div>
            </div>
            {finesSummary.byStatus.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {finesSummary.byStatus.map((s) => (
                  <div key={s.status} className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs ${FINE_STATUS_COLOR[s.status] ?? "text-zinc-400 bg-zinc-800/50 border-zinc-700"}`}>
                    <span className="font-bold">{FINE_STATUS_LABEL[s.status] ?? s.status}</span>
                    <span className="font-black text-sm">{s._count}</span>
                    <span className="opacity-70">{formatCurrency(Number(s._sum.amount ?? 0))}</span>
                  </div>
                ))}
              </div>
            )}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden max-h-72 overflow-y-auto">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-zinc-950">
                  <tr className="border-b border-zinc-800 text-zinc-400 text-xs uppercase tracking-wider">
                    <th className="px-4 py-2.5">Veículo</th>
                    <th className="px-4 py-2.5">Data</th>
                    <th className="px-4 py-2.5 text-right">Valor</th>
                    <th className="px-4 py-2.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {finesSummary.recent.map((f) => (
                    <tr key={f.id} className="hover:bg-zinc-800/30">
                      <td className="px-4 py-2.5">
                        <p className="text-white text-xs font-medium">{f.vehicle.brand} {f.vehicle.model}</p>
                        <p className="text-zinc-500 text-[10px]">{f.vehicle.plate} · {f.infractionCode}</p>
                      </td>
                      <td className="px-4 py-2.5 text-zinc-400 text-xs">{new Date(f.date).toLocaleDateString("pt-BR")}</td>
                      <td className="px-4 py-2.5 text-right text-red-400 font-bold text-xs">{formatCurrency(Number(f.amount))}</td>
                      <td className="px-4 py-2.5">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${FINE_STATUS_COLOR[f.status] ?? "text-zinc-400 bg-zinc-800/50 border-zinc-700"}`}>
                          {FINE_STATUS_LABEL[f.status] ?? f.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {finesSummary.recent.length === 0 && (
                    <tr><td colSpan={4} className="px-4 py-6 text-center text-zinc-500 text-xs">Nenhuma multa.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>

    </div>
  )
}

// ── Utility Components ────────────────────────────────────────────────────────

function SectionTitle({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className="text-zinc-400">{icon}</span>
      <h3 className="text-white font-semibold text-sm">{label}</h3>
      <div className="flex-1 h-px bg-zinc-800 ml-2" />
    </div>
  )
}

function KpiCard({ label, value, sub, color, trend, icon, progress }: {
  label: string; value: string; sub: string; color: string
  trend?: "up" | "down" | "flat"; icon?: React.ReactNode; progress?: number
}) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <p className="text-zinc-500 text-xs uppercase tracking-wider">{label}</p>
        {icon}
      </div>
      <p className={`text-2xl font-black font-outfit ${color}`}>{value}</p>
      {progress !== undefined && (
        <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full ${progress >= 70 ? "bg-emerald-400" : progress >= 40 ? "bg-[#d4a017]" : "bg-red-400"}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
      <p className="text-zinc-500 text-xs flex items-center gap-1">
        {trend === "up"   && <TrendingUp  size={11} className="text-emerald-400 flex-shrink-0" />}
        {trend === "down" && <TrendingDown size={11} className="text-red-400 flex-shrink-0" />}
        {trend === "flat" && <Minus size={11} className="text-zinc-500 flex-shrink-0" />}
        {sub}
      </p>
    </div>
  )
}

function MiniAlert({ label, value, color, icon }: { label: string; value: number; color: string; icon?: React.ReactNode }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center justify-between gap-3">
      <p className="text-zinc-500 text-xs uppercase tracking-wider leading-tight">{label}</p>
      <div className="flex items-center gap-1.5">
        {icon}
        <p className={`text-2xl font-bold ${color}`}>{value}</p>
      </div>
    </div>
  )
}

function DRERow({ label, value, color, bold, large, sub, badge, badgeColor }: {
  label: string; value: number; color: string
  bold?: boolean; large?: boolean; sub?: string; badge?: string; badgeColor?: string
}) {
  const formatted = formatCurrency(Math.abs(value))
  const sign = value < 0 ? "−" : value > 0 ? "+" : ""
  return (
    <div className={`flex items-start justify-between py-2 ${bold ? "border-t border-zinc-800/50 mt-1" : ""}`}>
      <div>
        <span className={`${large ? "text-sm" : "text-xs"} ${bold ? "font-bold text-zinc-200" : "text-zinc-400"}`}>{label}</span>
        {sub && <p className="text-[10px] text-zinc-600 mt-0.5">{sub}</p>}
      </div>
      <div className="flex items-center gap-2 ml-4 flex-shrink-0">
        {badge && (
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badgeColor}`}>{badge}</span>
        )}
        <span className={`${large ? "text-base" : "text-sm"} font-bold ${color} tabular-nums`}>
          {value !== 0 ? `${sign} ${formatted}` : formatted}
        </span>
      </div>
    </div>
  )
}
