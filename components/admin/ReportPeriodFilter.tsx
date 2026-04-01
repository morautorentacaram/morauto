"use client"

import { useState } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { Calendar, ChevronDown } from "lucide-react"

const PRESETS = [
  { label: "Este mês",       value: "this_month" },
  { label: "Mês passado",    value: "last_month" },
  { label: "Últimos 3 meses",value: "last_3_months" },
  { label: "Últimos 6 meses",value: "last_6_months" },
  { label: "Este ano",       value: "this_year" },
  { label: "Ano passado",    value: "last_year" },
  { label: "Todo o período", value: "all" },
  { label: "Personalizado",  value: "custom" },
]

export default function ReportPeriodFilter({
  currentPreset,
  currentStart,
  currentEnd,
}: {
  currentPreset: string
  currentStart: string
  currentEnd: string
}) {
  const router     = useRouter()
  const pathname   = usePathname()
  const sp         = useSearchParams()
  const [preset, setPreset] = useState(currentPreset)
  const [start,  setStart]  = useState(currentStart)
  const [end,    setEnd]    = useState(currentEnd)
  const [open,   setOpen]   = useState(false)

  function apply(p: string, s?: string, e?: string) {
    const params = new URLSearchParams(sp.toString())
    params.set("period", p)
    if (p === "custom" && s && e) {
      params.set("start", s)
      params.set("end",   e)
    } else {
      params.delete("start")
      params.delete("end")
    }
    router.push(`${pathname}?${params.toString()}`)
    setOpen(false)
  }

  const label = PRESETS.find((p) => p.value === preset)?.label ?? "Período"

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
      >
        <Calendar size={15} className="text-zinc-400" />
        {label}
        <ChevronDown size={14} className={`text-zinc-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 z-50 bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl w-72 p-4 space-y-1">
          {PRESETS.filter((p) => p.value !== "custom").map((p) => (
            <button
              key={p.value}
              onClick={() => { setPreset(p.value); apply(p.value) }}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                preset === p.value
                  ? "bg-[#d4a017]/20 text-[#d4a017] font-semibold"
                  : "text-zinc-300 hover:bg-zinc-800"
              }`}
            >
              {p.label}
            </button>
          ))}

          {/* Custom range */}
          <div className="border-t border-zinc-800 pt-3 mt-2 space-y-2">
            <p className="text-zinc-500 text-xs uppercase tracking-wider px-1">Personalizado</p>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-zinc-500 text-xs px-1">De</label>
                <input
                  type="date"
                  value={start}
                  onChange={(e) => setStart(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-700 text-white px-2 py-1.5 rounded-lg text-xs focus:outline-none focus:border-[#d4a017]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-zinc-500 text-xs px-1">Até</label>
                <input
                  type="date"
                  value={end}
                  onChange={(e) => setEnd(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-700 text-white px-2 py-1.5 rounded-lg text-xs focus:outline-none focus:border-[#d4a017]"
                />
              </div>
            </div>
            <button
              onClick={() => { setPreset("custom"); apply("custom", start, end) }}
              disabled={!start || !end}
              className="w-full py-2 bg-[#d4a017] hover:bg-[#b8860b] text-black font-bold rounded-lg text-sm transition-colors disabled:opacity-40"
            >
              Aplicar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
