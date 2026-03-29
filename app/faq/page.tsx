import { auth } from "@/auth"
import Navbar from "@/components/public/Navbar"
import Footer from "@/components/public/Footer"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

export const metadata = { title: "FAQ — Morauto" }

const faqs = [
  {
    category: "Reserva e Disponibilidade",
    items: [
      { q: "Como sei se um veículo está disponível?", a: "Nossa plataforma mostra em tempo real apenas os veículos com status DISPONÍVEL. Ao selecionar as datas, o sistema verifica automaticamente conflitos de reserva antes de confirmar." },
      { q: "Posso cancelar uma reserva?", a: "Sim. Cancelamentos com mais de 24h de antecedência têm estorno integral do caução. Cancelamentos com menos de 24h podem ter cobrança de taxa conforme regulamento." },
      { q: "Quanto tempo antes preciso reservar?", a: "Você pode reservar com até 90 dias de antecedência ou com mesmo dia, dependendo da disponibilidade. Recomendamos reservar com pelo menos 48h de antecedência." },
    ],
  },
  {
    category: "Documentos",
    id: "documentos",
    items: [
      { q: "Quais documentos são necessários para alugar?", a: "CNH válida (com no mínimo 1 ano), CPF, RG ou passaporte e comprovante de residência recente. Para PJ, adicione CNPJ e contrato social." },
      { q: "Motorista adicional é permitido?", a: "Sim, mediante cadastro prévio do condutor adicional com CNH válida. Pode haver taxa adicional conforme categoria do veículo." },
      { q: "Minha CNH digital é aceita?", a: "Sim, a CNH digital pelo app do Governo Federal tem validade jurídica e é aceita como documento oficial." },
    ],
  },
  {
    category: "Pagamento e Caução",
    items: [
      { q: "Qual o valor do caução?", a: "O caução varia por categoria: Econômico R$500, SUV R$1.500, Luxo R$3.000. É bloqueado no cartão ou via PIX e liberado em até 24h após a devolução sem avarias." },
      { q: "Quais formas de pagamento são aceitas?", a: "PIX, cartão de crédito, cartão de débito e transferência bancária. O caução pode ser bloqueado em cartão de crédito sem débito imediato." },
      { q: "O caução é debitado do meu cartão?", a: "Não — é apenas um bloqueio/pré-autorização que é liberado após a devolução do veículo em condições normais." },
    ],
  },
  {
    category: "Combustível e Quilometragem",
    items: [
      { q: "Qual a política de combustível?", a: "O veículo é entregue com tanque cheio e deve ser devolvido com o mesmo nível. Caso contrário, cobramos o abastecimento + taxa de serviço." },
      { q: "Existe limite de quilometragem?", a: "Alguns planos têm franquia de KM. O plano padrão diário inclui KM livre. Planos semanais e mensais podem ter limites — verifique na descrição de cada categoria." },
      { q: "O que acontece se eu ultrapassar o limite de KM?", a: "A quilometragem excedente é cobrada por km rodado, conforme tabela da categoria. O valor é calculado no encerramento da locação." },
    ],
  },
  {
    category: "Avarias e Multas",
    items: [
      { q: "O que acontece se eu bater o carro?", a: "Notifique nossa central imediatamente. Se você contratou proteção veicular, a franquia é limitada. Sem proteção, o custo integral é do locatário. Temos parceria com seguradoras para agilizar os processos." },
      { q: "Recebo multas de trânsito?", a: "Multas geradas no período da sua locação são vinculadas ao condutor responsável. A locadora repassa a multa ao cliente com taxa administrativa de R$30." },
      { q: "O que é a proteção veicular?", a: "É um serviço adicional opcional que limita sua responsabilidade em caso de danos ao veículo. Disponível em diferentes níveis de cobertura." },
    ],
  },
  {
    category: "Privacidade e Termos",
    id: "privacidade",
    items: [
      { q: "Como meus dados são usados?", a: "Seus dados são usados exclusivamente para prestação do serviço de locação. Não vendemos ou compartilhamos dados com terceiros sem seu consentimento. Cumprimos integralmente a LGPD." },
      { q: "Por quanto tempo meus dados são armazenados?", a: "Dados de locação são mantidos por 5 anos conforme exigência fiscal. Você pode solicitar exclusão de dados não obrigatórios a qualquer momento." },
    ],
  },
]

export default async function FAQPage() {
  const session = await auth()

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar session={session} />

      <section className="py-20 px-6 border-b border-white/5 text-center">
        <div className="container mx-auto max-w-2xl">
          <h1 className="text-5xl font-black font-outfit uppercase tracking-tighter mb-4">
            Perguntas <span className="text-[#d4a017]">Frequentes</span>
          </h1>
          <p className="text-zinc-400 text-lg">Tudo o que você precisa saber antes de alugar.</p>
        </div>
      </section>

      <section className="py-16 px-6">
        <div className="container mx-auto max-w-3xl space-y-12">
          {faqs.map((section) => (
            <div key={section.category} id={section.id}>
              <h2 className="text-[#d4a017] font-bold text-xs uppercase tracking-widest mb-6">{section.category}</h2>
              <div className="space-y-4">
                {section.items.map((item, i) => (
                  <details key={i} className="group bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                    <summary className="flex items-center justify-between px-6 py-5 cursor-pointer list-none hover:bg-zinc-800/50 transition-colors">
                      <span className="text-white font-medium pr-4">{item.q}</span>
                      <span className="text-zinc-500 group-open:rotate-180 transition-transform flex-shrink-0">▼</span>
                    </summary>
                    <div className="px-6 pb-5 text-zinc-400 leading-relaxed text-sm border-t border-zinc-800 pt-4">
                      {item.a}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="py-16 px-6 bg-zinc-950 text-center">
        <div className="container mx-auto max-w-xl">
          <h2 className="text-2xl font-bold font-outfit mb-3">Não encontrou o que procurava?</h2>
          <p className="text-zinc-400 mb-6">Entre em contato com nossa equipe pelo WhatsApp ou e-mail.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="https://wa.me/5511999990000" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3 rounded-xl transition-colors">
              WhatsApp
            </a>
            <Link href="/frota" className="inline-flex items-center gap-2 bg-[#d4a017] hover:bg-[#b8860b] text-black font-bold px-6 py-3 rounded-xl transition-colors">
              Ver Frota <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
