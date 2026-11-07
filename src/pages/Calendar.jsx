import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useCalendarData } from "../hooks/useCalendarData";
import { DISCIPLINAS_POR_ANO } from "../data/disciplinas";
import { NOMES_MES, chaveCheck } from "../utils/formatters";
import { postCheck } from "../services/api";
import Calendar from "../components/Calendar";
import DetailPanel from "../components/DetailPanel";
import Loading from "../components/Loading";
import { ChevronLeft, ChevronRight, ArrowLeft, WifiOff } from "lucide-react";

export default function CalendarPage({ disciplinaKey, ano, onBack }) {
  const { user, checksSet, setChecksSet } = useAuth();
  const disc = DISCIPLINAS_POR_ANO[ano]?.[disciplinaKey];

  const {
    currentWeeks, currentAulas, currentCaps, currentSemanas, currentAulaIdx, currentModelo,
    fetchAbas, carregarAba, processar,
  } = useCalendarData();

  const [abas, setAbas] = useState([]);
  const [serie, setSerie] = useState("");
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
        setSerie(lista[0]);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, [disciplinaKey, ano]);

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
      .finally(() => {
        setLoading(false);
      });
      
    setDiaSelecionado(null);
  }, [serie, ano, disciplinaKey, error]);

  const meses = (() => {
    if (!currentWeeks.length) return [{ y: 0, m: -1, rotulo: "Todas" }];
    const set = new Map();
    let anoRef = parseInt(ano, 10), ant = null;
    currentWeeks.forEach((w) => {
      const d = parseData(w.periodo, anoRef);
      if (d && ant && d < ant) { anoRef++; }
      if (d) ant = d;
      w.datas = d ? [0,1,2,3,4,5].map((k) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + k)) : null;
    });
    currentWeeks.forEach((w) => {
      if (!w.datas) return;
      w.datas.slice(0,5).forEach((d) => {
        const k = d.getFullYear() * 12 + d.getMonth();
        if (!set.has(k)) set.set(k, { y: d.getFullYear(), m: d.getMonth() });
      });
    });
    return [...set.values()].sort((a,b) => (a.y*12+a.m) - (b.y*12+b.m))
      .map((v) => ({ ...v, rotulo: NOMES_MES[v.m] }));
  })();

  // EFEITO PARA ABRIR NO MÊS ATUAL
  useEffect(() => {
    if (currentWeeks.length > 0 && meses.length > 0) {
      const hoje = new Date();
      const idxHoje = meses.findIndex(m => m.y === hoje.getFullYear() && m.m === hoje.getMonth());
      if (idxHoje !== -1) {
        setMesIdx(idxHoje);
      }
    }
  }, [currentWeeks]);

  async function handleCheck({ semana, dia, aulaIndex }) {
    if (!user) return;
    const payload = { disciplina: disciplinaKey, serie, semana, dia, aulaIndex };
    const chave = chaveCheck(payload);
    setChecksSet(new Set([...checksSet, chave]));
    try {
      await postCheck({
        tipo: "check",
        professorEmail: user.email,
        ...payload,
        status: "Concluído",
        dataHora: new Date().toISOString(),
      });
    } catch {
      const novo = new Set(checksSet); novo.delete(chave);
      setChecksSet(novo);
      alert("Não foi possível registrar o check.");
    }
  }

  // TELA DE ERRO
  if (error) {
    return (
      <div className="min-h-screen bg-[#e6e8eb] flex flex-col items-center justify-center p-6 relative overflow-hidden">
        <div className="relative z-10 bg-white border-[3px] border-black rounded-2xl shadow-[8px_8px_0px_0px_#000] max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 bg-red-100 border-[2px] border-red-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[3px_3px_0px_0px_#ef4444]">
            <WifiOff className="w-8 h-8 text-red-600" strokeWidth={2.5} />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Não foi possível carregar.</h2>
          <p className="text-sm text-gray-600 font-medium mb-8">
            Ocorreu um erro ao buscar os dados. Verifique sua conexão com a internet e tente novamente.
          </p>
          <button 
            onClick={onBack}
            className="w-full flex items-center justify-center gap-2 bg-pensi-yellow text-black border-[2px] border-black rounded-lg px-5 py-3 font-semibold shadow-[3px_3px_0px_0px_#000] hover:bg-[#ffdb4d] transition-all"
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={2.5} />
            Voltar para o início
          </button>
        </div>
      </div>
    );
  }

  // Condição para exibir o conteúdo (só se não estiver carregando e tiver semanas)
  const isReady = !loading && currentWeeks.length > 0;

  return (
    <div className="min-h-screen bg-[#e6e8eb] flex flex-col font-sans relative overflow-hidden">
      
      {/* LOADING SOBREPOSTO */}
      {!isReady && <Loading texto="Carregando calendário..." />}

      {/* BLOBS DE FUNDO */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[10%] left-[-5%] w-[600px] h-[600px] bg-pensi-yellow/8 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-blue-400/10 rounded-full blur-[120px]"></div>
        <div className="absolute top-[40%] left-[30%] w-[500px] h-[500px] bg-purple-300/8 rounded-full blur-[120px]"></div>
      </div>

      {/* CONTEÚDO */}
      <div className={isReady ? "block" : "opacity-0 pointer-events-none"}>
        
        {/* BARRA SUPERIOR */}
        <div className="bg-white/40 backdrop-blur-2xl border-b-[2px] border-white/50 px-6 py-4 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-40 shadow-sm">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 bg-pensi-yellow text-black border-[2px] border-black rounded-lg px-4 py-2 font-medium text-sm shadow-[3px_3px_0px_0px_#000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={2.5} />
            Voltar
          </button>

          <div className="flex items-center gap-3">
            <button 
              className="w-10 h-10 rounded-lg bg-white/60 backdrop-blur-sm border-[2px] border-black shadow-[3px_3px_0px_0px_#000] flex items-center justify-center hover:bg-pensi-yellow active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all"
              onClick={() => setMesIdx((i) => Math.max(0, i - 1))}
            >
              <ChevronLeft className="w-5 h-5 text-black" strokeWidth={2.5} />
            </button>
            
            <div className="bg-pensi-yellow border-[2px] border-black rounded-lg px-4 py-2 shadow-[3px_3px_0px_0px_#000]">
              <select
                value={mesIdx}
                onChange={(e) => setMesIdx(parseInt(e.target.value, 10))}
                className="bg-transparent font-medium text-black text-sm uppercase tracking-wider focus:outline-none cursor-pointer"
              >
                {meses.map((m, i) => <option key={i} value={i}>{m.rotulo}</option>)}
              </select>
            </div>
            
            <button 
              className="w-10 h-10 rounded-lg bg-white/60 backdrop-blur-sm border-[2px] border-black shadow-[3px_3px_0px_0px_#000] flex items-center justify-center hover:bg-pensi-yellow active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all"
              onClick={() => setMesIdx((i) => Math.min(meses.length - 1, i + 1))}
            >
              <ChevronRight className="w-5 h-5 text-black" strokeWidth={2.5} />
            </button>
          </div>

          <div className="bg-white/60 backdrop-blur-sm border-[2px] border-black rounded-lg shadow-[3px_3px_0px_0px_#000] px-3 py-2">
            <select
              value={serie}
              onChange={(e) => setSerie(e.target.value)}
              className="bg-transparent font-medium text-black text-sm focus:outline-none cursor-pointer"
            >
              {abas.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
        </div>

        {/* CONTEÚDO DIVIDIDO */}
        <div className="flex-1 grid md:grid-cols-[1.3fr_1fr] gap-8 max-w-[1400px] mx-auto p-6 w-full items-start relative z-10">
          
          <div className="bg-white/50 backdrop-blur-2xl border-[3px] border-black rounded-2xl shadow-[6px_6px_0px_0px_#000] p-6">
            <Calendar
              weeks={currentWeeks}
              mesSelecionado={meses[mesIdx]}
              diaSelecionado={diaSelecionado}
              onDayClick={(weekIdx, diaIdx) => setDiaSelecionado({ weekIdx, diaIdx })}
            />
          </div>

          <aside className="bg-white/50 backdrop-blur-2xl border-[3px] border-black rounded-2xl shadow-[6px_6px_0px_0px_#000] sticky top-6 max-h-[calc(100vh-3rem)] overflow-y-auto">
            <DetailPanel
              semData={diaSelecionado ? currentWeeks[diaSelecionado.weekIdx] : null}
              diaIdx={diaSelecionado?.diaIdx}
              weekIdx={diaSelecionado?.weekIdx}
              currentModelo={currentModelo}
              currentAulas={currentAulas}
              currentCaps={currentCaps}
              currentSemanas={currentSemanas}
              currentAulaIdx={currentAulaIdx}
              checksSet={checksSet}
              onCheck={handleCheck}
              disciplinaAtualKey={disciplinaKey}
              currentSheetName={serie}
            />
          </aside>
        </div>
      </div>
    </div>
  );
}

function parseData(periodo, ano) {
  const t = String(periodo || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  let m = t.match(/(\d{1,2})\s*[\/.-]\s*([a-z]{3})/);
  if (m) {
    const mes = ["jan","fev","mar","abr","mai","jun","jul","ago","set","out","nov","dez"].indexOf(m[2]);
    return mes < 0 ? null : new Date(ano, mes, parseInt(m[1], 10));
  }
  m = t.match(/(\d{1,2})\s*[\/.-]\s*(\d{1,2})/);
  if (m) {
    const mes = parseInt(m[2], 10) - 1;
    return mes < 0 || mes > 11 ? null : new Date(ano, mes, parseInt(m[1], 10));
  }
  return null;
}