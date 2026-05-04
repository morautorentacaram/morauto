import { getAccounts, getAccountsSummary, syncOverdueAccounts } from "@/app/actions/accounts.actions"
import { formatCurrency } from "@/lib/utils"
import { TrendingDown, TrendingUp, Wallet, Scale, Plus } from "lucide-react"
import AccountForm from "@/components/admin/AccountForm"
import AccountsManager from "@/components/admin/AccountsManager"

export const metadata = {
  title: "Contas a Pagar e Receber - Morauto Admin",
}

export default async function ContasPage() {
  await syncOverdueAccounts()
  const [accounts, summary] = await Promise.all([getAccounts(), getAccountsSummary()])

  const kpis = [
    {
      label: "A Receber",
      value: summary.totalReceivable,
      icon: TrendingUp,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
    },
    {
      label: "A Pagar",
      value: summary.totalPayable,
      icon: TrendingDown,
      color: "text-red-400",
      bg: "bg-red-500/10",
    },
    {
      label: "Pago no Mês",
      value: summary.paidReceivable + summary.paidPayable,
      icon: Wallet,
      color: "text-[#d4a017]",
      bg: "bg-[#d4a017]/10",
    },
    {
      label: "Saldo Projetado",
      value: summary.balance,
      icon: Scale,
      color: summary.balance >= 0 ? "text-emerald-400" : "text-red-400",
      bg: summary.balance >= 0 ? "bg-emerald-500/10" : "bg-red-500/10",
    },
  ]

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-white tracking-tight">Contas a Pagar e Receber</h2>
        <p className="text-zinc-400 mt-1 text-sm">
          Controle de despesas, receitas avulsas e fluxo de caixa operacional.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex items-center gap-4"
          >
            <div className={`w-11 h-11 rounded-full ${kpi.bg} flex items-center justify-center flex-shrink-0`}>
              <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
            </div>
            <div className="min-w-0">
              <p className="text-zinc-500 text-xs uppercase tracking-wider truncate">{kpi.label}</p>
              <p className={`text-xl font-bold ${kpi.color} truncate`}>
                {formatCurrency(kpi.value)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Content: Form + Table */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        <div className="xl:col-span-1">
          <AccountForm />
        </div>
        <div className="xl:col-span-3 space-y-4">
          <AccountsManager accounts={accounts} />
        </div>
      </div>
    </div>
  )
}
