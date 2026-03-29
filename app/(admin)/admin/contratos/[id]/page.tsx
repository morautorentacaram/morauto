import { getContractById } from "@/app/actions/contract.actions"
import { formatCurrency } from "@/lib/utils"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Printer, CheckCircle, Clock } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function ContractDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const contract = await getContractById(id)
  if (!contract) notFound()

  const { reservation, customer } = contract
  const { vehicle } = reservation

  return (
    <div className="space-y-6 p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <Link href="/admin/contratos" className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm">
          <ArrowLeft className="w-4 h-4" /> Voltar
        </Link>
        <button
          onClick={undefined}
          className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
          // Print via browser
        >
          <Printer className="w-4 h-4" /> Imprimir / PDF
        </button>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden" id="contract-print">
        {/* Header */}
        <div className="bg-black p-8 text-center border-b border-zinc-800">
          <h1 className="text-3xl font-black text-white font-outfit uppercase tracking-tighter">
            Morauto<span className="text-[#d4a017]">.</span>
          </h1>
          <p className="text-zinc-400 text-sm mt-1">Contrato de Locação de Veículo</p>
          <div className="mt-4 inline-block bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2">
            <p className="text-[#d4a017] font-mono font-bold">{contract.number}</p>
          </div>
        </div>

        <div className="p-8 space-y-6">
          {/* Status */}
          <div className="flex items-center justify-between">
            <div>
              {contract.signedAt ? (
                <div className="flex items-center gap-2 text-emerald-400">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-semibold">Assinado em {new Date(contract.signedAt).toLocaleDateString("pt-BR")}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-amber-400">
                  <Clock className="w-5 h-5" />
                  <span className="font-semibold">Aguardando assinatura</span>
                </div>
              )}
            </div>
            <span className="text-zinc-500 text-sm">Gerado em {new Date(contract.createdAt).toLocaleDateString("pt-BR")}</span>
          </div>

          {/* Parties */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-zinc-950/50 border border-zinc-800 rounded-xl p-5">
              <h3 className="text-zinc-400 text-xs font-bold uppercase tracking-wider mb-3">Locadora</h3>
              <p className="text-white font-semibold">Morauto Locadora de Veículos</p>
              <p className="text-zinc-400 text-sm">CNPJ: 00.000.000/0001-00</p>
            </div>
            <div className="bg-zinc-950/50 border border-zinc-800 rounded-xl p-5">
              <h3 className="text-zinc-400 text-xs font-bold uppercase tracking-wider mb-3">Locatário</h3>
              <p className="text-white font-semibold">{customer.user.name}</p>
              <p className="text-zinc-400 text-sm">CPF/CNPJ: {customer.document}</p>
              <p className="text-zinc-400 text-sm">Telefone: {customer.phone ?? "N/I"}</p>
              <p className="text-zinc-400 text-sm">CNH: {customer.cnh ?? "N/I"}</p>
            </div>
          </div>

          {/* Vehicle */}
          <div className="bg-zinc-950/50 border border-zinc-800 rounded-xl p-5">
            <h3 className="text-zinc-400 text-xs font-bold uppercase tracking-wider mb-3">Veículo</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div><p className="text-zinc-500">Modelo</p><p className="text-white font-medium">{vehicle.brand} {vehicle.model}</p></div>
              <div><p className="text-zinc-500">Placa</p><p className="text-[#d4a017] font-mono font-bold">{vehicle.plate}</p></div>
              <div><p className="text-zinc-500">Ano</p><p className="text-white font-medium">{vehicle.year}</p></div>
              <div><p className="text-zinc-500">Cor</p><p className="text-white font-medium">{vehicle.color}</p></div>
              <div><p className="text-zinc-500">RENAVAM</p><p className="text-white font-medium">{vehicle.renavam}</p></div>
              <div><p className="text-zinc-500">Chassi</p><p className="text-white font-medium text-xs">{vehicle.chassi}</p></div>
              <div><p className="text-zinc-500">Categoria</p><p className="text-white font-medium">{vehicle.category.name}</p></div>
            </div>
          </div>

          {/* Period and Values */}
          <div className="bg-zinc-950/50 border border-zinc-800 rounded-xl p-5">
            <h3 className="text-zinc-400 text-xs font-bold uppercase tracking-wider mb-3">Período e Valores</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div><p className="text-zinc-500">Retirada</p><p className="text-white font-medium">{new Date(reservation.startDate).toLocaleDateString("pt-BR")}</p></div>
              <div><p className="text-zinc-500">Devolução</p><p className="text-white font-medium">{new Date(reservation.endDate).toLocaleDateString("pt-BR")}</p></div>
              <div><p className="text-zinc-500">Diária</p><p className="text-white font-medium">{formatCurrency(Number(vehicle.category.dailyRate))}</p></div>
              <div><p className="text-zinc-500">Total</p><p className="text-[#d4a017] font-bold text-lg">{formatCurrency(Number(reservation.totalValue))}</p></div>
              {reservation.depositValue && (
                <div><p className="text-zinc-500">Caução</p><p className="text-white font-medium">{formatCurrency(Number(reservation.depositValue))}</p></div>
              )}
            </div>
          </div>

          {/* Terms */}
          <div className="bg-zinc-950/50 border border-zinc-800 rounded-xl p-5">
            <h3 className="text-zinc-400 text-xs font-bold uppercase tracking-wider mb-3">Termos e Condições</h3>
            <pre className="text-zinc-300 text-sm whitespace-pre-wrap font-sans leading-relaxed">{contract.terms}</pre>
          </div>

          {/* Inspections */}
          {contract.inspections.length > 0 && (
            <div className="bg-zinc-950/50 border border-zinc-800 rounded-xl p-5">
              <h3 className="text-zinc-400 text-xs font-bold uppercase tracking-wider mb-3">Vistorias Vinculadas</h3>
              <div className="space-y-3">
                {contract.inspections.map((insp) => (
                  <div key={insp.id} className="flex items-center justify-between text-sm border-b border-zinc-800 pb-3 last:border-0">
                    <div>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full mr-2 ${insp.type === "DEPARTURE" ? "bg-blue-400/10 text-blue-400" : "bg-emerald-400/10 text-emerald-400"}`}>
                        {insp.type === "DEPARTURE" ? "Retirada" : "Devolução"}
                      </span>
                      <span className="text-zinc-300">{insp.inspectorName}</span>
                    </div>
                    <div className="text-zinc-400">{insp.km.toLocaleString("pt-BR")} km • {insp.fuelLevel}% combustível</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
