import { Search, Filter, X } from "lucide-react";

export default function UsersSearchBar({ busca, setBusca, usersFiltrados, usersVisiveis }) {
  return (
    <section className="mb-6 flex flex-wrap items-center gap-3 w-full">
      {/* Busca expandida */}
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
        <input
          type="text"
          placeholder="Buscar por nome ou e-mail..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="w-full bg-white border border-gray-100 shadow-sm rounded-xl pl-9 pr-4 py-2.5 text-sm font-medium text-gray-800 outline-none focus:border-black transition"
        />
        {busca && (
          <button onClick={() => setBusca("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black">
            <X size={14} />
          </button>
        )}
      </div>

      {/* Botão de Filtro (apenas visual, já que a busca é direta) */}
      <div className="flex items-center justify-center w-11 h-11 border border-gray-100 rounded-xl shadow-sm bg-white text-gray-500 hover:text-black transition shrink-0">
        <Filter size={18} />
      </div>

      {/* Contador */}
      <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-auto">
        <span>Exibindo</span>
        <span className="bg-gray-100 border border-gray-200 rounded-lg px-2 py-0.5 text-black">{usersFiltrados.length}</span>
        <span>de {usersVisiveis.length}</span>
      </div>
    </section>
  );
}