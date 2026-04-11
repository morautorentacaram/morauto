"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getSaleContractById, updateSaleContract } from "@/app/actions/sale.actions"
import { ChevronLeft, Plus, Trash2, Car, Save, Loader2 } from "lucide-react"
import Link from "next/link"

interface TradeIn {
  brand: string; model: string; year: string
  plate: string; renavam: string; chassi: string; observations: string
}
interface Installment { number: number; value: string; date: string }

export default function EditSaleContractPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [contractId, setContractId] = useState("")
  const [contract, setContract] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  // Form fields
  const [salePrice, setSalePrice]       = useState("")
  const [paymentMethod, setPaymentMethod] = useState("")
  const [rg, setRg]                     = useState("")
  const [address, setAddress]           = useState("")
  const [entryAmount, setEntryAmount]   = useState("")
  const [entryMethod, setEntryMethod]   = useState("PIX")
  const [deliveryDate, setDeliveryDate] = useState("")
  const [vehicleKm, setVehicleKm]       = useState("")
  const [observations, setObservations] = useState("")
  const [tradeIns, setTradeIns]         = useState<TradeIn[]>([])
  const [installments, setInstallments] = useState<Installment[]>([])

  useEffect(() => {
    params.then(({ id }) => {
      setContractId(id)
      getSaleContractById(id).then((c) => {
        if (!c) { router.push("/admin/vendas/contratos"); return }
        setContract(c)
        setSalePrice(String(c.salePrice))
        setPaymentMethod(c.paymentMethod ?? "PIX")
        let pay: any = {}
        try { pay = JSON.parse(c.paymentDetails ?? "{}") } catch {}
        setRg(pay.rg ?? "")
        setAddress(pay.address ?? c.lead?.address ?? "")
        setEntryAmount(pay.entryAmount ?? "")
        setEntryMethod(pay.entryMethod ?? "PIX")
        setDeliveryDate(pay.deliveryDate ?? "")
        setVehicleKm(pay.vehicleKm ?? String(c.vehicle?.km ?? ""))
        setObservations(pay.observations ?? "")
        const savedTrades = pay.tradeInVehicles
        if (savedTrades) setTradeIns(Array.isArray(savedTrades) ? savedTrades : JSON.parse(savedTrades))
        const savedInst = pay.installments
        if (savedInst) setInstallments(Array.isArray(savedInst) ? savedInst : JSON.parse(savedInst))
        setLoading(false)
      })
    })
  }, [])

  function addTradeIn() {
    setTradeIns(v => [...v, { brand: "", model: "", year: "", plate: "", renavam: "", chassi: "", observations: "" }])
  }
  function removeTradeIn(i: number) { setTradeIns(v => v.filter((_, idx) => idx !== i)) }
  function updateTradeIn(i: number, field: keyof TradeIn, val: string) {
    setTradeIns(v => v.map((t, idx) => idx === i ? { ...t, [field]: val } : t))
  }

  function addInstallment() {
    setInstallments(v => [...v, { number: v.length + 1, value: "", date: "" }])
  }
  function removeInstallment(i: number) {
    setInstallments(v => v.filter((_, idx) => idx !== i).map((inst, idx) => ({ ...inst, number: idx + 1 })))
  }
  function updateInstallment(i: number, field: keyof Installment, val: string) {
    setInstallments(v => v.map((inst, idx) => idx === i ? { ...inst, [field]: val } : inst))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError("")
    const fd = new FormData()
    fd.append("salePrice", salePrice)
    fd.append("paymentMethod", paymentMethod)
    fd.append("rg", rg)
    fd.append("address", address)
    fd.append("entryAmount", entryAmount)
    fd.append("entryMethod", entryMethod)
    fd.append("deliveryDate", deliveryDate)
    fd.append("vehicleKm", vehicleKm)
    fd.append("observations", observations)
    if (tradeIns.length > 0) fd.append("tradeInVehicles", JSON.stringify(tradeIns))
    if (installments.length > 0) fd.append("installments", JSON.stringify(installments))
    const result = await updateSaleContract(contractId, fd)
    setSaving(false)
    if (result?.error) { setError(result.error); return }
    router.push(`/admin/vendas/contratos/${contractId}`)
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="animate-spin text-amber-400" size={32} />
    </div>
  )

  const inp = "w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500"
  const lbl = "block text-zinc-400 text-xs mb-1.5 font-medium"

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <Link href={`/admin/vendas/contratos/${contractId}`} className="flex items-center gap-1.5 text-zinc-400 hover:text-white text-sm mb-4">
          <ChevronLeft size={16} /> Voltar ao Contrato
        </Link>
        <h1 className="text-2xl font-bold text-white">
          Editar Contrato <span className="text-amber-400">{contract?.number}</span>
        </h1>
        <p className="text-zinc-400 text-sm mt-1">{contract?.lead?.name} · {contract?.vehicle?.brand} {contract?.vehicle?.model}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Comprador */}
        <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-white font-bold text-sm uppercase tracking-wider">Comprador</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className={lbl}>RG</label><input className={inp} value={rg} onChange={e => setRg(e.target.value)} placeholder="Ex: 1234567 SSP-AM" /></div>
            <div className="md:col-span-2"><label className={lbl}>Endereço</label><input className={inp} value={address} onChange={e => setAddress(e.target.value)} placeholder="Rua, número, bairro, cidade" /></div>
          </div>
        </section>

        {/* Valores */}
        <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-white font-bold text-sm uppercase tracking-wider">Valores e Pagamento</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div><label className={lbl}>Valor de Venda (R$)</label><input type="number" className={inp} value={salePrice} onChange={e => setSalePrice(e.target.value)} step="0.01" /></div>
            <div><label className={lbl}>Valor de Entrada (R$)</label><input type="number" className={inp} value={entryAmount} onChange={e => setEntryAmount(e.target.value)} step="0.01" placeholder="0,00" /></div>
            <div>
              <label className={lbl}>Forma da Entrada</label>
              <select className={inp} value={entryMethod} onChange={e => setEntryMethod(e.target.value)}>
                <option value="PIX">PIX</option>
                <option value="Transferência Bancária">Transferência Bancária</option>
                <option value="Dinheiro">Dinheiro</option>
                <option value="Cartão de Crédito">Cartão de Crédito</option>
                <option value="Cartão de Débito">Cartão de Débito</option>
              </select>
            </div>
            <div>
              <label className={lbl}>Forma de Pagamento (geral)</label>
              <select className={inp} value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
                <option value="PIX">PIX</option>
                <option value="Transferência Bancária">Transferência Bancária</option>
                <option value="Financiamento">Financiamento</option>
                <option value="À Vista">À Vista</option>
                <option value="Promissórias">Promissórias</option>
              </select>
            </div>
            <div><label className={lbl}>KM do Veículo</label><input type="number" className={inp} value={vehicleKm} onChange={e => setVehicleKm(e.target.value)} /></div>
            <div><label className={lbl}>Data de Entrega</label><input type="date" className={inp} value={deliveryDate} onChange={e => setDeliveryDate(e.target.value)} /></div>
          </div>
          <div><label className={lbl}>Observações</label><textarea className={inp + " min-h-[80px] resize-y"} value={observations} onChange={e => setObservations(e.target.value)} placeholder="Ex: O comprador se compromete a..." /></div>
        </section>

        {/* Veículos como entrada */}
        <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-white font-bold text-sm uppercase tracking-wider flex items-center gap-2"><Car size={14} className="text-amber-400" /> Veículos como Entrada</h2>
            <button type="button" onClick={addTradeIn} className="flex items-center gap-1.5 text-sm text-amber-400 hover:text-amber-300 font-medium">
              <Plus size={14} /> Adicionar
            </button>
          </div>
          {tradeIns.length === 0 && <p className="text-zinc-500 text-sm">Nenhum veículo de troca adicionado.</p>}
          {tradeIns.map((tv, i) => (
            <div key={i} className="bg-zinc-800 border border-zinc-700 rounded-xl p-4 space-y-3 relative">
              <button type="button" onClick={() => removeTradeIn(i)} className="absolute top-3 right-3 text-red-400 hover:text-red-300"><Trash2 size={14} /></button>
              <p className="text-zinc-300 text-xs font-bold">Veículo {i + 1}</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div><label className={lbl}>Marca</label><input className={inp} value={tv.brand} onChange={e => updateTradeIn(i, "brand", e.target.value)} placeholder="Ex: Toyota" /></div>
                <div><label className={lbl}>Modelo</label><input className={inp} value={tv.model} onChange={e => updateTradeIn(i, "model", e.target.value)} placeholder="Ex: Hilux" /></div>
                <div><label className={lbl}>Ano</label><input className={inp} value={tv.year} onChange={e => updateTradeIn(i, "year", e.target.value)} placeholder="Ex: 2020" /></div>
                <div><label className={lbl}>Placa</label><input className={inp} value={tv.plate} onChange={e => updateTradeIn(i, "plate", e.target.value)} placeholder="Ex: QZH-8H17" /></div>
                <div><label className={lbl}>RENAVAM</label><input className={inp} value={tv.renavam} onChange={e => updateTradeIn(i, "renavam", e.target.value)} /></div>
                <div><label className={lbl}>Chassi</label><input className={inp} value={tv.chassi} onChange={e => updateTradeIn(i, "chassi", e.target.value)} /></div>
              </div>
              <div><label className={lbl}>Observações do veículo</label><input className={inp} value={tv.observations} onChange={e => updateTradeIn(i, "observations", e.target.value)} placeholder="Ex: Quitado sem reserva de domínio" /></div>
            </div>
          ))}
        </section>

        {/* Parcelas */}
        <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-white font-bold text-sm uppercase tracking-wider">Parcelas / Promissórias</h2>
            <button type="button" onClick={addInstallment} className="flex items-center gap-1.5 text-sm text-amber-400 hover:text-amber-300 font-medium">
              <Plus size={14} /> Adicionar
            </button>
          </div>
          {installments.length === 0 && <p className="text-zinc-500 text-sm">Nenhuma parcela adicionada.</p>}
          {installments.map((inst, i) => (
            <div key={i} className="flex items-center gap-3 bg-zinc-800 border border-zinc-700 rounded-xl p-3">
              <span className="text-amber-400 font-bold text-sm w-6 flex-shrink-0">{inst.number}ª</span>
              <div className="flex-1"><label className={lbl}>Valor (R$)</label><input type="number" className={inp} value={inst.value} onChange={e => updateInstallment(i, "value", e.target.value)} step="0.01" placeholder="0,00" /></div>
              <div className="flex-1"><label className={lbl}>Vencimento</label><input className={inp} value={inst.date} onChange={e => updateInstallment(i, "date", e.target.value)} placeholder="Ex: 11/05/2026" /></div>
              <button type="button" onClick={() => removeInstallment(i)} className="text-red-400 hover:text-red-300 mt-4"><Trash2 size={14} /></button>
            </div>
          ))}
        </section>

        {error && <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3">{error}</p>}

        <div className="flex gap-3 justify-end">
          <Link href={`/admin/vendas/contratos/${contractId}`} className="px-6 py-2.5 bg-zinc-700 hover:bg-zinc-600 text-white font-medium rounded-xl text-sm transition-colors">
            Cancelar
          </Link>
          <button type="submit" disabled={saving} className="flex items-center gap-2 px-6 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-black font-bold rounded-xl text-sm transition-colors">
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            {saving ? "Salvando..." : "Salvar Alterações"}
          </button>
        </div>
      </form>
    </div>
  )
}
