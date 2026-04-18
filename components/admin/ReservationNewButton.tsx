"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import ReservationNewModal from "./ReservationNewModal"

type Customer = { id: string; document: string; user: { name: string | null } }
type Vehicle  = { id: string; brand: string; model: string; plate: string; dailyRate?: any; category: { name: string; dailyRate: any } }

export default function ReservationNewButton({
  customers,
  vehicles,
}: {
  customers: Customer[]
  vehicles:  Vehicle[]
}) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 bg-[#d4a017] hover:bg-[#b8860b] text-black font-bold px-4 py-2.5 rounded-xl text-sm transition-colors"
      >
        <Plus size={16} /> Nova Reserva
      </button>

      {open && (
        <ReservationNewModal
          customers={customers}
          vehicles={vehicles}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  )
}
