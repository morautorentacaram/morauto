import { createClient } from "@supabase/supabase-js"

// Lazy singleton — only created on first use, not at module evaluation.
// Prevents "supabaseUrl is required" during Vercel build phase.
let _supabase: ReturnType<typeof createClient> | null = null

function getSupabase() {
  if (!_supabase) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!url || !key) throw new Error("Missing Supabase env vars")
    _supabase = createClient(url, key)
  }
  return _supabase
}

export const supabase = new Proxy({} as ReturnType<typeof createClient>, {
  get(_t, prop) {
    return (getSupabase() as any)[prop]
  },
})
