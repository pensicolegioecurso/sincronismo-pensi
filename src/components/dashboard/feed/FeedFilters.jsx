// src/components/dashboard/feed/FeedFilters.jsx
import { Search, X, Filter, ChevronDown, CheckCircle2 } from "lucide-react";

const TEMPOS_LIST = [
  { id: "geral", label: "Geral" },
  { id: "hoje", label: "Hoje" },
  { id: "mes", label: "Mês" },
  { id: "ano", label: "Ano" },
];

const TIPOS = [
  { id: "tudo", label: "Tudo" },
  { id: "aula", label: "Aulas" },
  { id: "justificativa", label: "Justificativas" },
];

export default function FeedFilters({
  busca, setBusca,
  filtroTipoFeed, setFiltroTipoFeed,
  filtroTempo, setFiltroTempo,
  isFilterOpen, setIsFilterOpen, filterRef,
  carregando, totalExibindo, totalGeral,
}) {
  const temFiltrosAtivos = busca !== "" || filtroTipoFeed !== "tudo" || filtroTempo !== "geral";
  const filtroLabel = filtroTipoFeed === "tudo" ? "Filtros" : filtroTipoFeed === "aula" ? "Aulas" : "Justificativas";
  const limparFiltros = () => { setBusca(""); setFiltroTipoFeed("tudo"); setFiltroTempo("geral"); };

  return (
    <div className="bg-white border-2 border-black rounded-xl shadow-[3px_3px_0px_#000] p-3 mb-4">
      <div className="flex flex-col xl:flex-row gap-2.5 items-stretch xl:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-2.5 flex-1 items-stretch sm:items-center">
          <div className="relative w-full sm:max-w-[250px]">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input type="text" placeholder="Buscar matéria, turma, prof..." value={busca} onChange={(e) => setBusca(e.target.value)}
              className="w-full h-[38px] bg-gray-50 border-2 border-black rounded-xl pl-9 pr-8 text-sm font-medium text-black outline-none placeholder:text-gray-400 focus:bg-pensi-yellow/20 transition-colors shadow-[2px_2px_0px_#000]" />
            {busca && (
              <button onClick={() => setBusca("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className="relative" ref={filterRef}>
            <button onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`flex items-center justify-center gap-1.5 px-3 h-[38px] border-2 border-black rounded-xl text-[11px] font-black uppercase tracking-wider shadow-[2px_2px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all whitespace-nowrap ${filtroTipoFeed !== "tudo" ? "bg-pensi-yellow" : "bg-gray-50"}`}>
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline">{filtroLabel}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isFilterOpen ? "rotate-180" : ""}`} />
            </button>
            {isFilterOpen && (
              <div className="absolute top-full mt-2 right-0 w-48 bg-white border-2 border-black rounded-xl shadow-[3px_3px_0px_#000] z-50 overflow-hidden">
                {TIPOS.map((tipo) => (
                  <button key={tipo.id} onClick={() => { setFiltroTipoFeed(tipo.id); setIsFilterOpen(false); }}
                    className={`w-full text-left px-3 py-2 text-[11px] font-black uppercase tracking-wider flex items-center justify-between border-b-2 border-black/10 last:border-0 transition-colors ${filtroTipoFeed === tipo.id ? "bg-pensi-yellow" : "hover:bg-gray-100"}`}>
                    <span>{tipo.label}</span>
                    {filtroTipoFeed === tipo.id && <CheckCircle2 size={15} />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 h-[38px] bg-gray-50 border-2 border-black rounded-xl px-3 shadow-[2px_2px_0px_#000] shrink-0">
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
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-3 border-t-2 border-dashed border-gray-200">
        <div className="flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Exibindo</span>
          <span className="bg-pensi-yellow border border-black rounded-lg px-2 py-0.5 text-[10px] font-black text-black">{carregando ? "..." : totalExibindo}</span>
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">de {totalGeral}</span>
        </div>
        {temFiltrosAtivos && (
          <button onClick={limparFiltros} className="text-[10px] font-black uppercase tracking-wider text-gray-500 hover:text-black underline underline-offset-2">
            Remover filtros
          </button>
        )}
      </div>
    </div>
  );
}