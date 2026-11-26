import { MessageCircle, MessagesSquare, Users, Search, X, Filter, ChevronDown, ArrowLeft, Menu, UserCircle } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { CARGOS } from "./ui";

export default function UsersHeader({
  user,
  busca, setBusca,
  onBack, onChat, onFamily, onProfileOpen, onDirects,
  filtroCargo, setFiltroCargo,
  filtroStatus, setFiltroStatus,
  filtroUnidade, setFiltroUnidade,
  filtroRegional, setFiltroRegional,
  unidadesDisponiveis, regionaisDisponiveis, cargosDisponiveis
}) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const filterRef = useRef(null);
  const mobileMenuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setIsFilterOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setIsMobileMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const hasActiveFilters = 
    filtroCargo !== "todos" || 
    filtroStatus !== "todos" || 
    filtroUnidade.length > 0 || 
    filtroRegional.length > 0;

  return (
    // Mantido o mt-[-20px], max-w-7xl e rounded-b-3xl originais
    <header className="sticky top-0 mt-[-20px] mb-5 z-40 bg-white/90 backdrop-blur-xl border-b border-gray-200/60 shadow-sm rounded-b-3xl w-full">
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 gap-3 max-w-7xl mx-auto">
        
        {/* ESQUERDA: Voltar (Mobile) + Filtro */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onBack} 
            className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-white shadow-sm transition hover:opacity-80"
          >
            <ArrowLeft size={18} />
          </button>

          <div className="relative" ref={filterRef}>
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

            {/* Menu Suspenso de Filtros Completo */}
            {isFilterOpen && (
              <div className="absolute top-full mt-3 left-0 w-72 bg-white/95 backdrop-blur-xl border border-gray-200 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] z-50 p-4 animate-fade-in max-h-[80vh] overflow-y-auto">
                {/* Cargo */}
                <div className="mb-4">
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 block">Cargo</span>
                  <div className="flex flex-wrap gap-1.5">
                    <button onClick={() => setFiltroCargo("todos")} className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all ${filtroCargo === "todos" ? 'bg-gray-900 border-gray-900 text-white' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'}`}>Todos</button>
                    {cargosDisponiveis?.map(c => (
                      <button key={c} onClick={() => setFiltroCargo(c)} className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all ${filtroCargo === c ? 'bg-gray-900 border-gray-900 text-white' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'}`}>{CARGOS[c]?.[0] || c}</button>
                    ))}
                  </div>
                </div>

                {/* Status */}
                <div className="mb-4">
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 block">Status</span>
                  <div className="flex gap-1.5 bg-gray-50 p-1 rounded-xl border border-gray-100">
                    {[{id: "todos", l: "Todos"}, {id: "Ativo", l: "Ativos"}, {id: "Inativo", l: "Inativos"}].map(s => (
                      <button key={s.id} onClick={() => setFiltroStatus(s.id)} className={`flex-1 text-xs font-bold py-2 rounded-lg transition-all ${filtroStatus === s.id ? 'bg-white text-gray-900 shadow-sm ring-1 ring-black/5' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'}`}>{s.l}</button>
                    ))}
                  </div>
                </div>

                {/* Regional */}
                {regionaisDisponiveis?.length > 0 && (
                  <div className="mb-4">
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 block">Regional</span>
                    <div className="relative">
                      <select value={filtroRegional[0] || "todas"} onChange={(e) => setFiltroRegional(e.target.value === "todas" ? [] : [e.target.value])} className="w-full text-sm font-semibold text-gray-700 p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-gray-400 focus:bg-white transition-all appearance-none cursor-pointer">
                        <option value="todas">Todas as Regionais</option>
                        {regionaisDisponiveis.map(r => <option key={r.id} value={r.nome}>{r.nome}</option>)}
                      </select>
                      <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                )}

                {/* Unidade */}
                {unidadesDisponiveis?.length > 0 && (
                  <div>
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 block">Unidade</span>
                    <div className="relative">
                      <select value={filtroUnidade[0] || "todas"} onChange={(e) => setFiltroUnidade(e.target.value === "todas" ? [] : [e.target.value])} className="w-full text-sm font-semibold text-gray-700 p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-gray-400 focus:bg-white transition-all appearance-none cursor-pointer">
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
        <div className="min-w-0 flex-1 max-w-2xl relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="text-gray-400 group-focus-within:text-gray-900 transition-colors" size={18} />
          </div>
          <input 
            type="text" 
            placeholder="Pesquisar por nome ou e-mail..."
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

        {/* DIREITA: Desktop (Itens Soltos sem pílula) */}
        <div className="hidden sm:flex items-center gap-2 shrink-0">
          {onDirects && <button type="button" onClick={onDirects} className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-50 text-gray-600 transition hover:bg-gray-200" title="Meus directs" aria-label="Abrir meus directs"><MessagesSquare size={18}/></button>}
          <button onClick={onChat} className="p-2 rounded-full hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-all" title="Chat">
            <MessageCircle size={20} strokeWidth={2} />
          </button>
          <button onClick={onFamily} className="p-2 rounded-full hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-all" title="Equipe">
            <Users size={20} strokeWidth={2} />
          </button>
          
          <div className="w-[1px] h-6 bg-gray-200"></div>

          <button type="button" onClick={onProfileOpen} aria-label="Abrir meu perfil" className="w-9 h-9 rounded-full bg-black text-white overflow-hidden flex items-center justify-center font-bold text-sm hover:opacity-80 transition-all" title="Meu Perfil">
            {user?.nome ? user.nome.charAt(0).toUpperCase() : "U"}
          </button>
        </div>

        {/* DIREITA: Mobile (Menu Hamburguer) */}
        <div className="relative md:hidden shrink-0" ref={mobileMenuRef}>
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all"
          >
            <Menu size={20} />
          </button>

          {/* Dropdown do Menu Hamburguer */}
          {isMobileMenuOpen && (
            <div className="absolute top-full mt-2 right-0 w-48 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 p-2 animate-fade-in flex flex-col gap-1">
              {onDirects && <button onClick={() => { setIsMobileMenuOpen(false); onDirects(); }} className="flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50 rounded-xl transition-colors"><MessagesSquare size={18}/>Meus directs</button>}
              <button onClick={onChat} className="flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50 rounded-xl transition-colors">
                <MessageCircle size={18} /> Chat
              </button>
              <button onClick={onFamily} className="flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50 rounded-xl transition-colors">
                <Users size={18} /> Equipe
              </button>
              <div className="h-px bg-gray-100 my-1"></div>
              <button onClick={() => { setIsMobileMenuOpen(false); onProfileOpen?.(); }} className="flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50 rounded-xl transition-colors">
                <UserCircle size={18} /> Meu Perfil
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
