// src/components/dashboard/overview/OverviewFilters.jsx
import { MapPin, X } from "lucide-react";
import { UNIDADES, getRegionalDaUnidade } from "../../../data/unidades";

const REGIONAIS_LIST = ["Todas", "Beatriz", "Débora", "Paula"];
const PERIODOS_LIST = [
  { id: "geral", label: "Geral" },
  { id: "mes", label: "Mês" },
  { id: "hoje", label: "Hoje" },
];

export default function OverviewFilters({
  isDiretor, isRegional, unidadeFoco, unidadesEscopo,
  filtroRegional, setFiltroRegional,
  filtroUnidade, setFiltroUnidade,
  filtroPeriodo, setFiltroPeriodo,
  temFiltrosAtivos,
}) {
  return (
    <section className="bg-white border-2 border-black rounded-xl shadow-[3px_3px_0px_#000] p-3 mb-5">
      <div className="flex flex-col xl:flex-row gap-3 items-stretch xl:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-2.5 flex-1 items-stretch sm:items-center">
          {!isDiretor && !isRegional ? (
            <>
              <div className="relative flex-1 min-w-[160px]">
                <select value={filtroRegional} onChange={(e) => { setFiltroRegional(e.target.value); setFiltroUnidade("Todas"); }} className="w-full h-[38px] bg-gray-50 border-2 border-black rounded-xl px-3 text-[11px] font-bold text-black outline-none focus:bg-pensi-yellow shadow-[2px_2px_0px_#000]">
                  {REGIONAIS_LIST.map((r) => <option key={r} value={r}>{r === "Todas" ? "Todas as regionais" : `Regional ${r}`}</option>)}
                </select>
              </div>
              <div className="relative flex-1 min-w-[160px]">
                <select value={filtroUnidade} onChange={(e) => setFiltroUnidade(e.target.value)} className="w-full h-[38px] bg-gray-50 border-2 border-black rounded-xl px-3 text-[11px] font-bold text-black outline-none focus:bg-pensi-yellow shadow-[2px_2px_0px_#000]">
                  <option value="Todas">Todas as unidades</option>
                  {UNIDADES.slice(1).filter((u) => filtroRegional === "Todas" || getRegionalDaUnidade(u) === filtroRegional).map((u) => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-1.5 h-[38px] bg-gray-50 border-2 border-black rounded-xl px-3 shadow-[2px_2px_0px_#000] shrink-0">
              <MapPin className="w-4 h-4 text-black shrink-0" />
              <span className="text-[11px] font-black uppercase tracking-wider text-black">
                {isDiretor ? unidadeFoco : `${(unidadesEscopo || []).length} unidade(s)`}
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-3 h-[38px] bg-gray-50 border-2 border-black rounded-xl px-3 shadow-[2px_2px_0px_#000] shrink-0">
          {PERIODOS_LIST.map((p) => {
            const ativo = filtroPeriodo === p.id;
            return (
              <button key={p.id} onClick={() => setFiltroPeriodo(p.id)} className="flex items-center gap-1.5 group h-full" aria-pressed={ativo}>
                <span className={`w-3 h-3 rounded-full border-2 border-black transition-all ${ativo ? "bg-pensi-yellow shadow-[1px_1px_0px_#000] scale-110" : "bg-white group-hover:bg-pensi-yellow/40"}`} />
                <span className={`text-[10px] font-black uppercase tracking-wider ${ativo ? "text-black" : "text-gray-400"}`}>{p.label}</span>
              </button>
            );
          })}
        </div>
      </div>
      {temFiltrosAtivos && (
        <div className="flex justify-end mt-3 pt-3 border-t-2 border-dashed border-gray-200">
          <button onClick={() => { setFiltroRegional("Todas"); setFiltroUnidade("Todas"); setFiltroPeriodo("geral"); }} className="text-[10px] font-black uppercase tracking-wider text-gray-500 hover:text-black flex items-center gap-1">
            <X className="w-3.5 h-3.5" /> Limpar filtros ativos
          </button>
        </div>
      )}
    </section>
  );
}