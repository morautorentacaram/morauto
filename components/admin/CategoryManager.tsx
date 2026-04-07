"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, X } from "lucide-react";
import { deleteCategory } from "@/app/actions/category.actions";
import { formatCurrency } from "@/lib/utils";
import CategoryForm from "./CategoryForm";

type Category = {
  id: string;
  name: string;
  dailyRate: number | string;
  weeklyRate?: number | string | null;
  monthlyRate?: number | string | null;
  depositValue: number | string;
  _count?: { vehicles: number };
};

export default function CategoryManager({ categories }: { categories: Category[] }) {
  const [editing, setEditing] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const router = useRouter();

  async function handleDelete(id: string) {
    setDeleting(id);
    await deleteCategory(id);
    setDeleting(null);
    router.refresh();
  }

  return (
    <>
      {/* Modal de Edição */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-lg">
            <button
              onClick={() => setEditing(null)}
              className="absolute -top-3 -right-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 rounded-full p-1.5 transition-colors z-10"
            >
              <X className="w-4 h-4" />
            </button>
            <CategoryForm
              category={editing}
              onSuccess={() => setEditing(null)}
            />
          </div>
        </div>
      )}

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-950/50 border-b border-zinc-800 text-zinc-400 text-sm">
                <th className="px-6 py-4 font-medium uppercase tracking-wider">Nome</th>
                <th className="px-6 py-4 font-medium uppercase tracking-wider">Diária</th>
                <th className="px-6 py-4 font-medium uppercase tracking-wider hidden md:table-cell">Caução</th>
                <th className="px-6 py-4 font-medium uppercase tracking-wider text-center">Carros</th>
                <th className="px-6 py-4 font-medium uppercase tracking-wider text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {categories.map((category) => (
                <tr key={category.id} className="hover:bg-zinc-800/30 transition-colors group">
                  <td className="px-6 py-4">
                    <span className="text-white font-medium">{category.name}</span>
                  </td>
                  <td className="px-6 py-4 text-emerald-400 font-medium">
                    {formatCurrency(Number(category.dailyRate))}
                  </td>
                  <td className="px-6 py-4 text-zinc-300 hidden md:table-cell">
                    {formatCurrency(Number(category.depositValue))}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="bg-zinc-800 text-zinc-300 py-1 px-3 rounded-full text-xs font-bold">
                      {category._count?.vehicles || 0}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setEditing(category)}
                        className="text-amber-400 hover:text-amber-300 p-2 rounded-lg hover:bg-amber-900/20 transition-colors"
                        title="Editar"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(category.id)}
                        disabled={!!deleting || (category._count?.vehicles ?? 0) > 0}
                        className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-900/20 transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                        title={(category._count?.vehicles ?? 0) > 0 ? "Remova os veículos vinculados primeiro" : "Excluir"}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {categories.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                    Nenhuma categoria cadastrada ainda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
