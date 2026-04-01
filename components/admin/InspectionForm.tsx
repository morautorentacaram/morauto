"use client"

import { useRef, useState } from "react"
import { createInspection } from "@/app/actions/inspection.actions"
import { ClipboardCheck, Plus, Camera, ImagePlus, X, Loader2 } from "lucide-react"
import Image from "next/image"

type Contract = {
  id: string
  number: string
  reservation: {
    vehicle: { id: string; brand: string; model: string; plate: string; km: number }
    customer: { user: { name: string | null } }
  }
}

const checklistItems = [
  { key: "tiresOk",     label: "Pneus" },
  { key: "lightsOk",    label: "Faróis/Lanternas" },
  { key: "wiperOk",     label: "Limpadores" },
  { key: "windowsOk",   label: "Vidros" },
  { key: "bodyOk",      label: "Lataria" },
  { key: "interiorOk",  label: "Interior" },
  { key: "documentsOk", label: "Documentos" },
  { key: "spareTireOk", label: "Estepe" },
  { key: "jackOk",      label: "Macaco" },
]

export default function InspectionForm({ contracts }: { contracts: Contract[] }) {
  const formRef        = useRef<HTMLFormElement>(null)
  const fileInputRef   = useRef<HTMLInputElement>(null)   // galeria
  const cameraInputRef = useRef<HTMLInputElement>(null)   // câmera

  const [error, setError]                   = useState("")
  const [success, setSuccess]               = useState(false)
  const [loading, setLoading]               = useState(false)
  const [uploading, setUploading]           = useState(false)
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null)
  const [checklist, setChecklist]           = useState<Record<string, boolean>>(
    Object.fromEntries(checklistItems.map((i) => [i.key, true]))
  )
  const [photos, setPhotos]   = useState<string[]>([])   // uploaded URLs
  const [fuelLevel, setFuelLevel] = useState(100)

  function handleContractChange(id: string) {
    setSelectedContract(contracts.find((c) => c.id === id) ?? null)
  }

  // Upload one or more files to /api/upload
  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return
    setUploading(true)
    const uploaded: string[] = []
    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) continue
      const fd = new FormData()
      fd.append("file", file)
      try {
        const res  = await fetch("/api/upload", { method: "POST", body: fd })
        const data = await res.json()
        if (data.url) uploaded.push(data.url)
      } catch {
        // skip failed uploads silently
      }
    }
    setPhotos((prev) => [...prev, ...uploaded])
    setUploading(false)
  }

  function removePhoto(url: string) {
    setPhotos((prev) => prev.filter((p) => p !== url))
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess(false)
    const fd = new FormData(e.currentTarget)
    for (const [key, value] of Object.entries(checklist)) fd.set(key, String(value))
    if (selectedContract) fd.set("vehicleId", selectedContract.reservation.vehicle.id)
    fd.set("fuelLevel", String(fuelLevel))
    fd.set("photos", photos.join(","))

    const result = await createInspection(fd)
    setLoading(false)
    if (result?.error) {
      setError(result.error)
    } else {
      setSuccess(true)
      formRef.current?.reset()
      setSelectedContract(null)
      setChecklist(Object.fromEntries(checklistItems.map((i) => [i.key, true])))
      setPhotos([])
      setFuelLevel(100)
      setTimeout(() => setSuccess(false), 3000)
    }
  }

  const inp = "w-full bg-zinc-950 border border-zinc-700 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-[#d4a017]"

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
          <ClipboardCheck className="w-5 h-5 text-emerald-400" />
        </div>
        <div>
          <h3 className="text-white font-semibold">Nova Vistoria</h3>
          <p className="text-zinc-500 text-xs">Retirada ou devolução</p>
        </div>
      </div>

      <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">

        {/* Contrato */}
        <div>
          <label className="text-zinc-400 text-xs font-medium uppercase tracking-wider block mb-1">Contrato *</label>
          <select name="contractId" required onChange={(e) => handleContractChange(e.target.value)} className={inp}>
            <option value="">Selecione o contrato...</option>
            {contracts.map((c) => (
              <option key={c.id} value={c.id}>
                {c.number} — {c.reservation.vehicle.plate} ({c.reservation.customer.user.name})
              </option>
            ))}
          </select>
        </div>

        {selectedContract && (
          <div className="bg-zinc-950/50 border border-zinc-700/50 rounded-lg p-3 text-sm">
            <p className="text-zinc-300">{selectedContract.reservation.vehicle.brand} {selectedContract.reservation.vehicle.model}</p>
            <p className="text-zinc-500 text-xs">KM atual: {selectedContract.reservation.vehicle.km.toLocaleString("pt-BR")}</p>
          </div>
        )}

        {/* Tipo + KM */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-zinc-400 text-xs font-medium uppercase tracking-wider block mb-1">Tipo *</label>
            <select name="type" required className={inp}>
              <option value="DEPARTURE">Retirada</option>
              <option value="RETURN">Devolução</option>
            </select>
          </div>
          <div>
            <label className="text-zinc-400 text-xs font-medium uppercase tracking-wider block mb-1">KM *</label>
            <input name="km" type="number" required placeholder="Ex: 45230" className={inp} />
          </div>
        </div>

        {/* Combustível */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-zinc-400 text-xs font-medium uppercase tracking-wider">Nível Combustível</label>
            <span className="text-[#d4a017] text-sm font-bold">{fuelLevel}%</span>
          </div>
          <input
            type="range" min={0} max={100} step={5}
            value={fuelLevel}
            onChange={(e) => setFuelLevel(Number(e.target.value))}
            className="w-full accent-[#d4a017]"
          />
          <div className="flex justify-between text-zinc-600 text-xs mt-1">
            <span>0%</span><span>25%</span><span>50%</span><span>75%</span><span>100%</span>
          </div>
        </div>

        {/* Vistoriador */}
        <div>
          <label className="text-zinc-400 text-xs font-medium uppercase tracking-wider block mb-1">Vistoriador *</label>
          <input name="inspectorName" required placeholder="Nome do vistoriador" className={inp} />
        </div>

        {/* Checklist */}
        <div>
          <label className="text-zinc-400 text-xs font-medium uppercase tracking-wider block mb-2">Checklist</label>
          <div className="grid grid-cols-3 gap-2">
            {checklistItems.map((item) => (
              <label key={item.key} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={checklist[item.key]}
                  onChange={(e) => setChecklist((prev) => ({ ...prev, [item.key]: e.target.checked }))}
                  className="w-4 h-4 accent-[#d4a017]"
                />
                <span className={`text-xs ${checklist[item.key] ? "text-zinc-300" : "text-red-400 font-semibold"}`}>
                  {item.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Observações */}
        <div>
          <label className="text-zinc-400 text-xs font-medium uppercase tracking-wider block mb-1">Observações</label>
          <textarea name="observations" rows={2} placeholder="Avarias, riscos, observações..."
            className={inp + " resize-none"} />
        </div>

        {/* ── Fotos ── */}
        <div>
          <label className="text-zinc-400 text-xs font-medium uppercase tracking-wider block mb-2">
            Fotos da Vistoria
          </label>

          {/* Botões de captura */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            {/* Câmera — abre câmera nativa no mobile */}
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white text-sm font-medium py-2.5 rounded-xl transition-colors disabled:opacity-50"
            >
              <Camera size={16} className="text-[#d4a017]" />
              Câmera
            </button>

            {/* Galeria */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white text-sm font-medium py-2.5 rounded-xl transition-colors disabled:opacity-50"
            >
              <ImagePlus size={16} className="text-[#d4a017]" />
              Galeria
            </button>
          </div>

          {/* Inputs ocultos */}
          {/* capture="environment" abre câmera traseira no mobile */}
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
          {/* sem capture = galeria + câmera como opção no mobile */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />

          {/* Uploading indicator */}
          {uploading && (
            <div className="flex items-center gap-2 text-zinc-400 text-xs py-2">
              <Loader2 size={14} className="animate-spin text-[#d4a017]" />
              Enviando fotos...
            </div>
          )}

          {/* Preview grid */}
          {photos.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mt-2">
              {photos.map((url, i) => (
                <div key={url} className="relative group aspect-square rounded-xl overflow-hidden border border-zinc-700">
                  <Image src={url} alt={`Foto ${i + 1}`} fill className="object-cover" />
                  <button
                    type="button"
                    onClick={() => removePhoto(url)}
                    className="absolute top-1 right-1 w-6 h-6 bg-black/70 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={12} className="text-white" />
                  </button>
                  {i === 0 && (
                    <span className="absolute bottom-1 left-1 bg-[#d4a017] text-black text-[9px] font-bold px-1.5 py-0.5 rounded">
                      CAPA
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}

          {photos.length === 0 && !uploading && (
            <p className="text-zinc-600 text-xs text-center py-3 border border-dashed border-zinc-800 rounded-xl">
              Nenhuma foto adicionada
            </p>
          )}
        </div>

        {error   && <p className="text-red-400 text-sm bg-red-900/20 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>}
        {success && <p className="text-emerald-400 text-sm bg-emerald-900/20 border border-emerald-500/20 rounded-lg px-3 py-2">Vistoria registrada com sucesso!</p>}

        <button
          type="submit"
          disabled={loading || uploading}
          className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl transition-colors"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={18} />}
          {loading ? "Registrando..." : "Registrar Vistoria"}
        </button>
      </form>
    </div>
  )
}
