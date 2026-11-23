import { Search, ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";

const meses = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

export default function OverviewFilters({
  isDiretor, isRegional, unidadeFoco, unidadesEscopo,
  filtroRegional, setFiltroRegional,
  filtroUnidade, setFiltroUnidade,
  filtroPeriodo, // Agora vem do Header
  mesFiltro, setMesFiltro,
  dataInicioCustom, setDataInicioCustom,
  dataFimCustom, setDataFimCustom,
  temFiltrosAtivos,
  busca,
  setBusca,
  regionaisDisponiveis = [],
}) {
  
  const handlePrev = () => {
    const novaData = new Date(mesFiltro);
    if (filtroPeriodo === "anual") {
      novaData.setFullYear(novaData.getFullYear() - 1);
    } else {
      novaData.setMonth(novaData.getMonth() - 1);
    }
    setMesFiltro(novaData);
  };

  const handleNext = () => {
    const novaData = new Date(mesFiltro);
    if (filtroPeriodo === "anual") {
      novaData.setFullYear(novaData.getFullYear() + 1);
    } else {
      novaData.setMonth(novaData.getMonth() + 1);
    }
    setMesFiltro(novaData);
  };

  // Manipulação de múltiplos selects
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

  const unidadesDisponiveis = isRegional ? unidadesEscopo : (unidadesEscopo || []);
  const labelPeriodo = filtroPeriodo === "anual" ? mesFiltro.getFullYear() : `${meses[mesFiltro.getMonth()]} ${mesFiltro.getFullYear()}`;

  return (
    <section className="mb-8 flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por unidade, regional..."
            value={busca || ""}
            onChange={(e) => setBusca?.(e.target.value)}
            className="w-full bg-white border border-gray-100 shadow-sm rounded-2xl pl-11 pr-4 py-3.5 text-sm font-medium text-gray-800 outline-none focus:border-black transition"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        
        {/* Condicional: Setinhas para Mensal/Anual, ou Caixinha para Período */}
        {filtroPeriodo === "custom" ? (
          <div className="flex items-center bg-white rounded-[20px] px-3 py-1.5 border border-gray-100 shadow-sm gap-2 h-[42px]">
            <CalendarDays size={16} className="text-gray-400" />
            <input 
              type="date" 
              value={dataInicioCustom} 
              onChange={(e) => setDataInicioCustom(e.target.value)}
              className="bg-transparent border-none text-xs font-bold outline-none cursor-pointer text-gray-700"
            />
            <span className="text-gray-400 text-xs font-bold">até</span>
            <input 
              type="date" 
              value={dataFimCustom} 
              onChange={(e) => setDataFimCustom(e.target.value)}
              className="bg-transparent border-none text-xs font-bold outline-none cursor-pointer text-gray-700"
            />
          </div>
        ) : (
          <div className="flex items-center bg-white rounded-[20px] px-3 py-2 border border-gray-100 shadow-sm h-[42px]">
            <button onClick={handlePrev} className="p-1 rounded-full hover:bg-gray-100 transition">
              <ChevronLeft size={16} />
            </button>
            <span className="min-w-[120px] text-center text-sm font-bold text-gray-800 px-2">
              {labelPeriodo}
            </span>
            <button onClick={handleNext} className="p-1 rounded-full hover:bg-gray-100 transition">
              <ChevronRight size={16} />
            </button>
          </div>
        )}

        {/* Filtros de Regional e Unidade (Múltiplos) */}
        {!isDiretor && (
          <>
            {!isRegional && (
              <div className="flex items-center bg-white rounded-[20px] px-4 py-2 text-sm font-bold border border-gray-100 shadow-sm h-[42px]">
                <select 
                  onChange={(e) => handleRegionalChange(e.target.value)} 
                  value="Todas"
                  className="bg-transparent border-none text-xs sm:text-sm font-bold outline-none cursor-pointer appearance-none text-center max-w-[120px] sm:max-w-none truncate"
                >
                  <option value="Todas">{filtroRegional.length === 0 ? "Todas as regionais" : `${filtroRegional.length} selecionada(s)`}</option>
                  {regionaisDisponiveis.map((r) => {
                    const nome = r.nome || r;
                    return (
                      <option key={nome} value={nome}>
                        {filtroRegional.includes(nome) ? `✓ ${nome}` : nome}
                      </option>
                    );
                  })}
                </select>
              </div>
            )}

            <div className="flex items-center bg-white rounded-[20px] px-4 py-2 text-sm font-bold border border-gray-100 shadow-sm h-[42px]">
              <select 
                onChange={(e) => handleUnidadeChange(e.target.value)} 
                value="Todas"
                className="bg-transparent border-none text-xs sm:text-sm font-bold outline-none cursor-pointer appearance-none text-center max-w-[120px] sm:max-w-none truncate"
              >
                <option value="Todas">{filtroUnidade.length === 0 ? "Todas as unidades" : `${filtroUnidade.length} selecionada(s)`}</option>
                {unidadesDisponiveis.map((u) => {
                  const nome = u.nome || u;
                  return (
                    <option key={nome} value={nome}>
                      {filtroUnidade.includes(nome) ? `✓ ${nome}` : nome}
                    </option>
                  );
                })}
              </select>
            </div>
          </>
        )}
      </div>
    </section>
  );
}