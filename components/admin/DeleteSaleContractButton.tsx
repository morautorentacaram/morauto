"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { Trash2, Loader2 } from "lucide-react"
import { deleteSaleContract } from "@/app/actions/sale.actions"

export default function DeleteSaleContractButton({ contractId }: { contractId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    if (!confirm("Excluir este contrato? O veículo voltará para disponível.")) return
    setLoading(true)
    const result = await deleteSaleContract(contractId)
    if (result.success) {
      router.push("/admin/vendas/contratos")
    } else {
      alert(result.error ?? "Erro ao excluir contrato.")
      setLoading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={loading}
      className="flex items-center gap-2 px-4 py-2 bg-red-700 hover:bg-red-600 disabled:opacity-60 text-white font-bold rounded-xl text-sm transition-colors"
    >
      {loading ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
      Excluir
    </button>
  )
}
