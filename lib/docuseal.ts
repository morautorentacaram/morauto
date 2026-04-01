/**
 * DocuSeal API client — implementado com fetch nativo para compatibilidade com Next.js/Turbopack.
 * O SDK oficial (@docuseal/api) usa node:https que falha no bundler do Next.js 16.
 * Docs: https://www.docuseal.com/docs/api
 */

const DOCUSEAL_API = "https://api.docuseal.com"

function authHeaders() {
  return {
    "X-Auth-Token": process.env.DOCUSEAL_API_KEY!,
    "Content-Type": "application/json",
  }
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface DocuSealSubmitter {
  id: number
  submission_id: number
  uuid: string
  email: string
  slug: string
  status: "awaiting" | "sent" | "opened" | "completed" | "declined"
  completed_at: string | null
  embed_src: string
  values: Array<{ field: string; value: string }>
}

export interface DocuSealSubmissionFromHtmlResponse {
  id: number
  name?: string
  submitters: DocuSealSubmitter[]
}

// ── Create submission directly from HTML ─────────────────────────────────────

export async function createContractSubmission(options: {
  contractNumber: string
  html: string
  signerEmail: string
  signerName: string
  sendEmail?: boolean
}): Promise<DocuSealSubmissionFromHtmlResponse> {
  const res = await fetch(`${DOCUSEAL_API}/submissions/html`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({
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
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`DocuSeal API error ${res.status}: ${err}`)
  }

  return res.json()
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
