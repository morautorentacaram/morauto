import { auth } from "@/auth"
import { db } from "@/lib/db"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, CheckCircle, Clock, PenLine, AlertCircle } from "lucide-react"

export const dynamic = "force-dynamic"

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return { title: `Contrato — Morauto` }
}

export default async function CustomerContractDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id }     = await params
  const session    = await auth()

  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=/minha-conta/contratos/${id}`)
  }

  const customer = await db.customer.findUnique({
    where: { userId: session.user.id },
  })

  if (!customer) redirect("/minha-conta/contratos")

  const contract = await db.rentalContract.findFirst({
    where: { id, customerId: customer.id },
    include: {
      reservation: { include: { vehicle: true } },
    },
  })

  if (!contract) notFound()

  const isSigned = !!contract.signedAt
  const isSent   = !!contract.docusealSubmitterSlug

  const embedSrc = isSent && !isSigned
    ? `https://docuseal.com/s/${contract.docusealSubmitterSlug}`
    : null

  return (
    <div className="container mx-auto px-4 py-10 max-w-3xl">

      {/* Back */}
      <Link
        href="/minha-conta/contratos"
        className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm mb-6"
      >
        <ArrowLeft size={16} /> Voltar para contratos
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
        <div>
          <h1 className="text-2xl font-black font-outfit text-white">
            {contract.reservation.vehicle.brand} {contract.reservation.vehicle.model}
          </h1>
          <p className="text-zinc-500 text-xs font-mono mt-0.5">Contrato #{contract.number}</p>
        </div>

        <span
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${
            isSigned
              ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/20"
              : isSent
              ? "text-blue-400 bg-blue-400/10 border-blue-400/20"
              : "text-amber-400 bg-amber-400/10 border-amber-400/20"
          }`}
        >
          {isSigned ? (
            <><CheckCircle size={12} /> Assinado em {new Date(contract.signedAt!).toLocaleDateString("pt-BR")}</>
          ) : isSent ? (
            <><PenLine size={12} /> Pendente de assinatura</>
          ) : (
            <><Clock size={12} /> Aguardando envio</>
          )}
        </span>
      </div>

      {/* Info */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 mb-6 grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
        <div>
          <p className="text-zinc-500 text-xs uppercase tracking-wider mb-1">Retirada</p>
          <p className="text-zinc-200">{new Date(contract.reservation.startDate).toLocaleDateString("pt-BR")}</p>
        </div>
        <div>
          <p className="text-zinc-500 text-xs uppercase tracking-wider mb-1">Devolução</p>
          <p className="text-zinc-200">{new Date(contract.reservation.endDate).toLocaleDateString("pt-BR")}</p>
        </div>
        <div>
          <p className="text-zinc-500 text-xs uppercase tracking-wider mb-1">Emitido em</p>
          <p className="text-zinc-200">{new Date(contract.createdAt).toLocaleDateString("pt-BR")}</p>
        </div>
      </div>

      {/* Signing section */}
      {isSigned ? (
        <div className="bg-emerald-950/20 border border-emerald-700/30 rounded-2xl p-8 text-center">
          <CheckCircle size={40} className="text-emerald-400 mx-auto mb-3" />
          <h2 className="text-white font-bold text-lg mb-1">Contrato assinado</h2>
          <p className="text-zinc-400 text-sm">
            Sua assinatura foi registrada digitalmente em{" "}
            {new Date(contract.signedAt!).toLocaleDateString("pt-BR", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
            .
          </p>
        </div>
      ) : isSent && embedSrc ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-zinc-800 flex items-center gap-2">
            <PenLine size={16} className="text-[#d4a017]" />
            <h2 className="text-white font-bold text-sm">Assinar Contrato</h2>
          </div>
          <div className="p-2">
            <iframe
              src={embedSrc}
              className="w-full rounded-xl"
              style={{ height: "680px", border: "none" }}
              allow="camera"
              title="Assinar Contrato"
            />
          </div>
          <div className="px-6 py-3 border-t border-zinc-800">
            <p className="text-zinc-600 text-xs text-center">
              Assinatura digital segura via DocuSeal · O contrato será registrado automaticamente após a assinatura.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center flex flex-col items-center">
          <AlertCircle size={40} className="text-zinc-600 mb-3" />
          <h2 className="text-white font-bold text-lg mb-1">Aguardando envio</h2>
          <p className="text-zinc-500 text-sm max-w-sm">
            A locadora ainda não enviou este contrato para assinatura. Entre em contato caso precise assinar com urgência.
          </p>
        </div>
      )}
    </div>
  )
}
