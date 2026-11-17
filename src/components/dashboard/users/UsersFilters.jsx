
import { RotateCcw } from "lucide-react";

const CARGOS = [
  { id: "diretor", label: "Diretor" },
  { id: "coordenador", label: "Coordenador" },
  { id: "nucleo", label: "Núcleo" },
  { id: "professor", label: "Professor" },
];

const REGIONAIS = ["Todas", "Beatriz", "Débora", "Paula"];

const campos =
  "h-9 w-full min-w-0 rounded-md border border-gray-300 bg-white px-3 text-[11px] font-semibold text-gray-700 outline-none transition-colors hover:border-gray-500 focus:border-black focus:bg-[#FFFDF2] focus:ring-1 focus:ring-pensi-yellow";

function FilterField({ label, children, className = "" }) {
  return (
    <div className={`flex min-w-0 flex-col gap-1.5 ${className}`}>
      <label className="text-[9px] font-bold uppercase tracking-wide text-gray-500">
        {label}
      </label>
      {children}
    </div>
  );
}

export default function UsersFilters({
  ehRegional,
  ehDirecao,
  filtroRegional,
  setFiltroRegional,
  filtroUnidade,
  setFiltroUnidade,
  filtroCargo,
  setFiltroCargo,
  filtroStatus,
  setFiltroStatus,
  unidadesUnicas,
  limparFiltros,
  temFiltrosAtivos,
}) {
  return (
    <div className="flex w-full min-w-0 flex-wrap items-end gap-3">

      {!ehRegional && !ehDirecao && (
        <>
          <FilterField
            label="Regional"
            className="min-w-[125px] flex-1"
          >
            <select
              value={filtroRegional}
              onChange={(e) => {
                setFiltroRegional(e.target.value);
                setFiltroUnidade("Todas");
              }}
              className={campos}
            >
              {REGIONAIS.map((regional) => (
                <option key={regional} value={regional}>
                  {regional === "Todas"
                    ? "Todas as regionais"
                    : `Regional ${regional}`}
                </option>
              ))}
            </select>
          </FilterField>

          <FilterField
            label="Unidade"
            className="min-w-[135px] flex-1"
          >
            <select
              value={filtroUnidade}
              onChange={(e) => setFiltroUnidade(e.target.value)}
              className={campos}
            >
              {unidadesUnicas.map((unidade) => (
                <option key={unidade} value={unidade}>
                  {unidade === "Todas"
                    ? "Todas as unidades"
                    : unidade}
                </option>
              ))}
            </select>
          </FilterField>
        </>
      )}

      {!ehDirecao && (
        <FilterField
          label="Cargo"
          className="min-w-[125px] flex-1"
        >
          <select
            value={filtroCargo}
            onChange={(e) => setFiltroCargo(e.target.value)}
            className={campos}
          >
            <option value="todos">Todos os cargos</option>

            {CARGOS.map((cargo) => (
              <option key={cargo.id} value={cargo.id}>
                {cargo.label}
              </option>
            ))}
          </select>
        </FilterField>
      )}

      <FilterField
        label="Status"
        className="min-w-[120px] flex-1"
      >
        <select
          value={filtroStatus}
          onChange={(e) => setFiltroStatus(e.target.value)}
          className={campos}
        >
          <option value="todos">Todos os status</option>
          <option value="Ativo">Ativos</option>
          <option value="Inativo">Inativos</option>
        </select>
      </FilterField>

      {temFiltrosAtivos && (
        <button
          type="button"
          onClick={limparFiltros}
          className="flex h-9 shrink-0 items-center gap-1.5 px-2 text-[9px] font-bold uppercase text-gray-500 transition-colors hover:text-black"
        >
          <RotateCcw size={12} />
          Limpar
        </button>
      )}
    </div>
  );
}
