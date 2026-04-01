"use server"

import { db } from "@/lib/db"

// ── Types ────────────────────────────────────────────────────────────────────
export type DateRange = { start: Date; end: Date }

// ── Helpers ─────────────────────────────────────────────────────────────────
function monthRange(offsetFromNow: number) {
  const now   = new Date()
  const year  = now.getMonth() - offsetFromNow < 0 ? now.getFullYear() - 1 : now.getFullYear()
  const month = ((now.getMonth() - offsetFromNow) % 12 + 12) % 12
  return {
    start: new Date(year, month, 1),
    end:   new Date(year, month + 1, 0, 23, 59, 59),
    key:   `${year}-${month}`,
    label: new Date(year, month, 1).toLocaleDateString("pt-BR", { month: "short", year: "2-digit" }),
  }
}

// ── Dashboard Metrics ────────────────────────────────────────────────────────
export async function getDashboardMetrics(range?: DateRange) {
  const now            = new Date()
  const startOfMonth   = new Date(now.getFullYear(), now.getMonth(), 1)
  const startLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const endLastMonth   = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)

  // Period filter for range-sensitive queries
  const periodFilter = range
    ? { gte: range.start, lte: range.end }
    : { gte: startOfMonth }

  const prevPeriodFilter = range
    ? (() => {
        const len = range.end.getTime() - range.start.getTime()
        return { gte: new Date(range.start.getTime() - len), lte: new Date(range.start.getTime() - 1) }
      })()
    : { gte: startLastMonth, lte: endLastMonth }

  const reservationDateFilter = range
    ? { startDate: { gte: range.start }, endDate: { lte: range.end } }
    : {}

  const [
    totalVehicles, availableVehicles, activeRentals, pendingReservations,
    totalCustomers, periodRevenue, prevPeriodRevenue, totalRevenue,
    completedReservations, pendingFines, scheduledMaintenance,
    recentReservations, fleetAlerts, overdueRentals, blockedCustomers,
  ] = await Promise.all([
    db.vehicle.count(),
    db.vehicle.count({ where: { status: "AVAILABLE" } }),
    db.reservation.count({ where: { status: "ACTIVE", ...reservationDateFilter } }),
    db.reservation.count({ where: { status: "PENDING", ...reservationDateFilter } }),
    db.customer.count(),
    db.payment.aggregate({ where: { status: "PAID", paidAt: periodFilter }, _sum: { amount: true } }),
    db.payment.aggregate({ where: { status: "PAID", paidAt: prevPeriodFilter }, _sum: { amount: true } }),
    db.payment.aggregate({ where: { status: "PAID", ...(range ? { paidAt: { gte: range.start, lte: range.end } } : {}) }, _sum: { amount: true } }),
    db.reservation.count({ where: { status: "COMPLETED", ...reservationDateFilter } }),
    db.fine.count({ where: { status: "PENDING" } }),
    db.maintenance.count({ where: { status: { in: ["SCHEDULED", "IN_PROGRESS"] } } }),
    db.reservation.findMany({
      take: 8, orderBy: { createdAt: "desc" },
      include: { customer: { include: { user: true } }, vehicle: true },
    }),
    db.maintenance.findMany({
      where: { status: { in: ["SCHEDULED", "IN_PROGRESS"] } },
      take: 5, orderBy: { date: "asc" },
      include: { vehicle: { select: { brand: true, model: true, plate: true } } },
    }),
    db.reservation.count({ where: { status: "ACTIVE", endDate: { lt: now } } }),
    db.customer.count({ where: { blocked: true } }),
  ])

  const thisRev       = Number(periodRevenue._sum.amount    ?? 0)
  const prevRev       = Number(prevPeriodRevenue._sum.amount ?? 0)
  const revenueGrowth = prevRev > 0 ? Math.round(((thisRev - prevRev) / prevRev) * 100) : 0
  const total         = Number(totalRevenue._sum.amount ?? 0)
  const avgTicket     = completedReservations > 0 ? total / completedReservations : 0
  const occupancyRate = totalVehicles > 0 ? Math.round(((totalVehicles - availableVehicles) / totalVehicles) * 100) : 0

  return {
    totalVehicles, availableVehicles, activeRentals, pendingReservations,
    totalCustomers, monthlyRevenue: thisRev, lastMonthRevenue: prevRev,
    revenueGrowth, totalRevenue: total, completedReservations, avgTicket,
    pendingFines, scheduledMaintenance, occupancyRate, overdueRentals,
    blockedCustomers, recentReservations, fleetAlerts,
  }
}

// ── Fleet Report ─────────────────────────────────────────────────────────────
export async function getFleetReport() {
  const vehicles = await db.vehicle.findMany({
    include: {
      category: true, branch: true,
      _count: { select: { reservations: true, maintenances: true, fines: true } },
      maintenances: { where: { status: "COMPLETED" }, select: { cost: true } },
      reservations: { where: { status: "COMPLETED" }, select: { totalValue: true } },
    },
  })
  return vehicles.map((v) => ({
    ...v,
    totalMaintenanceCost: v.maintenances.reduce((a, m) => a + Number(m.cost), 0),
    totalRevenue:         v.reservations.reduce((a, r) => a + Number(r.totalValue), 0),
    totalReservations:    v._count.reservations,
  }))
}

// ── Revenue by Category ──────────────────────────────────────────────────────
export async function getRevenueByCategory(range?: DateRange) {
  const dateFilter = range ? { startDate: { gte: range.start }, endDate: { lte: range.end } } : {}
  const categories = await db.category.findMany({
    include: {
      vehicles: {
        include: {
          reservations: { where: { status: "COMPLETED", ...dateFilter }, select: { totalValue: true } },
        },
      },
    },
  })
  return categories.map((cat) => ({
    name:     cat.name,
    revenue:  cat.vehicles.reduce((a, v) => a + v.reservations.reduce((b, r) => b + Number(r.totalValue), 0), 0),
    vehicles: cat.vehicles.length,
    dailyRate: Number(cat.dailyRate),
  }))
}

// ── Monthly Revenue (12 months) ──────────────────────────────────────────────
export async function getMonthlyRevenue12() {
  const months = []
  for (let i = 11; i >= 0; i--) {
    const { start, end, key, label } = monthRange(i)
    const rev = await db.payment.aggregate({
      where: { status: "PAID", paidAt: { gte: start, lte: end } },
      _sum: { amount: true },
    })
    months.push({ key, label, revenue: Number(rev._sum.amount ?? 0) })
  }
  return months
}

// ── Occupancy by Month (6 months) ────────────────────────────────────────────
export async function getOccupancyByMonth() {
  const months = []
  const totalVehicles = await db.vehicle.count()
  for (let i = 5; i >= 0; i--) {
    const { start, end, key, label } = monthRange(i)
    const reservations = await db.reservation.count({
      where: { status: { in: ["COMPLETED", "ACTIVE"] }, startDate: { gte: start, lte: end } },
    })
    months.push({
      key, month: label, reservations,
      occupancy: totalVehicles > 0 ? Math.round((reservations / totalVehicles) * 100) : 0,
    })
  }
  return months
}

// ── Payment Methods breakdown ────────────────────────────────────────────────
export async function getPaymentMethodStats(range?: DateRange) {
  const dateFilter = range ? { paidAt: { gte: range.start, lte: range.end } } : {}
  const methods = ["PIX", "CREDIT_CARD", "DEBIT_CARD", "CASH", "BANK_TRANSFER"]
  const results = await Promise.all(
    methods.map((m) =>
      db.payment.aggregate({
        where: { status: "PAID", method: m, ...dateFilter },
        _sum: { amount: true },
        _count: true,
      }).then((r) => ({ method: m, total: Number(r._sum.amount ?? 0), count: r._count }))
    )
  )
  return results.filter((r) => r.count > 0)
}

// ── Top customers by revenue ─────────────────────────────────────────────────
export async function getTopCustomers(limit = 10, range?: DateRange) {
  const dateFilter = range ? { startDate: { gte: range.start }, endDate: { lte: range.end } } : {}
  const customers = await db.customer.findMany({
    include: {
      user: true,
      reservations: { where: { status: "COMPLETED", ...dateFilter }, select: { totalValue: true } },
      _count: { select: { reservations: true } },
    },
  })
  return customers
    .map((c) => ({
      id:           c.id,
      name:         c.user.name ?? "—",
      email:        c.user.email ?? "—",
      type:         c.type,
      score:        c.score,
      blocked:      c.blocked,
      reservations: c._count.reservations,
      revenue:      c.reservations.reduce((a, r) => a + Number(r.totalValue), 0),
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit)
}

// ── Maintenance summary ───────────────────────────────────────────────────────
export async function getMaintenanceSummary(range?: DateRange) {
  const dateFilter = range ? { date: { gte: range.start, lte: range.end } } : {}
  const [byType, byStatus, totalCost, recent] = await Promise.all([
    db.maintenance.groupBy({ by: ["type"],   where: dateFilter, _count: true, _sum: { cost: true } }),
    db.maintenance.groupBy({ by: ["status"], where: dateFilter, _count: true }),
    db.maintenance.aggregate({ where: dateFilter, _sum: { cost: true } }),
    db.maintenance.findMany({
      where: dateFilter, take: 8, orderBy: { createdAt: "desc" },
      include: { vehicle: { select: { brand: true, model: true, plate: true } } },
    }),
  ])
  return { byType, byStatus, totalCost: Number(totalCost._sum.cost ?? 0), recent }
}

// ── Fines summary ─────────────────────────────────────────────────────────────
export async function getFinesSummary(range?: DateRange) {
  const dateFilter = range ? { date: { gte: range.start, lte: range.end } } : {}
  const [byStatus, totalAmount, totalCharged, recent] = await Promise.all([
    db.fine.groupBy({ by: ["status"], where: dateFilter, _count: true, _sum: { amount: true } }),
    db.fine.aggregate({ where: dateFilter, _sum: { amount: true } }),
    db.fine.aggregate({ where: { chargedToClient: true, ...dateFilter }, _sum: { chargedAmount: true } }),
    db.fine.findMany({
      where: dateFilter, take: 8, orderBy: { createdAt: "desc" },
      include: { vehicle: { select: { brand: true, model: true, plate: true } } },
    }),
  ])
  return {
    byStatus,
    totalAmount:  Number(totalAmount._sum.amount ?? 0),
    totalCharged: Number(totalCharged._sum.chargedAmount ?? 0),
    recent,
  }
}

// ── Reservations by status ────────────────────────────────────────────────────
export async function getReservationStats(range?: DateRange) {
  const dateFilter = range ? { startDate: { gte: range.start }, endDate: { lte: range.end } } : {}
  const byStatus = await db.reservation.groupBy({ by: ["status"], where: dateFilter, _count: true })
  const total    = byStatus.reduce((a, s) => a + s._count, 0)
  return { byStatus, total }
}

// ── DRE — Demonstrativo de Resultado ─────────────────────────────────────────
export async function getDREData(range?: DateRange) {
  const dateFilter      = range ? { gte: range.start, lte: range.end } : {}
  const maintDateFilter = range ? { date: { gte: range.start, lte: range.end } } : {}
  const fineFilter      = range ? { date: { gte: range.start, lte: range.end } } : {}
  const resFilter       = range ? { startDate: { gte: range.start }, endDate: { lte: range.end } } : {}

  const [
    grossRevenue, maintenanceCost, finesTotal, finesCharged,
    pendingPayments, refundedPayments, saleRevenue,
    totalReservations, cancelledReservations,
  ] = await Promise.all([
    db.payment.aggregate({ where: { status: "PAID", paidAt: Object.keys(dateFilter).length ? dateFilter : undefined }, _sum: { amount: true } }),
    db.maintenance.aggregate({ where: { status: "COMPLETED", ...maintDateFilter }, _sum: { cost: true } }),
    db.fine.aggregate({ where: fineFilter, _sum: { amount: true } }),
    db.fine.aggregate({ where: { chargedToClient: true, ...fineFilter }, _sum: { chargedAmount: true } }),
    db.payment.aggregate({ where: { status: "PENDING", createdAt: Object.keys(dateFilter).length ? dateFilter : undefined }, _sum: { amount: true }, _count: true }),
    db.payment.aggregate({ where: { status: "REFUNDED", paidAt: Object.keys(dateFilter).length ? dateFilter : undefined }, _sum: { amount: true } }),
    db.payment.aggregate({ where: { status: "PAID", paidAt: Object.keys(dateFilter).length ? dateFilter : undefined }, _sum: { amount: true }, _count: true }),
    db.reservation.count({ where: resFilter }),
    db.reservation.count({ where: { status: "CANCELLED", ...resFilter } }),
  ])

  const revenue       = Number(grossRevenue._sum.amount ?? 0)
  const maintCost     = Number(maintenanceCost._sum.cost ?? 0)
  const finesAmt      = Number(finesTotal._sum.amount ?? 0)
  const finesRec      = Number(finesCharged._sum.chargedAmount ?? 0)
  const netFinesCost  = Math.max(finesAmt - finesRec, 0)
  const totalCosts    = maintCost + netFinesCost
  const netResult     = revenue - totalCosts
  const margin        = revenue > 0 ? (netResult / revenue) * 100 : 0
  const pendingAmt    = Number(pendingPayments._sum.amount ?? 0)
  const refundedAmt   = Number(refundedPayments._sum.amount ?? 0)
  const cancellationRate = totalReservations > 0 ? (cancelledReservations / totalReservations) * 100 : 0

  return {
    revenue, maintCost, finesAmt, finesRec, netFinesCost,
    totalCosts, netResult, margin,
    pendingPayments: { amount: pendingAmt, count: pendingPayments._count },
    refundedAmount: refundedAmt,
    cancellationRate,
    totalReservations,
  }
}

// ── Revenue vs Cost by Month (6 months) ──────────────────────────────────────
export async function getRevenueVsCostByMonth() {
  const months = []
  for (let i = 5; i >= 0; i--) {
    const { start, end, key, label } = monthRange(i)
    const [rev, cost] = await Promise.all([
      db.payment.aggregate({ where: { status: "PAID", paidAt: { gte: start, lte: end } }, _sum: { amount: true } }),
      db.maintenance.aggregate({ where: { status: "COMPLETED", date: { gte: start, lte: end } }, _sum: { cost: true } }),
    ])
    months.push({
      key, label,
      revenue: Number(rev._sum.amount ?? 0),
      cost:    Number(cost._sum.cost ?? 0),
    })
  }
  return months
}

// ── Daily Revenue (last 30 days for heat map) ────────────────────────────────
export async function getDailyRevenue30() {
  const days: { date: string; revenue: number }[] = []
  const now = new Date()
  for (let i = 29; i >= 0; i--) {
    const d     = new Date(now)
    d.setDate(d.getDate() - i)
    const start = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0)
    const end   = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59)
    const rev   = await db.payment.aggregate({
      where: { status: "PAID", paidAt: { gte: start, lte: end } },
      _sum: { amount: true },
    })
    days.push({
      date:    start.toISOString().slice(0, 10),
      revenue: Number(rev._sum.amount ?? 0),
    })
  }
  return days
}
