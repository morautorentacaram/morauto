import { getCustomerById, blockCustomer, unblockCustomer, updateCustomerScore } from "@/app/actions/customer.actions"
type CustomerType = NonNullable<Awaited<ReturnType<typeof getCustomerById>>>
type ReservationType = CustomerType["reservations"][0]
import { formatCurrency } from "@/lib/utils"
import { notFound } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft, UserCircle, ShieldCheck, ShieldOff, Star,
  CalendarDays, Car, FileText, Phone, Mail, CreditCard,
  Home, CheckCircle, XCircle, ExternalLink, MessageCircle
} from "lucide-react"
import CustomerDetailActions from "@/components/admin/CustomerDetailActions"

export const dynamic = "force-dynamic"

const reservationStatus: Record<string, { label: string; color: string }> = {
  PENDING:   { label: "Pendente",   color: "text-amber-400 bg-amber-400/10 border-amber-400/20" },
  CONFIRMED: { label: "Confirmada", color: "text-blue-400 bg-blue-400/10 border-blue-400/20" },
  ACTIVE:    { label: "Ativa",      color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" },
  COMPLETED: { label: "Concluída",  color: "text-purple-400 bg-purple-400/10 border-purple-400/20" },
  CANCELLED: { label: "Cancelada",  color: "text-red-400 bg-red-400/10 border-red-400/20" },
}

export default async function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const customer = await getCustomerById(id)
  if (!customer) notFound()

  const totalSpent = customer.reservations
    .filter((r: ReservationType) => r.status === "COMPLETED")
    .reduce((acc: number, r: ReservationType) => acc + Number(r.totalValue), 0)

  return (
    <div className="space-y-6 p-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/admin/clientes" className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm">
          <ArrowLeft className="w-4 h-4" /> Clientes
        </Link>
      </div>

      {/* Header */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex items-start gap-6">
        <div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-black flex-shrink-0 ${customer.blocked ? "bg-red-900/30 border-2 border-red-700 text-red-400" : "bg-[#d4a017]/10 border-2 border-[#d4a017]/30 text-[#d4a017]"}`}>
          {customer.user.name?.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-black font-outfit text-white">{customer.user.name}</h1>
            {customer.blocked && <span className="text-red-400 text-xs bg-red-900/30 border border-red-700/40 px-2 py-1 rounded-lg">BLOQUEADO</span>}
            <span className="text-zinc-500 text-xs bg-zinc-800 px-2 py-1 rounded">{customer.type}</span>
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-zinc-400 mt-2">
            <span className="flex items-center gap-1.5"><Mail size={13} /> {customer.user.email}</span>
            {customer.phone && <span className="flex items-center gap-1.5"><Phone size={13} /> {customer.phone}</span>}
            <span className="flex items-center gap-1.5"><CreditCard size={13} /> {customer.document}</span>
            {customer.cnh && <span className="flex items-center gap-1.5"><UserCircle size={13} /> CNH {customer.cnh}</span>}
          </div>
          {customer.blockedReason && (
            <p className="text-red-400 text-sm mt-2">Motivo do bloqueio: {customer.blockedReason}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {customer.blocked ? (
            <form action={async () => { "use server"; await unblockCustomer(id) }}>
              <button type="submit" className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2 rounded-xl text-sm transition-colors">
                <ShieldCheck size={16} /> Desbloquear
              </button>
            </form>
          ) : (
            <form action={async () => { "use server"; await blockCustomer(id, "Bloqueio manual pelo admin") }}>
              <button type="submit" className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-xl text-sm transition-colors">
                <ShieldOff size={16} /> Bloquear
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
          <p className="text-zinc-500 text-xs uppercase tracking-wider">Locações</p>
          <p className="text-3xl font-bold text-white mt-1">{customer.reservations.length}</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
          <p className="text-zinc-500 text-xs uppercase tracking-wider">Concluídas</p>
          <p className="text-3xl font-bold text-purple-400 mt-1">{customer.reservations.filter(r => r.status === "COMPLETED").length}</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
          <p className="text-zinc-500 text-xs uppercase tracking-wider">Total Gasto</p>
          <p className="text-2xl font-bold text-[#d4a017] mt-1">{formatCurrency(totalSpent)}</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
          <p className="text-zinc-500 text-xs uppercase tracking-wider">Score</p>
          <div className="flex items-center justify-center gap-2 mt-1">
            <p className="text-3xl font-bold text-white">{customer.score ?? 100}</p>
            <Star size={16} className="text-[#d4a017]" />
          </div>
        </div>
      </div>

      {/* Documentos + WhatsApp */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Documentos */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-3">
          <h3 className="text-white font-semibold text-sm flex items-center gap-2">
            <FileText size={15} className="text-[#d4a017]" /> Documentos
          </h3>

          {/* CNH */}
          <div className="flex items-center justify-between bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3">
            <div className="flex items-center gap-3">
              <FileText size={15} className="text-[#d4a017] flex-shrink-0" />
              <div>
                <p className="text-white text-sm font-medium">CNH</p>
                {customer.cnhUrl ? (
                  <p className="text-emerald-400 text-xs flex items-center gap-1"><CheckCircle size={10} /> Enviado</p>
                ) : (
                  <p className="text-zinc-600 text-xs flex items-center gap-1"><XCircle size={10} /> Não enviado</p>
                )}
              </div>
            </div>
            {customer.cnhUrl ? (
              <a href={customer.cnhUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-zinc-400 hover:text-white text-xs transition-colors border border-zinc-700 hover:border-zinc-500 px-2.5 py-1.5 rounded-lg">
                <ExternalLink size={11} /> Visualizar
              </a>
            ) : (
              <span className="text-zinc-700 text-xs">—</span>
            )}
          </div>

          {/* Comprovante de residência */}
          <div className="flex items-center justify-between bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3">
            <div className="flex items-center gap-3">
              <Home size={15} className="text-blue-400 flex-shrink-0" />
              <div>
                <p className="text-white text-sm font-medium">Comprovante de Residência</p>
                {customer.addressProofUrl ? (
                  <p className="text-emerald-400 text-xs flex items-center gap-1"><CheckCircle size={10} /> Enviado</p>
                ) : (
                  <p className="text-zinc-600 text-xs flex items-center gap-1"><XCircle size={10} /> Não enviado</p>
                )}
              </div>
            </div>
            {customer.addressProofUrl ? (
              <a href={customer.addressProofUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-zinc-400 hover:text-white text-xs transition-colors border border-zinc-700 hover:border-zinc-500 px-2.5 py-1.5 rounded-lg">
                <ExternalLink size={11} /> Visualizar
              </a>
            ) : (
              <span className="text-zinc-700 text-xs">—</span>
            )}
          </div>

          <p className="text-zinc-600 text-xs">Para enviar documentos, clique em Editar na lista de clientes.</p>
        </div>

        {/* Contato */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-3">
          <h3 className="text-white font-semibold text-sm flex items-center gap-2">
            <Phone size={15} className="text-[#d4a017]" /> Contato
          </h3>
          <div className="space-y-2.5">
            <div className="flex items-center gap-3 text-sm text-zinc-400">
              <Mail size={14} className="flex-shrink-0" />
              <span className="truncate">{customer.user.email}</span>
            </div>
            {customer.phone ? (
              <div className="flex items-center gap-3 text-sm text-zinc-400">
                <Phone size={14} className="flex-shrink-0" />
                <span>{customer.phone}</span>
              </div>
            ) : (
              <p className="text-zinc-600 text-xs italic">Telefone não cadastrado</p>
            )}
          </div>

          {customer.phone && (
            <a
              href={`https://wa.me/55${customer.phone.replace(/\D/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Abrir WhatsApp
            </a>
          )}

          <CustomerDetailActions customer={{
            id: customer.id,
            type: customer.type,
            phone: customer.phone,
            document: customer.document,
            cnh: customer.cnh,
            cnhExpiration: customer.cnhExpiration,
            cnhUrl: customer.cnhUrl,
            addressProofUrl: customer.addressProofUrl,
            user: { name: customer.user.name, email: customer.user.email },
          }} />
        </div>
      </div>

      {/* Score editor */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <h3 className="text-white font-semibold mb-4">Atualizar Score de Confiança</h3>
        <form className="flex items-center gap-4" action={async (fd: FormData) => {
          "use server"
          const score = Number(fd.get("score"))
          await updateCustomerScore(id, score)
        }}>
          <input type="range" name="score" min={0} max={100} defaultValue={customer.score ?? 100} className="flex-1 accent-[#d4a017]" />
          <input type="number" name="score" min={0} max={100} defaultValue={customer.score ?? 100} className="w-20 bg-zinc-950 border border-zinc-700 text-white px-3 py-2 rounded-lg text-sm text-center outline-none focus:border-[#d4a017]" />
          <button type="submit" className="bg-[#d4a017] hover:bg-[#b8860b] text-black font-bold px-4 py-2 rounded-lg text-sm transition-colors">Salvar</button>
        </form>
      </div>

      {/* Reservation history */}
      <div>
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <CalendarDays size={16} className="text-zinc-400" /> Histórico de Locações
        </h3>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-950/50 border-b border-zinc-800 text-zinc-400 text-xs">
                <th className="px-5 py-3 font-medium uppercase tracking-wider">Veículo</th>
                <th className="px-5 py-3 font-medium uppercase tracking-wider">Período</th>
                <th className="px-5 py-3 font-medium uppercase tracking-wider">Valor</th>
                <th className="px-5 py-3 font-medium uppercase tracking-wider">Pagamento</th>
                <th className="px-5 py-3 font-medium uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {customer.reservations.map((r: ReservationType) => {
                const cfg = reservationStatus[r.status] ?? { label: r.status, color: "text-zinc-400" }
                const payment = r.payments[0]
                return (
                  <tr key={r.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <Car size={14} className="text-[#d4a017] flex-shrink-0" />
                        <div>
                          <p className="text-white text-sm font-medium">{r.vehicle.brand} {r.vehicle.model}</p>
                          <p className="text-zinc-500 text-xs">{r.vehicle.plate}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-zinc-400 text-sm">
                      {new Date(r.startDate).toLocaleDateString("pt-BR")} → {new Date(r.endDate).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="px-5 py-4 text-[#d4a017] font-bold text-sm">{formatCurrency(Number(r.totalValue))}</td>
                    <td className="px-5 py-4">
                      {payment ? (
                        <span className={`text-xs px-2 py-1 rounded-full border ${payment.status === "PAID" ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" : "text-amber-400 bg-amber-400/10 border-amber-400/20"}`}>
                          {payment.status === "PAID" ? "Pago" : "Pendente"}
                        </span>
                      ) : <span className="text-zinc-600 text-xs">—</span>}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-xs px-2 py-1 rounded-full border ${cfg.color}`}>{cfg.label}</span>
                    </td>
                  </tr>
                )
              })}
              {customer.reservations.length === 0 && (
                <tr><td colSpan={5} className="px-5 py-10 text-center text-zinc-500">Nenhuma locação.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Contracts */}
      {customer.contracts.length > 0 && (
        <div>
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <FileText size={16} className="text-zinc-400" /> Contratos
          </h3>
          <div className="space-y-2">
            {customer.contracts.map((c) => (
              <Link key={c.id} href={`/admin/contratos/${c.id}`} className="flex items-center justify-between bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-xl p-4 transition-all">
                <span className="text-[#d4a017] font-mono font-bold text-sm">{c.number}</span>
                <div className="flex items-center gap-3">
                  {c.signedAt ? (
                    <span className="text-emerald-400 text-xs flex items-center gap-1"><ShieldCheck size={12} /> Assinado</span>
                  ) : (
                    <span className="text-amber-400 text-xs">Pendente</span>
                  )}
                  <span className="text-zinc-500 text-xs">{new Date(c.createdAt).toLocaleDateString("pt-BR")}</span>
                  <ArrowLeft size={14} className="text-zinc-500 rotate-180" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
