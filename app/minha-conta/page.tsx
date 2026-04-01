import { auth } from "@/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import Link from "next/link"
import { formatCurrency } from "@/lib/utils"
import {
  FileText, CalendarClock, User, Car,
  Phone, ChevronRight, Clock
} from "lucide-react"

export const metadata = { title: "Minha Conta — Morauto" }

const statusConfig: Record<string, { label: string; color: string }> = {
  PENDING:   { label: "Aguardando", color: "text-amber-400 bg-amber-400/10 border-amber-400/20" },
  CONFIRMED: { label: "Confirmada", color: "text-blue-400 bg-blue-400/10 border-blue-400/20" },
  ACTIVE:    { label: "Ativa",      color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" },
  COMPLETED: { label: "Concluída",  color: "text-purple-400 bg-purple-400/10 border-purple-400/20" },
  CANCELLED: { label: "Cancelada",  color: "text-red-400 bg-red-400/10 border-red-400/20" },
}

export default async function MinhaContaPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/minha-conta")
  }

  const customer = await db.customer.findUnique({
    where: { userId: session.user.id },
    include: {
      user: true,
      reservations: {
        include: { vehicle: { include: { category: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  })

  const firstName = (session.user.name ?? "Cliente").split(" ")[0]
  const initials = (session.user.name ?? "C")
    .split(" ")
    .map((n: string) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()

  const reservations = customer?.reservations ?? []
  const activeRental = reservations.find((r) => r.status === "ACTIVE")
  const totalSpent = reservations
    .filter((r) => r.status === "COMPLETED" || r.status === "ACTIVE")
    .reduce((acc, r) => acc + Number(r.totalValue), 0)
  const pendingCount = reservations.filter(
    (r) => r.status === "PENDING" || r.status === "CONFIRMED"
  ).length
  const completedCount = reservations.filter((r) => r.status === "COMPLETED").length
  const recentReservations = reservations.slice(0, 3)

  const daysUntilReturn = activeRental
    ? Math.ceil(
        (new Date(activeRental.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      )
    : null

  const memberSince = customer?.user?.createdAt
    ? new Date(customer.user.createdAt).toLocaleDateString("pt-BR", {
        month: "long",
        year: "numeric",
      })
    : null

  const quickLinks = [
    { icon: <FileText size={24} />, label: "Meus Contratos", href: "/minha-conta/contratos", desc: "Visualize seus contratos" },
    { icon: <CalendarClock size={24} />, label: "Minhas Reservas", href: "/minhas-reservas", desc: "Histórico de locações" },
    { icon: <User size={24} />, label: "Meu Perfil", href: "/minha-conta/perfil", desc: "Editar informações" },
    { icon: <Car size={24} />, label: "Explorar Frota", href: "/frota", desc: "Ver veículos disponíveis" },
  ]

  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl">
      {/* Welcome header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 rounded-full bg-[#d4a017] flex items-center justify-center text-black font-black text-xl flex-shrink-0">
          {initials}
        </div>
        <div>
          <h1 className="text-3xl font-black font-outfit text-white">
            Olá, {firstName}!
          </h1>
          {memberSince && (
            <p className="text-zinc-500 text-sm mt-0.5">Cliente desde {memberSince}</p>
          )}
        </div>
      </div>

      {/* Active rental banner */}
      {activeRental && (
        <div className="bg-emerald-950/50 border border-emerald-500/30 rounded-2xl p-6 mb-8">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-emerald-400 font-bold text-xs uppercase tracking-wider">Locação em Andamento</span>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-white font-bold text-xl font-outfit">
                {activeRental.vehicle.brand} {activeRental.vehicle.model}
              </p>
              <p className="text-zinc-400 text-sm mt-0.5">
                Devolução: {new Date(activeRental.endDate).toLocaleDateString("pt-BR", {
                  weekday: "short", day: "numeric", month: "long"
                })}
              </p>
            </div>
            {daysUntilReturn !== null && (
              <div className="flex items-center gap-2 bg-emerald-900/30 border border-emerald-500/20 px-4 py-2 rounded-xl">
                <Clock size={16} className="text-emerald-400" />
                <span className="text-emerald-400 font-bold text-sm">
                  {daysUntilReturn > 0 ? `${daysUntilReturn} dia(s) restante(s)` : "Hoje"}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-white">{reservations.length}</p>
          <p className="text-zinc-500 text-xs uppercase tracking-wider mt-1">Total</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-amber-400">{pendingCount}</p>
          <p className="text-zinc-500 text-xs uppercase tracking-wider mt-1">Pendentes</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-purple-400">{completedCount}</p>
          <p className="text-zinc-500 text-xs uppercase tracking-wider mt-1">Concluídas</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
          <p className="text-lg font-bold text-[#d4a017]">{formatCurrency(totalSpent)}</p>
          <p className="text-zinc-500 text-xs uppercase tracking-wider mt-1">Gasto Total</p>
        </div>
      </div>

      {/* Quick access grid */}
      <div className="mb-8">
        <h2 className="text-lg font-bold text-white mb-4">Acesso Rápido</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="bg-zinc-900 border border-zinc-800 hover:border-[#d4a017]/40 rounded-2xl p-5 flex flex-col items-center text-center gap-3 transition-all group"
            >
              <div className="w-12 h-12 rounded-xl bg-zinc-800 group-hover:bg-[#d4a017]/10 flex items-center justify-center text-[#d4a017] transition-colors">
                {item.icon}
              </div>
              <div>
                <p className="text-white font-semibold text-sm">{item.label}</p>
                <p className="text-zinc-500 text-xs mt-0.5">{item.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent reservations */}
      {recentReservations.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white">Reservas Recentes</h2>
            <Link href="/minhas-reservas" className="text-[#d4a017] hover:text-[#b8860b] text-sm font-semibold flex items-center gap-1 transition-colors">
              Ver todas <ChevronRight size={14} />
            </Link>
          </div>
          <div className="space-y-3">
            {recentReservations.map((r) => {
              const cfg = statusConfig[r.status] ?? { label: r.status, color: "text-zinc-400 bg-zinc-800 border-zinc-700" }
              return (
                <div key={r.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center flex-shrink-0">
                      <Car size={18} className="text-[#d4a017]" />
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm">
                        {r.vehicle.brand} {r.vehicle.model}
                      </p>
                      <p className="text-zinc-500 text-xs">
                        {new Date(r.startDate).toLocaleDateString("pt-BR")} –{" "}
                        {new Date(r.endDate).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold border flex-shrink-0 ${cfg.color}`}>
                    {cfg.label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* WhatsApp support button */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <p className="text-white font-bold">Precisa de ajuda?</p>
          <p className="text-zinc-400 text-sm mt-0.5">Nossa equipe está disponível pelo WhatsApp</p>
        </div>
        <a
          href="https://wa.me/5592992921946"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors flex-shrink-0"
        >
          <Phone size={16} /> Falar no WhatsApp
        </a>
      </div>
    </div>
  )
}
