import { getCustomers } from "@/app/actions/customer.actions";
import CustomerForm from "@/components/admin/CustomerForm";
import { Users, Search, FileText } from "lucide-react";

export const dynamic = 'force-dynamic';

export const metadata = {
  title: "Gerenciar Clientes - Morauto Admin",
};

export default async function CustomersPage() {
  const customers = await getCustomers();

  return (
    <div className="space-y-8 p-6">
      <div>
        <h2 className="text-3xl font-outfit font-bold text-white tracking-tight">Gestão de Clientes</h2>
        <p className="text-zinc-400 mt-2">Cadastre e gerencie os clientes (PF e PJ) da sua locadora.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Formulário de Criação Sidebar */}
        <div className="xl:col-span-1">
          <CustomerForm />
        </div>

        {/* Tabela de Dados */}
        <div className="xl:col-span-2">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-zinc-800 flex items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                <input 
                  type="text" 
                  placeholder="Buscar por nome, email ou documento..." 
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-10 pr-4 py-2 outline-none focus:border-amber-500 text-sm font-light text-zinc-300 transition-all placeholder:text-zinc-600"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-zinc-950/50 border-b border-zinc-800 text-zinc-400 text-sm">
                    <th className="px-6 py-4 font-medium uppercase tracking-wider">Cliente</th>
                    <th className="px-6 py-4 font-medium uppercase tracking-wider">Documento</th>
                    <th className="px-6 py-4 font-medium uppercase tracking-wider">Contato</th>
                    <th className="px-6 py-4 font-medium uppercase tracking-wider text-center">Locações</th>
                    <th className="px-6 py-4 font-medium uppercase tracking-wider text-right">Contratos</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {customers.map((c) => (
                    <tr key={c.id} className="hover:bg-zinc-800/30 transition-colors group">
                      <td className="px-6 py-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center border border-zinc-700 text-amber-500 flex-shrink-0">
                          {c.user.name?.charAt(0).toUpperCase() || <Users size={16} />}
                        </div>
                        <div>
                          <div className="text-white font-medium">{c.user.name}</div>
                          <div className="text-zinc-500 text-xs">{c.user.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-zinc-300 font-mono text-sm">{c.document}</div>
                        <div className="text-xs text-amber-500 font-bold">{c.type}</div>
                      </td>
                      <td className="px-6 py-4 text-zinc-400 text-sm">
                        {c.phone || "Não informado"}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="bg-zinc-800 text-zinc-300 px-3 py-1 rounded-full text-xs font-bold border border-zinc-700">
                          {c._count.reservations}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-zinc-400 hover:text-amber-500 p-2 rounded-lg hover:bg-zinc-800 transition-colors" title="Ver Contratos">
                          <FileText size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {customers.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                        Nenhum cliente cadastrado ainda.
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
