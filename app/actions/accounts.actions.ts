"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { AccountStatus, AccountType } from "@prisma/client"

export async function getAccounts(filters?: {
  type?: AccountType
  status?: AccountStatus
}) {
  const where: Record<string, unknown> = {}
  if (filters?.type) where.type = filters.type
  if (filters?.status) where.status = filters.status

  return db.accountEntry.findMany({
    where,
    orderBy: { dueDate: "asc" },
  })
}

export async function getAccountsSummary() {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const [allEntries, paidThisMonth] = await Promise.all([
    db.accountEntry.findMany({
      where: { status: { in: ["PENDING", "OVERDUE"] } },
      select: { type: true, amount: true },
    }),
    db.accountEntry.findMany({
      where: { status: "PAID", paidAt: { gte: startOfMonth } },
      select: { type: true, amount: true },
    }),
  ])

  let totalReceivable = 0
  let totalPayable = 0
  let paidReceivable = 0
  let paidPayable = 0

  for (const e of allEntries) {
    const v = Number(e.amount)
    if (e.type === "RECEIVABLE") totalReceivable += v
    else totalPayable += v
  }

  for (const e of paidThisMonth) {
    const v = Number(e.amount)
    if (e.type === "RECEIVABLE") paidReceivable += v
    else paidPayable += v
  }

  return {
    totalReceivable,
    totalPayable,
    paidReceivable,
    paidPayable,
    balance: totalReceivable - totalPayable,
  }
}

export async function createAccount(formData: FormData) {
  const type = formData.get("type") as AccountType
  const category = formData.get("category") as string
  const description = formData.get("description") as string
  const amount = parseFloat(formData.get("amount") as string)
  const dueDate = new Date(formData.get("dueDate") as string)
  const notes = (formData.get("notes") as string) || null

  if (!type || !category || !description || isNaN(amount) || isNaN(dueDate.getTime())) {
    return { error: "Preencha todos os campos obrigatórios." }
  }

  await db.accountEntry.create({
    data: { type, category, description, amount, dueDate, notes },
  })

  revalidatePath("/admin/contas")
  return { success: true }
}

export async function updateAccount(id: string, formData: FormData) {
  const type = formData.get("type") as AccountType
  const category = formData.get("category") as string
  const description = formData.get("description") as string
  const amount = parseFloat(formData.get("amount") as string)
  const dueDate = new Date(formData.get("dueDate") as string)
  const notes = (formData.get("notes") as string) || null

  if (!type || !category || !description || isNaN(amount) || isNaN(dueDate.getTime())) {
    return { error: "Preencha todos os campos obrigatórios." }
  }

  await db.accountEntry.update({
    where: { id },
    data: { type, category, description, amount, dueDate, notes },
  })

  revalidatePath("/admin/contas")
  return { success: true }
}

export async function markAsPaid(id: string) {
  await db.accountEntry.update({
    where: { id },
    data: { status: "PAID", paidAt: new Date() },
  })
  revalidatePath("/admin/contas")
}

export async function markAsPending(id: string) {
  await db.accountEntry.update({
    where: { id },
    data: { status: "PENDING", paidAt: null },
  })
  revalidatePath("/admin/contas")
}

export async function cancelAccount(id: string) {
  await db.accountEntry.update({
    where: { id },
    data: { status: "CANCELLED" },
  })
  revalidatePath("/admin/contas")
}

export async function deleteAccount(id: string) {
  await db.accountEntry.delete({ where: { id } })
  revalidatePath("/admin/contas")
}

export async function syncOverdueAccounts() {
  const now = new Date()
  await db.accountEntry.updateMany({
    where: { status: "PENDING", dueDate: { lt: now } },
    data: { status: "OVERDUE" },
  })
  revalidatePath("/admin/contas")
}
