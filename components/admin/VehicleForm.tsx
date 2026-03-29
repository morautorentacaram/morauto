"use client";

import { useState } from "react";
import { createVehicle } from "@/app/actions/vehicle.actions";
import { useRouter } from "next/navigation";

export default function VehicleForm({ categories }: { categories: any[] }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError("");
    const res = await createVehicle(formData);
    
    if (res?.error) {
      setError(res.error);
      setLoading(false);
    } else {
      router.refresh();
      setLoading(false);
      const form = document.getElementById("vehicle-form") as HTMLFormElement;
      form?.reset();
    }
  }

  return (
    <form id="vehicle-form" action={handleSubmit} className="space-y-4 bg-zinc-900 border border-zinc-800 p-6 rounded-xl">
      <h3 className="text-xl font-bold font-outfit text-white mb-4">Cadastrar Veículo</h3>
      
      {error && <div className="text-red-400 text-sm bg-red-900/20 p-3 rounded-lg border border-red-900/50">{error}</div>}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Marca & Modelo */}
        <div className="space-y-2">
          <label className="text-sm text-zinc-400 font-medium">Marca *</label>
          <input name="brand" required placeholder="Ex: Volkswagen" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500" />
        </div>
        <div className="space-y-2">
          <label className="text-sm text-zinc-400 font-medium">Modelo *</label>
          <input name="model" required placeholder="Ex: Polo" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500" />
        </div>

        {/* Versão & Categoria */}
        <div className="space-y-2">
          <label className="text-sm text-zinc-400 font-medium">Versão</label>
          <input name="version" placeholder="Ex: 1.0 MPI" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500" />
        </div>
        <div className="space-y-2">
          <label className="text-sm text-zinc-400 font-medium">Categoria *</label>
          <select name="categoryId" required className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500">
            <option value="">Selecione...</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Placa & Ano */}
        <div className="space-y-2">
          <label className="text-sm text-zinc-400 font-medium">Placa *</label>
          <input name="plate" required placeholder="ABC1D23" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500 uppercase" />
        </div>
        <div className="space-y-2">
          <label className="text-sm text-zinc-400 font-medium">Ano *</label>
          <input name="year" type="number" required placeholder="Ex: 2024" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500" />
        </div>

        {/* Renavam & Chassi */}
        <div className="space-y-2">
          <label className="text-sm text-zinc-400 font-medium">Renavam *</label>
          <input name="renavam" required className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500" />
        </div>
        <div className="space-y-2">
          <label className="text-sm text-zinc-400 font-medium">Chassi *</label>
          <input name="chassi" required className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500 uppercase" />
        </div>

        {/* Cor & KM */}
        <div className="space-y-2">
          <label className="text-sm text-zinc-400 font-medium">Cor *</label>
          <input name="color" required placeholder="Ex: Prata" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500" />
        </div>
        <div className="space-y-2">
          <label className="text-sm text-zinc-400 font-medium">Quilometragem Inicial</label>
          <input name="km" type="number" defaultValue="0" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500" />
        </div>

        {/* Combustível & Transmissão */}
        <div className="space-y-2">
          <label className="text-sm text-zinc-400 font-medium">Combustível *</label>
          <select name="fuelType" required className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500">
            <option value="FLEX">Flex (Etanol/Gasolina)</option>
            <option value="GASOLINA">Apenas Gasolina</option>
            <option value="DIESEL">Diesel</option>
            <option value="ELETRICO">Elétrico</option>
            <option value="HIBRIDO">Híbrido</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm text-zinc-400 font-medium">Transmissão *</label>
          <select name="transmission" required className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500">
            <option value="MANUAL">Manual</option>
            <option value="AUTOMATICO">Automático</option>
          </select>
        </div>
      </div>

      <button 
        type="submit" 
        disabled={loading}
        className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold rounded-lg transition-colors mt-6 disabled:opacity-50"
      >
        {loading ? 'Cadastrando...' : 'Cadastrar na Frota'}
      </button>
    </form>
  )
}
