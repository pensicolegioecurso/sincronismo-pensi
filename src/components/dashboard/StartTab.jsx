// src/components/dashboard/StartTab.jsx
import { useState, useMemo, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useCalendario } from "../../hooks/useCalendario";
import { DISCIPLINAS_POR_ANO } from "../../data/disciplinas";
import { parseTurmasPorUnidade, chaveTurma } from "../../utils/turmas";
import StartHeader from "./start/StartHeader";
import StartFilters from "./start/StartFilters";
import StartStats from "./start/StartStats";
import StartCards from "./start/StartCards";
import StartPagination from "./start/StartPagination";

const ITENS_POR_PAGINA = 6;

export default function StartTab({ onNavigate }) {
  const { user, checksSet } = useAuth();
  const { isDiaLetivo, calendarios } = useCalendario();

  const [viewMode, setViewMode] = useState("materias");
  const [filtroUnidade, setFiltroUnidade] = useState("Todas");
  const [filtroTempo, setFiltroTempo] = useState("geral");
  const [busca, setBusca] = useState("");
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [mostrarEstatisticas, setMostrarEstatisticas] = useState(false);
  const [statsReais, setStatsReais] = useState({ concluidas: 0, pendentes: 0, justificadas: 0 });
  const [carregandoStats, setCarregandoStats] = useState(true);

  const turmasAtivasPorUnidade = useMemo(() => {
    if (!user) return {};
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
  }, [user]);

  const userTurmas = useMemo(() => Object.values(turmasAtivasPorUnidade).flat(), [turmasAtivasPorUnidade]);
  const userDisciplinas = useMemo(() => {
    if (!user) return [];
    if (Array.isArray(user.disciplinas)) return user.disciplinas.filter(Boolean);
    return [];
  }, [user]);

  useEffect(() => {
    if (!user || !userTurmas.length || !calendarios.length) {
      setStatsReais({ concluidas: 0, pendentes: 0, justificadas: 0 });
      setCarregandoStats(false);
      return;
    }
    let cancelado = false;
    const calcularStats = async () => {
      setCarregandoStats(true);
      const agora = new Date(); agora.setHours(0, 0, 0, 0);
      let dataCadastro = new Date(0);
      if (user.criadoEm) {
        dataCadastro = user.criadoEm.toDate ? user.criadoEm.toDate() : new Date(user.criadoEm);
      }
      dataCadastro.setHours(0, 0, 0, 0);

      try {
        const { collection, getDocs, query, where } = await import("firebase/firestore");
        const { db } = await import("../../services/firebase");
        const checksSnap = await getDocs(query(collection(db, "checks"), where("professorUid", "==", user.uid)));
        const checksDoProfessor = new Set();
        checksSnap.forEach(d => checksDoProfessor.add(d.id));

        let pendentes = 0, justificadas = 0, concluidas = 0;
        const calAtivo = calendarios[0];
        if (calAtivo && calAtivo.inicio && calAtivo.fim) {
          const dataInicio = new Date(calAtivo.inicio + "T12:00:00");
          const dataFim = new Date(calAtivo.fim + "T12:00:00");
          const diasUteis = [];
          let atual = new Date(dataInicio);
          while (atual <= dataFim) {
            const diaSemana = atual.getDay();
            if (diaSemana !== 0 && diaSemana !== 6) {
              diasUteis.push(atual.toISOString().split("T")[0]);
            }
            atual.setDate(atual.getDate() + 1);
          }

          diasUteis.forEach(diaStr => {
            const dataObj = new Date(diaStr + "T12:00:00");
            if (dataObj < dataCadastro) return;
            if (dataObj > agora) return;
            if (!isDiaLetivo(dataObj, "", "")) return;
            if (filtroTempo === "hoje" && dataObj.getTime() !== agora.getTime()) return;
            if (filtroTempo === "mes" && dataObj < new Date(agora.getFullYear(), agora.getMonth(), 1)) return;
            if (filtroTempo === "ano" && dataObj < new Date(agora.getFullYear(), 0, 1)) return;

            let temCheck = false, temJustificativa = false;
            for (const chk of checksDoProfessor) {
              if (chk.includes(diaStr)) {
                const checkDoc = checksSnap.docs.find(d => d.id === chk);
                const checkData = checkDoc?.data();
                if (checkData) {
                  if (checkData.status === "justificado" || checkData.tipo === "justificativa") temJustificativa = true;
                  else temCheck = true;
                }
              }
            }
            if ([...checksSet].some(id => id.includes(diaStr)) && !temCheck) temCheck = true;

            if (temJustificativa) justificadas++;
            else if (temCheck) concluidas++;
            else pendentes++;
          });
        }
        if (!cancelado) setStatsReais({ concluidas, pendentes, justificadas });
      } catch (err) {
        console.error("Erro ao buscar stats:", err);
      } finally {
        if (!cancelado) setCarregandoStats(false);
      }
    };
    calcularStats();
    return () => { cancelado = true; };
  }, [checksSet, filtroTempo, user, userTurmas, isDiaLetivo, calendarios]);

  const userUnidades = useMemo(() => Object.keys(turmasAtivasPorUnidade), [turmasAtivasPorUnidade]);
  const unidadesDisponiveis = useMemo(() => (userUnidades.length === 0 ? ["Todas"] : ["Todas", ...userUnidades]), [userUnidades]);

  const minhasDisciplinas = useMemo(() => {
    if (!user) return [];
    const base = DISCIPLINAS_POR_ANO["2026"] || {};
    const lista = [];
    userDisciplinas.forEach((key) => {
      const nome = base[key]?.nome || key;
      Object.entries(turmasAtivasPorUnidade).forEach(([u, turmas]) => {
        if (!turmas.length) return;
        lista.push({ key, nome, ano: "2026", unidade: u, turmas });
      });
    });
    return lista;
  }, [user, userDisciplinas, turmasAtivasPorUnidade]);

  const disciplinasFiltradas = useMemo(
    () => minhasDisciplinas.filter((d) => filtroUnidade === "Todas" || d.unidade === filtroUnidade),
    [minhasDisciplinas, filtroUnidade]
  );

  const todosCards = useMemo(() => {
    let cards = [];
    disciplinasFiltradas.forEach((disc) => {
      if (viewMode === "materias") {
        cards.push({ id: `${disc.key}-${disc.unidade}`, nome: disc.nome, unidade: disc.unidade, turma: null, qtdTurmas: disc.turmas.length, key: disc.key, ano: disc.ano });
      } else {
        disc.turmas.forEach((t) => {
          cards.push({ id: `${disc.key}-${disc.unidade}-${t}`, nome: disc.nome, unidade: disc.unidade, turma: t, qtdTurmas: null, key: disc.key, ano: disc.ano });
        });
      }
    });
    if (busca) {
      const q = busca.toLowerCase();
      if (viewMode === "materias") return cards.filter((c) => c.nome.toLowerCase().includes(q));
      return cards.filter((c) => (c.turma && c.turma.toLowerCase().includes(q)) || c.nome.toLowerCase().includes(q));
    }
    return cards;
  }, [disciplinasFiltradas, viewMode, busca]);

  const totalPaginas = Math.max(1, Math.ceil(todosCards.length / ITENS_POR_PAGINA));
  const cardsPaginados = useMemo(() => {
    const inicio = (paginaAtual - 1) * ITENS_POR_PAGINA;
    return todosCards.slice(inicio, inicio + ITENS_POR_PAGINA);
  }, [todosCards, paginaAtual]);

  useEffect(() => { setPaginaAtual(1); }, [filtroUnidade, viewMode, busca, filtroTempo]);
  useEffect(() => {
    if (filtroUnidade !== "Todas" && !userUnidades.includes(filtroUnidade)) setFiltroUnidade("Todas");
  }, [userUnidades, filtroUnidade]);

  return (
    <div className="w-full min-w-0 pb-0 animate-fade-in flex flex-col min-h-screen">
      <div className="max-w-5xl mx-auto px-1 w-full flex-1 pb-10">
        <StartHeader
          user={user}
          viewMode={viewMode}
          totalMaterias={userDisciplinas.length}
          totalTurmas={userTurmas.length}
        />
        <StartFilters
          viewMode={viewMode} setViewMode={setViewMode}
          busca={busca} setBusca={setBusca}
          filtroUnidade={filtroUnidade} setFiltroUnidade={setFiltroUnidade}
          filtroTempo={filtroTempo} setFiltroTempo={setFiltroTempo}
          unidadesDisponiveis={unidadesDisponiveis}
          totalExibindo={cardsPaginados.length}
          totalGeral={todosCards.length}
        />
        <StartStats
          mostrar={mostrarEstatisticas}
          setMostrar={setMostrarEstatisticas}
          carregando={carregandoStats}
          stats={statsReais}
        />
        <StartCards
          viewMode={viewMode}
          cards={cardsPaginados}
          onNavigate={onNavigate}
          userUnidadesCount={userUnidades.length}
          busca={busca}
        />
        <StartPagination
          paginaAtual={paginaAtual}
          setPaginaAtual={setPaginaAtual}
          totalPaginas={totalPaginas}
        />
      </div>
    </div>
  );
}