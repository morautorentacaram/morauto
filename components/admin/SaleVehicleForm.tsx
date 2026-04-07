"use client"

import { useState, useRef } from "react"
import { createSaleVehicle, updateSaleVehicle } from "@/app/actions/sale.actions"
import { useRouter } from "next/navigation"
import { ImagePlus, X, Loader2, Upload, Plus, Tag } from "lucide-react"
import Image from "next/image"

type Vehicle = {
  id: string
  brand: string
  model: string
  version?: string | null
  year: number
  plate?: string | null
  renavam?: string | null
  chassi?: string | null
  color: string
  km: number
  fuelType: string
  transmission: string
  doors: number
  seats: number
  price: any
  description?: string | null
  features: string[]
  photos: string[]
  highlighted: boolean
  status: string
}

export default function SaleVehicleForm({ vehicle }: { vehicle?: Vehicle }) {
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState("")
  const [photos, setPhotos]         = useState<string[]>(vehicle?.photos ?? [])
  const [uploading, setUploading]   = useState(false)
  const [features, setFeatures]     = useState<string[]>(vehicle?.features ?? [])
  const [featureInput, setFeatureInput] = useState("")
  const fileRef = useRef<HTMLInputElement>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const router  = useRouter()

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    if (photos.length + files.length > 8) {
      setError("Máximo de 8 fotos por veículo.")
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

  function addFeature() {
    const trimmed = featureInput.trim()
    if (!trimmed || features.includes(trimmed)) return
    setFeatures((prev) => [...prev, trimmed])
    setFeatureInput("")
  }

  function removeFeature(f: string) {
    setFeatures((prev) => prev.filter((x) => x !== f))
  }

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError("")
    formData.set("photos", photos.join(","))
    formData.set("features", features.join(","))

    let res: { success?: boolean; error?: string } | undefined
    if (vehicle) {
      res = await updateSaleVehicle(vehicle.id, formData)
    } else {
      res = await createSaleVehicle(formData)
    }

    if (res?.error) {
      setError(res.error)
      setLoading(false)
    } else {
      router.push("/admin/vendas")
    }
  }

  const inputCls = "w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#d4a017] placeholder-zinc-600 transition-colors"
  const labelCls = "text-sm text-zinc-400 font-medium"

  return (
    <form ref={formRef} action={handleSubmit} className="space-y-6 max-w-4xl">
      {error && (
        <div className="text-red-400 text-sm bg-red-900/20 p-3 rounded-lg border border-red-900/50">{error}</div>
      )}

      {/* Basic info */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
        <h3 className="text-lg font-bold text-white">Informações Básicas</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={labelCls}>Marca *</label>
            <input name="brand" required defaultValue={vehicle?.brand} placeholder="Ex: Toyota" className={inputCls} />
          </div>
          <div className="space-y-2">
            <label className={labelCls}>Modelo *</label>
            <input name="model" required defaultValue={vehicle?.model} placeholder="Ex: Corolla" className={inputCls} />
          </div>
          <div className="space-y-2">
            <label className={labelCls}>Versão</label>
            <input name="version" defaultValue={vehicle?.version ?? ""} placeholder="Ex: XEi 2.0" className={inputCls} />
          </div>
          <div className="space-y-2">
            <label className={labelCls}>Ano *</label>
            <input name="year" type="number" required defaultValue={vehicle?.year ?? new Date().getFullYear()} className={inputCls} />
          </div>
          <div className="space-y-2">
            <label className={labelCls}>Cor *</label>
            <input name="color" required defaultValue={vehicle?.color} placeholder="Ex: Prata" className={inputCls} />
          </div>
          <div className="space-y-2">
            <label className={labelCls}>Preço (R$) *</label>
            <input name="price" type="number" step="0.01" required defaultValue={vehicle ? Number(vehicle.price) : ""} placeholder="Ex: 45000.00" className={inputCls} />
          </div>
        </div>
      </div>

      {/* Documents */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
        <h3 className="text-lg font-bold text-white">Documentação</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className={labelCls}>Placa</label>
            <input name="plate" defaultValue={vehicle?.plate ?? ""} placeholder="ABC1D23" className={`${inputCls} uppercase`} />
          </div>
          <div className="space-y-2">
            <label className={labelCls}>RENAVAM</label>
            <input name="renavam" defaultValue={vehicle?.renavam ?? ""} className={inputCls} />
          </div>
          <div className="space-y-2">
            <label className={labelCls}>Chassi</label>
            <input name="chassi" defaultValue={vehicle?.chassi ?? ""} className={`${inputCls} uppercase`} />
          </div>
        </div>
      </div>

      {/* Technical specs */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
        <h3 className="text-lg font-bold text-white">Especificações Técnicas</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className={labelCls}>Quilometragem *</label>
            <input name="km" type="number" required defaultValue={vehicle?.km ?? 0} min={0} className={inputCls} />
          </div>
          <div className="space-y-2">
            <label className={labelCls}>Combustível *</label>
            <select name="fuelType" required defaultValue={vehicle?.fuelType ?? "FLEX"} className={inputCls}>
              <option value="Gasolina">Gasolina</option>
              <option value="Etanol">Etanol</option>
              <option value="FLEX">Flex</option>
              <option value="Diesel">Diesel</option>
              <option value="Elétrico">Elétrico</option>
              <option value="Híbrido">Híbrido</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className={labelCls}>Transmissão *</label>
            <select name="transmission" required defaultValue={vehicle?.transmission ?? "MANUAL"} className={inputCls}>
              <option value="MANUAL">Manual</option>
              <option value="AUTOMATICO">Automático</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className={labelCls}>Portas</label>
            <select name="doors" defaultValue={vehicle?.doors ?? 4} className={inputCls}>
              <option value={2}>2 portas</option>
              <option value={4}>4 portas</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className={labelCls}>Lugares</label>
            <input name="seats" type="number" defaultValue={vehicle?.seats ?? 5} min={2} max={9} className={inputCls} />
          </div>
          {vehicle && (
            <div className="space-y-2">
              <label className={labelCls}>Status</label>
              <select name="status" defaultValue={vehicle.status} className={inputCls}>
                <option value="AVAILABLE">Disponível</option>
                <option value="RESERVED">Reservado</option>
                <option value="SOLD">Vendido</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Features */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
        <h3 className="text-lg font-bold text-white">Opcionais / Itens</h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={featureInput}
            onChange={(e) => setFeatureInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addFeature() } }}
            placeholder="Ex: Ar-condicionado, Direção hidráulica..."
            className={`${inputCls} flex-1`}
          />
          <button
            type="button"
            onClick={addFeature}
            className="flex items-center gap-2 px-4 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg border border-zinc-700 transition-colors text-sm font-medium"
          >
            <Plus size={14} /> Adicionar
          </button>
        </div>
        {features.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {features.map((f) => (
              <span key={f} className="flex items-center gap-1.5 text-sm bg-zinc-800 border border-zinc-700 text-zinc-200 px-3 py-1.5 rounded-full">
                <Tag size={11} className="text-[#d4a017]" />
                {f}
                <button type="button" onClick={() => removeFeature(f)} className="text-zinc-500 hover:text-red-400 transition-colors ml-0.5">
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Description */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
        <h3 className="text-lg font-bold text-white">Descrição</h3>
        <textarea
          name="description"
          defaultValue={vehicle?.description ?? ""}
          rows={4}
          placeholder="Descreva o estado do veículo, histórico, diferenciais..."
          className={`${inputCls} resize-y`}
        />
      </div>

      {/* Photos */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
        <h3 className="text-lg font-bold text-white">Fotos</h3>

        {photos.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {photos.map((url, i) => (
              <div key={url} className="relative group aspect-video rounded-xl overflow-hidden border border-zinc-700">
                <Image src={url} alt={`Foto ${i + 1}`} fill className="object-cover" unoptimized />
                {i === 0 && (
                  <span className="absolute top-1.5 left-1.5 bg-[#d4a017] text-black text-[10px] font-bold px-1.5 py-0.5 rounded">CAPA</span>
                )}
                <button
                  type="button"
                  onClick={() => removePhoto(url)}
                  className="absolute top-1.5 right-1.5 bg-black/60 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={11} />
                </button>
              </div>
            ))}
          </div>
        )}

        {photos.length < 8 && (
          <label className={`flex items-center justify-center gap-2 w-full border-2 border-dashed rounded-xl py-5 cursor-pointer transition-colors text-sm font-medium
            ${uploading ? "border-zinc-700 text-zinc-600" : "border-zinc-700 hover:border-[#d4a017] text-zinc-400 hover:text-[#d4a017]"}`}>
            {uploading ? (
              <><Loader2 size={16} className="animate-spin" /> Enviando...</>
            ) : (
              <><ImagePlus size={16} /> Adicionar fotos ({photos.length}/8)</>
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

      {/* Highlighted */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            name="highlighted"
            value="true"
            defaultChecked={vehicle?.highlighted ?? false}
            className="w-5 h-5 rounded accent-[#d4a017]"
          />
          <div>
            <p className="text-white font-medium">Veículo em destaque</p>
            <p className="text-zinc-500 text-sm">Aparece primeiro na vitrine pública</p>
          </div>
        </label>
      </div>

      {/* Submit */}
      <div className="flex items-center gap-4 pt-2">
        <button
          type="submit"
          disabled={loading || uploading}
          className="flex items-center gap-2 px-8 py-3 bg-[#d4a017] hover:bg-[#b8860b] text-black font-bold rounded-xl transition-colors disabled:opacity-50"
        >
          {loading ? (
            <><Loader2 size={16} className="animate-spin" /> Salvando...</>
          ) : (
            <><Upload size={16} /> {vehicle ? "Salvar Alterações" : "Cadastrar Veículo"}</>
          )}
        </button>
        <a href="/admin/vendas" className="text-zinc-400 hover:text-white text-sm transition-colors">Cancelar</a>
      </div>
    </form>
  )
}
