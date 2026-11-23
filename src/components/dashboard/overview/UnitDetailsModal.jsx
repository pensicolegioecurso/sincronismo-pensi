import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  X, Building2, Users, CheckCircle2, Clock3, FileCheck2, Search,
  RotateCcw, SlidersHorizontal, ChevronDown, CalendarDays, UserRound, Activity,
  ArrowLeft, MessageSquareText,
} from "lucide-react";

function normalizarTexto(valor) {
  return String(valor || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

function obterObservacao(item) {
  const campos = [item.observacao, item.justificativa, item.motivo, item.descricao, item.comentario, item.comentarios, item.relato, item.observacaoAula, item.descricaoAula, item.texto];
  return campos.find((valor) => typeof valor === "string" && valor.trim()) || "";
}

function formatarData(data) {
  if (!data) return "";
  const [ano, mes, dia] = data.split("-");
  return `${dia}/${mes}/${ano}`;
}

const STATUS = [
  { id: "realizado", label: "Concluídas", icon: CheckCircle2, color: "text-emerald-700", active: "bg-emerald-50 border-emerald-200", dot: "bg-emerald-500", ring: "#22c55e" },
  { id: "pendente", label: "Pendentes", icon: Clock3, color: "text-rose-700", active: "bg-rose-50 border-rose-200", dot: "bg-rose-500", ring: "#ef4444" },
  { id: "justificado", label: "Justificadas", icon: FileCheck2, color: "text-sky-700", active: "bg-sky-50 border-sky-200", dot: "bg-sky-500", ring: "#0ea5e9" },
];

const inputClass = "min-w-0 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-800 outline-none transition focus:border-black cursor-pointer";

function CircularProgress({ percent, size = 96, stroke = 10 }) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(percent, 100) / 100) * circumference;
  const color = percent >= 70 ? "#22c55e" : percent >= 40 ? "#eab308" : "#ef4444";

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="#f3f4f6" strokeWidth={stroke} fill="none" />
        <circle cx={size / 2} cy={size / 2} r={radius} stroke={color} strokeWidth={stroke} fill="none" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} className="transition-all duration-700" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-bold text-gray-900">{percent}%</span>
      </div>
    </div>
  );
}

export default function UnitDetailsModal({ unidade, onClose }) {
  const [aba, setAba] = useState("turmas");
  const [filtroTurma, setFiltroTurma] = useState("Todas");
  const [filtroStatus, setFiltroStatus] = useState("Todos");
  const [filtroProfessor, setFiltroProfessor] = useState("");
  const [filtroAtividade, setFiltroAtividade] = useState("Todas");
  const [busca, setBusca] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [filtrosAbertos, setFiltrosAbertos] = useState(false);

  const historico = unidade?.historico || [];

  const turmas = useMemo(() => [...new Set(unidade?.turmas || [])].sort((a, b) => a.localeCompare(b, "pt-BR")), [unidade]);
  const professores = useMemo(() => [...new Set(historico.map((item) => item.responsavel).filter(Boolean))].sort((a, b) => a.localeCompare(b, "pt-BR")), [historico]);
  const atividades = useMemo(() => [...new Set(historico.map((item) => item.tipo).filter(Boolean))].sort((a, b) => a.localeCompare(b, "pt-BR")), [historico]);

  const historicoBase = useMemo(() => {
    const termoProfessor = normalizarTexto(filtroProfessor);
    const termoBusca = normalizarTexto(busca);
    return historico.filter((item) => {
      if (filtroTurma !== "Todas" && normalizarTexto(item.turma) !== normalizarTexto(filtroTurma)) return false;
      if (termoProfessor && !normalizarTexto(item.responsavel).includes(termoProfessor)) return false;
      if (filtroAtividade !== "Todas" && item.tipo !== filtroAtividade) return false;
      if (dataInicio && item.data < dataInicio) return false;
      if (dataFim && item.data > dataFim) return false;
      if (termoBusca && !normalizarTexto([item.turma, item.responsavel, item.tipo, item.dataFormatada, obterObservacao(item)].join(" ")).includes(termoBusca)) return false;
      return true;
    });
  }, [historico, filtroTurma, filtroProfessor, filtroAtividade, busca, dataInicio, dataFim]);

  const historicoFiltrado = useMemo(() => historicoBase.filter((item) => filtroStatus === "Todos" || item.status === filtroStatus), [historicoBase, filtroStatus]);

  const estatisticas = useMemo(() => ({
    realizado: historicoBase.filter((item) => item.status === "realizado").length,
    pendente: historicoBase.filter((item) => item.status === "pendente").length,
    justificado: historicoBase.filter((item) => item.status === "justificado").length,
  }), [historicoBase]);

  const total = estatisticas.realizado + estatisticas.pendente + estatisticas.justificado;
  const percentual = total ? Math.round((estatisticas.realizado / total) * 100) : 0;

  const temFiltros = filtroTurma !== "Todas" || filtroStatus !== "Todos" || filtroProfessor !== "" || filtroAtividade !== "Todas" || busca !== "" || dataInicio !== "" || dataFim !== "";

  function limparFiltros() {
    setFiltroTurma("Todas"); setFiltroStatus("Todos"); setFiltroProfessor(""); setFiltroAtividade("Todas");
    setBusca(""); setDataInicio(""); setDataFim("");
  }

  function selecionarStatus(status) {
    setFiltroStatus((atual) => (atual === status ? "Todos" : status));
    setAba("registros");
  }

  function selecionarStatusTurma(turma, status) {
    setFiltroTurma(turma); setFiltroStatus(status); setAba("registros");
  }

  function selecionarDataInicio(valor) { setDataInicio(valor); if (dataFim && valor && valor > dataFim) setDataFim(valor); }
  function selecionarDataFim(valor) { setDataFim(valor); if (dataInicio && valor && valor < dataInicio) setDataInicio(valor); }

  const abas = [
    { id: "turmas", label: "Turmas" },
    { id: "unidade", label: "Geral" },
    { id: "registros", label: "Registros" },
  ];

  if (!unidade) return null;

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/40 p-2 backdrop-blur-sm sm:p-4" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="flex max-h-[94dvh] w-full max-w-5xl flex-col overflow-hidden rounded-[32px] bg-[#f9f9f9] shadow-2xl">
        <header className="flex items-center justify-between border-b border-gray-200 bg-white px-5 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gray-50 text-gray-800">
              <Building2 size={20} strokeWidth={2} />
            </div>
            <div>
              <h2 className="text-base font-black text-gray-900 sm:text-lg">{unidade.nome}</h2>
              <p className="text-xs font-bold text-gray-500 uppercase">{unidade.regional || "Sem regional"}</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-full p-2 text-gray-400 transition hover:bg-gray-100 hover:text-black">
            <X size={20} />
          </button>
        </header>

        <div className="overflow-y-auto p-4 sm:p-6">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div className="flex rounded-full bg-gray-200/50 p-1">
              {abas.map((item) => (
                <button key={item.id} onClick={() => setAba(item.id)} className={`rounded-full px-4 py-2 text-xs font-bold transition-colors ${aba === item.id ? "bg-white text-black shadow-sm" : "text-gray-500 hover:text-gray-800"}`}>
                  {item.label}
                </button>
              ))}
            </div>
            <button onClick={() => setFiltrosAbertos(!filtrosAbertos)} className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition ${filtrosAbertos || temFiltros ? "bg-white text-black shadow-sm border border-gray-200" : "bg-transparent text-gray-500 hover:bg-gray-100"}`}>
              <SlidersHorizontal size={14} /> Filtros
              {temFiltros && <span className="h-1.5 w-1.5 rounded-full bg-black" />}
              <ChevronDown size={13} className={`transition-transform ${filtrosAbertos ? "rotate-180" : ""}`} />
            </button>
          </div>

          <div className="mb-6 rounded-[32px] border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex flex-col items-center sm:items-start">
                <span className="text-[11px] font-black uppercase tracking-wider text-gray-500 mb-1">Total de registros</span>
                <span className="text-4xl font-black text-gray-900">{total}</span>
              </div>
              <CircularProgress percent={percentual} />
            </div>
            <div className="mt-6 grid grid-cols-3 gap-3 border-t border-gray-100 pt-6">
              {STATUS.map((item) => {
                const Icon = item.icon;
                return (
                  <button key={item.id} onClick={() => selecionarStatus(item.id)} className={`flex flex-col justify-between rounded-2xl border p-3 sm:p-4 text-left transition ${filtroStatus === item.id ? "border-black shadow-md bg-white" : "border-gray-100 bg-gray-50/50"}`}>
                    <div className={`mb-2 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider ${item.color}`}>
                      <Icon size={14} /> {item.label}
                    </div>
                    <span className="text-xl sm:text-2xl font-black text-gray-900">{estatisticas[item.id]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {filtrosAbertos && (
            <div className="mb-6 rounded-3xl border border-gray-100 bg-white p-5 shadow-sm animate-fade-in">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm font-black text-gray-800">Refinar consulta</span>
                <button onClick={limparFiltros} className="flex items-center gap-1 text-xs font-bold text-gray-500 hover:text-black">
                  <RotateCcw size={12} /> Limpar filtros
                </button>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <select value={filtroTurma} onChange={(e) => setFiltroTurma(e.target.value)} className={inputClass}>
                  <option value="Todas">Todas as turmas</option>
                  {turmas.map((turma) => <option key={turma} value={turma}>{turma}</option>)}
                </select>
                <div className="relative">
                  <UserRound size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" list="lista-professores-unidade" value={filtroProfessor} onChange={(e) => setFiltroProfessor(e.target.value)} placeholder="Pesquisar professor..." className={`${inputClass} pl-9`} />
                  <datalist id="lista-professores-unidade">
                    {professores.map((professor) => <option key={professor} value={professor} />)}
                  </datalist>
                </div>
                <select value={filtroAtividade} onChange={(e) => setFiltroAtividade(e.target.value)} className={inputClass}>
                  <option value="Todas">Todas as atividades</option>
                  {atividades.map((atividade) => <option key={atividade} value={atividade}>{atividade}</option>)}
                </select>
                <select value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)} className={inputClass}>
                  <option value="Todos">Todos os status</option>
                  <option value="realizado">Concluídas</option>
                  <option value="pendente">Pendentes</option>
                  <option value="justificado">Justificadas</option>
                </select>
                <div className="flex min-w-0 items-center gap-2 rounded-xl border border-gray-200 bg-white px-3">
                  <Search size={13} className="shrink-0 text-gray-400" />
                  <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar turma, aula ou texto..." className="w-full min-w-0 bg-transparent py-3 text-sm font-medium text-gray-800 outline-none" />
                </div>
                <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3">
                  <CalendarDays size={14} className="shrink-0 text-gray-400" />
                  <span className="text-xs font-medium text-gray-500">Período</span>
                </div>
                <label className="min-w-0">
                  <span className="mb-1 block text-[10px] font-bold uppercase text-gray-400">Data inicial</span>
                  <input type="date" value={dataInicio} max={dataFim || undefined} onChange={(e) => selecionarDataInicio(e.target.value)} className={inputClass} />
                </label>
                <label className="min-w-0">
                  <span className="mb-1 block text-[10px] font-bold uppercase text-gray-400">Data final</span>
                  <input type="date" value={dataFim} min={dataInicio || undefined} onChange={(e) => selecionarDataFim(e.target.value)} className={inputClass} />
                </label>
                <div className="flex items-end">
                  <button onClick={() => { setDataInicio(""); setDataFim(""); }} disabled={!dataInicio && !dataFim} className="w-full rounded-xl border border-gray-200 bg-white px-3 py-3 text-xs font-bold text-gray-500 transition hover:border-black hover:text-black disabled:cursor-not-allowed disabled:opacity-40">
                    Remover período
                  </button>
                </div>
              </div>
              {(dataInicio || dataFim) && (
                <p className="mt-3 text-[10px] font-semibold text-gray-500">
                  Período selecionado: {dataInicio ? formatarData(dataInicio) : "Início"} até {dataFim ? formatarData(dataFim) : "Hoje"}
                </p>
              )}
            </div>
          )}

          {aba === "turmas" && (
            <div className="space-y-3">
              <div className="mb-4 flex items-center justify-between px-1">
                <h3 className="text-sm font-black text-gray-800">Desempenho por turma</h3>
                <span className="text-xs font-bold text-gray-400">{turmas.length} turmas</span>
              </div>
              {turmas.map((turma) => {
                const registros = historicoBase.filter((i) => normalizarTexto(i.turma) === normalizarTexto(turma));
                const qtd = {
                  realizado: registros.filter((i) => i.status === "realizado").length,
                  pendente: registros.filter((i) => i.status === "pendente").length,
                  justificado: registros.filter((i) => i.status === "justificado").length,
                };
                const soma = qtd.realizado + qtd.pendente + qtd.justificado;
                const pct = soma ? Math.round((qtd.realizado / soma) * 100) : 0;
                return (
                  <div key={turma} className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
                    <div className="mb-3 flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-black text-gray-900">{turma}</h4>
                        <p className="text-[11px] font-bold text-gray-400">{soma} registros</p>
                      </div>
                      <span className="text-lg font-black text-gray-900">{pct}%</span>
                    </div>
                    <div className="mb-4 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                      <div className="h-full rounded-full bg-pensi-yellow" style={{ width: `${pct}%` }} />
                    </div>
                    <div className="flex gap-2">
                      {STATUS.map((item) => (
                        <button key={item.id} onClick={() => selecionarStatusTurma(turma, item.id)} className="flex flex-1 items-center justify-between rounded-xl bg-gray-50 px-3 py-2 text-left transition hover:bg-gray-100">
                          <span className={`text-[10px] font-black uppercase ${item.color}`}>{item.label}</span>
                          <span className="text-sm font-bold text-gray-800">{qtd[item.id]}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
              {!turmas.length && <p className="rounded-3xl border border-dashed border-gray-200 bg-white p-6 text-center text-sm text-gray-400">Nenhuma turma cadastrada.</p>}
            </div>
          )}

          {aba === "unidade" && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
                <div className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-wide text-gray-500">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-pensi-yellow text-black">
                    <Building2 size={14} />
                  </span>
                  Unidade
                </div>
                <p className="text-sm font-black text-gray-900">{unidade.nome}</p>
                <p className="mt-1 text-xs text-gray-400">Regional: {unidade.regional || "Sem regional"}</p>
              </div>
              <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
                <div className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-wide text-gray-500">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-gray-600">
                    <Users size={14} />
                  </span>
                  Estrutura
                </div>
                <p className="text-2xl font-black text-gray-900">{turmas.length}</p>
                <p className="text-xs text-gray-400">Turmas cadastradas</p>
              </div>
              <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
                <p className="mb-1 text-[10px] font-black uppercase tracking-wider text-gray-500">Registros no período</p>
                <p className="text-2xl font-black text-gray-900">{total}</p>
                <p className="text-xs text-gray-400">Considerando os filtros selecionados</p>
              </div>
              <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
                <p className="mb-1 text-[10px] font-black uppercase tracking-wider text-gray-500">Professores encontrados</p>
                <p className="text-2xl font-black text-gray-900">{new Set(historicoBase.map((item) => item.responsavel).filter(Boolean)).size}</p>
                <p className="text-xs text-gray-400">Com registros no período</p>
              </div>
              <button onClick={() => setAba("registros")} className="flex items-center justify-between rounded-3xl border border-gray-100 bg-white p-5 text-left shadow-sm transition hover:bg-gray-50 sm:col-span-2">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">Histórico completo</p>
                  <p className="mt-1 text-sm font-black text-gray-900">Consultar registros da unidade</p>
                </div>
                <ArrowLeft size={17} className="rotate-180 text-gray-400" />
              </button>
            </div>
          )}

          {aba === "registros" && (
            <div>
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2 px-1">
                <div>
                  <h3 className="text-sm font-black text-gray-800">Registros encontrados</h3>
                  <p className="text-[11px] text-gray-400">{historicoFiltrado.length} resultados</p>
                </div>
                {filtroStatus !== "Todos" && (
                  <button onClick={() => setFiltroStatus("Todos")} className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-[11px] font-bold text-gray-500 transition hover:border-black hover:text-black">Limpar status</button>
                )}
              </div>
              <div className="space-y-2">
                {historicoFiltrado.map((item) => {
                  const status = STATUS.find((s) => s.id === item.status);
                  const Icon = status?.icon || Activity;
                  const observacao = obterObservacao(item);
                  return (
                    <div key={item.id} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-gray-900">
                            {item.turma || "Sem turma"} <span className="ml-1 font-medium text-gray-400">· {item.tipo || "Atividade"}</span>
                          </p>
                          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-medium text-gray-500">
                            <span className="flex items-center gap-1"><CalendarDays size={12} />{item.dataFormatada || formatarData(item.data)}</span>
                            <span className="flex items-center gap-1"><UserRound size={12} />{item.responsavel || "Não identificado"}</span>
                          </div>
                        </div>
                        <span className={`flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-bold ${item.status === "realizado" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : item.status === "pendente" ? "border-rose-200 bg-rose-50 text-rose-700" : "border-sky-200 bg-sky-50 text-sky-700"}`}>
                          <Icon size={11} />{status?.label || item.status}
                        </span>
                      </div>
                      {observacao && (
                        <div className="mt-3 rounded-xl border border-gray-100 bg-gray-50 p-3">
                          <div className="mb-1.5 flex items-center gap-1.5 text-[10px] font-black uppercase text-gray-500">
                            <MessageSquareText size={12} />{item.status === "justificado" ? "Justificativa" : "Observação da aula"}
                          </div>
                          <p className="whitespace-pre-wrap break-words text-xs leading-relaxed text-gray-700">{observacao}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              {!historicoFiltrado.length && <p className="rounded-3xl border border-dashed border-gray-200 bg-white p-8 text-center text-sm text-gray-400">Nenhum registro encontrado com esses filtros.</p>}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}