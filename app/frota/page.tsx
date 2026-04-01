import { Search, MapPin, Calendar, ArrowRight, SlidersHorizontal, Fuel, Settings2, CarFront, User } from "lucide-react"
import Image from "next/image"
import { db } from "@/lib/db"
import { auth } from "@/auth"
import Link from "next/link"
import Navbar from "@/components/public/Navbar"
import Footer from "@/components/public/Footer"
import { formatCurrency } from "@/lib/utils"

export const dynamic = "force-dynamic"
export const metadata = { title: "Frota — Morauto" }

export default async function FrotaPage({
  searchParams,
}: {
  searchParams: Promise<{ city?: string; date?: string; endDate?: string; category?: string; transmission?: string; fuel?: string; sort?: string }>
}) {
  const { city, date, endDate, category, transmission, fuel, sort } = await searchParams
  const session = await auth()

  const categories = await db.category.findMany({ orderBy: { dailyRate: "asc" } })

  const vehicles = await db.vehicle.findMany({
    where: {
      status: "AVAILABLE",
      ...(category ? { categoryId: category } : {}),
      ...(transmission ? { transmission } : {}),
      ...(fuel ? { fuelType: fuel } : {}),
    },
    include: { category: true },
    orderBy:
      sort === "price_desc" ? { category: { dailyRate: "desc" } }
      : sort === "year" ? { year: "desc" }
      : { category: { dailyRate: "asc" } },
  })

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar session={session} />

      {/* Search Bar */}
      <div className="bg-zinc-950/95 border-b border-white/5 px-4 md:px-6 py-3 md:py-5 sticky top-16 md:top-20 z-40 backdrop-blur-md">
        <form className="container mx-auto">
          {/* Mobile layout */}
          <div className="flex flex-col gap-2 md:hidden">
            <div className="relative">
              <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input name="city" defaultValue={city} placeholder="Cidade..." className="w-full bg-zinc-900 border border-zinc-800 pl-9 pr-3 py-2.5 rounded-xl text-sm outline-none focus:border-[#d4a017] transition-all" />
            </div>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Calendar size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input name="date" type="date" defaultValue={date} className="w-full bg-zinc-900 border border-zinc-800 pl-8 pr-2 py-2.5 rounded-xl text-sm outline-none focus:border-[#d4a017] transition-all" style={{ colorScheme: "dark" }} />
              </div>
              <div className="relative flex-1">
                <Calendar size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input name="endDate" type="date" defaultValue={endDate} className="w-full bg-zinc-900 border border-zinc-800 pl-8 pr-2 py-2.5 rounded-xl text-sm outline-none focus:border-[#d4a017] transition-all" style={{ colorScheme: "dark" }} />
              </div>
              <button type="submit" className="bg-[#d4a017] hover:bg-[#b8860b] text-black font-bold px-4 py-2.5 rounded-xl text-sm flex items-center gap-1.5 transition-colors flex-shrink-0 active:scale-95">
                <Search size={15} />
              </button>
            </div>
          </div>
          {/* Desktop layout */}
          <div className="hidden md:flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-40">
              <label className="text-zinc-500 text-xs font-bold uppercase tracking-wider block mb-1.5">Cidade</label>
              <div className="relative">
                <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input name="city" defaultValue={city} placeholder="São Paulo, SP" className="w-full bg-zinc-900 border border-zinc-800 pl-9 pr-3 py-2.5 rounded-xl text-sm outline-none focus:border-[#d4a017] transition-all" />
              </div>
            </div>
            <div className="flex-1 min-w-36">
              <label className="text-zinc-500 text-xs font-bold uppercase tracking-wider block mb-1.5">Retirada</label>
              <div className="relative">
                <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input name="date" type="date" defaultValue={date} className="w-full bg-zinc-900 border border-zinc-800 pl-9 pr-3 py-2.5 rounded-xl text-sm outline-none focus:border-[#d4a017] transition-all" style={{ colorScheme: "dark" }} />
              </div>
            </div>
            <div className="flex-1 min-w-36">
              <label className="text-zinc-500 text-xs font-bold uppercase tracking-wider block mb-1.5">Devolução</label>
              <div className="relative">
                <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input name="endDate" type="date" defaultValue={endDate} className="w-full bg-zinc-900 border border-zinc-800 pl-9 pr-3 py-2.5 rounded-xl text-sm outline-none focus:border-[#d4a017] transition-all" style={{ colorScheme: "dark" }} />
              </div>
            </div>
            <button type="submit" className="bg-[#d4a017] hover:bg-[#b8860b] text-black font-bold px-6 py-2.5 rounded-xl text-sm flex items-center gap-2 transition-colors">
              <Search size={16} /> Buscar
            </button>
          </div>
        </form>
      </div>

      <div className="container mx-auto px-6 py-10">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar - Hidden on mobile, shown via drawer/button or top layout */}
          <aside className="lg:w-64 flex-shrink-0">
             {/* Mobile Filter Trigger */}
             <div className="lg:hidden mb-6">
                <details className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden group">
                  <summary className="flex items-center justify-between p-5 cursor-pointer list-none">
                    <div className="flex items-center gap-2">
                      <SlidersHorizontal size={18} className="text-[#d4a017]" />
                      <span className="font-bold text-sm">Filtrar e Ordenar</span>
                    </div>
                    <ArrowRight size={16} className="text-zinc-500 group-open:rotate-90 transition-transform" />
                  </summary>
                  <div className="p-5 border-t border-zinc-800">
                    <FilterForm categories={categories} city={city} date={date} endDate={endDate} category={category} transmission={transmission} fuel={fuel} sort={sort} />
                  </div>
                </details>
             </div>

             {/* Desktop Filter Sidebar */}
             <div className="hidden lg:block bg-zinc-900 border border-zinc-800 rounded-2xl p-5 sticky top-32">
                <div className="flex items-center gap-2 mb-5">
                  <SlidersHorizontal size={16} className="text-[#d4a017]" />
                  <h3 className="text-white font-semibold text-sm">Filtros</h3>
                </div>
                <FilterForm categories={categories} city={city} date={date} endDate={endDate} category={category} transmission={transmission} fuel={fuel} sort={sort} />
             </div>
          </aside>

          {/* Vehicle Grid */}
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
              <div>
                <h2 className="text-3xl font-bold font-outfit">Veículos Disponíveis</h2>
                <p className="text-zinc-500 text-sm mt-1">{vehicles.length} veículo(s) encontrado(s)</p>
              </div>
              
              {!session && (
                <Link href="/login" className="w-full sm:w-auto bg-zinc-900 border border-white/5 px-4 py-3 rounded-2xl flex items-center justify-between gap-4 group hover:border-[#d4a017]/30 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#d4a017]/10 flex items-center justify-center text-[#d4a017]">
                      <User size={18} />
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-bold uppercase tracking-widest text-[#d4a017]">Identifique-se</p>
                      <p className="text-zinc-400 text-[10px]">Acesse para uma reserva rápida</p>
                    </div>
                  </div>
                  <ArrowRight size={14} className="text-zinc-600 group-hover:text-white transition-colors" />
                </Link>
              )}
            </div>

            {vehicles.length === 0 ? (
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-12 md:p-16 text-center">
                <Settings2 size={48} className="text-zinc-700 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-zinc-400">Nenhum veículo encontrado</h3>
                <p className="text-zinc-600 mt-2">Tente ajustar os filtros</p>
                <Link href="/frota" className="inline-block mt-6 text-[#d4a017] hover:underline text-sm">Limpar filtros</Link>
              </div>
            ) : (
              <div className="space-y-3 md:space-y-0 md:grid md:grid-cols-2 xl:grid-cols-3 md:gap-6">
                {vehicles.map((v) => (
                  <div key={v.id} className="bg-zinc-900 border border-white/5 rounded-2xl overflow-hidden hover:border-[#d4a017]/40 transition-all group">
                    {/* Mobile: horizontal card */}
                    <div className="flex md:hidden">
                      <div className="w-28 flex-shrink-0 bg-gradient-to-br from-zinc-800 to-zinc-950 relative overflow-hidden">
                        {v.photos?.[0] ? (
                          <Image src={v.photos[0]} alt={`${v.brand} ${v.model}`} fill className="object-cover" unoptimized />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <CarFront size={36} className="text-zinc-700 opacity-40" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-zinc-900/30" />
                      </div>
                      <div className="flex-1 p-3.5 flex flex-col justify-between min-w-0">
                        <div>
                          <div className="flex items-start justify-between gap-1 mb-1.5">
                            <h3 className="font-bold text-white text-sm leading-tight truncate">{v.brand} {v.model}</h3>
                            <span className="bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 px-1.5 py-0.5 rounded-full text-[10px] font-bold flex-shrink-0">
                              Livre
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1 text-[10px] text-zinc-500">
                            <span className="bg-zinc-800 px-1.5 py-0.5 rounded">{v.year}</span>
                            <span className="bg-zinc-800 px-1.5 py-0.5 rounded">{v.transmission === "AUTO" ? "Auto" : "Manual"}</span>
                            <span className="bg-zinc-800 px-1.5 py-0.5 rounded">{v.fuelType}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <div>
                            <span className="text-lg font-black text-[#d4a017]">{formatCurrency(Number(v.category.dailyRate))}</span>
                            <span className="text-zinc-500 text-[10px] ml-0.5">/dia</span>
                          </div>
                          <Link
                            href={`/checkout/${v.id}?${new URLSearchParams({ city: city || "", date: date || "", endDate: endDate || "" }).toString()}`}
                            className="bg-[#d4a017] active:bg-[#b8860b] text-black font-bold px-3 py-1.5 rounded-lg text-xs transition-colors flex items-center gap-1"
                          >
                            Reservar <ArrowRight size={12} />
                          </Link>
                        </div>
                      </div>
                    </div>

                    {/* Desktop: vertical card */}
                    <div className="hidden md:flex flex-col h-full">
                      <div className="h-44 bg-gradient-to-br from-zinc-800 to-zinc-950 flex items-center justify-center relative overflow-hidden">
                        {v.photos?.[0] ? (
                          <Image src={v.photos[0]} alt={`${v.brand} ${v.model}`} fill className="object-cover group-hover:scale-105 transition-transform duration-500" unoptimized />
                        ) : (
                          <CarFront size={64} className="text-zinc-700 opacity-40" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/60 to-transparent" />
                        <div className="absolute top-3 left-3">
                          <span className="bg-black/60 backdrop-blur-sm border border-white/10 px-2.5 py-1 rounded-full text-xs font-bold text-zinc-300">{v.category.name}</span>
                        </div>
                        <div className="absolute top-3 right-3">
                          <span className="bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 px-2.5 py-1 rounded-full text-xs font-bold">Disponível</span>
                        </div>
                      </div>
                      <div className="p-5 flex-1 flex flex-col">
                        <h3 className="text-xl font-bold font-outfit mb-1">{v.brand} {v.model}</h3>
                        <div className="flex flex-wrap gap-2 text-xs text-zinc-500 mb-4">
                          <span className="bg-zinc-800 px-2 py-1 rounded">{v.year}</span>
                          <span className="bg-zinc-800 px-2 py-1 rounded flex items-center gap-1"><Settings2 size={10} /> {v.transmission === "AUTO" ? "Automático" : "Manual"}</span>
                          <span className="bg-zinc-800 px-2 py-1 rounded flex items-center gap-1"><Fuel size={10} /> {v.fuelType}</span>
                        </div>
                        <div className="mt-auto flex items-center justify-between">
                          <div>
                            <span className="text-2xl font-black text-[#d4a017]">{formatCurrency(Number(v.category.dailyRate))}</span>
                            <span className="text-zinc-500 text-xs ml-1">/dia</span>
                          </div>
                          <Link
                            href={`/checkout/${v.id}?${new URLSearchParams({ city: city || "", date: date || "", endDate: endDate || "" }).toString()}`}
                            className="bg-white text-black hover:bg-[#d4a017] font-bold px-4 py-2 rounded-xl text-sm transition-colors flex items-center gap-1"
                          >
                            Reservar <ArrowRight size={14} />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

function FilterForm({ 
  categories, city, date, endDate, category, transmission, fuel, sort 
}: { 
  categories: any[], city?: string, date?: string, endDate?: string, category?: string, transmission?: string, fuel?: string, sort?: string 
}) {
  return (
    <form className="space-y-5">
      {/* Pass existing search params */}
      {city && <input type="hidden" name="city" value={city} />}
      {date && <input type="hidden" name="date" value={date} />}
      {endDate && <input type="hidden" name="endDate" value={endDate} />}

      <div>
        <label className="text-zinc-400 text-xs font-bold uppercase tracking-wider block mb-2">Categoria</label>
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer group">
            <input type="radio" name="category" value="" defaultChecked={!category} className="accent-[#d4a017]" />
            <span className="text-zinc-300 text-sm group-hover:text-white">Todas</span>
          </label>
          {categories.map((cat) => (
            <label key={cat.id} className="flex items-center gap-2 cursor-pointer group">
              <input type="radio" name="category" value={cat.id} defaultChecked={category === cat.id} className="accent-[#d4a017]" />
              <span className="text-zinc-300 text-sm group-hover:text-white">{cat.name}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="text-zinc-400 text-xs font-bold uppercase tracking-wider block mb-2">Câmbio</label>
        <div className="space-y-2">
          {["", "MANUAL", "AUTO"].map((t) => (
            <label key={t} className="flex items-center gap-2 cursor-pointer group">
              <input type="radio" name="transmission" value={t} defaultChecked={transmission === t || (!t && !transmission)} className="accent-[#d4a017]" />
              <span className="text-zinc-300 text-sm group-hover:text-white">{t === "" ? "Todos" : t === "MANUAL" ? "Manual" : "Automático"}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="text-zinc-400 text-xs font-bold uppercase tracking-wider block mb-2">Combustível</label>
        <div className="space-y-2">
          {["", "GASOLINA", "ETANOL", "FLEX", "DIESEL", "ELÉTRICO", "HÍBRIDO"].map((f) => (
            <label key={f} className="flex items-center gap-2 cursor-pointer group">
              <input type="radio" name="fuel" value={f} defaultChecked={fuel === f || (!f && !fuel)} className="accent-[#d4a017]" />
              <span className="text-zinc-300 text-sm group-hover:text-white capitalize">{f === "" ? "Todos" : f.toLowerCase()}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="text-zinc-400 text-xs font-bold uppercase tracking-wider block mb-2">Ordenar</label>
        <select name="sort" defaultValue={sort ?? "price_asc"} className="w-full bg-zinc-950 border border-zinc-700 text-zinc-300 px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-[#d4a017]">
          <option value="price_asc">Menor preço</option>
          <option value="price_desc">Maior preço</option>
          <option value="year">Mais novo</option>
        </select>
      </div>

      <button type="submit" className="w-full bg-[#d4a017] hover:bg-[#b8860b] text-black font-bold py-2.5 rounded-xl text-sm transition-colors">
        Aplicar Filtros
      </button>
      <Link href="/frota" className="block text-center text-zinc-500 hover:text-white text-xs transition-colors">
        Limpar filtros
      </Link>
    </form>
  )
}
