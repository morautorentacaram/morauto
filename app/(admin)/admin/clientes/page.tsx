import { getCustomers } from "@/app/actions/customer.actions"
import { blockCustomer, unblockCustomer } from "@/app/actions/customer.actions"
import CustomerForm from "@/components/admin/CustomerForm"
import CustomerActions from "@/components/admin/CustomerActions"
import CustomersPdfButton from "@/components/admin/CustomersPdfButton"
import { ShieldOff, ShieldCheck, Eye } from "lucide-react"
import Link from "next/link"

export const dynamic = "force-dynamic"
export const metadata = { title: "Clientes — Morauto Admin" }

export default async function CustomersPage() {
  const customers = await getCustomers()

  const blocked = customers.filter((c) => c.blocked).length
  const active = customers.filter((c) => !c.blocked).length

  return (
    <div className="space-y-8 p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-3xl font-outfit font-bold text-white tracking-tight">Gestão de Clientes</h2>
          <p className="text-zinc-400 mt-2">Cadastre e gerencie clientes PF e PJ da sua locadora.</p>
        </div>
        <CustomersPdfButton customers={customers} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <p className="text-zinc-500 text-xs uppercase tracking-wider">Total</p>
          <p className="text-3xl font-bold text-white mt-1">{customers.length}</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <p className="text-zinc-500 text-xs uppercase tracking-wider">Ativos</p>
          <p className="text-3xl font-bold text-emerald-400 mt-1">{active}</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <p className="text-zinc-500 text-xs uppercase tracking-wider">Bloqueados</p>
          <p className="text-3xl font-bold text-red-400 mt-1">{blocked}</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <p className="text-zinc-500 text-xs uppercase tracking-wider">PJ</p>
          <p className="text-3xl font-bold text-blue-400 mt-1">{customers.filter(c => c.type === "PJ").length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-1">
          <CustomerForm />
        </div>

        <div className="xl:col-span-2">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-zinc-950/50 border-b border-zinc-800 text-zinc-400 text-sm">
                    <th className="px-6 py-4 font-medium uppercase tracking-wider">Cliente</th>
                    <th className="px-6 py-4 font-medium uppercase tracking-wider">Documento</th>
                    <th className="px-6 py-4 font-medium uppercase tracking-wider">Score</th>
                    <th className="px-6 py-4 font-medium uppercase tracking-wider text-center">Locações</th>
                    <th className="px-6 py-4 font-medium uppercase tracking-wider text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {customers.map((c) => (
                    <tr key={c.id} className={`hover:bg-zinc-800/30 transition-colors ${c.blocked ? "opacity-60" : ""}`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center border text-sm font-bold flex-shrink-0 ${c.blocked ? "bg-red-900/30 border-red-700 text-red-400" : "bg-zinc-800 border-zinc-700 text-[#d4a017]"}`}>
                            {c.user.name?.charAt(0).toUpperCase() ?? "?"}
                          </div>
                          <div>
                            <div className="text-white font-medium text-sm flex items-center gap-2">
                              {c.user.name}
                              {c.blocked && <span className="text-red-400 text-xs bg-red-900/20 border border-red-700/30 px-1.5 py-0.5 rounded">Bloqueado</span>}
                            </div>
                            <div className="text-zinc-500 text-xs">{c.user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-zinc-300 font-mono text-sm">{c.document}</div>
                        <div className="text-xs text-amber-500 font-bold">{c.type}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-zinc-700 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${(c.score ?? 100) >= 70 ? "bg-emerald-400" : (c.score ?? 100) >= 40 ? "bg-amber-400" : "bg-red-400"}`}
                              style={{ width: `${c.score ?? 100}%` }}
                            />
                          </div>
                          <span className="text-xs text-zinc-400">{c.score ?? 100}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="bg-zinc-800 text-zinc-300 px-3 py-1 rounded-full text-xs font-bold border border-zinc-700">
                          {c._count.reservations}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <Link href={`/admin/clientes/${c.id}`} title="Ver detalhes" className="text-zinc-400 hover:text-white p-1.5 rounded hover:bg-white/5 transition-colors">
                            <Eye size={15} />
                          </Link>
                          {c.blocked ? (
                            <form action={async () => { "use server"; await unblockCustomer(c.id) }}>
                              <button type="submit" title="Desbloquear" className="text-emerald-400 hover:text-emerald-300 p-1.5 rounded hover:bg-emerald-900/20 transition-colors">
                                <ShieldCheck size={15} />
                              </button>
                            </form>
                          ) : (
                            <form action={async () => { "use server"; await blockCustomer(c.id, "Bloqueio manual pelo admin") }}>
                              <button type="submit" title="Bloquear" className="text-red-400 hover:text-red-300 p-1.5 rounded hover:bg-red-900/20 transition-colors">
                                <ShieldOff size={15} />
                              </button>
                            </form>
                          )}
                          <CustomerActions customer={c} />
                        </div>
                      </td>
                    </tr>
                  ))}
                  {customers.length === 0 && (
                    <tr><td colSpan={5} className="px-6 py-12 text-center text-zinc-500">Nenhum cliente cadastrado.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
