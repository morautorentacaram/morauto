"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { createContractSubmission, buildContractHtml } from "@/lib/docuseal"

// ── Company constants ─────────────────────────────────────────────────────────
const COMPANY = {
  name:    "MORAUTO LOCADORA DE VEÍCULOS E MÁQUINAS LTDA",
  cnpj:    "22.994.313/0001-45",
  address: "Av. Álvaro Maia, N.176-A, Bairro: Presidente Vargas",
  cep:     "CEP: 69025-360",
  city:    "Manaus-AM",
  phone:   "(92) 3622-2883 / 99292-1946",
  email:   "morautolucadora@hotmail.com",
  hours:   "SEG a SEX: 8h às 17h | SÁB: 8h às 13h | DOM e Feriados: Fechado",
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function fmt(v: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v)
}

function fmtDate(d: Date | string) {
  return new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" })
}

function fmtDateLong(d: Date | string) {
  return new Date(d).toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" })
}

function fmtDateTime(d: Date | string) {
  const dt = new Date(d)
  return `${dt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}h ${fmtDate(dt)}`
}

// ── CRUD ─────────────────────────────────────────────────────────────────────
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
          vehicle: { include: { category: true, branch: true } },
          payments: true,
          fines: true,
        },
      },
      customer: { include: { user: true } },
      inspections: { orderBy: { createdAt: "asc" } },
    },
  })
}

export async function deleteContract(id: string) {
  try {
    await db.rentalContract.delete({ where: { id } })
    revalidatePath("/admin/contratos")
    return { success: true }
  } catch (error) {
    console.error(error)
    return { error: "Erro ao excluir contrato." }
  }
}

export async function updateContractTerms(id: string, formData: FormData) {
  try {
    const terms = formData.get("terms") as string
    const number = formData.get("number") as string
    const signedAt = formData.get("signedAt") as string | null

    if (!terms || !number) return { error: "Campos obrigatórios faltando." }

    await db.rentalContract.update({
      where: { id },
      data: {
        terms,
        number,
        signedAt: signedAt ? new Date(signedAt) : null,
      },
    })

    revalidatePath("/admin/contratos")
    revalidatePath(`/admin/contratos/${id}`)
    return { success: true }
  } catch (error) {
    console.error(error)
    return { error: "Erro ao atualizar contrato." }
  }
}

// ── Generate ─────────────────────────────────────────────────────────────────
export async function generateRentalContract(reservationId: string) {
  try {
    const reservation = await db.reservation.findUnique({
      where: { id: reservationId },
      include: {
        customer: { include: { user: true } },
        vehicle: { include: { category: true, branch: true } },
        payments: true,
      },
    })

    if (!reservation) return { error: "Reserva não encontrada." }

    const existing = await db.rentalContract.findUnique({ where: { reservationId } })
    if (existing) return { contractId: existing.id }

    const year  = new Date().getFullYear()
    const count = await db.rentalContract.count()
    const number = `MOR-${year}-${String(count + 1).padStart(4, "0")}`

    const days = Math.max(
      1,
      Math.ceil(
        (new Date(reservation.endDate).getTime() - new Date(reservation.startDate).getTime()) /
          (1000 * 60 * 60 * 24)
      )
    )

    const terms = buildContractTerms({ reservation, days, number })

    const contract = await db.rentalContract.create({
      data: { number, terms, reservationId, customerId: reservation.customerId },
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

// ── Send for signature via DocuSeal ──────────────────────────────────────────
export async function sendContractForSignature(contractId: string) {
  try {
    const contract = await db.rentalContract.findUnique({
      where: { id: contractId },
      include: { customer: { include: { user: true } } },
    })

    if (!contract) return { error: "Contrato não encontrado." }
    if (contract.signedAt) return { error: "Contrato já assinado." }
    if (contract.docusealSubmissionId) return { error: "Contrato já enviado para assinatura." }

    const email = contract.customer.user.email
    const name  = contract.customer.user.name

    if (!email) return { error: "Cliente sem e-mail cadastrado." }

    const html       = buildContractHtml(contract.terms, contract.number)
    const submission = await createContractSubmission({
      contractNumber: contract.number,
      html,
      signerEmail: email,
      signerName:  name ?? email,
      sendEmail:   true,
    })

    const submitter = submission.submitters?.[0]
    if (!submitter) return { error: "Erro ao criar submissão no DocuSeal." }

    await db.rentalContract.update({
      where: { id: contractId },
      data: {
        docusealSubmissionId:  String(submission.id),
        docusealSubmitterSlug: submitter.slug,
      },
    })

    revalidatePath(`/admin/contratos/${contractId}`)
    return { success: true, embedSrc: submitter.embed_src, slug: submitter.slug }
  } catch (error) {
    console.error("[sendContractForSignature]", error)
    return { error: "Erro ao enviar contrato para assinatura." }
  }
}

// ── Sign ─────────────────────────────────────────────────────────────────────
export async function signContract(contractId: string, signatureBase64: string) {
  try {
    await db.rentalContract.update({
      where: { id: contractId },
      data: { digitalSignature: signatureBase64, signedAt: new Date() },
    })
    revalidatePath("/admin/contratos")
    return { success: true }
  } catch (error) {
    console.error(error)
    return { error: "Erro ao assinar contrato." }
  }
}

// ── Contract text builder ─────────────────────────────────────────────────────
function buildContractTerms({
  reservation,
  days,
  number,
}: {
  reservation: any
  days: number
  number: string
}) {
  const { customer, vehicle } = reservation
  const dailyRate    = Number(vehicle.category.dailyRate)
  const depositValue = Number(vehicle.category.depositValue ?? 0)
  const totalValue   = Number(reservation.totalValue)
  const kmLimit      = 1500

  const kmExcess     = 0.58
  const tax10pct     = totalValue * 0.1

  // payment method
  const payment = reservation.payments?.[0]
  const paymentLabel =
    payment?.status === "PAID" ? "PAGO" :
    payment?.method === "PIX"         ? "PIX — aguardando confirmação" :
    payment?.method === "CREDIT_CARD" ? "Cartão de Crédito" :
    payment?.method === "DEBIT_CARD"  ? "Cartão de Débito" :
    payment?.method === "CASH"        ? "Dinheiro" :
    payment?.method === "BANK_TRANSFER" ? "Transferência Bancária" : "A combinar"

  return `CONTRATO DE LOCAÇÃO DE AUTOMÓVEL DE PRAZO DETERMINADO
Nº ${number}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

LOCADORA:
${COMPANY.name}
CNPJ: ${COMPANY.cnpj}
Endereço: ${COMPANY.address}, ${COMPANY.cep}, ${COMPANY.city}
Telefone: ${COMPANY.phone} | E-mail: ${COMPANY.email}

LOCATÁRIO:
Nome: ${customer.user.name?.toUpperCase()}
CPF/CNPJ: ${customer.document}
Telefone: ${customer.phone ?? "Não informado"}
Endereço: ${customer.address ?? "Não informado"}
CNH: ${customer.cnh ?? "Não informado"}   Validade: ${customer.cnhExpiration ? fmtDate(customer.cnhExpiration) : "Não informada"}

As partes acima identificadas têm, entre si, justo e acertado o presente Contrato de Locação de Automóvel de Prazo Determinado, que se regerá pelas cláusulas seguintes e pelas condições descritas no presente.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DO OBJETO DO CONTRATO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Cláusula 1ª. O presente contrato tem como OBJETO a locação do automóvel:

   Marca/Modelo: ${vehicle.brand} ${vehicle.model}${vehicle.version ? " " + vehicle.version : ""}
   Ano Fabricação / Modelo: ${vehicle.year} / ${vehicle.year}
   Cor: ${vehicle.color?.toUpperCase()}
   Placa: ${vehicle.plate}
   RENAVAM: ${vehicle.renavam ?? "N/I"}
   Chassi: ${vehicle.chassi ?? "N/I"}
   Categoria: ${vehicle.category.name}

de propriedade de MORAUTO LOCADORA DE VEÍCULOS E MÁQUINAS LTDA.

   KM SAÍDA: ${(vehicle.km ?? 0).toLocaleString("pt-BR")} km
   DIÁRIA: ${fmt(dailyRate)} (${valorPorExtenso(dailyRate)}).
   HORÁRIO DA SAÍDA: ${fmtDateTime(reservation.startDate)}
   HORÁRIO DO RETORNO: ${fmtDateTime(reservation.endDate)}
   NÍVEL DE COMBUSTÍVEL: ______ (conferido na retirada)
   DURAÇÃO: ${days} dia(s)
   LIMITE DE KM: ${kmLimit.toLocaleString("pt-BR")} km/semana
   Km excedente: ${fmt(kmExcess)} por km acima da franquia
   Franquia: ${(214.28).toFixed(2).replace(".", ",")} km/dia

FORMA DE PAGAMENTO: ${paymentLabel}
VALOR TOTAL: ${fmt(totalValue)}${depositValue > 0 ? `\n   CAUÇÃO/GARANTIA: ${fmt(depositValue)}` : ""}${reservation.notes ? `\n\nOBSERVAÇÕES: ${reservation.notes}` : ""}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
NORMAS E CLÁUSULAS GERAIS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. REABASTECIMENTO: No caso de devolução do veículo com a quantidade de combustível inferior à registrada no momento de entrega do mesmo, o veículo terá seu tanque completado com gasolina (mesmo que seja bicombustível), sendo o valor do abastecimento e taxas cobrados no contrato de locação. Obs.: O combustível gasto no percurso até o local de entrega do veículo é de responsabilidade do cliente.

2. LIMPEZA DO VEÍCULO: Deverá ser devolvido com as mesmas características de limpeza em que foi recebido. No caso de devolução divergente poderão ser cobradas tarifas de lavagem simples no valor de R$ 35,00 (trinta e cinco Reais). Em caso de manchas nos forros e/ou odores que não sejam da normalidade do veículo será cobrada uma tarifa de higienização podendo custar a partir de R$ 150,00 (cento e cinquenta Reais) ou valor superior de acordo com as necessidades.

3. DOCUMENTOS PERDIDOS (Não devolvidos): Caso não seja devolvido junto com o veículo, o custo será de R$ 250,00 + 3 (três) diárias de locação.

4. RETIRADA DE VEÍCULO REBOCADO: Valor de R$ 500,00 (Quinhentos Reais), fora os custos de multa e reboque, em casos de culpabilidade do condutor (Cliente).

5. TAXAS DE ENTREGA/DEVOLUÇÃO: Veículo entregue ou recebido fora da locadora em horário não comercial terá uma taxa de R$ 30,00 (Trinta Reais), cobrado por evento (Entrega ou Devolução).

6. CHAVE DO VEÍCULO: O desaparecimento da chave do veículo terá sua reposição cobrada; o valor poderá variar de acordo com o modelo (Chave codificada ou Integrada com alarme).

7. DEVOLUÇÃO DE VALORES: A MORAUTO LOCADORA DE VEÍCULOS se reserva o direito de deixar o valor devido como crédito para futura locação ou a devolução à conta corrente do titular do contrato através de DOC/TED em até 30 dias após o fechamento do contrato e com cobrança da Taxa de Reembolso, incluída como despesa adicional no Contrato.

8. HORAS EXTRAS: A diária do veículo é de 24 horas e incidirá na cobrança de hora extra (1/6 do valor da diária para cada hora extra), sendo cobrada a diária integral de proteções e serviços adicionais conforme contrato de locação. Após a 6ª hora extra, será cobrado uma diária no valor integral.

9. TAXA ADMINISTRATIVA: Todo serviço adicional e/ou despesa terá seu valor somado com a taxa administrativa de 10% (${fmt(tax10pct)}) discriminada no Contrato de locação.

10. RESPONSABILIDADE POR MULTAS: O Locatário é responsável por todas as multas de trânsito incidentes sobre o veículo durante o período de locação, nos termos do art. 257 do Código de Trânsito Brasileiro.

11. SUBLOCAÇÃO PROIBIDA: É expressamente proibida a sublocação total ou parcial do veículo, bem como sua utilização para fins ilícitos ou transporte remunerado de passageiros ou cargas sem prévia autorização escrita da Locadora.

12. RESTRIÇÃO TERRITORIAL: O veículo NÃO está autorizado a ultrapassar a fronteira Brasil/Venezuela, sendo somente autorizado na cidade de Manaus — AM, salvo autorização expressa e por escrito da Locadora.

13. TROCA DE PNEUS: Caso o veículo sofra furo ou dano nos pneus durante o período de locação, a responsabilidade pela troca e custo é do Locatário.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
EXCLUSÃO DA PROTEÇÃO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

O Locatário é 100% (cem por cento) responsável por qualquer dano, roubo, furto ou assistência que seja acionado. O LOCATÁRIO será responsável pelo total dos danos ao veículo alugado (independente de culpa do sinistro), na eventualidade de:

a) Uso Indevido.
b) Quaisquer danos aos vidros, rodas, bancos e/ou acessórios.
c) Dirigir em violação de qualquer lei de trânsito.
d) Permitir o uso do veículo por motorista adicional não autorizado por escrito no contrato de locação, mesmo que este se encontre devidamente habilitado.
e) O CLIENTE está ciente que o veículo NÃO possui seguro.
f) O Locatário é responsável pela manutenção preventiva do veículo durante o período de locação.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ASSINATURA GARANTIDA — AUTORIZAÇÃO PRÉVIA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

AUTORIZO O DÉBITO DE VALORES DECORRENTES DESTE CONTRATO, INCLUSIVE DE MULTAS DE TRÂNSITO, NO CARTÃO DE CRÉDITO OU FORMA DE PAGAMENTO ACORDADA. TENHO CONHECIMENTO DA PRÉ-AUTORIZAÇÃO EFETUADA PELA LOCADORA COMO GARANTIA FINANCEIRA MÍNIMA PARA OS CASOS PREVISTOS NAS CLÁUSULAS E CONDIÇÕES CONTRATUAIS.

AUTORIZAÇÃO DE DÉBITO:

• Como cliente titular devidamente identificado neste demonstrativo/contrato de Aluguel de Carros, autorizo a MORAUTO LOCADORA DE VEÍCULOS E MÁQUINAS LTDA — CNPJ ${COMPANY.cnpj} — a debitar nos cartões de crédito/débito de minha titularidade apresentados na celebração deste contrato de locação ou emitir cobrança em meu nome para reembolsar as multas de trânsito, combustível utilizado, avarias, limpeza do veículo, entre outras despesas adicionais que venham a ocorrer e apontadas no check-list de devolução do veículo ou em outro documento que comprove tais despesas enquanto o mesmo estava em meu poder e uso, acrescido de taxa de administração prevista no contrato de locação.

• AUTORIZO a Locadora acima identificada a informar meus dados pessoais aos órgãos de trânsito, como CONDUTOR(A) DO VEÍCULO LOCADO (ou de outro que venha a substituí-lo), para fins de responsabilidade pelas MULTAS DE TRÂNSITO, relativas ao período deste contrato, de acordo com o art. 257 do Código de Trânsito Brasileiro, bem como inseri-los no Registro Nacional de Posse e Uso Temporário de Veículos — RENAPTV, conforme dispõe a Resolução CONTRAN N. 461, DE 12/11/2013, e normas suplementares ou substitutas.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DO FORO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Cláusula 2ª. Para dirimir quaisquer controvérsias oriundas do contrato, as partes elegem o foro da comarca de Manaus — Amazonas.

Por estarem assim justos e contratados, firmam o presente instrumento em duas vias de igual teor.

Manaus, ${fmtDateLong(new Date())}

Nota:
1. A Locação de Coisas rege-se pelo previsto nos Arts. 1188 a 1215 do Código Civil.
2. Art. 1192 do Código Civil.
3. Art. 1196 do Código Civil.
`
}

// ── Número por extenso (simplificado para valores comuns) ─────────────────────
function valorPorExtenso(valor: number): string {
  const unidades = ["", "um", "dois", "três", "quatro", "cinco", "seis", "sete", "oito", "nove", "dez",
    "onze", "doze", "treze", "quatorze", "quinze", "dezesseis", "dezessete", "dezoito", "dezenove"]
  const dezenas  = ["", "", "vinte", "trinta", "quarenta", "cinquenta", "sessenta", "setenta", "oitenta", "noventa"]
  const centenas = ["", "cem", "duzentos", "trezentos", "quatrocentos", "quinhentos", "seiscentos", "setecentos", "oitocentos", "novecentos"]

  if (valor === 0) return "zero reais"

  const reais    = Math.floor(valor)
  const centavos = Math.round((valor - reais) * 100)

  function porExtenso(n: number): string {
    if (n === 0) return ""
    if (n < 20) return unidades[n]
    if (n < 100) {
      const d = Math.floor(n / 10), u = n % 10
      return dezenas[d] + (u > 0 ? " e " + unidades[u] : "")
    }
    if (n === 100) return "cem"
    if (n < 1000) {
      const c = Math.floor(n / 100), r = n % 100
      return centenas[c] + (r > 0 ? " e " + porExtenso(r) : "")
    }
    if (n < 1000000) {
      const m = Math.floor(n / 1000), r = n % 1000
      return porExtenso(m) + " mil" + (r > 0 ? " e " + porExtenso(r) : "")
    }
    return String(n)
  }

  const parteReais    = porExtenso(reais)
  const parteCentavos = porExtenso(centavos)
  const labelReais    = reais === 1 ? "real" : "reais"
  const labelCentavos = centavos === 1 ? "centavo" : "centavos"

  if (centavos === 0) return `${parteReais} ${labelReais}`.toUpperCase()
  if (reais === 0)    return `${parteCentavos} ${labelCentavos}`.toUpperCase()
  return `${parteReais} ${labelReais} e ${parteCentavos} ${labelCentavos}`.toUpperCase()
}
