"use client"

import { useRef, useState } from "react"
import { createFine } from "@/app/actions/fine.actions"
import { AlertTriangle, Plus, ImagePlus, X, Loader2 } from "lucide-react"
import Image from "next/image"

type Vehicle = { id: string; brand: string; model: string; plate: string }
type Reservation = { id: string; vehicle: { plate: string }; customer: { user: { name: string | null } } }

export default function FineForm({ vehicles, reservations }: { vehicles: Vehicle[]; reservations: Reservation[] }) {
  const formRef = useRef<HTMLFormElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [photos, setPhotos] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    if (photos.length + files.length > 8) {
      setError("Máximo de 8 fotos por multa.")
      return
    }
    setUploading(true)
    setError("")
    const uploaded: string[] = []
    for (const file of files) {
      const fd = new FormData()
      fd.append("file", file)
      const res = await fetch("/api/upload", { method: "POST", body: fd })
      const data = await res.json()
      if (data.url) uploaded.push(data.url)
      else setError(data.error ?? "Erro ao enviar foto.")
    }
    setPhotos((prev) => [...prev, ...uploaded])
    setUploading(false)
    if (fileRef.current) fileRef.current.value = ""
  }

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError("")
    setSuccess(false)
    formData.set("photos", photos.join(","))
    const result = await createFine(formData)
    setLoading(false)
    if (result?.error) setError(result.error)
    else {
      setSuccess(true)
      setPhotos([])
      formRef.current?.reset()
      setTimeout(() => setSuccess(false), 3000)
    }
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
          <AlertTriangle className="w-5 h-5 text-red-400" />
        </div>
        <div>
          <h3 className="text-white font-semibold">Cadastrar Multa</h3>
          <p className="text-zinc-500 text-xs">Infração de trânsito</p>
        </div>
      </div>

      <form ref={formRef} action={handleSubmit} className="space-y-4">
        <div>
          <label className="text-zinc-400 text-xs font-medium uppercase tracking-wider block mb-1">Veículo *</label>
          <select name="vehicleId" required className="w-full bg-zinc-950 border border-zinc-700 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-[#d4a017]">
            <option value="">Selecione...</option>
            {vehicles.map((v) => (
              <option key={v.id} value={v.id}>{v.brand} {v.model} — {v.plate}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-zinc-400 text-xs font-medium uppercase tracking-wider block mb-1">Data *</label>
            <input name="date" type="date" required className="w-full bg-zinc-950 border border-zinc-700 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-[#d4a017]" />
          </div>
          <div>
            <label className="text-zinc-400 text-xs font-medium uppercase tracking-wider block mb-1">Valor (R$) *</label>
            <input name="amount" type="number" step="0.01" required placeholder="0,00" className="w-full bg-zinc-950 border border-zinc-700 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-[#d4a017]" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-zinc-400 text-xs font-medium uppercase tracking-wider block mb-1">Código *</label>
            <input name="infractionCode" required placeholder="Ex: 55411" className="w-full bg-zinc-950 border border-zinc-700 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-[#d4a017]" />
          </div>
          <div>
            <label className="text-zinc-400 text-xs font-medium uppercase tracking-wider block mb-1">Órgão Emissor</label>
            <input name="agencyName" placeholder="Ex: DETRAN-SP" className="w-full bg-zinc-950 border border-zinc-700 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-[#d4a017]" />
          </div>
        </div>

        <div>
          <label className="text-zinc-400 text-xs font-medium uppercase tracking-wider block mb-1">Descrição *</label>
          <input name="description" required placeholder="Ex: Excesso de velocidade" className="w-full bg-zinc-950 border border-zinc-700 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-[#d4a017]" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-zinc-400 text-xs font-medium uppercase tracking-wider block mb-1">Local</label>
            <input name="location" placeholder="Rua, rodovia..." className="w-full bg-zinc-950 border border-zinc-700 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-[#d4a017]" />
          </div>
          <div>
            <label className="text-zinc-400 text-xs font-medium uppercase tracking-wider block mb-1">Condutor</label>
            <input name="conductorName" placeholder="Nome do condutor" className="w-full bg-zinc-950 border border-zinc-700 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-[#d4a017]" />
          </div>
        </div>

        <div>
          <label className="text-zinc-400 text-xs font-medium uppercase tracking-wider block mb-1">Vincular à Reserva</label>
          <select name="reservationId" className="w-full bg-zinc-950 border border-zinc-700 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-[#d4a017]">
            <option value="">Sem vínculo</option>
            {reservations.map((r) => (
              <option key={r.id} value={r.id}>{r.vehicle.plate} — {r.customer.user.name}</option>
            ))}
          </select>
        </div>

        {/* Galeria de fotos */}
        <div>
          <label className="text-zinc-400 text-xs font-medium uppercase tracking-wider block mb-2">Fotos / Evidências</label>

          {photos.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mb-2">
              {photos.map((url, i) => (
                <div key={url} className="relative group aspect-video rounded-lg overflow-hidden border border-zinc-700">
                  <Image src={url} alt={`Foto ${i + 1}`} fill className="object-cover" unoptimized />
                  <button
                    type="button"
                    onClick={() => setPhotos((prev) => prev.filter((p) => p !== url))}
                    className="absolute top-1 right-1 bg-black/60 hover:bg-red-600 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {photos.length < 8 && (
            <label className={`flex items-center justify-center gap-2 w-full border-2 border-dashed rounded-xl py-3 cursor-pointer transition-colors text-xs font-medium
              ${uploading ? "border-zinc-700 text-zinc-600" : "border-zinc-700 hover:border-red-500 text-zinc-400 hover:text-red-400"}`}>
              {uploading ? (
                <><Loader2 size={14} className="animate-spin" /> Enviando...</>
              ) : (
                <><ImagePlus size={14} /> Adicionar fotos ({photos.length}/8)</>
              )}
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                className="hidden"
                onChange={handlePhotoChange}
                disabled={uploading}
              />
            </label>
          )}
          <p className="text-zinc-600 text-xs mt-1">JPG, PNG ou WebP · máx. 5MB por foto</p>
        </div>

        {error && <p className="text-red-400 text-sm bg-red-900/20 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>}
        {success && <p className="text-emerald-400 text-sm bg-emerald-900/20 border border-emerald-500/20 rounded-lg px-3 py-2">Multa cadastrada com sucesso!</p>}

        <button type="submit" disabled={loading || uploading} className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl transition-colors">
          <Plus size={18} />
          {loading ? "Cadastrando..." : "Cadastrar Multa"}
        </button>
      </form>
    </div>
  )
}
