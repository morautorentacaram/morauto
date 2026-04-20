"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { FilePlus, Loader2 } from "lucide-react"
import { generateRentalContract } from "@/app/actions/contract.actions"

export default function GenerateContractButton({ reservationId }: { reservationId: string }) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState("")
  const router = useRouter()

  function handleClick() {
    setError("")
    startTransition(async () => {
      const res = await generateRentalContract(reservationId)
      if (res?.error) {
        setError(res.error)
      } else if (res?.contractId) {
        router.push(`/admin/contratos/${res.contractId}`)
      } else {
        router.refresh()
      }
    })
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        className="flex items-center gap-2 bg-[#d4a017] hover:bg-[#b8880f] text-black font-semibold px-4 py-2 rounded-lg text-sm transition-colors disabled:opacity-60"
      >
        {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <FilePlus className="w-4 h-4" />}
        Gerar Contrato
      </button>
      {error && (
        <div className="text-red-400 text-xs bg-red-900/30 border border-red-900/50 px-3 py-2 rounded-lg max-w-sm">
          {error}
        </div>
      )}
    </div>
  )
}
