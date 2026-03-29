"use server"

import { db } from "@/lib/db"

export async function getDashboardMetrics() {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const [
    totalVehicles,
    availableVehicles,
    activeRentals,
    pendingReservations,
    totalCustomers,
    monthlyRevenue,
    pendingFines,
    scheduledMaintenance,
    recentReservations,
    fleetAlerts,
  ] = await Promise.all([
    db.vehicle.count(),
    db.vehicle.count({ where: { status: "AVAILABLE" } }),
    db.reservation.count({ where: { status: "ACTIVE" } }),
    db.reservation.count({ where: { status: "PENDING" } }),
    db.customer.count(),
    db.payment.aggregate({
      where: { status: "PAID", paidAt: { gte: startOfMonth } },
      _sum: { amount: true },
    }),
    db.fine.count({ where: { status: "PENDING" } }),
    db.maintenance.count({ where: { status: { in: ["SCHEDULED", "IN_PROGRESS"] } } }),
    db.reservation.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        customer: { include: { user: true } },
        vehicle: true,
      },
    }),
    db.maintenance.findMany({
      where: { status: { in: ["SCHEDULED", "IN_PROGRESS"] } },
      take: 5,
      orderBy: { date: "asc" },
      include: { vehicle: { select: { brand: true, model: true, plate: true } } },
    }),
  ])

  const occupancyRate =
    totalVehicles > 0 ? Math.round(((totalVehicles - availableVehicles) / totalVehicles) * 100) : 0

  return {
    totalVehicles,
    availableVehicles,
    activeRentals,
    pendingReservations,
    totalCustomers,
    monthlyRevenue: Number(monthlyRevenue._sum.amount ?? 0),
    pendingFines,
    scheduledMaintenance,
    occupancyRate,
    recentReservations,
    fleetAlerts,
  }
}

export async function getFleetReport() {
  const vehicles = await db.vehicle.findMany({
    include: {
      category: true,
      branch: true,
      _count: { select: { reservations: true, maintenances: true, fines: true } },
      maintenances: {
        where: { status: "COMPLETED" },
        select: { cost: true },
      },
    },
  })

  return vehicles.map((v) => ({
    ...v,
    totalMaintenanceCost: v.maintenances.reduce((acc, m) => acc + Number(m.cost), 0),
    totalReservations: v._count.reservations,
  }))
}

export async function getRevenueByCategory() {
  const categories = await db.category.findMany({
    include: {
      vehicles: {
        include: {
          reservations: {
            where: { status: "COMPLETED" },
            select: { totalValue: true },
          },
        },
      },
    },
  })

  return categories.map((cat) => {
    const totalRevenue = cat.vehicles.reduce((acc, v) => {
      return acc + v.reservations.reduce((a, r) => a + Number(r.totalValue), 0)
    }, 0)
    return {
      name: cat.name,
      revenue: totalRevenue,
      vehicles: cat.vehicles.length,
    }
  })
}

export async function getOccupancyByMonth() {
  const months = []
  for (let i = 5; i >= 0; i--) {
    const date = new Date()
    date.setMonth(date.getMonth() - i)
    const start = new Date(date.getFullYear(), date.getMonth(), 1)
    const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59)

    const completed = await db.reservation.count({
      where: {
        status: { in: ["COMPLETED", "ACTIVE"] },
        startDate: { gte: start, lte: end },
      },
    })

    const totalVehicles = await db.vehicle.count()

    months.push({
      month: start.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" }),
      reservations: completed,
      occupancy: totalVehicles > 0 ? Math.round((completed / totalVehicles) * 100) : 0,
    })
  }
  return months
}
