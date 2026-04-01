import { auth } from "@/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Car, FileText, ExternalLink, CheckCircle, Clock, PenLine } from "lucide-react"

export const metadata = { title: "Meus Contratos — Morauto" }

export default async function ContratosPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/minha-conta/contratos")
  }

  const customer = await db.customer.findUnique({
    where: { userId: session.user.id },
  })

  const contracts = customer
    ? await db.rentalContract.findMany({
        where: { customerId: customer.id },
        include: {
          reservation: {
            include: { vehicle: true },
          },
        },
        orderBy: { createdAt: "desc" },
      })
    : []

  return (
    <div className="container mx-auto px-4 py-10 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-black font-outfit text-white">Meus Contratos</h1>
        <p className="text-zinc-400 mt-1">Contratos de locação vinculados à sua conta</p>
      </div>

      {contracts.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-16 text-center flex flex-col items-center">
          <Car size={48} className="text-zinc-700 mb-4" />
          <h3 className="text-xl font-bold font-outfit text-white mb-2">Nenhum contrato ainda</h3>
          <p className="text-zinc-500 text-sm max-w-sm">
            Quando sua reserva for confirmada, o contrato aparecerá aqui.
          </p>
          <Link
            href="/frota"
            className="mt-6 bg-[#d4a017] hover:bg-[#b8860b] text-black font-bold py-3 px-8 rounded-xl transition-colors text-sm"
          >
            Explorar Frota
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {contracts.map((contract) => {
            const isSigned = !!contract.signedAt
            const isSent   = !!contract.docusealSubmitterSlug
            return (
              <div
                key={contract.id}
                className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-2xl p-6 transition-all"
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center flex-shrink-0">
                      <FileText size={20} className="text-[#d4a017]" />
                    </div>
                    <div>
                      <p className="text-white font-bold text-lg">
                        {contract.reservation.vehicle.brand} {contract.reservation.vehicle.model}
                      </p>
                      <p className="text-zinc-500 text-xs font-mono mt-0.5">
                        Contrato #{contract.number}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border flex-shrink-0 ${
                      isSigned
                        ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/20"
                        : isSent
                        ? "text-blue-400 bg-blue-400/10 border-blue-400/20"
                        : "text-amber-400 bg-amber-400/10 border-amber-400/20"
                    }`}
                  >
                    {isSigned ? (
                      <><CheckCircle size={12} /> Assinado</>
                    ) : isSent ? (
                      <><PenLine size={12} /> Assinar agora</>
                    ) : (
                      <><Clock size={12} /> Pendente</>
                    )}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm border-t border-zinc-800 pt-4">
                  <div>
                    <p className="text-zinc-500 text-xs uppercase tracking-wider mb-1">Retirada</p>
                    <p className="text-zinc-300">
                      {new Date(contract.reservation.startDate).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                  <div>
                    <p className="text-zinc-500 text-xs uppercase tracking-wider mb-1">Devolução</p>
                    <p className="text-zinc-300">
                      {new Date(contract.reservation.endDate).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                  <div>
                    <p className="text-zinc-500 text-xs uppercase tracking-wider mb-1">Emitido em</p>
                    <p className="text-zinc-300">
                      {new Date(contract.createdAt).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-3 flex-wrap">
                  {isSent && !isSigned ? (
                    <Link
                      href={`/minha-conta/contratos/${contract.id}`}
                      className="flex items-center gap-1.5 text-sm font-bold px-4 py-2 rounded-xl bg-[#d4a017] hover:bg-[#b8860b] text-black transition-colors"
                    >
                      <PenLine size={14} /> Assinar Contrato
                    </Link>
                  ) : (
                    <Link
                      href={`/minha-conta/contratos/${contract.id}`}
                      className="flex items-center gap-1.5 text-sm text-[#d4a017] hover:text-[#b8860b] font-semibold transition-colors"
                    >
                      <ExternalLink size={14} /> Ver Detalhes
                    </Link>
                  )}
                  {contract.pdfUrl && (
                    <a
                      href={contract.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white transition-colors"
                    >
                      <FileText size={14} /> Download PDF
                    </a>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
