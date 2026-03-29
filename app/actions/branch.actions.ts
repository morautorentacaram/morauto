"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function getBranches() {
  return db.branch.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: { select: { vehicles: true } },
    },
  })
}

export async function createBranch(formData: FormData) {
  try {
    const name = formData.get("name") as string
    const address = formData.get("address") as string
    const city = formData.get("city") as string
    const state = formData.get("state") as string
    const phone = formData.get("phone") as string
    const email = formData.get("email") as string

    if (!name || !address || !city || !state) {
      return { error: "Preencha todos os campos obrigatórios." }
    }

    await db.branch.create({
      data: {
        name,
        address,
        city,
        state,
        phone: phone || null,
        email: email || null,
      },
    })

    revalidatePath("/admin/filiais")
    return { success: true }
  } catch (error) {
    console.error(error)
    return { error: "Erro ao cadastrar filial." }
  }
}

export async function updateBranchStatus(id: string, active: boolean) {
  try {
    await db.branch.update({ where: { id }, data: { active } })
    revalidatePath("/admin/filiais")
    return { success: true }
  } catch (error) {
    console.error(error)
    return { error: "Erro ao atualizar filial." }
  }
}

export async function deleteBranch(id: string) {
  try {
    const vehicleCount = await db.vehicle.count({ where: { branchId: id } })
    if (vehicleCount > 0) {
      return { error: "Existem veículos vinculados a esta filial." }
    }
    await db.branch.delete({ where: { id } })
    revalidatePath("/admin/filiais")
    return { success: true }
  } catch (error) {
    console.error(error)
    return { error: "Erro ao excluir filial." }
  }
}
