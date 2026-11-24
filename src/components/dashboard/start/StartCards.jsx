// src/components/dashboard/start/StartCards.jsx
import { Search } from "lucide-react";
import SubjectCard from "../../SubjectCard";

export default function StartCards({ viewMode, cards, onNavigate, userUnidadesCount, busca }) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-lg font-black text-gray-900">
          {viewMode === "materias" ? "Minhas matérias" : "Minhas matérias e turmas"}
        </h2>
        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
          {viewMode === "materias" ? "Por unidade" : "Lista de turmas"}
        </span>
      </div>

      {cards.length === 0 ? (
        <div className="rounded-[28px] border border-dashed border-gray-200 bg-white p-10 text-center">
          <Search className="mx-auto mb-2 h-8 w-8 text-gray-300" />
          <p className="text-sm font-bold text-gray-500">Nenhum registro encontrado</p>
          <p className="mt-1 text-[11px] text-gray-400">
            {userUnidadesCount === 0
              ? "Nenhuma unidade com turma ativa no momento."
              : viewMode === "materias"
              ? "Tente buscar por outra matéria."
              : "Tente buscar por outra turma."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
            <SubjectCard
              key={card.id}
              card={card}
              onClick={() => onNavigate("calendar", card.key, card.ano, card.unidade, card.turma)}
            />
          ))}
        </div>
      )}
    </section>
  );
}