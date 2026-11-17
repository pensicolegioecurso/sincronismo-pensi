// src/components/dashboard/feed/FeedPagination.jsx
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function FeedPagination({ paginaAtual, setPaginaAtual, totalPaginas }) {
  return (
    <div className="mt-6 flex items-center justify-center gap-2">
      <button onClick={() => setPaginaAtual((p) => Math.max(1, p - 1))} disabled={paginaAtual === 1}
        className="p-2 rounded-xl bg-white border-2 border-black shadow-[2px_2px_0px_#000] hover:shadow-none hover:translate-y-[2px] hover:translate-x-[2px] disabled:opacity-30 disabled:hover:shadow-[2px_2px_0px_#000] disabled:hover:translate-y-0 disabled:hover:translate-x-0 transition-all">
        <ChevronLeft className="w-4 h-4 text-black" strokeWidth={2.5} />
      </button>
      <span className="text-[11px] font-black uppercase tracking-wider text-gray-500">Página {paginaAtual} de {totalPaginas}</span>
      <button onClick={() => setPaginaAtual((p) => Math.min(totalPaginas, p + 1))} disabled={paginaAtual === totalPaginas}
        className="p-2 rounded-xl bg-white border-2 border-black shadow-[2px_2px_0px_#000] hover:shadow-none hover:translate-y-[2px] hover:translate-x-[2px] disabled:opacity-30 disabled:hover:shadow-[2px_2px_0px_#000] disabled:hover:translate-y-0 disabled:hover:translate-x-0 transition-all">
        <ChevronRight className="w-4 h-4 text-black" strokeWidth={2.5} />
      </button>
    </div>
  );
}