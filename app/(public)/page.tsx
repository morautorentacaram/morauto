import { auth } from "@/auth"
import Navbar from "@/components/public/Navbar"
import Footer from "@/components/public/Footer"
import Link from "next/link"
import {
  Car, ShieldCheck, Clock, CheckCircle2, Search,
  ChevronRight, Star, ArrowRight, Smartphone,
  FileSignature, KeyRound, RotateCcw, MessageCircle, MapPin
} from "lucide-react"
import { formatCurrency } from "@/lib/utils"

export default async function Home() {
  let session = null
  let featuredVehicles: typeof import("@prisma/client").Prisma.VehicleGetPayload<{
    include: { category: true }
  }>[] = []

  try {
    session = await auth()
  } catch {
    // AUTH_SECRET not configured or auth unavailable — render as guest
  }

  try {
    const { db } = await import("@/lib/db")
    featuredVehicles = await db.vehicle.findMany({
      where: { status: "AVAILABLE" },
      include: { category: true },
      orderBy: { category: { dailyRate: "desc" } },
      take: 3,
    }) as any
  } catch {
    // DATABASE_URL not configured or DB unreachable — show empty featured section
  }


  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar session={session} />

      {/* Hero */}
      <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden bg-black text-white px-4 md:px-6">
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-zinc-900 to-black opacity-80" />
        <div className="absolute inset-0 z-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80')] bg-cover bg-center" />

        <div className="container relative z-10 mx-auto text-center pt-6 md:pt-10">
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full text-xs text-zinc-400 mb-6 md:mb-8 backdrop-blur-sm">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Frota disponível agora
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-8xl font-black mb-4 md:mb-6 tracking-tighter uppercase font-outfit leading-[1.05]">
            A Experiência <span className="text-[#d4a017]">Premium</span><br />de Locação.
          </h1>
          <p className="text-base md:text-2xl text-zinc-400 mb-8 md:mb-12 max-w-2xl mx-auto font-light leading-relaxed px-2">
            Frota exclusiva, vistoria digital e contratos inteligentes.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center items-center mb-8 md:mb-16 px-2">
            <Link href="/frota" className="w-full sm:w-auto px-8 py-4 rounded-full font-bold bg-[#d4a017] text-black hover:bg-[#b8860b] hover:shadow-lg hover:shadow-[#d4a017]/30 flex items-center justify-center gap-2 text-base md:text-lg transition-all active:scale-95">
              Reservar Agora <ChevronRight size={20} />
            </Link>
            <Link href="/como-funciona" className="w-full sm:w-auto px-8 py-4 rounded-full font-semibold border border-white/20 bg-white/5 backdrop-blur-sm transition-all hover:bg-white/10 text-base md:text-lg text-center active:scale-95">
              Como Funciona
            </Link>
          </div>

          {/* Quick Search */}
          <form action="/frota" method="GET" className="w-full max-w-3xl mx-auto bg-black/60 backdrop-blur-2xl border border-white/10 p-3 md:p-4 rounded-2xl shadow-2xl">
            {/* Mobile: stacked layout */}
            <div className="flex flex-col gap-2 md:hidden">
              <div className="text-left">
                <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold ml-1 block mb-1">Cidade</label>
                <input name="city" type="text" placeholder="Manaus, AM" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 placeholder:text-zinc-600 outline-none focus:border-[#d4a017]/50 transition-all text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="text-left">
                  <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold ml-1 block mb-1">Retirada</label>
                  <input name="date" type="date" className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-3 outline-none focus:border-[#d4a017]/50 transition-all text-sm" style={{ colorScheme: "dark" }} />
                </div>
                <div className="text-left">
                  <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold ml-1 block mb-1">Devolução</label>
                  <input name="endDate" type="date" className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-3 outline-none focus:border-[#d4a017]/50 transition-all text-sm" style={{ colorScheme: "dark" }} />
                </div>
              </div>
              <button type="submit" className="w-full py-3.5 rounded-xl bg-[#d4a017] text-black font-bold hover:bg-[#b8860b] transition-all flex items-center justify-center gap-2 active:scale-95">
                <Search size={18} /> Buscar Veículos
              </button>
            </div>
            {/* Desktop: row layout */}
            <div className="hidden md:flex gap-3 items-end">
              <div className="flex-1 space-y-1 text-left">
                <label className="text-xs uppercase tracking-widest text-zinc-500 font-bold ml-1 block">Cidade</label>
                <input name="city" type="text" placeholder="São Paulo, SP" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 placeholder:text-zinc-600 outline-none focus:border-[#d4a017]/50 transition-all text-sm" />
              </div>
              <div className="flex-1 space-y-1 text-left">
                <label className="text-xs uppercase tracking-widest text-zinc-500 font-bold ml-1 block">Retirada</label>
                <input name="date" type="date" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-[#d4a017]/50 transition-all text-sm" style={{ colorScheme: "dark" }} />
              </div>
              <div className="flex-1 space-y-1 text-left">
                <label className="text-xs uppercase tracking-widest text-zinc-500 font-bold ml-1 block">Devolução</label>
                <input name="endDate" type="date" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-[#d4a017]/50 transition-all text-sm" style={{ colorScheme: "dark" }} />
              </div>
              <button type="submit" className="px-8 py-3 rounded-xl bg-[#d4a017] text-black font-bold hover:bg-[#b8860b] transition-all flex items-center justify-center gap-2 h-[50px] flex-shrink-0">
                <Search size={18} /> Buscar
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-zinc-950 border-y border-white/5">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "500+", label: "Veículos na frota" },
              { value: "12k+", label: "Locações realizadas" },
              { value: "4.9★", label: "Avaliação média" },
              { value: "15+", label: "Filiais no Brasil" },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-3xl md:text-4xl font-black text-[#d4a017] font-outfit">{s.value}</p>
                <p className="text-zinc-500 text-sm mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-black px-6">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black font-outfit mb-4">Por que a Morauto?</h2>
            <p className="text-zinc-400 text-lg max-w-xl mx-auto">Tecnologia e cuidado em cada etapa da sua locação.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard icon={<ShieldCheck size={36} className="text-[#d4a017]" />} title="Vistoria 100% Digital" desc="Checklist com fotos na entrega e devolução. Sem papelada, sem surpresas." />
            <FeatureCard icon={<Clock size={36} className="text-[#d4a017]" />} title="Reserva em Minutos" desc="Consulte disponibilidade real e confirme sua reserva pelo site ou app." />
            <FeatureCard icon={<CheckCircle2 size={36} className="text-[#d4a017]" />} title="Contrato Digital" desc="Assine seu contrato de locação digitalmente, com validade jurídica." />
          </div>
        </div>
      </section>

      {/* Featured Vehicles */}
      {featuredVehicles.length > 0 && (
        <section className="py-24 bg-zinc-950 px-6">
          <div className="container mx-auto">
            <div className="flex items-end justify-between mb-12">
              <div>
                <h2 className="text-4xl font-black font-outfit mb-2">Destaques da Frota</h2>
                <p className="text-zinc-400">Veículos disponíveis agora</p>
              </div>
              <Link href="/frota" className="text-[#d4a017] hover:underline font-semibold flex items-center gap-1 text-sm">
                Ver toda a frota <ArrowRight size={16} />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredVehicles.map((v) => (
                <div key={v.id} className="bg-black border border-white/5 rounded-3xl overflow-hidden hover:border-[#d4a017]/40 transition-all group">
                  <div className="h-44 bg-gradient-to-br from-zinc-900 to-black flex items-center justify-center">
                    <span className="text-7xl opacity-30 group-hover:opacity-50 transition-opacity">🚘</span>
                  </div>
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-xl font-bold font-outfit">{v.brand} {v.model}</h3>
                        <p className="text-zinc-500 text-sm">{v.year} • {v.category.name}</p>
                      </div>
                      <span className="text-emerald-400 text-xs font-bold bg-emerald-400/10 border border-emerald-400/20 px-2 py-1 rounded-full">Disponível</span>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <div>
                        <span className="text-2xl font-black text-[#d4a017]">{formatCurrency(Number(v.dailyRate ?? v.category.dailyRate))}</span>
                        <span className="text-zinc-500 text-xs ml-1">/dia</span>
                      </div>
                      <Link href={`/checkout/${v.id}`} className="bg-white text-black hover:bg-[#d4a017] font-bold px-4 py-2 rounded-xl text-sm transition-colors flex items-center gap-1">
                        Reservar <ArrowRight size={14} />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* How it works */}
      <section className="py-24 bg-black px-6">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black font-outfit mb-4">Como Funciona</h2>
            <p className="text-zinc-400">4 passos simples para você na estrada</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { icon: <Search size={28} />, step: "01", title: "Busque", desc: "Escolha o veículo ideal por categoria, período e disponibilidade." },
              { icon: <FileSignature size={28} />, step: "02", title: "Reserve", desc: "Preencha seus dados e confirme a reserva em poucos cliques." },
              { icon: <KeyRound size={28} />, step: "03", title: "Retire", desc: "Faça a vistoria digital e assine o contrato direto no site." },
              { icon: <RotateCcw size={28} />, step: "04", title: "Devolva", desc: "Devolução com nova vistoria e encerramento automático." },
            ].map((item) => (
              <div key={item.step} className="text-center group">
                <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-white/5 group-hover:border-[#d4a017]/30 flex items-center justify-center mx-auto mb-4 text-[#d4a017] transition-all">
                  {item.icon}
                </div>
                <div className="text-xs text-zinc-600 font-bold tracking-widest mb-2">{item.step}</div>
                <h3 className="text-xl font-bold font-outfit mb-2">{item.title}</h3>
                <p className="text-zinc-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link href="/como-funciona" className="inline-flex items-center gap-2 text-[#d4a017] hover:underline font-semibold">
              Ver guia completo <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-zinc-950 px-6">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black font-outfit mb-4">O que dizem nossos clientes</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: "Carlos Mendes", role: "Empresário", text: "Processo 100% digital. Retirei o carro, assinei o contrato no celular e fui embora em 10 minutos. Impressionante.", rating: 5 },
              { name: "Ana Paula Lima", role: "Advogada", text: "Excelente frota, veículos sempre conservados. A transparência na vistoria com fotos me deu total confiança.", rating: 5 },
              { name: "Roberto Souza", role: "Consultor", text: "Uso mensalmente para viagens a trabalho. O histórico de locações organizado e o suporte rápido fazem toda diferença.", rating: 5 },
            ].map((t) => (
              <div key={t.name} className="bg-black border border-white/5 rounded-2xl p-8 hover:border-[#d4a017]/20 transition-all">
                <div className="flex mb-4">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} size={16} className="text-[#d4a017] fill-[#d4a017]" />
                  ))}
                </div>
                <p className="text-zinc-300 mb-6 leading-relaxed">"{t.text}"</p>
                <div>
                  <p className="text-white font-semibold">{t.name}</p>
                  <p className="text-zinc-500 text-sm">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Location / Google Maps */}
      <section className="py-24 bg-black px-6">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-[#d4a017] font-bold uppercase tracking-widest text-sm mb-4">Onde Estamos</h3>
              <h2 className="text-4xl md:text-5xl font-black font-outfit mb-6">Visite nossa Sede <br/> Pres. Vargas</h2>
              <p className="text-zinc-400 text-lg mb-8 leading-relaxed">
                Estamos estrategicamente localizados na Avenida Álvaro Maia, prontos para oferecer a melhor experiência em locação de veículos premium de Manaus.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-white/5 flex items-center justify-center text-[#d4a017] flex-shrink-0">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-white">Endereço</h4>
                    <p className="text-zinc-500 text-sm">Av. Álvaro Maia, 176-A — Pres. Vargas<br/>CEP 69025-360 — Manaus-AM</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-white/5 flex items-center justify-center text-[#d4a017] flex-shrink-0">
                    <Clock size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-white">Horário de Funcionamento</h4>
                    <p className="text-zinc-500 text-sm">Segunda a Sexta: 08:00 às 18:00<br/>Sábado: 08:00 às 12:00</p>
                  </div>
                </div>

                <div className="pt-4">
                  <a 
                    href="https://www.google.com/maps/search/?api=1&query=Av.+%C3%81lvaro+Maia,+176-A+-+Pres.+Vargas,+Manaus+-+AM,+69025-360"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 hover:border-[#d4a017]/50 hover:bg-white/10 transition-all font-bold text-sm text-white group"
                  >
                    <MapPin size={18} className="text-[#d4a017] group-hover:scale-110 transition-transform" />
                    Abrir no Google Maps
                  </a>
                </div>
              </div>
            </div>
            
            <div className="h-[450px] rounded-3xl overflow-hidden border border-white/10 shadow-2xl relative group/map">
              {/* Gold Focal Circle Overlay with MapPin Icon */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none flex flex-col items-center">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full border-2 border-[#d4a017] opacity-60 animate-ping absolute -inset-6"></div>
                  <div className="bg-black/60 backdrop-blur-sm p-3 rounded-2xl border border-[#d4a017] shadow-[0_0_30px_rgba(212,160,23,0.6)] group-hover/map:scale-110 transition-transform duration-500">
                    <MapPin size={32} className="text-[#d4a017] fill-[#d4a017]/20" />
                  </div>
                </div>
              </div>

              {/* Premium Badge over map */}
              <div className="absolute top-6 left-6 z-10 bg-black/80 backdrop-blur-md border border-[#d4a017]/30 px-4 py-2 rounded-xl flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#d4a017] shadow-[0_0_8px_#d4a017]"></div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#d4a017]">Localização Premium</span>
              </div>

              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3983.921345479024!2d-60.0267396!3d-3.111812!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x926c0ff6715f3cbd%3A0x64cf517e657c7e99!2sAv.%20%C3%81lvaro%20Maia%2C%20176a%20-%20Nossa%20Sra.%20das%20Gracas%2C%20Manaus%20-%20AM%2C%2069025-010!5e0!3m2!1spt-BR!2sbr!4v1711815000000!5m2!1spt-BR!2sbr"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="opacity-70 group-hover/map:opacity-100 transition-opacity duration-700 grayscale group-hover/map:grayscale-0"
              ></iframe>
              <div className="absolute inset-0 pointer-events-none border-[1px] border-white/5 rounded-3xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-[#d4a017] px-6">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-black font-outfit text-black mb-6 uppercase tracking-tighter">
            Pronto para a estrada?
          </h2>
          <p className="text-black/70 text-xl mb-10 max-w-xl mx-auto">Frota disponível agora. Reserve em menos de 3 minutos.</p>
          <Link href="/frota" className="inline-flex items-center gap-2 bg-black text-white font-bold px-10 py-4 rounded-2xl text-lg hover:bg-zinc-900 transition-colors shadow-xl">
            Ver Veículos Disponíveis <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      <Footer />

      {/* Floating WhatsApp Button */}
      <a
        href="https://wa.me/5592992921946"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-20 md:bottom-8 right-4 md:right-6 z-40 bg-[#25D366] text-white p-3.5 md:p-4 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all group animate-bounce-slow"
        aria-label="Falar no WhatsApp"
        style={{ marginBottom: "env(safe-area-inset-bottom)" }}
      >
        <MessageCircle size={24} className="fill-white/10" />
        <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-white text-black text-xs font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl border border-zinc-100 hidden md:block">
          Precisa de ajuda?
        </span>
      </a>
    </div>
  )
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="p-8 rounded-3xl bg-zinc-900/50 border border-white/5 hover:border-[#d4a017]/30 transition-all group">
      <div className="mb-6 group-hover:scale-110 transition-transform duration-500">{icon}</div>
      <h3 className="text-2xl font-bold mb-3 font-outfit">{title}</h3>
      <p className="text-zinc-400 leading-relaxed font-light">{desc}</p>
    </div>
  )
}
