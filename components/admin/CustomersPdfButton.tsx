"use client"

import { useState } from "react"
import { FileDown, Loader2 } from "lucide-react"

type Customer = {
  id: string
  type: string
  phone: string | null
  document: string
  cnh: string | null
  cnhExpiration: Date | null
  blocked: boolean
  score: number | null
  user: { name: string | null; email: string | null }
  _count: { reservations: number }
}

const COMPANY = {
  name: "MORAUTO LOCADORA DE VEÍCULOS E MÁQUINAS LTDA.",
  cnpj: "22.994.313/0001-45",
  address: "Av. Álvaro Maia, N.176-A — Presidente Vargas",
  city: "CEP 69025-360 — Manaus-AM",
  phone: "(92) 3622-2883 / 99292-1946",
}

export default function CustomersPdfButton({ customers }: { customers: Customer[] }) {
  const [loading, setLoading] = useState(false)

  async function handleExport() {
    setLoading(true)
    try {
      const { jsPDF } = await import("jspdf")
      await import("jspdf-autotable")

      const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" }) as any

      const pageW = doc.internal.pageSize.getWidth()
      const now = new Date()
      const dateStr = now.toLocaleDateString("pt-BR")
      const timeStr = now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })

      // ── Header ──
      doc.setFillColor(18, 18, 18)
      doc.rect(0, 0, pageW, 28, "F")

      doc.setFontSize(16)
      doc.setTextColor(212, 160, 23)
      doc.setFont("helvetica", "bold")
      doc.text("MORAUTO", 14, 12)

      doc.setFontSize(9)
      doc.setTextColor(160, 160, 160)
      doc.setFont("helvetica", "normal")
      doc.text("Locadora de Veículos e Máquinas", 14, 18)
      doc.text(COMPANY.phone, 14, 23)

      doc.setFontSize(13)
      doc.setTextColor(255, 255, 255)
      doc.setFont("helvetica", "bold")
      doc.text("RELATÓRIO DE CLIENTES", pageW / 2, 14, { align: "center" })

      doc.setFontSize(8)
      doc.setTextColor(160, 160, 160)
      doc.setFont("helvetica", "normal")
      doc.text(`Emitido em: ${dateStr} às ${timeStr}`, pageW / 2, 21, { align: "center" })
      doc.text(`Total: ${customers.length} cliente(s)`, pageW / 2, 26, { align: "center" })

      // ── Stats row ──
      const active = customers.filter((c) => !c.blocked).length
      const blocked = customers.filter((c) => c.blocked).length
      const pj = customers.filter((c) => c.type === "PJ").length
      const avgScore = customers.length
        ? Math.round(customers.reduce((s, c) => s + (c.score ?? 100), 0) / customers.length)
        : 0

      const stats = [
        { label: "Total", value: String(customers.length) },
        { label: "Ativos", value: String(active) },
        { label: "Bloqueados", value: String(blocked) },
        { label: "PJ", value: String(pj) },
        { label: "Score Médio", value: `${avgScore}/100` },
      ]
      const boxW = (pageW - 28) / stats.length
      stats.forEach((s, i) => {
        const x = 14 + i * boxW
        doc.setFillColor(30, 30, 30)
        doc.roundedRect(x, 32, boxW - 2, 14, 2, 2, "F")
        doc.setFontSize(7)
        doc.setTextColor(130, 130, 130)
        doc.setFont("helvetica", "normal")
        doc.text(s.label.toUpperCase(), x + (boxW - 2) / 2, 37, { align: "center" })
        doc.setFontSize(11)
        doc.setTextColor(255, 255, 255)
        doc.setFont("helvetica", "bold")
        doc.text(s.value, x + (boxW - 2) / 2, 43, { align: "center" })
      })

      // ── Table ──
      const rows = customers.map((c) => [
        c.user.name ?? "—",
        c.user.email ?? "—",
        c.document,
        c.type,
        c.phone ?? "—",
        c.cnh ?? "—",
        c.cnhExpiration ? new Date(c.cnhExpiration).toLocaleDateString("pt-BR") : "—",
        String(c._count.reservations),
        String(c.score ?? 100),
        c.blocked ? "Bloqueado" : "Ativo",
      ])

      doc.autoTable({
        startY: 50,
        head: [["Nome", "E-mail", "CPF/CNPJ", "Tipo", "Telefone", "CNH", "Val. CNH", "Locações", "Score", "Status"]],
        body: rows,
        theme: "grid",
        styles: { fontSize: 8, cellPadding: 3, textColor: [220, 220, 220], fillColor: [24, 24, 24], lineColor: [50, 50, 50] },
        headStyles: { fillColor: [18, 18, 18], textColor: [212, 160, 23], fontStyle: "bold", fontSize: 7.5 },
        alternateRowStyles: { fillColor: [30, 30, 30] },
        columnStyles: {
          0: { cellWidth: 38 },
          1: { cellWidth: 48 },
          2: { cellWidth: 28 },
          3: { cellWidth: 12 },
          4: { cellWidth: 28 },
          5: { cellWidth: 22 },
          6: { cellWidth: 20 },
          7: { cellWidth: 16 },
          8: { cellWidth: 14 },
          9: { cellWidth: 20 },
        },
        didDrawCell: (data: any) => {
          if (data.section === "body" && data.column.index === 9) {
            const val = data.cell.raw as string
            if (val === "Bloqueado") {
              doc.setTextColor(239, 68, 68)
              doc.setFontSize(8)
              doc.setFont("helvetica", "bold")
              doc.text("Bloqueado", data.cell.x + data.cell.width / 2, data.cell.y + data.cell.height / 2 + 1, { align: "center" })
            } else {
              doc.setTextColor(52, 211, 153)
              doc.setFontSize(8)
              doc.setFont("helvetica", "bold")
              doc.text("Ativo", data.cell.x + data.cell.width / 2, data.cell.y + data.cell.height / 2 + 1, { align: "center" })
            }
          }
        },
      })

      // ── Footer on all pages ──
      const totalPages = doc.internal.getNumberOfPages()
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i)
        const h = doc.internal.pageSize.getHeight()
        doc.setDrawColor(50, 50, 50)
        doc.line(14, h - 12, pageW - 14, h - 12)
        doc.setFontSize(7)
        doc.setTextColor(100, 100, 100)
        doc.setFont("helvetica", "normal")
        doc.text(`${COMPANY.name} — CNPJ ${COMPANY.cnpj}`, 14, h - 7)
        doc.text(`${COMPANY.address} | ${COMPANY.city}`, 14, h - 3)
        doc.text(`Pág. ${i} de ${totalPages}`, pageW - 14, h - 5, { align: "right" })
      }

      doc.save(`clientes-morauto-${dateStr.replace(/\//g, "-")}.pdf`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleExport}
      disabled={loading}
      className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors disabled:opacity-50"
    >
      {loading ? <Loader2 size={15} className="animate-spin text-[#d4a017]" /> : <FileDown size={15} className="text-[#d4a017]" />}
      {loading ? "Gerando PDF..." : "Exportar PDF"}
    </button>
  )
}
