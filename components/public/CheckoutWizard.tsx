"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { processCheckout } from "@/app/actions/checkout.actions";
import { ArrowRight, UserCircle2, CalendarDays, Wallet } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function CheckoutWizard({ vehicle, currentSession, currentCustomer }: any) {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(1);

  // Parse initial dates from params or set empty
  const defaultStart = searchParams.get('date') ? new Date(searchParams.get('date') as string).toISOString().split('T')[0] : "";
  const [startDate, setStartDate] = useState(defaultStart);
  const [endDate, setEndDate] = useState("");

  const diffTime = (new Date(endDate).getTime() - new Date(startDate).getTime());
  const diárias = diffTime > 0 ? Math.ceil(diffTime / (1000 * 60 * 60 * 24)) : 0;
  const effDaily = Number(vehicle.dailyRate ?? vehicle.category.dailyRate);
  const effDeposit = Number(vehicle.depositValue ?? vehicle.category.depositValue);
  const totalValue = diárias * effDaily;

  async function handleCheckout(formData: FormData) {
    setLoading(true);
    setError("");
    formData.append("vehicleId", vehicle.id);
    formData.append("startDate", startDate);
    formData.append("endDate", endDate);
    formData.append("totalValue", totalValue.toString());

    // Assume user's name/email is what comes from next-auth if missing in formData
    if (currentSession?.user) {
      if (!formData.get("name")) formData.append("name", currentSession.user.name || "");
      if (!formData.get("email")) formData.append("email", currentSession.user.email || "");
    }

    const res = await processCheckout(formData);
    if (res?.error) {
       setError(res.error);
       setLoading(false);
    }
    // Success redirects 
  }

  const nextStep = () => {
    if (step === 1 && (!startDate || !endDate || diárias <= 0)) {
      setError("Selecione um período válido.");
      return;
    }
    setError("");
    setStep(step + 1);
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 lg:p-8">
      {/* Etapas Progress Bar */}
      <div className="flex items-center justify-between mb-8 relative">
        <div className="absolute left-0 top-1/2 w-full h-1 bg-zinc-800 -z-10 -translate-y-1/2 rounded-full"></div>
        <div className={`absolute left-0 top-1/2 h-1 bg-amber-500 -z-10 -translate-y-1/2 rounded-full transition-all duration-500 ${step === 1 ? 'w-0' : step === 2 ? 'w-1/2' : 'w-full'}`}></div>
        
        {[{num:1, icon: CalendarDays}, {num:2, icon: UserCircle2}, {num:3, icon: Wallet}].map(s => (
          <div key={s.num} className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 transition-colors ${step >= s.num ? 'bg-amber-500 border-amber-500 text-black' : 'bg-zinc-950 border-zinc-700 text-zinc-500'}`}>
            <s.icon size={18} />
          </div>
        ))}
      </div>

      {error && <div className="text-red-400 bg-red-900/10 p-4 rounded-lg border border-red-900/30 mb-6">{error}</div>}

      <form id="checkout-form" action={handleCheckout} className="space-y-6">
        
        {/* PASSO 1: DATAS */}
        {step === 1 && (
          <div className="space-y-6 animate-in slide-in-from-right fade-in">
            <h3 className="text-2xl font-bold font-outfit text-white">1. Período de Locação</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-zinc-400 text-sm">Data de Retirada</label>
                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} required className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500" />
              </div>
              <div className="space-y-2">
                <label className="text-zinc-400 text-sm">Data de Devolução</label>
                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} required className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500" />
              </div>
            </div>

            <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 flex justify-between items-center">
              <div>
                <p className="text-zinc-400 text-sm">Total por {diárias} diárias</p>
                <p className="text-2xl font-bold text-amber-500">{diárias > 0 ? formatCurrency(totalValue) : "R$ 0,00"}</p>
              </div>
              <button type="button" onClick={nextStep} className="bg-white text-black px-6 py-3 rounded-lg font-bold flex gap-2 items-center hover:bg-amber-500 transition-colors">
                Próximo <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* PASSO 2: IDENTIFICAÇÃO */}
        {step === 2 && (
          <div className="space-y-6 animate-in slide-in-from-right fade-in">
            <h3 className="text-2xl font-bold font-outfit text-white">2. Seus Dados</h3>
            
            {!currentSession && (
              <div className="flex flex-col md:flex-row gap-4 mb-6 p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl text-amber-100/70 text-sm items-center">
                <UserCircle2 size={32} className="text-amber-500" />
                <p>Já possui cadastro ou deseja um login mais rápido? <br/>Você pode <a href="/login" className="text-amber-500 font-bold hover:underline">Fazer Login com Google</a> para pular esta etapa.</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {/* Show Name/Email only if NOT logged in */}
               {!currentSession && (
                 <>
                  <div className="space-y-2">
                    <label className="text-zinc-400 text-sm">Nome Completo</label>
                    <input name="name" required className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-zinc-400 text-sm">E-mail</label>
                    <input name="email" type="email" required className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500" />
                  </div>
                 </>
               )}

               {/* Ask for Document/Phone if it's not registered yet */}
               {!currentCustomer && (
                 <>
                   <div className="space-y-2">
                    <label className="text-zinc-400 text-sm">CPF ou CNPJ</label>
                    <input name="document" required className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-zinc-400 text-sm">Telefone/WhatsApp</label>
                    <input name="phone" className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500" />
                  </div>
                 </>
               )}
            </div>

            {/* Se o cliente já está 100% pronto! */}
            {currentCustomer && (
              <div className="bg-zinc-950 p-6 border border-zinc-800 rounded-xl text-center">
                <UserCircle2 className="mx-auto text-emerald-500 w-12 h-12 mb-2" />
                <p className="text-emerald-400 font-bold pb-1">Identificação Completa!</p>
                <p className="text-zinc-400 text-sm">Olá, {currentSession?.user?.name}. Seus dados estão prontos.</p>
              </div>
            )}

            <div className="flex justify-between items-center mt-6">
              <button type="button" onClick={() => setStep(1)} className="text-zinc-400 hover:text-white px-4 py-2 font-bold transition-colors">Voltar</button>
              <button type="button" onClick={nextStep} className="bg-white text-black px-6 py-3 rounded-lg font-bold flex gap-2 items-center hover:bg-amber-500 transition-colors">
                Resumo e Pagamento <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* PASSO 3: PAGAMENTO (SIMULAÇÃO PENDENTE) */}
        {step === 3 && (
          <div className="space-y-6 animate-in slide-in-from-right fade-in">
            <h3 className="text-2xl font-bold font-outfit text-white flex items-center gap-3">
              3. Finalizar <span className="bg-amber-500 text-black text-xs px-2 py-1 rounded tracking-widest relative -top-0.5">SIMULAÇÃO</span>
            </h3>
            
            <div className="bg-zinc-950 p-6 rounded-xl border border-zinc-800 space-y-4">
              <div className="flex justify-between border-b border-zinc-800 pb-4">
                <span className="text-zinc-400">Total Antecipado ({diárias} dias)</span>
                <span className="text-white font-bold">{formatCurrency(totalValue)}</span>
              </div>
              <div className="flex justify-between border-b border-zinc-800 pb-4">
                <span className="text-zinc-400">Caução de Segurança</span>
                <span className="text-white font-bold">{formatCurrency(effDeposit)}</span>
              </div>
              <p className="text-sm text-zinc-500 font-light mt-2">
                * O valor da Caução não será cobrado agora, mas bloqueado no seu cartão de crédito (PIX ou Dinheiro não aceitos para caução) no momento da retirada.
              </p>
            </div>

            <div className="flex justify-between items-center mt-6">
              <button type="button" onClick={() => setStep(2)} className="text-zinc-400 hover:text-white px-4 py-2 font-bold transition-colors" disabled={loading}>Voltar</button>
              <button type="submit" disabled={loading} className="bg-emerald-500 hover:bg-emerald-400 text-black px-8 py-3 rounded-lg font-black transition-colors disabled:opacity-50 tracking-wide shadow-lg shadow-emerald-500/20">
                {loading ? 'Processando Reserva...' : 'CONFIRMAR ALUGUEL PIX/CARTÃO'}
              </button>
            </div>
          </div>
        )}

      </form>
    </div>
  )
}
