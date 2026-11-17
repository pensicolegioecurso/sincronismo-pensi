// src/components/dashboard/FeedTab.jsx
import { useState, useEffect, useRef, useMemo } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../services/firebase";
import { DISCIPLINAS_POR_ANO } from "../../data/disciplinas";
import { parseTurmasPorUnidade, chaveTurma } from "../../utils/turmas";
import FeedHeader from "./feed/FeedHeader";
import FeedFilters from "./feed/FeedFilters";
import FeedList from "./feed/FeedList";
import FeedPagination from "./feed/FeedPagination";

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
        if (isAdminOrNucleo || isRegional) q = query(collection(db, "checks"));
        else if (isDirecao) {
          const unidadeDaDirecao = unidadeFoco || user.unidade?.split(",")[0]?.trim();
          q = query(collection(db, "checks"), where("unidade", "==", unidadeDaDirecao));
        } else q = query(collection(db, "checks"), where("professorUid", "==", user.uid));

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
    const agora = new Date(); agora.setHours(0, 0, 0, 0);
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

  const toggleComentarios = (id) => setComentariosAbertos((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <div className="w-full min-w-0 pb-10 animate-fade-in">
      <div className="max-w-4xl mx-auto px-1">
        <FeedHeader
          user={user}
          isAdminOrNucleo={isAdminOrNucleo}
          isRegional={isRegional}
          isDirecao={isDirecao}
          isProfessor={isProfessor}
          unidadesEscopo={unidadesEscopo}
          unidadeFoco={unidadeFoco}
          isExportOpen={isExportOpen}
          setIsExportOpen={setIsExportOpen}
          exportRef={exportRef}
        />
        <FeedFilters
          busca={busca} setBusca={setBusca}
          filtroTipoFeed={filtroTipoFeed} setFiltroTipoFeed={setFiltroTipoFeed}
          filtroTempo={filtroTempo} setFiltroTempo={setFiltroTempo}
          isFilterOpen={isFilterOpen} setIsFilterOpen={setIsFilterOpen}
          filterRef={filterRef}
          carregando={carregando}
          totalExibindo={postsPaginados.length}
          totalGeral={feedPosts.length}
        />
        <FeedList
          carregando={carregando}
          posts={postsPaginados}
          comentariosAbertos={comentariosAbertos}
          toggleComentarios={toggleComentarios}
        />
        {totalPaginas > 1 && (
          <FeedPagination
            paginaAtual={paginaAtual}
            setPaginaAtual={setPaginaAtual}
            totalPaginas={totalPaginas}
          />
        )}
      </div>
    </div>
  );
}