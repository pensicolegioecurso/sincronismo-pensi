// src/components/dashboard/start/StartCards.jsx
import { Search } from "lucide-react";
import SubjectCard from "../../SubjectCard";

export default function StartCards({ viewMode, cards, onNavigate, userUnidadesCount, busca }) {
  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
        <div>
          <h2 className="text-sm font-black uppercase tracking-wider text-black">
            {viewMode === "materias" ? "Minhas matérias" : "Minhas matérias e turmas"}
          </h2>
          <p className="text-[11px] text-gray-500 mt-0.5">
            {viewMode === "materias"
              ? "Agrupadas por unidade. Clique para abrir o calendário."
              : "Clique para abrir o calendário da disciplina."}
          </p>
        </div>
        <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">
          {viewMode === "materias" ? "Por unidade" : "Lista de turmas"}
        </span>
      </div>

      <div className="mb-6">
        {cards.length === 0 ? (
          <div className="bg-white border-2 border-black border-dashed rounded-xl p-8 text-center shadow-[2px_2px_0px_#000]">
            <Search className="w-7 h-7 text-gray-300 mx-auto mb-2" />
            <h3 className="text-sm font-black uppercase text-black">Nenhum registro encontrado</h3>
            <p className="text-[11px] text-gray-500 mt-1">
              {userUnidadesCount === 0
                ? "Nenhuma unidade com turma ativa no momento."
                : viewMode === "materias"
                ? "Tente buscar por outra matéria."
                : "Tente buscar por outra turma."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {cards.map((card) => (
              <SubjectCard
                key={card.id}
                card={card}
                onClick={() => onNavigate("calendar", card.key, card.ano, card.unidade, card.turma)}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}