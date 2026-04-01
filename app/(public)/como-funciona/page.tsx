import { auth } from "@/auth"
import Navbar from "@/components/public/Navbar"
import Footer from "@/components/public/Footer"
import Link from "next/link"
import {
  Search, FileText, KeyRound, RotateCcw, ShieldCheck,
  Smartphone, CreditCard, ClipboardCheck, Star, ArrowRight
} from "lucide-react"

export const metadata = { title: "Como Funciona — Morauto" }

export default async function ComoFuncionaPage() {
  const session = await auth()

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar session={session} />

      {/* Hero */}
      <section className="py-24 px-6 text-center border-b border-white/5">
        <div className="container mx-auto max-w-3xl">
          <h1 className="text-5xl md:text-7xl font-black font-outfit uppercase tracking-tighter mb-6">
            Como <span className="text-[#d4a017]">Funciona</span>
          </h1>
          <p className="text-zinc-400 text-xl leading-relaxed">
            Do primeiro acesso até devolver as chaves — um processo simples, digital e transparente.
          </p>
        </div>
      </section>

      {/* Steps */}
      <section className="py-24 px-6">
        <div className="container mx-auto max-w-4xl">
          <div className="space-y-12">
            {[
              {
                step: "01", icon: <Search size={28} />, color: "text-blue-400 bg-blue-400/10 border-blue-400/20",
                title: "Busque e Escolha",
                desc: "Acesse nosso portal e use os filtros para encontrar o veículo perfeito — por categoria, câmbio, combustível, preço e disponibilidade de datas.",
                items: ["Filtros avançados de busca", "Disponibilidade em tempo real", "Comparação de preços e categorias", "Galeria de fotos dos veículos"],
              },
              {
                step: "02", icon: <FileText size={28} />, color: "text-amber-400 bg-amber-400/10 border-amber-400/20",
                title: "Faça sua Reserva",
                desc: "Preencha seus dados, escolha o período e confirme a reserva. Se for seu primeiro aluguel, cadastre seus documentos — só precisa fazer isso uma vez.",
                items: ["Reserva em menos de 3 minutos", "Caução bloqueado via PIX ou cartão", "Confirmação instantânea por e-mail", "Contrato gerado automaticamente"],
              },
              {
                step: "03", icon: <KeyRound size={28} />, color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
                title: "Retire com Vistoria Digital",
                desc: "Na unidade, nossa equipe faz o checklist digital do veículo com fotos. Você assina o termo de vistoria e o contrato direto no sistema — sem papel.",
                items: ["Checklist com 9 pontos de inspeção", "Registro de fotos na saída", "Assinatura digital do contrato", "Liberação rápida — até 10 minutos"],
              },
              {
                step: "04", icon: <RotateCcw size={28} />, color: "text-purple-400 bg-purple-400/10 border-purple-400/20",
                title: "Devolva e Encerre",
                desc: "Na devolução, nova vistoria é feita e comparada com a de saída. Qualquer diferença é documentada. O caução é liberado em até 24h após o encerramento.",
                items: ["Comparativo fotográfico saída x retorno", "Cálculo automático de extras e atraso", "Liberação do caução em 24h", "Avaliação da experiência"],
              },
            ].map((item, i) => (
              <div key={item.step} className="flex flex-col md:flex-row gap-8 items-start">
                <div className="flex-shrink-0">
                  <div className={`w-16 h-16 rounded-2xl border flex items-center justify-center ${item.color}`}>
                    {item.icon}
                  </div>
                </div>
                <div className="flex-1 bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-zinc-600 text-xs font-bold tracking-widest">{item.step}</span>
                    <h3 className="text-2xl font-bold font-outfit">{item.title}</h3>
                  </div>
                  <p className="text-zinc-400 leading-relaxed mb-6">{item.desc}</p>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {item.items.map((point) => (
                      <li key={point} className="flex items-center gap-2 text-sm text-zinc-300">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#d4a017] flex-shrink-0" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Requirements */}
      <section className="py-24 bg-zinc-950 px-6">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-black font-outfit text-center mb-12">Requisitos para Alugar</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: <ShieldCheck size={24} className="text-[#d4a017]" />, title: "Documentos", items: ["CNH válida e dentro do prazo", "CPF e RG", "Comprovante de residência", "Cartão de crédito (caução)"] },
              { icon: <Star size={24} className="text-[#d4a017]" />, title: "Condições", items: ["Idade mínima de 21 anos", "CNH com no mínimo 1 ano", "Sem restrições no Serasa", "Documento sem irregularidades"] },
              { icon: <CreditCard size={24} className="text-[#d4a017]" />, title: "Pagamento", items: ["PIX", "Cartão de crédito", "Cartão de débito", "Transferência bancária"] },
            ].map((section) => (
              <div key={section.title} className="bg-black border border-zinc-800 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-5">
                  {section.icon}
                  <h3 className="text-white font-semibold">{section.title}</h3>
                </div>
                <ul className="space-y-2">
                  {section.items.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-zinc-400">
                      <div className="w-1.5 h-1.5 rounded-full bg-zinc-600 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 text-center">
        <div className="container mx-auto max-w-2xl">
          <h2 className="text-4xl font-black font-outfit mb-4">Pronto para começar?</h2>
          <p className="text-zinc-400 mb-8">Escolha seu veículo e faça sua reserva agora.</p>
          <Link href="/frota" className="inline-flex items-center gap-2 bg-[#d4a017] hover:bg-[#b8860b] text-black font-bold px-10 py-4 rounded-2xl text-lg transition-colors">
            Ver Frota Disponível <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  )
}
