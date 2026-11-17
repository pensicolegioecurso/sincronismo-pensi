// src/components/dashboard/users/UsersPagination.jsx
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function UsersPagination({ paginaAtual, setPaginaAtual, totalPaginas, total }) {
  if (total === 0) return null;
  return (
    <div className="flex items-center justify-center gap-1.5 mt-4">
      <button
        onClick={() => setPaginaAtual((p) => Math.max(1, p - 1))}
        disabled={paginaAtual === 1}
        className="flex items-center justify-center w-7 h-7 border-2 border-black rounded-md bg-white shadow-[2px_2px_0px_#000] disabled:opacity-40"
      >
        <ChevronLeft className="w-3.5 h-3.5" />
      </button>
      {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((p) => (
        <button
          key={p}
          onClick={() => setPaginaAtual(p)}
          className={`w-7 h-7 flex items-center justify-center border-2 border-black rounded-md text-[10px] font-black shadow-[2px_2px_0px_#000] ${p === paginaAtual ? "bg-pensi-yellow text-black" : "bg-white"}`}
        >
          {p}
        </button>
      ))}
      <button
        onClick={() => setPaginaAtual((p) => Math.min(totalPaginas, p + 1))}
        disabled={paginaAtual === totalPaginas}
        className="flex items-center justify-center w-7 h-7 border-2 border-black rounded-md bg-white shadow-[2px_2px_0px_#000] disabled:opacity-40"
      >
        <ChevronRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}