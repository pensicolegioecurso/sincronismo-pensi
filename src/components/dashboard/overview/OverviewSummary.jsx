import { CheckCircle2, AlertCircle, Clock, PieChart } from "lucide-react";

function RingProgress({ percent, size = 120, stroke = 10 }) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(percent, 100) / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="#f3f4f6" strokeWidth={stroke} fill="none" />
        <circle 
          cx={size / 2} cy={size / 2} r={radius} 
          stroke="#eab308" // Fallback amarelo
          className="stroke-pensi-yellow transition-all duration-1000 ease-out"
          strokeWidth={stroke} fill="none"
          strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} 
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-black tracking-tighter text-gray-900">{percent}%</span>
      </div>
    </div>
  );
}

export default function OverviewSummary({ totalGeral, percentualConcluidas, total }) {
  const BarRow = ({ label, value, Icon }) => {
    const pct = totalGeral > 0 ? Math.round((value / totalGeral) * 100) : 0;
    return (
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-sm font-bold text-gray-800">
            <Icon size={16} className="text-gray-400" /> {label}
          </span>
          <span className="text-sm font-bold text-gray-900">{value}</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100/80">
          <div 
            className="h-full rounded-full bg-pensi-yellow" 
            style={{ width: `${pct}%` }} 
          />
        </div>
      </div>
    );
  };

  return (
    <section className="mb-8">
      <div className="mb-4 flex items-center gap-2 px-1">
        <PieChart size={18} className="text-gray-400" />
        <h2 className="text-lg font-black text-gray-900">Resumo do período</h2>
      </div>

      <div className="relative overflow-hidden flex flex-col md:flex-row items-stretch gap-4 rounded-[32px] bg-white/70 backdrop-blur-xl border border-white/60 p-6 shadow-[0_8px_32px_rgba(0,0,0,0.04)]">
        <div className="pointer-events-none absolute -top-24 -right-24 h-48 w-48 rounded-full bg-gradient-to-br from-black/5 to-transparent blur-2xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-gradient-to-tr from-black/5 to-transparent blur-2xl" />

        <div className="relative z-10 flex flex-col items-center justify-center p-4 border-b md:border-b-0 md:border-r border-gray-200/60 md:pr-8">
          <RingProgress percent={percentualConcluidas} />
          <p className="mt-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Total: {totalGeral}</p>
        </div>

        <div className="relative z-10 flex-1 flex flex-col justify-center gap-5 p-2 md:pl-6">
          <BarRow label="Concluídas" value={total.concluidas} Icon={CheckCircle2} />
          <BarRow label="Pendentes" value={total.pendentes} Icon={Clock} />
          <BarRow label="Justificadas" value={total.justificadas} Icon={AlertCircle} />
        </div>
      </div>
    </section>
  );
}