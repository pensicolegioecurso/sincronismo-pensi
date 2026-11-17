// src/components/dashboard/users/UsersSearchBar.jsx
import { Search, Filter } from "lucide-react";

export default function UsersSearchBar({ busca, setBusca, usersFiltrados, usersVisiveis }) {
  return (
    <div className="bg-white border-2 border-black rounded-md shadow-[3px_3px_0px_#000] p-3 mb-4">
      <div className="relative flex-1">
        <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Buscar por nome ou e-mail..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="w-full bg-gray-50 border-2 border-black rounded-md pl-9 pr-3 py-2 text-xs font-medium outline-none placeholder:text-gray-400 focus:bg-pensi-yellow/20 transition-colors"
        />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 mt-3">
        <div className="flex items-center gap-1.5">
          <Filter className="w-3 h-3 text-gray-400" />
          <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Exibindo</span>
          <span className="bg-pensi-yellow border border-black rounded-md px-1.5 py-0.5 text-[9px] font-black text-black">
            {usersFiltrados.length}
          </span>
          <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">
            de {usersVisiveis.length} usuários
          </span>
        </div>
      </div>
    </div>
  );
}