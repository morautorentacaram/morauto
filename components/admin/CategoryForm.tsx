"use client";

import { useState } from "react";
import { createCategory } from "@/app/actions/category.actions";
import { useRouter } from "next/navigation";

export default function CategoryForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError("");
    const res = await createCategory(formData);
    
    if (res?.error) {
      setError(res.error);
      setLoading(false);
    } else {
      router.refresh();
      // Reset logic or modal close ideally happens here
      setLoading(false);
      const form = document.getElementById("category-form") as HTMLFormElement;
      form?.reset();
      // Optional: hide modal if we use dialogue
    }
  }

  return (
    <form id="category-form" action={handleSubmit} className="space-y-4 bg-zinc-900 border border-zinc-800 p-6 rounded-xl">
      <h3 className="text-xl font-bold font-outfit text-white mb-4">Adicionar Categoria</h3>
      
      {error && <div className="text-red-400 text-sm bg-red-900/20 p-3 rounded-lg border border-red-900/50">{error}</div>}
      
      <div className="space-y-2">
        <label className="text-sm text-zinc-400 font-medium">Nome da Categoria</label>
        <input 
          name="name" 
          required 
          placeholder="Ex: SUV Premium, Econômico..."
          className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500 transition-colors"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm text-zinc-400 font-medium">Diária (R$)</label>
          <input 
            name="dailyRate" 
            type="number" 
            step="0.01" 
            required 
            placeholder="Ex: 150.00"
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500 transition-colors"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm text-zinc-400 font-medium">Semanal (R$)</label>
          <input 
            name="weeklyRate" 
            type="number" 
            step="0.01"
            placeholder="Ex: 900.00"
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500 transition-colors"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm text-zinc-400 font-medium">Mensal (R$)</label>
          <input 
            name="monthlyRate" 
            type="number" 
            step="0.01"
            placeholder="Ex: 3500.00"
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500 transition-colors"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm text-zinc-400 font-medium">Caução (R$)</label>
          <input 
            name="depositValue" 
            type="number" 
            step="0.01" 
            required
            placeholder="Ex: 2000.00"
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500 transition-colors"
          />
        </div>
      </div>

      <button 
        type="submit" 
        disabled={loading}
        className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold rounded-lg transition-colors mt-6 disabled:opacity-50"
      >
        {loading ? 'Salvando...' : 'Salvar Categoria'}
      </button>
    </form>
  )
}
