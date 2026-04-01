"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X, LayoutDashboard, Car, HelpCircle, Info, ShoppingBag, CalendarClock, UserCircle2, ChevronRight } from "lucide-react"
import { useState, useEffect } from "react"

type Session = {
  user: { name?: string | null; role?: string | null }
} | null

export default function Navbar({ session }: { session: Session }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const isAdmin = session?.user?.role && session.user.role !== "CUSTOMER"

  // Close drawer on route change
  useEffect(() => { setOpen(false) }, [pathname])

  // Prevent body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [open])

  return (
    <>
      <header className="h-16 md:h-20 border-b border-white/5 bg-black/90 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 md:px-6 h-full flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-white font-outfit uppercase tracking-tighter">
              Morauto<span className="text-[#d4a017]">.</span>
            </h1>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <NavLink href="/frota" current={pathname} label="Frota" />
            <NavLink href="/comprar" current={pathname} label="Comprar" />
            <NavLink href="/como-funciona" current={pathname} label="Como Funciona" />
            <NavLink href="/faq" current={pathname} label="FAQ" />
          </nav>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center gap-4">
            {session ? (
              <div className="flex items-center gap-3">
                {isAdmin && (
                  <Link href="/admin" className="flex items-center gap-2 text-xs text-zinc-400 hover:text-white border border-zinc-800 hover:border-zinc-600 px-3 py-1.5 rounded-lg transition-all">
                    <LayoutDashboard size={14} /> Admin
                  </Link>
                )}
                <Link href="/minha-conta" className="flex items-center gap-2 text-sm text-zinc-300 hover:text-white transition-colors">
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

          {/* Mobile: avatar or hamburger */}
          <div className="md:hidden flex items-center gap-3">
            {session && (
              <Link href="/minha-conta" className="w-8 h-8 rounded-full bg-[#d4a017] flex items-center justify-center text-black font-bold text-xs">
                {session.user.name?.charAt(0).toUpperCase() ?? "U"}
              </Link>
            )}
            <button
              className="w-10 h-10 flex items-center justify-center text-zinc-400 hover:text-white active:text-white rounded-xl hover:bg-white/5 transition-all"
              onClick={() => setOpen(true)}
              aria-label="Abrir menu"
            >
              <Menu size={22} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Overlay */}
      {open && (
        <div
          className="md:hidden fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <div
        className={`md:hidden fixed top-0 right-0 h-full w-[80vw] max-w-xs z-[70] bg-zinc-950 border-l border-zinc-800/80 shadow-2xl flex flex-col transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800/60">
          <span className="text-white font-black font-outfit text-xl uppercase tracking-tighter">
            Morauto<span className="text-[#d4a017]">.</span>
          </span>
          <button
            onClick={() => setOpen(false)}
            className="w-9 h-9 rounded-xl bg-zinc-900 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* User info */}
        {session && (
          <Link href="/minha-conta" className="flex items-center gap-3 px-5 py-4 bg-zinc-900/50 border-b border-zinc-800/40 hover:bg-zinc-900 transition-colors" onClick={() => setOpen(false)}>
            <div className="w-10 h-10 rounded-full bg-[#d4a017] flex items-center justify-center text-black font-bold text-sm flex-shrink-0">
              {session.user.name?.charAt(0).toUpperCase() ?? "U"}
            </div>
            <div className="min-w-0">
              <p className="text-white font-semibold text-sm truncate">{session.user.name}</p>
              <p className="text-zinc-500 text-xs">Ver minha conta</p>
            </div>
            <ChevronRight size={14} className="text-zinc-600 ml-auto flex-shrink-0" />
          </Link>
        )}

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto py-3">
          <DrawerLink href="/frota" icon={<Car size={18} />} label="Frota" pathname={pathname} />
          <DrawerLink href="/comprar" icon={<ShoppingBag size={18} />} label="Comprar Veículo" pathname={pathname} />
          <DrawerLink href="/como-funciona" icon={<Info size={18} />} label="Como Funciona" pathname={pathname} />
          <DrawerLink href="/faq" icon={<HelpCircle size={18} />} label="FAQ" pathname={pathname} />

          {session && (
            <>
              <div className="mx-5 my-3 border-t border-zinc-800/60" />
              <DrawerLink href="/minhas-reservas" icon={<CalendarClock size={18} />} label="Minhas Reservas" pathname={pathname} />
              <DrawerLink href="/minha-conta" icon={<UserCircle2 size={18} />} label="Minha Conta" pathname={pathname} />
            </>
          )}

          {isAdmin && (
            <>
              <div className="mx-5 my-3 border-t border-zinc-800/60" />
              <DrawerLink href="/admin" icon={<LayoutDashboard size={18} />} label="Painel Admin" pathname={pathname} />
            </>
          )}
        </nav>

        {/* Bottom CTA */}
        {!session && (
          <div className="p-5 border-t border-zinc-800/60 space-y-3">
            <Link
              href="/frota"
              className="block w-full bg-[#d4a017] hover:bg-[#b8860b] text-black font-bold px-4 py-3 rounded-xl text-sm text-center transition-colors"
              onClick={() => setOpen(false)}
            >
              Reservar Agora
            </Link>
            <Link
              href="/login"
              className="block w-full bg-zinc-900 hover:bg-zinc-800 text-white font-semibold px-4 py-3 rounded-xl text-sm text-center transition-colors border border-zinc-800"
              onClick={() => setOpen(false)}
            >
              Entrar / Cadastrar
            </Link>
          </div>
        )}
      </div>
    </>
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

function DrawerLink({ href, icon, label, pathname }: { href: string; icon: React.ReactNode; label: string; pathname: string }) {
  const active = pathname === href || pathname.startsWith(href + "/")
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-5 py-3.5 mx-2 rounded-xl transition-all ${
        active
          ? "bg-[#d4a017]/10 text-[#d4a017]"
          : "text-zinc-300 hover:bg-zinc-900 hover:text-white"
      }`}
    >
      <span className={active ? "text-[#d4a017]" : "text-zinc-500"}>{icon}</span>
      <span className="text-sm font-medium">{label}</span>
      {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#d4a017]" />}
    </Link>
  )
}
