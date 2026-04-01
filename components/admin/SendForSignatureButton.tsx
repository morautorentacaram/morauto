"use client"

import { useState } from "react"
import { sendContractForSignature } from "@/app/actions/contract.actions"
import { Send, Loader2, CheckCircle } from "lucide-react"

interface Props {
  contractId: string
  isSent: boolean
  isSigned: boolean
}

export default function SendForSignatureButton({ contractId, isSent, isSigned }: Props) {
  const [loading, setLoading] = useState(false)
  const [done, setDone]       = useState(false)
  const [error, setError]     = useState<string | null>(null)

  if (isSigned) return null

  if (isSent) {
    return (
      <span className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-blue-400 bg-blue-400/10 border border-blue-400/20">
        <Send size={14} /> Aguardando assinatura
      </span>
    )
  }

  async function handleSend() {
    setLoading(true)
    setError(null)
    const result = await sendContractForSignature(contractId)
    setLoading(false)
    if (result.error) {
      setError(result.error)
    } else {
      setDone(true)
    }
  }

  if (done) {
    return (
      <span className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-emerald-400 bg-emerald-400/10 border border-emerald-400/20">
        <CheckCircle size={14} /> Enviado para assinatura
      </span>
    )
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={handleSend}
        disabled={loading}
        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-[#d4a017] hover:bg-[#b8860b] text-black transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
        {loading ? "Enviando…" : "Enviar para Assinatura"}
      </button>
      {error && <p className="text-red-400 text-xs">{error}</p>}
    </div>
  )
}
