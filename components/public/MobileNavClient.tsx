"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Car, CalendarClock, UserCircle2, User, Plus } from "lucide-react"

interface Props {
  isLoggedIn: boolean
  pendingCount?: number
}

export default function MobileNavClient({ isLoggedIn, pendingCount = 0 }: Props) {
  const pathname = usePathname()
  if (pathname.startsWith("/admin")) return null

  const active = (href: string) => pathname === href || pathname.startsWith(href + "/")
  const accountHref = isLoggedIn ? "/minha-conta" : "/login"

  const tabClass = (href: string) =>
    `relative flex flex-col items-center justify-center gap-0.5 flex-1 h-full pt-1 transition-all ${
      active(href) ? "text-[#d4a017]" : "text-zinc-500 active:text-zinc-300"
    }`

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 z-50 w-full bg-zinc-950/97 backdrop-blur-md border-t border-zinc-800/80 shadow-[0_-4px_30px_rgba(0,0,0,0.6)]"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex items-stretch h-16">

        {/* Início */}
        <Link href="/" className={tabClass("/")}>
          {active("/") && <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-[#d4a017] rounded-full" />}
          <Home size={22} strokeWidth={active("/") ? 2.5 : 1.8} />
          <span className="text-[10px] font-semibold tracking-wide">Início</span>
        </Link>

        {/* Frota */}
        <Link href="/frota" className={tabClass("/frota")}>
          {active("/frota") && <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-[#d4a017] rounded-full" />}
          <Car size={22} strokeWidth={active("/frota") ? 2.5 : 1.8} />
          <span className="text-[10px] font-semibold tracking-wide">Frota</span>
        </Link>

        {/* FAB central — Reservar */}
        <div className="flex-1 flex flex-col items-center justify-end pb-2 relative">
          <Link
            href="/frota"
            className="w-14 h-14 rounded-full bg-[#d4a017] active:bg-[#b8860b] flex items-center justify-center shadow-lg shadow-[#d4a017]/40 transition-all active:scale-90 absolute -top-5"
          >
            <Plus size={28} className="text-black" strokeWidth={3} />
          </Link>
          <span className="text-[10px] font-bold text-[#d4a017] mt-1">Reservar</span>
        </div>

        {/* Reservas — com badge de pagamentos pendentes */}
        <Link href="/minhas-reservas" className={tabClass("/minhas-reservas")}>
          {active("/minhas-reservas") && <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-[#d4a017] rounded-full" />}
          <div className="relative">
            <CalendarClock size={22} strokeWidth={active("/minhas-reservas") ? 2.5 : 1.8} />
            {pendingCount > 0 && (
              <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center px-0.5 leading-none">
                {pendingCount > 9 ? "9+" : pendingCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-semibold tracking-wide">Reservas</span>
        </Link>

        {/* Conta / Entrar */}
        <Link href={accountHref} className={tabClass(accountHref)}>
          {active(accountHref) && <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-[#d4a017] rounded-full" />}
          {isLoggedIn ? (
            <UserCircle2 size={22} strokeWidth={active(accountHref) ? 2.5 : 1.8} />
          ) : (
            <User size={22} strokeWidth={active(accountHref) ? 2.5 : 1.8} />
          )}
          <span className="text-[10px] font-semibold tracking-wide">{isLoggedIn ? "Conta" : "Entrar"}</span>
        </Link>

      </div>
    </nav>
  )
}
