import { ChevronLeft, ChevronRight } from "lucide-react";
import SubjectCard from "../SubjectCard";

export default function SubjectGrid({ 
  cardsPaginados, todosCards, paginaAtual, setPaginaAtual, totalPaginas, ITENS_POR_PAGINA, onNavigate 
}) {
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {cardsPaginados.map((card) => (
          <SubjectCard
            key={card.id}
            nome={card.nome}
            turma={card.turma}
            onClick={() => onNavigate("calendar", card.key, card.ano)}
          />
        ))}
      </div>

      <div className="mt-8 pt-6 border-t-[2px] border-black/10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-[13px] font-bold text-gray-800">
          Exibindo {todosCards.length > 0 ? (paginaAtual - 1) * ITENS_POR_PAGINA + 1 : 0}–{Math.min(paginaAtual * ITENS_POR_PAGINA, todosCards.length)} de {todosCards.length} disciplinas
        </p>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setPaginaAtual(p => Math.max(1, p - 1))}
            disabled={paginaAtual === 1}
            className="p-2 rounded-xl bg-white border-[2px] border-black shadow-[2px_2px_0px_0px_#000] hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeft className="w-4 h-4 text-gray-900" strokeWidth={2.5} />
          </button>
          
          {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(num => (
            <button
              key={num}
              onClick={() => setPaginaAtual(num)}
              className={`w-9 h-9 flex items-center justify-center rounded-xl text-[13px] font-bold border-[2px] border-black transition-all
                ${paginaAtual === num 
                  ? "bg-pensi-yellow text-black shadow-[2px_2px_0px_0px_#000] -translate-y-0.5" 
                  : "bg-white text-gray-800 shadow-[2px_2px_0px_0px_#000] hover:bg-gray-50"}
              `}
            >
              {num}
            </button>
          ))}

          <button 
            onClick={() => setPaginaAtual(p => Math.min(totalPaginas, p + 1))}
            disabled={paginaAtual === totalPaginas}
            className="p-2 rounded-xl bg-white border-[2px] border-black shadow-[2px_2px_0px_0px_#000] hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <ChevronRight className="w-4 h-4 text-gray-900" strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </>
  );
}