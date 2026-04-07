"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Pencil, Trash2, X, CarFront } from "lucide-react"
import { deleteVehicle } from "@/app/actions/vehicle.actions"
import Image from "next/image"
import VehicleForm from "./VehicleForm"

type Vehicle = {
  id: string
  brand: string
  model: string
  version?: string | null
  year: number
  plate: string
  renavam: string
  chassi: string
  color: string
  km: number
  fuelType: string
  transmission: string
  categoryId: string
  status: string
  photos: string[]
  category?: { name: string } | null
  _count?: { reservations: number }
}

const statusLabel: Record<string, { label: string; cls: string }> = {
  AVAILABLE:   { label: "DISPONÍVEL",   cls: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" },
  RENTED:      { label: "ALUGADO",      cls: "text-blue-400 bg-blue-400/10 border-blue-400/20" },
  RESERVED:    { label: "RESERVADO",    cls: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20" },
  MAINTENANCE: { label: "MANUTENÇÃO",   cls: "text-orange-400 bg-orange-400/10 border-orange-400/20" },
  UNAVAILABLE: { label: "INDISPONÍVEL", cls: "text-red-400 bg-red-400/10 border-red-400/20" },
  BLOCKED:     { label: "BLOQUEADO",    cls: "text-red-400 bg-red-400/10 border-red-400/20" },
  SOLD:        { label: "VENDIDO",      cls: "text-zinc-400 bg-zinc-400/10 border-zinc-400/20" },
}

export default function VehicleManager({ vehicles, categories }: { vehicles: Vehicle[]; categories: any[] }) {
  const [editing, setEditing] = useState<Vehicle | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const router = useRouter()

  async function handleDelete(id: string) {
    if (!confirm("Tem certeza que deseja excluir este veículo?")) return
    setDeleting(id)
    await deleteVehicle(id)
    setDeleting(null)
    router.refresh()
  }

  return (
    <>
      {/* Modal de Edição */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl my-8">
            <button
              onClick={() => setEditing(null)}
              className="absolute -top-3 -right-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 rounded-full p-1.5 transition-colors z-10"
            >
              <X className="w-4 h-4" />
            </button>
            <VehicleForm
              categories={categories}
              vehicle={editing}
              onSuccess={() => setEditing(null)}
            />
          </div>
        </div>
      )}

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-950/50 border-b border-zinc-800 text-zinc-400 text-sm">
                <th className="px-6 py-4 font-medium uppercase tracking-wider">Veículo</th>
                <th className="px-6 py-4 font-medium uppercase tracking-wider">Placa</th>
                <th className="px-6 py-4 font-medium uppercase tracking-wider">Categoria</th>
                <th className="px-6 py-4 font-medium uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 font-medium uppercase tracking-wider text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {vehicles.map((vehicle) => {
                const st = statusLabel[vehicle.status] ?? { label: vehicle.status, cls: "text-zinc-400 bg-zinc-400/10 border-zinc-400/20" }
                return (
                  <tr key={vehicle.id} className="hover:bg-zinc-800/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-10 rounded-lg bg-zinc-800 flex items-center justify-center flex-shrink-0 overflow-hidden border border-zinc-700">
                          {vehicle.photos?.[0] ? (
                            <Image src={vehicle.photos[0]} alt={vehicle.model} width={56} height={40} className="object-cover w-full h-full" unoptimized />
                          ) : (
                            <CarFront className="w-5 h-5 text-zinc-600" />
                          )}
                        </div>
                        <div>
                          <div className="text-white font-medium">{vehicle.brand} {vehicle.model}</div>
                          <div className="text-zinc-500 text-sm">{vehicle.year} • {vehicle.color}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-zinc-800 font-mono text-amber-500 px-2 py-1 rounded border border-amber-500/20">{vehicle.plate}</span>
                    </td>
                    <td className="px-6 py-4 text-zinc-300">
                      {vehicle.category?.name || "Sem categoria"}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${st.cls}`}>{st.label}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setEditing(vehicle)}
                          className="text-amber-400 hover:text-amber-300 p-2 rounded-lg hover:bg-amber-900/20 transition-colors"
                          title="Editar"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(vehicle.id)}
                          disabled={!!deleting || (vehicle._count?.reservations ?? 0) > 0}
                          className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-900/20 transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                          title={(vehicle._count?.reservations ?? 0) > 0 ? "Veículo possui histórico de reservas." : "Excluir"}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
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
    </>
  )
}
