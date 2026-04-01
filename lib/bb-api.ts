/**
 * Banco do Brasil API Client
 * - PIX API v2 (OAuth2 + mTLS)
 * - Cobrança API v2 / Boleto (OAuth2 + gw-dev-app-key)
 */

import https from "node:https"
import type { RequestOptions } from "node:https"
import type { IncomingMessage } from "node:http"

// ── Environment ───────────────────────────────────────────────────────────────

type BBEnv = "sandbox" | "homolog" | "production"
const BB_ENV = (process.env.BB_ENV ?? "sandbox") as BBEnv

const PIX_HOST: Record<BBEnv, string> = {
  sandbox: "api-pix.hm.bb.com.br",
  homolog: "api-pix.hm.bb.com.br",
  production: "api-pix.bb.com.br",
}

const COBRANCA_HOST: Record<BBEnv, string> = {
  sandbox: "api.sandbox.bb.com.br",
  homolog: "api.hm.bb.com.br",
  production: "api.bb.com.br",
}

const OAUTH_HOST: Record<BBEnv, string> = {
  sandbox: "oauth.hm.bb.com.br",
  homolog: "oauth.hm.bb.com.br",
  production: "oauth.bb.com.br",
}

// ── Token cache (in-process) ──────────────────────────────────────────────────

type CachedToken = { token: string; expiresAt: number }
const tokenCache: Record<string, CachedToken> = {}

// ── mTLS agent (required by BB PIX API) ──────────────────────────────────────

function createPixAgent(): https.Agent | undefined {
  const certB64 = process.env.BB_PIX_CERT
  const keyB64 = process.env.BB_PIX_KEY_PEM
  if (!certB64 || !keyB64) return undefined
  return new https.Agent({
    cert: Buffer.from(certB64, "base64").toString("utf-8"),
    key: Buffer.from(keyB64, "base64").toString("utf-8"),
    rejectUnauthorized: BB_ENV === "production",
  })
}

// ── HTTPS helper ──────────────────────────────────────────────────────────────

type HttpResult<T> = { status: number; data: T }

function httpsRequest<T = unknown>(
  hostname: string,
  path: string,
  opts: {
    method?: string
    headers?: Record<string, string>
    body?: string
    agent?: https.Agent
  } = {}
): Promise<HttpResult<T>> {
  return new Promise((resolve, reject) => {
    const reqOpts: RequestOptions = {
      hostname,
      path,
      method: opts.method ?? "GET",
      headers: {
        "Content-Type": "application/json",
        ...opts.headers,
        ...(opts.body
          ? { "Content-Length": String(Buffer.byteLength(opts.body)) }
          : {}),
      },
      agent: opts.agent,
    }

    const req = https.request(reqOpts, (res: IncomingMessage) => {
      let raw = ""
      res.on("data", (chunk) => (raw += chunk))
      res.on("end", () => {
        try {
          const data: T = raw ? JSON.parse(raw) : ({} as T)
          resolve({ status: res.statusCode ?? 0, data })
        } catch {
          resolve({ status: res.statusCode ?? 0, data: raw as unknown as T })
        }
      })
    })

    req.on("error", reject)
    if (opts.body) req.write(opts.body)
    req.end()
  })
}

// ── OAuth2 token ──────────────────────────────────────────────────────────────

type TokenResponse = {
  access_token: string
  expires_in: number
  token_type: string
}

const PIX_SCOPE =
  "cob.write cob.read cobv.write cobv.read pix.write pix.read webhook.read webhook.write"
const BOLETO_SCOPE =
  "cobrancas.boletos-requisicao cobrancas.boletos-info"

export async function getBBToken(api: "pix" | "boleto"): Promise<string> {
  const now = Date.now()
  const cached = tokenCache[api]
  if (cached && cached.expiresAt > now + 60_000) return cached.token

  const clientId = process.env.BB_CLIENT_ID
  const clientSecret = process.env.BB_CLIENT_SECRET
  if (!clientId || !clientSecret) {
    throw new Error("BB_CLIENT_ID and BB_CLIENT_SECRET must be set")
  }

  const scope = api === "pix" ? PIX_SCOPE : BOLETO_SCOPE
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64")
  const body = `grant_type=client_credentials&scope=${encodeURIComponent(scope)}`
  const agent = api === "pix" ? createPixAgent() : undefined

  const result = await httpsRequest<TokenResponse>(
    OAUTH_HOST[BB_ENV],
    "/oauth/token",
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded",
        "Content-Length": String(Buffer.byteLength(body)),
      },
      body,
      agent,
    }
  )

  if (result.status !== 200 || !result.data.access_token) {
    throw new Error(
      `BB OAuth2 [${api}] failed (${result.status}): ${JSON.stringify(result.data)}`
    )
  }

  tokenCache[api] = {
    token: result.data.access_token,
    expiresAt: now + result.data.expires_in * 1000,
  }

  return result.data.access_token
}

// ── PIX types ─────────────────────────────────────────────────────────────────

export interface PixChargeInput {
  calendario: { expiracao: number }
  devedor?: {
    cpf?: string
    cnpj?: string
    nome: string
  }
  valor: { original: string }
  chave: string
  solicitacaoPagador?: string
  infoAdicionais?: Array<{ nome: string; valor: string }>
}

export interface PixChargeResponse {
  txid: string
  revisao: number
  loc: { id: number; location: string; tipoCob: string; criacao: string }
  location: string
  status: "ATIVA" | "CONCLUIDA" | "REMOVIDA_PELO_USUARIO_RECEBEDOR" | "REMOVIDA_PELO_PSP"
  calendario: { expiracao: number; criacao: string }
  devedor?: { cpf?: string; cnpj?: string; nome: string }
  valor: { original: string }
  chave: string
  solicitacaoPagador?: string
  pixCopiaECola?: string
}

// ── PIX API ───────────────────────────────────────────────────────────────────

export async function createPixCharge(
  txid: string,
  input: PixChargeInput
): Promise<PixChargeResponse> {
  const token = await getBBToken("pix")
  const agent = createPixAgent()

  const result = await httpsRequest<PixChargeResponse>(
    PIX_HOST[BB_ENV],
    `/pix/v2/cob/${txid}`,
    {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(input),
      agent,
    }
  )

  if (result.status !== 200 && result.status !== 201) {
    throw new Error(
      `BB createPixCharge failed (${result.status}): ${JSON.stringify(result.data)}`
    )
  }

  return result.data
}

export async function getPixCharge(txid: string): Promise<PixChargeResponse> {
  const token = await getBBToken("pix")
  const agent = createPixAgent()

  const result = await httpsRequest<PixChargeResponse>(
    PIX_HOST[BB_ENV],
    `/pix/v2/cob/${txid}`,
    { headers: { Authorization: `Bearer ${token}` }, agent }
  )

  if (result.status !== 200) {
    throw new Error(
      `BB getPixCharge failed (${result.status}): ${JSON.stringify(result.data)}`
    )
  }

  return result.data
}

export async function cancelPixCharge(txid: string): Promise<void> {
  const token = await getBBToken("pix")
  const agent = createPixAgent()

  await httpsRequest(
    PIX_HOST[BB_ENV],
    `/pix/v2/cob/${txid}`,
    {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status: "REMOVIDA_PELO_USUARIO_RECEBEDOR" }),
      agent,
    }
  )
}

// ── Boleto types ──────────────────────────────────────────────────────────────

export interface BoletoDevedor {
  tipoInscricao: 1 | 2  // 1 = CPF, 2 = CNPJ
  numeroInscricao: string
  nome: string
  endereco: string
  cep: string
  cidade: string
  bairro: string
  uf: string
  telefone?: string
}

export interface BoletoInput {
  numeroConvenio: number
  numeroCarteira: number
  numeroVariacaoCarteira: number
  codigoModalidade: number         // 1 = simples
  dataEmissao: string              // YYYY-MM-DD
  dataVencimento: string           // YYYY-MM-DD
  valorOriginal: number
  codigoAceite?: string            // 'A' = aceite, 'N' = não aceite
  codigoTipoTitulo?: number        // 2 = DM, 4 = DS, 19 = NP, etc.
  descricaoTipoTitulo?: string
  indicadorPermissaoRecebimentoParcial?: string  // 'S' | 'N'
  numeroTituloCliente?: string     // nosso número prefix
  campoUtilizacaoBeneficiario?: string
  mensagemBloquetoOcorrencia?: string
  canalSolicitacao?: number        // 6 = internet
  indicadorPix?: string            // 'S' to also generate PIX QR code
  indicadorAceiteTituloVencido?: string  // 'S' | 'N'
  numeroDiasLimiteRecebimento?: number
  quantidadeDiasProtesto?: number
  quantidadeDiasNegativacao?: number
  orgaoNegativador?: number
  pagador: BoletoDevedor
  beneficiarioFinal?: Partial<BoletoDevedor>
  jurosMora?: { tipo: number; porcentagem?: number; valor?: number }
  desconto?: {
    tipo: number
    porcentagem?: number
    valor?: number
    dataExpiracao?: string
  }
  multa?: { tipo: number; porcentagem?: number; valor?: number }
}

export interface BoletoResponse {
  numero: string               // nosso número (use for lookups)
  numeroCarteirinha: string
  numeroDocumento: string
  dataVencimento: string
  valorOriginal: number
  codigoBarraNumerico: string
  linhaDigitavel: string
  numeroContratoCobranca: number
  qrCode?: {
    url: string
    txId: string
    emv: string              // PIX copia-e-cola payload
  }
}

// ── Cobrança (Boleto) API ─────────────────────────────────────────────────────

function cobrancaHeaders(token: string): Record<string, string> {
  const appKey = process.env.BB_APP_KEY
  if (!appKey) throw new Error("BB_APP_KEY must be set")
  return {
    Authorization: `Bearer ${token}`,
    "gw-dev-app-key": appKey,
  }
}

export async function createBoleto(input: BoletoInput): Promise<BoletoResponse> {
  const token = await getBBToken("boleto")

  const result = await httpsRequest<BoletoResponse>(
    COBRANCA_HOST[BB_ENV],
    "/cobrancas/v2/boletos",
    {
      method: "POST",
      headers: cobrancaHeaders(token),
      body: JSON.stringify(input),
    }
  )

  if (result.status !== 200 && result.status !== 201) {
    throw new Error(
      `BB createBoleto failed (${result.status}): ${JSON.stringify(result.data)}`
    )
  }

  return result.data
}

export async function getBoleto(nossoNumero: string): Promise<BoletoResponse> {
  const token = await getBBToken("boleto")
  const convenio = process.env.BB_CONVENIO
  if (!convenio) throw new Error("BB_CONVENIO must be set")

  const result = await httpsRequest<BoletoResponse>(
    COBRANCA_HOST[BB_ENV],
    `/cobrancas/v2/boletos/${nossoNumero}?numeroConvenio=${convenio}`,
    { headers: cobrancaHeaders(token) }
  )

  if (result.status !== 200) {
    throw new Error(
      `BB getBoleto failed (${result.status}): ${JSON.stringify(result.data)}`
    )
  }

  return result.data
}

export async function cancelBoleto(nossoNumero: string): Promise<void> {
  const token = await getBBToken("boleto")
  const convenio = process.env.BB_CONVENIO
  if (!convenio) throw new Error("BB_CONVENIO must be set")

  await httpsRequest(
    COBRANCA_HOST[BB_ENV],
    `/cobrancas/v2/boletos/${nossoNumero}/baixar`,
    {
      method: "POST",
      headers: cobrancaHeaders(token),
      body: JSON.stringify({ numeroConvenio: Number(convenio) }),
    }
  )
}

// ── Utility helpers ───────────────────────────────────────────────────────────

/** Generate a valid PIX txid (alphanumeric, 35 chars) */
export function generateTxid(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  return Array.from({ length: 35 }, () =>
    chars.charAt(Math.floor(Math.random() * chars.length))
  ).join("")
}

/** Format a numeric value for PIX API (e.g. 1234.5 → "1234.50") */
export function formatPixAmount(value: number): string {
  return value.toFixed(2)
}

/** Format a Date to YYYY-MM-DD */
export function formatDate(date: Date): string {
  return date.toISOString().split("T")[0]
}
