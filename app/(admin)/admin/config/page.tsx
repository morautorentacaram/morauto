export const metadata = { title: "Configurações — Morauto Admin" }

export default function ConfigPage() {
  return (
    <div className="space-y-8 p-6 max-w-3xl">
      <div>
        <h2 className="text-3xl font-outfit font-bold text-white tracking-tight">Configurações</h2>
        <p className="text-zinc-400 mt-2">Dados da empresa, regras de negócio e integrações.</p>
      </div>

      {/* Company info */}
      <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <h3 className="text-white font-semibold mb-5">Dados da Empresa</h3>
        <div className="space-y-4">
          {[
            { label: "Razão Social", placeholder: "Morauto Locadora de Veículos e Máquinas Ltda.", name: "companyName" },
            { label: "CNPJ", placeholder: "22.994.313/0001-45", name: "cnpj" },
            { label: "E-mail", placeholder: "morautolucadora@hotmail.com", name: "email" },
            { label: "Telefone", placeholder: "(92) 3622-2883", name: "phone" },
            { label: "Endereço", placeholder: "Av. Álvaro Maia, 176-A — Pres. Vargas, Manaus-AM", name: "address" },
            { label: "Site", placeholder: "https://morauto.com.br", name: "website" },
          ].map((f) => (
            <div key={f.name} className="grid grid-cols-3 gap-4 items-center">
              <label className="text-zinc-400 text-sm col-span-1">{f.label}</label>
              <input name={f.name} placeholder={f.placeholder} className="col-span-2 bg-zinc-950 border border-zinc-700 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-[#d4a017] transition-all" />
            </div>
          ))}
          <div className="flex justify-end pt-2">
            <button className="bg-[#d4a017] hover:bg-[#b8860b] text-black font-bold px-5 py-2 rounded-xl text-sm transition-colors">Salvar Dados</button>
          </div>
        </div>
      </section>

      {/* Business rules */}
      <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <h3 className="text-white font-semibold mb-5">Regras de Negócio</h3>
        <div className="space-y-4">
          {[
            { label: "Idade mínima do locatário", placeholder: "21", name: "minAge", type: "number" },
            { label: "Tempo mínimo de CNH (anos)", placeholder: "1", name: "minCNHYears", type: "number" },
            { label: "Hora extra (R$)", placeholder: "30,00", name: "extraHourPrice", type: "number" },
            { label: "Taxa de combustível (R$/L)", placeholder: "6,50", name: "fuelTax", type: "number" },
            { label: "Taxa de multa administrativa (R$)", placeholder: "30,00", name: "fineAdminFee", type: "number" },
          ].map((f) => (
            <div key={f.name} className="grid grid-cols-3 gap-4 items-center">
              <label className="text-zinc-400 text-sm col-span-1">{f.label}</label>
              <input name={f.name} type={f.type} placeholder={f.placeholder} className="col-span-2 bg-zinc-950 border border-zinc-700 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-[#d4a017] transition-all" />
            </div>
          ))}
          <div className="flex justify-end pt-2">
            <button className="bg-[#d4a017] hover:bg-[#b8860b] text-black font-bold px-5 py-2 rounded-xl text-sm transition-colors">Salvar Regras</button>
          </div>
        </div>
      </section>

      {/* Integrations */}
      <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <h3 className="text-white font-semibold mb-5">Integrações</h3>
        <div className="space-y-4">
          {[
            { label: "Resend API Key (Email)", placeholder: "re_...", name: "RESEND_API_KEY", env: true },
            { label: "WhatsApp número", placeholder: "5592992921946", name: "whatsappNumber" },
          ].map((f) => (
            <div key={f.name} className="grid grid-cols-3 gap-4 items-center">
              <label className="text-zinc-400 text-sm col-span-1">
                {f.label}
                {f.env && <span className="ml-1 text-xs text-zinc-600">(.env)</span>}
              </label>
              <input name={f.name} type="password" placeholder={f.placeholder} className="col-span-2 bg-zinc-950 border border-zinc-700 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-[#d4a017] transition-all font-mono" />
            </div>
          ))}
          <div className="bg-amber-900/20 border border-amber-500/30 rounded-xl p-4 text-sm text-amber-300">
            As variáveis de ambiente marcadas com <code className="text-amber-400">.env</code> devem ser configuradas diretamente no arquivo <code className="text-amber-400">.env.local</code> do servidor.
          </div>
        </div>
      </section>
    </div>
  )
}
