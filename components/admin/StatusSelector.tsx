"use client";

import { useTransition } from "react";
import { updateReservationStatus } from "@/app/actions/reservation.actions";

type Props = {
  id: string;
  currentStatus: string;
};

export default function StatusSelector({ id, currentStatus }: Props) {
  const [isPending, startTransition] = useTransition();

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as any;
    startTransition(async () => {
      await updateReservationStatus(id, newStatus);
    });
  };

  return (
    <select 
      value={currentStatus}
      onChange={handleStatusChange}
      disabled={isPending}
      className={`
        px-3 py-1 rounded-full text-xs font-bold border outline-none cursor-pointer transition-colors disabled:opacity-50
        ${currentStatus === 'PENDING' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : ''}
        ${currentStatus === 'CONFIRMED' ? 'bg-blue-400/10 text-blue-400 border-blue-400/20' : ''}
        ${currentStatus === 'ACTIVE' ? 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20' : ''}
        ${currentStatus === 'COMPLETED' ? 'bg-purple-400/10 text-purple-400 border-purple-400/20' : ''}
        ${currentStatus === 'CANCELLED' ? 'bg-red-400/10 text-red-400 border-red-400/20' : ''}
      `}
    >
      <option value="PENDING" className="bg-zinc-900 text-white">PENDENTE</option>
      <option value="CONFIRMED" className="bg-zinc-900 text-white">CONFIRMADA</option>
      <option value="ACTIVE" className="bg-zinc-900 text-white">ATIVA (ALUGADA)</option>
      <option value="COMPLETED" className="bg-zinc-900 text-white">CONCLUÍDA</option>
      <option value="CANCELLED" className="bg-zinc-900 text-white">CANCELADA</option>
    </select>
  );
}
