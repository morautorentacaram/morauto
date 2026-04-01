"use client"

import { useState, useTransition } from "react"
import { deleteCustomer } from "@/app/actions/customer.actions"
import { useRouter } from "next/navigation"
import { Pencil, Trash2, Loader2, MessageCircle } from "lucide-react"
import CustomerEditModal from "./CustomerEditModal"

type Customer = {
  id: string
  type: string
  phone: string | null
  document: string
  cnh: string | null
  cnhExpiration: Date | null
  cnhUrl?: string | null
  addressProofUrl?: string | null
  user: { name: string | null; email: string | null }
  _count: { reservations: number }
}

function toWhatsApp(phone: string | null): string | null {
  if (!phone) return null
  const digits = phone.replace(/\D/g, "")
  if (digits.length < 10) return null
  const withCountry = digits.startsWith("55") ? digits : `55${digits}`
  return `https://wa.me/${withCountry}`
}

export default function CustomerActions({ customer }: { customer: Customer }) {
  const [showEdit, setShowEdit] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleDelete() {
    startTransition(async () => {
      await deleteCustomer(customer.id)
      router.refresh()
      setShowConfirm(false)
    })
  }

  const waUrl = toWhatsApp(customer.phone)

  return (
    <>
      <div className="flex items-center justify-end gap-1">
        {waUrl && (
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            title={`WhatsApp ${customer.phone}`}
            className="text-zinc-400 hover:text-emerald-400 p-1.5 rounded hover:bg-emerald-900/20 transition-colors"
          >
            <MessageCircle size={14} />
          </a>
        )}
        <button
          onClick={() => setShowEdit(true)}
          title="Editar"
          className="text-zinc-400 hover:text-[#d4a017] p-1.5 rounded hover:bg-[#d4a017]/10 transition-colors"
        >
          <Pencil size={14} />
        </button>

        <button
          onClick={() => setShowConfirm(true)}
          title={customer._count.reservations > 0 ? "Possui reservas — não pode excluir" : "Excluir"}
          disabled={customer._count.reservations > 0}
          className="text-zinc-400 hover:text-red-400 p-1.5 rounded hover:bg-red-900/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <Trash2 size={14} />
        </button>
      </div>

      {/* Edit modal */}
      {showEdit && (
        <CustomerEditModal customer={customer} onClose={() => setShowEdit(false)} />
      )}

      {/* Delete confirm */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-sm p-6 shadow-2xl space-y-4">
            <h3 className="text-white font-bold text-lg">Excluir cliente?</h3>
            <p className="text-zinc-400 text-sm">
              <strong className="text-white">{customer.user.name}</strong> será removido permanentemente. Esta ação não pode ser desfeita.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-zinc-700 text-zinc-400 hover:text-white text-sm font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={isPending}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {isPending ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
