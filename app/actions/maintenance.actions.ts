"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function getMaintenances() {
  return db.maintenance.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      vehicle: {
        include: { category: true },
      },
    },
  })
}

export async function getMaintenancesByVehicle(vehicleId: string) {
  return db.maintenance.findMany({
    where: { vehicleId },
    orderBy: { date: "desc" },
  })
}

export async function createMaintenance(formData: FormData) {
  try {
    const vehicleId = formData.get("vehicleId") as string
    const type = formData.get("type") as string
    const date = formData.get("date") as string
    const kmAtMaintenance = Number(formData.get("kmAtMaintenance"))
    const description = formData.get("description") as string
    const cost = Number(formData.get("cost"))
    const provider = formData.get("provider") as string
    const nextServiceKm = formData.get("nextServiceKm") ? Number(formData.get("nextServiceKm")) : null
    const nextServiceDate = formData.get("nextServiceDate") as string
    const notes = formData.get("notes") as string

    if (!vehicleId || !type || !date || !description) {
      return { error: "Campos obrigatórios não preenchidos." }
    }

    await db.maintenance.create({
      data: {
        vehicleId,
        type,
        status: "SCHEDULED",
        date: new Date(date),
        kmAtMaintenance,
        description,
        cost,
        provider: provider || null,
        nextServiceKm,
        nextServiceDate: nextServiceDate ? new Date(nextServiceDate) : null,
        notes: notes || null,
      },
    })

    // Set vehicle status to MAINTENANCE
    await db.vehicle.update({
      where: { id: vehicleId },
      data: { status: "MAINTENANCE" },
    })

    revalidatePath("/admin/manutencao")
    return { success: true }
  } catch (error) {
    console.error(error)
    return { error: "Erro ao registrar manutenção." }
  }
}

export async function updateMaintenanceStatus(id: string, status: string) {
  try {
    const maintenance = await db.maintenance.update({
      where: { id },
      data: {
        status: status as any,
        completedAt: status === "COMPLETED" ? new Date() : null,
      },
      include: { vehicle: true },
    })

    // If completed, check if vehicle should go back to AVAILABLE
    if (status === "COMPLETED") {
      const pendingMaint = await db.maintenance.count({
        where: {
          vehicleId: maintenance.vehicleId,
          status: { in: ["SCHEDULED", "IN_PROGRESS"] },
        },
      })
      if (pendingMaint === 0) {
        await db.vehicle.update({
          where: { id: maintenance.vehicleId },
          data: { status: "AVAILABLE" },
        })
      }
    }

    revalidatePath("/admin/manutencao")
    return { success: true }
  } catch (error) {
    console.error(error)
    return { error: "Erro ao atualizar status." }
  }
}

export async function deleteMaintenance(id: string) {
  try {
    await db.maintenance.delete({ where: { id } })
    revalidatePath("/admin/manutencao")
    return { success: true }
  } catch (error) {
    console.error(error)
    return { error: "Erro ao excluir manutenção." }
  }
}
