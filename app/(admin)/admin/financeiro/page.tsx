import { getFinancialSummary, confirmPayment, refundPayment } from "@/app/actions/financial.actions"
import { formatCurrency } from "@/lib/utils"
import { DollarSign, TrendingUp, Clock, AlertCircle, CheckCircle, RotateCcw } from "lucide-react"

export const dynamic = "force-dynamic"
export const metadata = { title: "Financeiro — Morauto Admin" }

const paymentMethodLabel: Record<string, string> = {
  PIX: "PIX",
  CREDIT_CARD: "Cartão Crédito",
  DEBIT_CARD: "Cartão Débito",
  CASH: "Dinheiro",
  BANK_TRANSFER: "Transferência",
}

const statusConfig: Record<string, { label: string; class: string }> = {
  PENDING:  { label: "Pendente",  class: "text-amber-400 bg-amber-400/10 border-amber-400/20" },
  PAID:     { label: "Pago",      class: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" },
  REFUNDED: { label: "Estornado", class: "text-purple-400 bg-purple-400/10 border-purple-400/20" },
  FAILED:   { label: "Falhou",    class: "text-red-400 bg-red-400/10 border-red-400/20" },
}

export default async function FinancialPage() {
  const summary = await getFinancialSummary()

  return (
    <div className="space-y-8 p-6">
      <div>
        <h2 className="text-3xl font-outfit font-bold text-white tracking-tight">Módulo Financeiro</h2>
        <p className="text-zinc-400 mt-2">Controle de pagamentos, recebimentos e inadimplência.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <p className="text-zinc-500 text-xs uppercase tracking-wider">Total Recebido</p>
            <p className="text-2xl font-bold text-emerald-400">{formatCurrency(summary.totalReceived)}</p>
          </div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center flex-shrink-0">
            <Clock className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <p className="text-zinc-500 text-xs uppercase tracking-wider">A Receber</p>
            <p className="text-2xl font-bold text-amber-400">{formatCurrency(summary.totalPending)}</p>
          </div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center flex-shrink-0">
            <DollarSign className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <p className="text-zinc-500 text-xs uppercase tracking-wider">Estornados</p>
            <p className="text-2xl font-bold text-purple-400">{formatCurrency(summary.totalRefunded)}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Inadimplência */}
        <div className="bg-zinc-900 border border-red-900/30 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <h3 className="text-white font-semibold">Locações em Atraso</h3>
          </div>
          <div className="space-y-3">
            {summary.overdueReservations.length === 0 ? (
              <p className="text-zinc-500 text-sm">Nenhuma locação em atraso.</p>
            ) : (
              summary.overdueReservations.map((r) => (
                <div key={r.id} className="flex items-start justify-between gap-2 pb-3 border-b border-zinc-800 last:border-0 last:pb-0">
                  <div>
                    <p className="text-white text-sm font-medium">{r.customer.user.name}</p>
                    <p className="text-zinc-500 text-xs">{r.vehicle.brand} {r.vehicle.model} — {r.vehicle.plate}</p>
                    <p className="text-red-400 text-xs">Devol. prevista: {new Date(r.endDate).toLocaleDateString("pt-BR")}</p>
                  </div>
                  <span className="text-red-400 font-bold text-sm">{formatCurrency(Number(r.totalValue))}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Receita por método */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <h3 className="text-white font-semibold mb-4">Receita por Método</h3>
          <div className="space-y-3">
            {summary.paymentsByMethod.length === 0 ? (
              <p className="text-zinc-500 text-sm">Sem dados.</p>
            ) : (
              summary.paymentsByMethod.map((p) => (
                <div key={p.method} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#d4a017]" />
                    <span className="text-zinc-300 text-sm">{paymentMethodLabel[p.method] ?? p.method}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-semibold text-sm">{formatCurrency(Number(p._sum.amount))}</p>
                    <p className="text-zinc-500 text-xs">{p._count} pgto(s)</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Pagamentos recentes */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 lg:col-span-1 hidden lg:block">
          <h3 className="text-white font-semibold mb-4">Resumo</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">Pendentes</span>
              <span className="text-amber-400 font-medium">{summary.recentPayments.filter(p => p.status === "PENDING").length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">Pagos</span>
              <span className="text-emerald-400 font-medium">{summary.recentPayments.filter(p => p.status === "PAID").length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">Em atraso</span>
              <span className="text-red-400 font-medium">{summary.overdueReservations.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabela de pagamentos */}
      <div>
        <h3 className="text-white font-semibold mb-4">Últimos Pagamentos</h3>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-950/50 border-b border-zinc-800 text-zinc-400 text-sm">
                  <th className="px-6 py-4 font-medium uppercase tracking-wider">Cliente</th>
                  <th className="px-6 py-4 font-medium uppercase tracking-wider">Veículo</th>
                  <th className="px-6 py-4 font-medium uppercase tracking-wider">Método</th>
                  <th className="px-6 py-4 font-medium uppercase tracking-wider">Valor</th>
                  <th className="px-6 py-4 font-medium uppercase tracking-wider">Vencimento</th>
                  <th className="px-6 py-4 font-medium uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 font-medium uppercase tracking-wider text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {summary.recentPayments.map((p) => {
                  const cfg = statusConfig[p.status] ?? { label: p.status, class: "text-zinc-400" }
                  return (
                    <tr key={p.id} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="px-6 py-4 text-white text-sm">{p.reservation.customer.user.name}</td>
                      <td className="px-6 py-4 text-zinc-300 text-sm">{p.reservation.vehicle.brand} {p.reservation.vehicle.model}</td>
                      <td className="px-6 py-4 text-zinc-400 text-sm">{paymentMethodLabel[p.method] ?? p.method}</td>
                      <td className="px-6 py-4 text-[#d4a017] font-bold text-sm">{formatCurrency(Number(p.amount))}</td>
                      <td className="px-6 py-4 text-zinc-400 text-sm">
                        {p.dueDate ? new Date(p.dueDate).toLocaleDateString("pt-BR") : "—"}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold border ${cfg.class}`}>{cfg.label}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {p.status === "PENDING" && (
                            <form action={async () => { "use server"; await confirmPayment(p.id) }}>
                              <button type="submit" title="Confirmar pagamento" className="text-emerald-400 hover:text-emerald-300 p-1 rounded hover:bg-emerald-900/20 transition-colors">
                                <CheckCircle className="w-4 h-4" />
                              </button>
                            </form>
                          )}
                          {p.status === "PAID" && (
                            <form action={async () => { "use server"; await refundPayment(p.id) }}>
                              <button type="submit" title="Estornar" className="text-purple-400 hover:text-purple-300 p-1 rounded hover:bg-purple-900/20 transition-colors">
                                <RotateCcw className="w-4 h-4" />
                              </button>
                            </form>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
                {summary.recentPayments.length === 0 && (
                  <tr><td colSpan={7} className="px-6 py-12 text-center text-zinc-500">Nenhum pagamento registrado.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
