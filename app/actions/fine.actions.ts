"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function getFines() {
  return db.fine.findMany({
    orderBy: { date: "desc" },
    include: {
      vehicle: { include: { category: true } },
      reservation: {
        include: {
          customer: { include: { user: true } },
        },
      },
    },
  })
}

export async function createFine(formData: FormData) {
  try {
    const vehicleId = formData.get("vehicleId") as string
    const amount = Number(formData.get("amount"))
    const date = formData.get("date") as string
    const infractionCode = formData.get("infractionCode") as string
    const description = formData.get("description") as string
    const location = formData.get("location") as string
    const conductorName = formData.get("conductorName") as string
    const agencyName = formData.get("agencyName") as string
    const reservationId = formData.get("reservationId") as string

    if (!vehicleId || !amount || !date || !infractionCode || !description) {
      return { error: "Preencha todos os campos obrigatórios." }
    }

    await db.fine.create({
      data: {
        vehicleId,
        amount,
        date: new Date(date),
        infractionCode,
        description,
        location: location || null,
        conductorName: conductorName || null,
        agencyName: agencyName || null,
        reservationId: reservationId || null,
        status: "PENDING",
      },
    })

    revalidatePath("/admin/multas")
    return { success: true }
  } catch (error) {
    console.error(error)
    return { error: "Erro ao cadastrar multa." }
  }
}

export async function updateFineStatus(id: string, status: string) {
  try {
    await db.fine.update({
      where: { id },
      data: { status: status as any },
    })
    revalidatePath("/admin/multas")
    return { success: true }
  } catch (error) {
    console.error(error)
    return { error: "Erro ao atualizar status da multa." }
  }
}

export async function chargeFineToClient(id: string, chargedAmount: number) {
  try {
    await db.fine.update({
      where: { id },
      data: {
        chargedToClient: true,
        chargedAmount,
        status: "CHARGED_CLIENT",
      },
    })
    revalidatePath("/admin/multas")
    return { success: true }
  } catch (error) {
    console.error(error)
    return { error: "Erro ao repassar multa ao cliente." }
  }
}

export async function deleteFine(id: string) {
  try {
    await db.fine.delete({ where: { id } })
    revalidatePath("/admin/multas")
    return { success: true }
  } catch (error) {
    console.error(error)
    return { error: "Erro ao excluir multa." }
  }
}
