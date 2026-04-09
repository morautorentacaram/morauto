import { z } from "zod"

const envSchema = z.object({
  // ── App ────────────────────────────────────────────────────────────────────
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),

  // ── Auth ───────────────────────────────────────────────────────────────────
  AUTH_SECRET: z.string().min(1),

  // ── Supabase ───────────────────────────────────────────────────────────────
  NEXT_PUBLIC_SUPABASE_URL:      z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY:     z.string().min(1).optional(),

  // ── Database ───────────────────────────────────────────────────────────────
  DATABASE_URL: z.string().min(1),
  DIRECT_URL:   z.string().min(1).optional(),

  // ── WhatsApp / UZAPI ───────────────────────────────────────────────────────
  WHATSAPP_UZAPI_URL:         z.string().url().optional(),
  WHATSAPP_UZAPI_SESSION:     z.string().min(1).optional(),
  WHATSAPP_UZAPI_SESSION_KEY: z.string().min(1).optional(),

  // ── Token interno para chamadas server-to-server ───────────────────────────
  INTERNAL_API_TOKEN: z.string().min(1).optional(),

  // ── DocuSeal ───────────────────────────────────────────────────────────────
  DOCUSEAL_API_KEY:        z.string().min(1).optional(),
  DOCUSEAL_WEBHOOK_SECRET: z.string().optional(),

  // ── Google OAuth ───────────────────────────────────────────────────────────
  GOOGLE_CLIENT_ID:     z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
})

/** Parsed + validated environment variables. Throws at startup if required vars are missing. */
export const env = envSchema.parse(process.env)
