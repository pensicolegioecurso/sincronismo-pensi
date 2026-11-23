import { ArrowLeft, MessageCircle, Users, Download, FileText, FileSpreadsheet, ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";

const meses = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

export default function FeedHeader({
  user, isAdminOrNucleo, isRegional, isDirecao, isProfessor,
  unidadesEscopo, unidadeFoco, isExportOpen, setIsExportOpen, exportRef,
  onBack, onChat, onFamily,
  // Filtros de período
  filtroPeriodo, setFiltroPeriodo, mesFiltro, setMesFiltro,
  dataInicioCustom, setDataInicioCustom, dataFimCustom, setDataFimCustom
}) {
  let titulo = "FEED";
  let subtitulo = "";

  if (isAdminOrNucleo) {
    titulo = "FEED GLOBAL";
    subtitulo = "Todos os registros da plataforma.";
  } else if (isRegional) {
    titulo = "FEED REGIONAL";
    subtitulo = `Unidades: ${(unidadesEscopo || []).join(", ")}.`;
  } else if (isDirecao) {
    titulo = `FEED ${(unidadeFoco || user?.unidade?.split(",")[0] || "").toUpperCase()}`;
    subtitulo = "Registros da sua unidade.";
  } else {
    const primeiroNome = user?.nome?.split(" ")[0] || "Professor";
    titulo = `ATIVIDADE DE ${primeiroNome.toUpperCase()}`;
    subtitulo = "Seus registros enviados.";
  }

  const dataBase = mesFiltro instanceof Date && !isNaN(mesFiltro) ? mesFiltro : new Date();

  const handlePrev = () => {
    const novaData = new Date(dataBase);
    if (filtroPeriodo === "anual") novaData.setFullYear(novaData.getFullYear() - 1);
    else novaData.setMonth(novaData.getMonth() - 1);
    setMesFiltro(novaData);
  };

  const handleNext = () => {
    const novaData = new Date(dataBase);
    if (filtroPeriodo === "anual") novaData.setFullYear(novaData.getFullYear() + 1);
    else novaData.setMonth(novaData.getMonth() + 1);
    setMesFiltro(novaData);
  };

  const labelPeriodo = filtroPeriodo === "anual" ? dataBase.getFullYear() : `${meses[dataBase.getMonth()]} ${dataBase.getFullYear()}`;

  return (
    <header className="mb-6">
      <div className="flex items-center justify-between mb-8">
        <button onClick={onBack} className="w-11 h-11 rounded-full bg-white flex justify-center items-center shadow-sm border border-gray-100 active:scale-95 transition-transform text-black">
          <ArrowLeft size={18} strokeWidth={2.5} />
        </button>

        <div className="flex gap-1 bg-white rounded-[22px] px-2 py-1 border border-gray-100 shadow-sm">
          <button onClick={onChat} className="w-9 h-9 flex justify-center items-center text-black rounded-full hover:bg-gray-50 transition"><MessageCircle size={18} /></button>
          <button onClick={onFamily} className="w-9 h-9 flex justify-center items-center text-black rounded-full hover:bg-gray-50 transition"><Users size={18} /></button>
          {!isProfessor && (
            <div className="relative" ref={exportRef}>
              <button onClick={() => setIsExportOpen(!isExportOpen)} className="w-9 h-9 flex justify-center items-center text-black rounded-full hover:bg-gray-50 transition"><Download size={18} /></button>
              {isExportOpen && (
                <div className="absolute top-full mt-2 right-0 w-48 bg-white border border-gray-100 rounded-2xl shadow-lg z-50 overflow-hidden">
                  <button className="w-full text-left px-4 py-3 text-xs font-bold flex items-center gap-2 hover:bg-gray-50 border-b border-gray-100 transition-colors"><FileText size={15} /> Exportar PDF</button>
                  <button className="w-full text-left px-4 py-3 text-xs font-bold flex items-center gap-2 hover:bg-gray-50 transition-colors"><FileSpreadsheet size={15} /> Exportar Excel</button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Título e Seletor de Período na mesma linha */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex flex-col min-w-0">
          <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-gray-900 leading-tight">{titulo}</h1>
          {subtitulo && <span className="text-sm font-bold text-gray-400 uppercase tracking-wide mt-1">{subtitulo}</span>}
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <div className="flex bg-white rounded-full p-1 border border-gray-100 shadow-sm shrink-0">
            {[{ id: "anual", label: "Anual" }, { id: "mes", label: "Mensal" }, { id: "custom", label: "Período" }].map((opcao) => (
              <button
                key={opcao.id}
                onClick={() => { setFiltroPeriodo(opcao.id); if (opcao.id !== "custom") setMesFiltro(new Date()); }}
                className={`px-3 py-1.5 text-[11px] font-bold rounded-full transition-all ${filtroPeriodo === opcao.id ? "bg-gray-900 text-white shadow-sm" : "text-gray-500 hover:text-gray-900"}`}
              >
                {opcao.label}
              </button>
            ))}
          </div>

          {filtroPeriodo === "custom" ? (
            <div className="flex items-center bg-white rounded-[20px] px-3 py-1.5 border border-gray-100 shadow-sm gap-2 h-[34px]">
              <CalendarDays size={14} className="text-gray-400" />
              <input type="date" value={dataInicioCustom} onChange={(e) => setDataInicioCustom(e.target.value)} className="bg-transparent border-none text-[11px] font-bold outline-none cursor-pointer text-gray-700" />
              <span className="text-gray-400 text-[11px] font-bold">até</span>
              <input type="date" value={dataFimCustom} onChange={(e) => setDataFimCustom(e.target.value)} className="bg-transparent border-none text-[11px] font-bold outline-none cursor-pointer text-gray-700" />
            </div>
          ) : (
            <div className="flex items-center bg-white rounded-[20px] px-2 py-1 border border-gray-100 shadow-sm h-[34px]">
              <button onClick={handlePrev} className="p-1 rounded-full hover:bg-gray-100 transition"><ChevronLeft size={14} /></button>
              <span className="min-w-[90px] text-center text-[11px] font-bold text-gray-800 px-1">{labelPeriodo}</span>
              <button onClick={handleNext} className="p-1 rounded-full hover:bg-gray-100 transition"><ChevronRight size={14} /></button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}