"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import {
  LayoutDashboard, CarFront, Users, FileText, LogOut, Settings,
  Wrench, AlertTriangle, DollarSign, ClipboardCheck, Building2,
  BarChart3, CalendarClock, Tag, Menu, X,
} from "lucide-react"
import { signOutAction } from "@/app/actions/auth.actions"

type Props = {
  role: string
  userName: string
}

export default function AdminSidebar({ role, userName }: Props) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  // Close drawer on route change
  useEffect(() => { setOpen(false) }, [pathname])

  // Prevent body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [open])

  const navContent = (onClose?: () => void) => (
    <>
      <div className="mb-6 px-6">
        <Link href="/admin" className="block mb-1" onClick={onClose}>
          <Image src="/logo.png" alt="Morauto" width={130} height={44} className="object-contain" priority />
        </Link>
        <span className="text-xs text-zinc-500 font-bold tracking-widest uppercase">Admin Panel</span>
      </div>

      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
        <p className="text-zinc-600 text-xs font-bold uppercase tracking-widest px-3 py-2 mt-2">Visão Geral</p>
        <NavItem href="/admin" icon={<LayoutDashboard size={16} />} label="Dashboard" onClose={onClose} />
        <NavItem href="/admin/relatorios" icon={<BarChart3 size={16} />} label="Relatórios & BI" onClose={onClose} />

        <p className="text-zinc-600 text-xs font-bold uppercase tracking-widest px-3 py-2 mt-4">Operacional</p>
        <NavItem href="/admin/veiculos" icon={<CarFront size={16} />} label="Frota" onClose={onClose} />
        <NavItem href="/admin/reservas" icon={<CalendarClock size={16} />} label="Reservas" onClose={onClose} />
        <NavItem href="/admin/contratos" icon={<FileText size={16} />} label="Contratos" onClose={onClose} />
        <NavItem href="/admin/vistoria" icon={<ClipboardCheck size={16} />} label="Vistoria" onClose={onClose} />

        <p className="text-zinc-600 text-xs font-bold uppercase tracking-widest px-3 py-2 mt-4">Clientes & Finanças</p>
        <NavItem href="/admin/clientes" icon={<Users size={16} />} label="Clientes" onClose={onClose} />
        {(role === "ADMIN" || role === "MANAGER" || role === "FINANCIAL") && (
          <NavItem href="/admin/financeiro" icon={<DollarSign size={16} />} label="Financeiro" onClose={onClose} />
        )}

        <p className="text-zinc-600 text-xs font-bold uppercase tracking-widest px-3 py-2 mt-4">Vendas</p>
        <NavItem href="/admin/vendas" icon={<Tag size={16} />} label="Veículos à Venda" onClose={onClose} />
        <NavItem href="/admin/vendas/contratos" icon={<FileText size={16} />} label="Contratos de Venda" onClose={onClose} />

        <p className="text-zinc-600 text-xs font-bold uppercase tracking-widest px-3 py-2 mt-4">Frota & Infrações</p>
        <NavItem href="/admin/manutencao" icon={<Wrench size={16} />} label="Manutenção" onClose={onClose} />
        <NavItem href="/admin/multas" icon={<AlertTriangle size={16} />} label="Multas" onClose={onClose} />
        <NavItem href="/admin/categorias" icon={<Settings size={16} />} label="Categorias" onClose={onClose} />

        {(role === "ADMIN" || role === "MANAGER") && (
          <>
            <p className="text-zinc-600 text-xs font-bold uppercase tracking-widest px-3 py-2 mt-4">Empresa</p>
            <NavItem href="/admin/filiais" icon={<Building2 size={16} />} label="Filiais" onClose={onClose} />
            <NavItem href="/admin/config" icon={<Settings size={16} />} label="Configurações" onClose={onClose} />
          </>
        )}
      </nav>

      <div className="border-t border-white/5 px-3 pt-4 mt-4 space-y-0.5 flex-shrink-0">
        <form action={signOutAction}>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all">
            <LogOut size={16} />
            <span>Sair</span>
          </button>
        </form>
      </div>
    </>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 border-r border-white/5 bg-black/50 flex-col py-4 flex-shrink-0">
        {navContent()}
      </aside>

      {/* Mobile: hamburger button */}
      <button
        className="md:hidden fixed top-3.5 left-4 z-50 w-9 h-9 flex items-center justify-center text-zinc-400 hover:text-white bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 rounded-xl transition-colors"
        onClick={() => setOpen(true)}
        aria-label="Abrir menu"
      >
        <Menu size={20} />
      </button>

      {/* Mobile overlay */}
      {open && (
        <div
          className="md:hidden fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <div
        className={`md:hidden fixed top-0 left-0 h-full w-72 z-[70] bg-zinc-950 border-r border-zinc-800 shadow-2xl flex flex-col py-4 transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ paddingTop: `max(1rem, env(safe-area-inset-top))` }}
      >
        {/* Close button */}
        <button
          onClick={() => setOpen(false)}
          className="absolute top-3 right-3 w-9 h-9 flex items-center justify-center text-zinc-400 hover:text-white bg-zinc-900 rounded-xl border border-zinc-800 transition-colors"
        >
          <X size={18} />
        </button>

        {navContent(() => setOpen(false))}
      </div>
    </>
  )
}

function NavItem({
  href,
  icon,
  label,
  onClose,
}: {
  href: string
  icon: React.ReactNode
  label: string
  onClose?: () => void
}) {
  const pathname = usePathname()
  const active = pathname === href || (href !== "/admin" && pathname.startsWith(href + "/"))

  return (
    <Link
      href={href}
      onClick={onClose}
      className={`flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-xl transition-all group ${
        active
          ? "bg-[#d4a017]/10 text-[#d4a017]"
          : "text-zinc-400 hover:text-white hover:bg-white/5"
      }`}
    >
      <div className={`transition-colors flex-shrink-0 ${active ? "text-[#d4a017]" : "text-zinc-500 group-hover:text-[#d4a017]"}`}>
        {icon}
      </div>
      <span>{label}</span>
      {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#d4a017] flex-shrink-0" />}
    </Link>
  )
}
