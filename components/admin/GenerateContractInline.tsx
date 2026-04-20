"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { FileText, Loader2 } from "lucide-react"
import { generateRentalContract } from "@/app/actions/contract.actions"

export default function GenerateContractInline({ reservationId }: { reservationId: string }) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleClick() {
    startTransition(async () => {
      const res = await generateRentalContract(reservationId)
      if (res?.error) {
        alert(res.error)
      } else if (res?.contractId) {
        router.push(`/admin/contratos/${res.contractId}`)
      } else {
        router.refresh()
      }
    })
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className="inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 px-2 py-1 rounded-lg transition-colors disabled:opacity-50"
    >
      {isPending ? <Loader2 size={11} className="animate-spin" /> : <FileText size={11} />}
      Gerar
    </button>
  )
}
