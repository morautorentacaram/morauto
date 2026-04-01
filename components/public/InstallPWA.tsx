"use client"
import { useEffect, useState } from "react"
import { X } from "lucide-react"

export default function InstallPWA() {
  const [prompt, setPrompt] = useState<any>(null)
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (localStorage.getItem("pwa_installed")) return
    const dismissed = localStorage.getItem("pwa_dismissed")
    if (dismissed && Date.now() - Number(dismissed) < 7 * 86400000) return

    const handler = (e: any) => { e.preventDefault(); setPrompt(e); setShow(true) }
    window.addEventListener("beforeinstallprompt", handler)
    return () => window.removeEventListener("beforeinstallprompt", handler)
  }, [])

  async function install() {
    if (!prompt) return
    prompt.prompt()
    const { outcome } = await prompt.userChoice
    if (outcome === "accepted") localStorage.setItem("pwa_installed", "1")
    setShow(false)
  }

  function dismiss() {
    localStorage.setItem("pwa_dismissed", String(Date.now()))
    setShow(false)
  }

  if (!show) return null

  return (
    <div className="fixed bottom-16 md:bottom-4 left-4 right-4 z-50 bg-zinc-900 border border-[#d4a017]/40 rounded-2xl p-4 shadow-2xl flex items-center gap-3 md:max-w-sm md:left-auto md:right-4">
      <div className="w-10 h-10 rounded-xl bg-[#d4a017] flex items-center justify-center flex-shrink-0">
        <span className="text-black font-black text-sm">M</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white font-semibold text-sm">Instalar Morauto</p>
        <p className="text-zinc-400 text-xs">Acesse offline e mais rápido</p>
      </div>
      <button onClick={install} className="bg-[#d4a017] text-black font-bold text-xs px-3 py-1.5 rounded-lg flex-shrink-0">Instalar</button>
      <button onClick={dismiss} className="text-zinc-500 hover:text-white flex-shrink-0"><X size={16} /></button>
    </div>
  )
}
