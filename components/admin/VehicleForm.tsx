"use client"

import { useState, useRef } from "react"
import { createVehicle, updateVehicle } from "@/app/actions/vehicle.actions"
import { useRouter } from "next/navigation"
import { ImagePlus, X, Loader2, Upload } from "lucide-react"
import Image from "next/image"

type Vehicle = {
  id: string
  brand: string
  model: string
  version?: string | null
  year: number
  plate: string
  renavam: string
  chassi: string
  color: string
  km: number
  fuelType: string
  transmission: string
  categoryId: string
  status: string
  photos: string[]
}

type Props = {
  categories: any[]
  vehicle?: Vehicle
  onSuccess?: () => void
}

const inputCls = "w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#d4a017]"

export default function VehicleForm({ categories, vehicle, onSuccess }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [photos, setPhotos] = useState<string[]>(vehicle?.photos ?? [])
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const router = useRouter()
  const isEditing = !!vehicle

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    if (photos.length + files.length > 6) {
      setError("Máximo de 6 fotos por veículo.")
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

  function removePhoto(url: string) {
    setPhotos((prev) => prev.filter((p) => p !== url))
  }

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError("")
    formData.set("photos", photos.join(","))
    const res = isEditing
      ? await updateVehicle(vehicle.id, formData)
      : await createVehicle(formData)

    if (res?.error) {
      setError(res.error)
      setLoading(false)
    } else {
      router.refresh()
      setLoading(false)
      if (onSuccess) {
        onSuccess()
      } else {
        setPhotos([])
        formRef.current?.reset()
      }
    }
  }

  return (
    <form id="vehicle-form" ref={formRef} action={handleSubmit} className="space-y-4 bg-zinc-900 border border-zinc-800 p-6 rounded-xl">
      <h3 className="text-xl font-bold font-outfit text-white mb-4">
        {isEditing ? "Editar Veículo" : "Cadastrar Veículo"}
      </h3>

      {error && <div className="text-red-400 text-sm bg-red-900/20 p-3 rounded-lg border border-red-900/50">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm text-zinc-400 font-medium">Marca *</label>
          <input name="brand" required defaultValue={vehicle?.brand} placeholder="Ex: Volkswagen" className={inputCls} />
        </div>
        <div className="space-y-2">
          <label className="text-sm text-zinc-400 font-medium">Modelo *</label>
          <input name="model" required defaultValue={vehicle?.model} placeholder="Ex: Polo" className={inputCls} />
        </div>
        <div className="space-y-2">
          <label className="text-sm text-zinc-400 font-medium">Versão</label>
          <input name="version" defaultValue={vehicle?.version ?? ""} placeholder="Ex: 1.0 MPI" className={inputCls} />
        </div>
        <div className="space-y-2">
          <label className="text-sm text-zinc-400 font-medium">Categoria *</label>
          <select name="categoryId" required defaultValue={vehicle?.categoryId} className={inputCls}>
            <option value="">Selecione...</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm text-zinc-400 font-medium">Placa *</label>
          <input name="plate" required defaultValue={vehicle?.plate} placeholder="ABC1D23" className={inputCls + " uppercase"} />
        </div>
        <div className="space-y-2">
          <label className="text-sm text-zinc-400 font-medium">Ano *</label>
          <input name="year" type="number" required defaultValue={vehicle?.year} placeholder="2024" className={inputCls} />
        </div>
        <div className="space-y-2">
          <label className="text-sm text-zinc-400 font-medium">Renavam *</label>
          <input name="renavam" required defaultValue={vehicle?.renavam} className={inputCls} />
        </div>
        <div className="space-y-2">
          <label className="text-sm text-zinc-400 font-medium">Chassi *</label>
          <input name="chassi" required defaultValue={vehicle?.chassi} className={inputCls + " uppercase"} />
        </div>
        <div className="space-y-2">
          <label className="text-sm text-zinc-400 font-medium">Cor *</label>
          <input name="color" required defaultValue={vehicle?.color} placeholder="Ex: Prata" className={inputCls} />
        </div>
        <div className="space-y-2">
          <label className="text-sm text-zinc-400 font-medium">Quilometragem</label>
          <input name="km" type="number" defaultValue={vehicle?.km ?? 0} className={inputCls} />
        </div>
        <div className="space-y-2">
          <label className="text-sm text-zinc-400 font-medium">Combustível *</label>
          <select name="fuelType" required defaultValue={vehicle?.fuelType ?? "FLEX"} className={inputCls}>
            <option value="FLEX">Flex</option>
            <option value="GASOLINA">Gasolina</option>
            <option value="DIESEL">Diesel</option>
            <option value="ELETRICO">Elétrico</option>
            <option value="HIBRIDO">Híbrido</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm text-zinc-400 font-medium">Transmissão *</label>
          <select name="transmission" required defaultValue={vehicle?.transmission ?? "MANUAL"} className={inputCls}>
            <option value="MANUAL">Manual</option>
            <option value="AUTOMATICO">Automático</option>
          </select>
        </div>
        {isEditing && (
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm text-zinc-400 font-medium">Status</label>
            <select name="status" defaultValue={vehicle?.status} className={inputCls}>
              <option value="AVAILABLE">Disponível</option>
              <option value="RESERVED">Reservado</option>
              <option value="RENTED">Alugado</option>
              <option value="MAINTENANCE">Em Manutenção</option>
              <option value="UNAVAILABLE">Indisponível</option>
              <option value="BLOCKED">Bloqueado</option>
              <option value="SOLD">Vendido</option>
            </select>
          </div>
        )}
      </div>

      {/* Photo upload */}
      <div className="space-y-3 pt-2">
        <label className="text-sm text-zinc-400 font-medium">Fotos do Veículo</label>

        {photos.length > 0 && (
          <div className="grid grid-cols-3 gap-2">
            {photos.map((url, i) => (
              <div key={url} className="relative group aspect-video rounded-lg overflow-hidden border border-zinc-700">
                <Image src={url} alt={`Foto ${i + 1}`} fill className="object-cover" unoptimized />
                {i === 0 && (
                  <span className="absolute top-1 left-1 bg-[#d4a017] text-black text-[10px] font-bold px-1.5 py-0.5 rounded">CAPA</span>
                )}
                <button
                  type="button"
                  onClick={() => removePhoto(url)}
                  className="absolute top-1 right-1 bg-black/60 hover:bg-red-600 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}

        {photos.length < 6 && (
          <label className={`flex items-center justify-center gap-2 w-full border-2 border-dashed rounded-xl py-4 cursor-pointer transition-colors text-sm font-medium
            ${uploading ? "border-zinc-700 text-zinc-600" : "border-zinc-700 hover:border-[#d4a017] text-zinc-400 hover:text-[#d4a017]"}`}>
            {uploading ? (
              <><Loader2 size={16} className="animate-spin" /> Enviando...</>
            ) : (
              <><ImagePlus size={16} /> Adicionar fotos ({photos.length}/6)</>
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
        <p className="text-zinc-600 text-xs">JPG, PNG ou WebP · máx. 5MB por foto · primeira foto = capa</p>
      </div>

      <button
        type="submit"
        disabled={loading || uploading}
        className="w-full py-3 bg-[#d4a017] hover:bg-[#b8860b] text-black font-bold rounded-lg transition-colors mt-2 disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {loading
          ? <><Loader2 size={16} className="animate-spin" /> Salvando...</>
          : isEditing
          ? <><Upload size={16} /> Salvar Alterações</>
          : <><Upload size={16} /> Cadastrar na Frota</>}
      </button>
    </form>
  )
}
