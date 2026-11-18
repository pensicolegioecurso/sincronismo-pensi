
import {
  Filter,
  RotateCcw,
  MapPin,
  CalendarDays,
  Users,
} from "lucide-react";

export default function OverviewFilters({
  isDiretor,
  isRegional,
  unidadeFoco,
  unidadesEscopo,
  filtroRegional,
  setFiltroRegional,
  filtroUnidade,
  setFiltroUnidade,
  filtroPeriodo,
  setFiltroPeriodo,
  temFiltrosAtivos,
  regionaisDisponiveis = [],
}) {
  const limparFiltros = () => {
    setFiltroRegional("Todas");
    setFiltroUnidade("Todas");
    setFiltroPeriodo("geral");
  };

  const unidadesDisponiveis = isRegional
    ? unidadesEscopo || []
    : [];

  const mostrarFiltroRegional = !isDiretor && !isRegional;
  const mostrarFiltroUnidade = !isDiretor && !isRegional;

  const selectClass =
    "w-full min-w-0 appearance-none rounded-xl border-2 border-black bg-white px-3 py-2.5 text-sm font-bold text-black outline-none transition focus:bg-yellow-50";

  return (
    <section className="mb-6 rounded-2xl border-2 border-black bg-white p-4 shadow-[4px_4px_0px_#000]">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border-2 border-black bg-pensi-yellow">
            <Filter size={17} />
          </div>

          <div>
            <h2 className="text-sm font-black uppercase tracking-wide">
              Filtros
            </h2>
            <p className="text-xs font-medium text-gray-500">
              Refine os indicadores exibidos
            </p>
          </div>
        </div>

        {temFiltrosAtivos && (
          <button
            type="button"
            onClick={limparFiltros}
            className="flex items-center gap-2 rounded-lg border-2 border-black bg-white px-3 py-2 text-xs font-black uppercase transition hover:bg-gray-100"
          >
            <RotateCcw size={14} />
            Limpar filtros
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {mostrarFiltroRegional && (
          <div className="min-w-0">
            <label className="mb-1.5 flex items-center gap-2 text-xs font-black uppercase text-gray-600">
              <Users size={14} />
              Regional
            </label>

            <select
              value={filtroRegional}
              onChange={(e) => setFiltroRegional(e.target.value)}
              className={selectClass}
            >
              <option value="Todas">Todas as regionais</option>

              {regionaisDisponiveis.map((regional) => (
                <option key={regional} value={regional}>
                  {regional}
                </option>
              ))}
            </select>
          </div>
        )}

        {mostrarFiltroUnidade && (
          <div className="min-w-0">
            <label className="mb-1.5 flex items-center gap-2 text-xs font-black uppercase text-gray-600">
              <MapPin size={14} />
              Unidade
            </label>

            <select
              value={filtroUnidade}
              onChange={(e) => setFiltroUnidade(e.target.value)}
              className={selectClass}
            >
              <option value="Todas">Todas as unidades</option>

              {unidadesDisponiveis.map((unidade) => (
                <option key={unidade} value={unidade}>
                  {unidade}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="min-w-0">
          <label className="mb-1.5 flex items-center gap-2 text-xs font-black uppercase text-gray-600">
            <CalendarDays size={14} />
            Período
          </label>

          <select
            value={filtroPeriodo}
            onChange={(e) => setFiltroPeriodo(e.target.value)}
            className={selectClass}
          >
            <option value="geral">Todo o período</option>
            <option value="mes">Este mês</option>
            <option value="hoje">Hoje</option>
          </select>
        </div>
      </div>

      {isDiretor && (
        <div className="mt-2 flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2 text-xs font-bold text-gray-600">
          <MapPin size={14} />
          Unidade: {unidadeFoco}
        </div>
      )}

      {isRegional && (
        <div className="mt-2 flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2 text-xs font-bold text-gray-600">
          <MapPin size={14} />
          Unidades sob sua responsabilidade: {unidadesEscopo.length}
        </div>
      )}
    </section>
  );
}
