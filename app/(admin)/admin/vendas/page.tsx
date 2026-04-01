import { getSaleVehicles, getSaleContracts, deleteSaleVehicle } from "@/app/actions/sale.actions"
import { formatCurrency } from "@/lib/utils"
import SaleVehicleSearch from "@/components/admin/SaleVehicleSearch"
import Link from "next/link"
import Image from "next/image"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { Plus, Pencil, Eye, Trash2, Car, Tag } from "lucide-react"

export const dynamic = "force-dynamic"
export const metadata = { title: "Veículos à Venda — Morauto Admin" }

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  AVAILABLE: { label: "Disponível", color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" },
  RESERVED:  { label: "Reservado",  color: "text-amber-400 bg-amber-400/10 border-amber-400/20" },
  SOLD:      { label: "Vendido",    color: "text-purple-400 bg-purple-400/10 border-purple-400/20" },
}

export default async function SaleVehiclesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>
}) {
  const session = await auth()
  if (!session) redirect("/login")

  const { q = "", status = "" } = await searchParams
  const [vehicles, contracts] = await Promise.all([
    getSaleVehicles({ search: q, status }),
    getSaleContracts(),
  ])

  const total     = vehicles.length
  const available = vehicles.filter((v: (typeof vehicles)[0]) => v.status === "AVAILABLE").length
  const reserved  = vehicles.filter((v: (typeof vehicles)[0]) => v.status === "RESERVED").length
  const sold      = vehicles.filter((v: (typeof vehicles)[0]) => v.status === "SOLD").length
  const revenue   = contracts
    .filter((c: (typeof contracts)[0]) => c.lead.status === "CLOSED")
    .reduce((acc: number, c: (typeof contracts)[0]) => acc + Number(c.salePrice), 0)

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-3xl font-outfit font-bold text-white tracking-tight">Veículos à Venda</h2>
          <p className="text-zinc-400 mt-2">Gerencie o estoque de veículos disponíveis para venda.</p>
        </div>
        <Link
          href="/admin/vendas/novo"
          className="flex items-center gap-2 bg-[#d4a017] hover:bg-[#b8860b] text-black font-bold px-5 py-2.5 rounded-xl text-sm transition-colors"
        >
          <Plus size={16} /> Cadastrar Veículo
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
          <p className="text-zinc-500 text-xs uppercase tracking-wider">Total</p>
          <p className="text-3xl font-bold text-white mt-1">{total}</p>
        </div>
        <div className="bg-zinc-900 border border-emerald-900/30 rounded-xl p-4 text-center">
          <p className="text-zinc-500 text-xs uppercase tracking-wider">Disponíveis</p>
          <p className="text-3xl font-bold text-emerald-400 mt-1">{available}</p>
        </div>
        <div className="bg-zinc-900 border border-amber-900/30 rounded-xl p-4 text-center">
          <p className="text-zinc-500 text-xs uppercase tracking-wider">Reservados</p>
          <p className="text-3xl font-bold text-amber-400 mt-1">{reserved}</p>
        </div>
        <div className="bg-zinc-900 border border-purple-900/30 rounded-xl p-4 text-center">
          <p className="text-zinc-500 text-xs uppercase tracking-wider">Vendidos</p>
          <p className="text-3xl font-bold text-purple-400 mt-1">{sold}</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
          <p className="text-zinc-500 text-xs uppercase tracking-wider">Receita</p>
          <p className="text-xl font-bold text-[#d4a017] mt-1">{formatCurrency(revenue)}</p>
        </div>
      </div>

      {/* Search */}
      <SaleVehicleSearch currentSearch={q} currentStatus={status} />

      {/* Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-950/50 border-b border-zinc-800 text-zinc-400 text-xs uppercase tracking-wider">
                <th className="px-5 py-3 font-medium">Foto</th>
                <th className="px-5 py-3 font-medium">Veículo</th>
                <th className="px-5 py-3 font-medium">Placa / KM</th>
                <th className="px-5 py-3 font-medium">Preço</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Interessados</th>
                <th className="px-5 py-3 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {vehicles.map((v: (typeof vehicles)[0]) => {
                const cfg = STATUS_CONFIG[v.status] ?? STATUS_CONFIG.AVAILABLE
                const hasContracts = (v as any)._count?.leads > 0

                return (
                  <tr key={v.id} className="hover:bg-zinc-800/30 transition-colors">
                    {/* Foto */}
                    <td className="px-5 py-4">
                      <div className="w-16 h-12 rounded-lg overflow-hidden bg-zinc-800 border border-zinc-700 flex items-center justify-center flex-shrink-0">
                        {v.photos[0] ? (
                          <Image src={v.photos[0]} alt={`${v.brand} ${v.model}`} width={64} height={48} className="object-cover w-full h-full" unoptimized />
                        ) : (
                          <Car size={20} className="text-zinc-600" />
                        )}
                      </div>
                    </td>

                    {/* Veículo */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        {v.highlighted && (
                          <span className="text-[10px] font-bold text-[#d4a017] bg-[#d4a017]/10 border border-[#d4a017]/30 px-1.5 py-0.5 rounded">DESTAQUE</span>
                        )}
                      </div>
                      <p className="text-white font-medium">{v.brand} {v.model}</p>
                      <p className="text-zinc-500 text-xs">{v.version ?? ""} · {v.year} · {v.color}</p>
                    </td>

                    {/* Placa/KM */}
                    <td className="px-5 py-4">
                      <p className="text-white text-sm font-mono">{v.plate ?? "—"}</p>
                      <p className="text-zinc-500 text-xs">{v.km.toLocaleString("pt-BR")} km</p>
                    </td>

                    {/* Preço */}
                    <td className="px-5 py-4 text-[#d4a017] font-bold text-sm whitespace-nowrap">
                      {formatCurrency(Number(v.price))}
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center text-xs px-2.5 py-1 rounded-full border ${cfg.color}`}>
                        {cfg.label}
                      </span>
                    </td>

                    {/* Leads */}
                    <td className="px-5 py-4">
                      <span className="text-zinc-300 text-sm font-medium">{(v as any)._count.leads}</span>
                    </td>

                    {/* Ações */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2 justify-end">
                        <Link
                          href={`/admin/vendas/${v.id}`}
                          className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
                          title="Ver leads"
                        >
                          <Eye size={15} />
                        </Link>
                        <Link
                          href={`/admin/vendas/${v.id}/editar`}
                          className="p-2 text-zinc-400 hover:text-[#d4a017] hover:bg-zinc-800 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Pencil size={15} />
                        </Link>
                        {!(v as any)._count.leads && (
                          <form action={async () => {
                            "use server"
                            await deleteSaleVehicle(v.id)
                          }}>
                            <button
                              type="submit"
                              className="p-2 text-zinc-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                              title="Excluir"
                            >
                              <Trash2 size={15} />
                            </button>
                          </form>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
              {vehicles.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center">
                    <Tag size={32} className="text-zinc-700 mx-auto mb-3" />
                    <p className="text-zinc-500">Nenhum veículo cadastrado para venda.</p>
                    <Link href="/admin/vendas/novo" className="inline-flex items-center gap-2 mt-4 text-[#d4a017] hover:underline text-sm">
                      <Plus size={14} /> Cadastrar primeiro veículo
                    </Link>
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
