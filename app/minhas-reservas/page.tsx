import { db } from "@/lib/db";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { CalendarDays, Car, AlertCircle, ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Minhas Reservas - Morauto",
};

export default async function MyReservationsPage({ searchParams }: { searchParams: Promise<{ success?: string }> }) {
  const { success } = await searchParams;
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/minhas-reservas");
  }

  const customer = await db.customer.findUnique({
    where: { userId: session.user.id },
  });

  const reservations = customer ? await db.reservation.findMany({
    where: { customerId: customer.id },
    include: {
      vehicle: {
        include: { category: true }
      }
    },
    orderBy: { createdAt: "desc" }
  }) : [];

  return (
    <main className="min-h-screen bg-black text-white">
      <header className="h-20 border-b border-white/5 bg-black/80 flex items-center px-8 sticky top-0 z-50 backdrop-blur-md">
        <Link href="/" className="text-zinc-500 hover:text-white flex items-center gap-2 transition-colors font-medium">
          <ArrowLeft size={18} /> Voltar ao Início
        </Link>
      </header>

      <div className="container mx-auto px-6 py-12 max-w-4xl">
        <div className="mb-10">
          <h1 className="text-4xl font-bold font-outfit">Minhas Reservas</h1>
          <p className="text-zinc-400 font-light mt-2 text-lg">Acompanhe o status dos seus aluguéis.</p>
        </div>

        {success && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-6 rounded-2xl mb-8 flex items-start gap-4">
            <div className="bg-emerald-500/20 p-2 rounded-full mt-1">
              <AlertCircle size={20} className="text-emerald-500" />
            </div>
            <div>
              <h3 className="font-bold text-lg mb-1">Reserva Solicitada com Sucesso!</h3>
              <p className="text-emerald-100/70 text-sm">Sua simulação de reserva foi enviada para a nossa central. Em breve você receberá a confirmação e o contrato no seu painel.</p>
            </div>
          </div>
        )}

        {reservations.length === 0 ? (
          <div className="bg-zinc-900 border border-white/5 rounded-3xl p-12 text-center flex flex-col items-center justify-center">
            <Car size={48} className="text-zinc-700 mb-4" />
            <h3 className="text-2xl font-bold text-white font-outfit mb-2">Você ainda não tem reservas.</h3>
            <p className="text-zinc-500 mb-8">Que tal escolher o carro perfeito para a sua próxima viagem?</p>
            <Link href="/frota" className="bg-[#d4a017] hover:bg-amber-600 text-black font-bold py-3 px-8 rounded-xl transition-colors">
              Explorar Frota
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {reservations.map((r) => (
              <div key={r.id} className="bg-zinc-900 border border-white/5 rounded-2xl overflow-hidden shadow-2xl transition-all hover:border-[#d4a017]/30">
                <div className="p-6 md:p-8 flex flex-col md:flex-row gap-8">
                  <div className="flex-1 space-y-4">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-2xl font-bold font-outfit text-white mb-1">
                          {r.vehicle.brand} {r.vehicle.model}
                        </h3>
                        <p className="text-sm text-zinc-500 font-mono tracking-widest uppercase">Placa: {r.vehicle.plate}</p>
                      </div>
                      
                      {/* STATUS BADGE */}
                      <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border
                        ${r.status === 'PENDING' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : ''}
                        ${r.status === 'CONFIRMED' ? 'bg-blue-400/10 text-blue-400 border-blue-400/20' : ''}
                        ${r.status === 'ACTIVE' ? 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20' : ''}
                        ${r.status === 'COMPLETED' ? 'bg-purple-400/10 text-purple-400 border-purple-400/20' : ''}
                        ${r.status === 'CANCELLED' ? 'bg-red-400/10 text-red-400 border-red-400/20' : ''}
                      `}>
                        {r.status === "PENDING" ? "Pendendo Confirmação" : 
                         r.status === "ACTIVE" ? "Alugado (Ativo)" : 
                         r.status === "CONFIRMED" ? "Confirmada" : 
                         r.status === "COMPLETED" ? "Devolvido" : "Cancelada"}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6 pt-4 border-t border-zinc-800">
                      <div>
                        <p className="text-zinc-500 text-xs mb-1 uppercase font-bold tracking-wider">Período</p>
                        <div className="flex items-center gap-2 text-zinc-300">
                          <CalendarDays size={16} className="text-zinc-500" />
                          <span className="text-sm">
                            {new Date(r.startDate).toLocaleDateString('pt-BR')} até <br/>
                            {new Date(r.endDate).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      </div>
                      <div>
                        <p className="text-zinc-500 text-xs mb-1 uppercase font-bold tracking-wider">Total</p>
                        <p className="text-2xl font-bold text-white">{formatCurrency(Number(r.totalValue))}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
