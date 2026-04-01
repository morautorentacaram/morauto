"use server"

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function createReservation(formData: FormData) {
  try {
    const customerId  = formData.get("customerId") as string
    const vehicleId   = formData.get("vehicleId")  as string
    const startDate   = new Date(formData.get("startDate") as string)
    const endDate     = new Date(formData.get("endDate")   as string)
    const notes       = formData.get("notes") as string | null

    if (!customerId || !vehicleId || !startDate || !endDate)
      return { error: "Preencha todos os campos obrigatórios." }

    if (endDate <= startDate)
      return { error: "A data de devolução deve ser após a retirada." }

    // Anti-overbooking
    const conflict = await db.reservation.findFirst({
      where: {
        vehicleId,
        status: { in: ["PENDING", "CONFIRMED", "ACTIVE"] },
        AND: [{ startDate: { lt: endDate } }, { endDate: { gt: startDate } }],
      },
    })
    if (conflict) return { error: "Veículo já possui reserva neste período." }

    const vehicle = await db.vehicle.findUnique({ where: { id: vehicleId }, include: { category: true } })
    if (!vehicle) return { error: "Veículo não encontrado." }

    const days = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / 86400000))
    const totalValue = Number(vehicle.category.dailyRate) * days

    const reservation = await db.reservation.create({
      data: { customerId, vehicleId, startDate, endDate, totalValue, status: "PENDING", notes: notes || null },
    })

    await db.payment.create({
      data: { reservationId: reservation.id, amount: totalValue, status: "PENDING", method: "PIX" },
    })

    revalidatePath("/admin/reservas")
    return { success: true }
  } catch (error) {
    console.error(error)
    return { error: "Erro ao criar reserva." }
  }
}

export async function updateReservation(id: string, formData: FormData) {
  try {
    const startDate = new Date(formData.get("startDate") as string)
    const endDate   = new Date(formData.get("endDate")   as string)
    const notes     = formData.get("notes") as string | null

    if (endDate <= startDate)
      return { error: "A data de devolução deve ser após a retirada." }

    const reservation = await db.reservation.findUnique({ where: { id }, include: { vehicle: { include: { category: true } } } })
    if (!reservation) return { error: "Reserva não encontrada." }

    // Check conflict excluding self
    const conflict = await db.reservation.findFirst({
      where: {
        id: { not: id },
        vehicleId: reservation.vehicleId,
        status: { in: ["PENDING", "CONFIRMED", "ACTIVE"] },
        AND: [{ startDate: { lt: endDate } }, { endDate: { gt: startDate } }],
      },
    })
    if (conflict) return { error: "Veículo já possui reserva neste período." }

    const days = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / 86400000))
    const totalValue = Number(reservation.vehicle.category.dailyRate) * days

    await db.reservation.update({
      where: { id },
      data: { startDate, endDate, totalValue, notes: notes || null },
    })

    // Update payment amount if still pending
    await db.payment.updateMany({
      where: { reservationId: id, status: "PENDING" },
      data: { amount: totalValue },
    })

    revalidatePath("/admin/reservas")
    return { success: true }
  } catch (error) {
    console.error(error)
    return { error: "Erro ao atualizar reserva." }
  }
}

export async function deleteReservation(id: string) {
  try {
    const reservation = await db.reservation.findUnique({ where: { id } })
    if (!reservation) return { error: "Reserva não encontrada." }

    if (reservation.status === "ACTIVE")
      return { error: "Não é possível excluir uma locação ativa. Cancele primeiro." }

    await db.payment.deleteMany({ where: { reservationId: id } })
    await db.reservation.delete({ where: { id } })

    if (reservation.status !== "COMPLETED") {
      await db.vehicle.update({ where: { id: reservation.vehicleId }, data: { status: "AVAILABLE" } })
    }

    revalidatePath("/admin/reservas")
    return { success: true }
  } catch (error) {
    console.error(error)
    return { error: "Erro ao excluir reserva." }
  }
}

export async function getReservations(opts?: { search?: string; status?: string }) {
  try {
    const { search, status } = opts ?? {}
    const where: any = {}

    if (status) {
      where.status = status
    }

    if (search) {
      const q = search.trim()
      where.customer = {
        OR: [
          { document: { contains: q, mode: "insensitive" } },
          { user: { name: { contains: q, mode: "insensitive" } } },
        ],
      }
    }

    return await db.reservation.findMany({
      where,
      include: {
        customer: { include: { user: true } },
        vehicle:  { include: { category: true } },
        contract: true,
        payments: true,
      },
      orderBy: { createdAt: "desc" },
    })
  } catch (error) {
    console.error("Error fetching reservations:", error)
    throw new Error("Failed to fetch reservations")
  }
}

export async function updateReservationStatus(id: string, status: "PENDING" | "CONFIRMED" | "ACTIVE" | "COMPLETED" | "CANCELLED") {
  try {
    const reservation = await db.reservation.findUnique({ where: { id } });
    if (!reservation) return { error: "Reserva não encontrada." };

    await db.reservation.update({ where: { id }, data: { status } });

    // Auto-update vehicle status
    if (status === "ACTIVE") {
      await db.vehicle.update({ where: { id: reservation.vehicleId }, data: { status: "RENTED" } });
    } else if (status === "COMPLETED" || status === "CANCELLED") {
      await db.vehicle.update({ where: { id: reservation.vehicleId }, data: { status: "AVAILABLE" } });
    }

    // Auto-generate contract when confirming reservation (if not yet created)
    if (status === "CONFIRMED") {
      const existing = await db.rentalContract.findUnique({ where: { reservationId: id } })
      if (!existing) {
        const { generateRentalContract } = await import("@/app/actions/contract.actions")
        await generateRentalContract(id)
      }
    }

    revalidatePath("/admin/reservas");
    return { success: true };
  } catch (error) {
    console.error("Error updating reservation status:", error);
    return { error: "Erro ao atualizar status." };
  }
}

export async function generateRentalContract(reservationId: string) {
  try {
    const reservation = await db.reservation.findUnique({
      where: { id: reservationId },
      include: { customer: true }
    });

    if (!reservation) return { error: "Reserva não encontrada." };

    // Simply creates a contract record if it doesn't exist
    const contractNumber = `MOR-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const existingContract = await db.rentalContract.findUnique({ where: { reservationId } });
    
    if (!existingContract) {
      await db.rentalContract.create({
        data: {
          number: contractNumber,
          terms: `Contrato de Locação Padrão Morauto.\nData de Retirada: ${reservation.startDate.toISOString()}\nData de Devolução: ${reservation.endDate.toISOString()}`,
          reservationId: reservation.id,
          customerId: reservation.customerId,
        }
      });
    }

    revalidatePath("/admin/reservas");
    return { success: true };
  } catch (error) {
    console.error("Error generating contract:", error);
    return { error: "Erro ao gerar contrato." };
  }
}
