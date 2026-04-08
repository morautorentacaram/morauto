"use client"

import { useState, useTransition, useRef } from "react"
import { updateCustomer } from "@/app/actions/customer.actions"
import { useRouter } from "next/navigation"
import { X, Loader2, Save, Upload, CheckCircle, FileText, Home } from "lucide-react"

type Customer = {
  id: string
  type: string
  phone: string | null
  document: string
  cnh: string | null
  cnhExpiration: Date | null
  cnhUrl?: string | null
  addressProofUrl?: string | null
  address?: string | null
  notes?: string | null
  score?: number | null
  blocked?: boolean
  user: { name: string | null; email: string | null }
}

type UploadState = { url: string; name: string } | null

export default function CustomerEditModal({
  customer,
  onClose,
}: {
  customer: Customer
  onClose: () => void
}) {
  const [error, setError] = useState("")
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const cnhInputRef  = useRef<HTMLInputElement>(null)
  const addrInputRef = useRef<HTMLInputElement>(null)

  const [cnhDoc,  setCnhDoc]  = useState<UploadState>(customer.cnhUrl         ? { url: customer.cnhUrl,         name: "CNH salva"           } : null)
  const [addrDoc, setAddrDoc] = useState<UploadState>(customer.addressProofUrl ? { url: customer.addressProofUrl, name: "Comprovante salvo" } : null)
  const [uploadingCnh,  setUploadingCnh]  = useState(false)
  const [uploadingAddr, setUploadingAddr] = useState(false)

  async function uploadFile(file: File, setUploading: (v: boolean) => void, setDoc: (v: UploadState) => void) {
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append("file", file)
      const res  = await fetch("/api/upload", { method: "POST", body: fd })
      const data = await res.json()
      if (data.url) setDoc({ url: data.url, name: file.name })
      else setError("Falha no upload: " + (data.error ?? "erro desconhecido"))
    } catch {
      setError("Erro ao enviar arquivo.")
    } finally {
      setUploading(false)
    }
  }

  function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    setError("")
    const fd = new FormData(e.currentTarget)
    if (cnhDoc?.url  && cnhDoc.url  !== customer.cnhUrl)         fd.set("cnhUrl",         cnhDoc.url)
    if (addrDoc?.url && addrDoc.url !== customer.addressProofUrl) fd.set("addressProofUrl", addrDoc.url)
    startTransition(async () => {
      const res = await updateCustomer(customer.id, fd)
      if (res?.error) setError(res.error)
      else { router.refresh(); onClose() }
    })
  }

  const cnhExp = customer.cnhExpiration
    ? new Date(customer.cnhExpiration).toISOString().split("T")[0]
    : ""

  const inp = "w-full bg-zinc-950 border border-zinc-700 text-white px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:border-[#d4a017]"
  const lbl = "text-zinc-400 text-sm"

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-xl shadow-2xl max-h-[92vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 flex-shrink-0">
          <div>
            <h2 className="text-white font-bold text-lg">Editar Cliente</h2>
            <p className="text-zinc-500 text-xs mt-0.5">{customer.user.name} · {customer.type}</p>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">
          {error && (
            <div className="text-red-400 text-sm bg-red-900/20 border border-red-900/40 p-3 rounded-lg">{error}</div>
          )}

          {/* ── Identificação ── */}
          <section className="space-y-3">
            <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider">Identificação</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 space-y-1">
                <label className={lbl}>Nome Completo</label>
                <input name="name" required defaultValue={customer.user.name ?? ""} className={inp} />
              </div>
              <div className="col-span-2 space-y-1">
                <label className={lbl}>E-mail</label>
                <input value={customer.user.email ?? ""} disabled className="w-full bg-zinc-950 border border-zinc-800 text-zinc-500 px-3 py-2.5 rounded-lg text-sm cursor-not-allowed" />
                <p className="text-zinc-600 text-xs">O e-mail não pode ser alterado.</p>
              </div>
              <div className="space-y-1">
                <label className={lbl}>Documento ({customer.type})</label>
                <input value={customer.document} disabled className="w-full bg-zinc-950 border border-zinc-800 text-zinc-500 px-3 py-2.5 rounded-lg text-sm cursor-not-allowed font-mono" />
              </div>
              <div className="space-y-1">
                <label className={lbl}>Celular</label>
                <input name="phone" defaultValue={customer.phone ?? ""} placeholder="(92) 99999-9999" className={inp} />
              </div>
            </div>
          </section>

          {/* ── CNH (PF) ── */}
          {customer.type === "PF" && (
            <section className="space-y-3">
              <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider">Habilitação</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className={lbl}>Nº CNH</label>
                  <input name="cnh" defaultValue={customer.cnh ?? ""} placeholder="00000000000" className={inp} />
                </div>
                <div className="space-y-1">
                  <label className={lbl}>Validade CNH</label>
                  <input name="cnhExpiration" type="date" defaultValue={cnhExp} className={inp} />
                </div>
              </div>
            </section>
          )}

          {/* ── Endereço ── */}
          <section className="space-y-3">
            <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider">Localização</p>
            <div className="space-y-1">
              <label className={lbl}>Endereço Completo</label>
              <input name="address" defaultValue={customer.address ?? ""} placeholder="Rua, nº, bairro, cidade, estado" className={inp} />
            </div>
          </section>

          {/* ── Score e Notas ── */}
          <section className="space-y-3">
            <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider">Perfil</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className={lbl}>Score (0–100)</label>
                <input name="score" type="number" min={0} max={100} defaultValue={customer.score ?? 100} className={inp} />
              </div>
              <div className="col-span-2 space-y-1">
                <label className={lbl}>Notas internas</label>
                <textarea name="notes" rows={3} defaultValue={customer.notes ?? ""} placeholder="Observações visíveis apenas para a equipe..." className={inp + " resize-none"} />
              </div>
            </div>
          </section>

          {/* ── Documentos ── */}
          <section className="space-y-3">
            <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider">Documentos</p>

            {[
              { label: "CNH", icon: <FileText size={16} className="text-[#d4a017]" />, doc: cnhDoc, setDoc: setCnhDoc, uploading: uploadingCnh, setUploading: setUploadingCnh, inputRef: cnhInputRef },
              { label: "Comprovante de Residência", icon: <Home size={16} className="text-blue-400" />, doc: addrDoc, setDoc: setAddrDoc, uploading: uploadingAddr, setUploading: setUploadingAddr, inputRef: addrInputRef },
            ].map(({ label, icon, doc, setDoc, uploading, setUploading, inputRef }) => (
              <div key={label} className="flex items-center gap-3 bg-zinc-950 border border-zinc-800 rounded-xl p-3">
                <div className="w-9 h-9 rounded-lg bg-zinc-800 flex items-center justify-center flex-shrink-0">{icon}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium">{label}</p>
                  {doc ? (
                    <p className="text-emerald-400 text-xs flex items-center gap-1 truncate"><CheckCircle size={11} /> {doc.name}</p>
                  ) : (
                    <p className="text-zinc-600 text-xs">Nenhum arquivo</p>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {doc && <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-white text-xs underline">Ver</a>}
                  <button type="button" disabled={uploading} onClick={() => inputRef.current?.click()}
                    className="flex items-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50">
                    {uploading ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
                    {uploading ? "Enviando..." : doc ? "Trocar" : "Carregar"}
                  </button>
                  <input ref={inputRef} type="file" accept="image/*,application/pdf" className="hidden"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadFile(f, setUploading, setDoc) }} />
                </div>
              </div>
            ))}
            <p className="text-zinc-600 text-xs">Aceita JPG, PNG, WebP ou PDF. Máx. 5 MB.</p>
          </section>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500 text-sm font-medium transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={isPending || uploadingCnh || uploadingAddr}
              className="flex-1 py-2.5 rounded-xl bg-[#d4a017] hover:bg-[#b8860b] text-black font-bold text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
              {isPending ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
