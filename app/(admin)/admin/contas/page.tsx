import { getAccounts, getAccountsSummary, syncOverdueAccounts } from "@/app/actions/accounts.actions"
import { formatCurrency } from "@/lib/utils"
import { TrendingDown, TrendingUp, Wallet, Scale, AlertCircle } from "lucide-react"
import AccountForm from "@/components/admin/AccountForm"
import AccountsManager from "@/components/admin/AccountsManager"

export const metadata = {
  title: "Contas a Pagar e Receber - Morauto Admin",
}

export const dynamic = "force-dynamic"

export default async function ContasPage() {
  let accounts: Awaited<ReturnType<typeof getAccounts>> = []
  let summary = {
    totalReceivable: 0,
    totalPayable: 0,
    paidReceivable: 0,
    paidPayable: 0,
    balance: 0,
  }
  let loadError: string | null = null

  try {
    await syncOverdueAccounts()
    const [a, s] = await Promise.all([getAccounts(), getAccountsSummary()])
    accounts = a
    summary = s
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    loadError = msg
    console.error("[contas] failed to load:", e)
  }

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

      {loadError && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div className="min-w-0 flex-1">
            <p className="text-red-300 text-sm font-semibold">Falha ao carregar dados</p>
            <pre className="text-red-200/80 text-xs mt-1 whitespace-pre-wrap break-words">{loadError}</pre>
            <p className="text-red-300/70 text-xs mt-2">
              Provavelmente a tabela <code>AccountEntry</code> ainda não existe no banco. Execute <code>npx prisma db push</code>.
            </p>
          </div>
        </div>
      )}

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
