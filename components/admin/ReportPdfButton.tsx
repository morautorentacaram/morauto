"use client"

import { useState } from "react"
import { FileDown, Loader2 } from "lucide-react"

type Props = {
  metrics: any
  fleetReport: any[]
  revenueByCategory: any[]
  occupancyByMonth: any[]
}

export default function ReportPdfButton({ metrics, fleetReport, revenueByCategory, occupancyByMonth }: Props) {
  const [loading, setLoading] = useState(false)

  async function handleExport() {
    setLoading(true)
    try {
      const { default: jsPDF } = await import("jspdf")
      const { default: autoTable } = await import("jspdf-autotable")

      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" })
      const gold  = [212, 160, 23] as [number, number, number]
      const dark  = [24, 24, 27]  as [number, number, number]
      const gray  = [113, 113, 122] as [number, number, number]
      const white = [255, 255, 255] as [number, number, number]
      const W = doc.internal.pageSize.getWidth()

      // ── Header ──────────────────────────────────────────────
      doc.setFillColor(...dark)
      doc.rect(0, 0, W, 28, "F")
      doc.setFillColor(...gold)
      doc.rect(0, 28, W, 1, "F")

      doc.setFont("helvetica", "bold")
      doc.setFontSize(20)
      doc.setTextColor(...white)
      doc.text("MORAUTO.", 14, 17)

      doc.setFontSize(9)
      doc.setFont("helvetica", "normal")
      doc.setTextColor(...gray)
      doc.text("Relatório Gerencial", 14, 24)
      doc.text(`Gerado em ${new Date().toLocaleDateString("pt-BR")} às ${new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`, W - 14, 24, { align: "right" })

      let y = 38

      const fmt = (v: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v)

      // ── KPIs ────────────────────────────────────────────────
      doc.setFont("helvetica", "bold")
      doc.setFontSize(12)
      doc.setTextColor(...dark)
      doc.text("Indicadores Gerais", 14, y)
      y += 6

      const kpis = [
        ["Receita do Mês",        fmt(metrics.monthlyRevenue)],
        ["Receita Total",         fmt(metrics.totalRevenue)],
        ["Ticket Médio",          fmt(metrics.avgTicket)],
        ["Crescimento Mensal",    `${metrics.revenueGrowth >= 0 ? "+" : ""}${metrics.revenueGrowth}%`],
        ["Locações Concluídas",   String(metrics.completedReservations)],
        ["Locações Ativas",       String(metrics.activeRentals)],
        ["Taxa de Ocupação",      `${metrics.occupancyRate}%`],
        ["Total de Veículos",     String(metrics.totalVehicles)],
        ["Veículos Disponíveis",  String(metrics.availableVehicles)],
        ["Total de Clientes",     String(metrics.totalCustomers)],
        ["Clientes Bloqueados",   String(metrics.blockedCustomers)],
        ["Multas Pendentes",      String(metrics.pendingFines)],
        ["Manutenções Abertas",   String(metrics.scheduledMaintenance)],
        ["Reservas em Atraso",    String(metrics.overdueRentals)],
      ]

      autoTable(doc, {
        startY: y,
        head: [["Indicador", "Valor"]],
        body: kpis,
        theme: "striped",
        headStyles: { fillColor: gold, textColor: [0,0,0], fontStyle: "bold" },
        columnStyles: { 0: { cellWidth: 90 }, 1: { cellWidth: 60, halign: "right" } },
        styles: { fontSize: 9, cellPadding: 3 },
        margin: { left: 14, right: 14 },
      })

      y = (doc as any).lastAutoTable.finalY + 10

      // ── Receita por Categoria ────────────────────────────────
      if (y > 240) { doc.addPage(); y = 20 }
      doc.setFont("helvetica", "bold")
      doc.setFontSize(12)
      doc.setTextColor(...dark)
      doc.text("Receita por Categoria", 14, y)
      y += 4

      autoTable(doc, {
        startY: y,
        head: [["Categoria", "Veículos", "Receita Total"]],
        body: revenueByCategory.map((c) => [c.name, String(c.vehicles), fmt(c.revenue)]),
        theme: "striped",
        headStyles: { fillColor: gold, textColor: [0,0,0], fontStyle: "bold" },
        columnStyles: { 2: { halign: "right" } },
        styles: { fontSize: 9, cellPadding: 3 },
        margin: { left: 14, right: 14 },
      })

      y = (doc as any).lastAutoTable.finalY + 10

      // ── Reservas por Mês ─────────────────────────────────────
      if (y > 240) { doc.addPage(); y = 20 }
      doc.setFont("helvetica", "bold")
      doc.setFontSize(12)
      doc.setTextColor(...dark)
      doc.text("Reservas — Últimos 6 Meses", 14, y)
      y += 4

      autoTable(doc, {
        startY: y,
        head: [["Mês", "Reservas", "Ocupação (%)"]],
        body: occupancyByMonth.map((m) => [m.month, String(m.reservations), `${m.occupancy}%`]),
        theme: "striped",
        headStyles: { fillColor: gold, textColor: [0,0,0], fontStyle: "bold" },
        columnStyles: { 1: { halign: "center" }, 2: { halign: "center" } },
        styles: { fontSize: 9, cellPadding: 3 },
        margin: { left: 14, right: 14 },
      })

      y = (doc as any).lastAutoTable.finalY + 10

      // ── Desempenho por Veículo ───────────────────────────────
      doc.addPage()
      y = 20
      doc.setFont("helvetica", "bold")
      doc.setFontSize(12)
      doc.setTextColor(...dark)
      doc.text("Desempenho por Veículo", 14, y)
      y += 4

      autoTable(doc, {
        startY: y,
        head: [["Veículo", "Placa", "Categoria", "Reservas", "Manutenções", "Custo Manut.", "Multas", "Status"]],
        body: fleetReport.map((v) => [
          `${v.brand} ${v.model} ${v.year}`,
          v.plate,
          v.category.name,
          String(v.totalReservations),
          String(v._count.maintenances),
          fmt(v.totalMaintenanceCost),
          String(v._count.fines),
          v.status,
        ]),
        theme: "striped",
        headStyles: { fillColor: gold, textColor: [0,0,0], fontStyle: "bold", fontSize: 8 },
        styles: { fontSize: 7.5, cellPadding: 2.5 },
        margin: { left: 14, right: 14 },
        columnStyles: { 5: { halign: "right" } },
      })

      // ── Footer ───────────────────────────────────────────────
      const pageCount = (doc as any).internal.getNumberOfPages()
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setFillColor(...dark)
        doc.rect(0, doc.internal.pageSize.getHeight() - 10, W, 10, "F")
        doc.setFontSize(7)
        doc.setTextColor(...gray)
        doc.text("Morauto Locadora de Veículos — Confidencial", 14, doc.internal.pageSize.getHeight() - 3.5)
        doc.text(`Página ${i} de ${pageCount}`, W - 14, doc.internal.pageSize.getHeight() - 3.5, { align: "right" })
      }

      doc.save(`morauto-relatorio-${new Date().toISOString().slice(0,10)}.pdf`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleExport}
      disabled={loading}
      className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors disabled:opacity-60"
    >
      {loading ? <Loader2 size={16} className="animate-spin" /> : <FileDown size={16} />}
      {loading ? "Gerando PDF..." : "Exportar PDF"}
    </button>
  )
}
