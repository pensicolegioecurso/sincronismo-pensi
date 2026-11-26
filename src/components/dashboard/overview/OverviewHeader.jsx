import { ArrowLeft, MessageCircle, FileSpreadsheet, Search, Filter, ChevronDown, X, CalendarDays } from "lucide-react";
import { useState, useRef, useEffect } from "react";

const meses = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

export default function OverviewHeader({
  isDiretor,
  currentUser,
  onBack,
  onChat, 
  onReports,
  chatAberto,
  busca, setBusca,
  filtroPeriodo, setFiltroPeriodo,
  mesFiltro, setMesFiltro,
  dataInicioCustom, setDataInicioCustom,
  dataFimCustom, setDataFimCustom,
  filtroRegional, setFiltroRegional,
  filtroUnidade, setFiltroUnidade,
  regionaisDisponiveis, unidadesDisponiveis
}) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setIsFilterOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handlePrev = () => {
    const novaData = new Date(mesFiltro);
    if (filtroPeriodo === "anual") novaData.setFullYear(novaData.getFullYear() - 1);
    else novaData.setMonth(novaData.getMonth() - 1);
    setMesFiltro(novaData);
  };

  const handleNext = () => {
    const novaData = new Date(mesFiltro);
    if (filtroPeriodo === "anual") novaData.setFullYear(novaData.getFullYear() + 1);
    else novaData.setMonth(novaData.getMonth() + 1);
    setMesFiltro(novaData);
  };

  const labelPeriodo = filtroPeriodo === "anual" ? mesFiltro.getFullYear() : `${meses[mesFiltro.getMonth()]} ${mesFiltro.getFullYear()}`;
  
  const hasActiveFilters = 
    filtroPeriodo !== "mes" || 
    filtroRegional.length > 0 || 
    filtroUnidade.length > 0 ||
    busca !== "";

  return (
    <header className="sticky top-0 mt-[-20px] mb-5 z-40 bg-white/90 backdrop-blur-xl border-b border-gray-200/60 shadow-sm rounded-b-3xl w-full">
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 gap-3 max-w-7xl mx-auto">
        
        {/* ESQUERDA: Voltar + Filtro */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onBack}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-white hover:opacity-80 shadow-sm transition-all active:scale-95"
          >
            <ArrowLeft size={18} strokeWidth={2.5} />
          </button>

          <div className="relative" ref={filterRef}>
            <button 
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 ${
                hasActiveFilters 
                  ? "bg-black text-white shadow-md ring-2 ring-black ring-offset-2" 
                  : "bg-black text-white hover:opacity-80 shadow-sm"
              }`}
            >
              <Filter size={18} />
            </button>

            {isFilterOpen && (
              <div className="absolute top-full mt-3 left-0 w-72 bg-white/95 backdrop-blur-xl border border-gray-200 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] z-50 p-4 animate-fade-in max-h-[80vh] overflow-y-auto">
                
                <div className="mb-4">
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 block">Período</span>
                  <div className="flex gap-1.5 bg-gray-50 p-1 rounded-xl border border-gray-100">
                    {[{id:"mes", l:"Mensal"}, {id:"anual", l:"Anual"}, {id:"custom", l:"Custom"}].map(p => (
                      <button 
                        key={p.id} 
                        onClick={() => { setFiltroPeriodo(p.id); if(p.id !== 'custom') setMesFiltro(new Date()); }} 
                        className={`flex-1 text-xs font-bold py-2 rounded-lg transition-all ${
                          filtroPeriodo === p.id ? 'bg-white text-gray-900 shadow-sm ring-1 ring-black/5' : 'text-gray-500 hover:text-gray-900'
                        }`}
                      >
                        {p.l}
                      </button>
                    ))}
                  </div>
                </div>

                {filtroPeriodo !== "custom" ? (
                  <div className="mb-4 flex items-center justify-between bg-gray-50 rounded-xl p-1 border border-gray-100">
                    <button onClick={handlePrev} className="p-2 rounded-lg hover:bg-white hover:shadow-sm transition"><ChevronDown size={14} className="rotate-90" /></button>
                    <span className="text-xs font-bold text-gray-700">{labelPeriodo}</span>
                    <button onClick={handleNext} className="p-2 rounded-lg hover:bg-white hover:shadow-sm transition"><ChevronDown size={14} className="-rotate-90" /></button>
                  </div>
                ) : (
                  <div className="mb-4 space-y-2 bg-gray-50 rounded-xl p-2 border border-gray-100">
                    <div className="flex items-center gap-2 bg-white px-2 py-1.5 rounded-lg border border-gray-200">
                      <CalendarDays size={14} className="text-gray-400" />
                      <input type="date" value={dataInicioCustom} onChange={e => setDataInicioCustom(e.target.value)} className="bg-transparent text-xs font-bold outline-none w-full" />
                    </div>
                    <div className="flex items-center gap-2 bg-white px-2 py-1.5 rounded-lg border border-gray-200">
                      <CalendarDays size={14} className="text-gray-400" />
                      <input type="date" value={dataFimCustom} onChange={e => setDataFimCustom(e.target.value)} className="bg-transparent text-xs font-bold outline-none w-full" />
                    </div>
                  </div>
                )}

                {regionaisDisponiveis?.length > 0 && !isDiretor && (
                  <div className="mb-4">
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 block">Regional</span>
                    <div className="relative">
                      <select 
                        value={filtroRegional[0] || "todas"} 
                        onChange={(e) => setFiltroRegional(e.target.value === "todas" ? [] : [e.target.value])}
                        className="w-full text-sm font-semibold text-gray-700 p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-gray-400 appearance-none cursor-pointer"
                      >
                        <option value="todas">Todas as Regionais</option>
                        {regionaisDisponiveis.map(r => <option key={r.id || r.nome} value={r.nome || r}>{r.nome || r}</option>)}
                      </select>
                      <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                )}

                {unidadesDisponiveis?.length > 0 && (
                  <div>
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 block">Unidade</span>
                    <div className="relative">
                      <select 
                        value={filtroUnidade[0] || "todas"} 
                        onChange={(e) => setFiltroUnidade(e.target.value === "todas" ? [] : [e.target.value])}
                        className="w-full text-sm font-semibold text-gray-700 p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-gray-400 appearance-none cursor-pointer"
                      >
                        <option value="todas">Todas as Unidades</option>
                        {unidadesDisponiveis.map(u => <option key={u} value={u}>{u}</option>)}
                      </select>
                      <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* CENTRO: Barra de Pesquisa */}
        <div className="flex-1 max-w-2xl relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="text-gray-400 group-focus-within:text-gray-900 transition-colors" size={18} />
          </div>
          <input 
            type="text" 
            placeholder="Buscar unidade..."
            value={busca || ""}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full h-10 bg-gray-100/80 hover:bg-gray-100 focus:bg-white border border-transparent focus:border-gray-300 focus:ring-4 focus:ring-gray-100 rounded-full pl-11 pr-10 text-sm font-medium text-gray-900 outline-none transition-all placeholder:text-gray-400"
          />
          {busca && (
            <button onClick={() => setBusca("")} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-200 rounded-full transition-all">
              <X size={14} strokeWidth={2.5} />
            </button>
          )}
        </div>

        {/* DIREITA: Chat, Relatórios e Avatar */}
        <div className="flex items-center gap-2 shrink-0">
          {/* FORÇANDO O BOTÃO A SER UM BUTTON NATIVO E CHAMAR A FUNÇÃO */}
          <button
            type="button"
            onClick={() => {
              console.log("Clicou no chat!");
              if(onChat) onChat();
            }}
            className={`relative flex h-9 w-9 items-center justify-center rounded-full transition ${
              chatAberto ? "bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white shadow-md" : "bg-gray-50 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <MessageCircle size={18} />
            {!chatAberto && <span className="absolute right-1.5 top-1.5 h-2 w-2 animate-pulse rounded-full bg-emerald-500 ring-2 ring-white" />}
          </button>
          
          <button
            type="button"
            onClick={onReports}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-50 text-gray-600 hover:bg-yellow-50 hover:text-yellow-700 transition"
          >
            <FileSpreadsheet size={18} />
          </button>
          
          <div className="w-[1px] h-6 bg-gray-200 mx-1"></div>

          <button className="w-9 h-9 rounded-full bg-black text-white overflow-hidden flex items-center justify-center font-bold text-sm hover:opacity-80 transition-all">
            {currentUser?.nome ? currentUser.nome.charAt(0).toUpperCase() : "U"}
          </button>
        </div>

      </div>
    </header>
  );
}