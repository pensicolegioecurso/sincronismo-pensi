// src/components/dashboard/feed/FeedHeader.jsx
import { Download, FileText, FileSpreadsheet } from "lucide-react";

export default function FeedHeader({
  user, isAdminOrNucleo, isRegional, isDirecao, isProfessor,
  unidadesEscopo, unidadeFoco, isExportOpen, setIsExportOpen, exportRef,
}) {
  const headerTitle = isAdminOrNucleo ? "Feed Global" : isRegional ? "Feed Regional" : isDirecao ? "Feed da Unidade" : "Minha Atividade";
  const headerSubtitle = isAdminOrNucleo
    ? "Acompanhe todos os registros de aulas e justificativas da plataforma."
    : isRegional
    ? `Acompanhe os registros das unidades: ${(unidadesEscopo || []).join(", ")}.`
    : isDirecao
    ? `Acompanhe os registros da unidade ${unidadeFoco || user?.unidade?.split(",")[0]}.`
    : "Acompanhe os seus registros de aulas e justificativas enviados.";

  return (
    <section className="mb-5 mt-7 pb-4 border-b-2 border-black/40">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-1.5 h-1.5 bg-pensi-yellow border border-black rounded-full" />
            <span className="text-[10px] font-black uppercase tracking-[0.22em] text-gray-500">{headerTitle}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-black tracking-tight leading-none">
            Feed<span className="text-pensi-yellow">.</span>
          </h1>
          <p className="text-sm text-gray-500 mt-2 max-w-xl leading-relaxed">{headerSubtitle}</p>
        </div>
        {!isProfessor && (
          <div className="flex items-center gap-2 self-start lg:self-auto">
            <div className="relative" ref={exportRef}>
              <button onClick={() => setIsExportOpen(!isExportOpen)}
                className="flex items-center justify-center gap-2.5 px-6 py-3.5 bg-pensi-yellow text-black border-2 border-black rounded-xl text-xs font-black uppercase tracking-wider shadow-[3px_3px_0px_#000] hover:bg-yellow-300 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all h-full">
                <Download className="w-5 h-5" /> Exportar
              </button>
              {isExportOpen && (
                <div className="absolute top-full mt-2 right-0 w-48 bg-white border-2 border-black rounded-xl shadow-[3px_3px_0px_#000] z-50 overflow-hidden">
                  <button className="w-full text-left px-3 py-2.5 text-[11px] font-bold flex items-center gap-2 hover:bg-pensi-yellow/40 border-b-2 border-black/10 transition-colors">
                    <FileText size={15} /> Exportar como PDF
                  </button>
                  <button className="w-full text-left px-3 py-2.5 text-[11px] font-bold flex items-center gap-2 hover:bg-pensi-yellow/40 transition-colors">
                    <FileSpreadsheet size={15} /> Exportar como Excel
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}