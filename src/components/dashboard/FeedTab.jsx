import { useState, useEffect, useRef, useMemo } from "react";
import {
  MessageSquare, Filter, ChevronDown, Download, FileSpreadsheet,
  FileText, CheckCircle2, Send, Search, Clock, MapPin, BookOpen,
  X, RotateCcw, User, AlertCircle, ChevronLeft, ChevronRight, CalendarDays
} from "lucide-react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../services/firebase";
import { DISCIPLINAS_POR_ANO } from "../../data/disciplinas";
import { parseTurmasPorUnidade, chaveTurma } from "../../utils/turmas";

const TEMPOS_LIST = [
  { id: "geral", label: "Geral" },
  { id: "hoje", label: "Hoje" },
  { id: "mes", label: "Mês" },
  { id: "ano", label: "Ano" },
];

const ITENS_POR_PAGINA = 50;

function formatarDataReal(dataStr) {
  if (!dataStr) return "";
  const partes = dataStr.split("-");
  if (partes.length === 3) return `${partes[2]}/${partes[1]}/${partes[0]}`;
  return dataStr;
}

function capitalizarDia(dia) {
  if (!dia) return "";
  return dia.charAt(0).toUpperCase() + dia.slice(1).toLowerCase();
}

export default function FeedTab({ user, unidadeFoco, unidadesEscopo }) {
  const [feedPosts, setFeedPosts] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState("");
  const [filtroTipoFeed, setFiltroTipoFeed] = useState("tudo");
  const [filtroTempo, setFiltroTempo] = useState("geral");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [comentariosAbertos, setComentariosAbertos] = useState({});
  const [paginaAtual, setPaginaAtual] = useState(1);

  const filterRef = useRef(null);
  const exportRef = useRef(null);

  const isAdminOrNucleo = user?.cargos?.some(c => ["admin", "nucleo"].includes(c));
  const isRegional = user?.cargos?.includes("regional");
  const isDirecao = user?.cargos?.some(c => ["diretor", "direcao", "coordenador"].includes(c)) || !!unidadeFoco;
  const isProfessor = !isAdminOrNucleo && !isDirecao && !isRegional;

  // [NOVO] mapa de turmas ativas do professor (só faz sentido se isProfessor)
  const turmasAtivasDoProfessor = useMemo(() => {
    if (!isProfessor || !user) return null;
    const mapa = parseTurmasPorUnidade(user.turmas || "");
    const inativasU = new Set(user.unidadesInativas || []);
    const inativasT = new Set(user.turmasInativas || []);
    const resultado = {};
    Object.entries(mapa).forEach(([uni, turmas]) => {
      if (inativasU.has(uni)) return;
      const ativas = turmas.filter((t) => !inativasT.has(chaveTurma(uni, t)));
      if (ativas.length > 0) resultado[uni] = ativas;
    });
    return resultado;
  }, [user, isProfessor]);

  useEffect(() => {
    if (!user?.uid) return;

    async function buscarFeed() {
      setCarregando(true);
      try {
        let q;

        if (isAdminOrNucleo || isRegional) {
          q = query(collection(db, "checks"));
        } else if (isDirecao) {
          const unidadeDaDirecao = unidadeFoco || user.unidade?.split(",")[0]?.trim();
          q = query(collection(db, "checks"), where("unidade", "==", unidadeDaDirecao));
        } else {
          q = query(collection(db, "checks"), where("professorUid", "==", user.uid));
        }

        const snap = await getDocs(q);
        const posts = [];

        const nomesCache = {};
        if (isAdminOrNucleo || isDirecao || isRegional) {
          const usersSnap = await getDocs(collection(db, "users"));
          usersSnap.forEach(u => { nomesCache[u.id] = u.data().nome || "Professor"; });
        }

        snap.forEach((doc) => {
          const data = doc.data();
          const dataHora = new Date(data.dataHora);
          const dataHoraFormatada = dataHora.toLocaleDateString('pt-BR');
          const horaFormatada = dataHora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
          const dataReferenciaFormatada = formatarDataReal(data.dataReal);
          const nomeDisc = DISCIPLINAS_POR_ANO["2026"]?.[data.disciplina]?.nome || data.disciplina;
          const unidade = data.unidade || "Sem unidade";

          if (isRegional && unidadesEscopo && !unidadesEscopo.includes(unidade)) return;

          // [NOVO] professor só vê checks de turmas/unidades que ainda estão ativas pra ele
          if (isProfessor && turmasAtivasDoProfessor) {
            const turmasDaUnidade = turmasAtivasDoProfessor[unidade] || [];
            if (turmasDaUnidade.length === 0) return;
            if (data.serie && !turmasDaUnidade.includes(data.serie)) return;
          }

          const nomeProf = isProfessor
            ? (user.nome?.split(" ")[0] || "Eu")
            : (nomesCache[data.professorUid]?.split(" ")[0] || "Professor");

          posts.push({
            id: doc.id,
            tipo: data.tipo,
            professor: nomeProf,
            disciplina: nomeDisc,
            turma: data.serie,
            unidade,
            diaSemana: capitalizarDia(data.diaNome),
            dataReferencia: dataReferenciaFormatada,
            aula: data.aulaIndex,
            status: data.status,
            justificativa: data.justificativa,
            observacao: data.observacao,
            dataHoraObj: dataHora,
            dataHoraFormatada,
            horaFormatada,
            comentarios: []
          });
        });

        posts.sort((a, b) => b.dataHoraObj - a.dataHoraObj);
        setFeedPosts(posts);
      } catch (err) {
        console.error("Erro ao buscar feed:", err);
      } finally {
        setCarregando(false);
      }
    }

    buscarFeed();
  }, [user?.uid, unidadeFoco, isAdminOrNucleo, isDirecao, isProfessor, isRegional, unidadesEscopo, turmasAtivasDoProfessor]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (filterRef.current && !filterRef.current.contains(event.target)) setIsFilterOpen(false);
      if (exportRef.current && !exportRef.current.contains(event.target)) setIsExportOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const postsFiltrados = useMemo(() => {
    const agora = new Date();
    agora.setHours(0, 0, 0, 0);
    const inicioMes = new Date(agora.getFullYear(), agora.getMonth(), 1);
    const inicioAno = new Date(agora.getFullYear(), 0, 1);

    return feedPosts.filter((post) => {
      if (filtroTipoFeed === "aula" && post.tipo !== "aula") return false;
      if (filtroTipoFeed === "justificativa" && post.tipo !== "justificativa") return false;

      const dataPost = post.dataHoraObj;
      if (filtroTempo === "hoje" && dataPost < agora) return false;
      if (filtroTempo === "mes" && dataPost < inicioMes) return false;
      if (filtroTempo === "ano" && dataPost < inicioAno) return false;

      if (busca) {
        const termo = busca.toLowerCase();
        if (!post.disciplina.toLowerCase().includes(termo) &&
            !post.turma?.toLowerCase().includes(termo) &&
            !post.unidade.toLowerCase().includes(termo) &&
            !post.professor.toLowerCase().includes(termo)) return false;
      }

      return true;
    });
  }, [feedPosts, filtroTipoFeed, filtroTempo, busca]);

  const totalPaginas = Math.max(1, Math.ceil(postsFiltrados.length / ITENS_POR_PAGINA));
  const postsPaginados = useMemo(() => {
    const inicio = (paginaAtual - 1) * ITENS_POR_PAGINA;
    return postsFiltrados.slice(inicio, inicio + ITENS_POR_PAGINA);
  }, [postsFiltrados, paginaAtual]);

  useEffect(() => { setPaginaAtual(1); }, [busca, filtroTipoFeed, filtroTempo]);

  const getPostStyle = (post) => {
    if (post.tipo === "justificativa") {
      return { iconColor: "text-pink-500", icon: MessageSquare, label: "Justificativa registrada" };
    }
    return { iconColor: "text-green-600", icon: CheckCircle2, label: "Check de aula" };
  };

  const limparFiltros = () => { setBusca(""); setFiltroTipoFeed("tudo"); setFiltroTempo("geral"); };
  const toggleComentarios = (id) => setComentariosAbertos((prev) => ({ ...prev, [id]: !prev[id] }));

  const temFiltrosAtivos = busca !== "" || filtroTipoFeed !== "tudo" || filtroTempo !== "geral";
  const filtroLabel = filtroTipoFeed === "tudo" ? "Filtros" : filtroTipoFeed === "aula" ? "Aulas" : "Justificativas";

  const headerTitle = isAdminOrNucleo ? "Feed Global" : isRegional ? "Feed Regional" : isDirecao ? "Feed da Unidade" : "Minha Atividade";
  const headerSubtitle = isAdminOrNucleo
    ? "Acompanhe todos os registros de aulas e justificativas da plataforma."
    : isRegional
    ? `Acompanhe os registros das unidades: ${(unidadesEscopo || []).join(", ")}.`
    : isDirecao
    ? `Acompanhe os registros da unidade ${unidadeFoco || user?.unidade?.split(",")[0]}.`
    : "Acompanhe os seus registros de aulas e justificativas enviados.";

  return (
    <div className="w-full min-w-0 pb-10 animate-fade-in">
      <div className="max-w-4xl mx-auto px-1">

        <section className="mb-5">
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

        <div className="bg-white border-2 border-black rounded-xl shadow-[3px_3px_0px_#000] p-3 mb-4">
          <div className="flex flex-col xl:flex-row gap-2.5 items-stretch xl:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-2.5 flex-1 items-stretch sm:items-center">
              <div className="relative w-full sm:max-w-[250px]">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input type="text" placeholder="Buscar matéria, turma, prof..." value={busca} onChange={(e) => setBusca(e.target.value)}
                  className="w-full h-[38px] bg-gray-50 border-2 border-black rounded-xl pl-9 pr-8 text-sm font-medium text-black outline-none placeholder:text-gray-400 focus:bg-pensi-yellow/20 transition-colors shadow-[2px_2px_0px_#000]" />
                {busca && (
                  <button onClick={() => setBusca("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="relative" ref={filterRef}>
                <button onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className={`flex items-center justify-center gap-1.5 px-3 h-[38px] border-2 border-black rounded-xl text-[11px] font-black uppercase tracking-wider shadow-[2px_2px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all whitespace-nowrap ${filtroTipoFeed !== "tudo" ? "bg-pensi-yellow" : "bg-gray-50"}`}>
                  <Filter className="w-4 h-4" />
                  <span className="hidden sm:inline">{filtroLabel}</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isFilterOpen ? "rotate-180" : ""}`} />
                </button>
                {isFilterOpen && (
                  <div className="absolute top-full mt-2 right-0 w-48 bg-white border-2 border-black rounded-xl shadow-[3px_3px_0px_#000] z-50 overflow-hidden">
                    {[
                      { id: "tudo", label: "Tudo" },
                      { id: "aula", label: "Aulas" },
                      { id: "justificativa", label: "Justificativas" },
                    ].map((tipo) => (
                      <button key={tipo.id} onClick={() => { setFiltroTipoFeed(tipo.id); setIsFilterOpen(false); }}
                        className={`w-full text-left px-3 py-2 text-[11px] font-black uppercase tracking-wider flex items-center justify-between border-b-2 border-black/10 last:border-0 transition-colors ${filtroTipoFeed === tipo.id ? "bg-pensi-yellow" : "hover:bg-gray-100"}`}>
                        <span>{tipo.label}</span>
                        {filtroTipoFeed === tipo.id && <CheckCircle2 size={15} />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 h-[38px] bg-gray-50 border-2 border-black rounded-xl px-3 shadow-[2px_2px_0px_#000] shrink-0">
              {TEMPOS_LIST.map((p) => {
                const ativo = filtroTempo === p.id;
                return (
                  <button key={p.id} onClick={() => setFiltroTempo(p.id)} className="flex items-center gap-1.5 group h-full" aria-pressed={ativo}>
                    <span className={`w-3 h-3 rounded-full border-2 border-black transition-all ${ativo ? "bg-pensi-yellow shadow-[1px_1px_0px_#000] scale-110" : "bg-white group-hover:bg-pensi-yellow/30"}`} />
                    <span className={`text-[10px] font-black uppercase tracking-wider ${ativo ? "text-black" : "text-gray-400"}`}>{p.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-3 border-t-2 border-dashed border-gray-200">
            <div className="flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Exibindo</span>
              <span className="bg-pensi-yellow border border-black rounded-lg px-2 py-0.5 text-[10px] font-black text-black">{carregando ? "..." : postsPaginados.length}</span>
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">de {feedPosts.length}</span>
            </div>
            {temFiltrosAtivos && (
              <button onClick={limparFiltros} className="text-[10px] font-black uppercase tracking-wider text-gray-500 hover:text-black underline underline-offset-2">
                Remover filtros
              </button>
            )}
          </div>
        </div>

        <div className="space-y-2.5">
          {carregando && (
            <div className="py-12 text-center text-gray-400 font-bold flex flex-col items-center">
              <span className="w-6 h-6 border-2 border-gray-300 border-t-black rounded-full animate-spin mb-3" />
              Carregando o feed...
            </div>
          )}

          {!carregando && postsPaginados.length === 0 && (
            <div className="bg-white border-2 border-black border-dashed rounded-xl p-8 text-center shadow-[2px_2px_0px_#000]">
              <div className="w-12 h-12 bg-gray-100 border-2 border-black rounded-xl flex items-center justify-center mx-auto mb-3">
                <AlertCircle className="w-6 h-6 text-gray-400" />
              </div>
              <h3 className="text-sm font-black uppercase text-black">Nenhuma atividade encontrada</h3>
              <p className="text-[11px] text-gray-500 mt-1.5">Não há registros para exibir com esses filtros.</p>
            </div>
          )}

          {!carregando && postsPaginados.map((post) => {
            const style = getPostStyle(post);
            const StatusIcon = style.icon;
            const aberto = comentariosAbertos[post.id];
            return (
              <article key={post.id} className="bg-white border-2 border-black rounded-xl shadow-[2px_2px_0px_#000] overflow-hidden">
                <div className="flex flex-col md:flex-row relative">
                  <div className="flex-1 min-w-0 p-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-black text-black">{post.professor}</h3>
                        <span className="text-[10px] bg-gray-100 border border-black rounded px-1.5 font-bold uppercase tracking-wider text-gray-600">{post.aula}</span>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:flex-wrap gap-x-4 gap-y-1 mt-2">
                        <span className="flex items-center gap-1.5 text-[11px] text-gray-700 font-bold">
                          <BookOpen className="w-3.5 h-3.5 shrink-0" /> {post.disciplina} • {post.turma}
                        </span>
                        <span className="flex items-center gap-1.5 text-[11px] text-gray-500 font-medium">
                          <MapPin className="w-3.5 h-3.5 shrink-0" /> {post.unidade}
                        </span>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:flex-wrap gap-x-4 gap-y-1 mt-1.5">
                        <span className="flex items-center gap-1.5 text-[11px] text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                          <CalendarDays className="w-3.5 h-3.5 shrink-0" /> Aula de {post.diaSemana}, {post.dataReferencia}
                        </span>
                        <span className="flex items-center gap-1.5 text-[11px] text-gray-400 font-medium">
                          <Clock className="w-3.5 h-3.5 shrink-0" /> Registrado em {post.dataHoraFormatada} às {post.horaFormatada}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-dashed border-gray-200">
                      <div className="flex items-center gap-1.5 mb-2">
                        <StatusIcon className={`w-4 h-4 ${style.iconColor}`} strokeWidth={2.5} />
                        <span className="text-[9px] font-black uppercase tracking-wider text-gray-400">{style.label}</span>
                      </div>
                      {post.tipo === "justificativa" && post.justificativa && (
                        <div className="bg-pink-50 border border-pink-200 rounded p-2 mb-2">
                          <p className="text-[10px] font-bold text-pink-700 uppercase tracking-wider mb-0.5">Motivo:</p>
                          <p className="text-xs text-gray-800 font-medium">{post.justificativa}</p>
                        </div>
                      )}
                      {post.tipo === "aula" && post.observacao && (
                        <div className="bg-gray-50 border border-gray-200 rounded p-2 mb-2">
                          <p className="text-[10px] font-bold text-gray-600 uppercase tracking-wider mb-0.5">Observação:</p>
                          <p className="text-xs text-gray-800 font-medium">{post.observacao}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="md:w-[160px] shrink-0 bg-gray-50 border-t-2 md:border-t-0 md:border-l-2 border-black p-3 flex md:flex-col justify-between gap-2">
                    <div className="hidden md:block">
                      <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Ações</span>
                    </div>
                    <div className="flex items-center gap-2 md:flex-col md:items-stretch">
                      <button onClick={() => toggleComentarios(post.id)}
                        className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 border-2 border-black rounded-lg text-[10px] font-black uppercase tracking-wider shadow-[2px_2px_0px_#000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all ${aberto ? "bg-pensi-yellow" : "bg-white"}`}
                        aria-expanded={aberto}>
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>0</span>
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${aberto ? "rotate-180" : ""}`} />
                      </button>
                    </div>
                  </div>
                </div>

                {aberto && (
                  <div className="border-t-2 border-black bg-gray-50 p-3 animate-fade-in">
                    <p className="text-[11px] text-gray-400 italic mb-3">Nenhum comentário ainda.</p>
                    <div className="flex items-center gap-2 mt-3">
                      <div className="relative flex-1">
                        <User className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input type="text" placeholder="Escreva um comentário..."
                          className="w-full bg-white border-2 border-black rounded-xl pl-9 pr-3 py-2.5 text-xs font-medium focus:outline-none focus:bg-pensi-yellow/20 placeholder:text-gray-400 transition-colors shadow-[2px_2px_0px_#000]" />
                      </div>
                      <button className="w-9 h-9 bg-pensi-yellow border-2 border-black rounded-xl shadow-[2px_2px_0px_#000] flex items-center justify-center hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all shrink-0" aria-label="Enviar comentário">
                        <Send size={15} className="text-black" />
                      </button>
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>

        {totalPaginas > 1 && (
          <div className="mt-6 flex items-center justify-center gap-2">
            <button onClick={() => setPaginaAtual((p) => Math.max(1, p - 1))} disabled={paginaAtual === 1}
              className="p-2 rounded-xl bg-white border-2 border-black shadow-[2px_2px_0px_#000] hover:shadow-none hover:translate-y-[2px] hover:translate-x-[2px] disabled:opacity-30 disabled:hover:shadow-[2px_2px_0px_#000] disabled:hover:translate-y-0 disabled:hover:translate-x-0 transition-all">
              <ChevronLeft className="w-4 h-4 text-black" strokeWidth={2.5} />
            </button>
            <span className="text-[11px] font-black uppercase tracking-wider text-gray-500">Página {paginaAtual} de {totalPaginas}</span>
            <button onClick={() => setPaginaAtual((p) => Math.min(totalPaginas, p + 1))} disabled={paginaAtual === totalPaginas}
              className="p-2 rounded-xl bg-white border-2 border-black shadow-[2px_2px_0px_#000] hover:shadow-none hover:translate-y-[2px] hover:translate-x-[2px] disabled:opacity-30 disabled:hover:shadow-[2px_2px_0px_#000] disabled:hover:translate-y-0 disabled:hover:translate-x-0 transition-all">
              <ChevronRight className="w-4 h-4 text-black" strokeWidth={2.5} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}