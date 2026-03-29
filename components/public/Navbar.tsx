"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Car, Menu, X, User, LogOut, LayoutDashboard } from "lucide-react"
import { useState } from "react"

type Session = {
  user: { name?: string | null; role?: string | null }
} | null

export default function Navbar({ session }: { session: Session }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const isAdmin = session?.user?.role && session.user.role !== "CUSTOMER"

  return (
    <header className="h-20 border-b border-white/5 bg-black/90 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-6 h-full flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <h1 className="text-2xl font-black text-white font-outfit uppercase tracking-tighter">
            Morauto<span className="text-[#d4a017]">.</span>
          </h1>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          <NavLink href="/frota" current={pathname} label="Frota" />
          <NavLink href="/como-funciona" current={pathname} label="Como Funciona" />
          <NavLink href="/faq" current={pathname} label="FAQ" />
        </nav>

        {/* Auth */}
        <div className="hidden md:flex items-center gap-4">
          {session ? (
            <div className="flex items-center gap-3">
              {isAdmin && (
                <Link href="/admin" className="flex items-center gap-2 text-xs text-zinc-400 hover:text-white border border-zinc-800 hover:border-zinc-600 px-3 py-1.5 rounded-lg transition-all">
                  <LayoutDashboard size={14} /> Admin
                </Link>
              )}
              <Link href="/minhas-reservas" className="flex items-center gap-2 text-sm text-zinc-300 hover:text-white transition-colors">
                <div className="w-8 h-8 rounded-full bg-[#d4a017] flex items-center justify-center text-black font-bold text-xs">
                  {session.user.name?.charAt(0).toUpperCase() ?? "U"}
                </div>
                <span className="hidden lg:block max-w-24 truncate">{session.user.name}</span>
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/login" className="text-zinc-400 hover:text-white text-sm font-medium transition-colors">
                Entrar
              </Link>
              <Link href="/frota" className="bg-[#d4a017] hover:bg-[#b8860b] text-black font-bold px-5 py-2 rounded-xl text-sm transition-colors">
                Reservar
              </Link>
            </div>
          )}
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden text-zinc-400 hover:text-white" onClick={() => setOpen(!open)}>
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-zinc-950 border-b border-white/5 px-6 py-6 space-y-4">
          <Link href="/frota" className="block text-zinc-300 hover:text-white py-2" onClick={() => setOpen(false)}>Frota</Link>
          <Link href="/como-funciona" className="block text-zinc-300 hover:text-white py-2" onClick={() => setOpen(false)}>Como Funciona</Link>
          <Link href="/faq" className="block text-zinc-300 hover:text-white py-2" onClick={() => setOpen(false)}>FAQ</Link>
          {session ? (
            <Link href="/minhas-reservas" className="block text-[#d4a017] font-bold py-2" onClick={() => setOpen(false)}>Minhas Reservas</Link>
          ) : (
            <Link href="/login" className="block text-[#d4a017] font-bold py-2" onClick={() => setOpen(false)}>Entrar / Cadastrar</Link>
          )}
        </div>
      )}
    </header>
  )
}

function NavLink({ href, current, label }: { href: string; current: string; label: string }) {
  const active = current === href || current.startsWith(href + "/")
  return (
    <Link
      href={href}
      className={`transition-colors ${active ? "text-white" : "text-zinc-400 hover:text-white"}`}
    >
      {label}
      {active && <div className="h-0.5 bg-[#d4a017] mt-0.5 rounded-full" />}
    </Link>
  )
}
