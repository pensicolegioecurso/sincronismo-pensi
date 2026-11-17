
// src/pages/Calendar.jsx

import { useEffect, useState, useMemo } from "react";
import { useAuth } from "../hooks/useAuth";
import { useCalendarData } from "../hooks/useCalendarData";
import { useCalendario } from "../hooks/useCalendario";
import { DISCIPLINAS_POR_ANO } from "../data/disciplinas";
import { NOMES_MES } from "../utils/formatters";
import { salvarCheck, gerarIdCheck } from "../services/firestoreChecks";
import Loading from "../components/Loading";
import CalendarHeader from "../components/calendar/CalendarHeader";
import CalendarAlert from "../components/calendar/CalendarAlert";
import CalendarError from "../components/calendar/CalendarError";
import CalendarGrid from "../components/calendar/CalendarGrid";
import CalendarDetailPanel from "../components/calendar/CalendarDetailPanel";

import {
  parseTurmasPorUnidade,
  chaveTurma,
  extrairSerieTurma,
} from "../utils/turmas";

function normalizar(s) {
  return String(s || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function extrairBase(serie) {
  return extrairSerieTurma(serie) || normalizar(serie);
}

function acharAba(abas, serieDaTurma) {
  if (!abas?.length) return null;

  const baseTurma = extrairBase(serieDaTurma);

  return (
    abas.find((aba) => extrairBase(aba) === baseTurma) || null
  );
}

function parseData(periodo, ano) {
  const t = String(periodo || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  let m = t.match(/(\d{1,2})\s*[\/.-]\s*([a-z]{3})/);

  if (m) {
    const mes = [
      "jan", "fev", "mar", "abr", "mai", "jun",
      "jul", "ago", "set", "out", "nov", "dez",
    ].indexOf(m[2]);

    return mes < 0
      ? null
      : new Date(ano, mes, parseInt(m[1], 10));
  }

  m = t.match(/(\d{1,2})\s*[\/.-]\s*(\d{1,2})/);

  if (m) {
    const mes = parseInt(m[2], 10) - 1;

    return mes < 0 || mes > 11
      ? null
      : new Date(ano, mes, parseInt(m[1], 10));
  }

  return null;
}

export default function CalendarPage({
  disciplinaKey,
  ano,
  onBack,
  unidadePreSelecionada,
  turmaPreSelecionada,
}) {
  const { user, checksSet, setChecksSet } = useAuth();

  const disc = DISCIPLINAS_POR_ANO[ano]?.[disciplinaKey];

  const { isDiaLetivo } = useCalendario();

  const {
    currentWeeks,
    currentAulas,
    currentCaps,
    currentSemanas,
    currentAulaIdx,
    currentModelo,
    fetchAbas,
    carregarAba,
    processar,
  } = useCalendarData();

  const [abas, setAbas] = useState([]);
  const [serie, setSerie] = useState("");
  const [turmaSelecionada, setTurmaSelecionada] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [mesIdx, setMesIdx] = useState(0);
  const [diaSelecionado, setDiaSelecionado] = useState(null);

  // Busca as abas disponíveis da disciplina
  useEffect(() => {
    if (!disc) {
      setError(true);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(false);

    fetchAbas(disc)
      .then((lista) => {
        if (!lista || !lista.length) {
          throw new Error("Sem abas");
        }

        setAbas(lista);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, [disciplinaKey, ano]);

  // Identifica dinamicamente as turmas do professor
  const opcoesProfessor = useMemo(() => {
    if (!user || !abas.length) return [];

    const mapa = parseTurmasPorUnidade(user.turmas || "");

    const inativasU = new Set(user.unidadesInativas || []);
    const inativasT = new Set(user.turmasInativas || []);

    const turmasPorUnidade = {};

    Object.entries(mapa).forEach(([uni, turmas]) => {
      if (inativasU.has(uni)) return;

      const ativas = turmas.filter(
        (turma) => !inativasT.has(chaveTurma(uni, turma))
      );

      if (ativas.length > 0) {
        turmasPorUnidade[uni] = ativas;
      }
    });

    let turmasParaExibir;

    if (unidadePreSelecionada) {
      turmasParaExibir =
        turmasPorUnidade[unidadePreSelecionada] || [];
    } else {
      turmasParaExibir =
        Object.values(turmasPorUnidade).flat();
    }

    return turmasParaExibir
      .map((nomeTurma) => {
        const serieTurma = extrairSerieTurma(nomeTurma);

        if (!serieTurma) return null;

        const aba = acharAba(abas, serieTurma);

        return aba
          ? {
              turma: nomeTurma,
              serie: serieTurma,
              aba,
            }
          : null;
      })
      .filter(Boolean);
  }, [user, abas, unidadePreSelecionada]);

  // Seleciona automaticamente a turma disponível
  useEffect(() => {
    if (!abas.length) return;

    if (turmaPreSelecionada) {
      const opcao = opcoesProfessor.find(
        (o) => o.turma === turmaPreSelecionada
      );

      if (opcao) {
        setTurmaSelecionada(opcao.turma);
        setSerie(opcao.aba);
        return;
      }
    }

    if (user && opcoesProfessor.length > 0) {
      const primeira = opcoesProfessor[0];

      setTurmaSelecionada(primeira.turma);
      setSerie(primeira.aba);
      return;
    }

    if (opcoesProfessor.length === 0 && abas.length > 0) {
      setSerie(abas[0]);
      setTurmaSelecionada("");
    }
  }, [abas, opcoesProfessor, user, turmaPreSelecionada]);

  // Carrega os dados da aba selecionada
  useEffect(() => {
    if (!serie || !disc || error) return;

    setLoading(true);

    carregarAba(ano, disciplinaKey, serie)
      .then((rows) => {
        if (!rows) throw new Error("Sem dados");
        processar(rows);
      })
      .catch(() => {
        setError(true);
        processar([]);
      })
      .finally(() => setLoading(false));

    setDiaSelecionado(null);
  }, [serie, ano, disciplinaKey, error]);

  // Organiza as semanas por mês
  const meses = useMemo(() => {
    if (!currentWeeks.length) {
      return [{ y: 0, m: -1, rotulo: "Todas" }];
    }

    const set = new Map();

    let anoRef = parseInt(ano, 10);
    let ant = null;

    currentWeeks.forEach((w) => {
      const d = parseData(w.periodo, anoRef);

      if (d && ant && d < ant) {
        anoRef++;
      }

      if (d) ant = d;

      w.datas = d
        ? [0, 1, 2, 3, 4, 5].map(
            (k) =>
              new Date(
                d.getFullYear(),
                d.getMonth(),
                d.getDate() + k
              )
          )
        : null;
    });

    currentWeeks.forEach((w) => {
      if (!w.datas) return;

      w.datas.slice(0, 5).forEach((d) => {
        const k = d.getFullYear() * 12 + d.getMonth();

        if (!set.has(k)) {
          set.set(k, {
            y: d.getFullYear(),
            m: d.getMonth(),
          });
        }
      });
    });

    return [...set.values()]
      .sort(
        (a, b) =>
          a.y * 12 + a.m - (b.y * 12 + b.m)
      )
      .map((v) => ({
        ...v,
        rotulo: NOMES_MES[v.m],
      }));
  }, [currentWeeks, ano]);

  // Abre o mês atual automaticamente
  useEffect(() => {
    if (currentWeeks.length > 0 && meses.length > 0) {
      const hoje = new Date();

      const idxHoje = meses.findIndex(
        (m) =>
          m.y === hoje.getFullYear() &&
          m.m === hoje.getMonth()
      );

      if (idxHoje !== -1) {
        setMesIdx(idxHoje);
      }
    }
  }, [currentWeeks]);

  // Registra os checks
  async function handleCheck({
    semanaIdx,
    diaNome,
    aulaIndex,
    tipo,
    justificativa,
    observacao,
    turmasParaAplicar,
  }) {
    if (!user) return;

    const unidadeDoCard =
      unidadePreSelecionada || "Sem unidade";

    const payload = {
      uid: user.uid,
      email: user.email,
      disciplina: disciplinaKey,
      serie,
      unidade: unidadeDoCard,
      turmasParaAplicar,
      semanaIdx,
      diaNome,
      aulaIndex,
      tipo,
      justificativa,
      observacao,
    };

    const chavesNovas = turmasParaAplicar.map((turma) =>
      gerarIdCheck({
        disciplina: disciplinaKey,
        serie: turma,
        semanaIdx,
        diaNome,
        aulaIndex,
      })
    );

    setChecksSet(
      (prev) => new Set([...prev, ...chavesNovas])
    );

    try {
      await salvarCheck(payload);
    } catch (err) {
      console.error("Erro ao salvar check:", err);

      setChecksSet((prev) => {
        const novo = new Set(prev);

        chavesNovas.forEach((c) => novo.delete(c));

        return novo;
      });

      alert(
        "Não foi possível registrar o check. Tente novamente."
      );
    }
  }

  if (error) {
    return <CalendarError onBack={onBack} />;
  }

  const isReady =
    !loading && currentWeeks.length > 0;

  const mostrarSeletor = (() => {
    if (!user) return abas.length > 1;
    if (turmaPreSelecionada) return false;

    return opcoesProfessor.length > 1;
  })();

  const unicaOpcao =
    opcoesProfessor.length === 1
      ? opcoesProfessor[0]
      : null;

  const nomeParaOProperty =
    turmaSelecionada ||
    (unicaOpcao ? unicaOpcao.turma : serie);

  const listaTurmasParaCheck =
    opcoesProfessor.map((o) => o.turma);

  return (
    <div className="min-h-screen bg-[#e6e8eb] flex flex-col font-sans relative overflow-hidden">
      {!isReady && (
        <Loading texto="Carregando calendário..." />
      )}

      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[10%] left-[-5%] w-[600px] h-[600px] bg-pensi-yellow/8 rounded-full blur-[120px]"></div>

        <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-blue-400/10 rounded-full blur-[120px]"></div>

        <div className="absolute top-[40%] left-[30%] w-[500px] h-[500px] bg-purple-300/8 rounded-full blur-[120px]"></div>
      </div>

      <div
        className={
          isReady
            ? "block"
            : "opacity-0 pointer-events-none"
        }
      >
        <CalendarHeader
          onBack={onBack}
          mesIdx={mesIdx}
          setMesIdx={setMesIdx}
          meses={meses}
          user={user}
          abas={abas}
          opcoesProfessor={opcoesProfessor}
          turmaSelecionada={turmaSelecionada}
          setTurmaSelecionada={setTurmaSelecionada}
          serie={serie}
          setSerie={setSerie}
          mostrarSeletor={mostrarSeletor}
          turmaPreSelecionada={turmaPreSelecionada}
          unicaOpcao={unicaOpcao}
        />

        {user && opcoesProfessor.length === 0 && (
          <CalendarAlert />
        )}

        <div className="flex-1 grid md:grid-cols-[1.3fr_1fr] gap-8 max-w-[1400px] mx-auto p-6 w-full items-start relative z-10">
          <div className="bg-white/50 backdrop-blur-2xl border-[3px] border-black rounded-2xl shadow-[6px_6px_0px_0px_#000] p-6">
            <CalendarGrid
              weeks={currentWeeks}
              mesSelecionado={meses[mesIdx]}
              diaSelecionado={diaSelecionado}
              onDayClick={(weekIdx, diaIdx) =>
                setDiaSelecionado({ weekIdx, diaIdx })
              }
              isDiaLetivo={isDiaLetivo}
              turmaSelecionada={
                turmaSelecionada || nomeParaOProperty
              }
              serie={serie}
            />
          </div>

          <aside className="bg-white/50 backdrop-blur-2xl border-[3px] border-black rounded-2xl shadow-[6px_6px_0px_0px_#000] sticky top-6 max-h-[calc(100vh-3rem)] overflow-y-auto">
            <CalendarDetailPanel
              semData={
                diaSelecionado
                  ? currentWeeks[diaSelecionado.weekIdx]
                  : null
              }
              diaIdx={diaSelecionado?.diaIdx}
              weekIdx={diaSelecionado?.weekIdx}
              currentModelo={currentModelo}
              currentAulas={currentAulas || {}}
              currentCaps={currentCaps || {}}
              currentSemanas={currentSemanas || {}}
              currentAulaIdx={currentAulaIdx || {}}
              checksSet={checksSet || new Set()}
              onCheck={handleCheck}
              disciplinaAtualKey={disciplinaKey}
              currentSheetName={nomeParaOProperty}
              turmasDoProfessor={listaTurmasParaCheck}
              unidadeSelecionada={unidadePreSelecionada}
            />
          </aside>
        </div>
      </div>
    </div>
  );
}
