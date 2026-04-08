import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const runtime = "nodejs"

function getStorageClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  // Service role key bypasses RLS — required for storage uploads.
  // Add SUPABASE_SERVICE_ROLE_KEY to .env (found in Supabase → Settings → API).
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  return createClient(url, key)
}

export async function POST(req: NextRequest) {
  try {
    const supabase = getStorageClient()
    const formData = await req.formData()
    const file = formData.get("file") as File

    if (!file) return NextResponse.json({ error: "Nenhum arquivo enviado." }, { status: 400 })

    const ext = file.name.split(".").pop()?.toLowerCase()
    if (!["jpg", "jpeg", "png", "webp", "pdf"].includes(ext ?? "")) {
      return NextResponse.json({ error: "Formato inválido. Use JPG, PNG, WebP ou PDF." }, { status: 400 })
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "Arquivo muito grande. Máximo 5MB." }, { status: 400 })
    }

    const fileName = `docs/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const buffer = Buffer.from(await file.arrayBuffer())

    const { error } = await supabase.storage
      .from("fotos")
      .upload(fileName, buffer, { contentType: file.type, upsert: false })

    if (error) {
      console.error("Supabase upload error:", error)
      return NextResponse.json({ error: "Erro ao enviar arquivo: " + error.message }, { status: 500 })
    }

    const { data: { publicUrl } } = supabase.storage.from("fotos").getPublicUrl(fileName)

    return NextResponse.json({ url: publicUrl })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Erro interno no upload." }, { status: 500 })
  }
}
