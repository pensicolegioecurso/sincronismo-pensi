
import { useState, useMemo, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useCalendario } from "../../hooks/useCalendario";
import { DISCIPLINAS_POR_ANO } from "../../data/disciplinas";
import {
  parseTurmasPorUnidade,
  chaveTurma,
  extrairSerieTurma,
  normalizarTurma,
  normalizarUnidade,
} from "../../utils/turmas";

import StartHeader from "./start/StartHeader";
import StartFilters from "./start/StartFilters";
import StartStats from "./start/StartStats";
import StartCards from "./start/StartCards";
import StartPagination from "./start/StartPagination";

const ITENS_POR_PAGINA = 6;

function converterData(valor) {
  if (!valor) return null;

  if (typeof valor === "string") {
    const partes = valor.slice(0, 10).split("-");

    if (partes.length !== 3) return null;

    const [ano, mes, dia] = partes.map(Number);

    if (!ano || !mes || !dia) return null;

    return new Date(ano, mes - 1, dia);
  }

  if (valor instanceof Date) {
    return new Date(
      valor.getFullYear(),
      valor.getMonth(),
      valor.getDate()
    );
  }

  if (typeof valor.toDate === "function") {
    return converterData(valor.toDate());
  }

  return null;
}

function formatarDataLocal(data) {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");

  return `${ano}-${mes}-${dia}`;
}

function obterUnidadesUsuario(valor) {
  if (Array.isArray(valor)) {
    return valor
      .map((item) => String(item).trim())
      .filter(Boolean);
  }

  return String(valor || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function obterTurmasAtivas(user) {
  if (!user) return {};

  const mapa = parseTurmasPorUnidade(user.turmas || "");

  const unidadesUsuario = obterUnidadesUsuario(user.unidade);

  const unidadesPermitidas = new Set(
    unidadesUsuario.map(normalizarUnidade)
  );

  const unidadesInativas = new Set(
    (Array.isArray(user.unidadesInativas)
      ? user.unidadesInativas
      : []
    ).map(normalizarUnidade)
  );

  const turmasInativas = Array.isArray(user.turmasInativas)
    ? user.turmasInativas
    : [];

  const resultado = {};

  Object.entries(mapa).forEach(([unidade, turmas]) => {
    const unidadeNormalizada = normalizarUnidade(unidade);

    if (
      unidadesPermitidas.size > 0 &&
      !unidadesPermitidas.has(unidadeNormalizada)
    ) {
      return;
    }

    if (unidadesInativas.has(unidadeNormalizada)) {
      return;
    }

    const inativasDaUnidade = new Set(
      turmasInativas
        .map((item) => {
          if (typeof item !== "string") return "";

          if (item.includes("::")) {
            const [unidadeItem, ...resto] = item.split("::");

            if (
              normalizarUnidade(unidadeItem) !== unidadeNormalizada
            ) {
              return "";
            }

            return normalizarTurma(resto.join("::"));
          }

          return normalizarTurma(item);
        })
        .filter(Boolean)
    );

    const ativas = turmas.filter((turma) => {
      const inativaPorChave = turmasInativas.includes(
        chaveTurma(unidade, turma)
      );

      const inativaPorNome = inativasDaUnidade.has(
        normalizarTurma(turma)
      );

      return !inativaPorChave && !inativaPorNome;
    });

    if (ativas.length > 0) {
      resultado[unidade] = ativas;
    }
  });

  return resultado;
}

function obterSabadoDaSemana(data) {
  const sabado = new Date(
    data.getFullYear(),
    data.getMonth(),
    data.getDate()
  );

  sabado.setDate(sabado.getDate() + (6 - sabado.getDay()));
  sabado.setHours(0, 0, 0, 0);

  return sabado;
}

function pertenceAoPeriodo(data, filtroTempo, hoje) {
  if (filtroTempo === "hoje") {
    return data.getTime() === hoje.getTime();
  }

  if (filtroTempo === "mes") {
    return (
      data.getFullYear() === hoje.getFullYear() &&
      data.getMonth() === hoje.getMonth()
    );
  }

  if (filtroTempo === "ano") {
    return data.getFullYear() === hoje.getFullYear();
  }

  return true;
}

export default function StartTab({ onNavigate }) {
  const { user, checksSet } = useAuth();
  const { isDiaLetivo, calendarios } = useCalendario();

  const [viewMode, setViewMode] = useState("materias");
  const [filtroUnidade, setFiltroUnidade] = useState("Todas");
  const [filtroTempo, setFiltroTempo] = useState("geral");
  const [busca, setBusca] = useState("");
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [mostrarEstatisticas, setMostrarEstatisticas] = useState(false);

  const [statsReais, setStatsReais] = useState({
    concluidas: 0,
    pendentes: 0,
    justificadas: 0,
  });

  const [carregandoStats, setCarregandoStats] = useState(true);

  // Turmas ativas, respeitando as unidades e turmas inativas.
  const turmasAtivasPorUnidade = useMemo(
    () => obterTurmasAtivas(user),
    [user]
  );

  const userTurmas = useMemo(
    () => Object.values(turmasAtivasPorUnidade).flat(),
    [turmasAtivasPorUnidade]
  );

  const userDisciplinas = useMemo(() => {
    if (!user) return [];

    if (Array.isArray(user.disciplinas)) {
      return user.disciplinas.filter(Boolean);
    }

    return [];
  }, [user]);

  // Calcula as estatísticas.
  useEffect(() => {
    if (!user || !userTurmas.length || !calendarios.length) {
      setStatsReais({
        concluidas: 0,
        pendentes: 0,
        justificadas: 0,
      });

      setCarregandoStats(false);
      return;
    }

    let cancelado = false;

    async function calcularStats() {
      setCarregandoStats(true);

      try {
        const agora = new Date();
        agora.setHours(0, 0, 0, 0);

        let dataCadastro = new Date(0);

        if (user.criadoEm) {
          dataCadastro = user.criadoEm.toDate
            ? user.criadoEm.toDate()
            : new Date(user.criadoEm);
        }

        dataCadastro.setHours(0, 0, 0, 0);

        const { collection, getDocs, query, where } =
          await import("firebase/firestore");

        const { db } = await import("../../services/firebase");

        const checksSnap = await getDocs(
          query(
            collection(db, "checks"),
            where("professorUid", "==", user.uid)
          )
        );

        const documentosChecks = checksSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Monta o conjunto de datas existentes em todos os calendários.
        const datasCalendario = new Set();

        calendarios.forEach((calendario) => {
          const inicio = converterData(calendario.inicio);
          const fim = converterData(calendario.fim);

          if (!inicio || !fim || inicio > fim) return;

          const atual = new Date(inicio);

          while (atual <= fim) {
            if (atual.getDay() !== 0 && atual.getDay() !== 6) {
              datasCalendario.add(formatarDataLocal(atual));
            }

            atual.setDate(atual.getDate() + 1);
          }
        });

        const unidadesTurmas = Object.entries(
          turmasAtivasPorUnidade
        );

        const diasConsiderados = [...datasCalendario]
          .sort()
          .filter((diaStr) => {
            const dataObj = converterData(diaStr);

            if (!dataObj) return false;

            // Não conta antes da data de cadastro.
            if (dataObj < dataCadastro) return false;

            // Não conta datas futuras.
            if (dataObj > agora) return false;

            // A semana só entra nas estatísticas quando chega ao sábado.
            const sabadoDaSemana = obterSabadoDaSemana(dataObj);

            if (sabadoDaSemana > agora) return false;

            // Aplica os filtros de período.
            if (!pertenceAoPeriodo(dataObj, filtroTempo, agora)) {
              return false;
            }

            // Verifica se existe pelo menos uma turma ativa
            // com dia letivo nessa data.
            const existeTurmaComAula = unidadesTurmas.some(
              ([unidade, turmas]) =>
                turmas.some((turma) => {
                  const serie = extrairSerieTurma(turma);

                  return isDiaLetivo(
                    dataObj,
                    turma,
                    serie,
                    unidade
                  );
                })
            );

            // Se todas as turmas estiverem em exceção,
            // essa data não entra nas estatísticas.
            return existeTurmaComAula;
          });

        let concluidas = 0;
        let pendentes = 0;
        let justificadas = 0;

        diasConsiderados.forEach((diaStr) => {
          let temCheck = false;
          let temJustificativa = false;

          documentosChecks.forEach((check) => {
            const dataCheck =
              check.dataReal ||
              check.data ||
              "";

            const dataCorresponde =
              String(dataCheck).slice(0, 10) === diaStr ||
              (!dataCheck && check.id.includes(diaStr));

            if (!dataCorresponde) return;

            // Se o check informa uma unidade, verifica se ela
            // ainda pertence às unidades ativas do professor.
            if (check.unidade) {
              const unidadeAtiva = unidadesTurmas.some(
                ([unidade]) =>
                  normalizarUnidade(unidade) ===
                  normalizarUnidade(check.unidade)
              );

              if (!unidadeAtiva) return;
            }

            if (
              check.status === "justificado" ||
              check.tipo === "justificativa"
            ) {
              temJustificativa = true;
            } else {
              temCheck = true;
            }
          });

          // Aproveita os checks locais enquanto a atualização
          // da consulta do Firestore não chega.
          if (
            !temCheck &&
            !temJustificativa &&
            checksSet instanceof Set &&
            [...checksSet].some((id) => String(id).includes(diaStr))
          ) {
            temCheck = true;
          }

          if (temJustificativa) {
            justificadas++;
          } else if (temCheck) {
            concluidas++;
          } else {
            pendentes++;
          }
        });

        if (!cancelado) {
          setStatsReais({
            concluidas,
            pendentes,
            justificadas,
          });
        }
      } catch (err) {
        console.error("Erro ao calcular estatísticas:", err);

        if (!cancelado) {
          setStatsReais({
            concluidas: 0,
            pendentes: 0,
            justificadas: 0,
          });
        }
      } finally {
        if (!cancelado) {
          setCarregandoStats(false);
        }
      }
    }

    calcularStats();

    return () => {
      cancelado = true;
    };
  }, [
    user,
    userTurmas,
    turmasAtivasPorUnidade,
    checksSet,
    filtroTempo,
    isDiaLetivo,
    calendarios,
  ]);

  const userUnidades = useMemo(
    () => Object.keys(turmasAtivasPorUnidade),
    [turmasAtivasPorUnidade]
  );

  const unidadesDisponiveis = useMemo(
    () =>
      userUnidades.length === 0
        ? ["Todas"]
        : ["Todas", ...userUnidades],
    [userUnidades]
  );

  const minhasDisciplinas = useMemo(() => {
    if (!user) return [];

    const base = DISCIPLINAS_POR_ANO["2026"] || {};
    const lista = [];

    userDisciplinas.forEach((key) => {
      const nome = base[key]?.nome || key;

      Object.entries(turmasAtivasPorUnidade).forEach(
        ([unidade, turmas]) => {
          if (!turmas.length) return;

          lista.push({
            key,
            nome,
            ano: "2026",
            unidade,
            turmas,
          });
        }
      );
    });

    return lista;
  }, [user, userDisciplinas, turmasAtivasPorUnidade]);

  const disciplinasFiltradas = useMemo(
    () =>
      minhasDisciplinas.filter(
        (disciplina) =>
          filtroUnidade === "Todas" ||
          disciplina.unidade === filtroUnidade
      ),
    [minhasDisciplinas, filtroUnidade]
  );

  const todosCards = useMemo(() => {
    let cards = [];

    disciplinasFiltradas.forEach((disciplina) => {
      if (viewMode === "materias") {
        cards.push({
          id: `${disciplina.key}-${disciplina.unidade}`,
          nome: disciplina.nome,
          unidade: disciplina.unidade,
          turma: null,
          qtdTurmas: disciplina.turmas.length,
          key: disciplina.key,
          ano: disciplina.ano,
        });
      } else {
        disciplina.turmas.forEach((turma) => {
          cards.push({
            id: `${disciplina.key}-${disciplina.unidade}-${turma}`,
            nome: disciplina.nome,
            unidade: disciplina.unidade,
            turma,
            qtdTurmas: null,
            key: disciplina.key,
            ano: disciplina.ano,
          });
        });
      }
    });

    if (busca) {
      const q = busca.toLowerCase();

      if (viewMode === "materias") {
        return cards.filter((card) =>
          card.nome.toLowerCase().includes(q)
        );
      }

      return cards.filter(
        (card) =>
          (card.turma && card.turma.toLowerCase().includes(q)) ||
          card.nome.toLowerCase().includes(q)
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

    return todosCards.slice(
      inicio,
      inicio + ITENS_POR_PAGINA
    );
  }, [todosCards, paginaAtual]);

  useEffect(() => {
    setPaginaAtual(1);
  }, [filtroUnidade, viewMode, busca, filtroTempo]);

  useEffect(() => {
    if (
      filtroUnidade !== "Todas" &&
      !userUnidades.includes(filtroUnidade)
    ) {
      setFiltroUnidade("Todas");
    }
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
          viewMode={viewMode}
          setViewMode={setViewMode}
          busca={busca}
          setBusca={setBusca}
          filtroUnidade={filtroUnidade}
          setFiltroUnidade={setFiltroUnidade}
          filtroTempo={filtroTempo}
          setFiltroTempo={setFiltroTempo}
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
