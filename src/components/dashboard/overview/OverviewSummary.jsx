// src/components/dashboard/overview/OverviewSummary.jsx
import { CheckCircle2, AlertCircle, Clock, TrendingUp, Activity, BarChart3 } from "lucide-react";

export default function OverviewSummary({ totalGeral, percentualConcluidas, total }) {
  return (
    <section className="mb-5">
      <div className="flex items-center gap-1.5 mb-2.5">
        <BarChart3 className="w-4 h-4" />
        <h2 className="text-sm font-black uppercase tracking-wider text-black">Resumo dos indicadores</h2>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className="lg:col-span-2 bg-white border-2 border-black rounded-xl shadow-[3px_3px_0px_#000] overflow-hidden flex flex-col">
          <div className="p-4 flex-1">
            <div className="flex justify-between items-start gap-3">
              <div>
                <span className="inline-flex items-center gap-1.5 bg-pensi-yellow border-2 border-black rounded-lg px-2 py-1 text-[9px] font-black uppercase tracking-wider shadow-[2px_2px_0px_#000]">
                  <Activity className="w-3.5 h-3.5" /> Total de aulas
                </span>
                <p className="text-5xl font-black text-black tracking-tighter mt-3 leading-none">{totalGeral}</p>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mt-2">Registros no período selecionado</p>
              </div>
              <div className="w-10 h-10 shrink-0 bg-gray-100 border-2 border-black rounded-lg flex items-center justify-center shadow-[2px_2px_0px_#000]">
                <BarChart3 className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t-2 border-dashed border-gray-200">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Taxa de conclusão</span>
                <span className="text-[12px] font-black">{percentualConcluidas}%</span>
              </div>
              <div className="h-3 bg-gray-100 border-2 border-black rounded-full overflow-hidden">
                <div className="h-full bg-green-400 border-r-2 border-black transition-all duration-500" style={{ width: `${percentualConcluidas}%` }} />
              </div>
            </div>
          </div>
          <div className="bg-gray-50 border-t-2 border-black px-4 py-2.5 flex items-center justify-between gap-2">
            <span className="text-[9px] font-black uppercase tracking-widest text-gray-500">Indicadores consolidados</span>
            <span className="flex items-center gap-1 text-[9px] font-black uppercase text-green-700">
              <TrendingUp className="w-3.5 h-3.5" /> Dados exibidos
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
          <div className="bg-white border-2 border-black rounded-xl shadow-[3px_3px_0px_#000] overflow-hidden flex flex-col min-h-[120px]">
            <div className="flex-1 flex">
              <div className="flex-1 bg-green-100 p-3 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div className="w-8 h-8 bg-white border-2 border-black rounded-lg flex items-center justify-center"><CheckCircle2 className="w-4 h-4 text-green-700" /></div>
                  <span className="text-[8px] font-black uppercase tracking-wider bg-white border border-black rounded-lg px-1.5 py-0.5">Realizadas</span>
                </div>
                <div>
                  <p className="text-3xl font-black text-black tracking-tight">{total.concluidas}</p>
                  <p className="text-[9px] font-bold uppercase text-green-800 mt-0.5">Aulas realizadas</p>
                </div>
              </div>
              <div className="w-0.5 bg-black" />
              <div className="flex-1 bg-yellow-100 p-3 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div className="w-8 h-8 bg-white border-2 border-black rounded-lg flex items-center justify-center"><AlertCircle className="w-4 h-4 text-yellow-700" /></div>
                  <span className="text-[8px] font-black uppercase tracking-wider bg-white border border-black rounded-lg px-1.5 py-0.5">Justificadas</span>
                </div>
                <div>
                  <p className="text-3xl font-black text-black tracking-tight">{total.justificadas}</p>
                  <p className="text-[9px] font-bold uppercase text-yellow-800 mt-0.5">Aulas justificadas</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-red-100 border-2 border-black rounded-xl shadow-[3px_3px_0px_#000] p-3 flex flex-col justify-between min-h-[120px]">
            <div className="flex justify-between items-start">
              <div className="w-9 h-9 bg-white border-2 border-black rounded-lg flex items-center justify-center"><Clock className="w-4 h-4 text-red-700" /></div>
              <span className="text-[8px] font-black uppercase tracking-wider bg-white border border-black rounded-lg px-1.5 py-0.5">Pendentes</span>
            </div>
            <div>
              <p className="text-4xl font-black text-black tracking-tight">{total.pendentes}</p>
              <p className="text-[9px] font-bold uppercase text-red-800 mt-0.5">Aguardando registro</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}