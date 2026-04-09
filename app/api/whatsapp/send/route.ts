import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"

// ── Helpers ────────────────────────────────────────────────────────────────

function normalizePhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, "")
  const phone = digits.startsWith("55") ? digits : `55${digits}`
  if (phone.length < 12 || phone.length > 13) return null
  return phone
}

function getUzapiConfig() {
  const url     = process.env.WHATSAPP_UZAPI_URL
  const session = process.env.WHATSAPP_UZAPI_SESSION
  const key     = process.env.WHATSAPP_UZAPI_SESSION_KEY

  if (!url || !session || !key) return null
  return { url: `${url.replace(/\/$/, "")}/sendText`, session, key }
}

// ── Auth check ────────────────────────────────────────────────────────────

async function isAuthorized(req: NextRequest): Promise<boolean> {
  const internalToken = process.env.INTERNAL_API_TOKEN
  if (internalToken) {
    const header = req.headers.get("x-internal-token")
    if (header === internalToken) return true
  }

  // Fallback: user must be logged in
  const session = await auth()
  return !!session?.user
}

// ── Route ─────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  if (!(await isAuthorized(req))) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 })
  }

  const uzapi = getUzapiConfig()
  if (!uzapi) {
    return NextResponse.json(
      { error: "WhatsApp não configurado. Defina WHATSAPP_UZAPI_URL, WHATSAPP_UZAPI_SESSION e WHATSAPP_UZAPI_SESSION_KEY." },
      { status: 503 }
    )
  }

  let body: { whatsapp?: string; message?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Body JSON inválido." }, { status: 400 })
  }

  const { whatsapp, message } = body

  if (!whatsapp || !message) {
    return NextResponse.json({ error: "Campos 'whatsapp' e 'message' são obrigatórios." }, { status: 400 })
  }

  const phone = normalizePhone(whatsapp)
  if (!phone) {
    return NextResponse.json(
      { error: "Número de WhatsApp inválido. Use formato com DDD e código do país (55)." },
      { status: 400 }
    )
  }

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10_000)

    const res = await fetch(uzapi.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        sessionkey: uzapi.key,
      },
      body: JSON.stringify({ session: uzapi.session, phone, text: message }),
      signal: controller.signal,
    }).finally(() => clearTimeout(timeout))

    if (res.status === 500) {
      const text = await res.text().catch(() => "")
      if (text.toLowerCase().includes("disconnect") || text.toLowerCase().includes("session")) {
        return NextResponse.json({ error: "Sessão WhatsApp desconectada. Reconecte no painel UZAPI." }, { status: 502 })
      }
    }

    if (!res.ok) {
      const text = await res.text().catch(() => res.statusText)
      return NextResponse.json({ error: `Falha ao enviar mensagem: ${text}` }, { status: 502 })
    }

    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    if (err instanceof Error && err.name === "AbortError") {
      return NextResponse.json({ error: "Timeout ao conectar com UZAPI." }, { status: 504 })
    }
    console.error("[whatsapp/send]", err)
    return NextResponse.json({ error: "Erro interno ao enviar mensagem." }, { status: 500 })
  }
}
