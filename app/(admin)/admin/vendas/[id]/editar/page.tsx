import { getSaleVehicleById } from "@/app/actions/sale.actions"
import SaleVehicleForm from "@/components/admin/SaleVehicleForm"
import { auth } from "@/auth"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function EditSaleVehiclePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  if (!session) redirect("/login")

  const { id } = await params
  const vehicle = await getSaleVehicleById(id)
  if (!vehicle) notFound()

  return (
    <div className="p-6 space-y-6">
      <div>
        <Link href={`/admin/vendas/${id}`} className="flex items-center gap-1.5 text-zinc-400 hover:text-white text-sm transition-colors mb-4">
          <ChevronLeft size={16} /> Voltar para Detalhes
        </Link>
        <h2 className="text-3xl font-outfit font-bold text-white tracking-tight">Editar Veículo</h2>
        <p className="text-zinc-400 mt-2">{vehicle.brand} {vehicle.model} {vehicle.version ?? ""}</p>
      </div>
      <SaleVehicleForm vehicle={{
        id: vehicle.id,
        brand: vehicle.brand,
        model: vehicle.model,
        version: vehicle.version,
        year: vehicle.year,
        plate: vehicle.plate,
        renavam: vehicle.renavam,
        chassi: vehicle.chassi,
        color: vehicle.color,
        km: vehicle.km,
        fuelType: vehicle.fuelType,
        transmission: vehicle.transmission,
        doors: vehicle.doors,
        seats: vehicle.seats,
        price: vehicle.price,
        description: vehicle.description,
        features: vehicle.features,
        photos: vehicle.photos,
        highlighted: vehicle.highlighted,
        status: vehicle.status,
      }} />
    </div>
  )
}
