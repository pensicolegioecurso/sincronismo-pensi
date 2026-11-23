import { useState, useEffect, useRef, useMemo } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../services/firebase";
import { DISCIPLINAS_POR_ANO } from "../../data/disciplinas";
import FeedHeader from "./feed/FeedHeader";
import FeedFilters from "./feed/FeedFilters";
import FeedList from "./feed/FeedList";
import FeedPagination from "./feed/FeedPagination";

const ITENS_POR_PAGINA = 50;

function formatarDataReal(dataStr) {
  if (!dataStr) return "";
  const partes = String(dataStr).split("-");
  if (partes.length === 3) return `${partes[2]}/${partes[1]}/${partes[0]}`;
  return dataStr;
}

function capitalizarDia(dia) {
  if (!dia) return "";
  return String(dia).charAt(0).toUpperCase() + String(dia).slice(1).toLowerCase();
}

function normalizarTexto(valor) {
  return String(valor || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().replace(/\s+/g, " ").toLowerCase();
}

export default function FeedTab({ user, perfilAtivo, unidadeFoco, unidadesEscopo, onBack, onChat, onFamily }) {
  const [feedPosts, setFeedPosts] = useState([]);
  const [carregando, setCarregando] = useState(true);
  
  const [busca, setBusca] = useState("");
  const [filtroTipoFeed, setFiltroTipoFeed] = useState("tudo");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  
  const [filtroPeriodo, setFiltroPeriodo] = useState("mes");
  const [mesFiltro, setMesFiltro] = useState(() => new Date());
  const [dataInicioCustom, setDataInicioCustom] = useState("");
  const [dataFimCustom, setDataFimCustom] = useState("");
  
  const [filtroRegional, setFiltroRegional] = useState([]);
  const [filtroUnidade, setFiltroUnidade] = useState([]);
  const [regionaisDisponiveis, setRegionaisDisponiveis] = useState([]);

  const [comentariosAbertos, setComentariosAbertos] = useState({});
  const [paginaAtual, setPaginaAtual] = useState(1);

  const filterRef = useRef(null);
  const exportRef = useRef(null);

  const isAdminOrNucleo = ["admin", "nucleo"].includes(perfilAtivo);
  const isRegional = perfilAtivo === "regional";
  const isDirecao = ["diretor", "direcao", "coordenador"].includes(perfilAtivo);
  const isProfessor = perfilAtivo === "professor";

  const unidadesEscopoKey = JSON.stringify(unidadesEscopo || []);

  const unidadesPermitidas = useMemo(() => {
    let unidades = [];
    try {
      const escopo = JSON.parse(unidadesEscopoKey);
      if (Array.isArray(escopo)) {
        unidades = escopo.map((item) => typeof item === "string" ? item : (item?.nome || item?.unidade || item?.label || "")).filter(Boolean);
      }
    } catch { unidades = []; }

    if (isDirecao && unidades.length === 0) {
      const unidadeFallback = unidadeFoco || user?.unidade?.split(",")[0]?.trim();
      if (unidadeFallback) unidades.push(unidadeFallback);
    }
    return unidades;
  }, [unidadesEscopoKey, isDirecao, unidadeFoco, user?.unidade]);

  const unidadesPermitidasNormalizadas = useMemo(() => unidadesPermitidas.map(normalizarTexto), [unidadesPermitidas]);

  useEffect(() => {
    if (!isAdminOrNucleo) return;
    async function loadRegionais() {
      const snap = await getDocs(collection(db, "users"));
      const regs = [];
      snap.forEach(doc => {
        const data = doc.data();
        if ((data.cargos || []).some(c => normalizarTexto(c) === "regional")) {
          regs.push({ id: doc.id, nome: data.nome });
        }
      });
      setRegionaisDisponiveis(regs);
    }
    loadRegionais();
  }, [isAdminOrNucleo]);

  useEffect(() => {
    if (!user?.uid || !perfilAtivo) { setFeedPosts([]); setCarregando(false); return; }
    let cancelado = false;

    async function buscarFeed() {
      setCarregando(true);
      try {
        let consulta = isProfessor 
          ? query(collection(db, "checks"), where("professorUid", "==", user.uid))
          : query(collection(db, "checks"));
          
        const snap = await getDocs(consulta);
        if (cancelado) return;

        const nomesCache = {};
        if (!isProfessor) {
          const usersSnap = await getDocs(collection(db, "users"));
          if (cancelado) return;
          usersSnap.forEach((documento) => {
            const dadosUsuario = documento.data();
            nomesCache[documento.id] = dadosUsuario.nome || "Professor";
          });
        }

        const posts = [];
        snap.forEach((documento) => {
          const data = documento.data();
          if (isProfessor && data.professorUid !== user.uid) return;

          const unidade = data.unidade || "Sem unidade";
          const unidadeNormalizada = normalizarTexto(unidade);

          if ((isDirecao || isRegional) && (!unidadesPermitidasNormalizadas.includes(unidadeNormalizada))) return;

          const dataHora = data.dataHora ? new Date(data.dataHora) : data.dataReal ? new Date(`${data.dataReal}T12:00:00`) : new Date(0);
          const dataHoraValida = !Number.isNaN(dataHora.getTime());

          const nomeDisc = DISCIPLINAS_POR_ANO["2026"]?.[data.disciplina]?.nome || data.disciplina || "Disciplina";
          const nomeProf = isProfessor ? (user.nome?.split(" ")[0] || "Eu") : (nomesCache[data.professorUid]?.split(" ")[0] || data.professorEmail?.split("@")[0] || "Professor");

          posts.push({
            id: documento.id, tipo: data.tipo || "aula", professor: nomeProf, disciplina: nomeDisc, turma: data.serie || "",
            unidade, diaSemana: capitalizarDia(data.diaNome), dataReferencia: formatarDataReal(data.dataReal),
            aula: data.aulaIndex ? `Aula ${data.aulaIndex}` : "", status: data.status || "", justificativa: data.justificativa || "", observacao: data.observacao || "",
            dataHoraObj: dataHoraValida ? dataHora : new Date(0),
            dataRealString: data.dataReal || "",
            dataHoraFormatada: dataHoraValida ? dataHora.toLocaleDateString("pt-BR") : "",
            horaFormatada: dataHoraValida ? dataHora.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) : "",
          });
        });

        posts.sort((a, b) => b.dataHoraObj.getTime() - a.dataHoraObj.getTime());
        if (!cancelado) { setFeedPosts(posts); setPaginaAtual(1); }
      } catch (err) {
        console.error("Erro ao buscar feed:", err);
        if (!cancelado) setFeedPosts([]);
      } finally {
        if (!cancelado) setCarregando(false);
      }
    }
    buscarFeed();
    return () => { cancelado = true; };
  }, [user?.uid, user?.nome, user?.unidade, perfilAtivo, unidadeFoco, unidadesEscopoKey, isAdminOrNucleo, isDirecao, isProfessor, isRegional, unidadesPermitidasNormalizadas]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (filterRef.current && !filterRef.current.contains(event.target)) setIsFilterOpen(false);
      if (exportRef.current && !exportRef.current.contains(event.target)) setIsExportOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const postsFiltrados = useMemo(() => {
    const base = mesFiltro instanceof Date ? mesFiltro : new Date();
    const inicioMesFiltro = new Date(base.getFullYear(), base.getMonth(), 1);
    const fimMesFiltro = new Date(base.getFullYear(), base.getMonth() + 1, 0);
    const inicioMesString = inicioMesFiltro.toISOString().split("T")[0];
    const fimMesString = fimMesFiltro.toISOString().split("T")[0];

    return feedPosts.filter((post) => {
      if (filtroTipoFeed === "aula" && post.tipo !== "aula") return false;
      if (filtroTipoFeed === "justificativa" && post.tipo !== "justificativa") return false;

      const dataStr = post.dataRealString;
      if (filtroPeriodo === "mes" && (dataStr < inicioMesString || dataStr > fimMesString)) return false;
      if (filtroPeriodo === "anual" && !dataStr.startsWith(base.getFullYear().toString())) return false;
      if (filtroPeriodo === "custom") {
        const start = dataInicioCustom || "1970-01-01";
        const end = dataFimCustom || "2100-01-01";
        if (dataStr < start || dataStr > end) return false;
      }

      if (filtroUnidade.length > 0 && !filtroUnidade.some(u => normalizarTexto(u) === normalizarTexto(post.unidade))) return false;

      if (busca) {
        const termo = normalizarTexto(busca);
        if (!normalizarTexto(post.disciplina).includes(termo) &&
            !normalizarTexto(post.turma).includes(termo) &&
            !normalizarTexto(post.unidade).includes(termo) &&
            !normalizarTexto(post.professor).includes(termo)) return false;
      }
      return true;
    });
  }, [feedPosts, filtroTipoFeed, filtroPeriodo, mesFiltro, dataInicioCustom, dataFimCustom, busca, filtroUnidade, filtroRegional, isAdminOrNucleo]);

  const totalPaginas = Math.max(1, Math.ceil(postsFiltrados.length / ITENS_POR_PAGINA));
  const postsPaginados = useMemo(() => {
    const inicio = (paginaAtual - 1) * ITENS_POR_PAGINA;
    return postsFiltrados.slice(inicio, inicio + ITENS_POR_PAGINA);
  }, [postsFiltrados, paginaAtual]);

  useEffect(() => { setPaginaAtual(1); }, [busca, filtroTipoFeed, filtroPeriodo, mesFiltro, dataInicioCustom, dataFimCustom, filtroUnidade, filtroRegional]);

  const toggleComentarios = (id) => setComentariosAbertos((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <div className="w-full min-w-0 pb-10 animate-fade-in">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-6">
        
        <FeedHeader
          user={user} isAdminOrNucleo={isAdminOrNucleo} isRegional={isRegional} isDirecao={isDirecao} isProfessor={isProfessor}
          unidadesEscopo={unidadesEscopo} unidadeFoco={unidadeFoco} isExportOpen={isExportOpen} setIsExportOpen={setIsExportOpen}
          exportRef={exportRef} onBack={onBack} onChat={onChat} onFamily={onFamily}
          filtroPeriodo={filtroPeriodo} setFiltroPeriodo={setFiltroPeriodo}
          mesFiltro={mesFiltro} setMesFiltro={setMesFiltro}
          dataInicioCustom={dataInicioCustom} setDataInicioCustom={setDataInicioCustom}
          dataFimCustom={dataFimCustom} setDataFimCustom={setDataFimCustom}
        />

        <FeedFilters
          busca={busca} setBusca={setBusca}
          filtroTipoFeed={filtroTipoFeed} setFiltroTipoFeed={setFiltroTipoFeed}
          isFilterOpen={isFilterOpen} setIsFilterOpen={setIsFilterOpen} filterRef={filterRef}
          isAdminOrNucleo={isAdminOrNucleo} isRegional={isRegional} isProfessor={isProfessor}
          filtroRegional={filtroRegional} setFiltroRegional={setFiltroRegional}
          filtroUnidade={filtroUnidade} setFiltroUnidade={setFiltroUnidade}
          regionaisDisponiveis={regionaisDisponiveis}
          unidadesDisponiveis={unidadesPermitidas}
        />

        <div className="flex flex-wrap items-center justify-between gap-2 mb-4 px-1">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
            <span>Exibindo</span>
            <span className="bg-gray-100 border border-gray-200 rounded-lg px-2 py-0.5 text-black">{carregando ? "..." : postsPaginados.length}</span>
            <span>de {feedPosts.length}</span>
          </div>
        </div>

        <FeedList carregando={carregando} posts={postsPaginados} comentariosAbertos={comentariosAbertos} toggleComentarios={toggleComentarios} user={user} />

        {totalPaginas > 1 && (
          <FeedPagination paginaAtual={paginaAtual} setPaginaAtual={setPaginaAtual} totalPaginas={totalPaginas} />
        )}
      </div>
    </div>
  );
}