"use client";

import { useState } from "react";
import { createCustomer } from "@/app/actions/customer.actions";
import { useRouter } from "next/navigation";

export default function CustomerForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [type, setType] = useState("PF"); // PF ou PJ
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError("");
    formData.set("type", type);
    
    const res = await createCustomer(formData);
    
    if (res?.error) {
      setError(res.error);
      setLoading(false);
    } else {
      router.refresh();
      setLoading(false);
      const form = document.getElementById("customer-form") as HTMLFormElement;
      form?.reset();
    }
  }

  return (
    <form id="customer-form" action={handleSubmit} className="space-y-4 bg-zinc-900 border border-zinc-800 p-6 rounded-xl">
      <h3 className="text-xl font-bold font-outfit text-white mb-4">Novo Cliente</h3>
      
      {error && <div className="text-red-400 text-sm bg-red-900/20 p-3 rounded-lg border border-red-900/50">{error}</div>}
      
      <div className="flex gap-4 mb-6">
        <label className="flex items-center gap-2 cursor-pointer text-zinc-300">
          <input type="radio" value="PF" checked={type === "PF"} onChange={() => setType("PF")} className="accent-amber-500" />
          Pessoa Física (PF)
        </label>
        <label className="flex items-center gap-2 cursor-pointer text-zinc-300">
          <input type="radio" value="PJ" checked={type === "PJ"} onChange={() => setType("PJ")} className="accent-amber-500" />
          Pessoa Jurídica (PJ)
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Identificação Base */}
        <div className="space-y-2">
          <label className="text-sm text-zinc-400 font-medium">Nome Completo *</label>
          <input name="name" required placeholder="Ex: João da Silva" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500" />
        </div>
        <div className="space-y-2">
          <label className="text-sm text-zinc-400 font-medium">E-mail *</label>
          <input name="email" type="email" required placeholder="exemplo@email.com" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500" />
        </div>

        {/* Documentos */}
        <div className="space-y-2">
          <label className="text-sm text-zinc-400 font-medium">{type === "PF" ? "CPF *" : "CNPJ *"}</label>
          <input name="document" required placeholder={type === "PF" ? "000.000.000-00" : "00.000.000/0001-00"} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500" />
        </div>
        <div className="space-y-2">
          <label className="text-sm text-zinc-400 font-medium">Celular (WhatsApp)</label>
          <input name="phone" placeholder="(11) 99999-9999" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500" />
        </div>

        {/* CNH (apenas para PF como titular, mas PJ pode ter motorista extra. Vamos simplificar para PF primordial) */}
        {type === "PF" && (
          <>
            <div className="space-y-2">
              <label className="text-sm text-zinc-400 font-medium">Número da CNH</label>
              <input name="cnh" placeholder="00000000000" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500" />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-zinc-400 font-medium">Validade CNH</label>
              <input name="cnhExpiration" type="date" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500" />
            </div>
          </>
        )}
      </div>

      <button 
        type="submit" 
        disabled={loading}
        className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold rounded-lg transition-colors mt-6 disabled:opacity-50"
      >
        {loading ? 'Cadastrando...' : 'Salvar Cliente'}
      </button>
    </form>
  )
}
