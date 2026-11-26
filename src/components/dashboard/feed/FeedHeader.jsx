import { MessageCircle, Users, Search, X, Filter, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";

export default function FeedHeader({
  user,
  busca, setBusca,
  onChat, onFamily,
  filtroTipoFeed, setFiltroTipoFeed,
  filtroPeriodo, setFiltroPeriodo,
  filtroUnidade, setFiltroUnidade,
  filtroRegional, setFiltroRegional,
  unidadesPermitidas, regionaisDisponiveis
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

  const hasActiveFilters = filtroTipoFeed !== "tudo" || filtroPeriodo !== "mes" || filtroUnidade.length > 0 || filtroRegional.length > 0;

  return (
    // Adicionado cantos arredondados na parte inferior (rounded-b-3xl) e sombra para destacar
    <header className="sticky top-0 mt-[-20px] mb-5 z-40 bg-white/90 backdrop-blur-xl border-b border-gray-200/60 shadow-sm rounded-b-3xl">
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 gap-3 max-w-7xl mx-auto">
        
        {/* Lado Esquerdo: Botão de Filtro (Apenas Ícone, Fundo Preto) */}
        <div className="relative shrink-0" ref={filterRef}>
          <button 
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 ${
              hasActiveFilters 
                ? "bg-black text-white shadow-md ring-2 ring-black ring-offset-2" 
                : "bg-black text-white hover:opacity-80 shadow-sm"
            }`}
            title="Filtros"
          >
            <Filter size={18} />
          </button>

          {/* Menu Suspenso de Filtros */}
          {isFilterOpen && (
            <div className="absolute top-full mt-3 left-0 w-72 bg-white/95 backdrop-blur-xl border border-gray-200 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] z-50 p-4 animate-fade-in max-h-[80vh] overflow-y-auto">
              
              {/* Tipo */}
              <div className="mb-4">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 block">Tipo de Registro</span>
                <div className="flex gap-1.5 bg-gray-50 p-1 rounded-xl border border-gray-100">
                  {["tudo", "aula", "justificativa"].map(t => (
                    <button 
                      key={t} 
                      onClick={() => setFiltroTipoFeed(t)} 
                      className={`flex-1 text-xs font-bold py-2 rounded-lg capitalize transition-all ${
                        filtroTipoFeed === t 
                          ? 'bg-white text-gray-900 shadow-sm ring-1 ring-black/5' 
                          : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Período */}
              <div className="mb-4">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 block">Período</span>
                <div className="flex gap-1.5 bg-gray-50 p-1 rounded-xl border border-gray-100">
                  {[{id:"mes", l:"Mês"}, {id:"anual", l:"Ano"}, {id:"custom", l:"Custom"}].map(p => (
                    <button 
                      key={p.id} 
                      onClick={() => setFiltroPeriodo(p.id)} 
                      className={`flex-1 text-xs font-bold py-2 rounded-lg transition-all ${
                        filtroPeriodo === p.id 
                          ? 'bg-white text-gray-900 shadow-sm ring-1 ring-black/5' 
                          : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                    >
                      {p.l}
                    </button>
                  ))}
                </div>
              </div>

              {/* Regional */}
              {regionaisDisponiveis?.length > 0 && (
                <div className="mb-4">
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 block">Regional</span>
                  <div className="relative">
                    <select 
                      value={filtroRegional[0] || "todas"} 
                      onChange={(e) => setFiltroRegional(e.target.value === "todas" ? [] : [e.target.value])}
                      className="w-full text-sm font-semibold text-gray-700 p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-gray-400 focus:bg-white transition-all appearance-none cursor-pointer"
                    >
                      <option value="todas">Todas as Regionais</option>
                      {regionaisDisponiveis.map(r => <option key={r.id} value={r.nome}>{r.nome}</option>)}
                    </select>
                    <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              )}

              {/* Unidade */}
              {unidadesPermitidas?.length > 0 && (
                <div>
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 block">Unidade</span>
                  <div className="relative">
                    <select 
                      value={filtroUnidade[0] || "todas"} 
                      onChange={(e) => setFiltroUnidade(e.target.value === "todas" ? [] : [e.target.value])}
                      className="w-full text-sm font-semibold text-gray-700 p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-gray-400 focus:bg-white transition-all appearance-none cursor-pointer"
                    >
                      <option value="todas">Todas as Unidades</option>
                      {unidadesPermitidas.map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                    <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Centro: Barra de Pesquisa */}
        <div className="flex-1 max-w-2xl relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="text-gray-400 group-focus-within:text-gray-900 transition-colors" size={18} />
          </div>
          <input 
            type="text" 
            placeholder="Pesquisar por matéria, turma ou professor..."
            value={busca || ""}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full h-11 bg-gray-100/80 hover:bg-gray-100 focus:bg-white border border-transparent focus:border-gray-300 focus:ring-4 focus:ring-gray-100 rounded-full pl-11 pr-10 text-sm font-medium text-gray-900 outline-none transition-all placeholder:text-gray-400"
          />
          {busca && (
            <button 
              onClick={() => setBusca("")} 
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-200 rounded-full transition-all"
            >
              <X size={14} strokeWidth={2.5} />
            </button>
          )}
        </div>

        {/* Lado Direito: Pílula Única (Chat, Pessoas e Avatar) */}
        <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-full p-1 shadow-sm shrink-0">
          <button 
            onClick={onChat} 
            className="p-2 rounded-full hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-all" 
            title="Chat"
          >
            <MessageCircle size={20} strokeWidth={2} />
          </button>
          <button 
            onClick={onFamily} 
            className="p-2 rounded-full hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-all"
            title="Equipe"
          >
            <Users size={20} strokeWidth={2} />
          </button>
          
          <div className="w-[1px] h-6 bg-gray-200 mx-1"></div>

          <button 
            className="w-8 h-8 ml-1 rounded-full bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center font-bold text-gray-600 text-xs hover:ring-2 hover:ring-gray-200 transition-all"
            title="Meu Perfil"
          >
            {user?.nome ? user.nome.charAt(0).toUpperCase() : "U"}
          </button>
        </div>
      </div>
    </header>
  );
}