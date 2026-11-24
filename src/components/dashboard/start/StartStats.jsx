// src/components/dashboard/start/StartStats.jsx
import { useState } from "react";
import {
  CheckCircle2, AlertCircle, Clock, PieChart, Loader2,
  GraduationCap, Building2, ChevronDown, ChevronUp, BookOpen
} from "lucide-react";

const COR_BASE = "#eab308";
const COR_META = "#22c55e";

function corDoPercentual(percent) {
  return percent >= 80 ? COR_META : COR_BASE;
}

function RingProgress({ percent, size = 120, stroke = 10 }) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(percent, 100) / 100) * circumference;
  const cor = corDoPercentual(percent);

  return (
    <div className="relative flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="#f3f4f6" strokeWidth={stroke} fill="none" />
        <circle cx={size / 2} cy={size / 2} r={radius} stroke={cor} strokeWidth={stroke} fill="none" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} className="transition-all duration-1000 ease-out" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-black tracking-tighter text-gray-900">{percent}%</span>
      </div>
    </div>
  );
}

const TABS = [
  { id: "padrao", label: "Padrão" },
  { id: "maior", label: "Maior valor" },
  { id: "menor", label: "Menor valor" },
  { id: "az", label: "A-Z" },
  { id: "za", label: "Z-A" },
];

function ListaCard({ titulo, icon: IconHeader, itens, itemIcone }) {
  const [abaAtiva, setAbaAtiva] = useState("padrao");
  const [expandidos, setExpandidos] = useState({});

  const toggleExpandir = (id) => setExpandidos((p) => ({ ...p, [id]: !p[id] }));

  const dadosOrdenados = [...itens];
  if (abaAtiva === "maior") dadosOrdenados.sort((a, b) => (b.c + b.p + b.j) - (a.c + a.p + a.j));
  if (abaAtiva === "menor") dadosOrdenados.sort((a, b) => (a.c + a.p + a.j) - (b.c + b.p + b.j));
  if (abaAtiva === "az") dadosOrdenados.sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
  if (abaAtiva === "za") dadosOrdenados.sort((a, b) => b.nome.localeCompare(a.nome, "pt-BR"));

  return (
    <div className="rounded-[32px] border border-gray-100 bg-white p-2 sm:p-4 shadow-sm">
      {/* Header do Card */}
      <div className="flex items-center justify-between px-3 sm:px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <IconHeader size={18} className="text-gray-400" />
          <h3 className="text-sm font-black text-gray-800 uppercase tracking-wide">{titulo}</h3>
        </div>
      </div>

      {/* Abas */}
      <div className="flex items-center gap-1.5 px-3 sm:px-4 py-3 overflow-x-auto no-scrollbar">
        {TABS.map((tab) => (
          <button key={tab.id} onClick={() => setAbaAtiva(tab.id)} className={`px-3 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition-all ${abaAtiva === tab.id ? "bg-black text-white" : "bg-transparent text-gray-500 hover:bg-gray-100"}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Lista */}
      <div className="flex flex-col">
        {dadosOrdenados.length === 0 && <p className="text-center text-xs text-gray-400 py-6">Nenhum dado disponível.</p>}
        {dadosOrdenados.map((item, idx) => {
          const totalItem = item.c + item.p + item.j;
          const pct = totalItem > 0 ? Math.round((item.c / totalItem) * 100) : 0;
          const isExpanded = expandidos[item.nome];

          return (
            <div key={`${item.nome}-${idx}`} className="flex flex-col border-b border-gray-50 last:border-0">
              <div onClick={() => toggleExpandir(item.nome)} className="flex items-center justify-between p-3 sm:p-4 cursor-pointer hover:bg-gray-50 transition rounded-2xl group">
                <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                  <div className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center shrink-0 group-hover:border-gray-300 transition">
                    {itemIcone}
                  </div>
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-sm font-bold text-gray-900 truncate">{item.nome}</span>
                    {item.unidade && titulo === "Minhas Turmas" && (
                      <span className="text-[10px] text-gray-400 font-bold uppercase truncate">{item.unidade}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-2">
                  <span className="text-sm font-black text-gray-900 tabular-nums">
                    {item.c} <span className="text-[11px] font-bold text-gray-400">de {totalItem}</span>
                  </span>
                  <div className="w-4 h-4 flex items-center justify-center text-gray-400">
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </div>
              </div>

              <div className="px-3 sm:px-4 pb-3 sm:pb-4">
                <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${pct}%`, backgroundColor: corDoPercentual(pct) }} />
                </div>
              </div>

              {isExpanded && (
                <div className="px-3 sm:px-4 pb-4 animate-fade-in bg-gray-50/50 rounded-b-2xl mx-2 mb-2">
                  <div className="flex flex-col gap-2 pt-3">
                    <div className="flex items-center justify-between bg-white rounded-xl px-3 py-2 border border-gray-100">
                      <span className="flex items-center gap-2 text-xs font-bold text-gray-600"><CheckCircle2 size={14} className="text-emerald-500" /> Concluídas</span>
                      <span className="text-sm font-black text-gray-900">{item.c}</span>
                    </div>
                    <div className="flex items-center justify-between bg-white rounded-xl px-3 py-2 border border-gray-100">
                      <span className="flex items-center gap-2 text-xs font-bold text-gray-600"><Clock size={14} className="text-rose-500" /> Pendentes</span>
                      <span className="text-sm font-black text-gray-900">{item.p}</span>
                    </div>
                    <div className="flex items-center justify-between bg-white rounded-xl px-3 py-2 border border-gray-100">
                      <span className="flex items-center gap-2 text-xs font-bold text-gray-600"><AlertCircle size={14} className="text-sky-500" /> Justificadas</span>
                      <span className="text-sm font-black text-gray-900">{item.j}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function StartStats({ carregando, stats, porTurma = [], porUnidade = [] }) {
  const totalGeral = stats.concluidas + stats.pendentes + stats.justificadas;
  const percentualConcluidas = totalGeral > 0 ? Math.round((stats.concluidas / totalGeral) * 100) : 0;

  return (
    <section className="mb-8 space-y-4">
      {/* CARD RESUMO GERAL */}
      <div>
        <div className="mb-4 flex items-center gap-2 px-1">
          <PieChart size={18} className="text-gray-400" />
          <h2 className="text-lg font-black text-gray-900">Resumo do período</h2>
        </div>

        <div className="relative overflow-hidden flex flex-col md:flex-row items-stretch gap-4 rounded-[32px] bg-white/70 backdrop-blur-xl border border-white/60 p-6 shadow-[0_8px_32px_rgba(0,0,0,0.04)]">
          <div className="pointer-events-none absolute -top-24 -right-24 h-48 w-48 rounded-full bg-gradient-to-br from-black/5 to-transparent blur-2xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-gradient-to-tr from-black/5 to-transparent blur-2xl" />

          <div className="relative z-10 flex flex-col items-center justify-center p-4 border-b md:border-b-0 md:border-r border-gray-200/60 md:pr-8">
            {carregando ? (
              <div className="flex flex-col items-center justify-center" style={{ width: 120, height: 120 }}>
                <Loader2 className="h-8 w-8 animate-spin text-gray-300" />
              </div>
            ) : (
              <RingProgress percent={percentualConcluidas} />
            )}
            <p className="mt-3 text-xs font-bold text-gray-500 uppercase tracking-wide">
              Total: {carregando ? "—" : totalGeral}
            </p>
          </div>

          <div className="relative z-10 flex-1 flex flex-col justify-center gap-5 p-2 md:pl-6">
            {[
              { label: "Concluídas", val: stats.concluidas, Icon: CheckCircle2 },
              { label: "Pendentes", val: stats.pendentes, Icon: Clock },
              { label: "Justificadas", val: stats.justificadas, Icon: AlertCircle },
            ].map((item) => {
              const pct = totalGeral > 0 ? (item.val / totalGeral) * 100 : 0;
              return (
                <div key={item.label} className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-sm font-bold text-gray-800">
                      <item.Icon size={16} className="text-gray-400" /> {item.label}
                    </span>
                    <span className="text-sm font-bold text-gray-900">{carregando ? 0 : item.val}</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100/80">
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: corDoPercentual(pct) }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* CARD TURMAS */}
      <ListaCard 
        titulo="Minhas Turmas" 
        icon={GraduationCap} 
        itens={porTurma} 
        itemIcone={<BookOpen size={14} className="text-gray-500" />} 
      />

      {/* CARD UNIDADES */}
      <ListaCard 
        titulo="Minhas Unidades" 
        icon={Building2} 
        itens={porUnidade} 
        itemIcone={<Building2 size={14} className="text-gray-500" />} 
      />
    </section>
  );
}