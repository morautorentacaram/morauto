import { Car, ShieldCheck, Clock, CheckCircle2, Search, ChevronRight } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden bg-black text-white px-6">
        {/* Background Gradient/Image Placeholder */}
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-zinc-900 to-black opacity-80" />
        <div className="absolute inset-0 z-0 opacity-30 bg-[url('https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80')] bg-cover bg-center" />
        
        <div className="container relative z-10 mx-auto text-center">
          <h1 className="text-5xl md:text-8xl font-black mb-6 tracking-tighter uppercase font-outfit">
            A Experiência <span className="text-[#d4a017]">Premium</span> <br/> de Locação.
          </h1>
          <p className="text-xl md:text-2xl text-zinc-400 mb-10 max-w-2xl mx-auto font-light leading-relaxed">
            Frota exclusiva, vistoria digital e contratos inteligentes. Mobilidade sem atrito para quem exige o melhor.
          </p>
          
          <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
            <button className="px-6 py-3 rounded-full font-semibold transition-all duration-300 bg-[#d4a017] text-black hover:bg-[#b8860b] hover:shadow-lg hover:shadow-[#d4a017]/50 flex items-center gap-2 text-lg">
              Reservar Agora <ChevronRight size={20} />
            </button>
            <a href="/frota" className="px-8 py-3 rounded-full font-semibold border border-white/20 bg-white/5 backdrop-blur-sm transition-all hover:bg-white/10 text-lg">
              Ver Frota
            </a>
          </div>
        </div>

        {/* Quick Search Widget */}
        <form action="/frota" method="GET" className="absolute bottom-[-40px] left-1/2 -translate-x-1/2 w-[90%] max-w-4xl bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-3xl shadow-2xl flex flex-col md:flex-row gap-4 items-end bg-black/60 backdrop-blur-2xl">
          <div className="flex-1 space-y-2 w-full">
            <label className="text-xs uppercase tracking-widest text-zinc-400 font-bold ml-1 block">Retirada</label>
            <input name="city" type="text" placeholder="Selecione a cidade" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 placeholder:text-zinc-500 outline-none focus:border-[#d4a017]/50 transition-all font-light" />
          </div>
          <div className="flex-1 space-y-2 w-full">
            <label className="text-xs uppercase tracking-widest text-zinc-400 font-bold ml-1 block">Período</label>
            <input name="date" type="date" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-[#d4a017]/50 transition-all text-white font-light color-scheme-dark" style={{colorScheme: 'dark'}} />
          </div>
          <button type="submit" className="w-full md:w-auto px-10 py-3 rounded-xl bg-[#d4a017] text-black font-bold hover:bg-[#b8860b] transition-all flex items-center justify-center gap-2 h-[50px]">
            <Search size={20} /> Buscar
          </button>
        </form>
      </section>

      {/* Features Section */}
      <section className="py-32 bg-white dark:bg-zinc-950 px-6">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <FeatureCard 
              icon={<ShieldCheck className="text-[#d4a017]" size={40} />}
              title="Vistoria 100% Digital"
              desc="Adeus papelada. Checklist com fotos na palma da sua mão na entrega e devolução."
            />
            <FeatureCard 
              icon={<Clock className="text-[#d4a017]" size={40} />}
              title="Reserva em Tempo Real"
              desc="Consulte disponibilidade exata e preços dinâmicos instantaneamente."
            />
            <FeatureCard 
              icon={<CheckCircle2 className="text-[#d4a017]" size={40} />}
              title="PIX Automático"
              desc="Pagamento e liberação do caução via Banco do Brasil com conciliação imediata."
            />
          </div>
        </div>
      </section>
    </main>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="p-8 rounded-3xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/5 hover:border-[#d4a017]/30 transition-all group">
      <div className="mb-6 group-hover:scale-110 transition-transform duration-500">{icon}</div>
      <h3 className="text-2xl font-bold mb-3 font-outfit">{title}</h3>
      <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed font-light">{desc}</p>
    </div>
  );
}
