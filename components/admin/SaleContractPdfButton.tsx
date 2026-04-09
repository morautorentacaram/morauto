"use client"

import { useState, useRef, useEffect } from "react"
import { FileDown, Loader2, ChevronDown, Receipt, FileText } from "lucide-react"

type Props = { contract: any }

const REP = {
  name: "Raimundo Vasconcelos Morais",
  rg:   "337050899 SSP-CE",
  cpf:  "877.683.483-20",
}

const fmt  = (v: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v)
const fmtD = (d: string | Date) => new Date(d).toLocaleDateString("pt-BR")
const fmtDL= (d: string | Date) => new Date(d).toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" })

function valorPorExtenso(valor: number): string {
  const un  = ["","um","dois","três","quatro","cinco","seis","sete","oito","nove","dez","onze","doze","treze","quatorze","quinze","dezesseis","dezessete","dezoito","dezenove"]
  const dz  = ["","","vinte","trinta","quarenta","cinquenta","sessenta","setenta","oitenta","noventa"]
  const ct  = ["","cem","duzentos","trezentos","quatrocentos","quinhentos","seiscentos","setecentos","oitocentos","novecentos"]
  const mil = ["","mil","dois mil","três mil","quatro mil","cinco mil","seis mil","sete mil","oito mil","nove mil"]
  const n = Math.round(valor)
  if (n === 0) return "zero"
  const m = Math.floor(n / 1000), r = n % 1000
  const c = Math.floor(r / 100), rem = r % 100
  const d = Math.floor(rem / 10), u = rem % 10
  let t = ""
  if (m > 0) t += (m < 10 ? mil[m] : `${m} mil`) + (r > 0 ? " e " : "")
  if (c > 0) t += ct[c] + (rem > 0 ? " e " : "")
  if (rem > 0) t += rem < 20 ? un[rem] : dz[d] + (u > 0 ? " e " + un[u] : "")
  return t.trim()
}

async function loadLogo(): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => {
      const c = document.createElement("canvas")
      c.width = img.naturalWidth; c.height = img.naturalHeight
      c.getContext("2d")!.drawImage(img, 0, 0)
      resolve(c.toDataURL("image/png"))
    }
    img.onerror = () => resolve("")
    img.src = "/logo.png"
  })
}

// ═══════════════════════════════════════════════════════════════════
// MODELO 1 — À VISTA (fundo branco, logo centralizada, 9 cláusulas)
// ═══════════════════════════════════════════════════════════════════
async function gerarAVista(contract: any) {
  const { default: jsPDF } = await import("jspdf")
  const logoBase64 = await loadLogo()

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" }) as any
  const W = doc.internal.pageSize.getWidth()
  const H = doc.internal.pageSize.getHeight()

  const { vehicle, lead } = contract
  const salePrice = Number(contract.salePrice)
  let payInfo: Record<string, string> = {}
  try { payInfo = JSON.parse(contract.paymentDetails ?? "{}") } catch {}

  const entryAmount      = payInfo.entryAmount      ? Number(payInfo.entryAmount)      : null
  const secondPayment    = payInfo.secondPayment     ? Number(payInfo.secondPayment)    : null
  const secondPayDate    = payInfo.secondPayDate     ?? null
  const installmentCount = payInfo.installmentCount  ? Number(payInfo.installmentCount) : null
  const installmentAmount= payInfo.installmentAmount ? Number(payInfo.installmentAmount): null
  const installmentStart = payInfo.installmentStart  ?? null
  const deliveryDate     = payInfo.deliveryDate      ?? fmtD(contract.createdAt)
  const vehicleKm        = payInfo.vehicleKm         ?? String(vehicle.km ?? 0)
  const rg               = payInfo.rg                ?? "___________"

  let y = 0

  // ── helpers ──────────────────────────────────────────────────────
  function checkPage(need = 12) {
    if (y + need > H - 22) { doc.addPage(); pageHeader() }
  }

  function pageHeader() {
    if (logoBase64) {
      doc.addImage(logoBase64, "PNG", (W - 55) / 2, 6, 55, 22)
    } else {
      doc.setFont("helvetica", "bold"); doc.setFontSize(20); doc.setTextColor(212, 160, 23)
      doc.text("MORAUTO", W / 2, 20, { align: "center" })
    }
    y = 34
  }

  function footer() {
    const pages = doc.internal.getNumberOfPages()
    for (let i = 1; i <= pages; i++) {
      doc.setPage(i)
      const fh = 20
      doc.setFillColor(30, 30, 30)
      doc.rect(0, H - fh, W, fh, "F")

      // Company info left
      doc.setFont("helvetica", "bold"); doc.setFontSize(7); doc.setTextColor(255, 255, 255)
      doc.text("MORAUTO LOCADORA DE VEÍCULOS E MÁQUINAS EIRELI", 14, H - fh + 5)
      doc.setFont("helvetica", "normal"); doc.setFontSize(6); doc.setTextColor(180, 180, 180)
      doc.text("CNPJ: 22.994.313/0001-45", 14, H - fh + 9)
      doc.text("Av. Álvaro Maia - 176 A - Presidente Vargas - CEP: 69.025-360", 14, H - fh + 13)
      doc.text("Contato: 92. 3622-2883 / 99292-1946  ·  E-mail: morautolocadora@hotmail.com", 14, H - fh + 17)

      // FUNCIONAMENTO box right
      const bx = W - 50, bw = 36, by = H - fh + 2, bh = 16
      doc.setFillColor(255, 255, 255); doc.setDrawColor(150, 150, 150)
      doc.rect(bx, by, bw, bh, "FD")
      doc.setFont("helvetica", "bold"); doc.setFontSize(5.5); doc.setTextColor(30, 30, 30)
      doc.text("FUNCIONAMENTO", bx + bw / 2, by + 4, { align: "center" })
      doc.setFont("helvetica", "normal"); doc.setFontSize(5); doc.setTextColor(80, 80, 80)
      doc.text("SEG a SEX: 8h às 17h", bx + bw / 2, by + 7.5, { align: "center" })
      doc.text("SÁB: 8h às 13h", bx + bw / 2, by + 10.5, { align: "center" })
      doc.text("DOM e Feriados: Fechado", bx + bw / 2, by + 13.5, { align: "center" })
    }
  }

  function title(txt: string) {
    doc.setFont("helvetica", "bold"); doc.setFontSize(12); doc.setTextColor(0, 0, 0)
    doc.text(txt, W / 2, y, { align: "center" })
    y += 8
  }

  function sectionTitle(txt: string) {
    checkPage(10)
    doc.setFont("helvetica", "bold"); doc.setFontSize(9); doc.setTextColor(0, 0, 0)
    doc.text(txt, 14, y)
    y += 6
  }

  function para(txt: string, bold = false) {
    const maxW = W - 28
    doc.setFont("helvetica", bold ? "bold" : "normal")
    doc.setFontSize(9); doc.setTextColor(20, 20, 20)
    const lines: string[] = doc.splitTextToSize(txt, maxW)
    lines.forEach((line: string) => { checkPage(5); doc.text(line, 14, y); y += 5 })
    y += 1
  }

  function clausula(num: string, txt: string) {
    checkPage(14)
    const full = `${num} ${txt}`
    const maxW = W - 28
    doc.setFontSize(9); doc.setTextColor(20, 20, 20)
    const lines: string[] = doc.splitTextToSize(full, maxW)
    lines.forEach((line: string, i: number) => {
      checkPage(5)
      doc.setFont("helvetica", i === 0 ? "bold" : "normal")
      doc.text(line, 14, y); y += 5
    })
    y += 1
  }

  function signBlock() {
    checkPage(50)
    y += 6
    const sw = (W - 42) / 2
    // Vendedor | Testemunha 1
    doc.setDrawColor(80, 80, 80); doc.setLineWidth(0.3)
    doc.line(14, y, 14 + sw, y)
    doc.line(14 + sw + 14, y, 14 + sw * 2 + 14, y)
    doc.setFont("helvetica", "bold"); doc.setFontSize(8); doc.setTextColor(20, 20, 20)
    doc.text("RAIMUNDO VASCONCELOS MORAIS", 14 + sw / 2, y + 4.5, { align: "center" })
    doc.text("Ana Paula O. Baima", 14 + sw + 14 + sw / 2, y + 4.5, { align: "center" })
    doc.setFont("helvetica", "normal"); doc.setFontSize(7); doc.setTextColor(80, 80, 80)
    doc.text("VENDEDOR MORAUTO L. DE VEÍCULOS", 14 + sw / 2, y + 8.5, { align: "center" })
    doc.text("CPF 700.922.052-24", 14 + sw + 14 + sw / 2, y + 8.5, { align: "center" })
    y += 18

    // Comprador | CPF
    doc.setDrawColor(80, 80, 80)
    doc.line(14, y, 14 + sw, y)
    doc.line(14 + sw + 14, y, 14 + sw * 2 + 14, y)
    doc.setFont("helvetica", "bold"); doc.setFontSize(8); doc.setTextColor(20, 20, 20)
    doc.text(String(lead.name ?? "COMPRADOR").toUpperCase(), 14 + sw / 2, y + 4.5, { align: "center" })
    doc.text("CPF:", 14 + sw + 14 + sw / 2, y + 4.5, { align: "center" })
    doc.setFont("helvetica", "normal"); doc.setFontSize(7); doc.setTextColor(80, 80, 80)
    doc.text("COMPRADOR", 14 + sw / 2, y + 8.5, { align: "center" })
    y += 18
  }

  // ── PÁGINA 1 ─────────────────────────────────────────────────────
  pageHeader()
  y += 2
  title("CONTRATO DE COMPRA E VENDA DE VEÍCULO USADO")

  // Vendedor
  para(`VENDEDOR: MORAUTO LOCADORA DE VEÍCULOS E MAQUINAS EIRELLI-ME, empresa comercial da praça de Manaus, Estado do Amazonas, estabelecida à Avenida Álvaro Maia, Nº176-A, Bairro: Presidente Vargas, CEP:69025-360, Legalmente inscrita no CNPJ sob o nº 22.994.313/0001-45, neste ato representada por seu sócio administrador ${REP.name}, portador da cédula de identidade RG n.º ${REP.rg}, inscrito no CPF sob o n.º ${REP.cpf}.`, true)

  // Comprador
  const vNome = `${vehicle.brand} ${vehicle.model}${vehicle.version ? " " + vehicle.version : ""}`
  para(`COMPRADOR: ${String(lead.name ?? "").toUpperCase()}, portador(a) da cédula de identidade RG nº ${rg}, CPF sob o nº ${lead.document ?? "_______________"}, telefone: ${lead.phone ?? "_______________"}, residente e domiciliado(a) à ${lead.address ?? "_______________"}.`, true)

  para(`As partes acima identificadas têm, entre si, justo e acertado o presente Contrato de Compra e Venda de Veículo Usado, que se regerá pelas cláusulas seguintes e pelas condições descritas no presente.`)
  y += 1

  sectionTitle("DO OBJETO DO CONTRATO")
  clausula("Cláusula 1ª.", `O presente contrato tem como OBJETO, o veículo da Marca/Modelo ${vehicle.brand} ${vehicle.model}${vehicle.version ? " / " + vehicle.version : ""}, ANO FAB ${vehicle.year}, ANO MOD. ${vehicle.year}, COR ${(vehicle.color ?? "—").toUpperCase()}, COD RENAVAM ${vehicle.renavam ?? "N/I"}, PLACA ${vehicle.plate ?? "N/I"}, CHASSI ${vehicle.chassi ?? "N/I"}, Combustível: ${vehicle.fuelType ?? "N/I"}.`)
  clausula("Cláusula 2ª.", `O veículo, objeto deste contrato é usado, apresentando um desgaste natural decorrente do tempo, já visto e inspecionado pelo COMPRADOR, o qual tomou ciência de suas condições e estado de conservação, cliente comprador dirigiu o veículo, e constatou que, nada de defeito mecânico que impeça seu bom funcionamento foi detectado, reafirmando que o comprador teve oportunidades de testar o mesmo, onde o mesmo constatou que o veículo se encontra em perfeitas condições de funcionamento e uso.`)

  sectionTitle("DAS RESPONSABILIDADES")
  clausula("Cláusula 3ª.", `O VENDEDOR se responsabilizará pelo bom estado e perfeito funcionamento do veículo pelo prazo de 90 (noventa) dias e / ou 5.000 km (cinco mil Quilômetros), contado a partir da assinatura deste instrumento pelas partes.`)

  sectionTitle("DA TRANSFERÊNCIA DA PROPRIEDADE DO VEÍCULO")
  clausula("Cláusula 4ª.", `A transferência de propriedade, será por conta do COMPRADOR.`)

  // ── PÁGINA 2 ─────────────────────────────────────────────────────
  sectionTitle("DO PREÇO")

  // Build payment text
  const ext = valorPorExtenso(salePrice)
  let pagTxt = `A venda será feita pelo preço e justo ${fmt(salePrice)} (${ext.toUpperCase()} REAIS)`
  if (entryAmount) {
    pagTxt += `, sendo que, por conta do valor estabelecido, o VENDEDOR recebe do COMPRADOR neste ato a entrada no valor de ${fmt(entryAmount)} (${valorPorExtenso(entryAmount).toUpperCase()}) em transferência bancária pix`
    if (secondPayment && secondPayDate) {
      pagTxt += `, e mais ${fmt(secondPayment)} (${valorPorExtenso(secondPayment).toUpperCase()} REAIS) para a data ${secondPayDate} em transferência bancária pix para a conta do VENDEDOR`
    }
    if (installmentCount && installmentAmount) {
      pagTxt += `, e o restante em ${installmentCount} parcelas de ${fmt(installmentAmount)} (${valorPorExtenso(installmentAmount).toUpperCase()} REAIS) cada`
    }
    pagTxt += `. Na qual dá-se total e plena quitação.`
  } else {
    pagTxt += `. Na qual dá-se total e plena quitação.`
  }
  clausula("Cláusula 5ª.", pagTxt)

  sectionTitle("CONDIÇÕES GERAIS")
  clausula("Cláusula 6ª.", `Em caso de MULTAS, IPVA, ROUBOS, PONTUAÇÃO NA CNH E ACIDENTES DE TRÂNSITO até esta data foi, responsabilidade do VENDEDOR (A). Após esta data é, do COMPRADOR (A).`)
  clausula("Cláusula 7ª.", `O VENDEDOR não se responsabilizará pelos danos causados no veículo por negligência do COMPRADOR, e por problemas decorrentes da não realização das revisões acertadas.`)
  clausula("Cláusula 8ª.", `O presente contrato passa a valer a partir da assinatura pelas partes, obrigando-se a ele os herdeiros ou sucessores das mesmas.`)

  sectionTitle("DO FORO")
  clausula("Cláusula 9ª.", `Para dirimir quaisquer controvérsias oriundas do CONTRATO, as partes elegem o foro da comarca de Manaus.`)

  para(`Por estarem assim justos e contratados, firmam o presente instrumento, em duas vias de igual teor, juntamente com 2 (duas) testemunhas. E por estarem firmados`)
  y += 2
  para(`Manaus (AM), ${fmtDL(contract.signedAt ?? contract.createdAt)}.`, true)

  // TESTEMUNHAS label
  checkPage(12)
  y += 2
  doc.setFont("helvetica", "bold"); doc.setFontSize(9); doc.setTextColor(0, 0, 0)
  doc.text("TESTEMUNHAS:", W / 2, y, { align: "center" })
  y += 4

  signBlock()

  // ── PÁGINA 3 — CERT. ENTREGA + QUALIDADE ─────────────────────────
  doc.addPage(); pageHeader()
  y += 2

  title("CERTIFICADO DE ENTREGA")
  para(`Declaro para os devidos fins que examinei e recebi, nesta data o veículo descrito em perfeitas condições de uso, acompanhado dos devidos acessórios e ferramentas. Declaro ainda estar ciente de que se trata de um veículo usado, no estado em que se encontra e com as seguintes garantias abaixo especificadas.`)
  y += 2

  const detalhes = `VEÍCULO ${vNome.toUpperCase()}, ANO FAB ${vehicle.year}/ MODELO ${vehicle.year}, COR ${(vehicle.color ?? "—").toUpperCase()}, CHASSI ${vehicle.chassi ?? "N/I"}, COMBUSTÍVEL ${vehicle.fuelType ?? "N/I"}, PLACA ${vehicle.plate ?? "N/I"}, KM ${Number(vehicleKm).toLocaleString("pt-BR")}, COMPRADOR ${String(lead.name ?? "").toUpperCase()}${lead.document ? ", CPF/CNPJ: " + lead.document : ""}.`
  para(detalhes, true)
  y += 4

  title("CERTIFICADO DE QUALIDADE")
  para(`MORAUTO VEÍCULOS, tendo promovido especificada vistoria no veículo acima descrito, garante o motor (suas partes internas de força) e a caixa de marcha somente as partes internas (engrenagens), por um período de 90 (noventa) dias e / ou 5.000 km (cinco mil Quilômetros), o que ocorrer primeiro a contar da presente data.`)
  para(`A garantia é limitada a defeitos no bloco e na caixa de câmbio do veículo desde que observados as seguintes regras.`)
  y += 1

  const items = [
    "A garantia restringe-se ao bloco de motor e suas partes e a caixa de câmbio e suas partes internas, não se estendendo aos demais componentes externos e/ou periféricos do bloco do motor e desta caixa de câmbio.",
    "Caberá exclusivamente MORAUTO VEICULOS, decisão de reparos ou substituição de peças que apresentarem defeitos.",
    "Os serviços de reparos e/ou substituição serão efetuados exclusivamente por oficina autorizada por escrito pela MORAUTO LOCADORA VEICULOS.",
    "Os serviços de reparos e/ou substituições serão inteiramente gratuitos para o cliente adquirente, exceto as seguintes despesas: Óleo lubrificante, combustível, reboques, imobilização, deslocamento de pessoal, danos materiais ou pessoais causados por adquirente ou a terceiros.",
  ]
  ;["I","II","III","IV"].forEach((n, i) => {
    checkPage(10)
    const txt = `${n}. ${items[i]}`
    doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.setTextColor(20, 20, 20)
    const lines: string[] = doc.splitTextToSize(txt, W - 30)
    lines.forEach((l: string) => { checkPage(5); doc.text(l, 16, y); y += 5 })
    y += 1
  })

  y += 1
  const subItems = [
    "Uso inadequado do veículo, entre estes, mas não somente, sua utilização em competições de qualquer natureza ou espécie;",
    "Uso do veículo submetendo-o a abuso ou carga incompatível;",
    "Modificações de combustível ou lubrificantes para ele recomendado;",
    "Reparos ou assistência do veículo por outras oficinas;",
    "Danificação do veículo por mau uso ou por acidente, de toda e qualquer natureza;",
    "Violação e/ou alteração do velocímetro ou seu cabo.",
  ]
  ;["A","B","C","D","E","F"].forEach((n, i) => {
    checkPage(8)
    const txt = `${n}. ${subItems[i]}`
    doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.setTextColor(20, 20, 20)
    const lines: string[] = doc.splitTextToSize(txt, W - 36)
    lines.forEach((l: string) => { checkPage(5); doc.text(l, 22, y); y += 5 })
  })

  y += 4
  para(`Manaus (AM), ${fmtDL(contract.signedAt ?? contract.createdAt)}.`, true)
  y += 2
  doc.setFont("helvetica", "bold"); doc.setFontSize(9); doc.setTextColor(0, 0, 0)
  doc.text("TESTEMUNHAS:", W / 2, y, { align: "center" })
  y += 4
  signBlock()

  footer()
  doc.save(`contrato-venda-${contract.number}.pdf`)
}

// ═══════════════════════════════════════════════════════════════════
// MODELO 2 — RESERVA DE DOMÍNIO (com parcelas, 20 cláusulas)
// ═══════════════════════════════════════════════════════════════════
async function gerarReservaDominio(contract: any) {
  const { default: jsPDF }     = await import("jspdf")
  const { default: autoTable } = await import("jspdf-autotable")
  const logoBase64 = await loadLogo()

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" }) as any
  const W   = doc.internal.pageSize.getWidth()
  const H   = doc.internal.pageSize.getHeight()

  const { vehicle, lead } = contract
  const salePrice = Number(contract.salePrice)
  let payInfo: Record<string, string> = {}
  try { payInfo = JSON.parse(contract.paymentDetails ?? "{}") } catch {}

  const entryAmount      = payInfo.entryAmount      ? Number(payInfo.entryAmount)      : null
  const secondPayment    = payInfo.secondPayment     ? Number(payInfo.secondPayment)    : null
  const secondPayDate    = payInfo.secondPayDate     ?? null
  const installmentCount = payInfo.installmentCount  ? Number(payInfo.installmentCount) : null
  const installmentAmount= payInfo.installmentAmount ? Number(payInfo.installmentAmount): null
  const installmentStart = payInfo.installmentStart  ?? null
  const deliveryDate     = payInfo.deliveryDate      ?? fmtD(contract.createdAt)
  const vehicleKm        = payInfo.vehicleKm         ?? String(vehicle.km ?? 0)

  let y = 0

  function checkPage(need = 12) {
    if (y + need > H - 18) { doc.addPage(); y = 18 }
  }

  function header() {
    doc.setFillColor(18, 18, 18)
    doc.rect(0, 0, W, 22, "F")
    doc.setFillColor(212, 160, 23)
    doc.rect(0, 22, W, 0.8, "F")
    if (logoBase64) {
      doc.addImage(logoBase64, "PNG", 12, 3, 38, 16)
    } else {
      doc.setFont("helvetica", "bold"); doc.setFontSize(15); doc.setTextColor(212, 160, 23)
      doc.text("MORAUTO.", 14, 12)
    }
    doc.setFont("helvetica", "normal"); doc.setFontSize(7); doc.setTextColor(160, 160, 160)
    doc.text("LOCADORA DE VEÍCULOS E MÁQUINAS  ·  CNPJ: 22.994.313/0001-45", 14, 20)
    doc.setFont("helvetica", "bold"); doc.setFontSize(8); doc.setTextColor(212, 160, 23)
    doc.text(contract.number, W - 14, 10, { align: "right" })
    doc.setFont("helvetica", "normal"); doc.setFontSize(7); doc.setTextColor(160, 160, 160)
    doc.text(`Emitido: ${fmtD(contract.createdAt)}`, W - 14, 16, { align: "right" })
    y = 30
  }

  function title(txt: string) {
    doc.setFont("helvetica", "bold"); doc.setFontSize(11); doc.setTextColor(18, 18, 18)
    doc.text(txt, W / 2, y, { align: "center" }); y += 6
  }

  function sectionBar(txt: string) {
    checkPage(10)
    doc.setFillColor(240, 240, 240); doc.rect(14, y - 3.5, W - 28, 7, "F")
    doc.setFont("helvetica", "bold"); doc.setFontSize(7.5); doc.setTextColor(40, 40, 40)
    doc.text(txt, 16, y + 0.5); y += 6
  }

  function paragraph(txt: string, indent = 0, bold = false) {
    const maxW = W - 28 - indent
    doc.setFont("helvetica", bold ? "bold" : "normal")
    doc.setFontSize(8); doc.setTextColor(40, 40, 40)
    const lines: string[] = doc.splitTextToSize(txt, maxW)
    lines.forEach((line: string) => { checkPage(5); doc.text(line, 14 + indent, y); y += 4.5 })
    y += 0.5
  }

  function clausula(num: string, titulo: string, corpo: string) {
    checkPage(14)
    doc.setFont("helvetica", "bold"); doc.setFontSize(8); doc.setTextColor(18, 18, 18)
    const lines: string[] = doc.splitTextToSize(`${num} ${titulo ? "– " + titulo + " – " : ""}${corpo}`, W - 28)
    lines.forEach((line: string, i: number) => {
      checkPage(5)
      doc.setFont("helvetica", i === 0 ? "bold" : "normal")
      doc.setFontSize(8); if (i > 0) doc.setTextColor(40, 40, 40)
      doc.text(line, 14, y); y += 4.8
    })
    y += 1
  }

  function signLine(x: number, w: number, name: string, sub: string) {
    doc.setDrawColor(100, 100, 100); doc.setLineWidth(0.3)
    doc.line(x, y + 14, x + w, y + 14)
    doc.setFont("helvetica", "bold"); doc.setFontSize(7); doc.setTextColor(30, 30, 30)
    doc.text(name, x + w / 2, y + 18, { align: "center" })
    doc.setFont("helvetica", "normal"); doc.setFontSize(6.5); doc.setTextColor(120, 120, 120)
    doc.text(sub, x + w / 2, y + 22, { align: "center" })
  }

  function footer() {
    const pages = doc.internal.getNumberOfPages()
    for (let i = 1; i <= pages; i++) {
      doc.setPage(i)
      doc.setFillColor(248, 248, 248); doc.rect(0, H - 16, W, 16, "F")
      doc.setDrawColor(200, 200, 200); doc.setLineWidth(0.3); doc.line(0, H - 16, W, H - 16)
      doc.setFont("helvetica", "bold"); doc.setFontSize(7); doc.setTextColor(30, 30, 30)
      doc.text("MORAUTO LOCADORA DE VEÍCULOS E MÁQUINAS EIRELI", 14, H - 11.5)
      doc.setFont("helvetica", "normal"); doc.setFontSize(6.5); doc.setTextColor(80, 80, 80)
      doc.text("CNPJ: 22.994.313/0001-45", 14, H - 8)
      doc.text("Av. Álvaro Maia - 176 A - Presidente Vargas - CEP: 69.025-360", 14, H - 4.5)
      doc.text("Contato: 92. 3622-2883 / 99292-1946  ·  E-mail: morautolocadora@hotmail.com", 14, H - 1.5)
      const bx = W - 52, bw = 38, bh = 13
      doc.setFillColor(255, 255, 255); doc.setDrawColor(180, 180, 180); doc.rect(bx, H - 15, bw, bh, "FD")
      doc.setFont("helvetica", "bold"); doc.setFontSize(6); doc.setTextColor(30, 30, 30)
      doc.text("FUNCIONAMENTO", bx + bw / 2, H - 11.5, { align: "center" })
      doc.setFont("helvetica", "normal"); doc.setFontSize(5.5); doc.setTextColor(80, 80, 80)
      doc.text("SEG a SEX: 8h às 17h", bx + bw / 2, H - 8.5, { align: "center" })
      doc.text("SÁB: 8h às 13h", bx + bw / 2, H - 5.5, { align: "center" })
      doc.text("DOM e Feriados: Fechado", bx + bw / 2, H - 2.5, { align: "center" })
      doc.setFont("helvetica", "normal"); doc.setFontSize(6); doc.setTextColor(150, 150, 150)
      doc.text(`Pág. ${i}/${pages}`, W - 14, H - 16.5)
    }
  }

  const vNome = `${vehicle.brand} ${vehicle.model}${vehicle.version ? " " + vehicle.version : ""}`
  const sw = (W - 42) / 2

  header(); y += 2
  title("CONTRATO DE COMPRA E VENDA COM RESERVA DE DOMÍNIO"); y += 2
  paragraph("Pelo presente instrumento particular de COMPRA E VENDA COM RESERVA DE DOMÍNIO, os abaixo qualificados têm justo e acertado o seguinte que mutuamente aceitam e outorgam a saber:")
  y += 2

  sectionBar("VENDEDOR")
  paragraph(`MORAUTO LOCADORA DE VEÍCULOS E MAQUINAS LTDA, empresa comercial da praça de Manaus, Estado do Amazonas, estabelecida à Avenida Álvaro Maia, Nº176-A, Bairro: Presidente Vargas, CEP: 69025-360, legalmente inscrita no CNPJ sob o nº 22.994.313/0001-45, neste ato representada por seu sócio administrador ${REP.name}, portador da cédula de identidade RG nº ${REP.rg}, inscrito no CPF sob o nº ${REP.cpf}.`)
  y += 2

  sectionBar("COMPRADOR")
  paragraph(`${String(lead.name ?? "").toUpperCase()}, portador(a) da cédula de identidade RG nº ${payInfo.rg ?? "___________"}, inscrito(a) no CPF sob o nº ${lead.document ?? "_______________"}, telefone: ${lead.phone ?? "_______________"}, residente e domiciliado(a) à ${lead.address ?? "_______________"}.`)
  y += 2

  sectionBar("CLÁUSULA I — DO OBJETO")
  paragraph(`O VENDEDOR vende ao COMPRADOR o veículo:`)
  autoTable(doc, {
    startY: y,
    body: [
      ["Marca/Modelo", vNome, "Ano Fab./Mod.", `${vehicle.year}/${vehicle.year}`],
      ["Cor", (vehicle.color ?? "—").toUpperCase(), "KM", `${Number(vehicleKm).toLocaleString("pt-BR")} km`],
      ["Placa", vehicle.plate ?? "N/I", "RENAVAM", vehicle.renavam ?? "N/I"],
      ["Chassi", vehicle.chassi ?? "N/I", "Combustível", vehicle.fuelType ?? "—"],
    ],
    theme: "grid",
    bodyStyles: { fontSize: 7.5, textColor: [30,30,30] as any, cellPadding: 2 },
    columnStyles: { 0: { fontStyle: "bold", fillColor: [245,245,245] as any, cellWidth: 28 }, 2: { fontStyle: "bold", fillColor: [245,245,245] as any, cellWidth: 28 } },
    styles: { lineColor: [200,200,200] as any },
    margin: { left: 14, right: 14 },
  })
  y = (doc as any).lastAutoTable.finalY + 4

  sectionBar("DAS RESPONSABILIDADES")
  clausula("CLÁUSULA II.", "", `Fica responsável o VENDEDOR pela entrega do veículo livre de qualquer defeito que prejudique seu bom funcionamento, sendo responsável em repará-lo pelo prazo de 90 dias.`)
  clausula("CLÁUSULA III.", "", `Compromete-se o VENDEDOR a entregar o veículo na data de ${deliveryDate} ao COMPRADOR. KM ${Number(vehicleKm).toLocaleString("pt-BR")}.`)
  clausula("CLÁUSULA IV.", "", `O veículo é usado e apresenta desgaste natural decorrente do tempo, já inspecionado pelo COMPRADOR.`)
  clausula("CLÁUSULA V.", "", `Havendo problema no funcionamento do motor, o COMPRADOR deverá informar ao VENDEDOR imediatamente, dentro do prazo da Cláusula II.`)
  clausula("CLÁUSULA VI.", "", `O VENDEDOR não se responsabilizará pelos danos causados no veículo por negligência do COMPRADOR.`)

  sectionBar("CLÁUSULA VII — DO VALOR")
  const valorExtenso = valorPorExtenso(salePrice)
  let pagamentoTexto = `A venda será feita pelo preço justo de ${fmt(salePrice)} (${valorExtenso} reais).`
  if (entryAmount) pagamentoTexto += ` O VENDEDOR recebe do COMPRADOR como entrada o valor de ${fmt(entryAmount)} (${valorPorExtenso(entryAmount)} reais) via ${contract.paymentMethod}.`
  if (secondPayment && secondPayDate) pagamentoTexto += ` E ainda o valor de ${fmt(secondPayment)} (${valorPorExtenso(secondPayment)} reais) para o dia ${secondPayDate} em PIX.`
  if (installmentCount && installmentAmount) pagamentoTexto += ` O restante será pago em ${installmentCount} promissórias de ${fmt(installmentAmount)} (${valorPorExtenso(installmentAmount)} reais) cada.`
  pagamentoTexto += " Após efetivos pagamentos dá-se total e plena quitação."
  paragraph(pagamentoTexto)

  if (installmentCount && installmentAmount && installmentStart) {
    y += 1
    const rows = []
    const startDate = new Date(installmentStart)
    for (let i = 0; i < installmentCount; i++) {
      const d = new Date(startDate); d.setMonth(d.getMonth() + i)
      rows.push([`${i + 1}ª Promissória`, fmt(installmentAmount), fmtD(d)])
    }
    autoTable(doc, {
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
    y = (doc as any).lastAutoTable.finalY + 4
  }

  clausula("CLÁUSULA VIII.", "", `Por força do pacto reservati dominii, fica reservado ao VENDEDOR a propriedade do veículo até o último pagamento estipulado na Cláusula VII.`)
  clausula("CLÁUSULA IX.", "", `Em caso de mora no pagamento das parcelas, a dívida será considerada total com o vencimento antecipado das parcelas vincendas.`)
  clausula("CLÁUSULA X.", "", `Faltando o COMPRADOR ao pagamento, o contrato será automaticamente rescindido, incidindo mora de 0,5% ao dia e juros de 5% ao mês.`)
  clausula("CLÁUSULA XI.", "", `Se o contrato se rescindir por culpa do COMPRADOR, este deverá arcar com as perdas e danos oriundas da depreciação do bem alienado.`)
  clausula("CLÁUSULA XII.", "", `Enquanto não houver sido pago integralmente o valor ajustado, não poderá o COMPRADOR alienar o bem a qualquer título.`)
  clausula("CLÁUSULA XIII.", "", `Não poderá o COMPRADOR transferir a terceiros os direitos e obrigações deste instrumento sem anuência do VENDEDOR.`)
  clausula("CLÁUSULA XIV.", "", `O COMPRADOR fica obrigado a manter o veículo em perfeito estado de conservação e comunicar ao VENDEDOR mudança de endereço.`)
  clausula("CLÁUSULA XV.", "", `O COMPRADOR torna-se DEPOSITÁRIO FIEL do bem adquirido nos termos deste contrato.`)
  clausula("CLÁUSULA XVI.", "", `Quitadas todas as prestações, o comprador passará a ter a posse e a propriedade plena do veículo. A transferência será por conta do COMPRADOR.`)
  clausula("CLÁUSULA XVII.", "", `Todos os tributos posteriores à data deste contrato correrão por conta exclusiva do COMPRADOR.`)
  clausula("CLÁUSULA XVIII.", "", `Após pagamento integral, o VENDEDOR emitirá ao COMPRADOR a Carta de Desalienação.`)
  clausula("CLÁUSULA XIX.", "", `O presente contrato vinculará também os herdeiros e sucessores dos contratantes.`)
  clausula("CLÁUSULA XX.", "", `As partes elegem o foro da comarca de Manaus, Estado do Amazonas.`)

  checkPage(12)
  paragraph(`E assim, por estarem justos e contratados, assinam em duas vias de igual teor, na presença de duas testemunhas.`)
  y += 2
  paragraph(`Manaus (AM), ${fmtDL(contract.signedAt ?? contract.createdAt)}.`, 0, true)
  y += 6

  checkPage(52)
  signLine(14, sw, "RAIMUNDO VASCONCELOS MORAIS", "CNPJ: 22.994.313/0001-45")
  doc.setFont("helvetica", "normal"); doc.setFontSize(6.5); doc.setTextColor(80, 80, 80)
  doc.text("VENDEDOR MORAUTO L. DE VEÍCULOS", 14 + sw / 2, y + 25, { align: "center" })
  signLine(14+sw+14, sw, "Ana Paula O. Baima", "CPF 700.922.052-24")
  y += 30
  checkPage(28)
  signLine(14, sw, String(lead.name ?? "COMPRADOR").toUpperCase(), "COMPRADOR")
  doc.setFont("helvetica", "normal"); doc.setFontSize(6.5); doc.setTextColor(80, 80, 80)
  doc.text(`CPF: ${lead.document ?? "—"}`, 14 + sw / 2, y + 25, { align: "center" })
  signLine(14+sw+14, sw, "CPF:", "")
  y += 28

  // Certificado de Entrega
  doc.addPage(); header(); y += 2
  title("CERTIFICADO DE ENTREGA"); y += 4
  paragraph(`Declaro para os devidos fins que examinei e recebi, nesta data, o veículo descrito em perfeitas condições de uso, acompanhado dos devidos acessórios e ferramentas.`)
  y += 2
  autoTable(doc, {
    startY: y,
    body: [
      ["Marca/Modelo", vNome], ["Ano Fab./Mod.", `${vehicle.year}/${vehicle.year}`],
      ["Cor", (vehicle.color ?? "—").toUpperCase()], ["Placa", vehicle.plate ?? "N/I"],
      ["RENAVAM", vehicle.renavam ?? "N/I"], ["Chassi", vehicle.chassi ?? "N/I"],
      ["Combustível", vehicle.fuelType ?? "—"], ["KM na entrega", `${Number(vehicleKm).toLocaleString("pt-BR")} km`],
      ["Comprador", String(lead.name ?? "").toUpperCase()], ["CPF", lead.document ?? "—"],
      ["Data de entrega", deliveryDate],
    ],
    theme: "grid",
    bodyStyles: { fontSize: 8, textColor: [30,30,30] as any, cellPadding: 2.5 },
    columnStyles: { 0: { fontStyle: "bold", fillColor: [245,245,245] as any, cellWidth: 45 } },
    styles: { lineColor: [200,200,200] as any },
    margin: { left: 14, right: 14 },
  })
  y = (doc as any).lastAutoTable.finalY + 12
  signLine(14, sw, String(lead.name ?? "COMPRADOR").toUpperCase(), `CPF: ${lead.document ?? "—"} — COMPRADOR`)
  y += 28

  // Certificado de Qualidade
  doc.addPage(); header(); y += 2
  title("CERTIFICADO DE QUALIDADE"); y += 4
  paragraph(`MORAUTO VEÍCULOS garante o motor e a caixa de marcha (partes internas) por 90 (noventa) dias e/ou 3.000 km, o que ocorrer primeiro a contar da presente data.`)
  y += 2
  paragraph(`Manaus (AM), ${fmtDL(contract.signedAt ?? contract.createdAt)}.`, 0, true)
  y += 10
  checkPage(52)
  signLine(14, sw, "RAIMUNDO VASCONCELOS MORAIS", "CNPJ: 22.994.313/0001-45")
  doc.setFont("helvetica", "normal"); doc.setFontSize(6.5); doc.setTextColor(80, 80, 80)
  doc.text("VENDEDOR MORAUTO L. DE VEÍCULOS", 14 + sw / 2, y + 25, { align: "center" })
  signLine(14+sw+14, sw, "Ana Paula O. Baima", "CPF 700.922.052-24")
  y += 30
  checkPage(28)
  signLine(14, sw, String(lead.name ?? "COMPRADOR").toUpperCase(), "COMPRADOR")
  doc.setFont("helvetica", "normal"); doc.setFontSize(6.5); doc.setTextColor(80, 80, 80)
  doc.text(`CPF: ${lead.document ?? "—"}`, 14 + sw / 2, y + 25, { align: "center" })
  signLine(14+sw+14, sw, "CPF:", "")

  footer()
  doc.save(`contrato-venda-${contract.number}.pdf`)
}

// ═══════════════════════════════════════════════════════════════════
// COMPONENTE — botão com dropdown de seleção
// ═══════════════════════════════════════════════════════════════════
export default function SaleContractPdfButton({ contract }: Props) {
  const [loading, setLoading]   = useState(false)
  const [open, setOpen]         = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Fecha dropdown ao clicar fora
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  async function handle(type: "avista" | "dominio") {
    setOpen(false)
    setLoading(true)
    try {
      if (type === "avista")  await gerarAVista(contract)
      else                    await gerarReservaDominio(contract)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        disabled={loading}
        className="flex items-center gap-2 bg-[#d4a017] hover:bg-[#b8860b] text-black font-bold px-4 py-2.5 rounded-xl text-sm transition-colors disabled:opacity-60"
      >
        {loading ? <Loader2 size={15} className="animate-spin" /> : <FileDown size={15} />}
        {loading ? "Gerando PDF..." : "Baixar Contrato PDF"}
        {!loading && <ChevronDown size={14} />}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-64 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl z-50 overflow-hidden">
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest px-4 py-2 border-b border-zinc-800">
            Escolha o modelo
          </p>
          <button
            onClick={() => handle("avista")}
            className="w-full flex items-start gap-3 px-4 py-3 hover:bg-zinc-800 transition-colors text-left"
          >
            <Receipt size={16} className="text-[#d4a017] mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-white text-sm font-semibold">À Vista / Compra Simples</p>
              <p className="text-zinc-500 text-xs">9 cláusulas, fundo branco, logo no topo</p>
            </div>
          </button>
          <button
            onClick={() => handle("dominio")}
            className="w-full flex items-start gap-3 px-4 py-3 hover:bg-zinc-800 transition-colors text-left border-t border-zinc-800"
          >
            <FileText size={16} className="text-blue-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-white text-sm font-semibold">Com Reserva de Domínio</p>
              <p className="text-zinc-500 text-xs">20 cláusulas, tabela de parcelas</p>
            </div>
          </button>
        </div>
      )}
    </div>
  )
}
