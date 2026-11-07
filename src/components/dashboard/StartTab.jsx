import { useState, useMemo, useRef, useEffect } from "react";
import {
  Filter,
  CheckCircle2,
  BarChart3,
  Clock,
  AlertCircle,
  LayoutGrid,
  List,
  BookOpen,
  ChevronRight,
  ChevronLeft,
  Search,
  X,
  MapPin,
  Users,
} from "lucide-react";
import { DISCIPLINAS_POR_ANO } from "../../data/disciplinas";

const UNIDADES = ["Todas", "Icaraí", "Flamengo", "Tijuca I"];

const TEMPOS_LIST = [
  { id: "geral", label: "Geral" },
  { id: "hoje", label: "Hoje" },
  { id: "mes", label: "Mês" },
  { id: "ano", label: "Ano" },
];

const statsBase = { concluidas: 124, pendentes: 3, justificadas: 5 };

function Reveal({ children }) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 ease-out ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
      }`}
    >
      {children}
    </div>
  );
}

export default function StartTab({ user, onNavigate }) {
  const [viewMode, setViewMode] = useState("materias");
  const [filtroUnidade, setFiltroUnidade] = useState("Todas");
  const [filtroTempo, setFiltroTempo] = useState("geral");
  const [busca, setBusca] = useState("");
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [mostrarEstatisticas, setMostrarEstatisticas] = useState(false);
  
  const ITENS_POR_PAGINA = 5;

  const minhasDisciplinas = useMemo(() => {
    if (!user) return [];
    const base = DISCIPLINAS_POR_ANO["2026"] || {};
    return (user.disciplinas || []).map((key) => ({
      key,
      nome: base[key]?.nome || key,
      ano: "2026",
      unidade: user.unidades?.[0] || "Icaraí",
      turmas: ["9º Ano A", "1ª Série A", "2ª Série B"],
    }));
  }, [user]);

  const disciplinasFiltradas = useMemo(() => {
    return minhasDisciplinas.filter(
      (d) => filtroUnidade === "Todas" || d.unidade === filtroUnidade
    );
  }, [minhasDisciplinas, filtroUnidade]);

  const todosCards = useMemo(() => {
    let cards = [];
    disciplinasFiltradas.forEach((disc) => {
      if (viewMode === "materias") {
        cards.push({
          id: disc.key,
          nome: disc.nome,
          unidade: disc.unidade,
          turma: null,
          qtdTurmas: disc.turmas.length,
          key: disc.key,
          ano: disc.ano,
        });
      } else {
        disc.turmas.forEach((t) => {
          cards.push({
            id: `${disc.key}-${t}`,
            nome: disc.nome,
            unidade: disc.unidade,
            turma: t,
            qtdTurmas: null,
            key: disc.key,
            ano: disc.ano,
          });
        });
      }
    });

    if (busca) {
      return cards.filter(
        (c) => c.turma && c.turma.toLowerCase().includes(busca.toLowerCase())
      );
    }

    return cards;
  }, [disciplinasFiltradas, viewMode, busca]);

  const totalPaginas = Math.max(
    1,
    Math.ceil(todosCards.length / ITENS_POR_PAGINA)
  );
  const cardsPaginados = useMemo(() => {
    const inicio = (paginaAtual - 1) * ITENS_POR_PAGINA;
    return todosCards.slice(inicio, inicio + ITENS_POR_PAGINA);
  }, [todosCards, paginaAtual]);

  useEffect(() => {
    setPaginaAtual(1);
  }, [filtroUnidade, viewMode, busca, filtroTempo]);

  const totalMaterias = new Set(
    todosCards.filter((c) => c.turma).map((c) => c.nome)
  ).size || new Set(todosCards.map((c) => c.nome)).size;
  const totalTurmas = new Set(
    todosCards.filter((c) => c.turma).map((c) => c.turma)
  ).size;

  const statsFiltradas = useMemo(() => {
    if (filtroTempo === "geral") return statsBase;
    if (filtroTempo === "hoje") return { concluidas: 2, pendentes: 0, justificadas: 0 };
    if (filtroTempo === "mes") return { concluidas: 18, pendentes: 1, justificadas: 2 };
    if (filtroTempo === "ano") return { concluidas: 95, pendentes: 3, justificadas: 4 };
    return statsBase;
  }, [filtroTempo]);

  const statsCardsData = [
    {
      id: "concluidas",
      numero: statsFiltradas.concluidas,
      label: "Realizadas",
      icon: CheckCircle2,
      iconBg: "bg-green-300",
      tagBg: "bg-green-300",
    },
    {
      id: "pendentes",
      numero: statsFiltradas.pendentes,
      label: "Pendentes",
      icon: Clock,
      iconBg: "bg-red-300",
      tagBg: "bg-red-300",
    },
    {
      id: "justificadas",
      numero: statsFiltradas.justificadas,
      label: "Justificadas",
      icon: AlertCircle,
      iconBg: "bg-yellow-300",
      tagBg: "bg-yellow-300",
    },
  ];

  return (
    <div className="w-full min-w-0 pb-0 animate-fade-in flex flex-col min-h-screen">
      <div className="max-w-5xl mx-auto px-1 w-full flex-1 pb-10">
        
        {/* CABEÇALHO PRINCIPAL */}
        <section className="mb-5">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-1.5 h-1.5 bg-pensi-yellow border border-black rounded-full" />
                <span className="text-[10px] font-black uppercase tracking-[0.22em] text-gray-500">
                  Início
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-black text-black tracking-tight leading-none">
                Olá, Silvia
                <span className="text-pensi-yellow">.</span>
              </h1>

              <p className="text-sm text-gray-500 mt-2 max-w-xl leading-relaxed">
                Selecione uma matéria para visualizar os detalhes.
              </p>
            </div>

            <div className="flex flex-wrap items-end gap-2 self-start lg:self-auto">
              <div className="bg-white border-2 border-black rounded-xl px-3 py-2 shadow-[2px_2px_0px_#000]">
                <span className="block text-[9px] font-black uppercase tracking-widest text-gray-400 mb-0.5">
                  Matérias
                </span>
                <span className="text-base font-black text-black tabular-nums leading-none">
                  {totalMaterias.toString().padStart(2, "0")}
                </span>
              </div>

              <div className="bg-pensi-yellow border-2 border-black rounded-xl px-4 py-2.5 shadow-[3px_3px_0px_#000]">
                <span className="block text-[10px] font-black uppercase tracking-widest text-black/70 mb-1">
                  Turmas
                </span>
                <span className="text-3xl font-black text-black tabular-nums leading-none">
                  {totalTurmas.toString().padStart(2, "0")}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* BARRA DE FERRAMENTAS */}
        <div className="bg-white border-2 border-black rounded-xl shadow-[3px_3px_0px_#000] p-3 mb-4">
          <div className="flex flex-col xl:flex-row gap-2.5 items-stretch xl:items-center justify-between">
            
            <div className="flex flex-col sm:flex-row gap-2.5 flex-1 items-stretch sm:items-center">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar turma..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="w-full h-[38px] bg-gray-50 border-2 border-black rounded-xl pl-9 pr-8 text-sm font-medium text-black outline-none placeholder:text-gray-400 focus:bg-pensi-yellow/20 transition-colors shadow-[2px_2px_0px_#000]"
                />
                {busca && (
                  <button
                    onClick={() => setBusca("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-1.5 h-[38px] bg-gray-50 border-2 border-black rounded-xl px-2.5 shadow-[2px_2px_0px_#000] shrink-0">
                <Filter className="w-4 h-4 text-black shrink-0" />
                <select
                  value={filtroUnidade}
                  onChange={(e) => setFiltroUnidade(e.target.value)}
                  className="bg-transparent text-[11px] font-black uppercase tracking-wider text-black focus:outline-none cursor-pointer h-full"
                >
                  {UNIDADES.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <div className="flex items-center gap-3 h-[38px] bg-gray-50 border-2 border-black rounded-xl px-3 shadow-[2px_2px_0px_#000]">
                {TEMPOS_LIST.map((p) => {
                  const ativo = filtroTempo === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => setFiltroTempo(p.id)}
                      className="flex items-center gap-1.5 group h-full"
                      aria-pressed={ativo}
                    >
                      <span
                        className={`w-3 h-3 rounded-full border-2 border-black transition-all ${
                          ativo
                            ? "bg-pensi-yellow shadow-[1px_1px_0px_#000] scale-110"
                            : "bg-white group-hover:bg-pensi-yellow/30"
                        }`}
                      />
                      <span
                        className={`text-[10px] font-black uppercase tracking-wider ${
                          ativo ? "text-black" : "text-gray-400"
                        }`}
                      >
                        {p.label}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-2 h-[38px] bg-gray-50 border-2 border-black rounded-xl px-3 shadow-[2px_2px_0px_#000] shrink-0">
                <span className={`text-[10px] font-black uppercase tracking-wider transition-colors ${viewMode === 'materias' ? 'text-black' : 'text-gray-400'}`}>Matéria</span>
                <button
                  onClick={() => setViewMode(viewMode === "materias" ? "turmas" : "materias")}
                  className={`relative w-10 h-5 rounded-full border-2 border-black transition-colors duration-300 shrink-0 ${viewMode === "turmas" ? "bg-pensi-yellow" : "bg-gray-300"}`}
                >
                  <div className={`absolute top-[1px] left-[1px] bg-white border-2 border-black rounded-full w-3.5 h-3.5 transition-transform duration-300 ${viewMode === "turmas" ? "translate-x-[18px]" : "translate-x-0"}`} />
                </button>
                <span className={`text-[10px] font-black uppercase tracking-wider transition-colors ${viewMode === 'turmas' ? 'text-black' : 'text-gray-400'}`}>Turma</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-3 border-t-2 border-dashed border-gray-200">
            <div className="flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Exibindo</span>
              <span className="bg-pensi-yellow border border-black rounded-lg px-2 py-0.5 text-[10px] font-black text-black">
                {cardsPaginados.length}
              </span>
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">de {todosCards.length}</span>

              {busca && (
                <span className="bg-gray-100 border border-black rounded-lg px-2 py-0.5 text-[10px] font-black text-black uppercase tracking-wider">
                  Turma: {busca}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* MINHAS ESTATÍSTICAS */}
        <section className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-3">
            <div>
              <h2 className="text-sm font-black uppercase tracking-wider text-black">
                Minhas estatísticas
              </h2>
              <p className="text-[11px] text-gray-500 mt-0.5">
                Resumo das suas aulas com base no período selecionado.
              </p>
            </div>

            <label className="group flex items-center gap-2 cursor-pointer select-none w-fit bg-white px-3 py-2 rounded-xl border-2 border-black shadow-[2px_2px_0px_#000] hover:shadow-none hover:translate-y-[2px] hover:translate-x-[2px] transition-all mt-2 sm:mt-0">
              <div className="relative flex items-center justify-center w-4 h-4 border-2 border-black rounded bg-white shrink-0">
                <input
                  type="checkbox"
                  className="absolute inset-0 opacity-0 cursor-pointer peer"
                  checked={mostrarEstatisticas}
                  onChange={(e) => setMostrarEstatisticas(e.target.checked)}
                />
                <CheckCircle2
                  className={`w-3 h-3 text-black transition-all duration-200 ${
                    mostrarEstatisticas ? "scale-100 opacity-100" : "scale-0 opacity-0"
                  }`}
                  strokeWidth={3}
                />
              </div>
              <span className="text-[11px] font-black uppercase tracking-wider text-black flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4" />
                Mostrar estatísticas
              </span>
            </label>
          </div>

          {mostrarEstatisticas && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 animate-fade-in">
              {statsCardsData.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={stat.id}
                    className="bg-white border-2 border-black rounded-xl shadow-[2px_2px_0px_#000] p-3 flex flex-col justify-between relative overflow-hidden min-h-[110px]"
                  >
                    <div className="flex justify-between items-start">
                      <div className={`w-9 h-9 border-2 border-black rounded-lg flex items-center justify-center ${stat.iconBg}`}>
                        <Icon className="w-4.5 h-4.5 text-black" strokeWidth={2.5} />
                      </div>

                      <span className={`text-[9px] font-black uppercase tracking-wider border-2 border-black rounded-lg px-2 py-1 -rotate-3 ${stat.tagBg}`}>
                        {stat.label}
                      </span>
                    </div>

                    <div className="mt-3">
                      <p className="text-4xl font-black text-black tracking-tight tabular-nums leading-none">
                        {stat.numero}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* CABEÇALHO DA LISTAGEM */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
          <div>
            <h2 className="text-sm font-black uppercase tracking-wider text-black">
              Minhas matérias e turmas
            </h2>
            <p className="text-[11px] text-gray-500 mt-0.5">
              Clique para abrir o calendário da disciplina.
            </p>
          </div>
          <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">
            Lista de disciplinas
          </span>
        </div>

        {/* LISTAGEM DE CARDS */}
        <div className="space-y-2.5 mb-6">
          {cardsPaginados.length === 0 && (
            <div className="bg-white border-2 border-black border-dashed rounded-xl p-8 text-center shadow-[2px_2px_0px_#000]">
              <Search className="w-7 h-7 text-gray-300 mx-auto mb-2" />
              <h3 className="text-sm font-black uppercase text-black">
                Nenhum registro encontrado
              </h3>
              <p className="text-[11px] text-gray-500 mt-1">
                Tente buscar por outra turma.
              </p>
            </div>
          )}

          {cardsPaginados.map((card, index) => {
            const coresSeta = ["bg-green-300", "bg-pensi-yellow", "bg-pink-300"];
            const corSeta = coresSeta[index % coresSeta.length];

            return (
              <article
                key={card.id}
                onClick={() => onNavigate("calendar", card.key, card.ano)}
                className="bg-white border-2 border-black rounded-xl shadow-[2px_2px_0px_#000] hover:shadow-none hover:translate-y-[2px] hover:translate-x-[2px] transition-all overflow-hidden cursor-pointer group"
              >
                <div className="flex items-center p-3.5 gap-3">
                  <div className="w-10 h-10 shrink-0 bg-pensi-yellow border-2 border-black rounded-lg flex items-center justify-center shadow-[1px_1px_0px_#000]">
                    <BookOpen className="w-5 h-5 text-black" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                      <h3 className="text-sm font-black text-black">
                        {card.nome}
                      </h3>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:flex-wrap gap-x-3 gap-y-0.5 mt-1">
                      {card.qtdTurmas && (
                        <span className="flex items-center gap-1 text-[11px] text-gray-500 font-medium">
                          <Users className="w-3 h-3 shrink-0" />
                          {card.qtdTurmas} turmas
                        </span>
                      )}
                      
                      {card.turma && (
                        <span className="flex items-center gap-1 text-[11px] text-gray-500 font-medium">
                          <BookOpen className="w-3 h-3 shrink-0" />
                          {card.turma}
                        </span>
                      )}
                      
                      <span className="flex items-center gap-1 text-[11px] text-gray-500 font-medium">
                        <MapPin className="w-3 h-3 shrink-0" />
                        {card.unidade}
                      </span>
                    </div>
                  </div>
                  
                  <div className={`w-8 h-8 shrink-0 border-2 border-black rounded-lg flex items-center justify-center transition-colors ${corSeta}`}>
                    <ChevronRight className="w-4 h-4 text-black" />
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* PAGINAÇÃO */}
        <div className="mt-4 pt-4 border-t-[2px] border-black/10 flex flex-col sm:flex-row items-center justify-center">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setPaginaAtual(p => Math.max(1, p - 1))}
              disabled={paginaAtual === 1}
              className="p-2 rounded-xl bg-white border-2 border-black shadow-[2px_2px_0px_#000] hover:shadow-none hover:translate-y-[2px] hover:translate-x-[2px] disabled:opacity-30 disabled:hover:shadow-[2px_2px_0px_#000] disabled:hover:translate-y-0 disabled:hover:translate-x-0 transition-all"
            >
              <ChevronLeft className="w-4 h-4 text-black" strokeWidth={2.5} />
            </button>
            
            {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(num => (
              <button
                key={num}
                onClick={() => setPaginaAtual(num)}
                className={`w-8 h-8 flex items-center justify-center rounded-xl text-[12px] font-black border-2 border-black transition-all
                  ${paginaAtual === num 
                    ? "bg-pensi-yellow text-black shadow-[2px_2px_0px_#000] -translate-y-0.5" 
                    : "bg-white text-black shadow-[2px_2px_0px_#000] hover:shadow-none hover:translate-y-[2px] hover:translate-x-[2px]"}
                `}
              >
                {num}
              </button>
            ))}

            <button 
              onClick={() => setPaginaAtual(p => Math.min(totalPaginas, p + 1))}
              disabled={paginaAtual === totalPaginas}
              className="p-2 rounded-xl bg-white border-2 border-black shadow-[2px_2px_0px_#000] hover:shadow-none hover:translate-y-[2px] hover:translate-x-[2px] disabled:opacity-30 disabled:hover:shadow-[2px_2px_0px_#000] disabled:hover:translate-y-0 disabled:hover:translate-x-0 transition-all"
            >
              <ChevronRight className="w-4 h-4 text-black" strokeWidth={2.5} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}