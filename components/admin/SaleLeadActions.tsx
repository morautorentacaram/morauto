"use client"

import { useState, useTransition } from "react"
import { updateLeadStatus, deleteLead, generateSaleContract } from "@/app/actions/sale.actions"
import { useRouter } from "next/navigation"
import { Trash2, FileText, Loader2, X, DollarSign } from "lucide-react"

type Lead = {
  id: string
  name: string
  status: string
  contract: any | null
  vehicle: { id: string; price: any }
}

const LEAD_STATUSES = [
  { value: "NEW",         label: "Novo" },
  { value: "CONTACTED",   label: "Contactado" },
  { value: "NEGOTIATING", label: "Negociando" },
  { value: "CLOSED",      label: "Fechado" },
  { value: "CANCELLED",   label: "Cancelado" },
]

const PAYMENT_METHODS = [
  "À Vista",
  "Financiamento",
  "Consórcio",
  "Troca com Complemento",
  "PIX",
  "Transferência Bancária",
  "Cartão de Crédito",
  "A combinar",
]

export default function SaleLeadActions({ lead }: { lead: Lead }) {
  const [showModal, setShowModal]       = useState(false)
  const [salePrice, setSalePrice]       = useState(String(Number(lead.vehicle.price)))
  const [paymentMethod, setPaymentMethod] = useState("PIX")
  const [rg, setRg]                     = useState("")
  const [deliveryDate, setDeliveryDate] = useState("")
  const [entryAmount, setEntryAmount]   = useState("")
  const [secondPayment, setSecondPayment] = useState("")
  const [secondPayDate, setSecondPayDate] = useState("")
  const [installmentCount, setInstallmentCount] = useState("")
  const [installmentAmount, setInstallmentAmount] = useState("")
  const [installmentStart, setInstallmentStart] = useState("")
  const [error, setError]               = useState("")
  const [, startTransition]             = useTransition()
  const router = useRouter()

  function handleStatusChange(status: string) {
    startTransition(async () => {
      await updateLeadStatus(lead.id, status)
      router.refresh()
    })
  }

  function handleDelete() {
    if (!confirm(`Excluir lead de ${lead.name}? Esta ação não pode ser desfeita.`)) return
    startTransition(async () => {
      const res = await deleteLead(lead.id)
      if (res.error) alert(res.error)
      else router.refresh()
    })
  }

  async function handleGenerateContract(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    const fd = new FormData()
    fd.set("salePrice", salePrice)
    fd.set("paymentMethod", paymentMethod)
    if (rg)               fd.set("rg", rg)
    if (deliveryDate)     fd.set("deliveryDate", deliveryDate)
    if (entryAmount)      fd.set("entryAmount", entryAmount)
    if (secondPayment)    fd.set("secondPayment", secondPayment)
    if (secondPayDate)    fd.set("secondPayDate", secondPayDate)
    if (installmentCount) fd.set("installmentCount", installmentCount)
    if (installmentAmount)fd.set("installmentAmount", installmentAmount)
    if (installmentStart) fd.set("installmentStart", installmentStart)
    const res = await generateSaleContract(lead.id, fd)
    if (res.error && !res.contractId) {
      setError(res.error)
      return
    }
    setShowModal(false)
    router.push(`/admin/vendas/contratos/${res.contractId}`)
  }

  const canGenerateContract = !lead.contract && lead.status !== "CANCELLED"
  const canDelete            = !lead.contract

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Status select */}
      <select
        defaultValue={lead.status}
        onChange={(e) => handleStatusChange(e.target.value)}
        className="text-xs bg-zinc-900 border border-zinc-700 text-white rounded-lg px-2 py-1.5 focus:outline-none focus:border-[#d4a017] cursor-pointer"
      >
        {LEAD_STATUSES.map((s) => (
          <option key={s.value} value={s.value}>{s.label}</option>
        ))}
      </select>

      {/* Generate contract */}
      {canGenerateContract && (
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 text-xs bg-[#d4a017]/10 hover:bg-[#d4a017]/20 border border-[#d4a017]/30 text-[#d4a017] px-2.5 py-1.5 rounded-lg transition-colors"
        >
          <FileText size={12} /> Gerar Contrato
        </button>
      )}

      {/* Contract link */}
      {lead.contract && (
        <a
          href={`/admin/vendas/contratos/${lead.contract.id}`}
          className="flex items-center gap-1.5 text-xs bg-blue-400/10 hover:bg-blue-400/20 border border-blue-400/20 text-blue-400 px-2.5 py-1.5 rounded-lg transition-colors"
        >
          <FileText size={12} /> Ver Contrato
        </a>
      )}

      {/* Delete */}
      {canDelete && (
        <button
          onClick={handleDelete}
          className="flex items-center gap-1 text-xs text-zinc-500 hover:text-red-400 hover:bg-red-400/10 p-1.5 rounded-lg transition-colors"
          title="Excluir lead"
        >
          <Trash2 size={13} />
        </button>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <DollarSign size={18} className="text-[#d4a017]" /> Gerar Contrato de Venda
              </h3>
              <button onClick={() => setShowModal(false)} className="text-zinc-500 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            <p className="text-zinc-400 text-sm mb-5">
              Comprador: <span className="text-white font-medium">{lead.name}</span>
            </p>

            {error && (
              <div className="mb-4 text-red-400 text-sm bg-red-900/20 p-3 rounded-lg border border-red-900/50">{error}</div>
            )}

            <form onSubmit={handleGenerateContract} className="space-y-3 max-h-[65vh] overflow-y-auto pr-1">
              {/* Dados do comprador */}
              <p className="text-zinc-500 text-xs uppercase tracking-wider pt-1">Dados do Comprador</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 space-y-1">
                  <label className="text-xs text-zinc-400">RG do Comprador</label>
                  <input value={rg} onChange={(e) => setRg(e.target.value)} placeholder="00000000 SSP-AM"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#d4a017]" />
                </div>
              </div>

              {/* Veículo */}
              <p className="text-zinc-500 text-xs uppercase tracking-wider pt-1">Veículo</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-zinc-400">Preço de Venda (R$) *</label>
                  <input type="number" step="0.01" value={salePrice} onChange={(e) => setSalePrice(e.target.value)} required
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#d4a017]" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-zinc-400">Data de Entrega</label>
                  <input type="date" value={deliveryDate} onChange={(e) => setDeliveryDate(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#d4a017]" />
                </div>
              </div>

              {/* Pagamento */}
              <p className="text-zinc-500 text-xs uppercase tracking-wider pt-1">Pagamento</p>
              <div className="space-y-1">
                <label className="text-xs text-zinc-400">Forma Principal *</label>
                <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#d4a017]">
                  {PAYMENT_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-zinc-400">Valor da Entrada (R$)</label>
                  <input type="number" step="0.01" value={entryAmount} onChange={(e) => setEntryAmount(e.target.value)} placeholder="0,00"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#d4a017]" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-zinc-400">2º Pagamento (R$)</label>
                  <input type="number" step="0.01" value={secondPayment} onChange={(e) => setSecondPayment(e.target.value)} placeholder="0,00"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#d4a017]" />
                </div>
                <div className="col-span-2 space-y-1">
                  <label className="text-xs text-zinc-400">Vencimento do 2º Pagamento</label>
                  <input type="date" value={secondPayDate} onChange={(e) => setSecondPayDate(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#d4a017]" />
                </div>
              </div>

              {/* Promissórias */}
              <p className="text-zinc-500 text-xs uppercase tracking-wider pt-1">Promissórias (parcelas)</p>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-zinc-400">Qtd. parcelas</label>
                  <input type="number" min="0" value={installmentCount} onChange={(e) => setInstallmentCount(e.target.value)} placeholder="10"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#d4a017]" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-zinc-400">Valor cada (R$)</label>
                  <input type="number" step="0.01" value={installmentAmount} onChange={(e) => setInstallmentAmount(e.target.value)} placeholder="3500,00"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#d4a017]" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-zinc-400">1ª parcela</label>
                  <input type="date" value={installmentStart} onChange={(e) => setInstallmentStart(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#d4a017]" />
                </div>
              </div>

              <div className="flex gap-3 pt-3">
                <button type="submit"
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#d4a017] hover:bg-[#b8860b] text-black font-bold rounded-xl transition-colors text-sm">
                  <FileText size={14} /> Gerar Contrato
                </button>
                <button type="button" onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl transition-colors text-sm">
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
