import { Users, Search, MoreVertical, Edit, FileText } from "lucide-react"
import { db } from "@/lib/db"

export default async function CustomersPage() {
  const customers = await db.customer.findMany({
    include: {
      user: true,
      _count: {
        select: { reservations: true }
      }
    },
    orderBy: { user: { createdAt: "desc" } }
  })

  return (
    <div className="space-y-6 text-white min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-outfit">Clientes</h1>
          <p className="text-zinc-400 font-light mt-1 text-sm">Gerencie os clientes cadastrados na locadora.</p>
        </div>
      </div>

      <div className="bg-black/30 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-md">
        <div className="p-4 border-b border-white/5 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por nome, email ou documento..." 
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 outline-none focus:border-[#d4a017]/50 text-sm font-light text-zinc-300 transition-all placeholder:text-zinc-600"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 text-zinc-400 text-xs uppercase tracking-widest font-semibold">
                <th className="p-4 rounded-tl-xl font-normal">Cliente</th>
                <th className="p-4 font-normal">Tipo</th>
                <th className="p-4 font-normal">Documento</th>
                <th className="p-4 font-normal">Telefone</th>
                <th className="p-4 font-normal">Locações</th>
                <th className="p-4 rounded-tr-xl font-normal text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm uppercase font-mono">
              {customers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-zinc-500 font-light normal-case font-sans">
                    Nenhum cliente cadastrado ainda.
                  </td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr key={c.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="p-4 font-outfit uppercase font-bold text-white flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10 text-[#d4a017]">
                        {c.user.name?.charAt(0) || <Users size={16} />}
                      </div>
                      <div>
                        {c.user.name}
                        <div className="text-xs text-zinc-500 font-light font-sans normal-case">{c.user.email}</div>
                      </div>
                    </td>
                    <td className="p-4 text-zinc-300">
                      <span className="bg-white/5 px-3 py-1 rounded-full border border-white/10 text-xs font-sans tracking-wide">
                        {c.type}
                      </span>
                    </td>
                    <td className="p-4 text-zinc-400 tracking-wider">
                      {c.document}
                    </td>
                    <td className="p-4 text-zinc-400 normal-case font-sans">
                      {c.phone || "Não informado"}
                    </td>
                    <td className="p-4 text-zinc-400">
                      <span className="bg-[#d4a017]/10 text-[#d4a017] px-2 py-1 rounded font-bold">
                        {c._count.reservations}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 text-zinc-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors" title="Editar">
                          <Edit size={16} />
                        </button>
                        <button className="p-2 text-zinc-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors" title="Contratos">
                          <FileText size={16} />
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
