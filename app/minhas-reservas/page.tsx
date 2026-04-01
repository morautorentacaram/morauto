import { db } from "@/lib/db"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { formatCurrency } from "@/lib/utils"
import Navbar from "@/components/public/Navbar"
import Footer from "@/components/public/Footer"
import {
  CalendarDays, Car, AlertCircle, CheckCircle, Clock,
  FileText, CreditCard, ArrowRight, Phone, XCircle, Star
} from "lucide-react"

export const metadata = { title: "Minhas Reservas — Morauto" }

const statusConfig: Record<string, { label: string; color: string }> = {
  PENDING:   { label: "Aguardando Confirmação", color: "text-amber-400 bg-amber-400/10 border-amber-400/20" },
  CONFIRMED: { label: "Confirmada",             color: "text-blue-400 bg-blue-400/10 border-blue-400/20" },
  ACTIVE:    { label: "Em Andamento",           color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" },
  COMPLETED: { label: "Concluída",              color: "text-purple-400 bg-purple-400/10 border-purple-400/20" },
  CANCELLED: { label: "Cancelada",              color: "text-red-400 bg-red-400/10 border-red-400/20" },
}

export default async function MyReservationsPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string }>
}) {
  const { success } = await searchParams
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/minhas-reservas")
  }

  const customer = await db.customer.findUnique({
    where: { userId: session.user.id },
  })

  const reservations = customer
    ? await db.reservation.findMany({
        where: { customerId: customer.id },
        include: {
          vehicle: { include: { category: true } },
          contract: true,
          payments: { orderBy: { createdAt: "desc" } },
        },
        orderBy: { createdAt: "desc" },
      })
    : []

  const activeRental = reservations.find((r) => r.status === "ACTIVE")
  const pendingCount = reservations.filter((r) => r.status === "PENDING" || r.status === "CONFIRMED").length

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar session={session} />

      <div className="container mx-auto px-4 md:px-6 py-8 md:py-12 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 md:mb-8">
          <div>
            <h1 className="text-2xl md:text-4xl font-bold font-outfit">Minhas Reservas</h1>
            <p className="text-zinc-400 text-sm mt-0.5">Olá, {session.user.name?.split(" ")[0]}!</p>
          </div>
          <Link href="/frota" className="flex items-center gap-2 bg-[#d4a017] hover:bg-[#b8860b] active:bg-[#b8860b] text-black font-bold px-3 md:px-4 py-2 rounded-xl text-sm transition-colors">
            <span className="hidden sm:inline">Nova Reserva</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {/* Success alert */}
        {success && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-5 rounded-2xl mb-8 flex items-start gap-4">
            <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-bold">Reserva Solicitada com Sucesso!</p>
              <p className="text-emerald-300/70 text-sm mt-1">Você receberá a confirmação em breve. Verifique seu e-mail.</p>
            </div>
          </div>
        )}

        {/* Active rental banner */}
        {activeRental && (
          <div className="bg-emerald-950/50 border border-emerald-500/30 rounded-2xl p-6 mb-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-400 font-bold text-sm uppercase tracking-wider">Locação em Andamento</span>
            </div>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h3 className="text-2xl font-bold font-outfit text-white">{activeRental.vehicle.brand} {activeRental.vehicle.model}</h3>
                <p className="text-zinc-400 text-sm">{activeRental.vehicle.plate} • {activeRental.vehicle.category.name}</p>
                <p className="text-zinc-400 text-sm mt-1">
                  Devolução prevista: <span className="text-white font-semibold">{new Date(activeRental.endDate).toLocaleDateString("pt-BR", { weekday: "short", day: "numeric", month: "long" })}</span>
                </p>
              </div>
              <div className="flex items-center gap-3">
                <a href="https://wa.me/5592992921946" target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-sm transition-colors">
                  <Phone size={14} /> Suporte
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Stats */}
        {reservations.length > 0 && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-white">{reservations.length}</p>
              <p className="text-zinc-500 text-xs uppercase tracking-wider mt-1">Total</p>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-amber-400">{pendingCount}</p>
              <p className="text-zinc-500 text-xs uppercase tracking-wider mt-1">Pendentes</p>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-purple-400">{reservations.filter(r => r.status === "COMPLETED").length}</p>
              <p className="text-zinc-500 text-xs uppercase tracking-wider mt-1">Concluídas</p>
            </div>
          </div>
        )}

        {/* Reservations list */}
        {reservations.length === 0 ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-16 text-center flex flex-col items-center">
            <Car size={48} className="text-zinc-700 mb-4" />
            <h3 className="text-2xl font-bold font-outfit mb-2">Nenhuma reserva ainda</h3>
            <p className="text-zinc-500 mb-8">Escolha um veículo e faça sua primeira reserva.</p>
            <Link href="/frota" className="bg-[#d4a017] hover:bg-[#b8860b] text-black font-bold py-3 px-8 rounded-xl transition-colors">
              Explorar Frota
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            {reservations.map((r) => {
              const cfg = statusConfig[r.status] ?? { label: r.status, color: "text-zinc-400" }
              const payment = r.payments[0]
              const days = Math.ceil((new Date(r.endDate).getTime() - new Date(r.startDate).getTime()) / (1000 * 60 * 60 * 24))

              return (
                <div key={r.id} className={`bg-zinc-900 border rounded-2xl overflow-hidden transition-all ${r.status === "ACTIVE" ? "border-emerald-500/30" : "border-zinc-800 hover:border-zinc-700"}`}>
                  <div className="p-4 md:p-6">
                    {/* Top row */}
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-zinc-800 flex items-center justify-center flex-shrink-0">
                          <Car className="w-5 h-5 md:w-6 md:h-6 text-[#d4a017]" />
                        </div>
                        <div>
                          <h3 className="text-base md:text-xl font-bold font-outfit text-white leading-tight">{r.vehicle.brand} {r.vehicle.model}</h3>
                          <p className="text-zinc-500 text-xs md:text-sm">{r.vehicle.plate} • {r.vehicle.year}</p>
                        </div>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] md:text-xs font-bold border flex-shrink-0 ${cfg.color}`}>
                        {cfg.label}
                      </span>
                    </div>

                    {/* Details grid — 2 cols on mobile, 4 on desktop */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-zinc-800">
                      <div>
                        <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-wider mb-1">Retirada</p>
                        <div className="flex items-center gap-1 text-zinc-300 text-sm">
                          <CalendarDays size={12} className="text-zinc-500 flex-shrink-0" />
                          {new Date(r.startDate).toLocaleDateString("pt-BR")}
                        </div>
                      </div>
                      <div>
                        <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-wider mb-1">Devolução</p>
                        <div className="flex items-center gap-1 text-zinc-300 text-sm">
                          <CalendarDays size={12} className="text-zinc-500 flex-shrink-0" />
                          {new Date(r.endDate).toLocaleDateString("pt-BR")}
                        </div>
                      </div>
                      <div>
                        <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-wider mb-1">Duração</p>
                        <p className="text-zinc-300 text-sm">{days}d</p>
                      </div>
                      <div>
                        <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-wider mb-1">Total</p>
                        <p className="text-lg font-bold text-[#d4a017]">{formatCurrency(Number(r.totalValue))}</p>
                      </div>
                    </div>

                    {/* Payment + Contract row */}
                    <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-zinc-800/50">
                      {/* Payment status */}
                      {payment && (
                        <div className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border ${
                          payment.status === "PAID" ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/20"
                          : payment.status === "PENDING" ? "text-amber-400 bg-amber-400/10 border-amber-400/20"
                          : "text-zinc-400 bg-zinc-400/10 border-zinc-700"
                        }`}>
                          <CreditCard size={12} />
                          {payment.status === "PAID" ? "Pagamento confirmado" : payment.status === "PENDING" ? "Pagamento pendente" : payment.status}
                        </div>
                      )}

                      {/* Contract */}
                      {r.contract && (
                        <div className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border text-blue-400 bg-blue-400/10 border-blue-400/20">
                          <FileText size={12} />
                          Contrato {r.contract.signedAt ? "assinado" : "gerado"}: {r.contract.number}
                        </div>
                      )}

                      {/* Completed — show rating prompt */}
                      {r.status === "COMPLETED" && (
                        <div className="ml-auto">
                          <button className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-[#d4a017] transition-colors">
                            <Star size={12} /> Avaliar experiência
                          </button>
                        </div>
                      )}

                      {/* Cancelled */}
                      {r.status === "CANCELLED" && (
                        <div className="flex items-center gap-1.5 text-xs text-red-400">
                          <XCircle size={12} /> Reserva cancelada
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}
