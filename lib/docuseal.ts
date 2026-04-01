/**
 * DocuSeal integration — uses the official @docuseal/api SDK
 * Docs: https://www.docuseal.com/docs/api
 */

import docuseal from "@docuseal/api"

// Configure once (called at module load time on the server)
docuseal.configure({ key: process.env.DOCUSEAL_API_KEY! })

export { docuseal }

// ── Re-export useful types ────────────────────────────────────────────────────
export type { CreateSubmissionFromHtmlResponse } from "@docuseal/api"

// ── Create submission directly from HTML (no separate template step) ──────────

export async function createContractSubmission(options: {
  contractNumber: string
  html: string
  signerEmail: string
  signerName: string
  sendEmail?: boolean
}) {
  return docuseal.createSubmissionFromHtml({
    name:       `Contrato ${options.contractNumber} — Morauto`,
    send_email: options.sendEmail ?? true,
    documents:  [{ name: options.contractNumber, html: options.html, size: "A4" }],
    submitters: [
      {
        role:  "First Party",
        email: options.signerEmail,
        name:  options.signerName,
      },
    ],
  })
}

// ── Build contract HTML ───────────────────────────────────────────────────────

export function buildContractHtml(contractTerms: string, contractNumber: string): string {
  const lines = contractTerms
    .split("\n")
    .map((line) => {
      const escaped = line
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
      if (escaped.trim() === "") return "<br/>"
      if (escaped.startsWith("━")) return `<hr style="border:1px solid #ccc; margin:8px 0"/>`
      return `<p style="margin:2px 0; font-size:11px; font-family:Arial,sans-serif">${escaped}</p>`
    })
    .join("")

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <style>
    body { font-family: Arial, sans-serif; font-size: 11px; color: #111; padding: 32px; max-width: 780px; margin: 0 auto; }
    hr { border: 1px solid #ccc; margin: 8px 0; }
    p { margin: 2px 0; line-height: 1.5; }
    .sign-block { margin-top: 40px; border-top: 2px solid #000; padding-top: 24px; }
    .sign-col { text-align: center; min-width: 220px; }
    .sign-col label { display: block; font-size: 11px; color: #555; margin-bottom: 6px; }
  </style>
</head>
<body>
  ${lines}

  <div class="sign-block">
    <div class="sign-col" style="margin: 0 auto;">
      <label>Assinatura do Locatário</label>
      {{Locatário:signature}}
    </div>
    <p style="text-align:center; margin-top:16px; font-size:10px; color:#888">
      Contrato ${contractNumber} — Assinado digitalmente via DocuSeal
    </p>
  </div>
</body>
</html>`
}
