import { Plus, Search, MoreVertical, Edit, Trash } from "lucide-react"
import { db } from "@/lib/db"

export default async function VehiclesPage() {
  const vehicles = await db.vehicle.findMany({
    include: { category: true },
    orderBy: { createdAt: "desc" }
  })

  return (
    <div className="space-y-6 text-white min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-outfit">Frota</h1>
          <p className="text-zinc-400 font-light mt-1 text-sm">Gerencie os veículos disponíveis na locadora.</p>
        </div>
        <button className="bg-[#d4a017] hover:bg-[#b8860b] text-black font-bold px-6 py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#d4a017]/20">
          <Plus size={20} /> Novo Veículo
        </button>
      </div>

      <div className="bg-black/30 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-md">
        <div className="p-4 border-b border-white/5 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por placa ou modelo..." 
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 outline-none focus:border-[#d4a017]/50 text-sm font-light text-zinc-300 transition-all placeholder:text-zinc-600"
            />
          </div>
          <select className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm font-light text-zinc-300 outline-none focus:border-[#d4a017]/50 cursor-pointer">
            <option value="">Status</option>
            <option value="AVAILABLE">Disponível</option>
            <option value="RENTED">Alugado</option>
            <option value="MAINTENANCE">Manutenção</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 text-zinc-400 text-xs uppercase tracking-widest font-semibold">
                <th className="p-4 rounded-tl-xl font-normal">Veículo</th>
                <th className="p-4 font-normal">Placa</th>
                <th className="p-4 font-normal">Categoria</th>
                <th className="p-4 font-normal">Status</th>
                <th className="p-4 font-normal">Quilometragem</th>
                <th className="p-4 rounded-tr-xl font-normal text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm uppercase font-mono">
              {vehicles.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-zinc-500 font-light normal-case font-sans">
                    Nenhum veículo encontrado. Adicione seu primeiro veículo.
                  </td>
                </tr>
              ) : (
                vehicles.map((v) => (
                  <tr key={v.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="p-4 font-outfit uppercase font-bold text-white flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center border border-white/10">
                        <img src={`https://ui-avatars.com/api/?name=${v.brand.charAt(0)}&background=18181b&color=d4a017`} alt={v.brand} className="w-6 h-6 rounded" />
                      </div>
                      <div>
                        {v.brand} {v.model}
                        <div className="text-xs text-zinc-500 font-light font-sans normal-case">{v.year} • {v.color}</div>
                      </div>
                    </td>
                    <td className="p-4 text-zinc-300 tracking-wider">
                      <span className="bg-white/5 px-2 py-1 rounded border border-white/10">{v.plate}</span>
                    </td>
                    <td className="p-4 text-zinc-400 normal-case font-sans">
                      {v.category.name}
                    </td>
                    <td className="p-4">
                      {v.status === 'AVAILABLE' && <span className="text-emerald-400 bg-emerald-400/10 px-3 py-1 rounded-full text-xs font-sans tracking-wide">Disponível</span>}
                      {v.status === 'RENTED' && <span className="text-blue-400 bg-blue-400/10 px-3 py-1 rounded-full text-xs font-sans tracking-wide">Alugado</span>}
                      {v.status === 'MAINTENANCE' && <span className="text-red-400 bg-red-400/10 px-3 py-1 rounded-full text-xs font-sans tracking-wide">Manutenção</span>}
                    </td>
                    <td className="p-4 text-zinc-400 tracking-wider">
                      {v.km.toLocaleString('pt-BR')} km
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 text-zinc-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors" title="Editar">
                          <Edit size={16} />
                        </button>
                        <button className="p-2 text-zinc-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors" title="Excluir">
                          <Trash size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
