import { useState } from "react";
import { ArrowLeft, MessageCircle, MessagesSquare, Users, FileDown, Menu, Filter, Search, X, Building2, ListFilter } from "lucide-react";

const TEMPOS = [{ id: "geral", label: "Geral" }, { id: "hoje", label: "Hoje" }, { id: "mes", label: "Mês" }, { id: "ano", label: "Ano" }];

export default function StartHeader({ user, viewMode, setViewMode, onBack, onChat, onDirects, onProfile, onFamily, onDownloadPDF, familyMode, busca, setBusca, filtroUnidade, setFiltroUnidade, filtroTempo, setFiltroTempo, unidadesDisponiveis }) {
  const [filtrosAbertos, setFiltrosAbertos] = useState(false);
  const [menuAberto, setMenuAberto] = useState(false);
  const acoes = [
    { label: "Meus directs", icon: MessagesSquare, action: onDirects },
    { label: "Chat", icon: MessageCircle, action: onChat },
    { label: "Relatórios", icon: FileDown, action: onDownloadPDF },
    { label: "Família", icon: Users, action: onFamily, ativo: familyMode },
  ].filter((item) => item.action);
  const temFiltroAtivo = filtroUnidade !== "Todas" || filtroTempo !== "geral";

  return <header className="sticky top-0 z-40 mt-[-20px] -mx-4 mb-5 w-[calc(100%+2rem)] rounded-b-3xl border-b border-gray-200/60 bg-white/90 shadow-sm backdrop-blur-xl sm:-mx-6 sm:w-[calc(100%+3rem)]">
    <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
      <div className="flex shrink-0 items-center gap-2">
        <button type="button" onClick={onBack || (() => window.history.back())} aria-label="Voltar" className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-white shadow-sm transition hover:opacity-80"><ArrowLeft size={18} strokeWidth={2.5}/></button>
        <div className="relative">
          <button type="button" onClick={() => setFiltrosAbertos((value) => !value)} aria-label="Filtros" title="Filtros" className={`flex h-10 w-10 items-center justify-center rounded-full transition ${temFiltroAtivo ? "bg-black text-white ring-2 ring-black ring-offset-2" : "bg-black text-white hover:opacity-80"}`}><Filter size={18}/></button>
          {filtrosAbertos && <div className="absolute left-0 top-full z-50 mt-3 w-72 space-y-4 rounded-2xl border border-gray-200 bg-white/95 p-4 shadow-xl backdrop-blur-xl">
            <div><span className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-gray-400">Período</span><div className="grid grid-cols-4 gap-1 rounded-xl border border-gray-100 bg-gray-50 p-1">{TEMPOS.map((tempo) => <button key={tempo.id} type="button" onClick={() => setFiltroTempo(tempo.id)} className={`rounded-lg py-2 text-xs font-bold ${filtroTempo === tempo.id ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900"}`}>{tempo.label}</button>)}</div></div>
            <label className="block"><span className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-gray-400">Unidade</span><span className="relative block"><Building2 size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/><select value={filtroUnidade} onChange={(event) => setFiltroUnidade(event.target.value)} className="w-full appearance-none rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-9 pr-3 text-sm font-semibold text-gray-700 outline-none"><option value="Todas">Todas as unidades</option>{unidadesDisponiveis.filter((unidade) => unidade !== "Todas").map((unidade) => <option key={unidade} value={unidade}>{unidade}</option>)}</select></span></label>
            <button type="button" onClick={() => setViewMode(viewMode === "materias" ? "turmas" : "materias")} className="flex w-full items-center justify-between rounded-xl border border-gray-200 px-3 py-2.5 text-left text-sm font-semibold text-gray-700 hover:bg-gray-50"><span className="flex items-center gap-2"><ListFilter size={16}/>{viewMode === "materias" ? "Exibir turmas" : "Exibir matérias"}</span><span className="text-xs text-gray-400">{viewMode === "materias" ? "Matérias" : "Turmas"}</span></button>
          </div>}
        </div>
      </div>
      <div className="min-w-0 flex-1">
        <div className="group relative mx-auto max-w-2xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-gray-900" size={18}/>
          <input type="search" value={busca} onChange={(event) => setBusca(event.target.value)} placeholder={viewMode === "materias" ? "Buscar matéria..." : "Buscar turma..."} className="h-10 w-full rounded-full border border-transparent bg-gray-100/80 pl-11 pr-10 text-sm font-medium text-gray-900 outline-none transition placeholder:text-gray-400 hover:bg-gray-100 focus:border-gray-300 focus:bg-white focus:ring-4 focus:ring-gray-100"/>
          {busca && <button type="button" onClick={() => setBusca("")} aria-label="Limpar busca" className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-gray-400 hover:bg-gray-200 hover:text-gray-700"><X size={14}/></button>}
        </div>
      </div>
      <div className="hidden shrink-0 items-center gap-2 sm:flex">{acoes.map(({ label, icon: Icon, action, ativo }) => <button key={label} type="button" onClick={action} title={label} aria-label={label} className={`flex h-9 w-9 items-center justify-center rounded-full transition ${ativo ? "bg-emerald-100 text-emerald-700" : "bg-gray-50 text-gray-600 hover:bg-gray-200"}`}><Icon size={18}/></button>)}{onProfile && <button type="button" onClick={onProfile} aria-label="Abrir meu perfil" title="Meu perfil" className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-black text-sm font-bold text-white">{user?.nome?.charAt(0)?.toUpperCase() || "U"}</button>}</div>
      <div className="relative shrink-0 sm:hidden"><button type="button" onClick={() => setMenuAberto((value) => !value)} aria-label="Abrir menu" className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-700"><Menu size={19}/></button>{menuAberto && <div className="absolute right-0 top-12 z-50 w-52 rounded-2xl border border-gray-100 bg-white p-2 shadow-xl">{acoes.map(({ label, icon: Icon, action }) => <button key={label} type="button" onClick={() => { setMenuAberto(false); action(); }} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold hover:bg-gray-50"><Icon size={17}/>{label}</button>)}{onProfile && <button type="button" onClick={() => { setMenuAberto(false); onProfile(); }} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold hover:bg-gray-50">Meu perfil</button>}</div>}</div>
    </div>
  </header>;
}
