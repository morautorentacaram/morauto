import { auth } from "@/auth"
import { db } from "@/lib/db"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { formatCurrency } from "@/lib/utils"
import CopyButton from "@/components/public/CopyButton"
import {
  ArrowLeft, QrCode, Barcode, CheckCircle,
  Clock, Car, CalendarDays, Phone, AlertCircle, ChevronRight
} from "lucide-react"

export const metadata = { title: "Pagamento — Morauto" }

export default async function PagarPage({
  params,
}: {
  params: Promise<{ paymentId: string }>
}) {
  const { paymentId } = await params
  const session = await auth()
  if (!session?.user?.id) redirect("/login?callbackUrl=/minha-conta")

  const customer = await db.customer.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  })
  if (!customer) notFound()

  const payment = await db.payment.findUnique({
    where: { id: paymentId },
    include: {
      reservation: {
        include: {
          vehicle: true,
          customer: true,
        },
      },
    },
  })

  // Ensure the payment belongs to this customer
  if (!payment || payment.reservation.customer.id !== customer.id) notFound()

  const r = payment.reservation
  const vehicle = r.vehicle
  const isPaid = payment.status === "PAID"
  const isPending = payment.status === "PENDING"
  const isPix = payment.method === "PIX"
  const isBoleto = payment.method === "BOLETO"
  const days = Math.ceil(
    (new Date(r.endDate).getTime() - new Date(r.startDate).getTime()) / (1000 * 60 * 60 * 24)
  )

  return (
    <div className="container mx-auto px-4 py-6 max-w-lg">

      {/* ── Back + title ─────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/minhas-reservas" className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 active:bg-zinc-800 transition-colors">
          <ArrowLeft size={17} />
        </Link>
        <div>
          <h1 className="text-xl font-black font-outfit text-white">Pagamento</h1>
          <p className="text-zinc-500 text-xs mt-0.5">{isPaid ? "Confirmado" : "Aguardando"}</p>
        </div>
      </div>

      {/* ── Status banner ────────────────────────────────────────────── */}
      {isPaid ? (
        <div className="bg-emerald-950/50 border border-emerald-500/30 rounded-2xl p-5 mb-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
            <CheckCircle size={24} className="text-emerald-400" />
          </div>
          <div>
            <p className="text-emerald-400 font-bold">Pagamento confirmado!</p>
            {payment.paidAt && (
              <p className="text-emerald-300/60 text-xs mt-0.5">
                {new Date(payment.paidAt).toLocaleDateString("pt-BR", {
                  day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit"
                })}
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-amber-950/40 border border-amber-500/25 rounded-2xl p-4 mb-5 flex items-center gap-3">
          <Clock size={18} className="text-amber-400 flex-shrink-0" />
          <div>
            <p className="text-amber-400 font-bold text-sm">Aguardando pagamento</p>
            {payment.dueDate && (
              <p className="text-amber-300/60 text-xs mt-0.5">
                Vence em: {new Date(payment.dueDate).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
              </p>
            )}
          </div>
        </div>
      )}

      {/* ── Reservation summary ──────────────────────────────────────── */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 mb-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center flex-shrink-0">
            <Car size={18} className="text-[#d4a017]" />
          </div>
          <div>
            <p className="text-white font-bold text-sm">{vehicle.brand} {vehicle.model} {vehicle.year}</p>
            <p className="text-zinc-500 text-xs">{vehicle.plate}</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 bg-zinc-950/50 rounded-xl p-3">
          <div>
            <p className="text-zinc-600 text-[9px] uppercase font-bold tracking-wider mb-0.5">Retirada</p>
            <div className="flex items-center gap-1 text-zinc-300 text-xs">
              <CalendarDays size={10} className="text-zinc-500" />
              {new Date(r.startDate).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
            </div>
          </div>
          <div>
            <p className="text-zinc-600 text-[9px] uppercase font-bold tracking-wider mb-0.5">Devolução</p>
            <div className="flex items-center gap-1 text-zinc-300 text-xs">
              <CalendarDays size={10} className="text-zinc-500" />
              {new Date(r.endDate).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
            </div>
          </div>
          <div className="text-right">
            <p className="text-zinc-600 text-[9px] uppercase font-bold tracking-wider mb-0.5">{days}d</p>
            <p className="text-[#d4a017] font-black text-sm">{formatCurrency(Number(payment.amount))}</p>
          </div>
        </div>
      </div>

      {/* ── PIX payment ──────────────────────────────────────────────── */}
      {isPix && isPending && payment.qrCode && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 mb-5">
          <div className="flex items-center gap-2 mb-4">
            <QrCode size={18} className="text-[#d4a017]" />
            <h2 className="text-white font-bold">PIX — Copia e Cola</h2>
          </div>

          <div className="bg-black rounded-xl p-4 mb-4">
            <p className="font-mono text-[11px] text-zinc-400 break-all leading-relaxed select-all">
              {payment.qrCode}
            </p>
          </div>

          <CopyButton
            text={payment.qrCode}
            label="Copiar código PIX"
            className="w-full justify-center bg-[#d4a017] text-black font-bold text-sm py-3.5 rounded-xl"
          />

          <div className="mt-4 bg-zinc-950/60 rounded-xl p-3.5 space-y-1.5 text-xs text-zinc-500">
            <p className="flex items-start gap-1.5"><span className="text-[#d4a017] font-bold mt-0.5">1.</span> Abra o app do seu banco</p>
            <p className="flex items-start gap-1.5"><span className="text-[#d4a017] font-bold mt-0.5">2.</span> Escolha "PIX → Copia e Cola"</p>
            <p className="flex items-start gap-1.5"><span className="text-[#d4a017] font-bold mt-0.5">3.</span> Cole o código acima e confirme</p>
            <p className="flex items-start gap-1.5"><span className="text-[#d4a017] font-bold mt-0.5">4.</span> Sua reserva será confirmada automaticamente</p>
          </div>
        </div>
      )}

      {/* ── Boleto payment ───────────────────────────────────────────── */}
      {isBoleto && isPending && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 mb-5">
          <div className="flex items-center gap-2 mb-4">
            <Barcode size={18} className="text-[#d4a017]" />
            <h2 className="text-white font-bold">Boleto Bancário</h2>
          </div>

          {payment.digitableLine && (
            <>
              <p className="text-zinc-500 text-xs mb-2">Linha digitável</p>
              <div className="bg-black rounded-xl p-4 mb-3">
                <p className="font-mono text-xs text-zinc-300 break-all leading-relaxed select-all">
                  {payment.digitableLine}
                </p>
              </div>
              <CopyButton
                text={payment.digitableLine}
                label="Copiar linha digitável"
                className="w-full justify-center bg-[#d4a017] text-black font-bold text-sm py-3.5 rounded-xl mb-3"
              />
            </>
          )}

          {payment.boletoBarCode && (
            <>
              <p className="text-zinc-500 text-xs mb-2">Código de barras</p>
              <div className="bg-black rounded-xl p-3 mb-3">
                <p className="font-mono text-[10px] text-zinc-400 break-all select-all">
                  {payment.boletoBarCode}
                </p>
              </div>
              <CopyButton
                text={payment.boletoBarCode}
                label="Copiar código de barras"
                className="w-full justify-center bg-zinc-800 text-zinc-300 font-semibold text-sm py-3 rounded-xl mb-3 border border-zinc-700"
              />
            </>
          )}

          {/* PIX linked to boleto */}
          {payment.qrCode && (
            <div className="bg-zinc-950/60 border border-zinc-700/50 rounded-xl p-3.5 mt-3">
              <div className="flex items-center gap-2 mb-2">
                <QrCode size={14} className="text-[#d4a017]" />
                <p className="text-zinc-300 text-xs font-semibold">QR PIX vinculado ao boleto</p>
              </div>
              <CopyButton
                text={payment.qrCode}
                label="Copiar código PIX do boleto"
                className="w-full justify-center text-xs text-zinc-400 bg-zinc-800 border border-zinc-700 rounded-lg py-2.5 font-semibold"
              />
            </div>
          )}

          <div className="mt-4 bg-zinc-950/60 rounded-xl p-3.5 space-y-1.5 text-xs text-zinc-500">
            <p className="flex items-start gap-1.5"><span className="text-[#d4a017] font-bold mt-0.5">•</span> Vencimento em {payment.dueDate ? new Date(payment.dueDate).toLocaleDateString("pt-BR") : "3 dias úteis"}</p>
            <p className="flex items-start gap-1.5"><span className="text-[#d4a017] font-bold mt-0.5">•</span> Pague em qualquer banco, lotérica ou app</p>
            <p className="flex items-start gap-1.5"><span className="text-[#d4a017] font-bold mt-0.5">•</span> Confirmação em até 1 dia útil após o pagamento</p>
          </div>
        </div>
      )}

      {/* ── No payment method yet ────────────────────────────────────── */}
      {isPending && !payment.qrCode && !payment.digitableLine && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 mb-5 text-center">
          <AlertCircle size={36} className="text-zinc-600 mx-auto mb-3" />
          <p className="text-zinc-400 font-semibold text-sm">Cobrança sendo processada</p>
          <p className="text-zinc-600 text-xs mt-1">O código de pagamento será gerado em instantes. Atualize a página.</p>
        </div>
      )}

      {/* ── Support ─────────────────────────────────────────────────── */}
      <a
        href="https://wa.me/5592992921946"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 rounded-2xl p-4 active:bg-zinc-800 transition-colors"
      >
        <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center flex-shrink-0">
          <Phone size={18} className="text-white" />
        </div>
        <div className="flex-1">
          <p className="text-white font-semibold text-sm">Dúvidas sobre o pagamento?</p>
          <p className="text-zinc-500 text-xs mt-0.5">Fale com nossa equipe pelo WhatsApp</p>
        </div>
        <ChevronRight size={16} className="text-zinc-600" />
      </a>

    </div>
  )
}
