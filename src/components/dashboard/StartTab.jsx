// src/pages/StartTab.jsx
import { useState, useMemo, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useCalendario } from "../../hooks/useCalendario";
import { DISCIPLINAS_POR_ANO } from "../../utils/disciplinas";
import {
  extrairSerieTurma,
  normalizarTurma,
  normalizarUnidade,
} from "../../utils/turmas";
import { obterTurmasAtivas } from "../../utils/turmasAtivas";

import StartHeader from "./start/StartHeader";
import StartFilters from "./start/StartFilters";
import StartStats from "./start/StartStats";

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
    return new Date(valor.getFullYear(), valor.getMonth(), valor.getDate());
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

function obterSabadoDaSemana(data) {
  const sabado = new Date(data.getFullYear(), data.getMonth(), data.getDate());
  sabado.setDate(sabado.getDate() + (6 - sabado.getDay()));
  sabado.setHours(0, 0, 0, 0);
  return sabado;
}

function pertenceAoPeriodo(data, filtroTempo, hoje) {
  if (filtroTempo === "hoje") return data.getTime() === hoje.getTime();
  if (filtroTempo === "mes") {
    return data.getFullYear() === hoje.getFullYear() && data.getMonth() === hoje.getMonth();
  }
  if (filtroTempo === "ano") return data.getFullYear() === hoje.getFullYear();
  return true;
}

export default function StartTab({
  onBack,
  onChat,
  onFamily,
  onDownloadPDF,
  familyMode,
}) {
  const { user, checksSet } = useAuth();
  const { isDiaLetivo, calendarios } = useCalendario();

  const [viewMode, setViewMode] = useState("materias");
  const [filtroUnidade, setFiltroUnidade] = useState("Todas");
  const [filtroTempo, setFiltroTempo] = useState("geral");
  const [busca, setBusca] = useState("");

  const [statsReais, setStatsReais] = useState({
    concluidas: 0,
    pendentes: 0,
    justificadas: 0,
  });
  const [carregandoStats, setCarregandoStats] = useState(true);
  const [statsPorTurma, setStatsPorTurma] = useState([]);
  const [statsPorUnidade, setStatsPorUnidade] = useState([]);

  // Turmas ativas, respeitando as unidades e turmas inativas.
  const turmasAtivasPorUnidade = useMemo(() => obterTurmasAtivas(user), [user]);
  const userTurmas = useMemo(() => Object.values(turmasAtivasPorUnidade).flat(), [turmasAtivasPorUnidade]);

  const userDisciplinas = useMemo(() => {
    if (!user) return [];
    if (Array.isArray(user.disciplinas)) return user.disciplinas.filter(Boolean);
    return [];
  }, [user]);

  // ==== Estatísticas GERAIS ====
  useEffect(() => {
    if (!user || !userTurmas.length || !calendarios.length) {
      setStatsReais({ concluidas: 0, pendentes: 0, justificadas: 0 });
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
          dataCadastro = user.criadoEm.toDate ? user.criadoEm.toDate() : new Date(user.criadoEm);
        }
        dataCadastro.setHours(0, 0, 0, 0);

        const { collection, getDocs, query, where } = await import("firebase/firestore");
        const { db } = await import("../../services/firebase");

        const checksSnap = await getDocs(
          query(collection(db, "checks"), where("professorUid", "==", user.uid))
        );
        const documentosChecks = checksSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

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

        const unidadesTurmas = Object.entries(turmasAtivasPorUnidade);

        const diasConsiderados = [...datasCalendario].sort().filter((diaStr) => {
          const dataObj = converterData(diaStr);
          if (!dataObj) return false;
          if (dataObj < dataCadastro) return false;
          if (dataObj > agora) return false;
          if (obterSabadoDaSemana(dataObj) > agora) return false;
          if (!pertenceAoPeriodo(dataObj, filtroTempo, agora)) return false;

          const existeTurmaComAula = unidadesTurmas.some(([unidade, turmas]) =>
            turmas.some((turma) => {
              const serie = extrairSerieTurma(turma);
              return isDiaLetivo(dataObj, turma, serie, unidade);
            })
          );
          return existeTurmaComAula;
        });

        let concluidas = 0, pendentes = 0, justificadas = 0;

        diasConsiderados.forEach((diaStr) => {
          let temCheck = false, temJustificativa = false;

          documentosChecks.forEach((check) => {
            const dataCheck = check.dataReal || check.data || "";
            const dataCorresponde =
              String(dataCheck).slice(0, 10) === diaStr ||
              (!dataCheck && check.id.includes(diaStr));
            if (!dataCorresponde) return;

            if (check.unidade) {
              const unidadeAtiva = unidadesTurmas.some(
                ([unidade]) => normalizarUnidade(unidade) === normalizarUnidade(check.unidade)
              );
              if (!unidadeAtiva) return;
            }

            if (check.status === "justificado" || check.tipo === "justificativa") temJustificativa = true;
            else temCheck = true;
          });

          if (!temCheck && !temJustificativa && checksSet instanceof Set) {
            if ([...checksSet].some((id) => String(id).includes(diaStr))) temCheck = true;
          }

          if (temJustificativa) justificadas++;
          else if (temCheck) concluidas++;
          else pendentes++;
        });

        if (!cancelado) setStatsReais({ concluidas, pendentes, justificadas });
      } catch (err) {
        console.error("Erro ao calcular estatísticas:", err);
        if (!cancelado) setStatsReais({ concluidas: 0, pendentes: 0, justificadas: 0 });
      } finally {
        if (!cancelado) setCarregandoStats(false);
      }
    }

    calcularStats();
    return () => { cancelado = true; };
  }, [user, userTurmas, turmasAtivasPorUnidade, checksSet, filtroTempo, isDiaLetivo, calendarios]);

  // ==== Estatísticas POR TURMA ====
  useEffect(() => {
    if (!user || !userTurmas.length || !calendarios.length) {
      setStatsPorTurma([]);
      return;
    }

    let cancelado = false;

    async function calcularPorTurma() {
      try {
        const agora = new Date();
        agora.setHours(0, 0, 0, 0);

        let dataCadastro = new Date(0);
        if (user.criadoEm) {
          dataCadastro = user.criadoEm.toDate ? user.criadoEm.toDate() : new Date(user.criadoEm);
        }
        dataCadastro.setHours(0, 0, 0, 0);

        const { collection, getDocs, query, where } = await import("firebase/firestore");
        const { db } = await import("../../services/firebase");

        const checksSnap = await getDocs(
          query(collection(db, "checks"), where("professorUid", "==", user.uid))
        );
        const documentosChecks = checksSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

        const resultado = [];

        Object.entries(turmasAtivasPorUnidade).forEach(([unidade, turmas]) => {
          turmas.forEach((turma) => {
            const serie = extrairSerieTurma(turma);
            const diasTurma = new Set();

            calendarios.forEach((cal) => {
              const inicio = converterData(cal.inicio);
              const fim = converterData(cal.fim);
              if (!inicio || !fim || inicio > fim) return;
              const atual = new Date(inicio);
              while (atual <= fim) {
                if (atual.getDay() !== 0 && atual.getDay() !== 6) {
                  const diaStr = formatarDataLocal(atual);
                  const dataObj = converterData(diaStr);
                  if (
                    dataObj >= dataCadastro &&
                    dataObj <= agora &&
                    obterSabadoDaSemana(dataObj) <= agora &&
                    pertenceAoPeriodo(dataObj, filtroTempo, agora) &&
                    isDiaLetivo(dataObj, turma, serie, unidade)
                  ) {
                    diasTurma.add(diaStr);
                  }
                }
                atual.setDate(atual.getDate() + 1);
              }
            });

            let c = 0, p = 0, j = 0;

            diasTurma.forEach((diaStr) => {
              let temCheck = false, temJust = false;

              documentosChecks.forEach((check) => {
                const dataCheck = check.dataReal || check.data || "";
                const bateDia =
                  String(dataCheck).slice(0, 10) === diaStr ||
                  (!dataCheck && check.id.includes(diaStr));
                if (!bateDia) return;

                if (check.unidade && normalizarUnidade(check.unidade) !== normalizarUnidade(unidade)) return;
                if (check.turma && normalizarTurma(check.turma) !== normalizarTurma(turma)) return;

                if (check.status === "justificado" || check.tipo === "justificativa") temJust = true;
                else temCheck = true;
              });

              if (temJust) j++;
              else if (temCheck) c++;
              else p++;
            });

            if (c + p + j > 0) resultado.push({ unidade, nome: turma, c, p, j });
          });
        });

        resultado.sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));

        if (!cancelado) setStatsPorTurma(resultado);
      } catch (err) {
        console.error("Erro ao calcular stats por turma:", err);
        if (!cancelado) setStatsPorTurma([]);
      }
    }

    calcularPorTurma();
    return () => { cancelado = true; };
  }, [user, userTurmas, turmasAtivasPorUnidade, checksSet, filtroTempo, isDiaLetivo, calendarios]);

  // ==== Estatísticas POR UNIDADE ====
  useEffect(() => {
    if (!user || !userTurmas.length || !calendarios.length) {
      setStatsPorUnidade([]);
      return;
    }

    let cancelado = false;

    async function calcularPorUnidade() {
      try {
        const agora = new Date();
        agora.setHours(0, 0, 0, 0);

        let dataCadastro = new Date(0);
        if (user.criadoEm) {
          dataCadastro = user.criadoEm.toDate ? user.criadoEm.toDate() : new Date(user.criadoEm);
        }
        dataCadastro.setHours(0, 0, 0, 0);

        const { collection, getDocs, query, where } = await import("firebase/firestore");
        const { db } = await import("../../services/firebase");

        const checksSnap = await getDocs(
          query(collection(db, "checks"), where("professorUid", "==", user.uid))
        );
        const documentosChecks = checksSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

        const resultado = [];

        Object.entries(turmasAtivasPorUnidade).forEach(([unidade, turmas]) => {
          const diasUnidade = new Set();

          turmas.forEach((turma) => {
            const serie = extrairSerieTurma(turma);
            calendarios.forEach((cal) => {
              const inicio = converterData(cal.inicio);
              const fim = converterData(cal.fim);
              if (!inicio || !fim || inicio > fim) return;
              const atual = new Date(inicio);
              while (atual <= fim) {
                if (atual.getDay() !== 0 && atual.getDay() !== 6) {
                  const diaStr = formatarDataLocal(atual);
                  const dataObj = converterData(diaStr);
                  if (
                    dataObj >= dataCadastro &&
                    dataObj <= agora &&
                    obterSabadoDaSemana(dataObj) <= agora &&
                    pertenceAoPeriodo(dataObj, filtroTempo, agora) &&
                    isDiaLetivo(dataObj, turma, serie, unidade)
                  ) {
                    diasUnidade.add(diaStr);
                  }
                }
                atual.setDate(atual.getDate() + 1);
              }
            });
          });

          let c = 0, p = 0, j = 0;

          diasUnidade.forEach((diaStr) => {
            let temCheck = false, temJust = false;

            documentosChecks.forEach((check) => {
              const dataCheck = check.dataReal || check.data || "";
              const bateDia = String(dataCheck).slice(0, 10) === diaStr || (!dataCheck && check.id.includes(diaStr));
              if (!bateDia) return;
              if (check.unidade && normalizarUnidade(check.unidade) !== normalizarUnidade(unidade)) return;

              if (check.status === "justificado" || check.tipo === "justificativa") temJust = true;
              else temCheck = true;
            });

            if (temJust) j++;
            else if (temCheck) c++;
            else p++;
          });

          if (c + p + j > 0) resultado.push({ unidade, nome: unidade, c, p, j });
        });

        resultado.sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));

        if (!cancelado) setStatsPorUnidade(resultado);
      } catch (err) {
        console.error("Erro ao calcular stats por unidade:", err);
        if (!cancelado) setStatsPorUnidade([]);
      }
    }

    calcularPorUnidade();
    return () => { cancelado = true; };
  }, [user, userTurmas, turmasAtivasPorUnidade, checksSet, filtroTempo, isDiaLetivo, calendarios]);

  const userUnidades = useMemo(() => Object.keys(turmasAtivasPorUnidade), [turmasAtivasPorUnidade]);

  const unidadesDisponiveis = useMemo(
    () => (userUnidades.length === 0 ? ["Todas"] : ["Todas", ...userUnidades]),
    [userUnidades]
  );

  const minhasDisciplinas = useMemo(() => {
    if (!user) return [];
    const base = DISCIPLINAS_POR_ANO["2026"] || {};
    const lista = [];

    userDisciplinas.forEach((key) => {
      const nome = base[key]?.nome || key;
      Object.entries(turmasAtivasPorUnidade).forEach(([unidade, turmas]) => {
        if (!turmas.length) return;
        lista.push({ key, nome, ano: "2026", unidade, turmas });
      });
    });

    return lista;
  }, [user, userDisciplinas, turmasAtivasPorUnidade]);

  const disciplinasFiltradas = useMemo(
    () =>
      minhasDisciplinas.filter(
        (disciplina) => filtroUnidade === "Todas" || disciplina.unidade === filtroUnidade
      ),
    [minhasDisciplinas, filtroUnidade]
  );

  // Só usado para o contador do StartFilters (os cards agora ficam no + do menu).
  const totalItens = useMemo(() => {
    const q = busca.trim().toLowerCase();
    let total = 0;

    disciplinasFiltradas.forEach((disciplina) => {
      if (viewMode === "materias") {
        if (!q || disciplina.nome.toLowerCase().includes(q)) total += 1;
      } else {
        disciplina.turmas.forEach((turma) => {
          if (
            !q ||
            turma.toLowerCase().includes(q) ||
            disciplina.nome.toLowerCase().includes(q)
          ) {
            total += 1;
          }
        });
      }
    });

    return total;
  }, [disciplinasFiltradas, viewMode, busca]);

  useEffect(() => {
    if (filtroUnidade !== "Todas" && !userUnidades.includes(filtroUnidade)) {
      setFiltroUnidade("Todas");
    }
  }, [userUnidades, filtroUnidade]);

  return (
    <div className="w-full min-w-0 pb-10 animate-fade-in">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 pt-6">
        <StartHeader
          user={user}
          viewMode={viewMode}
          totalMaterias={userDisciplinas.length}
          totalTurmas={userTurmas.length}
          onBack={onBack}
          onChat={onChat}
          onFamily={onFamily}
          onDownloadPDF={onDownloadPDF}
          familyMode={familyMode}
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
          totalExibindo={totalItens}
          totalGeral={totalItens}
        />

        <StartStats
          carregando={carregandoStats}
          stats={statsReais}
          porTurma={statsPorTurma}
          porUnidade={statsPorUnidade}
        />

        <p className="mt-6 text-center text-sm text-gray-400">
          Toque no <b>+</b> para ver suas matérias, turmas e unidades.
        </p>
      </div>
    </div>
  );
}