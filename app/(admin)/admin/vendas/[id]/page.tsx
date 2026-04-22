import { getSaleVehicleById, updateSaleVehicleStatus, finalizeSale } from "@/app/actions/sale.actions"
import { getCustomers } from "@/app/actions/customer.actions"
import { formatCurrency } from "@/lib/utils"
import SaleLeadActions from "@/components/admin/SaleLeadActions"
import RealizarVendaButton from "@/components/admin/RealizarVendaButton"
import { auth } from "@/auth"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { ChevronLeft, Pencil, Car, Gauge, Fuel, Settings2, Users, Users2, Calendar, Tag, CheckCircle2, FileText } from "lucide-react"

export const dynamic = "force-dynamic"

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  AVAILABLE: { label: "Disponível", color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" },
  RESERVED:  { label: "Reservado",  color: "text-amber-400 bg-amber-400/10 border-amber-400/20" },
  SOLD:      { label: "Vendido",    color: "text-purple-400 bg-purple-400/10 border-purple-400/20" },
}

const LEAD_STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  NEW:         { label: "Novo",       color: "text-zinc-300 bg-zinc-700/50 border-zinc-600" },
  CONTACTED:   { label: "Contactado", color: "text-blue-400 bg-blue-400/10 border-blue-400/20" },
  NEGOTIATING: { label: "Negociando", color: "text-amber-400 bg-amber-400/10 border-amber-400/20" },
  CLOSED:      { label: "Fechado",    color: "text-green-400 bg-green-400/10 border-green-400/20" },
  CANCELLED:   { label: "Cancelado",  color: "text-red-400 bg-red-400/10 border-red-400/20" },
}

export default async function SaleVehicleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  if (!session) redirect("/login")

  const { id } = await params
  const [vehicle, customers] = await Promise.all([
    getSaleVehicleById(id),
    getCustomers(),
  ])
  if (!vehicle) notFound()

  const customerOptions = customers.map((c: any) => ({
    id:       c.id,
    name:     c.user.name ?? "",
    email:    c.user.email ?? "",
    phone:    c.phone ?? "",
    document: c.document ?? "",
    address:  c.address ?? "",
  }))

  const cfg = STATUS_CONFIG[vehicle.status] ?? STATUS_CONFIG.AVAILABLE

  return (
    <div className="p-6 space-y-6">
      {/* Back + header */}
      <div>
        <Link href="/admin/vendas" className="flex items-center gap-1.5 text-zinc-400 hover:text-white text-sm transition-colors mb-4">
          <ChevronLeft size={16} /> Voltar para Veículos à Venda
        </Link>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-3xl font-outfit font-bold text-white tracking-tight">
              {vehicle.brand} {vehicle.model}
              {vehicle.version && <span className="text-zinc-400 text-xl font-normal ml-2">{vehicle.version}</span>}
            </h2>
            <p className="text-zinc-400 mt-1">{vehicle.year} · {vehicle.color} · {vehicle.km.toLocaleString("pt-BR")} km</p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`inline-flex items-center text-sm px-3 py-1.5 rounded-full border ${cfg.color}`}>
              {cfg.label}
            </span>
            {vehicle.status !== "SOLD" && (
              <RealizarVendaButton vehicleId={vehicle.id} vehiclePrice={Number(vehicle.price)} customers={customerOptions} />
            )}
            <Link
              href={`/admin/vendas/${vehicle.id}/editar`}
              className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white rounded-xl text-sm transition-colors"
            >
              <Pencil size={14} /> Editar
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: photos + specs */}
        <div className="lg:col-span-2 space-y-6">
          {/* Photos */}
          {vehicle.photos.length > 0 ? (
            <div className="space-y-2">
              <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-zinc-800">
                <Image src={vehicle.photos[0]} alt={`${vehicle.brand} ${vehicle.model}`} fill className="object-cover" unoptimized />
              </div>
              {vehicle.photos.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {vehicle.photos.slice(1).map((url: string, i: number) => (
                    <div key={url} className="relative aspect-video rounded-lg overflow-hidden border border-zinc-800">
                      <Image src={url} alt={`Foto ${i + 2}`} fill className="object-cover" unoptimized />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="w-full aspect-video rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
              <Car size={48} className="text-zinc-700" />
            </div>
          )}

          {/* Specs grid */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Especificações</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Spec icon={<Calendar size={14} />} label="Ano" value={String(vehicle.year)} />
              <Spec icon={<Gauge size={14} />} label="Quilometragem" value={`${vehicle.km.toLocaleString("pt-BR")} km`} />
              <Spec icon={<Fuel size={14} />} label="Combustível" value={vehicle.fuelType} />
              <Spec icon={<Settings2 size={14} />} label="Câmbio" value={vehicle.transmission === "AUTOMATICO" ? "Automático" : "Manual"} />
              <Spec icon={<Car size={14} />} label="Portas" value={`${vehicle.doors} portas`} />
              <Spec icon={<Users size={14} />} label="Lugares" value={`${vehicle.seats} lugares`} />
              {vehicle.plate && <Spec icon={<Tag size={14} />} label="Placa" value={vehicle.plate} />}
              {vehicle.renavam && <Spec icon={<Tag size={14} />} label="RENAVAM" value={vehicle.renavam} />}
              {vehicle.chassi && <Spec icon={<Tag size={14} />} label="Chassi" value={vehicle.chassi} />}
            </div>
          </div>

          {/* Features */}
          {vehicle.features.length > 0 && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">Opcionais</h3>
              <div className="flex flex-wrap gap-2">
                {vehicle.features.map((f: string) => (
                  <span key={f} className="flex items-center gap-1.5 text-sm bg-zinc-800 border border-zinc-700 text-zinc-200 px-3 py-1.5 rounded-full">
                    <CheckCircle2 size={12} className="text-[#d4a017]" /> {f}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          {vehicle.description && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-3">Descrição</h3>
              <p className="text-zinc-400 text-sm leading-relaxed whitespace-pre-line">{vehicle.description}</p>
            </div>
          )}
        </div>

        {/* Right: price + status + leads */}
        <div className="space-y-6">
          {/* Price card */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
            <p className="text-zinc-400 text-sm mb-1">Preço de Venda</p>
            <p className="text-4xl font-black text-[#d4a017]">{formatCurrency(Number(vehicle.price))}</p>
          </div>

          {/* Status change */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
            <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-3">Alterar Status</h3>
            <div className="flex flex-col gap-2">
              {(["AVAILABLE", "RESERVED", "SOLD"] as const).map((s) => {
                const c = STATUS_CONFIG[s]
                const isActive = vehicle.status === s
                return (
                  <form key={s} action={async () => {
                    "use server"
                    await updateSaleVehicleStatus(id, s)
                  }}>
                    <button
                      type="submit"
                      disabled={isActive}
                      className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium border transition-colors ${
                        isActive
                          ? `${c.color} cursor-default`
                          : "text-zinc-400 bg-zinc-800/50 border-zinc-700 hover:border-zinc-600 hover:text-white"
                      }`}
                    >
                      {isActive ? "● " : "○ "}{c.label}
                      {isActive && " (atual)"}
                    </button>
                  </form>
                )
              })}
            </div>
          </div>

          {/* Contracts */}
          {vehicle.contracts.length > 0 && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
              <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <FileText size={14} /> Contratos
              </h3>
              <div className="space-y-2">
                {vehicle.contracts.map((c: any) => (
                  <Link
                    key={c.id}
                    href={`/admin/vendas/contratos/${c.id}`}
                    className="flex items-center justify-between px-3 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors text-sm"
                  >
                    <span className="text-blue-400 font-medium">{c.number}</span>
                    <span className="text-zinc-500 text-xs">
                      {c.signedAt ? "Assinado" : "Pendente"}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Leads section */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Users2 size={18} className="text-[#d4a017]" />
            Interessados ({vehicle.leads.length})
          </h3>
        </div>

        {vehicle.leads.length === 0 ? (
          <div className="px-6 py-12 text-center text-zinc-500">
            <Users2 size={32} className="text-zinc-700 mx-auto mb-3" />
            Nenhum interessado registrado ainda.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-950/50 border-b border-zinc-800 text-zinc-400 text-xs uppercase tracking-wider">
                  <th className="px-5 py-3 font-medium">Nome</th>
                  <th className="px-5 py-3 font-medium">Contato</th>
                  <th className="px-5 py-3 font-medium">CPF</th>
                  <th className="px-5 py-3 font-medium">Mensagem</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Data</th>
                  <th className="px-5 py-3 font-medium">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {vehicle.leads.map((lead: (typeof vehicle.leads)[0]) => {
                  const lCfg = LEAD_STATUS_CONFIG[lead.status] ?? LEAD_STATUS_CONFIG.NEW
                  return (
                    <tr key={lead.id} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="px-5 py-4">
                        <p className="text-white font-medium text-sm">{lead.name}</p>
                        <p className="text-zinc-500 text-xs">{lead.email}</p>
                      </td>
                      <td className="px-5 py-4 text-zinc-300 text-sm">{lead.phone}</td>
                      <td className="px-5 py-4 text-zinc-400 text-xs font-mono">{lead.document ?? "—"}</td>
                      <td className="px-5 py-4 max-w-48">
                        <p className="text-zinc-400 text-xs line-clamp-2">{lead.message ?? "—"}</p>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex text-xs px-2.5 py-1 rounded-full border ${lCfg.color}`}>
                          {lCfg.label}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-zinc-500 text-xs whitespace-nowrap">
                        {new Date(lead.createdAt).toLocaleDateString("pt-BR")}
                      </td>
                      <td className="px-5 py-4">
                        <SaleLeadActions lead={{ ...lead, vehicle: { id: vehicle.id, price: vehicle.price } }} />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

function Spec({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <div className="text-[#d4a017] mt-0.5 flex-shrink-0">{icon}</div>
      <div>
        <p className="text-zinc-500 text-xs">{label}</p>
        <p className="text-white text-sm font-medium">{value}</p>
      </div>
    </div>
  )
}
