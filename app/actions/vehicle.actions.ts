"use server"

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getVehicles() {
  try {
    return await db.vehicle.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        category: true,
        _count: {
          select: { reservations: true }
        }
      }
    });
  } catch (error) {
    console.error("Error fetching vehicles:", error);
    throw new Error("Failed to fetch vehicles");
  }
}

export async function getAvailableVehicles() {
  return db.vehicle.findMany({
    where: { status: "AVAILABLE" },
    include: { category: true },
    orderBy: [{ brand: "asc" }, { model: "asc" }],
  })
}

export async function getVehicleById(id: string) {
  try {
    return await db.vehicle.findUnique({
      where: { id },
      include: { category: true }
    });
  } catch (error) {
    console.error("Error fetching vehicle:", error);
    return null;
  }
}

export async function createVehicle(formData: FormData) {
  try {
    const photosRaw = formData.get("photos") as string
    const photos = photosRaw ? photosRaw.split(",").filter(Boolean) : []

    const data = {
      model: formData.get("model") as string,
      brand: formData.get("brand") as string,
      version: formData.get("version") as string || null,
      year: Number(formData.get("year")),
      plate: formData.get("plate") as string,
      renavam: formData.get("renavam") as string,
      chassi: formData.get("chassi") as string,
      color: formData.get("color") as string,
      km: Number(formData.get("km")) || 0,
      fuelType: formData.get("fuelType") as string,
      transmission: formData.get("transmission") as string,
      categoryId: formData.get("categoryId") as string,
      photos,
    };

    if (!data.model || !data.brand || !data.plate || !data.renavam || !data.chassi || !data.categoryId) {
      return { error: "Campos obrigatórios faltando. Preencha todos os campos com asterisco." };
    }

    // Server-side uppercase conversions for uniqueness consistency
    data.plate = data.plate.toUpperCase().trim();
    data.renavam = data.renavam.trim();
    data.chassi = data.chassi.toUpperCase().trim();

    await db.vehicle.create({
      data: data as any,
    });

    revalidatePath("/admin/veiculos");
    return { success: true };
  } catch (error: any) {
    console.error("Error creating vehicle:", error);
    if (error.code === 'P2002') {
      return { error: "Já existe um veículo cadastrado com esta Placa, Renavam ou Chassi." };
    }
    return { error: "Erro ao cadastrar veículo." };
  }
}

export async function updateVehicle(id: string, formData: FormData) {
  try {
    const photosRaw = formData.get("photos") as string
    const photos = photosRaw ? photosRaw.split(",").filter(Boolean) : []

    const data = {
      model: formData.get("model") as string,
      brand: formData.get("brand") as string,
      version: (formData.get("version") as string) || null,
      year: Number(formData.get("year")),
      plate: (formData.get("plate") as string).toUpperCase().trim(),
      renavam: (formData.get("renavam") as string).trim(),
      chassi: (formData.get("chassi") as string).toUpperCase().trim(),
      color: formData.get("color") as string,
      km: Number(formData.get("km")) || 0,
      fuelType: formData.get("fuelType") as string,
      transmission: formData.get("transmission") as string,
      categoryId: formData.get("categoryId") as string,
      status: formData.get("status") as string,
      photos,
    };

    if (!data.model || !data.brand || !data.plate || !data.renavam || !data.chassi || !data.categoryId) {
      return { error: "Campos obrigatórios faltando." };
    }

    await db.vehicle.update({ where: { id }, data: data as any });
    revalidatePath("/admin/veiculos");
    return { success: true };
  } catch (error: any) {
    console.error("Error updating vehicle:", error);
    if (error.code === "P2002") {
      return { error: "Já existe um veículo com esta Placa, Renavam ou Chassi." };
    }
    return { error: "Erro ao atualizar veículo." };
  }
}

export async function deleteVehicle(id: string) {
  try {
    const resCount = await db.reservation.count({ where: { vehicleId: id } });
    if (resCount > 0) {
      return { error: "Este veículo possui histórico de reservas. Apenas marque como INDISPONÍVEL em vez de excluir." };
    }

    await db.vehicle.delete({ where: { id } });
    revalidatePath("/admin/veiculos");
    return { success: true };
  } catch (error) {
    console.error("Error deleting vehicle:", error);
    return { error: "Erro ao deletar veículo." };
  }
}
