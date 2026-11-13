import { useEffect, useState, useMemo } from "react";
import { useAuth } from "../hooks/useAuth";
import { useCalendarData } from "../hooks/useCalendarData";
import { useCalendario } from "../hooks/useCalendario"; // IMPORTANDO O HOOK DE FERIADOS
import { DISCIPLINAS_POR_ANO } from "../data/disciplinas";
import { TURMAS } from "../data/turmas";
import { NOMES_MES } from "../utils/formatters";
import { salvarCheck, gerarIdCheck } from "../services/firestoreChecks";
import Calendar from "../components/Calendar";
import DetailPanel from "../components/DetailPanel";
import Loading from "../components/Loading";
import { ChevronLeft, ChevronRight, ArrowLeft, WifiOff } from "lucide-react";
import { parseTurmasPorUnidade, chaveTurma } from "../utils/turmas";

function normalizar(s) {
  return String(s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

function extrairBase(serie) {
  let s = normalizar(serie);
  const ordinais = { "sexto": "6", "setimo": "7", "oitavo": "8", "nono": "9", "primeiro": "1", "segundo": "2", "terceiro": "3" };
  Object.keys(ordinais).forEach((palavra) => {
    if (s.includes(palavra)) s = s.replace(palavra, ordinais[palavra]);
  });
  const match = s.match(/(\d+)\s*(ano|serie|efaf|em)/);
  if (match) return `${match[1]} ${match[2]}`;
  if (s === "em" || s.includes(" ensino medio")) return "em";
  if (s.includes("medicina")) return "medicina";
  return s;
}

function acharAba(abas, serieDaTurma) {
  if (!abas?.length) return null;
  const baseTurma = extrairBase(serieDaTurma);
  return abas.find((aba) => extrairBase(aba) === baseTurma) || null;
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

export default function CalendarPage({
  disciplinaKey, ano, onBack, unidadePreSelecionada, turmaPreSelecionada
}) {
  const { user, checksSet, setChecksSet } = useAuth();
  const disc = DISCIPLINAS_POR_ANO[ano]?.[disciplinaKey];
  const { isDiaLetivo } = useCalendario(); // HOOK DE FERIADOS

  const {
    currentWeeks, currentAulas, currentCaps, currentSemanas, currentAulaIdx, currentModelo,
    fetchAbas, carregarAba, processar,
  } = useCalendarData();

  const [abas, setAbas] = useState([]);
  const [serie, setSerie] = useState("");
  const [turmaSelecionada, setTurmaSelecionada] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [mesIdx, setMesIdx] = useState(0);
  const [diaSelecionado, setDiaSelecionado] = useState(null);

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
        if (!lista || !lista.length) throw new Error("Sem abas");
        setAbas(lista);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, [disciplinaKey, ano]);

  const opcoesProfessor = useMemo(() => {
    if (!user || !abas.length) return [];

    const mapa = parseTurmasPorUnidade(user.turmas || "");
    const inativasU = new Set(user.unidadesInativas || []);
    const inativasT = new Set(user.turmasInativas || []);

    const turmasPorUnidade = {};
    Object.entries(mapa).forEach(([uni, turmas]) => {
      if (inativasU.has(uni)) return; 
      const ativas = turmas.filter((t) => !inativasT.has(chaveTurma(uni, t)));
      if (ativas.length > 0) turmasPorUnidade[uni] = ativas;
    });

    let turmasParaExibir;
    if (unidadePreSelecionada) {
      turmasParaExibir = turmasPorUnidade[unidadePreSelecionada] || [];
    } else {
      turmasParaExibir = Object.values(turmasPorUnidade).flat();
    }

    return turmasParaExibir
      .map((nomeTurma) => {
        const tInfo = TURMAS.find((x) => x.turma === nomeTurma);
        if (!tInfo) return null;
        const aba = acharAba(abas, tInfo.serie);
        return aba ? { turma: tInfo.turma, serie: tInfo.serie, aba } : null;
      })
      .filter(Boolean);
  }, [user, abas, unidadePreSelecionada]);

  useEffect(() => {
    if (!abas.length) return;
    if (turmaPreSelecionada) {
      const opcao = opcoesProfessor.find((o) => o.turma === turmaPreSelecionada);
      if (opcao) { setTurmaSelecionada(opcao.turma); setSerie(opcao.aba); return; }
    }
    if (user && opcoesProfessor.length > 0) {
      const primeira = opcoesProfessor[0];
      setTurmaSelecionada(primeira.turma); setSerie(primeira.aba); return;
    }
    if (opcoesProfessor.length === 0 && abas.length > 0) {
      setSerie(abas[0]);
      setTurmaSelecionada("");
    }
  }, [abas, opcoesProfessor, user, turmaPreSelecionada]);

  useEffect(() => {
    if (!serie || !disc || error) return;
    setLoading(true);
    carregarAba(ano, disciplinaKey, serie)
      .then((rows) => { if (!rows) throw new Error("Sem dados"); processar(rows); })
      .catch(() => { setError(true); processar([]); })
      .finally(() => setLoading(false));
    setDiaSelecionado(null);
  }, [serie, ano, disciplinaKey, error]);

  const meses = useMemo(() => {
    if (!currentWeeks.length) return [{ y: 0, m: -1, rotulo: "Todas" }];
    const set = new Map();
    let anoRef = parseInt(ano, 10), ant = null;
    currentWeeks.forEach((w) => {
      const d = parseData(w.periodo, anoRef);
      if (d && ant && d < ant) { anoRef++; }
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
    return [...set.values()].sort((a, b) => (a.y * 12 + a.m) - (b.y * 12 + b.m))
      .map((v) => ({ ...v, rotulo: NOMES_MES[v.m] }));
  }, [currentWeeks, ano]);

  useEffect(() => {
    if (currentWeeks.length > 0 && meses.length > 0) {
      const hoje = new Date();
      const idxHoje = meses.findIndex((m) => m.y === hoje.getFullYear() && m.m === hoje.getMonth());
      if (idxHoje !== -1) setMesIdx(idxHoje);
    }
  }, [currentWeeks]);

  async function handleCheck({ semanaIdx, diaNome, aulaIndex, tipo, justificativa, observacao, turmasParaAplicar }) {
    if (!user) return;

    const unidadeDoCard = unidadePreSelecionada || "Sem unidade";

    const payload = {
      uid: user.uid,
      email: user.email,
      disciplina: disciplinaKey,
      serie,
      unidade: unidadeDoCard,
      turmasParaAplicar,
      semanaIdx, diaNome, aulaIndex, tipo, justificativa, observacao,
    };

    const chavesNovas = turmasParaAplicar.map((turma) => gerarIdCheck({
      disciplina: disciplinaKey, serie: turma, semanaIdx, diaNome, aulaIndex
    }));
    setChecksSet((prev) => new Set([...prev, ...chavesNovas]));

    try {
      await salvarCheck(payload);
    } catch (err) {
      console.error("Erro ao salvar check:", err);
      setChecksSet((prev) => {
        const novo = new Set(prev);
        chavesNovas.forEach((c) => novo.delete(c));
        return novo;
      });
      alert("Não foi possível registrar o check. Tente novamente.");
    }
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#e6e8eb] flex flex-col items-center justify-center p-6 relative overflow-hidden">
        <div className="relative z-10 bg-white border-[3px] border-black rounded-2xl shadow-[8px_8px_0px_0px_#000] max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 bg-red-100 border-[2px] border-red-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[3px_3px_0px_0px_#ef4444]">
            <WifiOff className="w-8 h-8 text-red-600" strokeWidth={2.5} />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Não foi possível carregar.</h2>
          <p className="text-sm text-gray-600 font-medium mb-8">Ocorreu um erro ao buscar os dados.</p>
          <button onClick={onBack} className="w-full flex items-center justify-center gap-2 bg-pensi-yellow text-black border-[2px] border-black rounded-lg px-5 py-3 font-semibold shadow-[3px_3px_0px_0px_#000] hover:bg-[#ffdb4d] transition-all">
            <ArrowLeft className="w-4 h-4" strokeWidth={2.5} /> Voltar para o início
          </button>
        </div>
      </div>
    );
  }

  const isReady = !loading && currentWeeks.length > 0;
  const mostrarSeletor = (() => {
    if (!user) return abas.length > 1;
    if (turmaPreSelecionada) return false;
    return opcoesProfessor.length > 1;
  })();

  const unicaOpcao = opcoesProfessor.length === 1 ? opcoesProfessor[0] : null;
  const nomeParaOProperty = turmaSelecionada || (unicaOpcao ? unicaOpcao.turma : serie);
  const listaTurmasParaCheck = opcoesProfessor.map((o) => o.turma);

  return (
    <div className="min-h-screen bg-[#e6e8eb] flex flex-col font-sans relative overflow-hidden">
      {!isReady && <Loading texto="Carregando calendário..." />}

      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[10%] left-[-5%] w-[600px] h-[600px] bg-pensi-yellow/8 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-blue-400/10 rounded-full blur-[120px]"></div>
        <div className="absolute top-[40%] left-[30%] w-[500px] h-[500px] bg-purple-300/8 rounded-full blur-[120px]"></div>
      </div>

      <div className={isReady ? "block" : "opacity-0 pointer-events-none"}>
        <div className="bg-white/40 backdrop-blur-2xl border-b-[2px] border-white/50 px-6 py-4 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-40 shadow-sm">
          <button onClick={onBack} className="flex items-center gap-2 bg-pensi-yellow text-black border-[2px] border-black rounded-lg px-4 py-2 font-medium text-sm shadow-[3px_3px_0px_0px_#000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all">
            <ArrowLeft className="w-4 h-4" strokeWidth={2.5} /> Voltar
          </button>

          <div className="flex items-center gap-3">
            <button className="w-10 h-10 rounded-lg bg-white/60 backdrop-blur-sm border-[2px] border-black shadow-[3px_3px_0px_0px_#000] flex items-center justify-center hover:bg-pensi-yellow active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all" onClick={() => setMesIdx((i) => Math.max(0, i - 1))}>
              <ChevronLeft className="w-5 h-5 text-black" strokeWidth={2.5} />
            </button>
            <div className="bg-pensi-yellow border-[2px] border-black rounded-lg px-4 py-2 shadow-[3px_3px_0px_0px_#000]">
              <select value={mesIdx} onChange={(e) => setMesIdx(parseInt(e.target.value, 10))} className="bg-transparent font-medium text-black text-sm uppercase tracking-wider focus:outline-none cursor-pointer">
                {meses.map((m, i) => <option key={i} value={i}>{m.rotulo}</option>)}
              </select>
            </div>
            <button className="w-10 h-10 rounded-lg bg-white/60 backdrop-blur-sm border-[2px] border-black shadow-[3px_3px_0px_0px_#000] flex items-center justify-center hover:bg-pensi-yellow active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all" onClick={() => setMesIdx((i) => Math.min(meses.length - 1, i + 1))}>
              <ChevronRight className="w-5 h-5 text-black" strokeWidth={2.5} />
            </button>
          </div>

          <div className="flex items-center gap-2">
            {mostrarSeletor && (
              <div className="bg-white/60 backdrop-blur-sm border-[2px] border-black rounded-lg shadow-[3px_3px_0px_0px_#000] px-3 py-2">
                <select
                  value={user ? turmaSelecionada : serie}
                  onChange={(e) => {
                    if (user) {
                      const turma = e.target.value;
                      const opcao = opcoesProfessor.find((o) => o.turma === turma);
                      setTurmaSelecionada(turma);
                      if (opcao) setSerie(opcao.aba);
                    } else { setSerie(e.target.value); }
                  }}
                  className="bg-transparent font-medium text-black text-sm focus:outline-none cursor-pointer"
                >
                  {user ? opcoesProfessor.map((o) => <option key={o.turma} value={o.turma}>{o.serie} - {o.turma}</option>) : abas.map((a) => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
            )}
            {!mostrarSeletor && user && (turmaPreSelecionada || unicaOpcao) && (
              <div className="bg-pensi-yellow border-[2px] border-black rounded-lg px-3 py-2 text-[11px] font-black uppercase tracking-wider text-black shadow-[2px_2px_0px_0px_#000]">
                {turmaPreSelecionada ? (opcoesProfessor.find((o) => o.turma === turmaPreSelecionada)?.serie || "") + " - " + turmaPreSelecionada : `${unicaOpcao?.serie} - ${unicaOpcao?.turma}`}
              </div>
            )}
          </div>
        </div>

        {user && opcoesProfessor.length === 0 && (
          <div className="max-w-[1400px] mx-auto mt-6 px-6">
            <div className="bg-orange-50 border-2 border-orange-400 rounded-xl p-4 text-center shadow-[3px_3px_0px_0px_#f97316]">
              <p className="text-sm font-black text-orange-800 uppercase tracking-wide">
                Nenhuma turma ativa nesta unidade
              </p>
              <p className="text-[11px] text-orange-700 mt-1">
                A coordenação desativou as turmas desta unidade. Você pode visualizar o calendário, mas não pode registrar checks.
              </p>
            </div>
          </div>
        )}

        <div className="flex-1 grid md:grid-cols-[1.3fr_1fr] gap-8 max-w-[1400px] mx-auto p-6 w-full items-start relative z-10">
          <div className="bg-white/50 backdrop-blur-2xl border-[3px] border-black rounded-2xl shadow-[6px_6px_0px_0px_#000] p-6">
            <Calendar
              weeks={currentWeeks}
              mesSelecionado={meses[mesIdx]}
              diaSelecionado={diaSelecionado}
              onDayClick={(weekIdx, diaIdx) => setDiaSelecionado({ weekIdx, diaIdx })}
              checksSet={checksSet}
              disciplinaAtualKey={disciplinaKey}
              currentSheetName={nomeParaOProperty}
              isDiaLetivo={isDiaLetivo}
              turmaSelecionada={turmaSelecionada || nomeParaOProperty}
              serie={serie}
            />
          </div>

          <aside className="bg-white/50 backdrop-blur-2xl border-[3px] border-black rounded-2xl shadow-[6px_6px_0px_0px_#000] sticky top-6 max-h-[calc(100vh-3rem)] overflow-y-auto">
            <DetailPanel
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
              unidadeSelecionada={unidadePreSelecionada}
            />
          </aside>
        </div>
      </div>
    </div>
  );
}