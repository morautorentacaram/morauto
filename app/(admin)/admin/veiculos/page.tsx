import { getVehicles } from "@/app/actions/vehicle.actions";
import { getCategories } from "@/app/actions/category.actions";
import VehicleForm from "@/components/admin/VehicleForm";
import VehicleManager from "@/components/admin/VehicleManager";

export const metadata = {
  title: "Gerenciar Frota - Morauto Admin",
};

export default async function VehiclesPage() {
  const vehicles = await getVehicles();
  const categories = await getCategories();

  return (
    <div className="space-y-8 p-6">
      <div>
        <h2 className="text-3xl font-outfit font-bold text-white tracking-tight">Gestão da Frota</h2>
        <p className="text-zinc-400 mt-2">Cadastre e gerencie os veículos disponíveis para locação.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        <div className="xl:col-span-1">
          <VehicleForm categories={categories} />
        </div>
        <div className="xl:col-span-3">
          <VehicleManager vehicles={vehicles as any} categories={categories} />
        </div>
      </div>
    </div>
  );
}
