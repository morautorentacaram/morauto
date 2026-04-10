import { getContractById } from "@/app/actions/contract.actions"
import { notFound } from "next/navigation"
import Link from "next/link"
import ContractPdfButton from "@/components/admin/ContractPdfButton"
import SendForSignatureButton from "@/components/admin/SendForSignatureButton"
import {
  ArrowLeft, CheckCircle, Clock, Car, User, Building2,
  DollarSign, FileText, ShieldAlert, Wrench,
  AlertTriangle, Scale,
} from "lucide-react"

export const dynamic = "force-dynamic"
export const metadata = { title: "Contrato — Morauto Admin" }

const TZ = "America/Manaus"

function fmt(v: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v)
}
function fmtDate(d: Date | string) {
  return new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: TZ })
}
function fmtDateTime(d: Date | string) {
  const dt = new Date(d)
  const time = dt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: TZ })
  return `${time}h — ${fmtDate(dt)}`
}
function fmtDateLong(d: Date | string) {
  return new Date(d).toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric", timeZone: TZ })
}

export default async function ContractDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id }   = await params
  const contract = await getContractById(id)
  if (!contract) notFound()

  const { reservation, customer } = contract
  const { vehicle }   = reservation
  const payment       = reservation.payments?.[0]
  const days          = Math.max(1, Math.ceil(
    (new Date(reservation.endDate).getTime() - new Date(reservation.startDate).getTime()) / 86400000
  ))
  const dailyRate    = Number(vehicle.category.dailyRate)
  const depositValue = Number(vehicle.category.depositValue ?? 0)
  const totalValue   = Number(reservation.totalValue)
  const tax10pct     = totalValue * 0.1

  const paymentLabel =
    payment?.status === "PAID"                ? "PAGO"
    : payment?.method === "PIX"               ? "PIX"
    : payment?.method === "CREDIT_CARD"       ? "Cartão de Crédito"
    : payment?.method === "DEBIT_CARD"        ? "Cartão de Débito"
    : payment?.method === "CASH"              ? "Dinheiro"
    : payment?.method === "BANK_TRANSFER"     ? "Transferência Bancária"
    : "A combinar"

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-4">

      {/* Toolbar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <Link href="/admin/contratos"
          className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm">
          <ArrowLeft size={16} /> Voltar
        </Link>
        <div className="flex items-center gap-3">
          <SendForSignatureButton
            contractId={contract.id}
            isSent={!!contract.docusealSubmissionId}
            isSigned={!!contract.signedAt}
          />
          <ContractPdfButton contract={contract} />
        </div>
      </div>

      {/* Contract card */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden print:shadow-none">

        {/* ── Header ── */}
        <div className="bg-black px-8 pt-8 pb-6 border-b border-zinc-800">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-3xl font-black text-white font-outfit uppercase tracking-tighter">
                Morauto<span className="text-[#d4a017]">.</span>
              </h1>
              <p className="text-zinc-500 text-xs mt-0.5">LOCADORA DE VEÍCULOS E MÁQUINAS</p>
              <p className="text-zinc-600 text-xs">CNPJ: 22.994.313/0001-45</p>
            </div>
            <div className="text-right space-y-1">
              <p className="text-[#d4a017] font-mono font-bold text-lg">{contract.number}</p>
              <p className="text-zinc-500 text-xs">Gerado em {fmtDate(contract.createdAt)}</p>
              {contract.signedAt ? (
                <div className="flex items-center gap-1.5 text-emerald-400 text-xs justify-end">
                  <CheckCircle size={12} /> Assinado em {fmtDate(contract.signedAt)}
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-amber-400 text-xs justify-end">
                  <Clock size={12} /> Aguardando assinatura
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-zinc-800 text-center">
            <h2 className="text-white font-bold text-xl tracking-wide uppercase">
              Contrato de Locação de Automóvel de Prazo Determinado
            </h2>
          </div>
        </div>

        <div className="p-8 space-y-7">

          {/* ── Partes ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            {/* Locadora */}
            <div className="bg-zinc-950/60 border border-zinc-800 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Building2 size={14} className="text-[#d4a017]" />
                <h3 className="text-[#d4a017] text-xs font-bold uppercase tracking-wider">Locadora</h3>
              </div>
              <p className="text-white font-bold text-sm">MORAUTO LOCADORA DE VEÍCULOS E MÁQUINAS LTDA</p>
              <div className="mt-3 space-y-1 text-xs text-zinc-400">
                <p>CNPJ: 22.994.313/0001-45</p>
                <p>Av. Álvaro Maia, N.176-A — Pres. Vargas</p>
                <p>CEP 69025-360 — Manaus-AM</p>
                <p>(92) 3622-2883 / 99292-1946</p>
                <p>morautolucadora@hotmail.com</p>
              </div>
            </div>

            {/* Locatário */}
            <div className="bg-zinc-950/60 border border-zinc-800 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <User size={14} className="text-[#d4a017]" />
                <h3 className="text-[#d4a017] text-xs font-bold uppercase tracking-wider">Locatário</h3>
              </div>
              <p className="text-white font-bold text-sm">{customer.user.name?.toUpperCase()}</p>
              <div className="mt-3 space-y-1 text-xs text-zinc-400">
                <p>CPF/CNPJ: {customer.document}</p>
                <p>Telefone: {customer.phone ?? "Não informado"}</p>
                <p>Endereço: {customer.address ?? "Não informado"}</p>
                <p>CNH: {customer.cnh ?? "—"}
                  {customer.cnhExpiration
                    ? <span className="ml-2 text-zinc-500">Validade: {fmtDate(customer.cnhExpiration)}</span>
                    : ""
                  }
                </p>
              </div>
            </div>
          </div>

          {/* ── Objeto: Veículo ── */}
          <div>
            <SectionTitle icon={<Car size={14} />} label="Do Objeto do Contrato — Veículo" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
              {[
                { l: "Marca/Modelo",  v: `${vehicle.brand} ${vehicle.model}${vehicle.version ? " " + vehicle.version : ""}` },
                { l: "Placa",         v: vehicle.plate,       bold: true, gold: true },
                { l: "Ano",           v: String(vehicle.year) },
                { l: "Cor",           v: vehicle.color ?? "—" },
                { l: "RENAVAM",       v: vehicle.renavam ?? "—" },
                { l: "Chassi",        v: vehicle.chassi ?? "—", small: true },
                { l: "Categoria",     v: vehicle.category.name },
                { l: "KM Saída",      v: `${(vehicle.km ?? 0).toLocaleString("pt-BR")} km` },
              ].map(({ l, v, gold: g, small }) => (
                <div key={l} className="bg-zinc-950/60 border border-zinc-800 rounded-xl p-3">
                  <p className="text-zinc-500 text-xs uppercase tracking-wider">{l}</p>
                  <p className={`mt-1 font-medium ${small ? "text-xs" : "text-sm"} ${g ? "text-[#d4a017] font-mono font-bold" : "text-white"}`}>{v}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Período e Valores ── */}
          <div>
            <SectionTitle icon={<DollarSign size={14} />} label="Período, Valores e Condições Financeiras" />
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
              <InfoCell label="Retirada"       value={fmtDateTime(reservation.startDate)} />
              <InfoCell label="Devolução"      value={fmtDateTime(reservation.endDate)} />
              <InfoCell label="Duração"        value={`${days} dia(s)`} />
              <InfoCell label="Diária"         value={fmt(dailyRate)} />
              <InfoCell label="Valor Total"    value={fmt(totalValue)} gold />
              {depositValue > 0 && <InfoCell label="Caução/Garantia" value={fmt(depositValue)} />}
              <InfoCell label="Franquia km/dia" value="214,28 km/dia" />
              <InfoCell label="Km excedente"   value="R$ 0,58 por km" />
              <InfoCell label="Taxa admin."     value={`10% (${fmt(tax10pct)}) sobre extras`} />
              <InfoCell label="Limite semanal" value="1.000 km/semana" />
              <InfoCell
                label="Forma de Pagamento"
                value={paymentLabel}
                color={payment?.status === "PAID" ? "text-emerald-400" : "text-amber-400"}
              />
            </div>
          </div>

          {/* ── Cláusulas ── */}
          <div>
            <SectionTitle icon={<FileText size={14} />} label="Normas e Cláusulas Gerais" />
            <div className="mt-3 space-y-2">
              {[
                { n: "1", t: "REABASTECIMENTO", b: "Em caso de devolução com combustível inferior ao recebido, o tanque será completado (gasolina, mesmo que bicombustível). O abastecimento e taxas serão cobrados no contrato. O combustível gasto no percurso até a entrega é de responsabilidade do cliente." },
                { n: "2", t: "LIMPEZA DO VEÍCULO", b: "Deve ser devolvido nas mesmas condições de limpeza. Em devolução divergente: lavagem simples R$ 50,00. Manchas nos forros ou odores: higienização a partir de R$ 300,00." },
                { n: "3", t: "DOCUMENTOS PERDIDOS (Não devolvidos)", b: "Custo de R$ 300,00 + 3 (três) diárias de locação caso não sejam devolvidos junto com o veículo." },
                { n: "4", t: "RETIRADA DE VEÍCULO REBOCADO", b: "Valor de R$ 500,00, fora os custos de multa e reboque, em casos de culpabilidade do condutor." },
                { n: "5", t: "TAXAS DE ENTREGA/DEVOLUÇÃO", b: "Veículo entregue ou recebido fora da locadora em horário não comercial: taxa de R$ 30,00 por evento (Entrega ou Devolução)." },
                { n: "6", t: "CHAVE DO VEÍCULO", b: "O desaparecimento da chave terá reposição cobrada conforme o modelo (Chave codificada ou Integrada com alarme)." },
                { n: "7", t: "HORAS EXTRAS", b: "A diária é de 24 horas. Hora extra = 1/6 da diária por hora. Após a 6ª hora extra, cobra-se diária integral. A Locadora não se responsabiliza por veículos trancados com a chave em seu interior." },
                { n: "8", t: "DEVOLUÇÃO DE VALORES", b: "A MORAUTO reserva-se o direito de deixar crédito para futura locação ou devolver o valor via DOC/TED em até 30 dias após o fechamento do contrato, com cobrança da Taxa de Reembolso." },
                { n: "9", t: "RESPONSABILIDADE POR MULTAS", b: "O Locatário é responsável por todas as multas de trânsito incidentes durante o período de locação, nos termos do art. 257 do CTB." },
                { n: "10", t: "SUBLOCAÇÃO PROIBIDA", b: "É expressamente proibida a sublocação total ou parcial do veículo, bem como sua utilização para fins ilícitos ou transporte remunerado sem prévia autorização escrita da Locadora." },
                { n: "11", t: "TAXA ADMINISTRATIVA", b: "Todo serviço adicional e/ou despesa terá seu valor somado com a taxa administrativa de 10% discriminada neste contrato." },
                { n: "12", t: "TROCA DE PNEUS", b: "Em caso de furo ou dano nos pneus durante o período de locação, a responsabilidade pela troca e custo é do Locatário." },
              ].map((c) => (
                <div key={c.n} className="flex gap-3 bg-zinc-950/50 border border-zinc-800 rounded-xl p-4">
                  <div className="w-6 h-6 rounded-full bg-[#d4a017]/10 border border-[#d4a017]/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-[#d4a017] text-xs font-bold">{c.n}</span>
                  </div>
                  <div>
                    <p className="text-white text-xs font-bold mb-1">{c.t}</p>
                    <p className="text-zinc-400 text-xs leading-relaxed">{c.b}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Exclusão de Proteção ── */}
          <div>
            <SectionTitle icon={<ShieldAlert size={14} />} label="Exclusão da Proteção" />
            <div className="mt-3 bg-red-950/20 border border-red-800/30 rounded-xl p-5">
              <p className="text-zinc-300 text-sm leading-relaxed mb-3">
                O Locatário é <strong className="text-white">100% responsável</strong> por qualquer dano, roubo, furto ou assistência. O LOCATÁRIO será responsável pelo total dos danos ao veículo alugado, independente de culpa do sinistro, na eventualidade de:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {[
                  "a) Uso indevido do veículo",
                  "b) Danos aos vidros, rodas, bancos e/ou acessórios",
                  "c) Dirigir em violação de qualquer lei de trânsito",
                  "d) Permitir uso por motorista não autorizado por escrito",
                  "e) O cliente está ciente que o veículo NÃO possui seguro",
                  "f) O locatário é responsável pela manutenção do veículo",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-2 text-xs text-zinc-400">
                    <AlertTriangle size={11} className="text-red-400 flex-shrink-0 mt-0.5" />
                    {item}
                  </div>
                ))}
              </div>
              <p className="mt-4 text-red-400 text-xs font-bold uppercase tracking-wide">
                ⚠ VEÍCULO NÃO AUTORIZADO A ULTRAPASSAR A FRONTEIRA BRASIL/VENEZUELA — uso restrito à cidade de Manaus-AM.
              </p>
            </div>
          </div>

          {/* ── Autorização de Débito ── */}
          <div>
            <SectionTitle icon={<DollarSign size={14} />} label="Assinatura Garantida — Autorização Prévia" />
            <div className="mt-3 bg-zinc-950/60 border border-zinc-800 rounded-xl p-5 space-y-3 text-xs text-zinc-400 leading-relaxed">
              <p>
                <strong className="text-white">I.</strong> Como cliente titular, autorizo a <strong className="text-white">MORAUTO LOCADORA DE VEÍCULOS E MÁQUINAS LTDA — CNPJ 22.994.313/0001-45</strong> a debitar nos meus cartões de crédito/débito ou emitir cobrança em meu nome para reembolsar multas de trânsito, combustível, avarias, limpeza e outras despesas adicionais apontadas no check-list de devolução, acrescidas da taxa administrativa prevista neste contrato.
              </p>
              <p>
                <strong className="text-white">II.</strong> Autorizo ainda a Locadora a informar meus dados pessoais aos órgãos de trânsito como <strong className="text-white">CONDUTOR(A) DO VEÍCULO LOCADO</strong>, para fins de responsabilidade pelas multas de trânsito relativas ao período deste contrato, nos termos do art. 257 do CTB e conforme a Resolução CONTRAN N. 461, DE 12/11/2013.
              </p>
              <p className="text-zinc-500">
                Declaro que li e conheço as cláusulas e condições contratuais da MORAUTO LOCADORA DE VEÍCULOS, cujo exemplar recebo neste ato.
              </p>
            </div>
          </div>

          {/* ── Foro ── */}
          <div>
            <SectionTitle icon={<Scale size={14} />} label="Do Foro" />
            <div className="mt-3 bg-zinc-950/60 border border-zinc-800 rounded-xl p-4">
              <p className="text-zinc-400 text-sm">
                <strong className="text-white">Cláusula 2ª.</strong> Para dirimir quaisquer controvérsias oriundas do contrato, as partes elegem o foro da comarca de <strong className="text-white">Manaus — Amazonas</strong>.
              </p>
              <p className="mt-3 text-zinc-500 text-sm">
                Por estarem assim justos e contratados, firmam o presente instrumento em duas vias de igual teor, juntamente com 2 (duas) testemunhas.
              </p>
              <p className="mt-3 text-zinc-400 text-sm text-center font-medium">
                Manaus, {fmtDateLong(reservation.startDate)}
              </p>
            </div>
          </div>

          {/* ── Assinaturas ── */}
          <div>
            <SectionTitle icon={<Wrench size={14} />} label="Assinaturas" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              {/* Locadora */}
              <div className="text-center">
                {contract.signedAt ? (
                  <div className="h-16 flex items-center justify-center bg-emerald-950/30 border border-emerald-700/30 rounded-xl mb-3">
                    <div className="text-emerald-400 text-sm font-bold">✓ Assinado digitalmente</div>
                  </div>
                ) : (
                  <div className="h-16 border-b-2 border-dashed border-zinc-700 mb-3" />
                )}
                <p className="text-white text-xs font-bold uppercase">Morauto Locadora de Veículos</p>
                <p className="text-zinc-500 text-xs">(LOCADORA)</p>
                <p className="text-zinc-600 text-xs">CNPJ 22.994.313/0001-45</p>
              </div>

              {/* Locatário */}
              <div className="text-center">
                {contract.digitalSignature ? (
                  <div className="h-16 flex items-center justify-center bg-emerald-950/30 border border-emerald-700/30 rounded-xl mb-3">
                    <div className="text-emerald-400 text-sm font-bold">✓ Assinado digitalmente</div>
                  </div>
                ) : (
                  <div className="h-16 border-b-2 border-dashed border-zinc-700 mb-3" />
                )}
                <p className="text-white text-xs font-bold uppercase">{customer.user.name}</p>
                <p className="text-zinc-500 text-xs">(LOCATÁRIO)</p>
                <p className="text-zinc-600 text-xs">CPF/CNPJ: {customer.document}</p>
              </div>
            </div>

            {/* Witnesses */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              {["Testemunha 1", "Testemunha 2"].map((t) => (
                <div key={t} className="text-center">
                  <div className="h-10 border-b border-dashed border-zinc-700 mb-2" />
                  <p className="text-zinc-600 text-xs">(Nome, RG e Assinatura da {t})</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Vistorias vinculadas ── */}
          {contract.inspections.length > 0 && (
            <div>
              <SectionTitle icon={<Wrench size={14} />} label="Vistorias Vinculadas" />
              <div className="mt-3 space-y-3">
                {contract.inspections.map((insp: any) => (
                  <div key={insp.id} className="flex items-center justify-between bg-zinc-950/60 border border-zinc-800 rounded-xl px-5 py-3 text-sm">
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                        insp.type === "DEPARTURE" ? "bg-blue-400/10 text-blue-400 border-blue-400/20" : "bg-emerald-400/10 text-emerald-400 border-emerald-400/20"
                      }`}>
                        {insp.type === "DEPARTURE" ? "Retirada" : "Devolução"}
                      </span>
                      <span className="text-zinc-300">{insp.inspectorName}</span>
                    </div>
                    <div className="text-zinc-400 text-sm">
                      {insp.km.toLocaleString("pt-BR")} km · {insp.fuelLevel}% combustível
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Notas legais ── */}
          <div className="border-t border-zinc-800 pt-5 text-zinc-600 text-xs space-y-1">
            <p><strong>Nota 1.</strong> A Locação de Coisas rege-se pelo previsto nos Arts. 1188 a 1215 do Código Civil.</p>
            <p><strong>Nota 2.</strong> Art. 1192 do Código Civil.</p>
            <p><strong>Nota 3.</strong> Art. 1196 do Código Civil.</p>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-black border-t border-zinc-800 px-8 py-5 text-center space-y-1">
          <p className="text-white font-bold text-sm font-outfit">MORAUTO LOCADORA DE VEÍCULOS E MÁQUINAS EIRELI</p>
          <p className="text-zinc-500 text-xs">CNPJ: 22.994.313/0001-45</p>
          <p className="text-zinc-600 text-xs">Av. Álvaro Maia 176-A · Pres. Vargas · CEP 69025-360 · Manaus-AM</p>
          <p className="text-zinc-600 text-xs">(92) 3622-2883 / 99292-1946 · SEG a SEX: 8h às 17h | SÁB: 8h às 13h</p>
        </div>
      </div>
    </div>
  )
}

function SectionTitle({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 mb-1">
      <span className="text-[#d4a017]">{icon}</span>
      <h3 className="text-white font-bold text-sm uppercase tracking-wide">{label}</h3>
      <div className="flex-1 h-px bg-zinc-800 ml-2" />
    </div>
  )
}

function InfoCell({ label, value, gold, color }: {
  label: string; value: string; gold?: boolean; color?: string
}) {
  return (
    <div className="bg-zinc-950/60 border border-zinc-800 rounded-xl p-3">
      <p className="text-zinc-500 text-xs uppercase tracking-wider">{label}</p>
      <p className={`mt-1 text-sm font-semibold ${gold ? "text-[#d4a017]" : color ?? "text-white"}`}>{value}</p>
    </div>
  )
}
