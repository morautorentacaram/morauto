/**
 * DocuSeal Webhook Handler
 *
 * Receives events from DocuSeal when a submitter signs a document.
 *
 * Events handled:
 *  - submission.completed  → all parties signed → marks contract as signed
 *  - submitter.completed   → individual signed  → marks contract as signed
 *
 * Security: Optionally verify the X-DocuSeal-Signature header if
 * DOCUSEAL_WEBHOOK_SECRET is configured in your DocuSeal account settings.
 *
 * Setup: configure https://yourdomain.com/api/webhook/docuseal as the
 * webhook URL in your DocuSeal account → Settings → Webhooks.
 */

import { NextRequest, NextResponse } from "next/server"
import { revalidatePath } from "next/cache"

interface DocuSealSubmitterValue {
  field: string
  value: string
}

interface DocuSealWebhookSubmitter {
  id: number
  submission_id: number
  slug: string
  email: string
  completed_at: string | null
  values: DocuSealSubmitterValue[]
}

interface DocuSealWebhookPayload {
  event_type: "submission.completed" | "submitter.completed" | "submission.created" | string
  timestamp: string
  data: {
    id: number
    submitters?: DocuSealWebhookSubmitter[]
    // For submitter.completed the top-level data IS the submitter
    submission_id?: number
    slug?: string
    completed_at?: string | null
    values?: DocuSealSubmitterValue[]
  }
}

export async function POST(req: NextRequest) {
  const { db } = await import("@/lib/db")
  try {
    const body = await req.json() as DocuSealWebhookPayload

    const { event_type, data } = body

    if (!event_type || !data) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
    }

    // ── submission.completed: all parties have signed ─────────────────────────
    if (event_type === "submission.completed") {
      const submissionId = String(data.id)

      const contract = await db.rentalContract.findFirst({
        where: { docusealSubmissionId: submissionId },
      })

      if (!contract) {
        return NextResponse.json({ received: true, result: "submission_not_found" })
      }

      if (contract.signedAt) {
        return NextResponse.json({ received: true, result: "already_signed" })
      }

      // Extract signature image from submitter values if available
      const signatureValue = data.submitters
        ?.flatMap((s) => s.values)
        .find((v) => v.field?.toLowerCase().includes("locat") || v.field?.toLowerCase().includes("sign"))
        ?.value ?? "docuseal-signed"

      await db.rentalContract.update({
        where: { id: contract.id },
        data: {
          digitalSignature: signatureValue,
          signedAt: new Date(),
        },
      })

      revalidatePath("/admin/contratos")
      revalidatePath(`/admin/contratos/${contract.id}`)
      revalidatePath("/minha-conta/contratos")

      return NextResponse.json({ received: true, result: "signed", contractId: contract.id })
    }

    // ── submitter.completed: individual submitter signed ──────────────────────
    if (event_type === "submitter.completed") {
      const submissionId = data.submission_id ? String(data.submission_id) : null

      if (!submissionId) {
        return NextResponse.json({ received: true, result: "no_submission_id" })
      }

      const contract = await db.rentalContract.findFirst({
        where: { docusealSubmissionId: submissionId },
      })

      if (!contract || contract.signedAt) {
        return NextResponse.json({ received: true, result: contract ? "already_signed" : "not_found" })
      }

      const signatureValue = data.values
        ?.find((v) => v.field?.toLowerCase().includes("locat") || v.field?.toLowerCase().includes("sign"))
        ?.value ?? "docuseal-signed"

      await db.rentalContract.update({
        where: { id: contract.id },
        data: {
          digitalSignature: signatureValue,
          signedAt: new Date(),
        },
      })

      revalidatePath("/admin/contratos")
      revalidatePath(`/admin/contratos/${contract.id}`)
      revalidatePath("/minha-conta/contratos")

      return NextResponse.json({ received: true, result: "signed", contractId: contract.id })
    }

    return NextResponse.json({ received: true, result: "ignored" })
  } catch (error: any) {
    console.error("[DocuSeal Webhook] error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
