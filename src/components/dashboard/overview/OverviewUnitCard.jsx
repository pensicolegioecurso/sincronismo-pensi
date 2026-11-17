// src/components/dashboard/overview/OverviewUnitCard.jsx
import {
  Building2, ChevronUp, ChevronDown, CheckCircle2, AlertCircle, Clock, History, X,
} from "lucide-react";

export default function OverviewUnitCard({ u, isExpanded, onToggle, onClose }) {
  const temPendencia = u.p > 0;

  return (
    <div className={`bg-white border-2 border-black rounded-xl shadow-[2px_2px_0px_#000] overflow-hidden transition-all duration-200 ${isExpanded ? "md:col-span-2 xl:col-span-3" : "hover:shadow-[4px_4px_0px_#000]"}`}>
      <button type="button" onClick={onToggle} aria-expanded={isExpanded} className="w-full text-left p-3.5 hover:bg-gray-50 transition-colors">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 shrink-0 bg-pensi-yellow border-2 border-black rounded-lg flex items-center justify-center shadow-[2px_2px_0px_#000]">
            <Building2 className="w-5 h-5 text-black" />
            <span className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border-2 border-black ${temPendencia ? "bg-red-500" : "bg-green-500"}`} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <p className="font-black text-black text-sm uppercase truncate">{u.nome}</p>
              <span className="bg-gray-100 border border-black text-[8px] font-black px-2 py-0.5 rounded-lg uppercase">{u.regional}</span>
            </div>
          </div>
          <div className="w-8 h-8 shrink-0 border-2 border-black rounded-lg flex items-center justify-center bg-gray-50">
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </div>
      </button>

      {isExpanded && (
        <div className="border-t-2 border-black p-4 bg-gray-50 animate-fade-in">
          <div className="flex items-center justify-between gap-2.5 mb-4">
            <div>
              <span className="text-[9px] font-black uppercase tracking-widest text-gray-500">Detalhamento</span>
              <h3 className="text-sm font-black uppercase mt-0.5">{u.nome}</h3>
            </div>
            <button onClick={onClose} className="flex items-center gap-1.5 bg-white border-2 border-black rounded-xl px-3 py-2 text-[10px] font-black uppercase shadow-[2px_2px_0px_#000] hover:bg-gray-100">
              <X className="w-3.5 h-3.5" /> Fechar
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            <div className="bg-green-100 border-2 border-black rounded-xl p-4 shadow-[2px_2px_0px_#000]">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-black uppercase tracking-wider">Realizadas</span>
                <CheckCircle2 className="w-4 h-4 text-green-700" />
              </div>
              <p className="text-3xl font-black mt-2">{u.c}</p>
            </div>
            <div className="bg-yellow-100 border-2 border-black rounded-xl p-4 shadow-[2px_2px_0px_#000]">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-black uppercase tracking-wider">Justificadas</span>
                <AlertCircle className="w-4 h-4 text-yellow-700" />
              </div>
              <p className="text-3xl font-black mt-2">{u.j}</p>
            </div>
            <div className="bg-red-100 border-2 border-black rounded-xl p-4 shadow-[2px_2px_0px_#000]">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-black uppercase tracking-wider">Pendentes</span>
                <Clock className="w-4 h-4 text-red-700" />
              </div>
              <p className="text-3xl font-black mt-2">{u.p}</p>
            </div>
          </div>

          <div className="bg-white border-2 border-black rounded-xl overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 bg-gray-100 border-b-2 border-black">
              <History className="w-4 h-4" />
              <h4 className="text-[10px] font-black uppercase tracking-widest">Últimas atividades</h4>
            </div>
            <div className="p-4 text-[11px] text-gray-500 italic">
              Em breve: histórico detalhado por unidade.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}