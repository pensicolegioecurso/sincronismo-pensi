import { useState, useRef, useEffect } from "react";
import {
  MessageSquare,
  Filter,
  ChevronDown,
  Download,
  FileSpreadsheet,
  FileText,
  CheckCircle2,
  Send,
  Search,
  Clock,
  MapPin,
  BookOpen,
  X,
  RotateCcw,
  User,
} from "lucide-react";

const FEED_POSTS = [
  {
    id: 1,
    tipo: "aula",
    disciplina: "Matemática",
    turma: "9º Ano A",
    unidade: "Icaraí 1",
    tempo: "Há 2 horas",
    status: "Concluído",
    conteudo:
      "Aula sobre equações do 2º grau concluída com sucesso. Turma participativa.",
    comentarios: [{ autor: "Coordenação", texto: "Ótimo registro, parabéns!" }],
  },
  {
    id: 2,
    tipo: "justificativa",
    disciplina: "Física",
    turma: "2ª Série B",
    unidade: "Flamengo",
    tempo: "Ontem",
    status: "Aprovada",
    conteudo: "Justificativa de ausência referente à aula de revisão.",
    comentarios: [],
  },
  {
    id: 3,
    tipo: "aula",
    disciplina: "Matemática",
    turma: "1ª Série A",
    unidade: "Icaraí 1",
    tempo: "Ontem",
    status: "Concluído",
    conteudo: "Aula de revisão de geometria plana. Todos participaram ativamente.",
    comentarios: [],
  },
];

const UNIDADES = ["Todas", "Icaraí 1", "Flamengo"];
const TURMAS = ["Todas", "9º Ano A", "1ª Série A", "2ª Série B"];
const TEMPOS_LIST = [
  { id: "geral", label: "Geral" },
  { id: "hoje", label: "Hoje" },
  { id: "mes", label: "Mês" },
  { id: "ano", label: "Ano" },
];

export default function FeedTab({ user, unidadeFoco }) {
  const [busca, setBusca] = useState("");
  const [filtroTipoFeed, setFiltroTipoFeed] = useState("tudo");
  const [filtroUnidade, setFiltroUnidade] = useState("Todas");
  const [filtroTurma, setFiltroTurma] = useState("Todas");
  const [filtroTempo, setFiltroTempo] = useState("geral");
  
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [comentariosAbertos, setComentariosAbertos] = useState({});

  const filterRef = useRef(null);
  const exportRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (filterRef.current && !filterRef.current.contains(event.target))
        setIsFilterOpen(false);
      if (exportRef.current && !exportRef.current.contains(event.target))
        setIsExportOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const postsFiltrados = FEED_POSTS.filter((post) => {
    if (unidadeFoco && post.unidade !== unidadeFoco) return false;
    if (filtroTipoFeed === "aula" && post.tipo !== "aula") return false;
    if (filtroTipoFeed === "justificativa" && post.tipo !== "justificativa") return false;
    
    if (filtroUnidade !== "Todas" && post.unidade !== filtroUnidade) return false;
    if (filtroTurma !== "Todas" && post.turma !== filtroTurma) return false;
    
    if (busca) {
      const termo = busca.toLowerCase();
      if (!post.disciplina.toLowerCase().includes(termo) && !post.turma.toLowerCase().includes(termo)) {
        return false;
      }
    }
    return true;
  });

  const getPostStyle = (post) => {
    if (post.tipo === "justificativa") {
      return {
        badge: "bg-pink-300 text-black",
        iconColor: "text-pink-500",
        icon: MessageSquare,
        label: "Justificativa",
      };
    }
    return {
      badge: "bg-green-300 text-black",
      iconColor: "text-green-600",
      icon: CheckCircle2,
      label: post.status,
    };
  };

  const limparFiltros = () => {
    setBusca("");
    setFiltroTipoFeed("tudo");
    setFiltroUnidade("Todas");
    setFiltroTurma("Todas");
    setFiltroTempo("geral");
  };

  const toggleComentarios = (id) =>
    setComentariosAbertos((prev) => ({ ...prev, [id]: !prev[id] }));

  const temFiltrosAtivos = 
    busca !== "" || 
    filtroTipoFeed !== "tudo" || 
    filtroUnidade !== "Todas" || 
    filtroTurma !== "Todas" || 
    filtroTempo !== "geral";

  const filtroLabel =
    filtroTipoFeed === "tudo"
      ? "Filtros"
      : filtroTipoFeed === "aula"
      ? "Aulas"
      : "Justificativas";

  return (
    <div className="w-full min-w-0 pb-10 animate-fade-in">
      <div className="max-w-4xl mx-auto px-1">
        {/* CABEÇALHO */}
        <section className="mb-5">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-1.5 h-1.5 bg-pensi-yellow border border-black rounded-full" />
                <span className="text-[10px] font-black uppercase tracking-[0.22em] text-gray-500">
                  Minha atividade
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-black text-black tracking-tight leading-none">
                Feed
                <span className="text-pensi-yellow">.</span>
              </h1>

              <p className="text-sm text-gray-500 mt-2 max-w-xl leading-relaxed">
                {unidadeFoco
                  ? `Acompanhe as atividades registradas na unidade ${unidadeFoco}.`
                  : "Acompanhe os registros de aulas e justificativas enviados pelos professores."}
              </p>
            </div>

            {/* BOTÃO EXPORTAR MAIOR */}
            <div className="flex items-center gap-2 self-start lg:self-auto">
              <div className="relative" ref={exportRef}>
                <button
                  onClick={() => setIsExportOpen(!isExportOpen)}
                  className="flex items-center justify-center gap-2.5 px-6 py-3.5 bg-pensi-yellow text-black border-2 border-black rounded-xl text-xs font-black uppercase tracking-wider shadow-[3px_3px_0px_#000] hover:bg-yellow-300 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all h-full"
                >
                  <Download className="w-5 h-5" />
                  Exportar
                </button>

                {isExportOpen && (
                  <div className="absolute top-full mt-2 right-0 w-48 bg-white border-2 border-black rounded-xl shadow-[3px_3px_0px_#000] z-50 overflow-hidden">
                    <button
                      onClick={() => {
                        console.log("Exportando PDF");
                        setIsExportOpen(false);
                      }}
                      className="w-full text-left px-3 py-2.5 text-[11px] font-bold flex items-center gap-2 hover:bg-pensi-yellow/40 border-b-2 border-black/10 transition-colors"
                    >
                      <FileText size={15} />
                      Exportar como PDF
                    </button>
                    <button
                      onClick={() => {
                        console.log("Exportando Excel");
                        setIsExportOpen(false);
                      }}
                      className="w-full text-left px-3 py-2.5 text-[11px] font-bold flex items-center gap-2 hover:bg-pensi-yellow/40 transition-colors"
                    >
                      <FileSpreadsheet size={15} />
                      Exportar como Excel
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* BARRA DE FERRAMENTAS / FILTROS */}
        <div className="bg-white border-2 border-black rounded-xl shadow-[3px_3px_0px_#000] p-3 mb-4">
          <div className="flex flex-col xl:flex-row gap-2.5 items-stretch xl:items-center justify-between">
            
            <div className="flex flex-col sm:flex-row gap-2.5 flex-1 items-stretch sm:items-center">
              {/* BUSCA REDUZIDA */}
              <div className="relative w-full sm:max-w-[200px]">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar..."
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

              {/* FILTRO TIPO */}
              <div className="relative" ref={filterRef}>
                <button
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className={`flex items-center justify-center gap-1.5 px-3 h-[38px] border-2 border-black rounded-xl text-[11px] font-black uppercase tracking-wider shadow-[2px_2px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all whitespace-nowrap ${
                    filtroTipoFeed !== "tudo" ? "bg-pensi-yellow" : "bg-gray-50"
                  }`}
                >
                  <Filter className="w-4 h-4" />
                  <span className="hidden sm:inline">{filtroLabel}</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform ${
                      isFilterOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isFilterOpen && (
                  <div className="absolute top-full mt-2 right-0 w-48 bg-white border-2 border-black rounded-xl shadow-[3px_3px_0px_#000] z-50 overflow-hidden">
                    {[
                      { id: "tudo", label: "Tudo" },
                      { id: "aula", label: "Aulas" },
                      { id: "justificativa", label: "Justificativas" },
                    ].map((tipo) => (
                      <button
                        key={tipo.id}
                        onClick={() => {
                          setFiltroTipoFeed(tipo.id);
                          setIsFilterOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-[11px] font-black uppercase tracking-wider flex items-center justify-between border-b-2 border-black/10 last:border-0 transition-colors ${
                          filtroTipoFeed === tipo.id
                            ? "bg-pensi-yellow"
                            : "hover:bg-gray-100"
                        }`}
                      >
                        <span>{tipo.label}</span>
                        {filtroTipoFeed === tipo.id && (
                          <CheckCircle2 size={15} />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* FILTRO UNIDADE */}
              <div className="flex items-center gap-1.5 h-[38px] bg-gray-50 border-2 border-black rounded-xl px-2.5 shadow-[2px_2px_0px_#000] shrink-0">
                <MapPin className="w-4 h-4 text-black shrink-0" />
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

              {/* FILTRO TURMA */}
              <div className="flex items-center gap-1.5 h-[38px] bg-gray-50 border-2 border-black rounded-xl px-2.5 shadow-[2px_2px_0px_#000] shrink-0">
                <User className="w-4 h-4 text-black shrink-0" />
                <select
                  value={filtroTurma}
                  onChange={(e) => setFiltroTurma(e.target.value)}
                  className="bg-transparent text-[11px] font-black uppercase tracking-wider text-black focus:outline-none cursor-pointer h-full"
                >
                  {TURMAS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* FILTRO DE TEMPO (BOLINHAS) */}
            <div className="flex items-center gap-3 h-[38px] bg-gray-50 border-2 border-black rounded-xl px-3 shadow-[2px_2px_0px_#000] shrink-0">
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
          </div>

          {/* CONTADORES DA LISTA */}
          <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-3 border-t-2 border-dashed border-gray-200">
            <div className="flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                Exibindo
              </span>
              <span className="bg-pensi-yellow border border-black rounded-lg px-2 py-0.5 text-[10px] font-black text-black">
                {postsFiltrados.length}
              </span>
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                de {FEED_POSTS.length}
              </span>

              {filtroTipoFeed !== "tudo" && (
                <span className="bg-gray-100 border border-black rounded-lg px-2 py-0.5 text-[10px] font-black text-black uppercase tracking-wider">
                  {filtroLabel}
                </span>
              )}

              {unidadeFoco && (
                <span className="bg-gray-100 border border-black rounded-lg px-2 py-0.5 text-[10px] font-black text-black uppercase tracking-wider flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {unidadeFoco}
                </span>
              )}
            </div>

            {temFiltrosAtivos && (
              <button
                onClick={limparFiltros}
                className="text-[10px] font-black uppercase tracking-wider text-gray-500 hover:text-black underline underline-offset-2"
              >
                Remover filtros
              </button>
            )}
          </div>
        </div>

        {/* CABEÇALHO DA LISTAGEM */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
          <div>
            <h2 className="text-sm font-black uppercase tracking-wider text-black">
              Atividades recentes
            </h2>
            <p className="text-[11px] text-gray-500 mt-0.5">
              Consulte os registros e acompanhe os comentários.
            </p>
          </div>
          <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">
            Lista de registros
          </span>
        </div>

        {/* LISTA */}
        <div className="space-y-2.5">
          {postsFiltrados.length === 0 && (
            <div className="bg-white border-2 border-black border-dashed rounded-xl p-8 text-center shadow-[2px_2px_0px_#000]">
              <div className="w-12 h-12 bg-gray-100 border-2 border-black rounded-xl flex items-center justify-center mx-auto mb-3">
                <Search className="w-6 h-6 text-gray-400" />
              </div>
              <h3 className="text-sm font-black uppercase text-black">
                Nenhuma atividade encontrada
              </h3>
              <p className="text-[11px] text-gray-500 mt-1.5">
                Não encontramos resultados com os filtros selecionados.
              </p>
              <button
                onClick={limparFiltros}
                className="mt-4 inline-flex items-center gap-1.5 bg-pensi-yellow border-2 border-black rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-wider shadow-[2px_2px_0px_#000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Limpar pesquisa
              </button>
            </div>
          )}

          {postsFiltrados.map((post) => {
            const style = getPostStyle(post);
            const StatusIcon = style.icon;
            const aberto = comentariosAbertos[post.id];

            return (
              <article
                key={post.id}
                className="bg-white border-2 border-black rounded-xl shadow-[2px_2px_0px_#000] overflow-hidden"
              >
                <div className="flex flex-col md:flex-row relative">
                  {/* CONTEÚDO DO POST */}
                  <div className="flex-1 min-w-0 p-4">
                    {/* REMOVIDO O AVATAR, AGORA COMEÇA DIRETO NO TEXTO */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-black text-black">
                          {user?.nome?.split(" ")[0] || "Professor"}
                        </h3>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:flex-wrap gap-x-4 gap-y-1 mt-1.5">
                        <span className="flex items-center gap-1.5 text-[11px] text-gray-500 font-medium">
                          <BookOpen className="w-3 h-3 shrink-0" />
                          {post.disciplina} • {post.turma}
                        </span>
                        <span className="flex items-center gap-1.5 text-[11px] text-gray-500 font-medium">
                          <Clock className="w-3 h-3 shrink-0" />
                          {post.tempo}
                        </span>
                        <span className="flex items-center gap-1.5 text-[11px] text-gray-500 font-medium">
                          <MapPin className="w-3 h-3 shrink-0" />
                          {post.unidade}
                        </span>
                      </div>
                    </div>

                    {/* CONTEÚDO (ÍCONE SOLTO E COLORIDO) */}
                    <div className="mt-3 pt-3 border-t border-dashed border-gray-200">
                      <div className="flex items-center gap-1.5 mb-2">
                        <StatusIcon className={`w-4 h-4 ${style.iconColor}`} strokeWidth={2.5} />
                        <span className="text-[9px] font-black uppercase tracking-wider text-gray-400">
                          {post.tipo === "aula"
                            ? "Check de aula"
                            : "Registro de justificativa"}
                        </span>
                      </div>
                      <p className="text-xs text-gray-900 leading-relaxed font-medium">
                        {post.conteudo}
                      </p>
                    </div>
                  </div>

                  {/* AÇÕES */}
                  <div className="md:w-[160px] shrink-0 bg-gray-50 border-t-2 md:border-t-0 md:border-l-2 border-black p-3 flex md:flex-col justify-between gap-2">
                    <div className="hidden md:block">
                      <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">
                        Comentários
                      </span>
                    </div>
                    <div className="flex items-center gap-2 md:flex-col md:items-stretch">
                      <button
                        onClick={() => toggleComentarios(post.id)}
                        className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 border-2 border-black rounded-lg text-[10px] font-black uppercase tracking-wider shadow-[2px_2px_0px_#000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all ${
                          aberto ? "bg-pensi-yellow" : "bg-white"
                        }`}
                        aria-expanded={aberto}
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>{post.comentarios.length}</span>
                        <ChevronDown
                          className={`w-3.5 h-3.5 transition-transform ${
                            aberto ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>

                {/* COMENTÁRIOS — COLAPSÁVEIS */}
                {aberto && (
                  <div className="border-t-2 border-black bg-gray-50 p-3 animate-fade-in">
                    {post.comentarios.length === 0 && (
                      <p className="text-[11px] text-gray-400 italic mb-3">
                        Nenhum comentário ainda.
                      </p>
                    )}

                    {post.comentarios.map((c, idx) => (
                      <div
                        key={idx}
                        className="bg-white p-3 mb-2 border-2 border-black rounded-xl shadow-[2px_2px_0px_#000]"
                      >
                        <span className="text-[9px] font-black text-black block uppercase tracking-wider mb-1">
                          {c.autor}
                        </span>
                        <span className="text-xs text-gray-800 font-medium">
                          {c.texto}
                        </span>
                      </div>
                    ))}

                    <div className="flex items-center gap-2 mt-3">
                      <div className="relative flex-1">
                        <User className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          placeholder="Escreva um comentário..."
                          className="w-full bg-white border-2 border-black rounded-xl pl-9 pr-3 py-2.5 text-xs font-medium focus:outline-none focus:bg-pensi-yellow/20 placeholder:text-gray-400 transition-colors shadow-[2px_2px_0px_#000]"
                        />
                      </div>
                      <button
                        className="w-9 h-9 bg-pensi-yellow border-2 border-black rounded-xl shadow-[2px_2px_0px_#000] flex items-center justify-center hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all shrink-0"
                        aria-label="Enviar comentário"
                      >
                        <Send size={15} className="text-black" />
                      </button>
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}