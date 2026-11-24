// src/components/dashboard/start/StartHeader.jsx
import { ArrowLeft, MessageCircle, Users, FileDown } from "lucide-react";

export default function StartHeader({
  user,
  viewMode,
  totalMaterias,
  totalTurmas,
  onBack,
  onChat,
  onFamily,
  onDownloadPDF,
  familyMode,
}) {
  const primeiroNome = user?.nome?.split(" ")[0] || "Professor";

  return (
    <header className="mb-6">
      {/* Barra superior: voltar + pill de ícones */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack || (() => window.history.back())}
          className="w-11 h-11 rounded-full bg-white flex justify-center items-center shadow-sm border border-gray-100 active:scale-95 transition-transform text-black"
        >
          <ArrowLeft size={18} strokeWidth={2.5} />
        </button>

        <div className="flex gap-1 bg-white rounded-[22px] px-2 py-1 border border-gray-100 shadow-sm">
          <button
            onClick={onChat}
            className="w-9 h-9 flex justify-center items-center text-black rounded-full hover:bg-gray-50 transition"
            title="Chat"
          >
            <MessageCircle size={18} strokeWidth={2} />
          </button>
          <button
            onClick={onFamily}
            className="w-9 h-9 flex justify-center items-center text-black rounded-full hover:bg-gray-50 transition relative"
            title="Família"
          >
            <Users size={18} strokeWidth={2} />
            {familyMode && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white" />
            )}
          </button>
          <button
            onClick={onDownloadPDF}
            className="w-9 h-9 flex justify-center items-center text-black rounded-full hover:bg-gray-50 transition"
            title="PDF"
          >
            <FileDown size={18} strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* Título + totais */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex flex-col min-w-0">
          <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-gray-900 leading-tight">
            OLÁ, {primeiroNome.toUpperCase()}!
          </h1>
          <span className="text-sm font-bold text-gray-400 uppercase tracking-wide mt-1">
            {viewMode === "materias" ? "Minhas matérias" : "Minhas turmas"}
          </span>
        </div>

        <div className="flex items-end gap-2 shrink-0 self-start md:self-auto">
          <div className="bg-white rounded-[20px] border border-gray-100 shadow-sm px-4 py-2 h-[52px] flex flex-col justify-center min-w-[80px]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 leading-none mb-1">
              Matérias
            </span>
            <span className="text-lg font-black text-gray-900 tabular-nums leading-none">
              {totalMaterias.toString().padStart(2, "0")}
            </span>
          </div>
          <div className="bg-white rounded-[20px] border border-gray-100 shadow-sm px-4 py-2 h-[52px] flex flex-col justify-center min-w-[80px]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 leading-none mb-1">
              Turmas
            </span>
            <span className="text-lg font-black text-gray-900 tabular-nums leading-none">
              {totalTurmas.toString().padStart(2, "0")}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}