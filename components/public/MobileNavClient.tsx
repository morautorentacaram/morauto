"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Car, CalendarClock, UserCircle2, User, Plus, ShoppingBag } from "lucide-react"

export default function MobileNavClient({ isLoggedIn }: { isLoggedIn: boolean }) {
  const pathname = usePathname()
  if (pathname.startsWith("/admin")) return null

  const active = (href: string) => pathname === href || pathname.startsWith(href + "/")

  const tab = (href: string) =>
    `relative flex flex-col items-center justify-center gap-0.5 flex-1 h-full pt-1 transition-all ${
      active(href) ? "text-[#d4a017]" : "text-zinc-500 hover:text-zinc-300"
    }`

  const accountHref = isLoggedIn ? "/minha-conta" : "/login"

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 z-50 w-full bg-zinc-950/95 backdrop-blur-md border-t border-zinc-800/80 shadow-[0_-4px_30px_rgba(0,0,0,0.5)]"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex items-stretch h-16">
        {/* Início */}
        <Link href="/" className={tab("/")}>
          {active("/") && <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-[#d4a017] rounded-full" />}
          <Home size={21} strokeWidth={active("/") ? 2.5 : 1.8} />
          <span className="text-[10px] font-semibold tracking-wide">Início</span>
        </Link>

        {/* Frota */}
        <Link href="/frota" className={tab("/frota")}>
          {active("/frota") && <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-[#d4a017] rounded-full" />}
          <Car size={21} strokeWidth={active("/frota") ? 2.5 : 1.8} />
          <span className="text-[10px] font-semibold tracking-wide">Frota</span>
        </Link>

        {/* FAB central — Reservar */}
        <div className="flex-1 flex flex-col items-center justify-end pb-2 relative">
          <Link
            href="/frota"
            className="w-14 h-14 rounded-full bg-[#d4a017] hover:bg-[#b8860b] active:scale-95 flex items-center justify-center shadow-lg shadow-[#d4a017]/40 transition-all absolute -top-5"
          >
            <Plus size={28} className="text-black" strokeWidth={3} />
          </Link>
          <span className="text-[10px] font-bold text-[#d4a017] mt-1">Reservar</span>
        </div>

        {/* Reservas */}
        <Link href="/minhas-reservas" className={tab("/minhas-reservas")}>
          {active("/minhas-reservas") && <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-[#d4a017] rounded-full" />}
          <CalendarClock size={21} strokeWidth={active("/minhas-reservas") ? 2.5 : 1.8} />
          <span className="text-[10px] font-semibold tracking-wide">Reservas</span>
        </Link>

        {/* Conta / Entrar */}
        <Link href={accountHref} className={tab(accountHref)}>
          {active(accountHref) && <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-[#d4a017] rounded-full" />}
          {isLoggedIn ? (
            <UserCircle2 size={21} strokeWidth={active(accountHref) ? 2.5 : 1.8} />
          ) : (
            <User size={21} strokeWidth={active(accountHref) ? 2.5 : 1.8} />
          )}
          <span className="text-[10px] font-semibold tracking-wide">{isLoggedIn ? "Conta" : "Entrar"}</span>
        </Link>
      </div>
    </nav>
  )
}
