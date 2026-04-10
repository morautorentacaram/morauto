"use client"

import { useState } from "react"
import { FileDown, Loader2, X } from "lucide-react"

type Props = { contract: any }

export default function ContractPdfButton({ contract }: Props) {
  const [loading, setLoading]         = useState(false)
  const [showModal, setShowModal]     = useState(false)
  const [useCaucao, setUseCaucao]     = useState(true)
  const [caucaoValue, setCaucaoValue] = useState<string>("")
  const [returnDate, setReturnDate]   = useState<string>("")
  const [returnTime, setReturnTime]   = useState<string>("")

  // Pre-fill modal values when opening
  function openModal() {
    const TZ = "America/Manaus"
    const defaultCaucao = Number(contract.reservation?.vehicle?.category?.depositValue ?? 0)
    setCaucaoValue(defaultCaucao > 0 ? String(defaultCaucao) : "")
    setUseCaucao(defaultCaucao > 0)

    // Pré-preenche devolução: data do endDate + horário do startDate (mesmo horário da retirada)
    const start = new Date(contract.reservation.startDate)
    const end   = new Date(contract.reservation.endDate)

    // Data de devolução: usa a data UTC do endDate (evita shift de fuso — meia-noite UTC = dia anterior em Manaus)
    setReturnDate(end.toISOString().slice(0, 10))

    // Horário da retirada no formato HH:MM (fuso Manaus) — mesmo horário para devolução
    const startTime = start.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: TZ })
    setReturnTime(startTime.replace("h", "").trim())

    setShowModal(true)
  }

  /** Combina returnDate + returnTime em um objeto Date para usar no PDF */
  function getReturnDateTime(): Date {
    if (returnDate && returnTime) {
      // Monta como horário de Manaus (UTC-4)
      return new Date(`${returnDate}T${returnTime}:00-04:00`)
    }
    return new Date(contract.reservation.endDate)
  }

  async function handleExport() {
    setShowModal(false)
    setLoading(true)
    try {
      const { default: jsPDF }     = await import("jspdf")
      const { default: autoTable } = await import("jspdf-autotable")

      // Carrega logo como base64
      const logoBase64: string = await new Promise((resolve) => {
        const img = new Image()
        img.crossOrigin = "anonymous"
        img.onload = () => {
          const canvas = document.createElement("canvas")
          canvas.width = img.naturalWidth
          canvas.height = img.naturalHeight
          const ctx = canvas.getContext("2d")!
          ctx.drawImage(img, 0, 0)
          resolve(canvas.toDataURL("image/png"))
        }
        img.onerror = () => resolve("")
        img.src = "/logo.png"
      })

      const { reservation, customer } = contract
      const { vehicle } = reservation
      const payment = reservation.payments?.[0]

      // Data/hora exatos da geração do PDF — fuso de Manaus (UTC-4)
      const TZ = "America/Manaus"
      const now = new Date()
      const generatedAt = now.toLocaleDateString("pt-BR", { timeZone: TZ }) + " às " +
        now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: TZ }) + "h"
      const cityDate = `Manaus, ${now.toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric", timeZone: TZ })}, ` +
        `às ${now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: TZ })}h`

      const doc  = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" })
      const W    = doc.internal.pageSize.getWidth()
      const H    = doc.internal.pageSize.getHeight()
      const gold  = [212, 160, 23]  as [number, number, number]
      const dark  = [24,  24,  27]  as [number, number, number]
      const gray  = [113, 113, 122] as [number, number, number]
      const white = [255, 255, 255] as [number, number, number]
      const black = [0,   0,   0]   as [number, number, number]
      const ink   = [30,  30,  30]  as [number, number, number]

      const fmt = (v: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v)
      const fmtDate = (d: string | Date) => new Date(d).toLocaleDateString("pt-BR", { timeZone: TZ })
      const fmtDateTime = (d: string | Date) => {
        const dt = new Date(d)
        return `${dt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: TZ })}h ${fmtDate(dt)}`
      }

      const returnDateTime = getReturnDateTime()
      const days = Math.max(1, Math.ceil(
        (returnDateTime.getTime() - new Date(reservation.startDate).getTime()) / 86400000
      ))
      const dailyRate  = Number(vehicle.category.dailyRate)
      const totalValue = Number(reservation.totalValue)
      const kmExcess   = 0.58

      // Caução: usa o valor do modal (pode ser zero se usuário optou por não incluir)
      const depositValue = useCaucao ? Number(caucaoValue || 0) : 0

      const paymentLabel =
        payment?.status === "PAID"            ? "PAGO"
        : payment?.method === "PIX"           ? "PIX"
        : payment?.method === "CREDIT_CARD"   ? "Cartão de Crédito"
        : payment?.method === "DEBIT_CARD"    ? "Cartão de Débito"
        : payment?.method === "CASH"          ? "Dinheiro"
        : payment?.method === "BANK_TRANSFER" ? "Transferência Bancária"
        : "A combinar"

      // ── Header ─────────────────────────────────────────────────────────────
      doc.setFillColor(...dark)
      doc.rect(0, 0, W, 30, "F")
      doc.setFillColor(...gold)
      doc.rect(0, 30, W, 1.2, "F")

      if (logoBase64) {
        doc.addImage(logoBase64, "PNG", 12, 4, 44, 18)
      } else {
        doc.setFont("helvetica", "bold")
        doc.setFontSize(22)
        doc.setTextColor(...white)
        doc.text("MORAUTO.", 14, 14)
      }
      doc.setFontSize(8)
      doc.setFont("helvetica", "normal")
      doc.setTextColor(...gray)
      doc.text("LOCADORA DE VEÍCULOS E MÁQUINAS", 14, 24)
      doc.text("CNPJ: 22.994.313/0001-45", 14, 28.5)

      // Contract number + gerado em (data + hora)
      doc.setFont("helvetica", "bold")
      doc.setFontSize(9)
      doc.setTextColor(...gold)
      doc.text(contract.number, W - 14, 14, { align: "right" })
      doc.setFont("helvetica", "normal")
      doc.setFontSize(7)
      doc.setTextColor(...gray)
      doc.text(`Gerado em ${generatedAt}`, W - 14, 20, { align: "right" })
      if (contract.signedAt) {
        doc.setTextColor(34, 197, 94)
        doc.text(`✓ Assinado em ${new Date(contract.signedAt).toLocaleDateString("pt-BR")}`, W - 14, 25.5, { align: "right" })
      } else {
        doc.setTextColor(251, 191, 36)
        doc.text("Aguardando assinatura", W - 14, 25.5, { align: "right" })
      }

      // Title
      doc.setFont("helvetica", "bold")
      doc.setFontSize(13)
      doc.setTextColor(...ink)
      doc.text("CONTRATO DE LOCAÇÃO DE AUTOMÓVEL", W / 2, 40, { align: "center" })
      doc.setFontSize(10)
      doc.setFont("helvetica", "normal")
      doc.setTextColor(...gray)
      doc.text("DE PRAZO DETERMINADO", W / 2, 46, { align: "center" })

      let y = 54

      // ── Section helper ──────────────────────────────────────────────────────
      function sectionTitle(title: string) {
        doc.setFillColor(245, 245, 245)
        doc.rect(14, y - 4, W - 28, 7, "F")
        doc.setFont("helvetica", "bold")
        doc.setFontSize(8)
        doc.setTextColor(...dark)
        doc.text(title.toUpperCase(), 16, y)
        y += 5
      }

      function field(label: string, value: string, x = 14, indent = 0) {
        doc.setFont("helvetica", "bold")
        doc.setFontSize(7.5)
        doc.setTextColor(...gray)
        doc.text(label + ":", x + indent, y)
        doc.setFont("helvetica", "normal")
        doc.setTextColor(...ink)
        const labelW = doc.getTextWidth(label + ":") + 2
        doc.text(value || "—", x + indent + labelW, y)
        y += 5
      }

      // ── Partes ──────────────────────────────────────────────────────────────
      sectionTitle("Locadora")
      field("Razão Social", "MORAUTO LOCADORA DE VEÍCULOS E MÁQUINAS LTDA")
      field("CNPJ", "22.994.313/0001-45")
      field("Endereço", "Av. Álvaro Maia, N.176-A, Pres. Vargas, CEP 69025-360, Manaus-AM")
      field("Telefone", "(92) 3622-2883 / 99292-1946")
      y += 2

      sectionTitle("Locatário")
      field("Nome", String(customer.user.name ?? "").toUpperCase())
      field("CPF/CNPJ", customer.document)
      field("Telefone", customer.phone ?? "—")
      field("Endereço", customer.address ?? "—")
      field("CNH", customer.cnh ?? "—", 14)
      y += 2

      // ── Objeto ──────────────────────────────────────────────────────────────
      sectionTitle("Do Objeto do Contrato — Veículo")

      autoTable(doc, {
        startY: y,
        head: [["Campo", "Valor", "Campo", "Valor"]],
        body: [
          ["Marca/Modelo", `${vehicle.brand} ${vehicle.model}${vehicle.version ? " " + vehicle.version : ""}`, "Categoria", vehicle.category.name],
          ["Ano", String(vehicle.year), "Cor", vehicle.color ?? "—"],
          ["Placa", vehicle.plate, "RENAVAM", vehicle.renavam ?? "—"],
          ["Chassi", vehicle.chassi ?? "—", "KM Saída", `${(vehicle.km ?? 0).toLocaleString("pt-BR")} km`],
        ],
        theme: "grid",
        headStyles: { fillColor: gold, textColor: black, fontStyle: "bold", fontSize: 7.5 },
        bodyStyles: { fontSize: 7.5, textColor: ink as any },
        columnStyles: { 0: { fontStyle: "bold", fillColor: [248,248,248], cellWidth: 32 }, 2: { fontStyle: "bold", fillColor: [248,248,248], cellWidth: 32 } },
        styles: { cellPadding: 2.5 },
        margin: { left: 14, right: 14 },
      })
      y = (doc as any).lastAutoTable.finalY + 4

      // ── Período e Valores ───────────────────────────────────────────────────
      sectionTitle("Período, Valores e Condições Financeiras")

      autoTable(doc, {
        startY: y,
        head: [["Campo", "Valor"]],
        body: [
          ["Retirada",        fmtDateTime(reservation.startDate)],
          ["Devolução",       fmtDateTime(returnDateTime)],
          ["Duração",         `${days} dia(s)`],
          ["Diária",          fmt(dailyRate)],
          ["Valor Total",     fmt(totalValue)],
          ...(depositValue > 0 ? [["Caução / Garantia", fmt(depositValue)]] : []),
          ["Forma de Pagamento", paymentLabel],
          ["Franquia km/dia", "214,28 km/dia"],
          ["Km excedente",    `${fmt(kmExcess)} por km`],
          ["Limite semanal",  "1.000 km/semana"],
          ["Taxa administrativa", "10% sobre serviços adicionais"],
        ],
        theme: "striped",
        headStyles: { fillColor: gold, textColor: black, fontStyle: "bold", fontSize: 7.5 },
        bodyStyles: { fontSize: 7.5, textColor: ink as any },
        columnStyles: { 0: { fontStyle: "bold", cellWidth: 55 }, 1: { cellWidth: 100 } },
        styles: { cellPadding: 2.5 },
        margin: { left: 14, right: 14 },
      })
      y = (doc as any).lastAutoTable.finalY + 4

      // ── Cláusulas ──────────────────────────────────────────────────────────
      if (y > 220) { doc.addPage(); y = 20 }
      sectionTitle("Normas e Cláusulas Gerais")

      const clauses = [
        { n: "1.", t: "REABASTECIMENTO", b: "No caso de devolução do veículo com quantidade de combustível inferior à registrada no momento de entrega, o tanque será completado com gasolina (mesmo que bicombustível), sendo o valor do abastecimento e taxas cobrados no contrato. O combustível gasto no percurso até o local de entrega é de responsabilidade do cliente." },
        { n: "2.", t: "LIMPEZA DO VEÍCULO", b: "Deverá ser devolvido nas mesmas condições de limpeza. Em devolução divergente: lavagem simples R$ 50,00. Em caso de manchas ou odores: higienização a partir de R$ 300,00 ou valor superior." },
        { n: "3.", t: "DOCUMENTOS PERDIDOS", b: "Caso não devolvidos junto com o veículo: custo de R$ 300,00 + 3 diárias de locação." },
        { n: "4.", t: "VEÍCULO REBOCADO", b: "Retirada de veículo rebocado: R$ 500,00 + custos de multa e reboque, em casos de culpabilidade do condutor." },
        { n: "5.", t: "TAXAS DE ENTREGA/DEVOLUÇÃO", b: "Veículo entregue ou recebido fora da locadora em horário não comercial: taxa de R$ 50,00 por evento." },
        { n: "6.", t: "CHAVE DO VEÍCULO", b: "O desaparecimento da chave terá reposição cobrada conforme modelo (chave codificada ou integrada com alarme)." },
        { n: "7.", t: "HORAS EXTRAS", b: "A diária é de 24 horas. Hora extra = 1/6 da diária. Após a 6ª hora extra, cobra-se diária integral. Proteções e serviços adicionais incidem integralmente." },
        { n: "8.", t: "RESPONSABILIDADE POR MULTAS", b: "O Locatário é responsável por todas as multas de trânsito incidentes durante o período de locação, nos termos do art. 257 do CTB." },
        { n: "9.", t: "SUBLOCAÇÃO PROIBIDA", b: "É expressamente proibida a sublocação total ou parcial do veículo, bem como sua utilização para fins ilícitos ou transporte remunerado sem autorização escrita." },
        { n: "10.", t: "RESTRIÇÃO TERRITORIAL", b: "VEÍCULO NÃO AUTORIZADO A ULTRAPASSAR A FRONTEIRA BRASIL/VENEZUELA — uso restrito à cidade de Manaus-AM, salvo autorização expressa por escrito." },
      ]

      autoTable(doc, {
        startY: y,
        body: clauses.map((c) => [`${c.n} ${c.t}`, c.b]),
        theme: "plain",
        bodyStyles: { fontSize: 7, textColor: ink as any, cellPadding: [1.5, 2.5] },
        columnStyles: { 0: { fontStyle: "bold", cellWidth: 42, fillColor: [248,248,248] } },
        styles: { lineColor: [220,220,220], lineWidth: 0.2 },
        margin: { left: 14, right: 14 },
      })
      y = (doc as any).lastAutoTable.finalY + 4

      // ── Exclusão de Proteção ───────────────────────────────────────────────
      if (y > 220) { doc.addPage(); y = 20 }
      sectionTitle("Exclusão da Proteção")
      doc.setFont("helvetica", "normal")
      doc.setFontSize(7)
      doc.setTextColor(...ink)
      const exclusaoLines = doc.splitTextToSize(
        `O Locatário é 100% responsável por qualquer dano, roubo, furto ou assistência. Será responsável pelo total dos danos independente de culpa, na eventualidade de: a) Uso Indevido. b) Danos aos vidros, rodas, bancos e/ou acessórios. c) Dirigir em violação de qualquer lei de trânsito. d) Permitir uso por motorista adicional não autorizado por escrito. e) O cliente está ciente que o veículo NÃO possui seguro. f) O locatário é responsável pela manutenção do veículo.`,
        W - 28
      )
      doc.text(exclusaoLines, 14, y)
      y += exclusaoLines.length * 4 + 4

      // ── Autorização de Débito ───────────────────────────────────────────────
      if (y > 220) { doc.addPage(); y = 20 }
      sectionTitle("Autorização de Débito")
      const autLines = doc.splitTextToSize(
        `Como cliente titular, autorizo a MORAUTO LOCADORA DE VEÍCULOS E MÁQUINAS LTDA — CNPJ 22.994.313/0001-45 — a debitar nos meus cartões de crédito/débito ou emitir cobrança em meu nome para reembolsar multas de trânsito, combustível, avarias, limpeza e outras despesas adicionais apontadas no check-list de devolução, acrescidas da taxa administrativa prevista neste contrato. Autorizo ainda a informar meus dados aos órgãos de trânsito como CONDUTOR(A) DO VEÍCULO LOCADO, nos termos da Resolução CONTRAN N.461/2013.`,
        W - 28
      )
      doc.text(autLines, 14, y)
      y += autLines.length * 4 + 4

      // ── Foro + data/hora ───────────────────────────────────────────────────
      if (y > 240) { doc.addPage(); y = 20 }
      doc.setFont("helvetica", "bold")
      doc.setFontSize(7.5)
      doc.setTextColor(...ink)
      doc.text("DO FORO:", 14, y)
      doc.setFont("helvetica", "normal")
      doc.text("Para dirimir quaisquer controvérsias, as partes elegem o foro da comarca de Manaus — Amazonas.", 14 + doc.getTextWidth("DO FORO: "), y)
      y += 6

      doc.text(cityDate, W / 2, y, { align: "center" })
      y += 12

      // ── Assinaturas ─────────────────────────────────────────────────────────
      if (y + 40 > H - 20) { doc.addPage(); y = 20 }

      const boxW = (W - 42) / 2
      doc.setDrawColor(...gray)
      doc.setLineWidth(0.3)
      doc.line(14, y + 18, 14 + boxW, y + 18)
      doc.setFont("helvetica", "bold")
      doc.setFontSize(7.5)
      doc.setTextColor(...ink)
      doc.text("MORAUTO LOCADORA DE VEÍCULOS", 14 + boxW / 2, y + 23, { align: "center" })
      doc.setFont("helvetica", "normal")
      doc.setFontSize(6.5)
      doc.setTextColor(...gray)
      doc.text("(LOCADORA)  CNPJ 22.994.313/0001-45", 14 + boxW / 2, y + 27, { align: "center" })

      const xR = W - 14 - boxW
      doc.line(xR, y + 18, xR + boxW, y + 18)
      doc.setFont("helvetica", "bold")
      doc.setFontSize(7.5)
      doc.setTextColor(...ink)
      doc.text(String(customer.user.name ?? "LOCATÁRIO").toUpperCase(), xR + boxW / 2, y + 23, { align: "center" })
      doc.setFont("helvetica", "normal")
      doc.setFontSize(6.5)
      doc.setTextColor(...gray)
      doc.text(`(LOCATÁRIO)  CPF/CNPJ: ${customer.document}`, xR + boxW / 2, y + 27, { align: "center" })
      y += 35

      // Testemunhas
      const wBoxW = (W - 42) / 2
      doc.setFont("helvetica", "normal")
      doc.setFontSize(7)
      doc.setTextColor(...gray)
      doc.line(14, y + 12, 14 + wBoxW, y + 12)
      doc.text("(Nome, RG e assinatura da Testemunha 1)", 14 + wBoxW / 2, y + 16, { align: "center" })
      doc.line(xR, y + 12, xR + wBoxW, y + 12)
      doc.text("(Nome, RG e assinatura da Testemunha 2)", xR + wBoxW / 2, y + 16, { align: "center" })
      y += 24

      doc.setFontSize(6.5)
      doc.setTextColor(...gray)
      doc.text("Nota: 1. A Locação de Coisas rege-se pelo previsto nos Arts. 1188 a 1215 do Código Civil.", 14, y)
      y += 4
      doc.text("2. Art. 1192 do Código Civil.   3. Art. 1196 do Código Civil.", 14, y)

      // ── Footer em todas as páginas ────────────────────────────────────────
      const pageCount = (doc as any).internal.getNumberOfPages()
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setFillColor(...dark)
        doc.rect(0, H - 12, W, 12, "F")
        doc.setFillColor(...gold)
        doc.rect(0, H - 12, W, 0.8, "F")
        doc.setFontSize(6.5)
        doc.setFont("helvetica", "bold")
        doc.setTextColor(...white)
        doc.text("MORAUTO LOCADORA DE VEÍCULOS E MÁQUINAS EIRELI  ·  CNPJ: 22.994.313/0001-45", W / 2, H - 7, { align: "center" })
        doc.setFont("helvetica", "normal")
        doc.setTextColor(...gray)
        doc.text("Av. Álvaro Maia 176-A, Presidente Vargas, CEP 69025-360, Manaus-AM  ·  (92) 3622-2883", W / 2, H - 3.5, { align: "center" })
        doc.text(`Página ${i}/${pageCount}`, W - 6, H - 7, { align: "right" })
      }

      doc.save(`contrato-${contract.number}.pdf`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Botão principal */}
      <button
        onClick={openModal}
        disabled={loading}
        className="flex items-center gap-2 bg-[#d4a017] hover:bg-[#b8860b] text-black font-bold px-4 py-2.5 rounded-xl text-sm transition-colors disabled:opacity-60"
      >
        {loading ? <Loader2 size={15} className="animate-spin" /> : <FileDown size={15} />}
        {loading ? "Gerando PDF..." : "Baixar Contrato PDF"}
      </button>

      {/* Modal de caução */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-bold text-base">Opções do Contrato</h2>
              <button onClick={() => setShowModal(false)} className="text-zinc-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            {/* Devolução — data e hora */}
            <div className="mb-5">
              <p className="text-zinc-400 text-xs mb-2 font-medium">Data e horário de devolução</p>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={returnDate}
                  onChange={e => setReturnDate(e.target.value)}
                  className="flex-1 bg-zinc-800 border border-zinc-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500"
                />
                <input
                  type="time"
                  value={returnTime}
                  onChange={e => setReturnTime(e.target.value)}
                  className="w-28 bg-zinc-800 border border-zinc-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Caução toggle */}
            <div className="mb-5">
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <div
                  onClick={() => setUseCaucao(v => !v)}
                  className={`relative w-10 h-5 rounded-full transition-colors ${useCaucao ? "bg-amber-500" : "bg-zinc-600"}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${useCaucao ? "translate-x-5" : "translate-x-0"}`} />
                </div>
                <span className="text-white text-sm font-medium">Incluir Caução / Garantia</span>
              </label>
            </div>

            {useCaucao && (
              <div className="mb-5">
                <label className="block text-zinc-400 text-xs mb-1.5">Valor da Caução (R$)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={caucaoValue}
                  onChange={e => setCaucaoValue(e.target.value)}
                  placeholder="Ex: 500.00"
                  className="w-full bg-zinc-800 border border-zinc-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500"
                />
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 bg-zinc-700 hover:bg-zinc-600 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleExport}
                className="flex-1 bg-amber-500 hover:bg-amber-400 text-black text-sm font-bold px-4 py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <FileDown size={14} />
                Gerar PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
