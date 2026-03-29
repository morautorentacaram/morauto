import { getVehicles, deleteVehicle } from "@/app/actions/vehicle.actions";
import { getCategories } from "@/app/actions/category.actions";
import VehicleForm from "@/components/admin/VehicleForm";
import { Trash2, CarFront } from "lucide-react";

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
        
        {/* Formulário de Criação Sidebar */}
        <div className="xl:col-span-1">
          <VehicleForm categories={categories} />
        </div>

        {/* Tabela de Dados */}
        <div className="xl:col-span-3">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-zinc-950/50 border-b border-zinc-800 text-zinc-400 text-sm">
                    <th className="px-6 py-4 font-medium uppercase tracking-wider">Veículo</th>
                    <th className="px-6 py-4 font-medium uppercase tracking-wider">Placa</th>
                    <th className="px-6 py-4 font-medium uppercase tracking-wider">Categoria</th>
                    <th className="px-6 py-4 font-medium uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 font-medium uppercase tracking-wider text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {vehicles.map((vehicle) => (
                    <tr key={vehicle.id} className="hover:bg-zinc-800/30 transition-colors group">
                      <td className="px-6 py-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center flex-shrink-0">
                          <CarFront className="w-5 h-5 text-amber-500" />
                        </div>
                        <div>
                          <div className="text-white font-medium">{vehicle.brand} {vehicle.model}</div>
                          <div className="text-zinc-500 text-sm">{vehicle.year} • {vehicle.color}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-zinc-800 font-mono text-amber-500 px-2 py-1 rounded border border-amber-500/20">{vehicle.plate}</span>
                      </td>
                      <td className="px-6 py-4 text-zinc-300">
                        {vehicle.category?.name || "Sem categoria"}
                      </td>
                      <td className="px-6 py-4">
                        {vehicle.status === "AVAILABLE" ? (
                          <span className="text-emerald-400 bg-emerald-400/10 px-3 py-1 rounded-full text-xs font-bold border border-emerald-400/20">DISPONÍVEL</span>
                        ) : vehicle.status === "RENTED" ? (
                          <span className="text-blue-400 bg-blue-400/10 px-3 py-1 rounded-full text-xs font-bold border border-blue-400/20">ALUGADO</span>
                        ) : (
                          <span className="text-red-400 bg-red-400/10 px-3 py-1 rounded-full text-xs font-bold border border-red-400/20">{vehicle.status}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <form action={async () => {
                          "use server";
                          await deleteVehicle(vehicle.id);
                        }}>
                          <button 
                            type="submit" 
                            disabled={vehicle._count?.reservations > 0}
                            className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-900/20 transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                            title={vehicle._count?.reservations > 0 ? "Veículo possui histórico de reservas." : "Excluir"}
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </form>
                      </td>
                    </tr>
                  ))}
                  {vehicles.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                        Nenhum veículo cadastrado na frota ainda.
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
