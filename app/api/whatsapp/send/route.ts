import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { sendWhatsApp } from "@/lib/whatsapp/send"

async function isAuthorized(req: NextRequest): Promise<boolean> {
  const internalToken = process.env.INTERNAL_API_TOKEN
  if (internalToken) {
    if (req.headers.get("x-internal-token") === internalToken) return true
  }
  const session = await auth()
  return !!session?.user
}

export async function POST(req: NextRequest) {
  if (!(await isAuthorized(req))) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 })
  }

  if (!process.env.WHATSAPP_UZAPI_URL) {
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

  const result = await sendWhatsApp(whatsapp, message)
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 502 })
  }
  return NextResponse.json({ success: true })
}
