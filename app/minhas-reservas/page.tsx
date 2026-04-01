import { db } from "@/lib/db"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { formatCurrency } from "@/lib/utils"
import Navbar from "@/components/public/Navbar"
import Footer from "@/components/public/Footer"
import CopyButton from "@/components/public/CopyButton"
import {
  CalendarDays, Car, CheckCircle, FileText, CreditCard,
  ArrowRight, Phone, XCircle, Star, Plus, Clock,
  QrCode, Barcode, ChevronRight, AlertCircle
} from "lucide-react"

export const metadata = { title: "Minhas Reservas — Morauto" }

const statusConfig: Record<string, { label: string; color: string; dot: string }> = {
  PENDING:   { label: "Aguardando",   color: "text-amber-400 bg-amber-400/10 border-amber-400/20",   dot: "bg-amber-400" },
  CONFIRMED: { label: "Confirmada",   color: "text-blue-400 bg-blue-400/10 border-blue-400/20",      dot: "bg-blue-400" },
  ACTIVE:    { label: "Em andamento", color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20", dot: "bg-emerald-400" },
  COMPLETED: { label: "Concluída",    color: "text-purple-400 bg-purple-400/10 border-purple-400/20", dot: "bg-purple-400" },
  CANCELLED: { label: "Cancelada",    color: "text-red-400 bg-red-400/10 border-red-400/20",          dot: "bg-red-400" },
}

const filterTabs = [
  { key: "",          label: "Todas" },
  { key: "ACTIVE",    label: "Ativas" },
  { key: "PENDING",   label: "Pendentes" },
  { key: "COMPLETED", label: "Concluídas" },
]

export default async function MyReservationsPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; filter?: string }>
}) {
  const { success, filter } = await searchParams
  const session = await auth()

  if (!session?.user?.id) redirect("/login?callbackUrl=/minhas-reservas")

  const customer = await db.customer.findUnique({ where: { userId: session.user.id } })

  const whereFilter: any = { customerId: customer?.id ?? "__none__" }
  if (filter === "ACTIVE")    whereFilter.status = "ACTIVE"
  if (filter === "PENDING")   whereFilter.status = { in: ["PENDING", "CONFIRMED"] }
  if (filter === "COMPLETED") whereFilter.status = "COMPLETED"

  const reservations = customer
    ? await db.reservation.findMany({
        where: whereFilter,
        include: {
          vehicle: { include: { category: true } },
          contract: true,
          payments: { orderBy: { createdAt: "desc" } },
        },
        orderBy: { createdAt: "desc" },
      })
    : []

  // Counts for tab badges
  const allCounts = customer
    ? await db.reservation.groupBy({
        by: ["status"],
        where: { customerId: customer.id },
        _count: true,
      })
    : []

  const countByStatus = Object.fromEntries(allCounts.map((c) => [c.status, c._count]))
  const totalCount = Object.values(countByStatus).reduce((a, b) => a + b, 0)
  const pendingTabCount = (countByStatus["PENDING"] ?? 0) + (countByStatus["CONFIRMED"] ?? 0)

  const activeRental = reservations.find((r) => r.status === "ACTIVE") ??
    (filter
      ? (await db.reservation.findFirst({
          where: { customerId: customer?.id, status: "ACTIVE" },
          include: { vehicle: true },
        }))
      : null)

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar session={session} />

      <div className="container mx-auto px-4 md:px-6 pt-6 pb-4 md:py-12 max-w-4xl">

        {/* ── Header ─────────────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-2xl md:text-4xl font-black font-outfit">Reservas</h1>
            <p className="text-zinc-500 text-xs md:text-sm mt-0.5">
              {session.user.name?.split(" ")[0]}, você tem {totalCount} reserva{totalCount !== 1 ? "s" : ""}
            </p>
          </div>
          <Link
            href="/frota"
            className="flex items-center gap-1.5 bg-[#d4a017] active:bg-[#b8860b] text-black font-bold px-3 py-2 rounded-xl text-sm transition-colors"
          >
            <Plus size={15} />
            <span className="hidden sm:inline">Nova</span>
          </Link>
        </div>

        {/* ── Success alert ───────────────────────────────────────── */}
        {success && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-2xl mb-5 flex items-start gap-3">
            <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-bold text-sm">Reserva solicitada com sucesso!</p>
              <p className="text-emerald-300/70 text-xs mt-0.5">Verifique o e-mail de confirmação e aguarde o pagamento.</p>
            </div>
          </div>
        )}

        {/* ── Active rental banner ────────────────────────────────── */}
        {activeRental && (
          <div className="bg-emerald-950/50 border border-emerald-500/30 rounded-2xl p-4 md:p-6 mb-5">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-400 font-bold text-xs uppercase tracking-wider">Locação ativa agora</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-white font-bold text-lg font-outfit leading-tight">
                  {"vehicle" in activeRental ? `${activeRental.vehicle.brand} ${activeRental.vehicle.model}` : "Veículo"}
                </p>
                <p className="text-zinc-400 text-xs mt-0.5">
                  Devolução: <span className="text-white font-semibold">
                    {new Date(activeRental.endDate).toLocaleDateString("pt-BR", { weekday: "short", day: "numeric", month: "short" })}
                  </span>
                </p>
              </div>
              <a
                href="https://wa.me/5592992921946"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 bg-emerald-600 active:bg-emerald-700 text-white font-bold px-3 py-2 rounded-xl text-xs flex-shrink-0 transition-colors"
              >
                <Phone size={13} /> Suporte
              </a>
            </div>
          </div>
        )}

        {/* ── Filter tabs ─────────────────────────────────────────── */}
        <div className="flex gap-2 mb-5 overflow-x-auto pb-1 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
          {filterTabs.map(({ key, label }) => {
            const isActive = (filter ?? "") === key
            const badge =
              key === ""         ? totalCount
              : key === "ACTIVE"    ? (countByStatus["ACTIVE"] ?? 0)
              : key === "PENDING"   ? pendingTabCount
              : key === "COMPLETED" ? (countByStatus["COMPLETED"] ?? 0)
              : 0
            return (
              <Link
                key={key}
                href={key ? `/minhas-reservas?filter=${key}` : "/minhas-reservas"}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all flex-shrink-0 ${
                  isActive
                    ? "bg-[#d4a017] text-black"
                    : "bg-zinc-900 text-zinc-400 border border-zinc-800 active:bg-zinc-800"
                }`}
              >
                {label}
                {badge > 0 && (
                  <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full leading-none ${
                    isActive ? "bg-black/20 text-black" : "bg-zinc-800 text-zinc-300"
                  }`}>
                    {badge}
                  </span>
                )}
              </Link>
            )
          })}
        </div>

        {/* ── Empty state ─────────────────────────────────────────── */}
        {reservations.length === 0 ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-12 text-center flex flex-col items-center">
            <Car size={44} className="text-zinc-700 mb-4" />
            <h3 className="text-xl font-bold font-outfit mb-2">
              {filter ? "Nenhuma reserva nessa categoria" : "Nenhuma reserva ainda"}
            </h3>
            <p className="text-zinc-500 text-sm mb-7">
              {filter ? "Tente outro filtro ou faça uma nova reserva." : "Escolha um veículo e faça sua primeira reserva."}
            </p>
            <Link href="/frota" className="bg-[#d4a017] active:bg-[#b8860b] text-black font-bold py-3 px-8 rounded-xl transition-colors text-sm">
              Explorar Frota
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {reservations.map((r) => {
              const cfg = statusConfig[r.status] ?? { label: r.status, color: "text-zinc-400", dot: "bg-zinc-400" }
              const payment = r.payments[0]
              const days = Math.ceil(
                (new Date(r.endDate).getTime() - new Date(r.startDate).getTime()) / (1000 * 60 * 60 * 24)
              )
              const hasPendingPayment = payment?.status === "PENDING"
              const hasPixPayload = hasPendingPayment && payment?.method === "PIX" && payment?.qrCode
              const hasBoletoLine = hasPendingPayment && payment?.method === "BOLETO" && payment?.digitableLine

              return (
                <div
                  key={r.id}
                  className={`bg-zinc-900 border rounded-2xl overflow-hidden transition-all ${
                    r.status === "ACTIVE"
                      ? "border-emerald-500/40"
                      : hasPendingPayment
                      ? "border-amber-500/30"
                      : "border-zinc-800"
                  }`}
                >
                  {/* ── Card Header ───────────────────────────── */}
                  <div className="p-4 md:p-5">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          r.status === "ACTIVE" ? "bg-emerald-500/10" : "bg-zinc-800"
                        }`}>
                          <Car size={18} className={r.status === "ACTIVE" ? "text-emerald-400" : "text-[#d4a017]"} />
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-base font-bold font-outfit text-white leading-tight truncate">
                            {r.vehicle.brand} {r.vehicle.model}
                          </h3>
                          <p className="text-zinc-500 text-xs mt-0.5">{r.vehicle.plate} · {r.vehicle.year}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <div className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${cfg.color}`}>
                          {cfg.label}
                        </span>
                      </div>
                    </div>

                    {/* Dates + duration + total */}
                    <div className="grid grid-cols-3 gap-2 bg-zinc-950/50 rounded-xl p-3 mb-3">
                      <div>
                        <p className="text-zinc-600 text-[9px] uppercase font-bold tracking-wider mb-0.5">Retirada</p>
                        <div className="flex items-center gap-1 text-zinc-300 text-xs font-semibold">
                          <CalendarDays size={11} className="text-zinc-500 flex-shrink-0" />
                          {new Date(r.startDate).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
                        </div>
                      </div>
                      <div>
                        <p className="text-zinc-600 text-[9px] uppercase font-bold tracking-wider mb-0.5">Devolução</p>
                        <div className="flex items-center gap-1 text-zinc-300 text-xs font-semibold">
                          <CalendarDays size={11} className="text-zinc-500 flex-shrink-0" />
                          {new Date(r.endDate).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-zinc-600 text-[9px] uppercase font-bold tracking-wider mb-0.5">{days}d · Total</p>
                        <p className="text-[#d4a017] font-black text-sm">{formatCurrency(Number(r.totalValue))}</p>
                      </div>
                    </div>

                    {/* Contract badge */}
                    {r.contract && (
                      <div className="flex items-center gap-1.5 text-[11px] text-blue-400 mb-3">
                        <FileText size={12} />
                        <span>Contrato {r.contract.number} · {r.contract.signedAt ? "assinado" : "gerado"}</span>
                        {r.contract.pdfUrl && (
                          <a href={r.contract.pdfUrl} target="_blank" rel="noopener noreferrer" className="ml-auto text-[#d4a017] flex items-center gap-0.5">
                            Ver <ChevronRight size={11} />
                          </a>
                        )}
                      </div>
                    )}

                    {/* ── Pending payment section ────────────── */}
                    {hasPendingPayment && (
                      <div className="bg-amber-950/40 border border-amber-500/25 rounded-xl p-3.5">
                        <div className="flex items-center gap-2 mb-2.5">
                          <AlertCircle size={14} className="text-amber-400 flex-shrink-0" />
                          <p className="text-amber-400 font-bold text-xs">Pagamento pendente · {formatCurrency(Number(payment.amount))}</p>
                        </div>

                        {/* PIX copia-e-cola */}
                        {hasPixPayload && (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-xs text-zinc-400 mb-1">
                              <QrCode size={13} className="text-[#d4a017]" />
                              <span className="font-semibold text-white">PIX — Copia e Cola</span>
                            </div>
                            <div className="bg-black/40 rounded-lg p-2.5 font-mono text-[10px] text-zinc-400 break-all leading-relaxed select-all">
                              {payment.qrCode}
                            </div>
                            <div className="flex gap-2">
                              <CopyButton
                                text={payment.qrCode!}
                                label="Copiar código PIX"
                                className="flex-1 justify-center bg-[#d4a017] text-black font-bold text-xs py-2.5 rounded-lg"
                              />
                              <Link
                                href={`/minha-conta/pagar/${payment.id}`}
                                className="flex items-center justify-center gap-1 bg-zinc-800 text-zinc-300 text-xs font-semibold px-3 py-2.5 rounded-lg"
                              >
                                Detalhes <ChevronRight size={12} />
                              </Link>
                            </div>
                          </div>
                        )}

                        {/* Boleto linha digitável */}
                        {hasBoletoLine && (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-xs text-zinc-400 mb-1">
                              <Barcode size={13} className="text-[#d4a017]" />
                              <span className="font-semibold text-white">Boleto Bancário</span>
                            </div>
                            <div className="bg-black/40 rounded-lg p-2.5 font-mono text-[10px] text-zinc-400 break-all leading-relaxed select-all">
                              {payment.digitableLine}
                            </div>
                            <div className="flex gap-2">
                              <CopyButton
                                text={payment.digitableLine!}
                                label="Copiar linha digitável"
                                className="flex-1 justify-center bg-[#d4a017] text-black font-bold text-xs py-2.5 rounded-lg"
                              />
                              <Link
                                href={`/minha-conta/pagar/${payment.id}`}
                                className="flex items-center justify-center gap-1 bg-zinc-800 text-zinc-300 text-xs font-semibold px-3 py-2.5 rounded-lg"
                              >
                                Detalhes <ChevronRight size={12} />
                              </Link>
                            </div>
                          </div>
                        )}

                        {/* No payment method generated yet */}
                        {!hasPixPayload && !hasBoletoLine && (
                          <div className="flex items-center justify-between">
                            <p className="text-zinc-500 text-xs">Aguardando geração da cobrança</p>
                            <Link
                              href={`/minha-conta/pagar/${payment.id}`}
                              className="flex items-center gap-1 text-[#d4a017] text-xs font-bold"
                            >
                              Pagar agora <ChevronRight size={12} />
                            </Link>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Paid confirmation */}
                    {payment?.status === "PAID" && (
                      <div className="flex items-center gap-2 text-emerald-400 text-xs bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-2">
                        <CreditCard size={13} />
                        <span className="font-semibold">Pagamento confirmado</span>
                        {payment.paidAt && (
                          <span className="text-emerald-300/60 ml-auto">
                            {new Date(payment.paidAt).toLocaleDateString("pt-BR")}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* ── Card Footer ───────────────────────────── */}
                  <div className="border-t border-zinc-800/60 px-4 py-2.5 flex items-center justify-between gap-3 bg-zinc-950/30">
                    <div className="flex items-center gap-3">
                      {r.status === "COMPLETED" && (
                        <button className="flex items-center gap-1.5 text-xs text-zinc-500 active:text-[#d4a017] transition-colors">
                          <Star size={12} /> Avaliar
                        </button>
                      )}
                      {r.status === "CANCELLED" && (
                        <span className="flex items-center gap-1.5 text-xs text-red-400">
                          <XCircle size={12} /> Cancelada
                        </span>
                      )}
                      {r.status === "ACTIVE" && (
                        <a
                          href="https://wa.me/5592992921946"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold"
                        >
                          <Phone size={12} /> Preciso de ajuda
                        </a>
                      )}
                    </div>
                    <span className="text-zinc-700 text-[10px]">
                      {new Date(r.createdAt).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Footer hidden on mobile (bottom nav handles navigation) */}
      <div className="hidden md:block">
        <Footer />
      </div>
    </div>
  )
}
