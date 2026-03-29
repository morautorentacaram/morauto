import { auth } from "@/auth"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Role-based route permissions
const ROUTE_PERMISSIONS: Record<string, string[]> = {
  "/admin/financeiro":  ["ADMIN", "MANAGER", "FINANCIAL"],
  "/admin/filiais":     ["ADMIN", "MANAGER"],
  "/admin/relatorios":  ["ADMIN", "MANAGER", "FINANCIAL"],
  "/admin/clientes":    ["ADMIN", "MANAGER", "STAFF"],
  "/admin/contratos":   ["ADMIN", "MANAGER", "STAFF"],
  "/admin/reservas":    ["ADMIN", "MANAGER", "STAFF"],
  "/admin/veiculos":    ["ADMIN", "MANAGER", "STAFF"],
  "/admin/categorias":  ["ADMIN", "MANAGER"],
  "/admin/manutencao":  ["ADMIN", "MANAGER", "STAFF", "INSPECTOR"],
  "/admin/vistoria":    ["ADMIN", "MANAGER", "STAFF", "INSPECTOR"],
  "/admin/multas":      ["ADMIN", "MANAGER", "STAFF"],
  "/admin":             ["ADMIN", "MANAGER", "STAFF", "FINANCIAL", "INSPECTOR"],
}

export default auth((req: NextRequest & { auth: any }) => {
  const { pathname } = req.nextUrl
  const session = req.auth
  const role = session?.user?.role as string | undefined

  // Protect /admin/* routes
  if (pathname.startsWith("/admin")) {
    if (!session) {
      const loginUrl = new URL("/login", req.url)
      loginUrl.searchParams.set("callbackUrl", pathname)
      return NextResponse.redirect(loginUrl)
    }

    // Check specific route permissions (most specific first)
    const sortedRoutes = Object.keys(ROUTE_PERMISSIONS).sort((a, b) => b.length - a.length)
    for (const route of sortedRoutes) {
      if (pathname.startsWith(route)) {
        const allowed = ROUTE_PERMISSIONS[route]
        if (!role || !allowed.includes(role)) {
          return NextResponse.redirect(new URL("/admin", req.url))
        }
        break
      }
    }
  }

  // Protect /minhas-reservas — customers only
  if (pathname.startsWith("/minhas-reservas")) {
    if (!session) {
      const loginUrl = new URL("/login", req.url)
      loginUrl.searchParams.set("callbackUrl", pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/admin/:path*", "/minhas-reservas/:path*"],
}
