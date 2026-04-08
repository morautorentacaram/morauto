export const dynamic = "force-dynamic"

import { auth } from "@/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import AdminSidebar from "@/components/admin/AdminSidebar"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session || !["ADMIN", "MANAGER", "STAFF", "FINANCIAL", "INSPECTOR"].includes(session.user?.role as string)) {
    redirect("/login")
  }

  const role = session.user?.role as string
  const userName = session.user?.name ?? "Admin"

  return (
    <div className="flex bg-zinc-950 min-h-screen">
      <AdminSidebar role={role} userName={userName} />

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen overflow-auto">
        <header className="h-16 border-b border-white/5 bg-black/30 flex items-center justify-between px-4 md:px-8 backdrop-blur-md sticky top-0 z-10">
          {/* Spacer for mobile hamburger */}
          <h2 className="text-zinc-400 text-sm font-medium pl-10 md:pl-0">
            Bem-vindo(a), <span className="text-white">{userName}</span>
            <span className="ml-2 text-xs text-zinc-600 border border-zinc-800 rounded px-1.5 py-0.5 hidden sm:inline">{role}</span>
          </h2>
          <div className="flex items-center gap-3">
            <Link href="/" className="text-zinc-500 hover:text-white text-xs transition-colors hidden sm:block">Ver Site →</Link>
            <div className="w-8 h-8 rounded-full bg-[#d4a017] flex items-center justify-center text-black font-bold text-sm flex-shrink-0">
              {userName.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
