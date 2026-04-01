"use client"

import { useState, useTransition } from "react"
import { realizeSale } from "@/app/actions/sale.actions"
import { useRouter } from "next/navigation"
import { ShoppingCart, X, DollarSign, Loader2, FileText } from "lucide-react"

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

export default function RealizarVendaButton({
  vehicleId,
  vehiclePrice,
}: {
  vehicleId: string
  vehiclePrice: number
}) {
  const [showModal, setShowModal] = useState(false)
  const [error, setError] = useState("")
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  // Buyer
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [document, setDocument] = useState("")
  const [address, setAddress] = useState("")
  const [rg, setRg] = useState("")

  // Payment
  const [salePrice, setSalePrice] = useState(String(vehiclePrice))
  const [paymentMethod, setPaymentMethod] = useState("PIX")
  const [deliveryDate, setDeliveryDate] = useState("")
  const [entryAmount, setEntryAmount] = useState("")
  const [secondPayment, setSecondPayment] = useState("")
  const [secondPayDate, setSecondPayDate] = useState("")
  const [installmentCount, setInstallmentCount] = useState("")
  const [installmentAmount, setInstallmentAmount] = useState("")
  const [installmentStart, setInstallmentStart] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    if (!name.trim() || !phone.trim()) {
      setError("Nome e telefone são obrigatórios.")
      return
    }
    const fd = new FormData()
    fd.set("name", name)
    fd.set("email", email)
    fd.set("phone", phone)
    if (document)        fd.set("document", document)
    if (address)         fd.set("address", address)
    if (rg)              fd.set("rg", rg)
    fd.set("salePrice", salePrice)
    fd.set("paymentMethod", paymentMethod)
    if (deliveryDate)    fd.set("deliveryDate", deliveryDate)
    if (entryAmount)     fd.set("entryAmount", entryAmount)
    if (secondPayment)   fd.set("secondPayment", secondPayment)
    if (secondPayDate)   fd.set("secondPayDate", secondPayDate)
    if (installmentCount)  fd.set("installmentCount", installmentCount)
    if (installmentAmount) fd.set("installmentAmount", installmentAmount)
    if (installmentStart)  fd.set("installmentStart", installmentStart)

    startTransition(async () => {
      const res = await realizeSale(vehicleId, fd)
      if (res.error && !res.contractId) {
        setError(res.error)
        return
      }
      setShowModal(false)
      router.push(`/admin/vendas/contratos/${res.contractId}`)
    })
  }

  const inputCls = "w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#d4a017]"
  const labelCls = "text-xs text-zinc-400"

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center gap-2 px-4 py-2 bg-[#d4a017] hover:bg-[#b8860b] text-black font-bold rounded-xl text-sm transition-colors"
      >
        <ShoppingCart size={15} /> Realizar Venda
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <DollarSign size={18} className="text-[#d4a017]" /> Realizar Venda
              </h3>
              <button onClick={() => setShowModal(false)} className="text-zinc-500 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            {error && (
              <div className="mb-4 text-red-400 text-sm bg-red-900/20 p-3 rounded-lg border border-red-900/50">{error}</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3 overflow-y-auto pr-1 flex-1">
              {/* Comprador */}
              <p className="text-zinc-500 text-xs uppercase tracking-wider">Dados do Comprador</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 space-y-1">
                  <label className={labelCls}>Nome Completo *</label>
                  <input value={name} onChange={(e) => setName(e.target.value)} required placeholder="João da Silva"
                    className={inputCls} />
                </div>
                <div className="space-y-1">
                  <label className={labelCls}>Telefone *</label>
                  <input value={phone} onChange={(e) => setPhone(e.target.value)} required placeholder="(92) 99999-9999"
                    className={inputCls} />
                </div>
                <div className="space-y-1">
                  <label className={labelCls}>E-mail</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@exemplo.com"
                    className={inputCls} />
                </div>
                <div className="space-y-1">
                  <label className={labelCls}>CPF/CNPJ</label>
                  <input value={document} onChange={(e) => setDocument(e.target.value)} placeholder="000.000.000-00"
                    className={inputCls} />
                </div>
                <div className="space-y-1">
                  <label className={labelCls}>RG</label>
                  <input value={rg} onChange={(e) => setRg(e.target.value)} placeholder="00000000 SSP-AM"
                    className={inputCls} />
                </div>
                <div className="col-span-2 space-y-1">
                  <label className={labelCls}>Endereço</label>
                  <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Rua, nº, bairro, cidade"
                    className={inputCls} />
                </div>
              </div>

              {/* Veículo */}
              <p className="text-zinc-500 text-xs uppercase tracking-wider pt-1">Veículo</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className={labelCls}>Preço de Venda (R$) *</label>
                  <input type="number" step="0.01" required value={salePrice} onChange={(e) => setSalePrice(e.target.value)}
                    className={inputCls} />
                </div>
                <div className="space-y-1">
                  <label className={labelCls}>Data de Entrega</label>
                  <input type="date" value={deliveryDate} onChange={(e) => setDeliveryDate(e.target.value)}
                    className={inputCls} />
                </div>
              </div>

              {/* Pagamento */}
              <p className="text-zinc-500 text-xs uppercase tracking-wider pt-1">Pagamento</p>
              <div className="space-y-1">
                <label className={labelCls}>Forma Principal *</label>
                <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className={inputCls}>
                  {PAYMENT_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className={labelCls}>Valor da Entrada (R$)</label>
                  <input type="number" step="0.01" value={entryAmount} onChange={(e) => setEntryAmount(e.target.value)} placeholder="0,00"
                    className={inputCls} />
                </div>
                <div className="space-y-1">
                  <label className={labelCls}>2º Pagamento (R$)</label>
                  <input type="number" step="0.01" value={secondPayment} onChange={(e) => setSecondPayment(e.target.value)} placeholder="0,00"
                    className={inputCls} />
                </div>
                <div className="col-span-2 space-y-1">
                  <label className={labelCls}>Vencimento do 2º Pagamento</label>
                  <input type="date" value={secondPayDate} onChange={(e) => setSecondPayDate(e.target.value)}
                    className={inputCls} />
                </div>
              </div>

              {/* Promissórias */}
              <p className="text-zinc-500 text-xs uppercase tracking-wider pt-1">Promissórias (parcelas)</p>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className={labelCls}>Qtd. parcelas</label>
                  <input type="number" min="0" value={installmentCount} onChange={(e) => setInstallmentCount(e.target.value)} placeholder="10"
                    className={inputCls} />
                </div>
                <div className="space-y-1">
                  <label className={labelCls}>Valor cada (R$)</label>
                  <input type="number" step="0.01" value={installmentAmount} onChange={(e) => setInstallmentAmount(e.target.value)} placeholder="3500,00"
                    className={inputCls} />
                </div>
                <div className="space-y-1">
                  <label className={labelCls}>1ª parcela</label>
                  <input type="date" value={installmentStart} onChange={(e) => setInstallmentStart(e.target.value)}
                    className={inputCls} />
                </div>
              </div>

              <div className="flex gap-3 pt-3 pb-1">
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#d4a017] hover:bg-[#b8860b] text-black font-bold rounded-xl transition-colors text-sm disabled:opacity-60"
                >
                  {isPending ? <Loader2 size={14} className="animate-spin" /> : <FileText size={14} />}
                  {isPending ? "Gerando..." : "Gerar Contrato"}
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
    </>
  )
}
