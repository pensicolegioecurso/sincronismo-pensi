import { useEffect, useState, useMemo } from "react";
import { useAuth } from "../hooks/useAuth";
import { useCalendarData } from "../hooks/useCalendarData";
import { useCalendario } from "../hooks/useCalendario";
import { DISCIPLINAS_POR_ANO } from "../utils/disciplinas";
import { NOMES_MES } from "../utils/formatters";
import { salvarCheck, gerarIdCheck } from "../services/firestoreChecks";
import Loading from "../components/Loading";
import CalendarHeader from "../components/calendar/CalendarHeader";
import CalendarAlert from "../components/calendar/CalendarAlert";
import CalendarError from "../components/calendar/CalendarError";
import CalendarGrid from "../components/calendar/CalendarGrid";
import CalendarDetailPanel from "../components/calendar/CalendarDetailPanel";
import { parseTurmasPorUnidade, extrairSerieTurma, normalizarTurma, normalizarUnidade } from "../utils/turmas";

function normalizar(s) {
  return String(s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim().replace(/\s+/g, " ");
}

function extrairBase(serie) {
  return extrairSerieTurma(serie) || normalizar(serie);
}

function acharAba(abas, serieDaTurma) {
  if (!abas?.length) return null;
  const baseTurma = extrairBase(serieDaTurma);
  const encontrada = abas.find((aba) => extrairBase(aba.segmento || aba) === baseTurma);
  return encontrada?.id || encontrada || null;
}

function parseData(periodo, ano) {
  const t = String(periodo || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  let m = t.match(/(\d{1,2})\s*[\/.-]\s*([a-z]{3})/);
  if (m) {
    const mes = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"].indexOf(m[2]);
    return mes < 0 ? null : new Date(ano, mes, parseInt(m[1], 10));
  }
  m = t.match(/(\d{1,2})\s*[\/.-]\s*(\d{1,2})/);
  if (m) {
    const mes = parseInt(m[2], 10) - 1;
    return mes < 0 || mes > 11 ? null : new Date(ano, mes, parseInt(m[1], 10));
  }
  return null;
}

function obterUnidadesUsuario(valor) {
  if (Array.isArray(valor)) return valor.map((item) => String(item).trim()).filter(Boolean);
  return String(valor || "").split(",").map((item) => item.trim()).filter(Boolean);
}

function obterTurmasInativas(unidade, turmasInativas) {
  const unidadeNormalizada = normalizarUnidade(unidade);
  return new Set(
    (Array.isArray(turmasInativas) ? turmasInativas : [])
      .map((item) => {
        if (typeof item !== "string") return "";
        if (item.includes("::")) {
          const [unidadeItem, ...resto] = item.split("::");
          if (normalizarUnidade(unidadeItem) !== unidadeNormalizada) return "";
          return normalizarTurma(resto.join("::"));
        }
        return normalizarTurma(item);
      })
      .filter(Boolean)
  );
}

export default function CalendarPage({ disciplinaKey, ano, onBack, unidadePreSelecionada, turmaPreSelecionada }) {
  const { user, checksSet, setChecksSet } = useAuth();
  const cargos = [...(Array.isArray(user?.cargos) ? user.cargos : []), user?.cargo].filter(Boolean).map((cargo) => String(cargo).toLowerCase());
  const modoConferencia = cargos.some((cargo) => normalizar(cargo) && ["admin", "administrador", "nucleo", "regional"].includes(normalizar(cargo)));
  const unidadesUsuario = useMemo(() => obterUnidadesUsuario(user?.unidade), [user?.unidade]);
  const disc = useMemo(() => DISCIPLINAS_POR_ANO[ano]?.[disciplinaKey] || DISCIPLINAS_POR_ANO["2026"]?.[disciplinaKey] || { nome: disciplinaKey }, [ano, disciplinaKey]);
  const { isDiaLetivo, erroCarregamento: erroCalendario } = useCalendario();
  const { currentWeeks, currentAulas, currentCaps, currentSemanas, currentAulaIdx, currentModelo, fetchAbas, carregarAba, processar } = useCalendarData();

  const [abas, setAbas] = useState([]);
  const [serie, setSerie] = useState("");
  const [turmaSelecionada, setTurmaSelecionada] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [mesIdx, setMesIdx] = useState(0);
  const [maxWeeks, setMaxWeeks] = useState(12);
  const [diaSelecionado, setDiaSelecionado] = useState(null);

  useEffect(() => {
    let ativo = true;
    if (!disc) { setError(true); setLoading(false); return; }
    setLoading(true); setError(false);
    fetchAbas(disc, ano, disciplinaKey, modoConferencia ? [] : unidadesUsuario)
      .then((lista) => {
        if (!ativo) return;
        if (!lista || !lista.length) throw new Error("Sem abas");
        setAbas(lista);
      })
      .catch((err) => {
        if (!ativo) return;
        console.error("Erro ao buscar abas:", err);
        setError(true); setLoading(false);
      });
    return () => { ativo = false; };
  }, [disc, ano, disciplinaKey, fetchAbas, modoConferencia, unidadesUsuario]);

  const opcoesProfessor = useMemo(() => {
    if (!user || !abas.length) return [];
    const mapa = parseTurmasPorUnidade(user.turmas || "");
    const unidadesUsuario = obterUnidadesUsuario(user.unidade);
    const unidadesPermitidas = new Set(unidadesUsuario.map(normalizarUnidade));
    const unidadesInativas = new Set((Array.isArray(user.unidadesInativas) ? user.unidadesInativas : []).map(normalizarUnidade));
    const resultado = [];
    Object.entries(mapa).forEach(([unidade, turmas]) => {
      const unidadeNormalizada = normalizarUnidade(unidade);
      if (unidadesPermitidas.size > 0 && !unidadesPermitidas.has(unidadeNormalizada)) return;
      if (unidadesInativas.has(unidadeNormalizada)) return;
      const turmasInativas = obterTurmasInativas(unidade, user.turmasInativas);
      turmas.forEach((nomeTurma) => {
        if (turmasInativas.has(normalizarTurma(nomeTurma))) return;
        const serieTurma = extrairSerieTurma(nomeTurma);
        if (!serieTurma) return;
        const aba = acharAba(abas, serieTurma);
        if (!aba) return;
        if (unidadePreSelecionada && unidadeNormalizada !== normalizarUnidade(unidadePreSelecionada)) return;
        resultado.push({ unidade, turma: nomeTurma, serie: serieTurma, aba });
      });
    });
    return resultado;
  }, [user, abas, unidadePreSelecionada]);

  useEffect(() => {
    if (!abas.length) return;
    if (modoConferencia) {
      setTurmaSelecionada("");
      setSerie((atual) => abas.some((aba) => (aba.id || aba) === atual) ? atual : (abas[0].id || abas[0]));
      return;
    }
    if (turmaPreSelecionada) {
      const opcao = opcoesProfessor.find((o) => normalizarTurma(o.turma) === normalizarTurma(turmaPreSelecionada));
      if (opcao) { setTurmaSelecionada(opcao.turma); setSerie(opcao.aba); return; }
    }
    if (opcoesProfessor.length > 0) {
      const primeira = opcoesProfessor[0];
      setTurmaSelecionada(primeira.turma); setSerie(primeira.aba); return;
    }
    setTurmaSelecionada(""); setSerie(""); setLoading(false);
  }, [abas, opcoesProfessor, turmaPreSelecionada, modoConferencia]);

  useEffect(() => {
    if (!serie || !disc || error) return;
    let ativo = true;
    setLoading(true); setDiaSelecionado(null); setMaxWeeks(12);
    carregarAba(ano, disciplinaKey, serie, disc, modoConferencia ? [] : unidadesUsuario)
      .then((rows) => {
        if (!ativo) return;
        if (!rows) throw new Error("Sem dados");
        processar(rows);
      })
      .catch((err) => {
        if (!ativo) return;
        console.error("Erro ao carregar aba:", err);
        setError(true); processar([]);
      })
      .finally(() => { if (ativo) setLoading(false); });
    return () => { ativo = false; };
  }, [serie, ano, disciplinaKey, disc, carregarAba, processar, error, modoConferencia, unidadesUsuario]);

  const meses = useMemo(() => {
    if (!currentWeeks.length) return [{ y: 0, m: -1, rotulo: "Todas" }];
    const set = new Map();
    let anoRef = parseInt(ano, 10);
    let ant = null;
    currentWeeks.forEach((w) => {
      const d = parseData(w.periodo, anoRef);
      if (d && ant && d < ant) anoRef++;
      if (d) ant = d;
      w.datas = d ? [0, 1, 2, 3, 4, 5].map((k) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + k)) : null;
    });
    currentWeeks.forEach((w) => {
      if (!w.datas) return;
      w.datas.slice(0, 5).forEach((d) => {
        const k = d.getFullYear() * 12 + d.getMonth();
        if (!set.has(k)) set.set(k, { y: d.getFullYear(), m: d.getMonth() });
      });
    });
    return [...set.values()].sort((a, b) => a.y * 12 + a.m - (b.y * 12 + b.m)).map((v) => ({ ...v, rotulo: NOMES_MES[v.m] }));
  }, [currentWeeks, ano]);

  useEffect(() => {
    if (currentWeeks.length > 0 && meses.length > 0) {
      const hoje = new Date();
      const idxHoje = meses.findIndex((m) => m.y === hoje.getFullYear() && m.m === hoje.getMonth());
      if (idxHoje !== -1) setMesIdx(idxHoje);
    }
  }, [currentWeeks, meses]);

  const opcaoSelecionada = useMemo(() => {
    return opcoesProfessor.find((o) => normalizarTurma(o.turma) === normalizarTurma(turmaSelecionada) && o.aba === serie) || opcoesProfessor.find((o) => o.aba === serie) || null;
  }, [opcoesProfessor, turmaSelecionada, serie]);

  const unidadeAtiva = unidadePreSelecionada || opcaoSelecionada?.unidade || "";
  const guiaSelecionada = abas.find((aba) => (aba.id || aba) === serie);

  const listaTurmasParaCheck = useMemo(() => {
    return opcoesProfessor.filter((o) => !unidadeAtiva || normalizarUnidade(o.unidade) === normalizarUnidade(unidadeAtiva)).map((o) => o.turma);
  }, [opcoesProfessor, unidadeAtiva]);

  const nomeParaOProperty = turmaSelecionada || (opcaoSelecionada ? opcaoSelecionada.turma : (guiaSelecionada?.rotulo || serie));

  async function handleCheck({ semanaIdx, diaNome, aulaIndex, tipo, justificativa, observacao, turmasParaAplicar }) {
    if (!user) return;
    if (!unidadeAtiva) { alert("Não foi possível identificar a unidade desta turma."); return; }
    const turmasValidas = (turmasParaAplicar || []).filter((turma) => listaTurmasParaCheck.some((item) => normalizarTurma(item) === normalizarTurma(turma)));
    if (!turmasValidas.length) { alert("Nenhuma turma ativa disponível para registrar."); return; }
    const payload = { uid: user.uid, email: user.email, disciplina: disciplinaKey, serie, unidade: unidadeAtiva, turmasParaAplicar: turmasValidas, semanaIdx, diaNome, aulaIndex, tipo, justificativa, observacao };
    const chavesNovas = turmasValidas.map((turma) => gerarIdCheck({ disciplina: disciplinaKey, serie: turma, semanaIdx, diaNome, aulaIndex }));
    setChecksSet((prev) => new Set([...prev, ...chavesNovas]));
    try {
      await salvarCheck(payload);
    } catch (err) {
      console.error("Erro ao salvar check:", err);
      setChecksSet((prev) => { const novo = new Set(prev); chavesNovas.forEach((chave) => novo.delete(chave)); return novo; });
      alert("Não foi possível registrar o check. Tente novamente.");
    }
  }

  if (error) return <CalendarError onBack={onBack} />;

  const semSegmentoDisponivel = Boolean(user && !modoConferencia && opcoesProfessor.length === 0 && abas.length > 0);
  const isReady = !loading && (currentWeeks.length > 0 || semSegmentoDisponivel || modoConferencia || Boolean(user && opcoesProfessor.length > 0));

  const mostrarSeletor = (() => {
    if (modoConferencia) return abas.length > 0;
    if (!user) return abas.length > 1;
    if (turmaPreSelecionada) return false;
    return opcoesProfessor.length > 1;
  })();

  const unicaOpcao = opcoesProfessor.length === 1 ? opcoesProfessor[0] : null;

  return (
    <div className="min-h-screen bg-[#F1F2F4] flex flex-col font-sans relative overflow-hidden">
      {!isReady && <Loading texto="Carregando calendário..." />}

      <div className={isReady ? "block" : "opacity-0 pointer-events-none"}>
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
          modoConferencia={modoConferencia}
        />

        {erroCalendario && <div role="status" className="mx-6 mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-900">Não foi possível carregar os calendários do Firestore. Verifique se as regras de calendários foram publicadas no Firebase.</div>}

        {user && opcoesProfessor.length === 0 && !modoConferencia && (abas.length ? <div className="mx-auto mt-6 max-w-3xl rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm font-semibold text-amber-900">Nenhum segmento desta planilha corresponde às suas turmas ativas. O calendário não carregará outra guia por engano.</div> : <CalendarAlert />)}
        {!currentWeeks.length && !loading && (modoConferencia
          ? <div className="mx-auto mt-6 max-w-3xl rounded-2xl border border-gray-200 bg-white p-5 text-sm font-semibold text-gray-600">Selecione uma guia para conferir os dados do calendário.</div>
          : user && opcoesProfessor.length > 0 && <div className="mx-auto mt-6 max-w-3xl rounded-2xl border border-gray-200 bg-white p-5 text-sm font-semibold text-gray-600">Esta guia não contém semanas de calendário reconhecidas.</div>)}

        <div className="flex-1 grid lg:grid-cols-[1.3fr_1fr] gap-8 max-w-[1400px] mx-auto p-6 pt-15 w-full items-start relative z-10">
          
          <div className="flex flex-col gap-6">
            <div className="flex flex-col items-start pb-2">
              <h1 className="text-[40px] sm:text-[56px] font-black tracking-[-0.04em] leading-[0.9] text-[#111111] uppercase transform -rotate-1">
                Calendário
              </h1>
              <h2 className="text-[40px] sm:text-[56px] font-black tracking-[-0.04em] leading-[0.9] uppercase transform rotate-1 mt-2 ml-2">
                <span className="bg-pensi-yellow px-3 py-1 inline-block text-[#111111]">
                  Escolar.
                </span>
              </h2>
            </div>

            <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-6">
              <CalendarGrid
                weeks={currentWeeks}
                mesSelecionado={meses[mesIdx]}
                diaSelecionado={diaSelecionado}
                onDayClick={(weekIdx, diaIdx) => setDiaSelecionado({ weekIdx, diaIdx })}
                isDiaLetivo={isDiaLetivo}
                turmaSelecionada={turmaSelecionada || nomeParaOProperty}
                serie={serie}
                unidadeSelecionada={unidadeAtiva}
                maxWeeks={maxWeeks}
                onLoadMore={() => setMaxWeeks((atual) => atual + 12)}
              />
            </div>
          </div>

          <aside className="sticky top-28 max-h-[calc(100vh-8rem)] overflow-y-auto">
            <CalendarDetailPanel
              semData={diaSelecionado ? currentWeeks[diaSelecionado.weekIdx] : null}
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
              unidadeSelecionada={unidadeAtiva}
              isDiaLetivo={isDiaLetivo}
              turmaSelecionada={turmaSelecionada || nomeParaOProperty}
              serie={serie}
              podeRegistrarChecks={Boolean(user && !modoConferencia && opcoesProfessor.length > 0)}
            />
          </aside>
        </div>
      </div>
    </div>
  );
}
