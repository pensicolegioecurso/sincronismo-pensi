import { Search, X, Filter, Globe, Building2 } from "lucide-react";

export default function FeedFilters({
  busca, setBusca,
  filtroTipoFeed, setFiltroTipoFeed,
  isFilterOpen, setIsFilterOpen, filterRef,
  isAdminOrNucleo, isRegional, isProfessor,
  filtroRegional, setFiltroRegional,
  filtroUnidade, setFiltroUnidade,
  regionaisDisponiveis = [],
  unidadesDisponiveis = [],
}) {
  const handleRegionalChange = (val) => {
    if (val === "Todas") setFiltroRegional([]);
    else if (filtroRegional.includes(val)) setFiltroRegional(filtroRegional.filter(r => r !== val));
    else setFiltroRegional([...filtroRegional, val]);
  };

  const handleUnidadeChange = (val) => {
    if (val === "Todas") setFiltroUnidade([]);
    else if (filtroUnidade.includes(val)) setFiltroUnidade(filtroUnidade.filter(u => u !== val));
    else setFiltroUnidade([...filtroUnidade, val]);
  };

  return (
    <section className="mb-6 flex flex-wrap items-center gap-3 w-full">
      {/* Busca expandida */}
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
        <input 
          type="text" 
          placeholder="Buscar matéria, turma, prof..."
          value={busca || ""}
          onChange={(e) => setBusca(e.target.value)}
          className="w-full bg-white border border-gray-100 shadow-sm rounded-xl pl-9 pr-4 py-2.5 text-sm font-medium text-gray-800 outline-none focus:border-black transition"
        />
        {busca && (
          <button onClick={() => setBusca("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black">
            <X size={14} />
          </button>
        )}
      </div>

      {/* Botão de Filtro de Tipo */}
      <div className="relative shrink-0" ref={filterRef}>
        <button onClick={() => setIsFilterOpen(!isFilterOpen)}
          className={`flex items-center justify-center w-11 h-11 border border-gray-100 rounded-xl shadow-sm bg-white transition ${filtroTipoFeed !== "tudo" ? "ring-2 ring-black text-black" : "text-gray-500 hover:text-black"}`}
          title="Filtrar por tipo"
        >
          <Filter size={18} />
        </button>
        {isFilterOpen && (
          <div className="absolute top-full mt-2 left-0 w-48 bg-white border border-gray-100 rounded-2xl shadow-lg z-50 overflow-hidden">
            {[{id: "tudo", label: "Tudo"}, {id: "aula", label: "Aulas"}, {id: "justificativa", label: "Justificativas"}].map((tipo) => (
              <button key={tipo.id} onClick={() => { setFiltroTipoFeed(tipo.id); setIsFilterOpen(false); }}
                className={`w-full text-left px-4 py-3 text-xs font-bold border-b border-gray-100 last:border-0 transition-colors ${filtroTipoFeed === tipo.id ? "bg-gray-50 text-black" : "hover:bg-gray-50 text-gray-600"}`}>
                {tipo.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Regionais (Apenas Ícone) */}
      {isAdminOrNucleo && (
        <div className="relative flex items-center justify-center w-11 h-11 bg-white border border-gray-100 rounded-xl shadow-sm shrink-0 text-gray-500 hover:text-black transition">
          <Globe size={18} />
          <select 
            onChange={(e) => handleRegionalChange(e.target.value)} 
            value="Todas" 
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            title="Filtrar por regional"
          >
            <option value="Todas">Todas as regionais</option>
            {regionaisDisponiveis.map((r) => {
              const nome = r.nome || r;
              return <option key={nome} value={nome}>{filtroRegional.includes(nome) ? `✓ ${nome}` : nome}</option>;
            })}
          </select>
        </div>
      )}

      {/* Unidades (Apenas Ícone) */}
      {!isProfessor && (
        <div className="relative flex items-center justify-center w-11 h-11 bg-white border border-gray-100 rounded-xl shadow-sm shrink-0 text-gray-500 hover:text-black transition">
          <Building2 size={18} />
          <select 
            onChange={(e) => handleUnidadeChange(e.target.value)} 
            value="Todas" 
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            title="Filtrar por unidade"
          >
            <option value="Todas">Todas as unidades</option>
            {unidadesDisponiveis.map((u) => {
              const nome = u.nome || u;
              return <option key={nome} value={nome}>{filtroUnidade.includes(nome) ? `✓ ${nome}` : nome}</option>;
            })}
          </select>
        </div>
      )}
    </section>
  );
}