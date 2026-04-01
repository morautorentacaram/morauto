import { getSaleVehicles } from "@/app/actions/sale.actions"
import { formatCurrency } from "@/lib/utils"
import { auth } from "@/auth"
import Navbar from "@/components/public/Navbar"
import Footer from "@/components/public/Footer"
import Link from "next/link"
import Image from "next/image"
import {
  Search, ArrowRight, Car, Gauge, Fuel, Settings2,
  SlidersHorizontal, Tag, CheckCircle2
} from "lucide-react"

export const dynamic = "force-dynamic"
export const metadata = {
  title: "Veículos à Venda — Morauto",
  description: "Encontre seu próximo veículo. Frota selecionada com procedência garantida.",
}

const STATUS_BADGE: Record<string, { label: string; color: string }> = {
  AVAILABLE: { label: "Disponível",  color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
  RESERVED:  { label: "Reservado",   color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
}

export default async function ComprarPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string
    transmission?: string
    fuel?: string
    minPrice?: string
    maxPrice?: string
  }>
}) {
  const session = await auth()
  const { q = "", transmission = "", fuel = "", minPrice = "", maxPrice = "" } = await searchParams

  const allVehicles = await getSaleVehicles({ search: q })
  type VehicleItem = (typeof allVehicles)[0]
  const vehicles = allVehicles.filter((v: VehicleItem) => {
    if (v.status === "SOLD") return false
    if (transmission && v.transmission !== transmission) return false
    if (fuel && v.fuelType !== fuel) return false
    const price = Number(v.price)
    if (minPrice && price < Number(minPrice)) return false
    if (maxPrice && price > Number(maxPrice)) return false
    return true
  })

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar session={session} />

      {/* Hero */}
      <section className="relative bg-zinc-950 border-b border-white/5 py-16 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#d4a017]/5 to-transparent pointer-events-none" />
        <div className="container mx-auto text-center relative z-10">
          <span className="inline-block text-xs font-bold text-[#d4a017] bg-[#d4a017]/10 border border-[#d4a017]/20 px-3 py-1.5 rounded-full uppercase tracking-widest mb-4">
            Veículos à Venda
          </span>
          <h1 className="text-5xl md:text-6xl font-black font-outfit tracking-tighter mb-4">
            Encontre seu<br />
            <span className="text-[#d4a017]">próximo veículo</span>
          </h1>
          <p className="text-zinc-400 text-lg max-w-xl mx-auto">
            Frota selecionada com procedência garantida, documentação em dia e preços justos.
          </p>
        </div>
      </section>

      {/* Filters */}
      <div className="bg-zinc-950 border-b border-white/5 sticky top-20 z-40 backdrop-blur-md">
        <form className="container mx-auto px-6 py-4 flex flex-wrap gap-3 items-end">
          <div className="relative flex-1 min-w-48">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
            <input
              name="q"
              defaultValue={q}
              placeholder="Marca ou modelo..."
              className="w-full bg-zinc-900 border border-zinc-800 pl-9 pr-3 py-2.5 rounded-xl text-sm outline-none focus:border-[#d4a017] transition-all"
            />
          </div>

          <div className="relative">
            <Settings2 size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
            <select
              name="transmission"
              defaultValue={transmission}
              className="pl-8 pr-8 py-2.5 bg-zinc-900 border border-zinc-800 text-zinc-300 text-sm rounded-xl appearance-none focus:outline-none focus:border-[#d4a017] cursor-pointer"
            >
              <option value="">Câmbio</option>
              <option value="MANUAL">Manual</option>
              <option value="AUTOMATICO">Automático</option>
            </select>
          </div>

          <div className="relative">
            <Fuel size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
            <select
              name="fuel"
              defaultValue={fuel}
              className="pl-8 pr-8 py-2.5 bg-zinc-900 border border-zinc-800 text-zinc-300 text-sm rounded-xl appearance-none focus:outline-none focus:border-[#d4a017] cursor-pointer"
            >
              <option value="">Combustível</option>
              <option value="Gasolina">Gasolina</option>
              <option value="Etanol">Etanol</option>
              <option value="FLEX">Flex</option>
              <option value="Diesel">Diesel</option>
              <option value="Elétrico">Elétrico</option>
              <option value="Híbrido">Híbrido</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <input
              name="minPrice"
              type="number"
              defaultValue={minPrice}
              placeholder="Preço mín."
              className="w-28 bg-zinc-900 border border-zinc-800 px-3 py-2.5 rounded-xl text-sm text-zinc-300 outline-none focus:border-[#d4a017] placeholder-zinc-600"
            />
            <span className="text-zinc-600">–</span>
            <input
              name="maxPrice"
              type="number"
              defaultValue={maxPrice}
              placeholder="Preço máx."
              className="w-28 bg-zinc-900 border border-zinc-800 px-3 py-2.5 rounded-xl text-sm text-zinc-300 outline-none focus:border-[#d4a017] placeholder-zinc-600"
            />
          </div>

          <button
            type="submit"
            className="bg-[#d4a017] hover:bg-[#b8860b] text-black font-bold px-5 py-2.5 rounded-xl text-sm flex items-center gap-2 transition-colors"
          >
            <Search size={14} /> Filtrar
          </button>
          {(q || transmission || fuel || minPrice || maxPrice) && (
            <Link href="/comprar" className="text-zinc-400 hover:text-white text-sm transition-colors">
              Limpar
            </Link>
          )}
        </form>
      </div>

      {/* Results */}
      <div className="container mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <h2 className="text-2xl font-bold font-outfit text-white">Veículos Disponíveis</h2>
            <p className="text-zinc-500 text-sm mt-1">{vehicles.length} veículo(s) encontrado(s)</p>
          </div>
        </div>

        {vehicles.length === 0 ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-16 text-center">
            <Car size={48} className="text-zinc-700 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-zinc-400">Nenhum veículo encontrado</h3>
            <p className="text-zinc-600 mt-2 text-sm">Tente ajustar os filtros ou remover a busca.</p>
            <Link href="/comprar" className="inline-block mt-6 text-[#d4a017] hover:underline text-sm">
              Limpar filtros
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {vehicles.map((v: VehicleItem) => {
              const badge = STATUS_BADGE[v.status] ?? STATUS_BADGE.AVAILABLE
              return (
                <div
                  key={v.id}
                  className="bg-zinc-900 border border-white/5 rounded-2xl overflow-hidden hover:border-[#d4a017]/40 transition-all group flex flex-col"
                >
                  {/* Photo */}
                  <div className="h-48 bg-gradient-to-br from-zinc-800 to-zinc-950 relative overflow-hidden">
                    {v.photos[0] ? (
                      <Image
                        src={v.photos[0]}
                        alt={`${v.brand} ${v.model}`}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        unoptimized
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Car size={56} className="text-zinc-700 opacity-40" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/70 to-transparent" />

                    {/* Highlighted badge */}
                    {v.highlighted && (
                      <div className="absolute top-3 left-3">
                        <span className="bg-[#d4a017] text-black text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-wider">
                          Destaque
                        </span>
                      </div>
                    )}

                    <div className="absolute top-3 right-3">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${badge.color}`}>
                        {badge.label}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="text-xl font-bold font-outfit text-white mb-1">
                      {v.brand} {v.model}
                    </h3>
                    {v.version && (
                      <p className="text-zinc-500 text-sm mb-2">{v.version}</p>
                    )}

                    {/* Specs chips */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      <Chip icon={<Gauge size={10} />} label={`${v.km.toLocaleString("pt-BR")} km`} />
                      <Chip icon={null} label={String(v.year)} />
                      <Chip icon={<Settings2 size={10} />} label={v.transmission === "AUTOMATICO" ? "Auto" : "Manual"} />
                      <Chip icon={<Fuel size={10} />} label={v.fuelType} />
                    </div>

                    {/* Features preview */}
                    {v.features.slice(0, 3).length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {v.features.slice(0, 3).map((f: string) => (
                          <span key={f} className="flex items-center gap-1 text-[10px] text-zinc-400 bg-zinc-800 px-2 py-1 rounded-full">
                            <CheckCircle2 size={9} className="text-[#d4a017]" /> {f}
                          </span>
                        ))}
                        {v.features.length > 3 && (
                          <span className="text-[10px] text-zinc-500 px-2 py-1">+{v.features.length - 3}</span>
                        )}
                      </div>
                    )}

                    {/* Price + CTA */}
                    <div className="mt-auto flex items-center justify-between pt-3 border-t border-zinc-800">
                      <div>
                        <p className="text-[#d4a017] text-2xl font-black">{formatCurrency(Number(v.price))}</p>
                        <p className="text-zinc-600 text-xs">preço de venda</p>
                      </div>
                      <Link
                        href={`/comprar/${v.id}`}
                        className="flex items-center gap-1.5 bg-white text-black hover:bg-[#d4a017] font-bold px-4 py-2.5 rounded-xl text-sm transition-colors"
                      >
                        Ver detalhes <ArrowRight size={14} />
                      </Link>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}

function Chip({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="flex items-center gap-1 text-xs text-zinc-400 bg-zinc-800 border border-zinc-700 px-2 py-1 rounded-full">
      {icon}
      {label}
    </span>
  )
}
