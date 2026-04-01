/**
 * BB Webhook Handler
 *
 * Handles two types of notifications from Banco do Brasil:
 *
 * 1. PIX webhook  — POST with { pix: [ { txid, valor, horario, ... } ] }
 *    BB sends this whenever a PIX linked to a registered key is received.
 *    Registration: PUT /v2/webhook/{chave} in the PIX API.
 *
 * 2. Boleto baixa — BB doesn't push a dedicated webhook in v2; status must be
 *    polled via GET /boletos/{nossoNumero}. The PIX QR attached to the boleto
 *    does trigger a PIX webhook when paid, so that path is covered above.
 *
 * Security: BB authenticates webhook deliveries using mTLS (client cert) in
 * production. In the sandbox / homolog environments verification is skipped.
 * Set BB_WEBHOOK_SECRET to an additional HMAC secret if you add one.
 */

import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

export const dynamic = "force-dynamic"

// ── PIX webhook payload types ─────────────────────────────────────────────────

interface PixEntry {
  endToEndId: string
  txid: string
  valor: string
  horario: string
  pagador?: {
    cpf?: string
    cnpj?: string
    nome?: string
  }
  infoPagador?: string
  devolucoes?: unknown[]
}

interface PixWebhookPayload {
  pix: PixEntry[]
}

// ── POST /api/webhook/bb ──────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as PixWebhookPayload

    if (!Array.isArray(body?.pix)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
    }

    const results: Array<{ txid: string; result: string }> = []

    for (const entry of body.pix) {
      const { txid, valor, horario } = entry
      if (!txid) continue

      // Find the payment by txid (could be a direct PIX COB or a boleto-linked PIX)
      const payment = await db.payment.findUnique({ where: { txid } })

      if (!payment) {
        results.push({ txid, result: "not_found" })
        continue
      }

      if (payment.status === "PAID") {
        results.push({ txid, result: "already_paid" })
        continue
      }

      // Mark as paid
      await db.payment.update({
        where: { id: payment.id },
        data: {
          status: "PAID",
          paidAt: horario ? new Date(horario) : new Date(),
        },
      })

      // If the linked reservation is still PENDING, confirm it
      await db.reservation.updateMany({
        where: {
          id: payment.reservationId,
          status: "PENDING",
        },
        data: { status: "CONFIRMED" },
      })

      results.push({ txid, result: "paid" })
    }

    revalidatePath("/admin/financeiro")
    revalidatePath("/admin/reservas")
    revalidatePath("/minhas-reservas")

    return NextResponse.json({ received: true, results }, { status: 200 })
  } catch (error: any) {
    console.error("[BB Webhook] error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
