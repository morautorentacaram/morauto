import { Car, Users, CalendarSync, AlertOctagon } from "lucide-react"

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold font-outfit text-white">Dashboard Geral</h1>
        {/* Date Filter Placeholder */}
        <select className="bg-black/50 border border-white/10 text-zinc-300 px-4 py-2 rounded-lg outline-none cursor-pointer focus:border-[#d4a017]">
          <option>Últimos 30 Dias</option>
          <option>Esse Mês</option>
          <option>Esse Ano</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total de Veículos" value="42" icon={<Car size={24} />} trend="+3 adicionados" />
        <StatCard title="Locações Ativas" value="15" icon={<CalendarSync size={24} />} trend="6 terminam hoje" />
        <StatCard title="Novos Clientes" value="128" icon={<Users size={24} />} trend="+12% que mês anterior" />
        <StatCard title="Avisos Importantes" value="3" icon={<AlertOctagon size={24} className="text-red-400" />} trend="Manutenções pendentes" />
      </div>
      
      {/* Quick Actions / Recent Activity Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="bg-black/30 border border-white/5 p-6 rounded-2xl">
          <h3 className="text-xl font-bold text-white mb-4">Saídas Recentes</h3>
          <div className="space-y-4">
            <ActivityItem text="Mercedes C300 alugada por João Silva" time="Agora mesmo" />
            <ActivityItem text="BMW X1 devolvida (Sem avarias)" time="Há 2 horas" />
            <ActivityItem text="Porsche Macan reservada via Pix" time="Há 5 horas" />
          </div>
        </div>
        <div className="bg-black/30 border border-white/5 p-6 rounded-2xl">
          <h3 className="text-xl font-bold text-white mb-4">Avisos da Frota</h3>
          <div className="space-y-4">
            <ActivityItem text="Audi Q3 - Revisão de 50.000km necessária" time="Prioridade Alta" alert />
            <ActivityItem text="Compass - Restrição de IPVA" time="Prioridade Média" />
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ title, value, icon, trend }: { title: string, value: string, icon: React.ReactNode, trend: string }) {
  return (
    <div className="bg-black/30 border border-white/5 p-6 rounded-2xl flex flex-col relative overflow-hidden group hover:border-white/10 transition-colors">
      <div className="absolute top-0 right-0 p-6 text-zinc-700 group-hover:text-[#d4a017]/30 transition-colors">
        {icon}
      </div>
      <span className="text-zinc-400 text-sm font-medium uppercase tracking-wider mb-2">{title}</span>
      <span className="text-4xl font-black text-white font-outfit mb-4">{value}</span>
      <span className="text-xs text-[#d4a017] font-semibold">{trend}</span>
    </div>
  )
}

function ActivityItem({ text, time, alert = false }: { text: string, time: string, alert?: boolean }) {
  return (
    <div className="flex items-center justify-between pb-4 border-b border-white/5 last:border-0 last:pb-0">
      <div className="flex items-center gap-3">
        <div className={`w-2 h-2 rounded-full ${alert ? 'bg-red-500' : 'bg-[#d4a017]'}`} />
        <span className="text-zinc-300 font-light">{text}</span>
      </div>
      <span className="text-xs text-zinc-500">{time}</span>
    </div>
  )
}
