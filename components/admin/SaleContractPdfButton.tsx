"use client"

import { useState } from "react"
import { FileDown, Loader2 } from "lucide-react"

type Props = { contract: any }

const REPRESENTATIVE = {
  name: "Raimundo Vasconcelos Morais",
  rg:   "337050899 SSP-CE",
  cpf:  "877.683.483-20",
}

function fmtMoney(v: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v)
}
function fmtDate(d: string | Date) {
  return new Date(d).toLocaleDateString("pt-BR")
}
function fmtDateLong(d: string | Date) {
  return new Date(d).toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" })
}

// Converts number to full Portuguese words (simplified, handles up to 999 999)
function valorPorExtenso(valor: number): string {
  const unidades = ["","um","dois","três","quatro","cinco","seis","sete","oito","nove","dez","onze","doze","treze","quatorze","quinze","dezesseis","dezessete","dezoito","dezenove"]
  const dezenas  = ["","","vinte","trinta","quarenta","cinquenta","sessenta","setenta","oitenta","noventa"]
  const centenas = ["","cem","duzentos","trezentos","quatrocentos","quinhentos","seiscentos","setecentos","oitocentos","novecentos"]
  const milhar   = ["","mil","dois mil","três mil","quatro mil","cinco mil","seis mil","sete mil","oito mil","nove mil"]

  const inteiro = Math.round(valor)
  if (inteiro === 0) return "zero"

  const m = Math.floor(inteiro / 1000)
  const r = inteiro % 1000
  const c = Math.floor(r / 100)
  const d = Math.floor((r % 100) / 10)
  const u = r % 10

  let txt = ""
  if (m > 0) txt += (m < 10 ? milhar[m] : `${m} mil`) + (r > 0 ? " e " : "")
  if (c > 0) txt += centenas[c] + (r % 100 > 0 ? " e " : "")
  const rem = r % 100
  if (rem > 0) {
    if (rem < 20) txt += unidades[rem]
    else txt += dezenas[d] + (u > 0 ? " e " + unidades[u] : "")
  }
  return txt.trim()
}

export default function SaleContractPdfButton({ contract }: Props) {
  const [loading, setLoading] = useState(false)

  async function handleExport() {
    setLoading(true)
    try {
      const { default: jsPDF }     = await import("jspdf")
      await import("jspdf-autotable")

      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" }) as any
      const W   = doc.internal.pageSize.getWidth()
      const H   = doc.internal.pageSize.getHeight()

      const { vehicle, lead } = contract
      const salePrice = Number(contract.salePrice)

      // Parse payment details (may be JSON or plain text)
      let payInfo: Record<string, string> = {}
      try { payInfo = JSON.parse(contract.paymentDetails ?? "{}") } catch { /* noop */ }

      const entryAmount      = payInfo.entryAmount      ? Number(payInfo.entryAmount)      : null
      const secondPayment    = payInfo.secondPayment    ? Number(payInfo.secondPayment)     : null
      const secondPayDate    = payInfo.secondPayDate    ?? null
      const installmentCount = payInfo.installmentCount ? Number(payInfo.installmentCount) : null
      const installmentAmount= payInfo.installmentAmount? Number(payInfo.installmentAmount): null
      const installmentStart = payInfo.installmentStart ?? null
      const deliveryDate     = payInfo.deliveryDate     ?? fmtDate(contract.createdAt)
      const vehicleKm        = payInfo.vehicleKm        ?? String(vehicle.km ?? 0)

      // ── helpers ────────────────────────────────────────────────────────────
      let y = 0

      function checkPage(need = 12) {
        if (y + need > H - 18) { doc.addPage(); y = 18 }
      }

      function header() {
        doc.setFillColor(18, 18, 18)
        doc.rect(0, 0, W, 22, "F")
        doc.setFillColor(212, 160, 23)
        doc.rect(0, 22, W, 0.8, "F")
        doc.setFont("helvetica", "bold")
        doc.setFontSize(15)
        doc.setTextColor(212, 160, 23)
        doc.text("MORAUTO.", 14, 10)
        doc.setFont("helvetica", "normal")
        doc.setFontSize(7)
        doc.setTextColor(160, 160, 160)
        doc.text("LOCADORA DE VEÍCULOS E MÁQUINAS  ·  CNPJ: 22.994.313/0001-45", 14, 16)
        doc.setFont("helvetica", "bold")
        doc.setFontSize(8)
        doc.setTextColor(212, 160, 23)
        doc.text(contract.number, W - 14, 10, { align: "right" })
        doc.setFont("helvetica", "normal")
        doc.setFontSize(7)
        doc.setTextColor(160, 160, 160)
        doc.text(`Emitido: ${fmtDate(contract.createdAt)}`, W - 14, 16, { align: "right" })
        y = 30
      }

      function title(txt: string) {
        doc.setFont("helvetica", "bold")
        doc.setFontSize(11)
        doc.setTextColor(18, 18, 18)
        doc.text(txt, W / 2, y, { align: "center" })
        y += 6
      }

      function sectionBar(txt: string) {
        checkPage(10)
        doc.setFillColor(240, 240, 240)
        doc.rect(14, y - 3.5, W - 28, 7, "F")
        doc.setFont("helvetica", "bold")
        doc.setFontSize(7.5)
        doc.setTextColor(40, 40, 40)
        doc.text(txt, 16, y + 0.5)
        y += 6
      }

      function paragraph(txt: string, indent = 0, bold = false) {
        const maxW = W - 28 - indent
        doc.setFont("helvetica", bold ? "bold" : "normal")
        doc.setFontSize(8)
        doc.setTextColor(40, 40, 40)
        const lines: string[] = doc.splitTextToSize(txt, maxW)
        lines.forEach((line: string) => {
          checkPage(5)
          doc.text(line, 14 + indent, y)
          y += 4.5
        })
        y += 0.5
      }

      function clausula(num: string, titulo: string, corpo: string) {
        checkPage(14)
        doc.setFont("helvetica", "bold")
        doc.setFontSize(8)
        doc.setTextColor(18, 18, 18)
        const lines: string[] = doc.splitTextToSize(`${num} ${titulo ? "– " + titulo + " – " : ""}${corpo}`, W - 28)
        lines.forEach((line: string, i: number) => {
          checkPage(5)
          if (i === 0) {
            doc.setFont("helvetica", "bold")
            doc.setFontSize(8)
          } else {
            doc.setFont("helvetica", "normal")
            doc.setFontSize(8)
            doc.setTextColor(40, 40, 40)
          }
          doc.text(line, 14, y)
          y += 4.8
        })
        y += 1
      }

      function signLine(x: number, w: number, name: string, sub: string) {
        doc.setDrawColor(100, 100, 100)
        doc.setLineWidth(0.3)
        doc.line(x, y + 14, x + w, y + 14)
        doc.setFont("helvetica", "bold")
        doc.setFontSize(7)
        doc.setTextColor(30, 30, 30)
        doc.text(name, x + w / 2, y + 18, { align: "center" })
        doc.setFont("helvetica", "normal")
        doc.setFontSize(6.5)
        doc.setTextColor(120, 120, 120)
        doc.text(sub, x + w / 2, y + 22, { align: "center" })
      }

      function footer() {
        const pages = doc.internal.getNumberOfPages()
        for (let i = 1; i <= pages; i++) {
          doc.setPage(i)
          // footer box
          doc.setFillColor(248, 248, 248)
          doc.rect(0, H - 16, W, 16, "F")
          doc.setDrawColor(200, 200, 200)
          doc.setLineWidth(0.3)
          doc.line(0, H - 16, W, H - 16)

          // company block (left)
          doc.setFont("helvetica", "bold")
          doc.setFontSize(7)
          doc.setTextColor(30, 30, 30)
          doc.text("MORAUTO LOCADORA DE VEÍCULOS E MÁQUINAS EIRELI", 14, H - 11.5)
          doc.setFont("helvetica", "normal")
          doc.setFontSize(6.5)
          doc.setTextColor(80, 80, 80)
          doc.text("CNPJ: 22.994.313/0001-45", 14, H - 8)
          doc.text("Av. Álvaro Maia - 176 A - Presidente Vargas - CEP: 69.025-360", 14, H - 4.5)
          doc.text("Contato: 92. 3622-2883 / 99292-1946  ·  E-mail: morautolocadora@hotmail.com", 14, H - 1.5)

          // FUNCIONAMENTO box (right)
          const bx = W - 52, bw = 38, bh = 13
          doc.setFillColor(255, 255, 255)
          doc.setDrawColor(180, 180, 180)
          doc.rect(bx, H - 15, bw, bh, "FD")
          doc.setFont("helvetica", "bold")
          doc.setFontSize(6)
          doc.setTextColor(30, 30, 30)
          doc.text("FUNCIONAMENTO", bx + bw / 2, H - 11.5, { align: "center" })
          doc.setFont("helvetica", "normal")
          doc.setFontSize(5.5)
          doc.setTextColor(80, 80, 80)
          doc.text("SEG a SEX: 8h às 17h", bx + bw / 2, H - 8.5, { align: "center" })
          doc.text("SÁB: 8h às 13h", bx + bw / 2, H - 5.5, { align: "center" })
          doc.text("DOM e Feriados: Fechado", bx + bw / 2, H - 2.5, { align: "center" })

          // page number
          doc.setFont("helvetica", "normal")
          doc.setFontSize(6)
          doc.setTextColor(150, 150, 150)
          doc.text(`Pág. ${i}/${pages}`, W - 14, H - 16.5)
        }
      }

      // ════════════════════════════════════════════════════════════════════════
      // PÁGINA 1 — CONTRATO
      // ════════════════════════════════════════════════════════════════════════
      header()
      y += 2
      title("CONTRATO DE COMPRA E VENDA COM RESERVA DE DOMÍNIO")
      y += 2

      paragraph("Pelo presente instrumento particular de COMPRA E VENDA COM RESERVA DE DOMÍNIO, os abaixo qualificados têm justo e acertado o seguinte que mutuamente aceitam e outorgam a saber:")
      y += 2

      // VENDEDOR
      sectionBar("VENDEDOR")
      paragraph(`MORAUTO LOCADORA DE VEÍCULOS E MAQUINAS LTDA, empresa comercial da praça de Manaus, Estado do Amazonas, estabelecida à Avenida Álvaro Maia, Nº176-A, Bairro: Presidente Vargas, CEP: 69025-360, legalmente inscrita no CNPJ sob o nº 22.994.313/0001-45, neste ato representada por seu sócio administrador ${REPRESENTATIVE.name}, portador da cédula de identidade RG nº ${REPRESENTATIVE.rg}, inscrito no CPF sob o nº ${REPRESENTATIVE.cpf}.`)
      y += 2

      // COMPRADOR
      sectionBar("COMPRADOR")
      paragraph(`${String(lead.name ?? "").toUpperCase()}, portador(a) da cédula de identidade RG nº ${payInfo.rg ?? "___________"}, inscrito(a) no CPF sob o nº ${lead.document ?? "_______________"}, telefone: ${lead.phone ?? "_______________"}, residente e domiciliado(a) à ${lead.address ?? "_______________"}.`)
      y += 2

      // CLÁUSULA I — OBJETO
      sectionBar("CLÁUSULA I — DO OBJETO")
      const vNome = `${vehicle.brand} ${vehicle.model}${vehicle.version ? " " + vehicle.version : ""}`
      paragraph(`O VENDEDOR vende ao COMPRADOR o veículo:`)

      doc.autoTable({
        startY: y,
        body: [
          ["Marca/Modelo", vNome, "Ano Fab./Mod.", `${vehicle.year}/${vehicle.year}`],
          ["Cor", (vehicle.color ?? "—").toUpperCase(), "KM", `${Number(vehicleKm).toLocaleString("pt-BR")} km`],
          ["Placa", vehicle.plate ?? "N/I", "RENAVAM", vehicle.renavam ?? "N/I"],
          ["Chassi", vehicle.chassi ?? "N/I", "Combustível", vehicle.fuelType ?? "—"],
        ],
        theme: "grid",
        bodyStyles: { fontSize: 7.5, textColor: [30,30,30] as any, cellPadding: 2 },
        columnStyles: {
          0: { fontStyle: "bold", fillColor: [245,245,245] as any, cellWidth: 28 },
          2: { fontStyle: "bold", fillColor: [245,245,245] as any, cellWidth: 28 },
        },
        styles: { lineColor: [200,200,200] as any },
        margin: { left: 14, right: 14 },
      })
      y = doc.lastAutoTable.finalY + 4

      // RESPONSABILIDADES
      sectionBar("DAS RESPONSABILIDADES")
      clausula("CLÁUSULA II.", "", `Fica responsável o VENDEDOR pela entrega do veículo livre de qualquer defeito que prejudique seu bom funcionamento, sendo responsável em repará-lo, caso este necessite de substituição das peças de motor, caixa de marcha e diferencial que compõem a parte de força pelo prazo de 90 dias.`)
      clausula("CLÁUSULA III.", "", `Compromete-se o VENDEDOR a entregar o veículo objeto deste contrato, na data de ${deliveryDate} ao COMPRADOR, nas condições do termo de vistoria em anexo ao presente instrumento. KM ${Number(vehicleKm).toLocaleString("pt-BR")}.`)
      clausula("CLÁUSULA IV.", "", `O veículo, objeto deste contrato, é usado e apresenta desgaste natural devido ao tempo, já inspecionado pelo COMPRADOR, que tomou ciência de suas condições e estado de conservação. O COMPRADOR, para garantir uma avaliação completa do veículo, contou com a assistência de seu mecânico de confiança, e constatou que nada de defeito mecânico que impeça seu bom funcionamento foi detectado, reafirmando que o comprador teve oportunidades de testar o mesmo e constatou que o veículo se encontra em perfeitas condições de funcionamento e uso.`)
      clausula("CLÁUSULA V.", "", `Havendo algum problema no funcionamento do motor, o COMPRADOR deverá informar ao VENDEDOR imediatamente, respeitando-se o prazo estipulado na Cláusula II do presente instrumento.`)
      clausula("CLÁUSULA VI.", "", `O VENDEDOR não se responsabilizará pelos danos causados no veículo por negligência do COMPRADOR, e por problemas decorrentes da não realização das revisões acertadas.`)

      // DO VALOR
      sectionBar("CLÁUSULA VII — DO VALOR")
      const valorExtenso = valorPorExtenso(salePrice)
      let pagamentoTexto = `A venda será feita pelo preço justo de ${fmtMoney(salePrice)} (${valorExtenso} reais).`
      if (entryAmount) pagamentoTexto += ` O VENDEDOR recebe do COMPRADOR como entrada o valor de ${fmtMoney(entryAmount)} (${valorPorExtenso(entryAmount)} reais) via ${contract.paymentMethod}.`
      if (secondPayment && secondPayDate) pagamentoTexto += ` E ainda o valor de ${fmtMoney(secondPayment)} (${valorPorExtenso(secondPayment)} reais) para o dia ${secondPayDate} em transferência bancária PIX.`
      if (installmentCount && installmentAmount) pagamentoTexto += ` O restante será pago em ${installmentCount} promissórias de ${fmtMoney(installmentAmount)} (${valorPorExtenso(installmentAmount)} reais) cada.`
      pagamentoTexto += " Após efetivos pagamentos dá-se total e plena quitação."
      paragraph(pagamentoTexto)

      if (installmentCount && installmentAmount && installmentStart) {
        y += 1
        const startDate = new Date(installmentStart)
        const rows = []
        for (let i = 0; i < installmentCount; i++) {
          const d = new Date(startDate)
          d.setMonth(d.getMonth() + i)
          rows.push([`${i + 1}ª Promissória`, fmtMoney(installmentAmount), fmtDate(d)])
        }
        doc.autoTable({
          startY: y,
          head: [["Parcela", "Valor", "Vencimento"]],
          body: rows,
          theme: "striped",
          headStyles: { fillColor: [18,18,18] as any, textColor: [212,160,23] as any, fontSize: 7.5, fontStyle: "bold" },
          bodyStyles: { fontSize: 7.5, textColor: [30,30,30] as any, cellPadding: 2 },
          columnStyles: { 0: { cellWidth: 40 }, 1: { cellWidth: 45 }, 2: { cellWidth: 45 } },
          styles: { lineColor: [200,200,200] as any },
          margin: { left: 14, right: 14 },
        })
        y = doc.lastAutoTable.finalY + 4
        paragraph("Parágrafo Primeiro — Se o pagamento for realizado através de cheque, a quitação será pro solvendo até a compensação bancária.")
      }

      // CLÁUSULAS VIII–XX
      clausula("CLÁUSULA VIII.", "", `Por força do pacto reservati dominii aqui expressamente instituído e aceito pelos contratantes, fica reservado ao VENDEDOR a propriedade do veículo condicionalmente vendido, qualificado no caput I, até o último pagamento estipulado na Cláusula VII. A posse direta do COMPRADOR não anula a indireta do VENDEDOR proprietário.`)
      clausula("CLÁUSULA IX.", "", `Em caso de execução, havendo mora no pagamento das parcelas, as partes ajustam expressamente que a dívida será considerada total com o vencimento antecipado das parcelas vincendas.`)
      clausula("CLÁUSULA X.", "", `Faltando o COMPRADOR ao pagamento da promissória no dia do vencimento ou deixando de cumprir quaisquer obrigações assumidas, considerar-se-á o contrato automaticamente rescindido, ficando constituído em mora, que incidirá em 0,5% (meio por cento) ao dia sobre o débito corrigido desde o vencimento, além de juros moratórios de 5% (cinco por cento) ao mês. Tendo opção o VENDEDOR de: (a) imediata reintegração na posse do veículo nos termos dos arts. 926 e ss. do CPC; ou (b) execução do contrato e cobrança de títulos nos termos dos arts. 1.070 e ss. do CPC.`)
      clausula("CLÁUSULA XI.", "", `Se o contrato se rescindir por culpa do COMPRADOR, este deverá arcar com as PERDAS E DANOS oriundas da depreciação do bem alienado, bem como as despesas que o VENDEDOR tiver feito em razão do inadimplemento contratual, conforme a Lei 8.078/90 (Código de Defesa do Consumidor).`)
      clausula("CLÁUSULA XII.", "", `Enquanto não houver sido pago INTEGRALMENTE o valor ajustado neste contrato, não poderá o COMPRADOR alugar, emprestar, vender, seja a qual título for, o bem objeto do presente, sendo-lhe expressamente vedada a modificação das características do veículo (chassis, placa, cor, potência do motor). Fica também proibido ao COMPRADOR modificar a categoria do veículo sem anuência do VENDEDOR.`)
      clausula("CLÁUSULA XIII.", "", `Não poderá o COMPRADOR transferir a terceiros, no todo ou em parte, os direitos e obrigações contraídas neste instrumento particular, sem anuência do VENDEDOR.`)
      clausula("CLÁUSULA XIV.", "", `Na vigência deste contrato, fica obrigado o COMPRADOR a manter o veículo e seus pertences em perfeito estado de conservação e funcionamento e a protegê-lo contra qualquer turbação de terceiros. Obriga-se ainda o COMPRADOR a avisar, por escrito, ao VENDEDOR o novo endereço em caso de mudança.`)
      clausula("CLÁUSULA XV.", "", `O COMPRADOR é o único responsável pelo bem alienado, tornando-se neste ato DEPOSITÁRIO FIEL do respectivo bem adquirido nos termos deste contrato, não se desobrigando em caso de acidente de trânsito, ainda que por culpa de terceiro, qualquer tipo de extravio, caso fortuito ou força maior.`)
      clausula("CLÁUSULA XVI.", "", `Se todas as prestações forem pagas, o comprador passará a ter, independentemente de qualquer formalidade, a posse e a propriedade do veículo. A transferência de propriedade será por conta do COMPRADOR.`)
      clausula("CLÁUSULA XVII.", "", `Todos os tributos de qualquer natureza, presentes ou futuros, que pesarem sobre o veículo, correrão por conta exclusiva do COMPRADOR. Em caso de multas, IPVA, roubos, pontuação na CNH e acidentes de trânsito até a data deste contrato, responsabilidade do VENDEDOR. Após esta data, do COMPRADOR.`)
      clausula("CLÁUSULA XVIII.", "", `Após o pagamento integral do presente contrato, o VENDEDOR emitirá ao COMPRADOR a CARTA DE DESALIENAÇÃO, a qual atribuirá o título de propriedade do bem objeto do presente contrato.`)
      clausula("CLÁUSULA XIX.", "", `O presente contrato vinculará não só os contratantes, como também os seus herdeiros e sucessores a qualquer título.`)
      clausula("CLÁUSULA XX.", "", `As partes contratantes elegem o foro da comarca de Manaus, Estado do Amazonas, para dissolver conflitos oriundos do presente contrato, por mais privilegiado que seja outro.`)

      // Fecho
      checkPage(12)
      paragraph(`E assim, por estarem justos e contratados entre si, VENDEDOR e COMPRADOR assinam em duas vias de igual teor e forma, na presença de duas testemunhas, para que este surta seus legais e jurídicos efeitos.`)
      y += 2
      paragraph(`Manaus (AM), ${fmtDateLong(contract.signedAt ?? contract.createdAt)}.`, 0, true)
      y += 6

      // Assinaturas — modelo real: 4 linhas em 2 colunas
      checkPage(52)
      const sw = (W - 42) / 2

      // Linha 1: Vendedor (esq) | Testemunha Ana Paula (dir)
      signLine(14,       sw, "RAIMUNDO VASCONCELOS MORAIS", "CNPJ: 22.994.313/0001-45")
      doc.setFont("helvetica", "normal")
      doc.setFontSize(6.5)
      doc.setTextColor(80, 80, 80)
      doc.text("VENDEDOR MORAUTO L. DE VEÍCULOS", 14 + sw / 2, y + 25, { align: "center" })
      signLine(14+sw+14, sw, "Ana Paula O. Baima", "CPF 700.922.052-24")
      y += 30

      // Linha 2: Comprador (esq) | CPF em branco (dir)
      checkPage(28)
      signLine(14,       sw, String(lead.name ?? "COMPRADOR").toUpperCase(), "COMPRADOR")
      doc.setFont("helvetica", "normal")
      doc.setFontSize(6.5)
      doc.setTextColor(80, 80, 80)
      doc.text(`CPF: ${lead.document ?? "—"}`, 14 + sw / 2, y + 25, { align: "center" })
      signLine(14+sw+14, sw, "CPF:", "")
      y += 28

      // ════════════════════════════════════════════════════════════════════════
      // PÁGINA — CERTIFICADO DE ENTREGA
      // ════════════════════════════════════════════════════════════════════════
      doc.addPage()
      header()
      y += 2
      title("CERTIFICADO DE ENTREGA")
      y += 4

      paragraph(`Declaro para os devidos fins que examinei e recebi, nesta data, o veículo descrito em perfeitas condições de uso, acompanhado dos devidos acessórios e ferramentas. Declaro ainda estar ciente de que se trata de um veículo usado, no estado em que se encontra e com as seguintes garantias abaixo especificadas.`)
      y += 2

      doc.autoTable({
        startY: y,
        body: [
          ["Marca/Modelo", vNome],
          ["Ano Fab./Mod.", `${vehicle.year}/${vehicle.year}`],
          ["Cor", (vehicle.color ?? "—").toUpperCase()],
          ["Placa", vehicle.plate ?? "N/I"],
          ["RENAVAM", vehicle.renavam ?? "N/I"],
          ["Chassi", vehicle.chassi ?? "N/I"],
          ["Combustível", vehicle.fuelType ?? "—"],
          ["KM na entrega", `${Number(vehicleKm).toLocaleString("pt-BR")} km`],
          ["Comprador", String(lead.name ?? "").toUpperCase()],
          ["CPF", lead.document ?? "—"],
          ["Data de entrega", deliveryDate],
        ],
        theme: "grid",
        bodyStyles: { fontSize: 8, textColor: [30,30,30] as any, cellPadding: 2.5 },
        columnStyles: { 0: { fontStyle: "bold", fillColor: [245,245,245] as any, cellWidth: 45 } },
        styles: { lineColor: [200,200,200] as any },
        margin: { left: 14, right: 14 },
      })
      y = doc.lastAutoTable.finalY + 12

      signLine(14, sw, String(lead.name ?? "COMPRADOR").toUpperCase(), `CPF: ${lead.document ?? "—"} — COMPRADOR`)
      y += 28

      // ════════════════════════════════════════════════════════════════════════
      // PÁGINA — CERTIFICADO DE QUALIDADE
      // ════════════════════════════════════════════════════════════════════════
      doc.addPage()
      header()
      y += 2
      title("CERTIFICADO DE QUALIDADE")
      y += 4

      paragraph(`MORAUTO VEÍCULOS, tendo promovido especificada vistoria no veículo acima descrito, garante o motor (suas partes internas de força) e a caixa de marcha somente as partes internas (engrenagens), por um período de 90 (noventa) dias e/ou 3.000 km (três mil Quilômetros), o que ocorrer primeiro a contar da presente data.`)
      y += 1
      paragraph(`A garantia é limitada a defeitos no bloco e na caixa de câmbio do veículo desde que observados as seguintes regras.`)
      y += 2

      paragraph("I. A garantia restringe-se ao bloco de motor e suas partes e a caixa de câmbio e suas partes internas, não se estendendo aos demais componentes externos e/ou periféricos do bloco do motor e desta caixa de câmbio.", 4)
      paragraph("II. Caberá exclusivamente MORAUTO VEICULOS a decisão de reparos ou substituição de peças que apresentarem defeitos.", 4)
      paragraph("III. Os serviços de reparos e/ou substituição serão efetuados exclusivamente por oficina autorizada por escrito pela MORAUTO LOCADORA VEICULOS.", 4)
      paragraph("IV. Os serviços de reparos e/ou substituições serão inteiramente gratuitos para o cliente adquirente, exceto as seguintes despesas: óleo lubrificante, combustível, reboques, imobilização, deslocamento de pessoal, danos materiais ou pessoais causados por adquirente ou a terceiros. A garantia não abrange responsabilidades por perdas, danos ou lucros cessantes decorrentes de paralisações do veículo para reparo, cessando de pleno direito (CANCELAMENTO DA GARANTIA) nos seguintes casos:", 4)
      y += 1
      paragraph("A. Uso inadequado do veículo, entre estes, mas não somente, sua utilização em competições de qualquer natureza ou espécie;", 8)
      paragraph("B. Uso do veículo submetendo-o a abuso ou carga incompatível;", 8)
      paragraph("C. Modificações de combustível ou lubrificantes para ele recomendado;", 8)
      paragraph("D. Danificação do veículo por mau uso ou por acidente, de toda e qualquer natureza;", 8)
      paragraph("E. Violação e/ou alteração do velocímetro ou seu cabo.", 8)
      y += 6

      paragraph(`Manaus (AM), ${fmtDateLong(contract.signedAt ?? contract.createdAt)}.`, 0, true)
      y += 10

      checkPage(52)
      // Assinaturas Cert. Qualidade — mesmo layout do contrato
      signLine(14,       sw, "RAIMUNDO VASCONCELOS MORAIS", "CNPJ: 22.994.313/0001-45")
      doc.setFont("helvetica", "normal")
      doc.setFontSize(6.5)
      doc.setTextColor(80, 80, 80)
      doc.text("VENDEDOR MORAUTO L. DE VEÍCULOS", 14 + sw / 2, y + 25, { align: "center" })
      signLine(14+sw+14, sw, "Ana Paula O. Baima", "CPF 700.922.052-24")
      y += 30

      checkPage(28)
      signLine(14,       sw, String(lead.name ?? "COMPRADOR").toUpperCase(), "COMPRADOR")
      doc.setFont("helvetica", "normal")
      doc.setFontSize(6.5)
      doc.setTextColor(80, 80, 80)
      doc.text(`CPF: ${lead.document ?? "—"}`, 14 + sw / 2, y + 25, { align: "center" })
      signLine(14+sw+14, sw, "CPF:", "")

      footer()
      doc.save(`contrato-venda-${contract.number}.pdf`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleExport}
      disabled={loading}
      className="flex items-center gap-2 bg-[#d4a017] hover:bg-[#b8860b] text-black font-bold px-4 py-2.5 rounded-xl text-sm transition-colors disabled:opacity-60"
    >
      {loading ? <Loader2 size={15} className="animate-spin" /> : <FileDown size={15} />}
      {loading ? "Gerando PDF..." : "Baixar Contrato PDF"}
    </button>
  )
}
