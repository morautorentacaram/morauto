import { Search, MapPin, Calendar, ArrowRight } from "lucide-react"
import { db } from "@/lib/db"
import Link from "next/link"

export default async function FrotaPage({
  searchParams,
}: {
  searchParams: Promise<{ city?: string; date?: string }>;
}) {
  const { city, date } = await searchParams;
  
  // Base query: fetch available vehicles
  const vehicles = await db.vehicle.findMany({
    where: { status: "AVAILABLE" },
    include: { category: true },
    orderBy: { category: { dailyRate: "asc" } }
  })

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Header compact */}
      <header className="h-20 border-b border-white/5 bg-black/80 flex items-center px-8 sticky top-0 z-50 backdrop-blur-md">
        <Link href="/">
          <h1 className="text-2xl font-black text-white font-outfit uppercase tracking-tighter">
            Morauto<span className="text-[#d4a017]">.</span>
          </h1>
        </Link>
        <div className="ml-auto flex items-center gap-4 text-sm font-medium">
          <Link href="/login" className="text-zinc-400 hover:text-white transition-colors">Entrar</Link>
        </div>
      </header>

      {/* Active Filters */}
      <div className="bg-white/5 border-b border-white/5 px-8 py-4 flex flex-wrap items-center gap-4 text-sm">
        <span className="text-zinc-500 font-bold uppercase tracking-widest text-xs mr-2">Busca:</span>
        {city ? (
          <div className="flex items-center gap-2 bg-[#d4a017] text-black px-4 py-1.5 rounded-full font-semibold">
            <MapPin size={16} /> {city}
          </div>
        ) : (
          <div className="flex items-center gap-2 bg-white/10 text-zinc-300 px-4 py-1.5 rounded-full font-semibold">
            <MapPin size={16} /> Sem local definido
          </div>
        )}
        {date ? (
          <div className="flex items-center gap-2 bg-[#d4a017] text-black px-4 py-1.5 rounded-full font-semibold">
            <Calendar size={16} /> {new Date(date).toLocaleDateString("pt-BR")}
          </div>
        ) : (
          <div className="flex items-center gap-2 bg-white/10 text-zinc-300 px-4 py-1.5 rounded-full font-semibold">
            <Calendar size={16} /> Sem data definida
          </div>
        )}
        
        <Link href="/" className="ml-auto text-[#d4a017] hover:underline font-bold text-xs uppercase tracking-widest">
          Alterar Busca
        </Link>
      </div>

      <div className="container mx-auto px-6 py-12">
        <div className="mb-10">
          <h2 className="text-4xl font-bold font-outfit mb-2">Veículos Disponíveis</h2>
          <p className="text-zinc-400 font-light text-lg">Escolha o modelo perfeito para a sua experiência.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {vehicles.length === 0 ? (
            <div className="col-span-full py-20 text-center">
              <h3 className="text-2xl font-bold text-zinc-500 font-outfit">Nenhum veículo disponível no momento.</h3>
            </div>
          ) : (
            vehicles.map((v: any) => (
              <div key={v.id} className="bg-zinc-900 border border-white/5 rounded-3xl overflow-hidden group hover:border-[#d4a017]/50 transition-colors flex flex-col">
                <div className="h-48 bg-black relative flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 to-transparent z-10" />
                  {/* Vehice Photo Placeholder */}
                  <span className="text-9xl opacity-20 group-hover:scale-110 transition-transform duration-500 mix-blend-overlay">🚘</span>
                  
                  <div className="absolute top-4 left-4 z-20">
                    <span className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border border-white/10">
                      {v.category.name}
                    </span>
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col">
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold font-outfit mb-1">{v.brand} {v.model}</h3>
                    <div className="flex items-center gap-3 text-sm text-zinc-500 font-light">
                      <span>Ano {v.year}</span>
                      <span className="w-1 h-1 rounded-full bg-zinc-700" />
                      <span>{v.transmission}</span>
                      <span className="w-1 h-1 rounded-full bg-zinc-700" />
                      <span>{v.fuelType}</span>
                    </div>
                  </div>

                  <div className="mt-auto space-y-4">
                    <div className="flex items-end gap-2">
                      <span className="text-3xl font-black text-[#d4a017]">R$ {Number(v.category.dailyRate).toFixed(2)}</span>
                      <span className="text-zinc-500 font-bold text-sm mb-1 uppercase">/ dia</span>
                    </div>

                    <button className="w-full py-4 rounded-xl bg-white text-black font-bold hover:bg-[#d4a017] transition-all flex items-center justify-center gap-2 shadow-lg group-hover:shadow-[#d4a017]/20">
                      Selecionar <ArrowRight size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  )
}
