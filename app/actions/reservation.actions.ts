"use server"

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getReservations() {
  try {
    return await db.reservation.findMany({
      include: {
        customer: {
          include: { user: true }
        },
        vehicle: {
          include: { category: true }
        },
        contract: true,
      },
      orderBy: { createdAt: 'desc' }
    });
  } catch (error) {
    console.error("Error fetching reservations:", error);
    throw new Error("Failed to fetch reservations");
  }
}

export async function updateReservationStatus(id: string, status: "PENDING" | "CONFIRMED" | "ACTIVE" | "COMPLETED" | "CANCELLED") {
  try {
    const reservation = await db.reservation.findUnique({ where: { id } });
    if (!reservation) return { error: "Reserva não encontrada." };

    await db.reservation.update({
      where: { id },
      data: { status }
    });

    // Auto-update vehicle status based on reservation status
    if (status === "ACTIVE") {
      await db.vehicle.update({
        where: { id: reservation.vehicleId },
        data: { status: "RENTED" }
      });
    } else if (status === "COMPLETED" || status === "CANCELLED") {
      // Assuming it goes back to AVAILABLE. If there's maintenance, admin does it manually.
      await db.vehicle.update({
        where: { id: reservation.vehicleId },
        data: { status: "AVAILABLE" }
      });
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
