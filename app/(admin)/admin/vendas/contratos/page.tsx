import { getSaleContracts } from "@/app/actions/sale.actions"
import { formatCurrency } from "@/lib/utils"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { FileText, ChevronLeft, CheckCircle2, Clock } from "lucide-react"

export const dynamic = "force-dynamic"
export const metadata = { title: "Contratos de Venda — Morauto Admin" }

export default async function SaleContractsPage() {
  const session = await auth()
  if (!session) redirect("/login")

  const contracts = await getSaleContracts()

  const total   = contracts.length
  const signed  = contracts.filter((c: (typeof contracts)[0]) => c.signedAt).length
  const pending = contracts.filter((c: (typeof contracts)[0]) => !c.signedAt).length

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <Link href="/admin/vendas" className="flex items-center gap-1.5 text-zinc-400 hover:text-white text-sm transition-colors mb-2">
            <ChevronLeft size={16} /> Veículos à Venda
          </Link>
          <h2 className="text-3xl font-outfit font-bold text-white tracking-tight">Contratos de Venda</h2>
          <p className="text-zinc-400 mt-2">Todos os contratos de compra e venda gerados.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
          <p className="text-zinc-500 text-xs uppercase tracking-wider">Total</p>
          <p className="text-3xl font-bold text-white mt-1">{total}</p>
        </div>
        <div className="bg-zinc-900 border border-emerald-900/30 rounded-xl p-4 text-center">
          <p className="text-zinc-500 text-xs uppercase tracking-wider">Assinados</p>
          <p className="text-3xl font-bold text-emerald-400 mt-1">{signed}</p>
        </div>
        <div className="bg-zinc-900 border border-amber-900/30 rounded-xl p-4 text-center">
          <p className="text-zinc-500 text-xs uppercase tracking-wider">Pendentes</p>
          <p className="text-3xl font-bold text-amber-400 mt-1">{pending}</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-950/50 border-b border-zinc-800 text-zinc-400 text-xs uppercase tracking-wider">
                <th className="px-5 py-3 font-medium">Nº Contrato</th>
                <th className="px-5 py-3 font-medium">Veículo</th>
                <th className="px-5 py-3 font-medium">Comprador</th>
                <th className="px-5 py-3 font-medium">Valor</th>
                <th className="px-5 py-3 font-medium">Pagamento</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Data</th>
                <th className="px-5 py-3 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {contracts.map((c: (typeof contracts)[0]) => (
                <tr key={c.id} className="hover:bg-zinc-800/30 transition-colors">
                  <td className="px-5 py-4">
                    <span className="text-[#d4a017] font-mono text-sm font-medium">{c.number}</span>
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-white text-sm font-medium">{c.vehicle.brand} {c.vehicle.model}</p>
                    <p className="text-zinc-500 text-xs">{c.vehicle.year} · {c.vehicle.plate ?? "—"}</p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-white text-sm">{c.lead.name}</p>
                    <p className="text-zinc-500 text-xs">{c.lead.phone}</p>
                  </td>
                  <td className="px-5 py-4 text-[#d4a017] font-bold text-sm whitespace-nowrap">
                    {formatCurrency(Number(c.salePrice))}
                  </td>
                  <td className="px-5 py-4 text-zinc-400 text-sm">{c.paymentMethod}</td>
                  <td className="px-5 py-4">
                    {c.signedAt ? (
                      <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2.5 py-1 rounded-full">
                        <CheckCircle2 size={11} /> Assinado
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2.5 py-1 rounded-full">
                        <Clock size={11} /> Pendente
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-zinc-500 text-xs whitespace-nowrap">
                    {new Date(c.createdAt).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Link
                      href={`/admin/vendas/contratos/${c.id}`}
                      className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 bg-blue-400/10 border border-blue-400/20 px-2.5 py-1.5 rounded-lg transition-colors"
                    >
                      <FileText size={11} /> Ver
                    </Link>
                  </td>
                </tr>
              ))}
              {contracts.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-16 text-center">
                    <FileText size={32} className="text-zinc-700 mx-auto mb-3" />
                    <p className="text-zinc-500">Nenhum contrato de venda gerado ainda.</p>
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
