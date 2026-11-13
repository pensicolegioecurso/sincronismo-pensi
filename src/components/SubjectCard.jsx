import { BookOpen, ArrowUpRight, MapPin, Users } from "lucide-react";

export default function SubjectCard({ card, onClick }) {
  const { nome, turma, unidade, qtdTurmas } = card;

  return (
    <button
      type="button"
      onClick={onClick}
      className="
        group relative w-full flex flex-col items-center justify-center
        overflow-hidden p-4 bg-white border-[2px] border-black rounded-xl
        shadow-[4px_4px_0px_0px_#000]
        hover:shadow-[1px_1px_0px_0px_#000]
        hover:translate-x-[3px] hover:translate-y-[3px]
        active:shadow-none active:translate-x-[4px] active:translate-y-[4px]
        transition-all duration-150 ease-out cursor-pointer text-center
      "
    >
      <ArrowUpRight
        className="absolute top-3 right-3 w-4 h-4 text-gray-400 group-hover:text-black transition-colors"
        strokeWidth={2}
      />

      <div className="flex items-center justify-center w-10 h-10 shrink-0 bg-pensi-yellow border-[1.5px] border-black rounded-full mb-3">
        <BookOpen className="w-5 h-5 text-black" strokeWidth={2} />
      </div>

      <h3 className="w-full text-sm font-medium tracking-tight leading-snug text-gray-800 line-clamp-2 break-words mb-1">
        {nome}
      </h3>

      {/* Metadados: unidade + turma (se houver) + qtd de turmas (se houver) */}
      {(unidade || turma || qtdTurmas != null) && (
        <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5 mb-2 text-[10px] font-medium text-gray-500">
          {unidade && (
            <span className="inline-flex items-center gap-1">
              <MapPin className="w-3 h-3 shrink-0" strokeWidth={2} />
              {unidade}
            </span>
          )}
          {turma && (
            <span className="inline-flex items-center gap-1">
              <BookOpen className="w-3 h-3 shrink-0" strokeWidth={2} />
              {turma}
            </span>
          )}
          {qtdTurmas != null && (
            <span className="inline-flex items-center gap-1">
              <Users className="w-3 h-3 shrink-0" strokeWidth={2} />
              {qtdTurmas} {qtdTurmas === 1 ? "turma" : "turmas"}
            </span>
          )}
        </div>
      )}

      <div className="flex items-center justify-center gap-1 text-[10px] font-normal text-gray-500 mt-auto">
        <span>Acessar disciplina</span>
        <span className="w-1 h-1 rounded-full bg-pensi-yellow" />
      </div>
    </button>
  );
}