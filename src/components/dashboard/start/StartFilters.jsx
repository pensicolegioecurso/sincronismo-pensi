// src/components/dashboard/start/StartFilters.jsx
import { Search, X, Filter } from "lucide-react";

const TEMPOS_LIST = [
  { id: "geral", label: "Geral" },
  { id: "hoje", label: "Hoje" },
  { id: "mes", label: "Mês" },
  { id: "ano", label: "Ano" },
];

export default function StartFilters({
  viewMode, setViewMode,
  busca, setBusca,
  filtroUnidade, setFiltroUnidade,
  filtroTempo, setFiltroTempo,
  unidadesDisponiveis,
  totalExibindo, totalGeral,
}) {
  return (
    <div className="bg-white border-2 border-black rounded-xl shadow-[3px_3px_0px_#000] p-3 mb-4">
      <div className="flex flex-col xl:flex-row gap-2.5 items-stretch xl:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-2.5 flex-1 items-stretch sm:items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={viewMode === "materias" ? "Buscar matéria..." : "Buscar turma..."}
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full h-[38px] bg-gray-50 border-2 border-black rounded-xl pl-9 pr-8 text-sm font-medium text-black outline-none placeholder:text-gray-400 focus:bg-pensi-yellow/20 transition-colors shadow-[2px_2px_0px_#000]"
            />
            {busca && (
              <button onClick={() => setBusca("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-1.5 h-[38px] bg-gray-50 border-2 border-black rounded-xl px-2.5 shadow-[2px_2px_0px_#000] shrink-0">
            <Filter className="w-4 h-4 text-black shrink-0" />
            <select
              value={filtroUnidade}
              onChange={(e) => setFiltroUnidade(e.target.value)}
              className="bg-transparent text-[11px] font-black uppercase tracking-wider text-black focus:outline-none cursor-pointer h-full"
            >
              {unidadesDisponiveis.map((u) => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <div className="flex items-center gap-3 h-[38px] bg-gray-50 border-2 border-black rounded-xl px-3 shadow-[2px_2px_0px_#000]">
            {TEMPOS_LIST.map((p) => {
              const ativo = filtroTempo === p.id;
              return (
                <button key={p.id} onClick={() => setFiltroTempo(p.id)} className="flex items-center gap-1.5 group h-full" aria-pressed={ativo}>
                  <span className={`w-3 h-3 rounded-full border-2 border-black transition-all ${ativo ? "bg-pensi-yellow shadow-[1px_1px_0px_#000] scale-110" : "bg-white group-hover:bg-pensi-yellow/30"}`} />
                  <span className={`text-[10px] font-black uppercase tracking-wider ${ativo ? "text-black" : "text-gray-400"}`}>{p.label}</span>
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-2 h-[38px] bg-gray-50 border-2 border-black rounded-xl px-3 shadow-[2px_2px_0px_#000] shrink-0">
            <span className={`text-[10px] font-black uppercase tracking-wider transition-colors ${viewMode === "materias" ? "text-black" : "text-gray-400"}`}>Matéria</span>
            <button
              onClick={() => setViewMode(viewMode === "materias" ? "turmas" : "materias")}
              className={`relative w-10 h-5 rounded-full border-2 border-black transition-colors duration-300 shrink-0 ${viewMode === "turmas" ? "bg-pensi-yellow" : "bg-gray-300"}`}
            >
              <div className={`absolute top-[1px] left-[1px] bg-white border-2 border-black rounded-full w-3.5 h-3.5 transition-transform duration-300 ${viewMode === "turmas" ? "translate-x-[18px]" : "translate-x-0"}`} />
            </button>
            <span className={`text-[10px] font-black uppercase tracking-wider transition-colors ${viewMode === "turmas" ? "text-black" : "text-gray-400"}`}>Turma</span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-3 border-t-2 border-dashed border-gray-200">
        <div className="flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Exibindo</span>
          <span className="bg-pensi-yellow border border-black rounded-lg px-2 py-0.5 text-[10px] font-black text-black">{totalExibindo}</span>
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">de {totalGeral}</span>
          {busca && (
            <span className="bg-gray-100 border border-black rounded-lg px-2 py-0.5 text-[10px] font-black text-black uppercase tracking-wider">
              {viewMode === "materias" ? "Busca" : "Turma"}: {busca}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}