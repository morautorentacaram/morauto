import { getContracts, generateRentalContract } from "@/app/actions/contract.actions"
import { getReservations } from "@/app/actions/reservation.actions"
import { formatCurrency } from "@/lib/utils"
import { FileText, Eye, FilePlus, CheckCircle } from "lucide-react"
import Link from "next/link"

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
            {reservationsWithoutContract.map((r) => (
              <div key={r.id} className="flex items-center justify-between bg-zinc-900/50 rounded-lg p-4 border border-zinc-800">
                <div>
                  <p className="text-white font-medium">{r.customer.user.name} — {r.vehicle.brand} {r.vehicle.model}</p>
                  <p className="text-zinc-400 text-sm">{new Date(r.startDate).toLocaleDateString("pt-BR")} → {new Date(r.endDate).toLocaleDateString("pt-BR")} • {formatCurrency(Number(r.totalValue))}</p>
                </div>
                <form action={async () => { "use server"; await generateRentalContract(r.id) }}>
                  <button type="submit" className="flex items-center gap-2 bg-[#d4a017] hover:bg-[#b8880f] text-black font-semibold px-4 py-2 rounded-lg text-sm transition-colors">
                    <FilePlus className="w-4 h-4" />
                    Gerar Contrato
                  </button>
                </form>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Contracts table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-950/50 border-b border-zinc-800 text-zinc-400 text-sm">
                <th className="px-6 py-4 font-medium uppercase tracking-wider">Contrato</th>
                <th className="px-6 py-4 font-medium uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-4 font-medium uppercase tracking-wider">Veículo</th>
                <th className="px-6 py-4 font-medium uppercase tracking-wider">Período</th>
                <th className="px-6 py-4 font-medium uppercase tracking-wider">Valor</th>
                <th className="px-6 py-4 font-medium uppercase tracking-wider">Assinado</th>
                <th className="px-6 py-4 font-medium uppercase tracking-wider text-right">Ver</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {contracts.map((c) => (
                <tr key={c.id} className="hover:bg-zinc-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-[#d4a017]" />
                      <span className="text-white font-mono text-sm">{c.number}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-zinc-300 text-sm">{c.customer.user.name}</td>
                  <td className="px-6 py-4">
                    <div className="text-zinc-300 text-sm">{c.reservation.vehicle.brand} {c.reservation.vehicle.model}</div>
                    <div className="text-zinc-500 text-xs">{c.reservation.vehicle.plate}</div>
                  </td>
                  <td className="px-6 py-4 text-zinc-400 text-sm">
                    {new Date(c.reservation.startDate).toLocaleDateString("pt-BR")} →<br />
                    {new Date(c.reservation.endDate).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="px-6 py-4 text-[#d4a017] font-bold text-sm">{formatCurrency(Number(c.reservation.totalValue))}</td>
                  <td className="px-6 py-4">
                    {c.signedAt ? (
                      <div className="flex items-center gap-1 text-emerald-400 text-sm">
                        <CheckCircle className="w-4 h-4" />
                        {new Date(c.signedAt).toLocaleDateString("pt-BR")}
                      </div>
                    ) : (
                      <span className="text-amber-400 text-xs">Pendente</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/admin/contratos/${c.id}`}
                      className="text-zinc-400 hover:text-white p-2 rounded-lg hover:bg-white/5 transition-colors inline-flex"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                  </td>
                </tr>
              ))}
              {contracts.length === 0 && (
                <tr><td colSpan={7} className="px-6 py-12 text-center text-zinc-500">Nenhum contrato gerado ainda.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
