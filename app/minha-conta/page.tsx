import { auth } from "@/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import Link from "next/link"
import { formatCurrency } from "@/lib/utils"
import {
  FileText, CalendarClock, User, Car,
  Phone, ChevronRight, Clock, AlertCircle,
  QrCode, Barcode, Shield, Star
} from "lucide-react"
import CopyButton from "@/components/public/CopyButton"

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
  if (!session?.user?.id) redirect("/login?callbackUrl=/minha-conta")

  const customer = await db.customer.findUnique({
    where: { userId: session.user.id },
    include: {
      user: true,
      reservations: {
        include: {
          vehicle: { include: { category: true } },
          payments: { orderBy: { createdAt: "desc" }, take: 1 },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  })

  const firstName = (session.user.name ?? "Cliente").split(" ")[0]
  const initials = (session.user.name ?? "C")
    .split(" ").map((n: string) => n[0]).slice(0, 2).join("").toUpperCase()

  const reservations = customer?.reservations ?? []
  const activeRental = reservations.find((r) => r.status === "ACTIVE")
  const pendingPayments = reservations.flatMap((r) =>
    r.payments.filter((p) => p.status === "PENDING")
  )
  const totalSpent = reservations
    .filter((r) => r.status === "COMPLETED" || r.status === "ACTIVE")
    .reduce((acc, r) => acc + Number(r.totalValue), 0)
  const completedCount = reservations.filter((r) => r.status === "COMPLETED").length
  const recentReservations = reservations.slice(0, 4)

  const daysUntilReturn = activeRental
    ? Math.ceil((new Date(activeRental.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null

  const memberSince = customer?.user?.createdAt
    ? new Date(customer.user.createdAt).toLocaleDateString("pt-BR", { month: "short", year: "numeric" })
    : null

  return (
    <div className="container mx-auto px-4 py-6 md:py-10 max-w-4xl">

      {/* ── Profile header ─────────────────────────────────────────── */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-[#d4a017] flex items-center justify-center text-black font-black text-lg flex-shrink-0 shadow-lg shadow-[#d4a017]/20">
          {initials}
        </div>
        <div className="min-w-0">
          <h1 className="text-2xl md:text-3xl font-black font-outfit text-white leading-tight">
            Olá, {firstName}!
          </h1>
          <div className="flex items-center gap-2 mt-0.5">
            {memberSince && <p className="text-zinc-500 text-xs">Desde {memberSince}</p>}
            {customer?.score && customer.score >= 80 && (
              <span className="flex items-center gap-0.5 text-[10px] text-[#d4a017] bg-[#d4a017]/10 px-1.5 py-0.5 rounded-full font-bold">
                <Star size={9} /> {customer.score}pts
              </span>
            )}
          </div>
        </div>
        <Link href="/minha-conta/perfil" className="ml-auto p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 active:bg-zinc-800 transition-colors">
          <User size={18} />
        </Link>
      </div>

      {/* ── Pending payments alert ──────────────────────────────────── */}
      {pendingPayments.length > 0 && (
        <div className="bg-amber-950/50 border border-amber-500/30 rounded-2xl p-4 mb-5">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle size={16} className="text-amber-400 flex-shrink-0" />
            <p className="text-amber-400 font-bold text-sm">
              {pendingPayments.length} pagamento{pendingPayments.length > 1 ? "s" : ""} pendente{pendingPayments.length > 1 ? "s" : ""}
            </p>
          </div>
          <div className="space-y-2">
            {pendingPayments.slice(0, 2).map((p) => {
              const r = reservations.find((res) => res.payments.some((pay) => pay.id === p.id))
              return (
                <div key={p.id} className="bg-black/30 rounded-xl p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-white text-xs font-semibold">
                        {r ? `${r.vehicle.brand} ${r.vehicle.model}` : "Locação"}
                      </p>
                      <p className="text-amber-300/60 text-[11px]">{formatCurrency(Number(p.amount))}</p>
                    </div>
                    <Link
                      href={`/minha-conta/pagar/${p.id}`}
                      className="text-xs font-bold text-black bg-[#d4a017] px-3 py-1.5 rounded-lg active:bg-[#b8860b] transition-colors"
                    >
                      Pagar
                    </Link>
                  </div>
                  {p.method === "PIX" && p.qrCode && (
                    <CopyButton
                      text={p.qrCode}
                      label="Copiar código PIX"
                      className="w-full justify-center text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg py-2 font-semibold"
                    />
                  )}
                  {p.method === "BOLETO" && p.digitableLine && (
                    <CopyButton
                      text={p.digitableLine}
                      label="Copiar linha digitável"
                      className="w-full justify-center text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg py-2 font-semibold"
                    />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Active rental banner ────────────────────────────────────── */}
      {activeRental && (
        <div className="bg-emerald-950/50 border border-emerald-500/30 rounded-2xl p-4 mb-5">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-emerald-400 font-bold text-xs uppercase tracking-wider">Locação em andamento</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-white font-bold text-base font-outfit">
                {activeRental.vehicle.brand} {activeRental.vehicle.model}
              </p>
              <p className="text-zinc-400 text-xs mt-0.5">
                Devolução: {new Date(activeRental.endDate).toLocaleDateString("pt-BR", { weekday: "short", day: "numeric", month: "short" })}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {daysUntilReturn !== null && (
                <div className="flex items-center gap-1 bg-emerald-900/40 border border-emerald-500/20 px-2.5 py-1.5 rounded-lg">
                  <Clock size={12} className="text-emerald-400" />
                  <span className="text-emerald-400 font-bold text-xs">
                    {daysUntilReturn > 0 ? `${daysUntilReturn}d` : "Hoje"}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Stats ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3.5 text-center">
          <p className="text-2xl font-black text-white">{reservations.length}</p>
          <p className="text-zinc-600 text-[10px] uppercase tracking-wider mt-0.5">Reservas</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3.5 text-center">
          <p className="text-2xl font-black text-purple-400">{completedCount}</p>
          <p className="text-zinc-600 text-[10px] uppercase tracking-wider mt-0.5">Concluídas</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3.5 text-center">
          <p className="text-base font-black text-[#d4a017] leading-tight mt-0.5">{formatCurrency(totalSpent)}</p>
          <p className="text-zinc-600 text-[10px] uppercase tracking-wider mt-0.5">Total gasto</p>
        </div>
      </div>

      {/* ── Quick links — full-width rows on mobile ─────────────────── */}
      <div className="mb-6">
        <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-3">Menu</h2>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden divide-y divide-zinc-800/60">
          {[
            { icon: <CalendarClock size={19} className="text-[#d4a017]" />, label: "Minhas Reservas", sub: "Ver histórico de locações", href: "/minhas-reservas" },
            { icon: <FileText size={19} className="text-blue-400" />, label: "Meus Contratos", sub: "Visualizar e baixar contratos", href: "/minha-conta/contratos" },
            { icon: <Car size={19} className="text-emerald-400" />, label: "Explorar Frota", sub: "Veículos disponíveis para locar", href: "/frota" },
            { icon: <User size={19} className="text-purple-400" />, label: "Meu Perfil", sub: "Editar dados pessoais e CNH", href: "/minha-conta/perfil" },
            { icon: <Shield size={19} className="text-zinc-400" />, label: "Segurança", sub: "Senha e preferências", href: "/minha-conta/perfil" },
          ].map((item) => (
            <Link
              key={item.href + item.label}
              href={item.href}
              className="flex items-center gap-3.5 px-4 py-4 active:bg-zinc-800 transition-colors group"
            >
              <div className="w-9 h-9 rounded-xl bg-zinc-800 group-active:bg-zinc-700 flex items-center justify-center flex-shrink-0 transition-colors">
                {item.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-sm">{item.label}</p>
                <p className="text-zinc-500 text-xs mt-0.5">{item.sub}</p>
              </div>
              <ChevronRight size={16} className="text-zinc-600 flex-shrink-0" />
            </Link>
          ))}
        </div>
      </div>

      {/* ── Recent reservations ─────────────────────────────────────── */}
      {recentReservations.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-wider">Recentes</h2>
            <Link href="/minhas-reservas" className="text-[#d4a017] text-xs font-semibold flex items-center gap-0.5 active:text-[#b8860b]">
              Ver todas <ChevronRight size={13} />
            </Link>
          </div>
          <div className="space-y-2">
            {recentReservations.map((r) => {
              const cfg = statusConfig[r.status] ?? { label: r.status, color: "text-zinc-400 bg-zinc-800 border-zinc-700" }
              const payment = r.payments[0]
              return (
                <Link key={r.id} href="/minhas-reservas" className="bg-zinc-900 border border-zinc-800 active:border-zinc-700 rounded-xl p-3.5 flex items-center gap-3 transition-all block">
                  <div className="w-9 h-9 rounded-lg bg-zinc-800 flex items-center justify-center flex-shrink-0">
                    <Car size={16} className="text-[#d4a017]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold text-sm leading-tight truncate">
                      {r.vehicle.brand} {r.vehicle.model}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <p className="text-zinc-500 text-[11px]">
                        {new Date(r.startDate).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })} →{" "}
                        {new Date(r.endDate).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
                      </p>
                      {payment?.status === "PENDING" && (
                        <span className="text-[9px] text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded-full font-bold">Pagar</span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${cfg.color}`}>{cfg.label}</span>
                    <span className="text-[#d4a017] font-bold text-xs">{formatCurrency(Number(r.totalValue))}</span>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Support ─────────────────────────────────────────────────── */}
      <a
        href="https://wa.me/5592992921946"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 bg-emerald-950/40 border border-emerald-500/25 rounded-2xl p-4 active:bg-emerald-950/60 transition-colors"
      >
        <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center flex-shrink-0">
          <Phone size={18} className="text-white" />
        </div>
        <div className="flex-1">
          <p className="text-white font-bold text-sm">Falar no WhatsApp</p>
          <p className="text-zinc-400 text-xs mt-0.5">Suporte disponível agora</p>
        </div>
        <ChevronRight size={16} className="text-zinc-600" />
      </a>

    </div>
  )
}
