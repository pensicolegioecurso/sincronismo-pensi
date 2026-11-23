import { Search, X, Filter, Globe, Building2 } from "lucide-react";
import { CARGOS } from "./ui";

// Mesma estrutura do FeedFilters:
// busca expandida | funil (dropdown) | regionais (ícone + select) | unidades (ícone + select)
export default function UsersFilters({
  busca, setBusca,
  filtroCargo, setFiltroCargo,
  filtroStatus, setFiltroStatus,
  isFilterOpen, setIsFilterOpen, filterRef,
  isAdminOrNucleo,
  filtroRegional, setFiltroRegional,
  filtroUnidade, setFiltroUnidade,
  regionaisDisponiveis = [],
  unidadesDisponiveis = [],
  cargosDisponiveis = [],
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

  // Lista única do funil (mesmo padrão do tipo de feed): cargos + status
  const opcoesFunil = [
    { id: "cargo:todos", label: "Todos os cargos", ativo: filtroCargo === "todos" },
    ...cargosDisponiveis.map((c) => ({
      id: `cargo:${c}`,
      label: CARGOS[c]?.[0] || c,
      ativo: filtroCargo === c,
    })),
    { id: "status:todos", label: "Todos os status", ativo: filtroStatus === "todos" },
    { id: "status:Ativo", label: "Somente ativos", ativo: filtroStatus === "Ativo" },
    { id: "status:Inativo", label: "Somente inativos", ativo: filtroStatus === "Inativo" },
  ];

  const aplicarFunil = (id) => {
    const [tipo, valor] = id.split(":");
    if (tipo === "cargo") setFiltroCargo(valor);
    else setFiltroStatus(valor);
    setIsFilterOpen(false);
  };

  const funilAtivo = filtroCargo !== "todos" || filtroStatus !== "todos";

  return (
    <section className="mb-6 flex flex-wrap items-center gap-3 w-full">
      {/* Busca expandida */}
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
        <input
          type="text"
          placeholder="Buscar nome ou e-mail..."
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

      {/* Botão de Filtro (cargo / status) */}
      <div className="relative shrink-0" ref={filterRef}>
        <button onClick={() => setIsFilterOpen(!isFilterOpen)}
          className={`flex items-center justify-center w-11 h-11 border border-gray-100 rounded-xl shadow-sm bg-white transition ${funilAtivo ? "ring-2 ring-black text-black" : "text-gray-500 hover:text-black"}`}
          title="Filtrar por cargo e status"
        >
          <Filter size={18} />
        </button>
        {isFilterOpen && (
          <div className="absolute top-full mt-2 left-0 w-48 bg-white border border-gray-100 rounded-2xl shadow-lg z-50 overflow-hidden">
            {opcoesFunil.map((op) => (
              <button key={op.id} onClick={() => aplicarFunil(op.id)}
                className={`w-full text-left px-4 py-3 text-xs font-bold border-b border-gray-100 last:border-0 transition-colors ${op.ativo ? "bg-gray-50 text-black" : "hover:bg-gray-50 text-gray-600"}`}>
                {op.label}
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
              const id = r.id || r.nome || r;
              const nome = r.nome || r;
              return <option key={id} value={id}>{filtroRegional.includes(id) ? `✓ ${nome}` : nome}</option>;
            })}
          </select>
        </div>
      )}

      {/* Unidades (Apenas Ícone) */}
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
    </section>
  );
}