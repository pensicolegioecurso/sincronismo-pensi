import { BookOpen, MapPin, Users } from "lucide-react";

export default function SubjectCard({ card, onClick }) {
  const { nome, turma, unidade, qtdTurmas } = card;

  return (
    <button
      type="button"
      onClick={onClick}
      className="
        group relative w-full flex flex-col text-left
        bg-gradient-to-br from-pensi-yellow/40 via-pensi-yellow/10 to-transparent 
        rounded-[32px] p-4 pt-7 shadow-sm hover:shadow-md 
        transition-all duration-300 ease-out cursor-pointer
      "
    >
      {/* Selo Inclinado */}
      <div className="absolute -top-3 right-6 z-20 bg-pensi-dark text-white text-[11px] font-black uppercase tracking-wider px-4 py-1.5 rounded-md shadow-md -rotate-2 group-hover:rotate-0 transition-transform">
        Acessar
      </div>

      {/* Bloco Branco Interno */}
      <div className="bg-white rounded-[24px] p-6 h-full flex flex-col justify-center items-center shadow-sm relative z-10 min-h-[140px]">
        <div className="w-14 h-14 rounded-full bg-pensi-dark flex items-center justify-center mb-4">
          <BookOpen className="w-6 h-6 text-white" strokeWidth={2.5} />
        </div>
        
        <h3 className="w-full text-center text-[18px] font-bold tracking-tight leading-snug text-pensi-dark line-clamp-2 break-words">
          {nome}
        </h3>
      </div>

      {/* Textos Abaixo do Bloco Branco */}
      <div className="mt-5 px-2 flex-1 flex flex-col justify-between">
        <div className="flex flex-wrap items-center gap-2 mb-3 text-[13px] font-medium text-gray-500">
          {unidade && (
            <span className="inline-flex items-center gap-1.5 bg-white/50 px-2.5 py-1 rounded-md backdrop-blur-sm">
              <MapPin className="w-3.5 h-3.5 shrink-0" strokeWidth={2.5} />
              {unidade}
            </span>
          )}
          {turma && (
            <span className="inline-flex items-center gap-1.5 bg-white/50 px-2.5 py-1 rounded-md backdrop-blur-sm">
              <BookOpen className="w-3.5 h-3.5 shrink-0" strokeWidth={2.5} />
              {turma}
            </span>
          )}
          {qtdTurmas != null && (
            <span className="inline-flex items-center gap-1.5 bg-white/50 px-2.5 py-1 rounded-md backdrop-blur-sm">
              <Users className="w-3.5 h-3.5 shrink-0" strokeWidth={2.5} />
              {qtdTurmas} {qtdTurmas === 1 ? "turma" : "turmas"}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 text-[13px] font-bold text-pensi-dark mt-auto">
          <span>Ver planejamento</span>
          <div className="w-1.5 h-1.5 rounded-full bg-pensi-yellow group-hover:scale-150 transition-transform" />
        </div>
      </div>
    </button>
  );
}