import { useState, useEffect, useRef, useMemo } from "react";
import { collection, query, where, getDocs, onSnapshot, doc, getDoc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { db } from "../../services/firebase";
import { useMaterias } from "../../hooks/useMaterias";
import FeedHeader from "./feed/FeedHeader";
import FeedList from "./feed/FeedList";
import FeedPagination from "./feed/FeedPagination";
import { ChatModal } from "../../features/chat/components/ChatModal";
import { useChatModal } from "../../features/chat/hooks/useChatModal";

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

export default function FeedTab({ user, perfilAtivo, unidadeFoco, unidadesEscopo, onBack, onChat, onFamily, onProfileOpen, onDirects }) {
  const { materias } = useMaterias();
  const materiasPorChave = useMemo(() => Object.fromEntries(materias.map((item) => [item.key, item.nome])), [materias]);
  const chat = useChatModal();
  const [feedPosts, setFeedPosts] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [contagemComentarios, setContagemComentarios] = useState({});
  const [perfis, setPerfis] = useState({});
  const [favoritos, setFavoritos] = useState([]);
  
  const [busca, setBusca] = useState("");
  const [filtroTipoFeed, setFiltroTipoFeed] = useState("tudo");
  const [filtroFavoritos, setFiltroFavoritos] = useState(false);
  
  const [filtroPeriodo, setFiltroPeriodo] = useState("mes");
  const [mesFiltro, setMesFiltro] = useState(() => new Date());
  const [dataInicioCustom, setDataInicioCustom] = useState("");
  const [dataFimCustom, setDataFimCustom] = useState("");
  
  const [filtroRegional, setFiltroRegional] = useState([]);
  const [filtroUnidade, setFiltroUnidade] = useState([]);
  const [regionaisDisponiveis, setRegionaisDisponiveis] = useState([]);
  
  const [comentariosAbertos, setComentariosAbertos] = useState({});
  const [paginaAtual, setPaginaAtual] = useState(1);

  const isAdminOrNucleo = ["admin", "nucleo"].includes(perfilAtivo);
  const isRegional = perfilAtivo === "regional";
  const isDirecao = ["diretor", "direcao", "coordenador"].includes(perfilAtivo);
  const isProfessor = perfilAtivo === "professor";

  const unidadesEscopoKey = JSON.stringify(unidadesEscopo || []);

  useEffect(() => {
    if (!user?.uid) return;
    let cancelado = false;
    getDoc(doc(db, "users", user.uid)).then((snapshot) => {
      if (!cancelado) setFavoritos(snapshot.exists() ? snapshot.data().favoritos || [] : []);
    }).catch((error) => console.error("Erro ao carregar favoritos:", error));
    return () => { cancelado = true; };
  }, [user?.uid]);

  const alternarFavorito = async (uid) => {
    if (!uid || !user?.uid || uid === user.uid) return;
    const estaFavorito = favoritos.includes(uid);
    setFavoritos((atuais) => estaFavorito ? atuais.filter((id) => id !== uid) : [...atuais, uid]);
    try {
      await updateDoc(doc(db, "users", user.uid), { favoritos: estaFavorito ? arrayRemove(uid) : arrayUnion(uid) });
    } catch (error) {
      setFavoritos((atuais) => estaFavorito ? [...atuais, uid] : atuais.filter((id) => id !== uid));
      console.error("Erro ao atualizar favorito:", error);
    }
  };

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

  // Carregar Regionais se for Admin/Nucleo
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

  // Buscar Posts
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

        const perfisCache = {};
        if (!isProfessor) {
          const usersSnap = await getDocs(collection(db, "users"));
          if (cancelado) return;
          usersSnap.forEach((perfilDoc) => { perfisCache[perfilDoc.id] = { id: perfilDoc.id, ...perfilDoc.data() }; });
        }
        if (isProfessor) perfisCache[user.uid] = { ...user, id: user.uid };
        if (!cancelado) setPerfis(perfisCache);

        const posts = [];
        snap.forEach((documento) => {
          const data = documento.data();
          if (isProfessor && data.professorUid !== user.uid) return;

          const unidade = data.unidade || "Sem unidade";
          if ((isDirecao || isRegional) && (!unidadesPermitidasNormalizadas.includes(normalizarTexto(unidade)))) return;

          const dataHora = data.dataHora ? new Date(data.dataHora) : data.dataReal ? new Date(`${data.dataReal}T12:00:00`) : new Date(0);
          const dataHoraValida = !Number.isNaN(dataHora.getTime());

          const nomeDisc = materiasPorChave[data.disciplina] || data.disciplina || "Disciplina";
          const perfil = perfisCache[data.professorUid];
          const nomeProf = perfil?.nome || data.professorEmail?.split("@")[0] || "Professor";

          posts.push({
            id: documento.id, tipo: data.tipo || "aula", professor: nomeProf, professorUid: data.professorUid || "", disciplina: nomeDisc, turma: data.serie || "",
            unidade, diaSemana: capitalizarDia(data.diaNome), dataReferencia: formatarDataReal(data.dataReal),
            status: data.status || "", justificativa: data.justificativa || "", observacao: data.observacao || "",
            dataHoraObj: dataHoraValida ? dataHora : new Date(0),
            dataRealString: data.dataReal || "",
            dataHoraFormatada: dataHoraValida ? dataHora.toLocaleDateString("pt-BR") : "",
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
  }, [user?.uid, user?.nome, user?.unidade, perfilAtivo, unidadeFoco, unidadesEscopoKey, isAdminOrNucleo, isDirecao, isProfessor, isRegional, unidadesPermitidasNormalizadas, materiasPorChave]);

  // Contagem de comentários
  useEffect(() => {
    if (feedPosts.length === 0) return;
    const unsubscribes = feedPosts.map(post => {
      const q = query(collection(db, "checks", post.id, "comentarios"));
      return onSnapshot(q, (snapshot) => {
        setContagemComentarios(prev => ({ ...prev, [post.id]: snapshot.size }));
      });
    });
    return () => unsubscribes.forEach(unsub => unsub());
  }, [feedPosts]);

  const postsFiltrados = useMemo(() => {
    const base = mesFiltro instanceof Date ? mesFiltro : new Date();
    const inicioMesFiltro = new Date(base.getFullYear(), base.getMonth(), 1);
    const fimMesFiltro = new Date(base.getFullYear(), base.getMonth() + 1, 0);
    const inicioMesString = inicioMesFiltro.toISOString().split("T")[0];
    const fimMesString = fimMesFiltro.toISOString().split("T")[0];

    return feedPosts.filter((post) => {
      if (filtroFavoritos && !favoritos.includes(post.professorUid)) return false;
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
      if (filtroRegional.length > 0) {
         // Lógica simplificada de regional (se o post tiver regional)
         // Normalmente posts não têm regional direto, mas se tiver, filtra aqui.
      }

      if (busca) {
        const termo = normalizarTexto(busca);
        if (!normalizarTexto(post.disciplina).includes(termo) &&
            !normalizarTexto(post.turma).includes(termo) &&
            !normalizarTexto(post.unidade).includes(termo) &&
            !normalizarTexto(post.professor).includes(termo)) return false;
      }
      return true;
    });
  }, [feedPosts, filtroTipoFeed, filtroPeriodo, mesFiltro, dataInicioCustom, dataFimCustom, busca, filtroUnidade, filtroRegional, filtroFavoritos, favoritos]);

  const totalPaginas = Math.max(1, Math.ceil(postsFiltrados.length / ITENS_POR_PAGINA));
  const postsPaginados = useMemo(() => {
    const inicio = (paginaAtual - 1) * ITENS_POR_PAGINA;
    return postsFiltrados.slice(inicio, inicio + ITENS_POR_PAGINA);
  }, [postsFiltrados, paginaAtual]);

  useEffect(() => { setPaginaAtual(1); }, [busca, filtroTipoFeed, filtroPeriodo, mesFiltro, dataInicioCustom, dataFimCustom, filtroUnidade, filtroRegional, filtroFavoritos]);

  const toggleComentarios = (id) => setComentariosAbertos((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <div className="w-full min-w-0 pb-20 min-h-screen relative">
      <FeedHeader
        user={user} busca={busca} setBusca={setBusca}
        onBack={onBack} onChat={onChat || chat.abrir} onFamily={onFamily}
        onProfileOpen={onProfileOpen}
        onDirects={onDirects}
        filtroTipoFeed={filtroTipoFeed} setFiltroTipoFeed={setFiltroTipoFeed}
        filtroPeriodo={filtroPeriodo} setFiltroPeriodo={setFiltroPeriodo}
        filtroUnidade={filtroUnidade} setFiltroUnidade={setFiltroUnidade}
        filtroRegional={filtroRegional} setFiltroRegional={setFiltroRegional}
        filtroFavoritos={filtroFavoritos} setFiltroFavoritos={setFiltroFavoritos}
        unidadesPermitidas={unidadesPermitidas}
        regionaisDisponiveis={regionaisDisponiveis}
      />

      {/* Removido o max-w-2xl rígido e o bg-white para o fundo aparecer */}
      <div className="w-full max-w-4xl mx-auto px-2 sm:px-4">
        <FeedList 
          carregando={carregando} 
          posts={postsPaginados} 
          comentariosAbertos={comentariosAbertos} 
          toggleComentarios={toggleComentarios} 
          user={user} 
          contagemComentarios={contagemComentarios}
          perfis={perfis}
          favoritos={favoritos}
          onToggleFavorito={alternarFavorito}
          onProfileOpen={onProfileOpen}
        />

        {totalPaginas > 1 && (
          <div className="py-4 border-t border-gray-100">
            <FeedPagination paginaAtual={paginaAtual} setPaginaAtual={setPaginaAtual} totalPaginas={totalPaginas} />
          </div>
        )}
      </div>

      <ChatModal aberto={chat.aberto} onClose={chat.fechar} />
    </div>
  );
}
