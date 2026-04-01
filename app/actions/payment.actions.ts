"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import {
  createPixCharge,
  createBoleto,
  getPixCharge,
  getBoleto,
  cancelPixCharge,
  cancelBoleto,
  generateTxid,
  formatPixAmount,
  formatDate,
  type BoletoInput,
} from "@/lib/bb-api"

// ── Helpers ───────────────────────────────────────────────────────────────────

async function fetchPaymentWithContext(paymentId: string) {
  return db.payment.findUnique({
    where: { id: paymentId },
    include: {
      reservation: {
        include: {
          customer: { include: { user: true } },
          vehicle: true,
        },
      },
    },
  })
}

// ── PIX ───────────────────────────────────────────────────────────────────────

/**
 * Generates a BB PIX immediate charge (COB) for a pending payment record.
 * Returns the txid and PIX copia-e-cola payload for display to the user.
 */
export async function initPixPayment(paymentId: string) {
  try {
    const payment = await fetchPaymentWithContext(paymentId)
    if (!payment) return { error: "Pagamento não encontrado." }
    if (payment.status !== "PENDING") return { error: "Pagamento já processado." }

    const pixKey = process.env.BB_PIX_KEY
    if (!pixKey) return { error: "Chave PIX não configurada (BB_PIX_KEY)." }

    const txid = payment.txid ?? generateTxid()
    const customer = payment.reservation.customer
    const vehicle = payment.reservation.vehicle
    const amount = Number(payment.amount)

    const pixResponse = await createPixCharge(txid, {
      calendario: { expiracao: 3600 }, // 1 hour
      devedor: {
        cpf: customer.type === "PF" ? customer.document : undefined,
        cnpj: customer.type === "PJ" ? customer.document : undefined,
        nome: customer.user.name ?? "Cliente",
      },
      valor: { original: formatPixAmount(amount) },
      chave: pixKey,
      solicitacaoPagador:
        payment.description ??
        `Locação ${vehicle.brand} ${vehicle.model}`,
    })

    await db.payment.update({
      where: { id: paymentId },
      data: {
        txid,
        method: "PIX",
        qrCode: pixResponse.pixCopiaECola ?? pixResponse.location,
      },
    })

    revalidatePath("/admin/financeiro")
    return {
      success: true,
      txid,
      pixCopiaECola: pixResponse.pixCopiaECola,
      location: pixResponse.location,
    }
  } catch (error: any) {
    console.error("[initPixPayment]", error)
    return { error: error.message ?? "Erro ao gerar cobrança PIX." }
  }
}

// ── Boleto ────────────────────────────────────────────────────────────────────

/**
 * Registers a BB boleto for a pending payment record.
 * When BB_BOLETO_PIX=S the boleto also carries a PIX QR code (hybrid).
 * Stores nossoNumero, digitableLine, boletoBarCode and optional PIX EMV.
 */
export async function initBoletoPayment(paymentId: string) {
  try {
    const payment = await fetchPaymentWithContext(paymentId)
    if (!payment) return { error: "Pagamento não encontrado." }
    if (payment.status !== "PENDING") return { error: "Pagamento já processado." }

    const convenio = process.env.BB_CONVENIO
    if (!convenio) return { error: "Convênio BB não configurado (BB_CONVENIO)." }

    const customer = payment.reservation.customer
    const vehicle = payment.reservation.vehicle
    const amount = Number(payment.amount)
    const dueDate =
      payment.dueDate ?? new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3 days

    // Parse customer address into components (best-effort)
    const rawAddress = customer.address ?? ""
    const addressParts = rawAddress.split(",").map((s) => s.trim())
    const street = addressParts[0] || "Não informado"
    const neighborhood = addressParts[1] || "Não informado"
    const cityState = (addressParts[2] || "").split("-").map((s) => s.trim())
    const city = cityState[0] || "Não informado"
    const uf = (cityState[1] || "XX").slice(0, 2).toUpperCase()

    // Unique client identifier for this boleto (convenio + timestamp suffix)
    const numeroTituloCliente = `${convenio.padStart(7, "0")}${Date.now()
      .toString()
      .slice(-10)}`

    const boletoInput: BoletoInput = {
      numeroConvenio: Number(convenio),
      numeroCarteira: Number(process.env.BB_BOLETO_CARTEIRA ?? "17"),
      numeroVariacaoCarteira: Number(
        process.env.BB_BOLETO_VARIACAO_CARTEIRA ?? "35"
      ),
      codigoModalidade: 1,
      dataEmissao: formatDate(new Date()),
      dataVencimento: formatDate(dueDate),
      valorOriginal: amount,
      codigoTipoTitulo: 2,    // 2 = Duplicata Mercantil
      codigoAceite: "A",
      indicadorPermissaoRecebimentoParcial: "N",
      numeroTituloCliente,
      campoUtilizacaoBeneficiario:
        payment.description ?? `Locação ${vehicle.brand} ${vehicle.model}`,
      canalSolicitacao: 6,      // 6 = internet
      indicadorPix: process.env.BB_BOLETO_PIX ?? "S",  // gera QR junto
      indicadorAceiteTituloVencido: "S",
      numeroDiasLimiteRecebimento: 30,
      pagador: {
        tipoInscricao: customer.type === "PF" ? 1 : 2,
        numeroInscricao: customer.document,
        nome: customer.user.name ?? "Cliente",
        endereco: street,
        cep: "00000000",
        cidade: city,
        bairro: neighborhood,
        uf,
        telefone: customer.phone ?? "",
      },
    }

    const boletoResponse = await createBoleto(boletoInput)

    await db.payment.update({
      where: { id: paymentId },
      data: {
        method: "BOLETO",
        nossoNumero: boletoResponse.numero,
        digitableLine: boletoResponse.linhaDigitavel,
        boletoBarCode: boletoResponse.codigoBarraNumerico,
        // If PIX QR was generated alongside, store EMV payload and txid
        qrCode: boletoResponse.qrCode?.emv ?? null,
        txid: boletoResponse.qrCode?.txId ?? null,
      },
    })

    revalidatePath("/admin/financeiro")
    return {
      success: true,
      nossoNumero: boletoResponse.numero,
      linhaDigitavel: boletoResponse.linhaDigitavel,
      codigoBarras: boletoResponse.codigoBarraNumerico,
      pixEmv: boletoResponse.qrCode?.emv,
      pixTxid: boletoResponse.qrCode?.txId,
    }
  } catch (error: any) {
    console.error("[initBoletoPayment]", error)
    return { error: error.message ?? "Erro ao gerar boleto." }
  }
}

// ── Status sync ───────────────────────────────────────────────────────────────

/**
 * Polls BB API to sync the payment status.
 * For PIX: checks COB status. For BOLETO: checks boleto detail.
 */
export async function syncPaymentStatus(paymentId: string) {
  try {
    const payment = await db.payment.findUnique({ where: { id: paymentId } })
    if (!payment) return { error: "Pagamento não encontrado." }
    if (payment.status === "PAID") return { success: true, status: "PAID" }

    if (payment.method === "PIX" && payment.txid) {
      const pixCharge = await getPixCharge(payment.txid)

      if (pixCharge.status === "CONCLUIDA") {
        await db.payment.update({
          where: { id: paymentId },
          data: { status: "PAID", paidAt: new Date() },
        })
        revalidatePath("/admin/financeiro")
        return { success: true, status: "PAID" }
      }

      return { success: true, status: pixCharge.status }
    }

    if (payment.method === "BOLETO" && payment.nossoNumero) {
      const boletoDetail = await getBoleto(payment.nossoNumero)
      // BB boleto doesn't expose a simple paid status in v2 detail —
      // payment confirmation comes via webhook. Return current local status.
      return { success: true, status: payment.status, detail: boletoDetail }
    }

    return { success: true, status: payment.status }
  } catch (error: any) {
    console.error("[syncPaymentStatus]", error)
    return { error: error.message ?? "Erro ao verificar status." }
  }
}

// ── Cancellation ──────────────────────────────────────────────────────────────

/** Cancels an active BB charge (PIX or boleto baixa) and marks payment FAILED. */
export async function cancelBBPayment(paymentId: string) {
  try {
    const payment = await db.payment.findUnique({ where: { id: paymentId } })
    if (!payment) return { error: "Pagamento não encontrado." }
    if (payment.status === "PAID") return { error: "Pagamento já confirmado, não pode ser cancelado." }

    if (payment.method === "PIX" && payment.txid) {
      await cancelPixCharge(payment.txid)
    } else if (payment.method === "BOLETO" && payment.nossoNumero) {
      await cancelBoleto(payment.nossoNumero)
    }

    await db.payment.update({
      where: { id: paymentId },
      data: { status: "FAILED" },
    })

    revalidatePath("/admin/financeiro")
    return { success: true }
  } catch (error: any) {
    console.error("[cancelBBPayment]", error)
    return { error: error.message ?? "Erro ao cancelar cobrança." }
  }
}

// ── Convenience: create payment + immediately generate charge ─────────────────

/**
 * Creates a Payment record and immediately generates a BB PIX COB charge.
 * Returns everything needed to display the QR code to the user.
 */
export async function createAndChargeViaPix(input: {
  reservationId: string
  amount: number
  description?: string
  dueDate?: Date
}) {
  try {
    const pixKey = process.env.BB_PIX_KEY
    if (!pixKey) return { error: "Chave PIX não configurada (BB_PIX_KEY)." }

    const payment = await db.payment.create({
      data: {
        reservationId: input.reservationId,
        amount: input.amount,
        method: "PIX",
        status: "PENDING",
        description: input.description ?? null,
        dueDate: input.dueDate ?? new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    })

    const result = await initPixPayment(payment.id)
    if ("error" in result) {
      // Roll back the pending payment so caller can retry
      await db.payment.delete({ where: { id: payment.id } }).catch(() => {})
      return result
    }

    return { paymentId: payment.id, ...result }
  } catch (error: any) {
    console.error("[createAndChargeViaPix]", error)
    return { error: error.message ?? "Erro ao criar cobrança PIX." }
  }
}

/**
 * Creates a Payment record and immediately registers a BB boleto.
 * Returns linhaDigitavel + optional PIX EMV for display.
 */
export async function createAndChargeViaBoleto(input: {
  reservationId: string
  amount: number
  description?: string
  dueDate?: Date
}) {
  try {
    const payment = await db.payment.create({
      data: {
        reservationId: input.reservationId,
        amount: input.amount,
        method: "BOLETO",
        status: "PENDING",
        description: input.description ?? null,
        dueDate:
          input.dueDate ?? new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      },
    })

    const result = await initBoletoPayment(payment.id)
    if ("error" in result) {
      await db.payment.delete({ where: { id: payment.id } }).catch(() => {})
      return result
    }

    return { paymentId: payment.id, ...result }
  } catch (error: any) {
    console.error("[createAndChargeViaBoleto]", error)
    return { error: error.message ?? "Erro ao criar boleto." }
  }
}
