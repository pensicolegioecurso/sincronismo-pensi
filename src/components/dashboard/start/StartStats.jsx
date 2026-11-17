// src/components/dashboard/start/StartStats.jsx
import { CheckCircle2, BarChart3, Clock, AlertCircle } from "lucide-react";

const STATS_META = [
  { id: "concluidas", label: "Realizadas", icon: CheckCircle2, iconBg: "bg-green-300", tagBg: "bg-green-300" },
  { id: "pendentes", label: "Pendentes", icon: Clock, iconBg: "bg-red-300", tagBg: "bg-red-300" },
  { id: "justificadas", label: "Justificadas", icon: AlertCircle, iconBg: "bg-yellow-300", tagBg: "bg-yellow-300" },
];

export default function StartStats({ mostrar, setMostrar, carregando, stats }) {
  return (
    <section className="mb-6">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-3">
        <div>
          <h2 className="text-sm font-black uppercase tracking-wider text-black">Minhas estatísticas</h2>
          <p className="text-[11px] text-gray-500 mt-0.5">Resumo das suas aulas com base no período selecionado.</p>
        </div>
        <label className="group flex items-center gap-2 cursor-pointer select-none w-fit bg-white px-3 py-2 rounded-xl border-2 border-black shadow-[2px_2px_0px_#000] hover:shadow-none hover:translate-y-[2px] hover:translate-x-[2px] transition-all mt-2 sm:mt-0">
          <div className="relative flex items-center justify-center w-4 h-4 border-2 border-black rounded bg-white shrink-0">
            <input
              type="checkbox"
              className="absolute inset-0 opacity-0 cursor-pointer peer"
              checked={mostrar}
              onChange={(e) => setMostrar(e.target.checked)}
            />
            <CheckCircle2 className={`w-3 h-3 text-black transition-all duration-200 ${mostrar ? "scale-100 opacity-100" : "scale-0 opacity-0"}`} strokeWidth={3} />
          </div>
          <span className="text-[11px] font-black uppercase tracking-wider text-black flex items-center gap-1.5">
            <BarChart3 className="w-4 h-4" /> Mostrar estatísticas
          </span>
        </label>
      </div>

      {mostrar && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 animate-fade-in">
          {STATS_META.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.id} className="bg-white border-2 border-black rounded-xl shadow-[2px_2px_0px_#000] p-3 flex flex-col justify-between relative overflow-hidden min-h-[110px]">
                <div className="flex justify-between items-start">
                  <div className={`w-9 h-9 border-2 border-black rounded-lg flex items-center justify-center ${stat.iconBg}`}>
                    <Icon className="w-4 h-4 text-black" strokeWidth={2.5} />
                  </div>
                  <span className={`text-[9px] font-black uppercase tracking-wider border-2 border-black rounded-lg px-2 py-1 -rotate-3 ${stat.tagBg}`}>{stat.label}</span>
                </div>
                <div className="mt-3">
                  <p className="text-4xl font-black text-black tracking-tight tabular-nums leading-none">
                    {carregando ? "..." : stats[stat.id]}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}