/**
 * Templates de notificação WhatsApp da Morauto.
 * Cada função envia para o cliente E para o número da empresa.
 */

import { broadcastWhatsApp, sendWhatsApp } from "./send"

function fmt(date: Date) {
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" })
}

function brl(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

function companyNumber(): string | null {
  return process.env.WHATSAPP_COMPANY_NUMBER ?? null
}

function recipients(customerPhone: string | null | undefined): string[] {
  const list: string[] = []
  if (customerPhone) list.push(customerPhone)
  const company = companyNumber()
  if (company) list.push(company)
  return list
}

// ── Reserva criada ────────────────────────────────────────────────────────────

export async function notifyReservationCreated(params: {
  customerPhone: string | null | undefined
  customerName: string
  vehicleLabel: string   // ex: "Toyota Corolla (ABC-1234)"
  startDate: Date
  endDate: Date
  totalValue: number
}) {
  const { customerPhone, customerName, vehicleLabel, startDate, endDate, totalValue } = params

  const customerMsg =
    `Olá, *${customerName}*! 🚗\n\n` +
    `Sua reserva na *Morauto* foi criada com sucesso!\n\n` +
    `*Veículo:* ${vehicleLabel}\n` +
    `*Retirada:* ${fmt(startDate)}\n` +
    `*Devolução:* ${fmt(endDate)}\n` +
    `*Total:* ${brl(totalValue)}\n\n` +
    `Entraremos em contato para confirmar. Qualquer dúvida, estamos à disposição!`

  const companyMsg =
    `📋 *Nova reserva criada*\n\n` +
    `*Cliente:* ${customerName}\n` +
    `*Telefone:* ${customerPhone ?? "não informado"}\n` +
    `*Veículo:* ${vehicleLabel}\n` +
    `*Retirada:* ${fmt(startDate)}\n` +
    `*Devolução:* ${fmt(endDate)}\n` +
    `*Total:* ${brl(totalValue)}`

  const phones = recipients(customerPhone)
  if (customerPhone) {
    await sendWhatsApp(customerPhone, customerMsg)
    const company = companyNumber()
    if (company) await sendWhatsApp(company, companyMsg)
  } else {
    const company = companyNumber()
    if (company) await sendWhatsApp(company, companyMsg)
  }
}

// ── Reserva confirmada ────────────────────────────────────────────────────────

export async function notifyReservationConfirmed(params: {
  customerPhone: string | null | undefined
  customerName: string
  vehicleLabel: string
  startDate: Date
  endDate: Date
  totalValue: number
  contractNumber?: string | null
}) {
  const { customerPhone, customerName, vehicleLabel, startDate, endDate, totalValue, contractNumber } = params

  const customerMsg =
    `✅ *Reserva confirmada!*\n\n` +
    `Olá, *${customerName}*!\n\n` +
    `Sua reserva na *Morauto* foi confirmada.\n\n` +
    `*Veículo:* ${vehicleLabel}\n` +
    `*Retirada:* ${fmt(startDate)}\n` +
    `*Devolução:* ${fmt(endDate)}\n` +
    `*Total:* ${brl(totalValue)}\n` +
    (contractNumber ? `*Contrato:* ${contractNumber}\n` : "") +
    `\nEstamos te aguardando! 🚗`

  const companyMsg =
    `✅ *Reserva confirmada*\n\n` +
    `*Cliente:* ${customerName}\n` +
    `*Telefone:* ${customerPhone ?? "não informado"}\n` +
    `*Veículo:* ${vehicleLabel}\n` +
    `*Retirada:* ${fmt(startDate)} → *Devolução:* ${fmt(endDate)}\n` +
    `*Total:* ${brl(totalValue)}` +
    (contractNumber ? `\n*Contrato:* ${contractNumber}` : "")

  if (customerPhone) await sendWhatsApp(customerPhone, customerMsg)
  const company = companyNumber()
  if (company) await sendWhatsApp(company, companyMsg)
}

// ── Contrato de venda fechado ──────────────────────────────────────────────────

export async function notifySaleContractCreated(params: {
  customerPhone: string | null | undefined
  customerName: string
  vehicleLabel: string
  totalValue: number
  contractNumber: string
}) {
  const { customerPhone, customerName, vehicleLabel, totalValue, contractNumber } = params

  const customerMsg =
    `🤝 *Contrato de compra confirmado!*\n\n` +
    `Olá, *${customerName}*!\n\n` +
    `Seu contrato de compra na *Morauto* foi registrado.\n\n` +
    `*Veículo:* ${vehicleLabel}\n` +
    `*Valor:* ${brl(totalValue)}\n` +
    `*Contrato nº:* ${contractNumber}\n\n` +
    `Obrigado pela confiança! 🚗`

  const companyMsg =
    `🤝 *Novo contrato de venda*\n\n` +
    `*Cliente:* ${customerName}\n` +
    `*Telefone:* ${customerPhone ?? "não informado"}\n` +
    `*Veículo:* ${vehicleLabel}\n` +
    `*Valor:* ${brl(totalValue)}\n` +
    `*Contrato nº:* ${contractNumber}`

  if (customerPhone) await sendWhatsApp(customerPhone, customerMsg)
  const company = companyNumber()
  if (company) await sendWhatsApp(company, companyMsg)
}
