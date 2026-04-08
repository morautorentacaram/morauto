"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function getPayments(filters?: { status?: string; method?: string }) {
  return db.payment.findMany({
    where: {
      ...(filters?.status ? { status: filters.status as any } : {}),
      ...(filters?.method ? { method: filters.method } : {}),
    },
    orderBy: { createdAt: "desc" },
    include: {
      reservation: {
        include: {
          customer: { include: { user: true } },
          vehicle: true,
        },
      },
    },
  })
}

export async function getFinancialSummary() {
  const [
    totalReceived,
    totalPending,
    totalRefunded,
    recentPayments,
    overdueReservations,
    paymentsByMethod,
  ] = await Promise.all([
    db.payment.aggregate({
      where: { status: "PAID" },
      _sum: { amount: true },
    }),
    db.payment.aggregate({
      where: { status: "PENDING" },
      _sum: { amount: true },
    }),
    db.payment.aggregate({
      where: { status: "REFUNDED" },
      _sum: { amount: true },
    }),
    db.payment.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        reservation: {
          include: {
            customer: { include: { user: true } },
            vehicle: true,
          },
        },
      },
    }),
    db.reservation.findMany({
      where: {
        status: "ACTIVE",
        endDate: { lt: new Date() },
      },
      include: {
        customer: { include: { user: true } },
        vehicle: true,
      },
    }),
    db.payment.groupBy({
      by: ["method"],
      where: { status: "PAID" },
      _sum: { amount: true },
      _count: true,
    }),
  ])

  return {
    totalReceived: Number(totalReceived._sum.amount ?? 0),
    totalPending: Number(totalPending._sum.amount ?? 0),
    totalRefunded: Number(totalRefunded._sum.amount ?? 0),
    recentPayments,
    overdueReservations,
    paymentsByMethod,
  }
}

export async function registerPayment(formData: FormData) {
  try {
    const reservationId = formData.get("reservationId") as string
    const amount = Number(formData.get("amount"))
    const method = formData.get("method") as string
    const description = formData.get("description") as string
    const dueDate = formData.get("dueDate") as string

    if (!reservationId || !amount || !method) {
      return { error: "Campos obrigatórios não preenchidos." }
    }

    await db.payment.create({
      data: {
        reservationId,
        amount,
        method,
        description: description || null,
        dueDate: dueDate ? new Date(dueDate) : null,
        status: "PENDING",
      },
    })

    revalidatePath("/admin/financeiro")
    return { success: true }
  } catch (error) {
    console.error(error)
    return { error: "Erro ao registrar cobrança." }
  }
}

export async function confirmPayment(id: string) {
  try {
    await db.payment.update({
      where: { id },
      data: {
        status: "PAID",
        paidAt: new Date(),
      },
    })
    revalidatePath("/admin/financeiro")
    return { success: true }
  } catch (error) {
    console.error(error)
    return { error: "Erro ao confirmar pagamento." }
  }
}

export async function refundPayment(id: string) {
  try {
    await db.payment.update({
      where: { id },
      data: { status: "REFUNDED" },
    })
    revalidatePath("/admin/financeiro")
    return { success: true }
  } catch (error) {
    console.error(error)
    return { error: "Erro ao estornar pagamento." }
  }
}

export async function revertPaymentToPending(id: string) {
  try {
    await db.payment.update({
      where: { id },
      data: { status: "PENDING", paidAt: null },
    })
    revalidatePath("/admin/financeiro")
    return { success: true }
  } catch (error) {
    console.error(error)
    return { error: "Erro ao reverter pagamento." }
  }
}

export async function getMonthlyRevenue() {
  const months = []
  for (let i = 5; i >= 0; i--) {
    const date = new Date()
    date.setMonth(date.getMonth() - i)
    const start = new Date(date.getFullYear(), date.getMonth(), 1)
    const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59)

    const result = await db.payment.aggregate({
      where: {
        status: "PAID",
        paidAt: { gte: start, lte: end },
      },
      _sum: { amount: true },
    })

    months.push({
      month: start.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" }),
      total: Number(result._sum.amount ?? 0),
    })
  }
  return months
}
