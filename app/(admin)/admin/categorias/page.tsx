import { getCategories, deleteCategory } from "@/app/actions/category.actions";
import CategoryForm from "@/components/admin/CategoryForm";
import { formatCurrency } from "@/lib/utils";
import { Trash2 } from "lucide-react";
type CategoryWithCount = Awaited<ReturnType<typeof getCategories>>[0];

export const metadata = {
  title: "Gerenciar Categorias - Morauto Admin",
};

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="space-y-8 p-6">
      <div>
        <h2 className="text-3xl font-outfit font-bold text-white tracking-tight">Gestão de Categorias</h2>
        <p className="text-zinc-400 mt-2">Crie e edite as categorias e preços dos veículos da sua frota.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Formulário de Criação Lateral */}
        <div className="lg:col-span-1">
          <CategoryForm />
        </div>

        {/* Tabela de Dados */}
        <div className="lg:col-span-2">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-zinc-950/50 border-b border-zinc-800 text-zinc-400 text-sm">
                    <th className="px-6 py-4 font-medium uppercase tracking-wider">Nome</th>
                    <th className="px-6 py-4 font-medium uppercase tracking-wider">Diária</th>
                    <th className="px-6 py-4 font-medium uppercase tracking-wider hidden md:table-cell">Caução</th>
                    <th className="px-6 py-4 font-medium uppercase tracking-wider text-center">Carros</th>
                    <th className="px-6 py-4 font-medium uppercase tracking-wider text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {(categories as CategoryWithCount[]).map((category) => (
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
                        <form action={async () => {
                          "use server";
                          await deleteCategory(category.id);
                        }}>
                          <button 
                            type="submit" 
                            disabled={category._count?.vehicles > 0}
                            className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-900/20 transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                            title={category._count?.vehicles > 0 ? "Remova os veículos vinculados primeiro" : "Excluir"}
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </form>
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
        </div>

      </div>
    </div>
  );
}
