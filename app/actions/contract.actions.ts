"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function getContracts() {
  return db.rentalContract.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      reservation: {
        include: {
          vehicle: { include: { category: true } },
          payments: true,
        },
      },
      customer: { include: { user: true } },
      inspections: true,
    },
  })
}

export async function getContractById(id: string) {
  return db.rentalContract.findUnique({
    where: { id },
    include: {
      reservation: {
        include: {
          vehicle: { include: { category: true } },
          payments: true,
        },
      },
      customer: { include: { user: true } },
      inspections: { orderBy: { createdAt: "asc" } },
    },
  })
}

export async function generateRentalContract(reservationId: string) {
  try {
    const reservation = await db.reservation.findUnique({
      where: { id: reservationId },
      include: {
        customer: { include: { user: true } },
        vehicle: { include: { category: true } },
      },
    })

    if (!reservation) return { error: "Reserva não encontrada." }

    const existing = await db.rentalContract.findUnique({
      where: { reservationId },
    })
    if (existing) return { error: "Contrato já gerado para esta reserva.", contractId: existing.id }

    const year = new Date().getFullYear()
    const count = await db.rentalContract.count()
    const number = `MOR-${year}-${String(count + 1).padStart(4, "0")}`

    const days = Math.ceil(
      (new Date(reservation.endDate).getTime() - new Date(reservation.startDate).getTime()) /
        (1000 * 60 * 60 * 24)
    )

    const terms = buildContractTerms({ reservation, days })

    const contract = await db.rentalContract.create({
      data: {
        number,
        terms,
        reservationId,
        customerId: reservation.customerId,
      },
    })

    await db.reservation.update({
      where: { id: reservationId },
      data: { status: "CONFIRMED" },
    })

    revalidatePath("/admin/contratos")
    revalidatePath("/admin/reservas")
    return { success: true, contractId: contract.id }
  } catch (error) {
    console.error(error)
    return { error: "Erro ao gerar contrato." }
  }
}

export async function signContract(contractId: string, signatureBase64: string) {
  try {
    await db.rentalContract.update({
      where: { id: contractId },
      data: {
        digitalSignature: signatureBase64,
        signedAt: new Date(),
      },
    })
    revalidatePath("/admin/contratos")
    return { success: true }
  } catch (error) {
    console.error(error)
    return { error: "Erro ao assinar contrato." }
  }
}

function buildContractTerms({ reservation, days }: { reservation: any; days: number }) {
  const { customer, vehicle } = reservation
  const startFmt = new Date(reservation.startDate).toLocaleDateString("pt-BR")
  const endFmt = new Date(reservation.endDate).toLocaleDateString("pt-BR")

  return `CONTRATO DE LOCAÇÃO DE VEÍCULO

LOCADORA: MORAUTO LOCADORA DE VEÍCULOS
CNPJ: 00.000.000/0001-00

LOCATÁRIO: ${customer.user.name}
CPF/CNPJ: ${customer.document}
TELEFONE: ${customer.phone ?? "N/I"}
ENDEREÇO: ${customer.address ?? "N/I"}
CNH: ${customer.cnh ?? "N/I"}

VEÍCULO: ${vehicle.brand} ${vehicle.model} ${vehicle.version ?? ""}
ANO: ${vehicle.year}
PLACA: ${vehicle.plate}
COR: ${vehicle.color}
RENAVAM: ${vehicle.renavam}
CHASSI: ${vehicle.chassi}

PERÍODO DE LOCAÇÃO:
Retirada: ${startFmt}
Devolução: ${endFmt}
Duração: ${days} dia(s)

VALORES:
Diária: ${new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(vehicle.category.dailyRate))}
Total: ${new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(reservation.totalValue))}
Caução: ${new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(reservation.depositValue ?? vehicle.category.depositValue))}

CONDIÇÕES GERAIS:
1. O locatário se responsabiliza por multas e infrações cometidas durante o período de locação.
2. O veículo deve ser devolvido no mesmo estado de conservação em que foi entregue.
3. O combustível deve ser devolvido no mesmo nível da retirada.
4. Em caso de sinistro, o locatário deverá comunicar imediatamente à locadora.
5. É proibida a sublocação do veículo.
6. O veículo não pode sair do território nacional sem autorização prévia.
7. O locatário declara ter pleno conhecimento das condições deste contrato.

Data de geração: ${new Date().toLocaleDateString("pt-BR")}
`
}
