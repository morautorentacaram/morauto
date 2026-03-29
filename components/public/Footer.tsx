import Link from "next/link"
import { Phone, Mail, MapPin, Share2 } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-zinc-950 border-t border-white/5 text-zinc-400">
      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <h2 className="text-2xl font-black text-white font-outfit uppercase tracking-tighter mb-3">
              Morauto<span className="text-[#d4a017]">.</span>
            </h2>
            <p className="text-sm leading-relaxed mb-6">
              Locadora de veículos premium com foco em tecnologia, transparência e experiência superior ao cliente.
            </p>
            <div className="flex items-center gap-3">
              <a href="#" className="w-9 h-9 rounded-full bg-white/5 hover:bg-[#d4a017]/20 flex items-center justify-center transition-colors">
                <Share2 size={16} />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Empresa</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/como-funciona" className="hover:text-white transition-colors">Como Funciona</Link></li>
              <li><Link href="/frota" className="hover:text-white transition-colors">Nossa Frota</Link></li>
              <li><Link href="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Cliente</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/minhas-reservas" className="hover:text-white transition-colors">Minhas Reservas</Link></li>
              <li><Link href="/login" className="hover:text-white transition-colors">Entrar</Link></li>
              <li><Link href="/faq#documentos" className="hover:text-white transition-colors">Documentos Necessários</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Contato</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <Phone size={14} className="text-[#d4a017] flex-shrink-0" />
                <span>(11) 99999-0000</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={14} className="text-[#d4a017] flex-shrink-0" />
                <span>contato@morauto.com.br</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin size={14} className="text-[#d4a017] flex-shrink-0 mt-0.5" />
                <span>Av. Principal, 1000 — São Paulo, SP</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-zinc-600">
          <p>© {new Date().getFullYear()} Morauto Locadora de Veículos. Todos os direitos reservados.</p>
          <div className="flex items-center gap-6">
            <Link href="/faq#privacidade" className="hover:text-zinc-400 transition-colors">Política de Privacidade</Link>
            <Link href="/faq#termos" className="hover:text-zinc-400 transition-colors">Termos de Uso</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
