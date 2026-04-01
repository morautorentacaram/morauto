"use client"
import { useState } from "react"
import { Copy, Check } from "lucide-react"

interface Props {
  text: string
  label?: string
  className?: string
}

export default function CopyButton({ text, label = "Copiar", className = "" }: Props) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      // Fallback for older browsers / http
      const ta = document.createElement("textarea")
      ta.value = text
      ta.style.position = "fixed"
      ta.style.opacity = "0"
      document.body.appendChild(ta)
      ta.focus()
      ta.select()
      document.execCommand("copy")
      document.body.removeChild(ta)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  return (
    <button
      onClick={handleCopy}
      className={`flex items-center gap-1.5 transition-all active:scale-95 ${className}`}
    >
      {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
      <span>{copied ? "Copiado!" : label}</span>
    </button>
  )
}
