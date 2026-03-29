import { getBranches, updateBranchStatus, deleteBranch } from "@/app/actions/branch.actions"
import BranchForm from "@/components/admin/BranchForm"
import { Building2, Trash2, ToggleLeft, ToggleRight, MapPin } from "lucide-react"

export const dynamic = "force-dynamic"
export const metadata = { title: "Filiais — Morauto Admin" }

export default async function BranchesPage() {
  const branches = await getBranches()

  return (
    <div className="space-y-8 p-6">
      <div>
        <h2 className="text-3xl font-outfit font-bold text-white tracking-tight">Gestão de Filiais</h2>
        <p className="text-zinc-400 mt-2">Cadastre e gerencie as unidades da locadora.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        <div className="xl:col-span-1">
          <BranchForm />
        </div>

        <div className="xl:col-span-3 space-y-4">
          {branches.length === 0 ? (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-12 text-center">
              <Building2 className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
              <p className="text-zinc-500">Nenhuma filial cadastrada.</p>
            </div>
          ) : (
            branches.map((branch) => (
              <div key={branch.id} className={`bg-zinc-900 border ${branch.active ? "border-zinc-800" : "border-zinc-800/50 opacity-60"} rounded-xl p-6`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${branch.active ? "bg-blue-500/10" : "bg-zinc-800"}`}>
                      <Building2 className={`w-6 h-6 ${branch.active ? "text-blue-400" : "text-zinc-500"}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-white font-semibold">{branch.name}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${branch.active ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" : "text-zinc-500 bg-zinc-800 border-zinc-700"}`}>
                          {branch.active ? "Ativa" : "Inativa"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-zinc-400 text-sm">
                        <MapPin className="w-3 h-3" />
                        {branch.address}, {branch.city} — {branch.state}
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-xs text-zinc-500">
                        {branch.phone && <span>📞 {branch.phone}</span>}
                        {branch.email && <span>✉ {branch.email}</span>}
                        <span>🚗 {branch._count.vehicles} veículo(s)</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <form action={async () => { "use server"; await updateBranchStatus(branch.id, !branch.active) }}>
                      <button type="submit" title={branch.active ? "Desativar" : "Ativar"} className="text-zinc-400 hover:text-white p-2 rounded-lg hover:bg-white/5 transition-colors">
                        {branch.active ? <ToggleRight className="w-5 h-5 text-emerald-400" /> : <ToggleLeft className="w-5 h-5" />}
                      </button>
                    </form>
                    <form action={async () => { "use server"; await deleteBranch(branch.id) }}>
                      <button type="submit" title="Excluir" disabled={branch._count.vehicles > 0} className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-900/20 transition-colors disabled:opacity-30 disabled:hover:bg-transparent">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
