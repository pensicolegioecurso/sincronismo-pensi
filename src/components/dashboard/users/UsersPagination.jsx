import { ChevronLeft, ChevronRight } from "lucide-react";

export default function UsersPagination({ paginaAtual, setPaginaAtual, totalPaginas, total }) {
  if (total === 0 || totalPaginas <= 1) return null;

  return (
    <div className="mt-8 flex items-center justify-between border-t border-gray-100 pt-5">
      <span className="text-sm font-medium text-gray-500">Página {paginaAtual} de {totalPaginas}</span>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setPaginaAtual((p) => Math.max(1, p - 1))}
          disabled={paginaAtual === 1}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          onClick={() => setPaginaAtual((p) => Math.min(totalPaginas, p + 1))}
          disabled={paginaAtual === totalPaginas}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}