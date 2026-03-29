"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function getInspections() {
  return db.inspection.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      vehicle: { include: { category: true } },
      contract: {
        include: {
          reservation: {
            include: { customer: { include: { user: true } } },
          },
        },
      },
    },
  })
}

export async function getInspectionsByContract(contractId: string) {
  return db.inspection.findMany({
    where: { contractId },
    orderBy: { createdAt: "asc" },
  })
}

export async function createInspection(formData: FormData) {
  try {
    const contractId = formData.get("contractId") as string
    const vehicleId = formData.get("vehicleId") as string
    const type = formData.get("type") as string
    const km = Number(formData.get("km"))
    const fuelLevel = Number(formData.get("fuelLevel"))
    const observations = formData.get("observations") as string
    const inspectorName = formData.get("inspectorName") as string

    const tiresOk = formData.get("tiresOk") === "true"
    const lightsOk = formData.get("lightsOk") === "true"
    const wiperOk = formData.get("wiperOk") === "true"
    const windowsOk = formData.get("windowsOk") === "true"
    const bodyOk = formData.get("bodyOk") === "true"
    const interiorOk = formData.get("interiorOk") === "true"
    const documentsOk = formData.get("documentsOk") === "true"
    const spareTireOk = formData.get("spareTireOk") === "true"
    const jackOk = formData.get("jackOk") === "true"

    if (!contractId || !vehicleId || !type || !inspectorName) {
      return { error: "Campos obrigatórios não preenchidos." }
    }

    await db.inspection.create({
      data: {
        contractId,
        vehicleId,
        type,
        km,
        fuelLevel,
        observations: observations || null,
        inspectorName,
        tiresOk,
        lightsOk,
        wiperOk,
        windowsOk,
        bodyOk,
        interiorOk,
        documentsOk,
        spareTireOk,
        jackOk,
        photos: [],
      },
    })

    // Update vehicle km
    await db.vehicle.update({
      where: { id: vehicleId },
      data: { km },
    })

    revalidatePath("/admin/vistoria")
    return { success: true }
  } catch (error) {
    console.error(error)
    return { error: "Erro ao registrar vistoria." }
  }
}
