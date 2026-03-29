"use server"

import { db } from "@/lib/db"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { sendReservationConfirmation } from "@/lib/email"

export async function processCheckout(formData: FormData) {
  try {
    const vehicleId = formData.get("vehicleId") as string
    const startDate = formData.get("startDate") as string
    const endDate = formData.get("endDate") as string
    const totalValue = Number(formData.get("totalValue"))

    if (!vehicleId || !startDate || !endDate || !totalValue) {
      return { error: "Dados da reserva inválidos ou incompletos." }
    }

    const start = new Date(startDate)
    const end = new Date(endDate)

    if (end <= start) {
      return { error: "A data de devolução deve ser posterior à data de retirada." }
    }

    // Check vehicle availability and date conflicts
    const vehicle = await db.vehicle.findUnique({
      where: { id: vehicleId },
      include: { category: true },
    })
    if (!vehicle || vehicle.status === "MAINTENANCE" || vehicle.status === "UNAVAILABLE" || vehicle.status === "BLOCKED" || vehicle.status === "SOLD") {
      return { error: "Desculpe, este veículo não está disponível para locação." }
    }

    // Check for date conflicts with existing reservations
    const conflictingReservation = await db.reservation.findFirst({
      where: {
        vehicleId,
        status: { in: ["PENDING", "CONFIRMED", "ACTIVE"] },
        AND: [
          { startDate: { lt: end } },
          { endDate: { gt: start } },
        ],
      },
    })
    if (conflictingReservation) {
      return { error: "O veículo já possui uma reserva neste período. Escolha outras datas ou outro veículo." }
    }

    const session = await auth()
    let userId = session?.user?.id
    let customerId = ""

    if (!userId) {
      const name = formData.get("name") as string
      const email = formData.get("email") as string
      const document = formData.get("document") as string
      const phone = formData.get("phone") as string

      if (!name || !email || !document) {
        return { error: "Nome, e-mail e CPF são obrigatórios para visitantes." }
      }

      // Block if customer is blocked
      const existingCustomer = await db.customer.findUnique({
        where: { document: document.replace(/\D/g, "") },
      })
      if (existingCustomer?.blocked) {
        return { error: "Sua conta está bloqueada. Entre em contato com a locadora." }
      }

      let user = await db.user.findUnique({ where: { email } })
      if (!user) {
        user = await db.user.create({
          data: { name, email, role: "CUSTOMER" },
        })
      }
      userId = user.id

      let customer = await db.customer.findUnique({ where: { userId } })
      if (!customer) {
        customer = await db.customer.create({
          data: {
            userId: user.id,
            type: "PF",
            document: document.replace(/\D/g, ""),
            phone: phone ? phone.replace(/\D/g, "") : null,
          },
        })
      }
      customerId = customer.id

      // Send confirmation email
      await sendReservationConfirmation({
        to: email,
        customerName: name,
        vehicleName: `${vehicle.brand} ${vehicle.model}`,
        startDate: start.toLocaleDateString("pt-BR"),
        endDate: end.toLocaleDateString("pt-BR"),
        totalValue,
        reservationId: "pendente",
      }).catch(() => {}) // Don't fail checkout if email fails
    } else {
      let customer = await db.customer.findUnique({ where: { userId } })
      if (customer?.blocked) {
        return { error: "Sua conta está bloqueada. Entre em contato com a locadora." }
      }

      if (!customer) {
        const document = formData.get("document") as string
        const phone = formData.get("phone") as string

        if (!document) {
          return { error: "Você precisa informar o seu CPF para prosseguir com o aluguel." }
        }

        customer = await db.customer.create({
          data: {
            userId,
            type: "PF",
            document: document.replace(/\D/g, ""),
            phone: phone ? phone.replace(/\D/g, "") : null,
          },
        })
      }
      customerId = customer.id
    }

    // Create the reservation
    const reservation = await db.reservation.create({
      data: {
        startDate: start,
        endDate: end,
        status: "PENDING",
        totalValue,
        depositValue: Number(vehicle.category.depositValue),
        customerId,
        vehicleId,
      },
    })

    // Create a pending payment record
    await db.payment.create({
      data: {
        reservationId: reservation.id,
        amount: totalValue,
        method: "PIX",
        status: "PENDING",
        description: `Locação ${vehicle.brand} ${vehicle.model} — ${start.toLocaleDateString("pt-BR")} a ${end.toLocaleDateString("pt-BR")}`,
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h
      },
    })

  } catch (error: any) {
    console.error("Checkout error:", error)
    if (error.code === "P2002") {
      return { error: "Este CPF já está associado a outra conta." }
    }
    return { error: "Ocorreu um erro interno ao processar a reserva." }
  }

  redirect("/minhas-reservas?success=true")
}
