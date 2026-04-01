import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const { db } = await import("@/lib/db")
    const user = await db.user.findUnique({
      where: { email: "admin@morauto.com.br" },
      select: { id: true, email: true, role: true, password: true },
    })
    if (!user) return NextResponse.json({ ok: false, error: "user not found" })
    return NextResponse.json({
      ok: true,
      id: user.id,
      email: user.email,
      role: user.role,
      hasPassword: !!user.password,
      passwordPrefix: user.password?.slice(0, 7),
    })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message ?? String(err) }, { status: 500 })
  }
}
