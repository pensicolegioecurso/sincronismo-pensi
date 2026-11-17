// src/components/dashboard/start/StartPagination.jsx
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function StartPagination({ paginaAtual, setPaginaAtual, totalPaginas }) {
  return (
    <div className="mt-4 pt-4 border-t-[2px] border-black/10 flex flex-col sm:flex-row items-center justify-center">
      <div className="flex items-center gap-2">
        <button
          onClick={() => setPaginaAtual((p) => Math.max(1, p - 1))}
          disabled={paginaAtual === 1}
          className="p-2 rounded-xl bg-white border-2 border-black shadow-[2px_2px_0px_#000] hover:shadow-none hover:translate-y-[2px] hover:translate-x-[2px] disabled:opacity-30 disabled:hover:shadow-[2px_2px_0px_#000] disabled:hover:translate-y-0 disabled:hover:translate-x-0 transition-all"
        >
          <ChevronLeft className="w-4 h-4 text-black" strokeWidth={2.5} />
        </button>
        {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((num) => (
          <button
            key={num}
            onClick={() => setPaginaAtual(num)}
            className={`w-8 h-8 flex items-center justify-center rounded-xl text-[12px] font-black border-2 border-black transition-all ${
              paginaAtual === num
                ? "bg-pensi-yellow text-black shadow-[2px_2px_0px_#000] -translate-y-0.5"
                : "bg-white text-black shadow-[2px_2px_0px_#000] hover:shadow-none hover:translate-y-[2px] hover:translate-x-[2px]"
            }`}
          >
            {num}
          </button>
        ))}
        <button
          onClick={() => setPaginaAtual((p) => Math.min(totalPaginas, p + 1))}
          disabled={paginaAtual === totalPaginas}
          className="p-2 rounded-xl bg-white border-2 border-black shadow-[2px_2px_0px_#000] hover:shadow-none hover:translate-y-[2px] hover:translate-x-[2px] disabled:opacity-30 disabled:hover:shadow-[2px_2px_0px_#000] disabled:hover:translate-y-0 disabled:hover:translate-x-0 transition-all"
        >
          <ChevronRight className="w-4 h-4 text-black" strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}