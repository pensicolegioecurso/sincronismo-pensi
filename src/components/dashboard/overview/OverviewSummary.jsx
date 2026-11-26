import { CheckCircle2, AlertCircle, Clock, PieChart, ChevronRight } from "lucide-react";

function RingProgress({ percent, size = 100, stroke = 8 }) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(percent, 100) / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="rgba(0,0,0,0.04)" strokeWidth={stroke} fill="none" />
        <circle 
          cx={size / 2} cy={size / 2} r={radius} 
          className="stroke-pensi-yellow drop-shadow-[0_0_6px_rgba(234,179,8,0.5)] transition-all duration-1000 ease-out"
          strokeWidth={stroke} fill="none"
          strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} 
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold tracking-tighter text-gray-900 drop-shadow-sm">{percent}%</span>
      </div>
    </div>
  );
}

export default function OverviewSummary({ totalGeral, percentualConcluidas, total, onClick }) {
  const Container = onClick ? "button" : "section";
  const BarRow = ({ label, value, Icon }) => {
    const pct = totalGeral > 0 ? Math.round((value / totalGeral) * 100) : 0;
    return (
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-xs font-semibold text-gray-700">
            <Icon size={14} className="text-gray-500" /> {label}
          </span>
          <span className="text-xs font-bold text-gray-900">{value}</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-black/5 shadow-inner">
          <div 
            className="h-full rounded-full bg-pensi-yellow shadow-[0_0_8px_rgba(234,179,8,0.6)]" 
            style={{ width: `${pct}%` }} 
          />
        </div>
      </div>
    );
  };

  return (
    <Container type={onClick ? "button" : undefined} onClick={onClick} aria-label={onClick ? "Abrir resumo detalhado da unidade" : undefined} className={`mb-8 block w-full text-left ${onClick ? "group cursor-pointer rounded-[32px] outline-none transition hover:-translate-y-0.5 hover:shadow-lg focus-visible:ring-4 focus-visible:ring-pensi-yellow/50" : ""}`}>
      {/* LIQUID GLASS REAL */}
      <div className="relative overflow-hidden rounded-[32px] border border-white/60 bg-gradient-to-br from-white/80 via-white/50 to-white/20 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.06),inset_0_1px_1px_rgba(255,255,255,0.8)]">
        
        {/* Brilho sutil no topo */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent" />

        <div className="flex items-center gap-2 border-b border-black/5 bg-white/20 p-5">
          <PieChart size={16} className="text-gray-600" />
          <h2 className="text-sm font-bold text-gray-800">Resumo do período</h2>
          {onClick && <ChevronRight size={18} className="ml-auto text-gray-500 transition-transform group-hover:translate-x-1" aria-hidden="true" />}
        </div>

        <div className="flex flex-col md:flex-row items-stretch gap-4 p-6">
          <div className="flex flex-col items-center justify-center p-4 border-b md:border-b-0 md:border-r border-black/5 md:pr-8">
            <RingProgress percent={percentualConcluidas} />
            <p className="mt-3 text-[10px] font-bold text-gray-600 uppercase tracking-wide">Total: {totalGeral}</p>
          </div>

          <div className="flex-1 flex flex-col justify-center gap-5 p-2 md:pl-6">
            <BarRow label="Concluídas" value={total.concluidas} Icon={CheckCircle2} />
            <BarRow label="Pendentes" value={total.pendentes} Icon={Clock} />
            <BarRow label="Justificadas" value={total.justificadas} Icon={AlertCircle} />
          </div>
        </div>
      </div>
    </Container>
  );
}
