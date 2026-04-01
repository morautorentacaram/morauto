export const dynamic = "force-dynamic"

import { auth, signOut } from "@/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import {
  LayoutDashboard, CarFront, Users, FileText, LogOut, Settings,
  Wrench, AlertTriangle, DollarSign, ClipboardCheck, Building2,
  BarChart3, CalendarClock, Tag
} from "lucide-react"

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

  return (
    <div className="flex bg-zinc-950 min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/5 bg-black/50 flex flex-col py-4 overflow-y-auto">
        <div className="mb-6 px-6">
          <Link href="/admin">
            <h1 className="text-2xl font-black text-white font-outfit uppercase tracking-tighter">
              Morauto<span className="text-[#d4a017]">.</span>
            </h1>
          </Link>
          <span className="text-xs text-zinc-500 font-bold tracking-widest uppercase">Admin Panel</span>
        </div>

        <nav className="flex-1 px-3 space-y-0.5">
          <p className="text-zinc-600 text-xs font-bold uppercase tracking-widest px-3 py-2 mt-2">Visão Geral</p>
          <NavItem href="/admin" icon={<LayoutDashboard size={16} />} label="Dashboard" />
          <NavItem href="/admin/relatorios" icon={<BarChart3 size={16} />} label="Relatórios & BI" />

          <p className="text-zinc-600 text-xs font-bold uppercase tracking-widest px-3 py-2 mt-4">Operacional</p>
          <NavItem href="/admin/veiculos" icon={<CarFront size={16} />} label="Frota" />
          <NavItem href="/admin/reservas" icon={<CalendarClock size={16} />} label="Reservas" />
          <NavItem href="/admin/contratos" icon={<FileText size={16} />} label="Contratos" />
          <NavItem href="/admin/vistoria" icon={<ClipboardCheck size={16} />} label="Vistoria" />

          <p className="text-zinc-600 text-xs font-bold uppercase tracking-widest px-3 py-2 mt-4">Clientes & Finanças</p>
          <NavItem href="/admin/clientes" icon={<Users size={16} />} label="Clientes" />
          {(role === "ADMIN" || role === "MANAGER" || role === "FINANCIAL") && (
            <NavItem href="/admin/financeiro" icon={<DollarSign size={16} />} label="Financeiro" />
          )}

          <p className="text-zinc-600 text-xs font-bold uppercase tracking-widest px-3 py-2 mt-4">Vendas</p>
          <NavItem href="/admin/vendas" icon={<Tag size={16} />} label="Veículos à Venda" />
          <NavItem href="/admin/vendas/contratos" icon={<FileText size={16} />} label="Contratos de Venda" />

          <p className="text-zinc-600 text-xs font-bold uppercase tracking-widest px-3 py-2 mt-4">Frota & Infrações</p>
          <NavItem href="/admin/manutencao" icon={<Wrench size={16} />} label="Manutenção" />
          <NavItem href="/admin/multas" icon={<AlertTriangle size={16} />} label="Multas" />
          <NavItem href="/admin/categorias" icon={<Settings size={16} />} label="Categorias" />

          {(role === "ADMIN" || role === "MANAGER") && (
            <>
              <p className="text-zinc-600 text-xs font-bold uppercase tracking-widest px-3 py-2 mt-4">Empresa</p>
              <NavItem href="/admin/filiais" icon={<Building2 size={16} />} label="Filiais" />
              <NavItem href="/admin/config" icon={<Settings size={16} />} label="Configurações" />
            </>
          )}
        </nav>

        <div className="border-t border-white/5 px-3 pt-4 mt-4 space-y-0.5">
          <form action={async () => {
            "use server"
            await signOut({ redirectTo: "/login" })
          }}>
            <button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all">
              <LogOut size={16} />
              <span>Sair</span>
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen overflow-auto">
        <header className="h-16 border-b border-white/5 bg-black/30 flex items-center justify-between px-8 backdrop-blur-md sticky top-0 z-10">
          <h2 className="text-zinc-400 text-sm font-medium">
            Bem-vindo(a), <span className="text-white">{session.user.name}</span>
            <span className="ml-2 text-xs text-zinc-600 border border-zinc-800 rounded px-1.5 py-0.5">{role}</span>
          </h2>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-zinc-500 hover:text-white text-xs transition-colors">Ver Site →</Link>
            <div className="w-8 h-8 rounded-full bg-[#d4a017] flex items-center justify-center text-black font-bold text-sm">
              {session.user.name?.charAt(0).toUpperCase()}
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

function NavItem({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-zinc-400 hover:text-white hover:bg-white/5 rounded-xl transition-all group"
    >
      <div className="text-zinc-500 group-hover:text-[#d4a017] transition-colors flex-shrink-0">{icon}</div>
      <span>{label}</span>
    </Link>
  )
}
