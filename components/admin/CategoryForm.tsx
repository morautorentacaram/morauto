"use client";

import { useState } from "react";
import { createCategory, updateCategory } from "@/app/actions/category.actions";
import { useRouter } from "next/navigation";

type Category = {
  id: string;
  name: string;
  dailyRate: number | string;
  weeklyRate?: number | string | null;
  monthlyRate?: number | string | null;
  depositValue: number | string;
};

type Props = {
  category?: Category;
  onSuccess?: () => void;
};

const inputCls = "w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500 transition-colors";
const labelCls = "text-sm text-zinc-400 font-medium";

export default function CategoryForm({ category, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const isEditing = !!category;

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError("");
    const res = isEditing
      ? await updateCategory(category.id, formData)
      : await createCategory(formData);

    if (res?.error) {
      setError(res.error);
      setLoading(false);
    } else {
      router.refresh();
      setLoading(false);
      if (onSuccess) {
        onSuccess();
      } else {
        const form = document.getElementById("category-form") as HTMLFormElement;
        form?.reset();
      }
    }
  }

  return (
    <form id="category-form" action={handleSubmit} className="space-y-4 bg-zinc-900 border border-zinc-800 p-6 rounded-xl">
      <h3 className="text-xl font-bold font-outfit text-white mb-4">
        {isEditing ? "Editar Categoria" : "Adicionar Categoria"}
      </h3>

      {error && (
        <div className="text-red-400 text-sm bg-red-900/20 p-3 rounded-lg border border-red-900/50">{error}</div>
      )}

      <div className="space-y-2">
        <label className={labelCls}>Nome da Categoria</label>
        <input
          name="name"
          required
          defaultValue={category?.name}
          placeholder="Ex: SUV Premium, Econômico..."
          className={inputCls}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className={labelCls}>Diária (R$)</label>
          <input
            name="dailyRate"
            type="number"
            step="0.01"
            required
            defaultValue={category ? Number(category.dailyRate) : undefined}
            placeholder="Ex: 150.00"
            className={inputCls}
          />
        </div>
        <div className="space-y-2">
          <label className={labelCls}>Semanal (R$)</label>
          <input
            name="weeklyRate"
            type="number"
            step="0.01"
            defaultValue={category?.weeklyRate ? Number(category.weeklyRate) : undefined}
            placeholder="Ex: 900.00"
            className={inputCls}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className={labelCls}>Mensal (R$)</label>
          <input
            name="monthlyRate"
            type="number"
            step="0.01"
            defaultValue={category?.monthlyRate ? Number(category.monthlyRate) : undefined}
            placeholder="Ex: 3500.00"
            className={inputCls}
          />
        </div>
        <div className="space-y-2">
          <label className={labelCls}>Caução (R$)</label>
          <input
            name="depositValue"
            type="number"
            step="0.01"
            required
            defaultValue={category ? Number(category.depositValue) : undefined}
            placeholder="Ex: 2000.00"
            className={inputCls}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold rounded-lg transition-colors mt-6 disabled:opacity-50"
      >
        {loading ? "Salvando..." : isEditing ? "Salvar Alterações" : "Salvar Categoria"}
      </button>
    </form>
  );
}
