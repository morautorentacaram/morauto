import { getReservations } from "@/app/actions/reservation.actions";
import { formatCurrency } from "@/lib/utils";
import StatusSelector from "@/components/admin/StatusSelector";
import { CalendarClock, Car, UserCircle } from "lucide-react";

export const dynamic = 'force-dynamic';

export const metadata = {
  title: "Gerenciar Reservas - Morauto Admin",
};

export default async function ReservationsPage() {
  const reservations = await getReservations();

  return (
    <div className="space-y-8 p-6">
      <div>
        <h2 className="text-3xl font-outfit font-bold text-white tracking-tight">Reservas e Contratos</h2>
        <p className="text-zinc-400 mt-2">Acompanhe as locações solicitadas pelo site e gerencie os status.</p>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-950/50 border-b border-zinc-800 text-zinc-400 text-sm">
                <th className="px-6 py-4 font-medium uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-4 font-medium uppercase tracking-wider">Veículo</th>
                <th className="px-6 py-4 font-medium uppercase tracking-wider">Período</th>
                <th className="px-6 py-4 font-medium uppercase tracking-wider">Valor Total</th>
                <th className="px-6 py-4 font-medium uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {reservations.map((r) => (
                <tr key={r.id} className="hover:bg-zinc-800/30 transition-colors group">
                  <td className="px-6 py-4 flex items-center gap-3">
                    <UserCircle className="w-8 h-8 text-zinc-500" />
                    <div>
                      <div className="text-white font-medium">{r.customer.user.name}</div>
                      <div className="text-zinc-500 text-xs">{r.customer.document}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                       <Car className="w-4 h-4 text-amber-500" />
                       <span className="text-zinc-300 font-medium">{r.vehicle.brand} {r.vehicle.model}</span>
                    </div>
                    <div className="text-xs text-zinc-500 mt-1">{r.vehicle.plate} • {r.vehicle.category.name}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-zinc-300 text-sm">
                      <CalendarClock className="w-4 h-4 text-zinc-500" />
                      <span>
                        {new Date(r.startDate).toLocaleDateString('pt-BR')} até <br/>
                        {new Date(r.endDate).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-emerald-400 font-bold">
                    {formatCurrency(Number(r.totalValue))}
                  </td>
                  <td className="px-6 py-4">
                    <StatusSelector id={r.id} currentStatus={r.status} />
                  </td>
                </tr>
              ))}
              {reservations.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                    Não há reservas registradas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
