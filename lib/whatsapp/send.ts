/**
 * Sender direto para UZAPI — sem HTTP loopback.
 * Usado tanto pela rota /api/whatsapp/send quanto pelas server actions.
 */

export interface SendResult {
  success: boolean
  error?: string
}

function normalizePhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, "")
  const phone = digits.startsWith("55") ? digits : `55${digits}`
  if (phone.length < 12 || phone.length > 13) return null
  return phone
}

function getConfig() {
  const url     = process.env.WHATSAPP_UZAPI_URL
  const session = process.env.WHATSAPP_UZAPI_SESSION
  const key     = process.env.WHATSAPP_UZAPI_SESSION_KEY
  if (!url || !session || !key) return null
  return { endpoint: `${url.replace(/\/$/, "")}/sendText`, session, key }
}

export async function sendWhatsApp(rawPhone: string, message: string): Promise<SendResult> {
  const config = getConfig()
  if (!config) {
    console.warn("[whatsapp] UZAPI não configurado — mensagem não enviada.")
    return { success: false, error: "WhatsApp não configurado." }
  }

  const phone = normalizePhone(rawPhone)
  if (!phone) {
    return { success: false, error: `Número inválido: ${rawPhone}` }
  }

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10_000)

    const res = await fetch(config.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        sessionkey: config.key,
      },
      body: JSON.stringify({ session: config.session, phone, text: message }),
      signal: controller.signal,
    }).finally(() => clearTimeout(timeout))

    if (!res.ok) {
      const text = await res.text().catch(() => res.statusText)
      console.error("[whatsapp] Falha ao enviar:", res.status, text)
      return { success: false, error: text }
    }

    return { success: true }
  } catch (err: unknown) {
    if (err instanceof Error && err.name === "AbortError") {
      return { success: false, error: "Timeout ao conectar com UZAPI." }
    }
    console.error("[whatsapp] Erro:", err)
    return { success: false, error: "Erro interno." }
  }
}

/** Envia para múltiplos destinatários. Erros individuais não interrompem os demais. */
export async function broadcastWhatsApp(phones: string[], message: string): Promise<void> {
  await Promise.allSettled(phones.map((p) => sendWhatsApp(p, message)))
}
