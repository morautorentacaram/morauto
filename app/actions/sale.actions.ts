"use server"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { notifySaleContractCreated } from "@/lib/whatsapp/notify"

// ── Company constants (same as rental)
const COMPANY = {
  name:    "MORAUTO LOCADORA DE VEÍCULOS E MÁQUINAS LTDA",
  cnpj:    "22.994.313/0001-45",
  address: "Av. Álvaro Maia, N.176-A, Bairro: Presidente Vargas",
  cep:     "CEP: 69025-360",
  city:    "Manaus-AM",
  phone:   "(92) 3622-2883 / 99292-1946",
  email:   "morautolucadora@hotmail.com",
}

function fmt(v: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v)
}
function fmtDateLong(d: Date | string) {
  return new Date(d).toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" })
}

export async function getSaleVehicles(opts?: { status?: string; search?: string }) {
  const where: any = {}
  if (opts?.status) where.status = opts.status
  if (opts?.search) {
    const q = opts.search.trim()
    where.OR = [
      { brand: { contains: q, mode: "insensitive" } },
      { model: { contains: q, mode: "insensitive" } },
      { plate: { contains: q, mode: "insensitive" } },
    ]
  }
  return db.saleVehicle.findMany({
    where,
    include: { _count: { select: { leads: true } } },
    orderBy: [{ highlighted: "desc" }, { createdAt: "desc" }],
  })
}

export async function getSaleVehicleById(id: string) {
  return db.saleVehicle.findUnique({
    where: { id },
    include: { leads: { include: { contract: true } }, contracts: true },
  })
}

export async function createSaleVehicle(formData: FormData) {
  try {
    const photosRaw = formData.get("photos") as string
    const featuresRaw = formData.get("features") as string
    await db.saleVehicle.create({
      data: {
        brand:        formData.get("brand") as string,
        model:        formData.get("model") as string,
        version:      (formData.get("version") as string) || null,
        year:         Number(formData.get("year")),
        plate:        (formData.get("plate") as string) || null,
        renavam:      (formData.get("renavam") as string) || null,
        chassi:       (formData.get("chassi") as string) || null,
        color:        formData.get("color") as string,
        km:           Number(formData.get("km") ?? 0),
        fuelType:     formData.get("fuelType") as string,
        transmission: formData.get("transmission") as string,
        doors:        Number(formData.get("doors") ?? 4),
        seats:        Number(formData.get("seats") ?? 5),
        price:        Number(formData.get("price")),
        description:  (formData.get("description") as string) || null,
        highlighted:  formData.get("highlighted") === "true",
        photos:       photosRaw ? photosRaw.split(",").filter(Boolean) : [],
        features:     featuresRaw ? featuresRaw.split(",").filter(Boolean) : [],
      },
    })
    revalidatePath("/admin/vendas")
    return { success: true }
  } catch (e) {
    console.error(e)
    return { error: "Erro ao cadastrar veículo." }
  }
}

export async function updateSaleVehicle(id: string, formData: FormData) {
  try {
    const photosRaw = formData.get("photos") as string
    const featuresRaw = formData.get("features") as string
    await db.saleVehicle.update({
      where: { id },
      data: {
        brand:        formData.get("brand") as string,
        model:        formData.get("model") as string,
        version:      (formData.get("version") as string) || null,
        year:         Number(formData.get("year")),
        plate:        (formData.get("plate") as string) || null,
        renavam:      (formData.get("renavam") as string) || null,
        chassi:       (formData.get("chassi") as string) || null,
        color:        formData.get("color") as string,
        km:           Number(formData.get("km") ?? 0),
        fuelType:     formData.get("fuelType") as string,
        transmission: formData.get("transmission") as string,
        doors:        Number(formData.get("doors") ?? 4),
        seats:        Number(formData.get("seats") ?? 5),
        price:        Number(formData.get("price")),
        description:  (formData.get("description") as string) || null,
        highlighted:  formData.get("highlighted") === "true",
        status:       (formData.get("status") as any) || "AVAILABLE",
        photos:       photosRaw ? photosRaw.split(",").filter(Boolean) : [],
        features:     featuresRaw ? featuresRaw.split(",").filter(Boolean) : [],
      },
    })
    revalidatePath("/admin/vendas")
    return { success: true }
  } catch (e) {
    console.error(e)
    return { error: "Erro ao atualizar veículo." }
  }
}

export async function deleteSaleVehicle(id: string) {
  try {
    const v = await db.saleVehicle.findUnique({ where: { id }, include: { contracts: true } })
    if (!v) return { error: "Veículo não encontrado." }
    if (v.contracts.length > 0) return { error: "Veículo possui contrato de venda. Não pode ser excluído." }
    await db.saleLead.deleteMany({ where: { vehicleId: id } })
    await db.saleVehicle.delete({ where: { id } })
    revalidatePath("/admin/vendas")
    return { success: true }
  } catch (e) {
    console.error(e)
    return { error: "Erro ao excluir veículo." }
  }
}

export async function updateSaleVehicleStatus(id: string, status: "AVAILABLE" | "RESERVED" | "SOLD") {
  await db.saleVehicle.update({ where: { id }, data: { status } })
  revalidatePath("/admin/vendas")
  return { success: true }
}

// ── Leads ─────────────────────────────────────────────────────────────────────
export async function getSaleLeads(vehicleId?: string) {
  return db.saleLead.findMany({
    where: vehicleId ? { vehicleId } : undefined,
    include: { vehicle: true, contract: true },
    orderBy: { createdAt: "desc" },
  })
}

export async function createSaleLead(formData: FormData) {
  try {
    const vehicleId = formData.get("vehicleId") as string
    if (!vehicleId) return { error: "Veículo não identificado." }
    await db.saleLead.create({
      data: {
        vehicleId,
        name:     formData.get("name") as string,
        email:    formData.get("email") as string,
        phone:    formData.get("phone") as string,
        document: (formData.get("document") as string) || null,
        address:  (formData.get("address") as string) || null,
        message:  (formData.get("message") as string) || null,
        status:   "NEW",
      },
    })
    revalidatePath(`/comprar/${vehicleId}`)
    return { success: true }
  } catch (e) {
    console.error(e)
    return { error: "Erro ao registrar interesse." }
  }
}

export async function updateLeadStatus(id: string, status: string) {
  await db.saleLead.update({ where: { id }, data: { status } })
  revalidatePath("/admin/vendas")
  return { success: true }
}

export async function deleteLead(id: string) {
  try {
    const lead = await db.saleLead.findUnique({ where: { id }, include: { contract: true } })
    if (!lead) return { error: "Lead não encontrado." }
    if (lead.contract) return { error: "Lead possui contrato. Não pode ser excluído." }
    await db.saleLead.delete({ where: { id } })
    revalidatePath("/admin/vendas")
    return { success: true }
  } catch (e) {
    console.error(e)
    return { error: "Erro ao excluir lead." }
  }
}

// ── Sale Contracts ─────────────────────────────────────────────────────────────
export async function getSaleContracts() {
  return db.saleContract.findMany({
    include: { vehicle: true, lead: true },
    orderBy: { createdAt: "desc" },
  })
}

export async function getSaleContractById(id: string) {
  return db.saleContract.findUnique({
    where: { id },
    include: { vehicle: true, lead: true },
  })
}

export async function generateSaleContract(leadId: string, formData: FormData) {
  try {
    const lead = await db.saleLead.findUnique({ where: { id: leadId }, include: { vehicle: true } })
    if (!lead) return { error: "Lead não encontrado." }

    const existing = await db.saleContract.findUnique({ where: { leadId } })
    if (existing) return { contractId: existing.id, error: "Contrato já gerado." }

    const year   = new Date().getFullYear()
    const count  = await db.saleContract.count()
    const number = `MORSV-${year}-${String(count + 1).padStart(4, "0")}`
    const salePrice      = Number(formData.get("salePrice") ?? lead.vehicle.price)
    const paymentMethod  = formData.get("paymentMethod") as string || "A combinar"

    // Structured payment details stored as JSON
    const payDetails: Record<string, string> = {}
    const fields = ["entryAmount","secondPayment","secondPayDate","installmentCount","installmentAmount","installmentStart","deliveryDate","vehicleKm","rg"]
    fields.forEach((f) => {
      const v = formData.get(f) as string
      if (v) payDetails[f] = v
    })
    if (!payDetails.vehicleKm) payDetails.vehicleKm = String(lead.vehicle.km ?? 0)
    const paymentDetails = JSON.stringify(payDetails)

    const terms = buildSaleContractTerms({ lead, number, salePrice, paymentMethod, paymentDetails })

    const contract = await db.saleContract.create({
      data: { number, salePrice, paymentMethod, paymentDetails, terms, vehicleId: lead.vehicleId, leadId },
    })

    await db.saleVehicle.update({ where: { id: lead.vehicleId }, data: { status: "RESERVED" } })
    await db.saleLead.update({ where: { id: leadId }, data: { status: "NEGOTIATING" } })

    revalidatePath("/admin/vendas")

    notifySaleContractCreated({
      customerPhone: lead.phone,
      customerName: lead.name,
      vehicleLabel: `${lead.vehicle.brand} ${lead.vehicle.model}${lead.vehicle.plate ? ` (${lead.vehicle.plate})` : ""}`,
      totalValue: salePrice,
      contractNumber: number,
    }).catch(() => {})

    return { success: true, contractId: contract.id }
  } catch (e) {
    console.error(e)
    return { error: "Erro ao gerar contrato." }
  }
}

export async function realizeSale(vehicleId: string, formData: FormData) {
  try {
    const vehicle = await db.saleVehicle.findUnique({ where: { id: vehicleId } })
    if (!vehicle) return { error: "Veículo não encontrado." }

    // Create lead
    const lead = await db.saleLead.create({
      data: {
        vehicleId,
        name:     formData.get("name") as string,
        email:    formData.get("email") as string,
        phone:    formData.get("phone") as string,
        document: (formData.get("document") as string) || null,
        address:  (formData.get("address") as string) || null,
        status:   "NEGOTIATING",
      },
      include: { vehicle: true },
    })

    // Build contract number
    const year   = new Date().getFullYear()
    const count  = await db.saleContract.count()
    const number = `MORSV-${year}-${String(count + 1).padStart(4, "0")}`

    const salePrice     = Number(formData.get("salePrice") ?? vehicle.price)
    const paymentMethod = (formData.get("paymentMethod") as string) || "A combinar"

    const payDetails: Record<string, string> = {}
    const fields = ["rg","entryAmount","secondPayment","secondPayDate","installmentCount","installmentAmount","installmentStart","deliveryDate"]
    fields.forEach((f) => {
      const v = formData.get(f) as string
      if (v) payDetails[f] = v
    })
    payDetails.vehicleKm = String(vehicle.km ?? 0)
    const paymentDetails = JSON.stringify(payDetails)

    const terms = buildSaleContractTerms({ lead, number, salePrice, paymentMethod, paymentDetails })

    const contract = await db.saleContract.create({
      data: { number, salePrice, paymentMethod, paymentDetails, terms, vehicleId, leadId: lead.id },
    })

    await db.saleVehicle.update({ where: { id: vehicleId }, data: { status: "RESERVED" } })

    revalidatePath("/admin/vendas")

    notifySaleContractCreated({
      customerPhone: lead.phone,
      customerName: lead.name,
      vehicleLabel: `${vehicle.brand} ${vehicle.model}${vehicle.plate ? ` (${vehicle.plate})` : ""}`,
      totalValue: salePrice,
      contractNumber: number,
    }).catch(() => {})

    return { success: true, contractId: contract.id }
  } catch (e) {
    console.error(e)
    return { error: "Erro ao realizar venda." }
  }
}

export async function finalizeSale(contractId: string) {
  try {
    const contract = await db.saleContract.findUnique({ where: { id: contractId } })
    if (!contract) return { error: "Contrato não encontrado." }
    await db.saleVehicle.update({ where: { id: contract.vehicleId }, data: { status: "SOLD" } })
    await db.saleLead.update({ where: { id: contract.leadId }, data: { status: "CLOSED" } })
    await db.saleContract.update({ where: { id: contractId }, data: { signedAt: new Date() } })
    revalidatePath("/admin/vendas")
    return { success: true }
  } catch (e) {
    return { error: "Erro ao finalizar venda." }
  }
}

function buildSaleContractTerms({ lead, number, salePrice, paymentMethod, paymentDetails }: {
  lead: any; number: string; salePrice: number; paymentMethod: string; paymentDetails: string
}) {
  const v = lead.vehicle
  return `CONTRATO DE COMPRA E VENDA DE VEÍCULO
Nº ${number}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

VENDEDOR:
${COMPANY.name}
CNPJ: ${COMPANY.cnpj}
Endereço: ${COMPANY.address}, ${COMPANY.cep}, ${COMPANY.city}
Telefone: ${COMPANY.phone} | E-mail: ${COMPANY.email}

COMPRADOR:
Nome: ${lead.name?.toUpperCase()}
CPF/CNPJ: ${lead.document ?? "Não informado"}
Telefone: ${lead.phone}
E-mail: ${lead.email}
Endereço: ${lead.address ?? "Não informado"}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DO OBJETO

Cláusula 1ª. O VENDEDOR vende ao COMPRADOR, em caráter irrevogável e irretratável, o veículo:

   Marca/Modelo: ${v.brand} ${v.model}${v.version ? " " + v.version : ""}
   Ano Fabricação/Modelo: ${v.year}/${v.year}
   Cor: ${v.color?.toUpperCase()}
   Placa: ${v.plate ?? "N/I"}
   RENAVAM: ${v.renavam ?? "N/I"}
   Chassi: ${v.chassi ?? "N/I"}
   KM atual: ${(v.km ?? 0).toLocaleString("pt-BR")} km
   Combustível: ${v.fuelType}
   Câmbio: ${v.transmission}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DO PREÇO E FORMA DE PAGAMENTO

Cláusula 2ª. O preço total da venda é de ${fmt(salePrice)} (${salePrice} reais).

Forma de Pagamento: ${paymentMethod}
${paymentDetails ? "Detalhes: " + paymentDetails : ""}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DECLARAÇÕES E GARANTIAS

Cláusula 3ª. O VENDEDOR declara que:
a) É legítimo proprietário do veículo descrito;
b) O veículo está livre de quaisquer ônus, dívidas, penhoras ou restrições;
c) Não existem multas de trânsito pendentes de sua responsabilidade além das informadas;
d) O veículo encontra-se em perfeitas condições de uso.

Cláusula 4ª. O COMPRADOR declara que:
a) Recebeu o veículo nas condições informadas, após prévia vistoria;
b) Está ciente das condições do veículo, incluindo estado mecânico e quilometragem;
c) Responsabiliza-se pela transferência do veículo junto ao DETRAN em até 30 (trinta) dias;
d) Assume inteira responsabilidade por eventuais multas e débitos gerados após a data deste contrato.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DA TRANSFERÊNCIA

Cláusula 5ª. O COMPRADOR se obriga a efetuar a transferência do veículo junto ao DETRAN/AM no prazo máximo de 30 (trinta) dias a contar da data de assinatura deste contrato, sendo de sua inteira responsabilidade os custos de transferência, IPVA, licenciamento e demais encargos.

Cláusula 6ª. Enquanto não efetuada a transferência, o COMPRADOR autoriza o VENDEDOR a comunicar ao DETRAN que o veículo se encontra vendido, isentando-o de qualquer responsabilidade por infrações cometidas após esta data.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DO FORO

Cláusula 7ª. As partes elegem o foro da comarca de Manaus — Amazonas para dirimir quaisquer controvérsias oriundas do presente contrato.

Manaus, ${fmtDateLong(new Date())}

Nota: O presente contrato é regido pelos Arts. 481 a 532 do Código Civil Brasileiro (Lei 10.406/2002).
`
}
