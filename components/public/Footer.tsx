import Link from "next/link"
import { Phone, Mail, MapPin } from "lucide-react"
import Image from "next/image"

export default function Footer() {
  return (
    <footer className="bg-zinc-950 border-t border-white/5 text-zinc-400">
      <div className="container mx-auto px-5 md:px-6">
        {/* Desktop: 4-col grid */}
        <div className="hidden md:grid grid-cols-4 gap-12 py-16 mb-0">
          <div>
            <Image src="/logo.png" alt="Morauto" width={130} height={44} className="object-contain mb-3" />
            <p className="text-sm leading-relaxed">
              Locadora de veículos premium com foco em tecnologia, transparência e experiência superior ao cliente.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Empresa</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/como-funciona" className="hover:text-white transition-colors">Como Funciona</Link></li>
              <li><Link href="/frota" className="hover:text-white transition-colors">Nossa Frota</Link></li>
              <li><Link href="/comprar" className="hover:text-white transition-colors">Veículos à Venda</Link></li>
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
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Contato</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <Phone size={14} className="text-[#d4a017] flex-shrink-0" />
                <a href="tel:+559236222883" className="hover:text-white transition-colors">(92) 3622-2883</a>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={14} className="text-emerald-500 flex-shrink-0" />
                <a href="https://wa.me/5592992921946" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">(92) 99292-1946 (WhatsApp)</a>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={14} className="text-[#d4a017] flex-shrink-0" />
                <a href="mailto:morautolucadora@hotmail.com" className="hover:text-white transition-colors">morautolucadora@hotmail.com</a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin size={14} className="text-[#d4a017] flex-shrink-0 mt-0.5" />
                <span>Av. Álvaro Maia, 176-A — Pres. Vargas<br />CEP 69025-360 — Manaus-AM</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Mobile: compact single block */}
        <div className="md:hidden py-8 space-y-6">
          {/* Brand */}
          <div>
            <Image src="/logo.png" alt="Morauto" width={110} height={36} className="object-contain mb-1" />
            <p className="text-xs leading-relaxed text-zinc-500">Locadora de veículos premium — Manaus, AM</p>
          </div>

          {/* Quick links grid */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-2.5 text-sm">
            <Link href="/frota" className="hover:text-white transition-colors">Frota</Link>
            <Link href="/minhas-reservas" className="hover:text-white transition-colors">Minhas Reservas</Link>
            <Link href="/comprar" className="hover:text-white transition-colors">Comprar</Link>
            <Link href="/login" className="hover:text-white transition-colors">Entrar</Link>
            <Link href="/como-funciona" className="hover:text-white transition-colors">Como Funciona</Link>
            <Link href="/faq" className="hover:text-white transition-colors">FAQ</Link>
          </div>

          {/* Contact strip */}
          <div className="flex flex-wrap gap-3">
            <a href="tel:+559236222883" className="flex items-center gap-1.5 text-xs bg-zinc-900 border border-zinc-800 px-3 py-2 rounded-xl hover:border-zinc-700 transition-colors">
              <Phone size={12} className="text-[#d4a017]" /> (92) 3622-2883
            </a>
            <a href="https://wa.me/5592992921946" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs bg-zinc-900 border border-zinc-800 px-3 py-2 rounded-xl hover:border-zinc-700 transition-colors">
              <Phone size={12} className="text-emerald-500" /> WhatsApp
            </a>
            <a href="mailto:morautolucadora@hotmail.com" className="flex items-center gap-1.5 text-xs bg-zinc-900 border border-zinc-800 px-3 py-2 rounded-xl hover:border-zinc-700 transition-colors">
              <Mail size={12} className="text-[#d4a017]" /> E-mail
            </a>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/5 py-5 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-zinc-600">
          <p>© {new Date().getFullYear()} Morauto Locadora de Veículos. Todos os direitos reservados.</p>
          <div className="flex items-center gap-5">
            <Link href="/faq#privacidade" className="hover:text-zinc-400 transition-colors">Privacidade</Link>
            <Link href="/faq#termos" className="hover:text-zinc-400 transition-colors">Termos</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
