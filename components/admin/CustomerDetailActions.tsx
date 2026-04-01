"use client"

import { useState } from "react"
import { Pencil } from "lucide-react"
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
}

export default function CustomerDetailActions({ customer }: { customer: Customer }) {
  const [showEdit, setShowEdit] = useState(false)

  return (
    <>
      <button
        onClick={() => setShowEdit(true)}
        className="w-full flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors"
      >
        <Pencil size={14} /> Editar Dados e Documentos
      </button>

      {showEdit && (
        <CustomerEditModal customer={customer} onClose={() => setShowEdit(false)} />
      )}
    </>
  )
}
