"use client"

// Note: This is a client component to handle the lead form submission state.
// Data fetching is done via a server action on form submit.

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { getSaleVehicleById, createSaleLead } from "@/app/actions/sale.actions"
import { formatCurrency } from "@/lib/utils"
import Navbar from "@/components/public/Navbar"
import Footer from "@/components/public/Footer"
import Link from "next/link"
import Image from "next/image"
import {
  ChevronLeft, Car, Gauge, Fuel, Settings2, Users, Calendar,
  Tag, CheckCircle2, Phone, ArrowRight, Loader2, MapPin
} from "lucide-react"

export default function ComprarVeiculoPage() {
  // This pattern requires dynamic import because we need auth session server-side
  // but want the form to be interactive. We'll use server actions directly.
  return <VehicleDetailContent />
}

// Separate async data-loading pattern using server actions directly
function VehicleDetailContent() {
  const params = useParams()
  const id = params.id as string

  const [vehicle, setVehicle] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [activePhoto, setActivePhoto] = useState(0)

  useEffect(() => {
    getSaleVehicleById(id).then((v) => {
      setVehicle(v)
      setLoading(false)
    })
  }, [id])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitting(true)
    setError("")
    const fd = new FormData(e.currentTarget)
    fd.set("vehicleId", id)
    const res = await createSaleLead(fd)
    if (res.error) {
      setError(res.error)
    } else {
      setSubmitted(true)
    }
    setSubmitting(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-[#d4a017]" />
      </div>
    )
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center gap-4">
        <Car size={48} className="text-zinc-700" />
        <p className="text-zinc-400 text-lg">Veículo não encontrado.</p>
        <Link href="/comprar" className="text-[#d4a017] hover:underline">Ver todos os veículos</Link>
      </div>
    )
  }

  const isSold = vehicle.status === "SOLD"

  const inputCls = "w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-[#d4a017] transition-colors text-sm"

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar session={null} />

      <div className="container mx-auto px-6 py-8">
        <Link href="/comprar" className="flex items-center gap-1.5 text-zinc-400 hover:text-white text-sm transition-colors mb-6">
          <ChevronLeft size={16} /> Voltar para Veículos à Venda
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Photos + Specs */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h1 className="text-4xl font-black font-outfit text-white tracking-tight">
                  {vehicle.brand} {vehicle.model}
                </h1>
                {vehicle.version && <p className="text-zinc-400 mt-1">{vehicle.version}</p>}
              </div>
              {isSold ? (
                <span className="text-lg font-bold text-purple-400 bg-purple-400/10 border border-purple-400/20 px-4 py-2 rounded-full">
                  Veículo Vendido
                </span>
              ) : (
                <span className="text-sm font-bold text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-3 py-1.5 rounded-full">
                  {vehicle.status === "RESERVED" ? "Reservado" : "Disponível"}
                </span>
              )}
            </div>

            {/* Photos gallery */}
            {vehicle.photos.length > 0 ? (
              <div className="space-y-3">
                <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-900">
                  <Image
                    src={vehicle.photos[activePhoto]}
                    alt={`${vehicle.brand} ${vehicle.model}`}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
                {vehicle.photos.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {vehicle.photos.map((url: string, i: number) => (
                      <button
                        key={url}
                        onClick={() => setActivePhoto(i)}
                        className={`relative flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                          activePhoto === i ? "border-[#d4a017]" : "border-zinc-700 hover:border-zinc-500"
                        }`}
                      >
                        <Image src={url} alt={`Foto ${i + 1}`} fill className="object-cover" unoptimized />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full aspect-video rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                <Car size={64} className="text-zinc-700" />
              </div>
            )}

            {/* Specs */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
              <h2 className="text-lg font-bold text-white mb-5">Especificações</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                <SpecRow icon={<Calendar size={15} />} label="Ano" value={String(vehicle.year)} />
                <SpecRow icon={<Gauge size={15} />} label="Quilometragem" value={`${vehicle.km.toLocaleString("pt-BR")} km`} />
                <SpecRow icon={<Fuel size={15} />} label="Combustível" value={vehicle.fuelType} />
                <SpecRow icon={<Settings2 size={15} />} label="Câmbio" value={vehicle.transmission === "AUTOMATICO" ? "Automático" : "Manual"} />
                <SpecRow icon={<Car size={15} />} label="Portas" value={`${vehicle.doors} portas`} />
                <SpecRow icon={<Users size={15} />} label="Lugares" value={`${vehicle.seats} lugares`} />
                {vehicle.plate && <SpecRow icon={<Tag size={15} />} label="Placa" value={vehicle.plate} />}
                {vehicle.color && <SpecRow icon={<Tag size={15} />} label="Cor" value={vehicle.color} />}
              </div>
            </div>

            {/* Features */}
            {vehicle.features.length > 0 && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                <h2 className="text-lg font-bold text-white mb-4">Opcionais e Itens</h2>
                <div className="flex flex-wrap gap-2">
                  {vehicle.features.map((f: string) => (
                    <span key={f} className="flex items-center gap-1.5 text-sm bg-zinc-800 border border-zinc-700 text-zinc-200 px-3 py-2 rounded-xl">
                      <CheckCircle2 size={13} className="text-[#d4a017]" /> {f}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            {vehicle.description && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                <h2 className="text-lg font-bold text-white mb-3">Descrição</h2>
                <p className="text-zinc-400 text-sm leading-relaxed whitespace-pre-line">{vehicle.description}</p>
              </div>
            )}
          </div>

          {/* Right: Price + Contact form */}
          <div className="space-y-6">
            {/* Price */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
              <p className="text-zinc-400 text-sm mb-1">Preço de Venda</p>
              <p className="text-5xl font-black text-[#d4a017] mb-2">{formatCurrency(Number(vehicle.price))}</p>
              {!isSold && (
                <p className="text-zinc-500 text-xs">Financiamento disponível · Consulte condições</p>
              )}
            </div>

            {/* WhatsApp */}
            <a
              href="https://wa.me/5592992921946"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-5 py-3.5 rounded-2xl transition-colors"
            >
              <Phone size={18} />
              <div>
                <p className="text-sm font-bold">Falar via WhatsApp</p>
                <p className="text-xs text-emerald-200">(92) 99292-1946</p>
              </div>
              <ArrowRight size={16} className="ml-auto" />
            </a>

            {/* Interest form */}
            {!isSold && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                <h2 className="text-lg font-bold text-white mb-1">Tenho Interesse</h2>
                <p className="text-zinc-500 text-sm mb-5">Preencha seus dados e nossa equipe entrará em contato.</p>

                {submitted ? (
                  <div className="text-center py-8">
                    <CheckCircle2 size={40} className="text-emerald-400 mx-auto mb-3" />
                    <p className="text-white font-bold text-lg">Interesse registrado!</p>
                    <p className="text-zinc-400 text-sm mt-2">Nossa equipe entrará em contato em breve.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                      <div className="text-red-400 text-sm bg-red-900/20 p-3 rounded-lg border border-red-900/50">{error}</div>
                    )}

                    <div className="space-y-2">
                      <label className="text-zinc-400 text-xs font-medium uppercase tracking-wider">Nome completo *</label>
                      <input name="name" required placeholder="Seu nome" className={inputCls} />
                    </div>

                    <div className="space-y-2">
                      <label className="text-zinc-400 text-xs font-medium uppercase tracking-wider">E-mail *</label>
                      <input name="email" type="email" required placeholder="seu@email.com" className={inputCls} />
                    </div>

                    <div className="space-y-2">
                      <label className="text-zinc-400 text-xs font-medium uppercase tracking-wider">Telefone / WhatsApp *</label>
                      <input name="phone" required placeholder="(92) 99999-9999" className={inputCls} />
                    </div>

                    <div className="space-y-2">
                      <label className="text-zinc-400 text-xs font-medium uppercase tracking-wider">CPF</label>
                      <input name="document" placeholder="000.000.000-00" className={inputCls} />
                    </div>

                    <div className="space-y-2">
                      <label className="text-zinc-400 text-xs font-medium uppercase tracking-wider">Mensagem</label>
                      <textarea
                        name="message"
                        rows={3}
                        placeholder="Forma de pagamento, dúvidas, proposta..."
                        className={`${inputCls} resize-none`}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#d4a017] hover:bg-[#b8860b] text-black font-bold rounded-xl transition-colors disabled:opacity-60 text-sm"
                    >
                      {submitting ? (
                        <><Loader2 size={16} className="animate-spin" /> Enviando...</>
                      ) : (
                        <><ArrowRight size={16} /> Enviar Interesse</>
                      )}
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* Location */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
              <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <MapPin size={14} /> Onde Estamos
              </h3>
              <p className="text-white text-sm font-medium">Morauto Locadora</p>
              <p className="text-zinc-400 text-sm mt-1">Av. Álvaro Maia, 176-A</p>
              <p className="text-zinc-400 text-sm">Presidente Vargas — Manaus-AM</p>
              <p className="text-zinc-400 text-sm mt-1">CEP 69025-360</p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

function SpecRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="text-[#d4a017] mt-0.5 flex-shrink-0">{icon}</div>
      <div>
        <p className="text-zinc-500 text-xs">{label}</p>
        <p className="text-white text-sm font-medium">{value}</p>
      </div>
    </div>
  )
}
