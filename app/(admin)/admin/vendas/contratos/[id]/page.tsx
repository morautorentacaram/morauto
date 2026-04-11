import { getSaleContractById, finalizeSale, deleteSaleContract } from "@/app/actions/sale.actions"
import { formatCurrency } from "@/lib/utils"
import SaleContractPdfButton from "@/components/admin/SaleContractPdfButton"
import { auth } from "@/auth"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import {
  ChevronLeft, Car, User, DollarSign, FileText,
  CheckCircle2, Clock, Calendar, Pencil, Trash2
} from "lucide-react"

export const dynamic = "force-dynamic"

export default async function SaleContractDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  if (!session) redirect("/login")

  const { id } = await params
  const contract = await getSaleContractById(id)
  if (!contract) notFound()

  const { vehicle, lead } = contract

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <Link href="/admin/vendas/contratos" className="flex items-center gap-1.5 text-zinc-400 hover:text-white text-sm transition-colors mb-4">
          <ChevronLeft size={16} /> Contratos de Venda
        </Link>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-3xl font-outfit font-bold text-white tracking-tight">
              Contrato <span className="text-[#d4a017]">{contract.number}</span>
            </h2>
            <p className="text-zinc-400 mt-1">
              Gerado em {new Date(contract.createdAt).toLocaleDateString("pt-BR")}
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {contract.signedAt ? (
              <span className="flex items-center gap-1.5 text-sm text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-3 py-1.5 rounded-full">
                <CheckCircle2 size={14} /> Assinado em {new Date(contract.signedAt).toLocaleDateString("pt-BR")}
              </span>
            ) : (
              <>
                <span className="flex items-center gap-1.5 text-sm text-amber-400 bg-amber-400/10 border border-amber-400/20 px-3 py-1.5 rounded-full">
                  <Clock size={14} /> Aguardando assinatura
                </span>
                <form action={async () => {
                  "use server"
                  await finalizeSale(id)
                }}>
                  <button type="submit" className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm transition-colors">
                    <CheckCircle2 size={14} /> Finalizar Venda
                  </button>
                </form>
              </>
            )}
            <Link
              href={`/admin/vendas/contratos/${id}/editar`}
              className="flex items-center gap-2 px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white font-bold rounded-xl text-sm transition-colors"
            >
              <Pencil size={14} /> Editar
            </Link>
            <form action={async () => {
              "use server"
              const result = await deleteSaleContract(id)
              if (result.success) redirect("/admin/vendas/contratos")
            }}>
              <button
                type="submit"
                className="flex items-center gap-2 px-4 py-2 bg-red-700 hover:bg-red-600 text-white font-bold rounded-xl text-sm transition-colors"
                onClick={(e) => { if (!confirm("Excluir este contrato? O veículo voltará para disponível.")) e.preventDefault() }}
              >
                <Trash2 size={14} /> Excluir
              </button>
            </form>
            <SaleContractPdfButton contract={contract} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Parties */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Vendedor */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
              <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <User size={14} /> Vendedor
              </h3>
              <div className="space-y-2 text-sm">
                <p className="text-white font-bold">MORAUTO LOCADORA DE VEÍCULOS E MÁQUINAS LTDA</p>
                <p className="text-zinc-400">CNPJ: 22.994.313/0001-45</p>
                <p className="text-zinc-400">Av. Álvaro Maia, 176-A — Pres. Vargas</p>
                <p className="text-zinc-400">CEP 69025-360 — Manaus-AM</p>
                <p className="text-zinc-400">(92) 3622-2883 / 99292-1946</p>
              </div>
            </div>

            {/* Comprador */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
              <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <User size={14} /> Comprador
              </h3>
              <div className="space-y-2 text-sm">
                <p className="text-white font-bold">{lead.name.toUpperCase()}</p>
                <p className="text-zinc-400">CPF/CNPJ: {lead.document ?? "Não informado"}</p>
                <p className="text-zinc-400">Telefone: {lead.phone}</p>
                <p className="text-zinc-400">E-mail: {lead.email}</p>
                <p className="text-zinc-400">Endereço: {lead.address ?? "Não informado"}</p>
              </div>
            </div>
          </div>

          {/* Vehicle */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
            <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Car size={14} /> Veículo
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-3 text-sm">
              <InfoRow label="Marca/Modelo" value={`${vehicle.brand} ${vehicle.model}`} />
              {vehicle.version && <InfoRow label="Versão" value={vehicle.version} />}
              <InfoRow label="Ano" value={String(vehicle.year)} />
              <InfoRow label="Cor" value={vehicle.color} />
              <InfoRow label="Placa" value={vehicle.plate ?? "N/I"} />
              <InfoRow label="RENAVAM" value={vehicle.renavam ?? "N/I"} />
              <InfoRow label="Chassi" value={vehicle.chassi ?? "N/I"} />
              <InfoRow label="KM Atual" value={`${vehicle.km.toLocaleString("pt-BR")} km`} />
              <InfoRow label="Combustível" value={vehicle.fuelType} />
              <InfoRow label="Câmbio" value={vehicle.transmission === "AUTOMATICO" ? "Automático" : "Manual"} />
            </div>
          </div>

          {/* Contract text */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
            <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <FileText size={14} /> Texto do Contrato
            </h3>
            <pre className="text-zinc-300 text-xs leading-relaxed whitespace-pre-wrap font-mono bg-zinc-950 rounded-xl p-4 border border-zinc-800 max-h-96 overflow-y-auto">
              {contract.terms}
            </pre>
          </div>
        </div>

        {/* Side: price + links */}
        <div className="space-y-6">
          {/* Price */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
            <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <DollarSign size={14} /> Resumo Financeiro
            </h3>
            <p className="text-4xl font-black text-[#d4a017] mb-3">{formatCurrency(Number(contract.salePrice))}</p>
            <div className="space-y-2 text-sm border-t border-zinc-800 pt-3">
              <div className="flex justify-between">
                <span className="text-zinc-400">Pagamento</span>
                <span className="text-white">{contract.paymentMethod}</span>
              </div>
              {contract.paymentDetails && (
                <div className="text-zinc-400 text-xs mt-2 bg-zinc-950 rounded-lg p-3 border border-zinc-800">
                  {contract.paymentDetails}
                </div>
              )}
            </div>
          </div>

          {/* Links */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-3">
            <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Calendar size={14} /> Navegação
            </h3>
            <Link
              href={`/admin/vendas/${vehicle.id}`}
              className="flex items-center gap-2 px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-sm transition-colors"
            >
              <Car size={14} className="text-[#d4a017]" /> Ver Veículo
            </Link>
            <Link
              href="/admin/vendas"
              className="flex items-center gap-2 px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-sm transition-colors"
            >
              <FileText size={14} className="text-[#d4a017]" /> Todos os Veículos
            </Link>
            <Link
              href="/admin/vendas/contratos"
              className="flex items-center gap-2 px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-sm transition-colors"
            >
              <FileText size={14} className="text-[#d4a017]" /> Todos os Contratos
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-zinc-500 text-xs">{label}</p>
      <p className="text-white font-medium">{value}</p>
    </div>
  )
}
