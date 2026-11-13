import { useState, useMemo, useEffect } from "react";
import { collection, getDocs, query, limit } from "firebase/firestore";
import { db } from "../../services/firebase";
import { UNIDADES, getRegionalDaUnidade } from "../../data/unidades";
import {
  Filter, CheckCircle2, Clock, MapPin, TrendingUp, ChevronDown, ChevronUp,
  Building2, History, Activity, BarChart3, AlertCircle, X, Loader2,
} from "lucide-react";

const REGIONAIS_LIST = ["Todas", "Beatriz", "Débora", "Paula"];
const PERIODOS_LIST = [
  { id: "geral", label: "Geral" },
  { id: "mes", label: "Mês" },
  { id: "hoje", label: "Hoje" },
];

export default function AdminOverview({ unidadeFoco, unidadesEscopo }) {
  const [filtroRegional, setFiltroRegional] = useState("Todas");
  const [filtroUnidade, setFiltroUnidade] = useState("Todas");
  const [filtroPeriodo, setFiltroPeriodo] = useState("geral");
  const [mostrarEstatisticas, setMostrarEstatisticas] = useState(false);
  const [cardExpandido, setCardExpandido] = useState(null);

  // [MUDOU] estado de dados reais
  const [checks, setChecks] = useState([]);
  const [carregando, setCarregando] = useState(true);

  const isDiretor = Boolean(unidadeFoco);
  // [MUDOU] regional = escopo por array
  const isRegional = Array.isArray(unidadesEscopo) && unidadesEscopo.length > 0;

  // [MUDOU] busca checks do Firestore
  useEffect(() => {
    let cancelado = false;
    async function carregar() {
      try {
        const snap = await getDocs(query(collection(db, "checks"), limit(500)));
        if (cancelado) return;
        const lista = [];
        snap.forEach((d) => {
          const data = d.data();
          const dataHora = data.dataHora ? new Date(data.dataHora) : (data.criadoEm?.toDate?.() || null);
          lista.push({
            id: d.id,
            tipo: data.tipo || "aula",
            status: data.status || "pendente",
            unidade: data.unidade || "",
            dataHora,
          });
        });
        setChecks(lista);
      } catch (e) {
        console.error("Erro ao carregar checks:", e);
      } finally {
        if (!cancelado) setCarregando(false);
      }
    }
    carregar();
    return () => { cancelado = true; };
  }, []);

  // [MUDOU] agregação dos dados reais no formato que o layout espera
  const dadosFiltrados = useMemo(() => {
    let unidadesAlvo = UNIDADES.slice(1);

    if (isDiretor) {
      unidadesAlvo = unidadesAlvo.filter((u) => u === unidadeFoco);
    } else if (isRegional) {
      unidadesAlvo = unidadesAlvo.filter((u) => unidadesEscopo.includes(u));
    } else {
      if (filtroRegional !== "Todas") {
        unidadesAlvo = unidadesAlvo.filter((u) => getRegionalDaUnidade(u) === filtroRegional);
      }
      if (filtroUnidade !== "Todas") {
        unidadesAlvo = unidadesAlvo.filter((u) => u === filtroUnidade);
      }
    }

    const agora = new Date();
    agora.setHours(0, 0, 0, 0);
    const inicioMes = new Date(agora.getFullYear(), agora.getMonth(), 1);

    function dentroDoPeriodo(d) {
      if (!d) return false;
      if (filtroPeriodo === "hoje") return d >= agora;
      if (filtroPeriodo === "mes") return d >= inicioMes;
      return true;
    }

    const total = { concluidas: 0, pendentes: 0, justificadas: 0 };
    const porUnidade = [];

    unidadesAlvo.forEach((u) => {
      const checksDaUnidade = checks.filter(
        (c) => c.unidade === u && dentroDoPeriodo(c.dataHora)
      );
      const c = checksDaUnidade.filter((x) => x.status === "realizado" || x.tipo === "aula").length;
      const p = checksDaUnidade.filter((x) => x.status === "pendente").length;
      const j = checksDaUnidade.filter((x) => x.tipo === "justificativa").length;

      total.concluidas += c;
      total.pendentes += p;
      total.justificadas += j;

      if (c > 0 || p > 0 || j > 0) {
        porUnidade.push({ nome: u, regional: getRegionalDaUnidade(u), c, p, j });
      }
    });

    return { total, porUnidade };
  }, [checks, filtroRegional, filtroUnidade, filtroPeriodo, isDiretor, isRegional, unidadeFoco, unidadesEscopo]);

  const totalGeral =
    dadosFiltrados.total.concluidas +
    dadosFiltrados.total.pendentes +
    dadosFiltrados.total.justificadas;

  const percentualConcluidas =
    totalGeral > 0
      ? Math.round((dadosFiltrados.total.concluidas / totalGeral) * 100)
      : 0;

  const temFiltrosAtivos =
    !isDiretor && !isRegional &&
    (filtroRegional !== "Todas" || filtroUnidade !== "Todas" || filtroPeriodo !== "geral");

  if (carregando) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400 mb-4" />
        <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Carregando indicadores...</p>
      </div>
    );
  }

  return (
    <div className="w-full min-w-0 pb-10 animate-fade-in">
      <div className="max-w-5xl mx-auto px-1">

        {/* CABEÇALHO */}
        <section className="mb-5">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-1.5 h-1.5 bg-pensi-yellow border border-black rounded-full" />
              <span className="text-[10px] font-black uppercase tracking-[0.22em] text-gray-500">
                {isDiretor
                  ? "Direção / Visão da unidade"
                  : isRegional
                  ? "Regional / Visão das unidades"
                  : "Administração / Visão geral"}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-black tracking-tight leading-none">
              {isDiretor ? unidadeFoco : isRegional ? "Painel regional" : "Painel geral"}
              <span className="text-pensi-yellow">.</span>
            </h1>

            <p className="text-sm text-gray-500 mt-2 max-w-xl leading-relaxed">
              {isDiretor
                ? `Acompanhe os indicadores de aulas da unidade ${unidadeFoco}.`
                : isRegional
                ? `Indicadores das unidades: ${unidadesEscopo.join(", ")}.`
                : "Acompanhamento de aulas e desempenho das unidades."}
            </p>
          </div>
        </section>

        {/* FILTROS */}
        <section className="bg-white border-2 border-black rounded-xl shadow-[3px_3px_0px_#000] p-3 mb-5">
          <div className="flex flex-col xl:flex-row gap-3 items-stretch xl:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-2.5 flex-1 items-stretch sm:items-center">
              {!isDiretor && !isRegional && (
                <>
                  <div className="relative flex-1 min-w-[160px]">
                    <select value={filtroRegional}
                      onChange={(e) => { setFiltroRegional(e.target.value); setFiltroUnidade("Todas"); }}
                      className="w-full h-[38px] bg-gray-50 border-2 border-black rounded-xl px-3 text-[11px] font-bold text-black outline-none focus:bg-pensi-yellow transition-colors cursor-pointer shadow-[2px_2px_0px_#000]">
                      {REGIONAIS_LIST.map((r) => (
                        <option key={r} value={r}>{r === "Todas" ? "Todas as regionais" : `Regional ${r}`}</option>
                      ))}
                    </select>
                  </div>
                  <div className="relative flex-1 min-w-[160px]">
                    <select value={filtroUnidade} onChange={(e) => setFiltroUnidade(e.target.value)}
                      className="w-full h-[38px] bg-gray-50 border-2 border-black rounded-xl px-3 text-[11px] font-bold text-black outline-none focus:bg-pensi-yellow transition-colors cursor-pointer shadow-[2px_2px_0px_#000]">
                      <option value="Todas">Todas as unidades</option>
                      {UNIDADES.slice(1)
                        .filter((u) => filtroRegional === "Todas" || getRegionalDaUnidade(u) === filtroRegional)
                        .map((u) => <option key={u} value={u}>{u}</option>)}
                    </select>
                  </div>
                </>
              )}

              {(isDiretor || isRegional) && (
                <div className="flex items-center gap-1.5 h-[38px] bg-gray-50 border-2 border-black rounded-xl px-3 shadow-[2px_2px_0px_#000] shrink-0">
                  <MapPin className="w-4 h-4 text-black shrink-0" />
                  <span className="text-[11px] font-black uppercase tracking-wider text-black">
                    {isDiretor ? unidadeFoco : `${unidadesEscopo.length} unidade(s)`}
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 h-[38px] bg-gray-50 border-2 border-black rounded-xl px-3 shadow-[2px_2px_0px_#000] shrink-0">
              {PERIODOS_LIST.map((p) => {
                const ativo = filtroPeriodo === p.id;
                return (
                  <button key={p.id} onClick={() => setFiltroPeriodo(p.id)}
                    className="flex items-center gap-1.5 group h-full" aria-pressed={ativo}>
                    <span className={`w-3 h-3 rounded-full border-2 border-black transition-all ${ativo ? "bg-pensi-yellow shadow-[1px_1px_0px_#000] scale-110" : "bg-white group-hover:bg-pensi-yellow/40"}`} />
                    <span className={`text-[10px] font-black uppercase tracking-wider ${ativo ? "text-black" : "text-gray-400"}`}>{p.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {temFiltrosAtivos && (
            <div className="flex justify-end mt-3 pt-3 border-t-2 border-dashed border-gray-200">
              <button onClick={() => { setFiltroRegional("Todas"); setFiltroUnidade("Todas"); setFiltroPeriodo("geral"); }}
                className="text-[10px] font-black uppercase tracking-wider text-gray-500 hover:text-black flex items-center gap-1">
                <X className="w-3.5 h-3.5" /> Limpar filtros ativos
              </button>
            </div>
          )}
        </section>

        {/* INDICADORES PRINCIPAIS */}
        <section className="mb-5">
          <div className="flex items-center gap-1.5 mb-2.5">
            <BarChart3 className="w-4 h-4" />
            <h2 className="text-sm font-black uppercase tracking-wider text-black">Resumo dos indicadores</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            <div className="lg:col-span-2 bg-white border-2 border-black rounded-xl shadow-[3px_3px_0px_#000] overflow-hidden flex flex-col">
              <div className="p-4 flex-1">
                <div className="flex justify-between items-start gap-3">
                  <div>
                    <span className="inline-flex items-center gap-1.5 bg-pensi-yellow border-2 border-black rounded-lg px-2 py-1 text-[9px] font-black uppercase tracking-wider shadow-[2px_2px_0px_#000]">
                      <Activity className="w-3.5 h-3.5" /> Total de aulas
                    </span>
                    <p className="text-5xl font-black text-black tracking-tighter mt-3 leading-none">{totalGeral}</p>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mt-2">Registros no período selecionado</p>
                  </div>
                  <div className="w-10 h-10 shrink-0 bg-gray-100 border-2 border-black rounded-lg flex items-center justify-center shadow-[2px_2px_0px_#000]">
                    <BarChart3 className="w-5 h-5" />
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t-2 border-dashed border-gray-200">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Taxa de conclusão</span>
                    <span className="text-[12px] font-black">{percentualConcluidas}%</span>
                  </div>
                  <div className="h-3 bg-gray-100 border-2 border-black rounded-full overflow-hidden">
                    <div className="h-full bg-green-400 border-r-2 border-black transition-all duration-500" style={{ width: `${percentualConcluidas}%` }} />
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 border-t-2 border-black px-4 py-2.5 flex items-center justify-between gap-2">
                <span className="text-[9px] font-black uppercase tracking-widest text-gray-500">Indicadores consolidados</span>
                <span className="flex items-center gap-1 text-[9px] font-black uppercase text-green-700">
                  <TrendingUp className="w-3.5 h-3.5" /> Dados exibidos
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
              <div className="bg-white border-2 border-black rounded-xl shadow-[3px_3px_0px_#000] overflow-hidden flex flex-col min-h-[120px]">
                <div className="flex-1 flex">
                  <div className="flex-1 bg-green-100 p-3 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <div className="w-8 h-8 bg-white border-2 border-black rounded-lg flex items-center justify-center">
                        <CheckCircle2 className="w-4 h-4 text-green-700" />
                      </div>
                      <span className="text-[8px] font-black uppercase tracking-wider bg-white border border-black rounded-lg px-1.5 py-0.5">Realizadas</span>
                    </div>
                    <div>
                      <p className="text-3xl font-black text-black tracking-tight">{dadosFiltrados.total.concluidas}</p>
                      <p className="text-[9px] font-bold uppercase text-green-800 mt-0.5">Aulas realizadas</p>
                    </div>
                  </div>

                  <div className="w-0.5 bg-black" />

                  <div className="flex-1 bg-yellow-100 p-3 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <div className="w-8 h-8 bg-white border-2 border-black rounded-lg flex items-center justify-center">
                        <AlertCircle className="w-4 h-4 text-yellow-700" />
                      </div>
                      <span className="text-[8px] font-black uppercase tracking-wider bg-white border border-black rounded-lg px-1.5 py-0.5">Justificadas</span>
                    </div>
                    <div>
                      <p className="text-3xl font-black text-black tracking-tight">{dadosFiltrados.total.justificadas}</p>
                      <p className="text-[9px] font-bold uppercase text-yellow-800 mt-0.5">Aulas justificadas</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-red-100 border-2 border-black rounded-xl shadow-[3px_3px_0px_#000] p-3 flex flex-col justify-between min-h-[120px]">
                <div className="flex justify-between items-start">
                  <div className="w-9 h-9 bg-white border-2 border-black rounded-lg flex items-center justify-center">
                    <Clock className="w-4.5 h-4.5 text-red-700" />
                  </div>
                  <span className="text-[8px] font-black uppercase tracking-wider bg-white border border-black rounded-lg px-1.5 py-0.5">Pendentes</span>
                </div>
                <div>
                  <p className="text-4xl font-black text-black tracking-tight">{dadosFiltrados.total.pendentes}</p>
                  <p className="text-[9px] font-bold uppercase text-red-800 mt-0.5">Aguardando registro</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* DESEMPENHO POR UNIDADE */}
        {!isDiretor && (
          <section>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3">
              <div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" />
                  <h2 className="text-sm font-black uppercase tracking-wider text-black">Desempenho por unidade</h2>
                </div>
                <p className="text-[11px] text-gray-500 font-medium mt-0.5">Consulte os indicadores individuais de cada unidade.</p>
              </div>

              <button onClick={() => { setMostrarEstatisticas(!mostrarEstatisticas); if (mostrarEstatisticas) setCardExpandido(null); }}
                className={`flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl border-2 border-black text-[11px] font-black uppercase tracking-wider shadow-[2px_2px_0px_#000] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none ${mostrarEstatisticas ? "bg-pensi-yellow text-black" : "bg-white text-black"}`}>
                <Building2 className="w-4 h-4" />
                {mostrarEstatisticas ? "Ocultar unidades" : "Ver estatísticas"}
              </button>
            </div>

            {mostrarEstatisticas && (
              <div className="animate-fade-in">
                <div className="flex flex-wrap items-center justify-between gap-2 bg-gray-50 border-2 border-black rounded-xl px-3 py-2 mb-3">
                  <div className="flex items-center gap-1.5">
                    <Building2 className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-wider">Unidades encontradas</span>
                  </div>
                  <span className="bg-white border-2 border-black rounded-lg px-2.5 py-0.5 text-[12px] font-black">{dadosFiltrados.porUnidade.length}</span>
                </div>

                {dadosFiltrados.porUnidade.length === 0 ? (
                  <div className="bg-white border-2 border-black border-dashed rounded-xl p-8 text-center">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm font-black uppercase">Nenhuma unidade encontrada</p>
                    <p className="text-[11px] text-gray-500 mt-1">Tente alterar os filtros selecionados.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                    {dadosFiltrados.porUnidade.map((u) => {
                      const isExpanded = cardExpandido === u.nome;
                      const temPendencia = u.p > 0;
                      return (
                        <div key={u.nome}
                          className={`bg-white border-2 border-black rounded-xl shadow-[2px_2px_0px_#000] overflow-hidden transition-all duration-200 ${isExpanded ? "md:col-span-2 xl:col-span-3" : "hover:shadow-[4px_4px_0px_#000]"}`}>
                          <button type="button" onClick={() => setCardExpandido(isExpanded ? null : u.nome)}
                            aria-expanded={isExpanded}
                            className="w-full text-left p-3.5 hover:bg-gray-50 transition-colors">
                            <div className="flex items-center gap-3">
                              <div className="relative w-10 h-10 shrink-0 bg-pensi-yellow border-2 border-black rounded-lg flex items-center justify-center shadow-[2px_2px_0px_#000]">
                                <Building2 className="w-5 h-5 text-black" />
                                <span className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border-2 border-black ${temPendencia ? "bg-red-500" : "bg-green-500"}`} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                  <p className="font-black text-black text-sm uppercase truncate">{u.nome}</p>
                                  <span className="bg-gray-100 border border-black text-[8px] font-black px-2 py-0.5 rounded-lg uppercase">{u.regional}</span>
                                </div>
                              </div>
                              <div className="w-8 h-8 shrink-0 border-2 border-black rounded-lg flex items-center justify-center bg-gray-50">
                                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                              </div>
                            </div>
                          </button>

                          {isExpanded && (
                            <div className="border-t-2 border-black p-4 bg-gray-50 animate-fade-in">
                              <div className="flex items-center justify-between gap-2.5 mb-4">
                                <div>
                                  <span className="text-[9px] font-black uppercase tracking-widest text-gray-500">Detalhamento</span>
                                  <h3 className="text-sm font-black uppercase mt-0.5">{u.nome}</h3>
                                </div>
                                <button onClick={() => setCardExpandido(null)}
                                  className="flex items-center gap-1.5 bg-white border-2 border-black rounded-xl px-3 py-2 text-[10px] font-black uppercase shadow-[2px_2px_0px_#000] hover:bg-gray-100">
                                  <X className="w-3.5 h-3.5" /> Fechar
                                </button>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                                <div className="bg-green-100 border-2 border-black rounded-xl p-4 shadow-[2px_2px_0px_#000]">
                                  <div className="flex items-center justify-between">
                                    <span className="text-[9px] font-black uppercase tracking-wider">Realizadas</span>
                                    <CheckCircle2 className="w-4 h-4 text-green-700" />
                                  </div>
                                  <p className="text-3xl font-black mt-2">{u.c}</p>
                                </div>
                                <div className="bg-yellow-100 border-2 border-black rounded-xl p-4 shadow-[2px_2px_0px_#000]">
                                  <div className="flex items-center justify-between">
                                    <span className="text-[9px] font-black uppercase tracking-wider">Justificadas</span>
                                    <AlertCircle className="w-4 h-4 text-yellow-700" />
                                  </div>
                                  <p className="text-3xl font-black mt-2">{u.j}</p>
                                </div>
                                <div className="bg-red-100 border-2 border-black rounded-xl p-4 shadow-[2px_2px_0px_#000]">
                                  <div className="flex items-center justify-between">
                                    <span className="text-[9px] font-black uppercase tracking-wider">Pendentes</span>
                                    <Clock className="w-4 h-4 text-red-700" />
                                  </div>
                                  <p className="text-3xl font-black mt-2">{u.p}</p>
                                </div>
                              </div>

                              <div className="bg-white border-2 border-black rounded-xl overflow-hidden">
                                <div className="flex items-center gap-2 px-4 py-3 bg-gray-100 border-b-2 border-black">
                                  <History className="w-4 h-4" />
                                  <h4 className="text-[10px] font-black uppercase tracking-widest">Últimas atividades</h4>
                                </div>
                                <div className="p-4 text-[11px] text-gray-500 italic">
                                  Em breve: histórico detalhado por unidade.
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}