// src/components/dashboard/start/StartFilters.jsx
import { Search, X, Filter, Building2, Clock } from "lucide-react";

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
    <section className="mb-6 flex flex-wrap items-center gap-3 w-full">
      {/* Busca expandida */}
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
        <input
          type="text"
          placeholder={viewMode === "materias" ? "Buscar matéria..." : "Buscar turma..."}
          value={busca || ""}
          onChange={(e) => setBusca(e.target.value)}
          className="w-full bg-white border border-gray-100 shadow-sm rounded-xl pl-9 pr-4 py-2.5 text-sm font-medium text-gray-800 outline-none focus:border-black transition"
        />
        {busca && (
          <button
            onClick={() => setBusca("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Filtro de tempo — botão-ícone com select invisível */}
      <div className="relative flex items-center justify-center w-11 h-11 bg-white border border-gray-100 rounded-xl shadow-sm shrink-0 text-gray-500 hover:text-black transition">
        <Clock size={18} />
        <select
          value={filtroTempo}
          onChange={(e) => setFiltroTempo(e.target.value)}
          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
          title="Filtrar por período"
        >
          {TEMPOS_LIST.map((t) => (
            <option key={t.id} value={t.id}>{t.label}</option>
          ))}
        </select>
        {filtroTempo !== "geral" && (
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-pensi-yellow border-2 border-white" />
        )}
      </div>

      {/* Filtro de unidade — botão-ícone com select invisível */}
      <div className="relative flex items-center justify-center w-11 h-11 bg-white border border-gray-100 rounded-xl shadow-sm shrink-0 text-gray-500 hover:text-black transition">
        <Building2 size={18} />
        <select
          value={filtroUnidade}
          onChange={(e) => setFiltroUnidade(e.target.value)}
          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
          title="Filtrar por unidade"
        >
          {unidadesDisponiveis.map((u) => (
            <option key={u} value={u}>{u}</option>
          ))}
        </select>
        {filtroUnidade !== "Todas" && (
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-pensi-yellow border-2 border-white" />
        )}
      </div>

      {/* Toggle matéria/turma — botão-ícone */}
      <button
        onClick={() => setViewMode(viewMode === "materias" ? "turmas" : "materias")}
        className={`flex items-center justify-center w-11 h-11 border border-gray-100 rounded-xl shadow-sm bg-white transition shrink-0 ${
          viewMode === "turmas" ? "ring-2 ring-black text-black" : "text-gray-500 hover:text-black"
        }`}
        title={viewMode === "materias" ? "Ver turmas" : "Ver matérias"}
      >
        <Filter size={18} />
      </button>
    </section>
  );
}