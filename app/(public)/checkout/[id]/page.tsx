import { db } from "@/lib/db";
import { auth } from "@/auth";
import { notFound } from "next/navigation";
import CheckoutWizard from "@/components/public/CheckoutWizard";
import Link from "next/link";
import { ArrowLeft, CarFront } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function CheckoutPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const vehicle = await db.vehicle.findUnique({
    where: { id },
    include: { category: true }
  });

  if (!vehicle || vehicle.status !== "AVAILABLE") {
    notFound();
  }

  const session = await auth();
  let customer = null;
  if (session?.user?.id) {
    customer = await db.customer.findUnique({ where: { userId: session.user.id } });
  }

  return (
    <main className="min-h-screen bg-black text-white selection:bg-amber-500/30">
      <header className="h-20 border-b border-white/5 bg-black/80 flex items-center px-8 sticky top-0 z-50 backdrop-blur-md">
        <Link href="/frota" className="text-zinc-500 hover:text-white flex items-center gap-2 transition-colors font-medium">
          <ArrowLeft size={18} /> Voltar à Frota
        </Link>
      </header>

      <div className="container mx-auto px-6 py-12 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Coluna Esquerda: Resumo do Veículo */}
          <div className="lg:col-span-4 space-y-8">
            <div>
              <h1 className="text-3xl font-bold font-outfit">Sua Reserva</h1>
              <p className="text-zinc-400 mt-2">Você está a poucos passos de garantir seu veículo exclusivo.</p>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
              <div className="h-40 bg-zinc-950 flex items-center justify-center relative">
                <CarFront className="w-20 h-20 text-zinc-800 absolute" strokeWidth={1} />
                <span className="bg-white/10 backdrop-blur px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border border-white/10 absolute top-4 left-4">
                  {vehicle.category.name}
                </span>
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-bold font-outfit mb-1">{vehicle.brand} {vehicle.model}</h3>
                <div className="text-sm text-zinc-500 font-light flex gap-2">
                  <span>{vehicle.year}</span> • <span>{vehicle.transmission}</span> • <span className="uppercase">{vehicle.plate}</span>
                </div>
                
                <div className="mt-6 pt-6 border-t border-zinc-800">
                  <div className="flex justify-between items-center mb-2 text-sm">
                    <span className="text-zinc-400">Plano</span>
                    <span className="text-white font-medium text-right">Diário</span>
                  </div>
                  <div className="flex justify-between items-center mb-2 text-sm">
                    <span className="text-zinc-400">Proteção Básica</span>
                    <span className="text-emerald-400 font-medium text-right">Inclusa</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-6">
              <h4 className="font-bold text-amber-500 mb-2">Cancelamento Gratuito</h4>
              <p className="text-xs text-amber-100/60 leading-relaxed">Você pode cancelar sua reserva até 24 horas antes do horário programado para retirada e receber reembolso total da simulação.</p>
            </div>
          </div>

          {/* Coluna Direita: Wizard */}
          <div className="lg:col-span-8">
            <CheckoutWizard vehicle={vehicle} currentSession={session} currentCustomer={customer} />
          </div>

        </div>
      </div>
    </main>
  );
}
