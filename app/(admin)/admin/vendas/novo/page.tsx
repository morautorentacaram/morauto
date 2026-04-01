import SaleVehicleForm from "@/components/admin/SaleVehicleForm"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"

export const dynamic = "force-dynamic"
export const metadata = { title: "Novo Veículo à Venda — Morauto Admin" }

export default async function NewSaleVehiclePage() {
  const session = await auth()
  if (!session) redirect("/login")

  return (
    <div className="p-6 space-y-6">
      <div>
        <Link href="/admin/vendas" className="flex items-center gap-1.5 text-zinc-400 hover:text-white text-sm transition-colors mb-4">
          <ChevronLeft size={16} /> Voltar para Veículos à Venda
        </Link>
        <h2 className="text-3xl font-outfit font-bold text-white tracking-tight">Cadastrar Veículo</h2>
        <p className="text-zinc-400 mt-2">Preencha os dados do veículo para disponibilizá-lo na vitrine de vendas.</p>
      </div>
      <SaleVehicleForm />
    </div>
  )
}
