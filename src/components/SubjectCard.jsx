import { BookOpen, ArrowUpRight } from "lucide-react";

export default function SubjectCard({ nome, turma, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="
        group relative w-full flex flex-col items-center justify-center
        overflow-hidden p-4 bg-white border-[2px] border-black rounded-xl
        shadow-[3px_3px_0px_0px_#000] hover:-translate-y-1 hover:shadow-[5px_5px_0px_0px_#000]
        transition-all duration-200 ease-out cursor-pointer text-center
      "
    >
      {/* Seta superior (bem discreta) */}
      <ArrowUpRight
        className="absolute top-3 right-3 w-4 h-4 text-gray-400 group-hover:text-black transition-colors"
        strokeWidth={2}
      />

      {/* Ícone Estático (Sem rotação ou escala) */}
      <div className="flex items-center justify-center w-10 h-10 shrink-0 bg-pensi-yellow border-[1.5px] border-black rounded-full mb-3">
        <BookOpen className="w-5 h-5 text-black" strokeWidth={2} />
      </div>

      {/* Nome da disciplina (Mais fino e menor) */}
      <h3 className="w-full text-sm font-medium tracking-tight leading-snug text-gray-800 line-clamp-2 break-words mb-1">
        {nome}
      </h3>

      {/* Tag da Turma (mais fina) */}
      {turma && (
        <span className="bg-black text-white text-[9px] font-medium px-1.5 py-0.5 rounded uppercase tracking-wider mb-2">
          {turma}
        </span>
      )}

      {/* Texto de acesso (Leve) */}
      <div className="flex items-center justify-center gap-1 text-[10px] font-normal text-gray-500 mt-auto">
        <span>Acessar disciplina</span>
        <span className="w-1 h-1 rounded-full bg-pensi-yellow" />
      </div>
    </button>
  );
}