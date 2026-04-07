"use server"

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getCategories() {
  try {
    return await db.category.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { vehicles: true }
        }
      }
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw new Error("Failed to fetch categories");
  }
}

export async function createCategory(formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const dailyRate = Number(formData.get("dailyRate"));
    const weeklyRate = formData.get("weeklyRate") ? Number(formData.get("weeklyRate")) : null;
    const monthlyRate = formData.get("monthlyRate") ? Number(formData.get("monthlyRate")) : null;
    const depositValue = Number(formData.get("depositValue"));

    if (!name || !dailyRate || depositValue == null || isNaN(depositValue)) {
      return { error: "Nome, preço diário e valor da caução são obrigatórios." };
    }

    await db.category.create({
      data: {
        name,
        dailyRate,
        weeklyRate,
        monthlyRate,
        depositValue
      }
    });

    revalidatePath("/admin/categorias");
    return { success: true };
  } catch (error) {
    console.error("Error creating category:", error);
    return { error: "Erro ao criar categoria. Verifique se o nome já existe." };
  }
}

export async function updateCategory(id: string, formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const dailyRate = Number(formData.get("dailyRate"));
    const weeklyRate = formData.get("weeklyRate") ? Number(formData.get("weeklyRate")) : null;
    const monthlyRate = formData.get("monthlyRate") ? Number(formData.get("monthlyRate")) : null;
    const depositValue = Number(formData.get("depositValue"));

    if (!name || !dailyRate || depositValue == null || isNaN(depositValue)) {
      return { error: "Nome, preço diário e valor da caução são obrigatórios." };
    }

    await db.category.update({
      where: { id },
      data: { name, dailyRate, weeklyRate, monthlyRate, depositValue }
    });

    revalidatePath("/admin/categorias");
    return { success: true };
  } catch (error) {
    console.error("Error updating category:", error);
    return { error: "Erro ao atualizar categoria. Verifique se o nome já existe." };
  }
}

export async function deleteCategory(id: string) {
  try {
    const vehiclesCount = await db.vehicle.count({ where: { categoryId: id } });
    if (vehiclesCount > 0) {
      return { error: "Existem veículos associados a esta categoria. Remova-os primeiro." };
    }

    await db.category.delete({ where: { id } });
    revalidatePath("/admin/categorias");
    return { success: true };
  } catch (error) {
    console.error("Error deleting category:", error);
    return { error: "Erro ao deletar categoria." };
  }
}
