import { getCategories } from "@/app/actions/category.actions";
import CategoryForm from "@/components/admin/CategoryForm";
import CategoryManager from "@/components/admin/CategoryManager";

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
        <div className="lg:col-span-1">
          <CategoryForm />
        </div>
        <div className="lg:col-span-2">
          <CategoryManager categories={categories as any} />
        </div>
      </div>
    </div>
  );
}
