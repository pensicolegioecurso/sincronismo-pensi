import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Building2,
  Users,
  CheckCircle2,
  Clock3,
  FileCheck2,
  Search,
  RotateCcw,
  SlidersHorizontal,
  ChevronDown,
  CalendarDays,
  BookOpen,
  UserRound,
  Activity,
  ArrowLeft,
  MessageSquareText,
} from "lucide-react";

function normalizarTexto(valor) {
  return String(valor || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function obterObservacao(item) {
  const campos = [
    item.observacao,
    item.justificativa,
    item.motivo,
    item.descricao,
    item.comentario,
    item.comentários,
    item.comentarios,
    item.relato,
    item.observacaoAula,
    item.descricaoAula,
    item.texto,
  ];

  return campos.find(
    (valor) => typeof valor === "string" && valor.trim()
  ) || "";
}

function formatarData(data) {
  if (!data) return "";

  const [ano, mes, dia] = data.split("-");
  return `${dia}/${mes}/${ano}`;
}

const STATUS = [
  {
    id: "realizado",
    label: "Concluídas",
    icon: CheckCircle2,
    color: "text-emerald-700",
    active: "bg-emerald-50 border-emerald-600",
  },
  {
    id: "pendente",
    label: "Pendentes",
    icon: Clock3,
    color: "text-rose-700",
    active: "bg-rose-50 border-rose-600",
  },
  {
    id: "justificado",
    label: "Justificadas",
    icon: FileCheck2,
    color: "text-sky-700",
    active: "bg-sky-50 border-sky-600",
  },
];

const inputClass =
  "min-w-0 w-full rounded-lg border border-black/10 bg-[#fafafa] px-3 py-2.5 text-xs font-semibold outline-none transition focus:border-black focus:bg-white";

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

  const turmas = useMemo(
    () =>
      [...new Set(unidade?.turmas || [])].sort((a, b) =>
        a.localeCompare(b, "pt-BR")
      ),
    [unidade]
  );

  const professores = useMemo(
    () =>
      [
        ...new Set(
          historico
            .map((item) => item.responsavel)
            .filter(Boolean)
        ),
      ].sort((a, b) => a.localeCompare(b, "pt-BR")),
    [historico]
  );

  const atividades = useMemo(
    () =>
      [
        ...new Set(
          historico
            .map((item) => item.tipo)
            .filter(Boolean)
        ),
      ].sort((a, b) => a.localeCompare(b, "pt-BR")),
    [historico]
  );

  const historicoBase = useMemo(() => {
    const termoProfessor = normalizarTexto(filtroProfessor);
    const termoBusca = normalizarTexto(busca);

    return historico.filter((item) => {
      if (
        filtroTurma !== "Todas" &&
        normalizarTexto(item.turma) !== normalizarTexto(filtroTurma)
      ) {
        return false;
      }

      if (
        termoProfessor &&
        !normalizarTexto(item.responsavel).includes(termoProfessor)
      ) {
        return false;
      }

      if (
        filtroAtividade !== "Todas" &&
        item.tipo !== filtroAtividade
      ) {
        return false;
      }

      if (dataInicio && item.data < dataInicio) return false;
      if (dataFim && item.data > dataFim) return false;

      if (
        termoBusca &&
        !normalizarTexto(
          [
            item.turma,
            item.responsavel,
            item.tipo,
            item.dataFormatada,
            obterObservacao(item),
          ].join(" ")
        ).includes(termoBusca)
      ) {
        return false;
      }

      return true;
    });
  }, [
    historico,
    filtroTurma,
    filtroProfessor,
    filtroAtividade,
    busca,
    dataInicio,
    dataFim,
  ]);

  const historicoFiltrado = useMemo(
    () =>
      historicoBase.filter(
        (item) =>
          filtroStatus === "Todos" ||
          item.status === filtroStatus
      ),
    [historicoBase, filtroStatus]
  );

  const estatisticas = useMemo(
    () => ({
      realizado: historicoBase.filter(
        (item) => item.status === "realizado"
      ).length,

      pendente: historicoBase.filter(
        (item) => item.status === "pendente"
      ).length,

      justificado: historicoBase.filter(
        (item) => item.status === "justificado"
      ).length,
    }),
    [historicoBase]
  );

  const total =
    estatisticas.realizado +
    estatisticas.pendente +
    estatisticas.justificado;

  const percentual = total
    ? Math.round((estatisticas.realizado / total) * 100)
    : 0;

  const temFiltros =
    filtroTurma !== "Todas" ||
    filtroStatus !== "Todos" ||
    filtroProfessor !== "" ||
    filtroAtividade !== "Todas" ||
    busca !== "" ||
    dataInicio !== "" ||
    dataFim !== "";

  function limparFiltros() {
    setFiltroTurma("Todas");
    setFiltroStatus("Todos");
    setFiltroProfessor("");
    setFiltroAtividade("Todas");
    setBusca("");
    setDataInicio("");
    setDataFim("");
  }

  function selecionarStatus(status) {
    setFiltroStatus((atual) =>
      atual === status ? "Todos" : status
    );
    setAba("registros");
  }

  function selecionarStatusTurma(turma, status) {
    setFiltroTurma(turma);
    setFiltroStatus(status);
    setAba("registros");
  }

  function selecionarDataInicio(valor) {
    setDataInicio(valor);

    if (dataFim && valor && valor > dataFim) {
      setDataFim(valor);
    }
  }

  function selecionarDataFim(valor) {
    setDataFim(valor);

    if (dataInicio && valor && valor < dataInicio) {
      setDataInicio(valor);
    }
  }

  const abas = [
    { id: "turmas", label: "Turmas" },
    { id: "unidade", label: "Geral" },
    { id: "registros", label: "Registros" },
  ];

  if (!unidade) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/65 p-2 backdrop-blur-sm sm:p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="flex max-h-[94dvh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-black/10 bg-[#f7f7f4] shadow-2xl">
        <header className="flex items-center justify-between gap-3 border-b border-black/10 bg-white px-4 py-3 sm:px-5">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-pensi-yellow text-black">
              <Building2 size={19} />
            </div>

            <div className="min-w-0">
              <h2 className="truncate text-base font-black uppercase tracking-tight sm:text-lg">
                {unidade.nome}
              </h2>

              <p className="truncate text-xs font-medium text-gray-500">
                {unidade.regional || "Sem regional"}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-black"
          >
            <X size={20} />
          </button>
        </header>

        <div className="overflow-y-auto p-3 sm:p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="flex rounded-xl border border-black/10 bg-white p-1">
              {abas.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setAba(item.id)}
                  className={`rounded-lg px-3 py-2 text-xs font-bold transition ${
                    aba === item.id
                      ? "bg-black text-white"
                      : "text-gray-500 hover:text-black"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <button
              onClick={() => setFiltrosAbertos(!filtrosAbertos)}
              className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-bold transition ${
                filtrosAbertos || temFiltros
                  ? "border-black bg-pensi-yellow text-black"
                  : "border-black/10 bg-white text-gray-600"
              }`}
            >
              <SlidersHorizontal size={14} />
              Filtros

              {temFiltros && (
                <span className="h-1.5 w-1.5 rounded-full bg-black" />
              )}

              <ChevronDown
                size={13}
                className={`transition-transform ${
                  filtrosAbertos ? "rotate-180" : ""
                }`}
              />
            </button>
          </div>

          <div className="mb-4 grid grid-cols-3 gap-2">
            {STATUS.map((item) => {
              const Icon = item.icon;
              const ativo = filtroStatus === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => selecionarStatus(item.id)}
                  className={`rounded-xl border p-3 text-left transition hover:-translate-y-0.5 ${
                    ativo
                      ? item.active
                      : "border-black/10 bg-white hover:border-black/40"
                  }`}
                >
                  <div
                    className={`mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase sm:text-xs ${item.color}`}
                  >
                    <Icon size={14} />
                    {item.label}
                  </div>

                  <p className="text-xl font-black leading-none sm:text-2xl">
                    {estatisticas[item.id]}
                  </p>
                </button>
              );
            })}
          </div>

          <div className="mb-4 rounded-xl border border-black/10 bg-white p-3">
            <div className="mb-2 flex items-center justify-between text-xs">
              <span className="font-bold text-gray-500">
                Taxa de conclusão
              </span>

              <span className="font-black">{percentual}%</span>
            </div>

            <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all"
                style={{ width: `${percentual}%` }}
              />
            </div>

            <p className="mt-2 text-[10px] font-medium text-gray-400">
              {total} registros considerados
            </p>
          </div>

          {filtrosAbertos && (
            <div className="mb-4 rounded-xl border border-black/10 bg-white p-3">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-black uppercase">
                  Refinar consulta
                </span>

                <button
                  onClick={limparFiltros}
                  className="flex items-center gap-1 text-[11px] font-bold text-gray-400 hover:text-black"
                >
                  <RotateCcw size={12} />
                  Limpar filtros
                </button>
              </div>

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                <select
                  value={filtroTurma}
                  onChange={(e) => setFiltroTurma(e.target.value)}
                  className={inputClass}
                >
                  <option value="Todas">Todas as turmas</option>

                  {turmas.map((turma) => (
                    <option key={turma} value={turma}>
                      {turma}
                    </option>
                  ))}
                </select>

                <div className="relative">
                  <UserRound
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    type="text"
                    list="lista-professores-unidade"
                    value={filtroProfessor}
                    onChange={(e) => setFiltroProfessor(e.target.value)}
                    placeholder="Pesquisar professor..."
                    className={`${inputClass} pl-9`}
                  />

                  <datalist id="lista-professores-unidade">
                    {professores.map((professor) => (
                      <option key={professor} value={professor} />
                    ))}
                  </datalist>
                </div>

                <select
                  value={filtroAtividade}
                  onChange={(e) => setFiltroAtividade(e.target.value)}
                  className={inputClass}
                >
                  <option value="Todas">Todas as atividades</option>

                  {atividades.map((atividade) => (
                    <option key={atividade} value={atividade}>
                      {atividade}
                    </option>
                  ))}
                </select>

                <select
                  value={filtroStatus}
                  onChange={(e) => setFiltroStatus(e.target.value)}
                  className={inputClass}
                >
                  <option value="Todos">Todos os status</option>
                  <option value="realizado">Concluídas</option>
                  <option value="pendente">Pendentes</option>
                  <option value="justificado">Justificadas</option>
                </select>

                <div className="flex min-w-0 items-center gap-2 rounded-lg border border-black/10 bg-[#fafafa] px-3">
                  <Search size={13} className="shrink-0 text-gray-400" />

                  <input
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    placeholder="Buscar turma, aula ou texto..."
                    className="w-full min-w-0 bg-transparent py-2.5 text-xs outline-none"
                  />
                </div>

                <div className="flex items-center gap-2 rounded-lg border border-black/10 bg-[#fafafa] px-3">
                  <CalendarDays
                    size={14}
                    className="shrink-0 text-gray-400"
                  />

                  <span className="text-[11px] font-semibold text-gray-500">
                    Período
                  </span>
                </div>

                <label className="min-w-0">
                  <span className="mb-1 block text-[10px] font-bold uppercase text-gray-400">
                    Data inicial
                  </span>

                  <input
                    type="date"
                    value={dataInicio}
                    max={dataFim || undefined}
                    onChange={(e) =>
                      selecionarDataInicio(e.target.value)
                    }
                    className={inputClass}
                  />
                </label>

                <label className="min-w-0">
                  <span className="mb-1 block text-[10px] font-bold uppercase text-gray-400">
                    Data final
                  </span>

                  <input
                    type="date"
                    value={dataFim}
                    min={dataInicio || undefined}
                    onChange={(e) =>
                      selecionarDataFim(e.target.value)
                    }
                    className={inputClass}
                  />
                </label>

                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setDataInicio("");
                      setDataFim("");
                    }}
                    disabled={!dataInicio && !dataFim}
                    className="w-full rounded-lg border border-black/10 bg-white px-3 py-2.5 text-xs font-bold text-gray-500 transition hover:border-black hover:text-black disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Remover período
                  </button>
                </div>
              </div>

              {(dataInicio || dataFim) && (
                <p className="mt-3 text-[10px] font-semibold text-gray-500">
                  Período selecionado:{" "}
                  {dataInicio ? formatarData(dataInicio) : "Início"}
                  {" até "}
                  {dataFim ? formatarData(dataFim) : "Hoje"}
                </p>
              )}
            </div>
          )}

          {aba === "turmas" && (
            <div className="space-y-2">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black">
                    Desempenho por turma
                  </h3>

                  <p className="text-[11px] text-gray-400">
                    {turmas.length} turmas cadastradas
                  </p>
                </div>

                <BookOpen size={17} className="text-gray-400" />
              </div>

              {turmas.map((turma) => {
                const registros = historicoBase.filter(
                  (item) =>
                    normalizarTexto(item.turma) ===
                    normalizarTexto(turma)
                );

                const qtd = {
                  realizado: registros.filter(
                    (item) => item.status === "realizado"
                  ).length,

                  pendente: registros.filter(
                    (item) => item.status === "pendente"
                  ).length,

                  justificado: registros.filter(
                    (item) => item.status === "justificado"
                  ).length,
                };

                const soma =
                  qtd.realizado +
                  qtd.pendente +
                  qtd.justificado;

                const pct = soma
                  ? Math.round((qtd.realizado / soma) * 100)
                  : 0;

                return (
                  <div
                    key={turma}
                    className="rounded-xl border border-black/10 bg-white p-3 transition hover:border-black/30"
                  >
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <h4 className="truncate text-sm font-black">
                          {turma}
                        </h4>

                        <p className="text-[10px] text-gray-400">
                          {soma} registros
                        </p>
                      </div>

                      <span className="text-sm font-black">
                        {pct}%
                      </span>
                    </div>

                    <div className="mb-3 h-1 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className="h-full rounded-full bg-emerald-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      {STATUS.map((item) => {
                        const Icon = item.icon;

                        return (
                          <button
                            key={item.id}
                            onClick={() =>
                              selecionarStatusTurma(
                                turma,
                                item.id
                              )
                            }
                            className="flex items-center justify-between gap-1 rounded-lg bg-[#f7f7f5] px-2 py-2 text-left transition hover:bg-gray-100"
                          >
                            <span
                              className={`flex items-center gap-1 text-[9px] font-bold sm:text-[10px] ${item.color}`}
                            >
                              <Icon size={12} />
                              {item.label}
                            </span>

                            <span className="text-sm font-black">
                              {qtd[item.id]}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {!turmas.length && (
                <p className="rounded-xl border border-dashed border-gray-300 p-6 text-center text-xs text-gray-400">
                  Nenhuma turma cadastrada.
                </p>
              )}
            </div>
          )}

          {aba === "unidade" && (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <div className="rounded-xl border border-black/10 bg-white p-4">
                <div className="mb-2 flex items-center gap-2 text-xs font-bold text-gray-500">
                  <Building2 size={15} />
                  Unidade
                </div>

                <p className="text-sm font-black">
                  {unidade.nome}
                </p>

                <p className="mt-1 text-xs text-gray-400">
                  Regional: {unidade.regional || "Sem regional"}
                </p>
              </div>

              <div className="rounded-xl border border-black/10 bg-white p-4">
                <div className="mb-2 flex items-center gap-2 text-xs font-bold text-gray-500">
                  <Users size={15} />
                  Estrutura
                </div>

                <p className="text-2xl font-black">
                  {turmas.length}
                </p>

                <p className="text-xs text-gray-400">
                  Turmas cadastradas
                </p>
              </div>

              <div className="rounded-xl border border-black/10 bg-white p-4">
                <p className="mb-1 text-xs font-bold text-gray-500">
                  Registros no período
                </p>

                <p className="text-2xl font-black">{total}</p>

                <p className="text-xs text-gray-400">
                  Considerando os filtros selecionados
                </p>
              </div>

              <div className="rounded-xl border border-black/10 bg-white p-4">
                <p className="mb-1 text-xs font-bold text-gray-500">
                  Professores encontrados
                </p>

                <p className="text-2xl font-black">
                  {new Set(
                    historicoBase
                      .map((item) => item.responsavel)
                      .filter(Boolean)
                  ).size}
                </p>

                <p className="text-xs text-gray-400">
                  Com registros no período
                </p>
              </div>

              <button
                onClick={() => setAba("registros")}
                className="flex items-center justify-between rounded-xl border border-black/10 bg-white p-4 text-left transition hover:border-black/40 sm:col-span-2"
              >
                <div>
                  <p className="text-xs font-bold text-gray-500">
                    Histórico completo
                  </p>

                  <p className="mt-1 text-sm font-black">
                    Consultar registros da unidade
                  </p>
                </div>

                <ArrowLeft
                  size={17}
                  className="rotate-180"
                />
              </button>
            </div>
          )}

          {aba === "registros" && (
            <div>
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-black">
                    Registros encontrados
                  </h3>

                  <p className="text-[11px] text-gray-400">
                    {historicoFiltrado.length} resultados
                  </p>
                </div>

                {filtroStatus !== "Todos" && (
                  <button
                    onClick={() => setFiltroStatus("Todos")}
                    className="text-[11px] font-bold text-gray-500 underline"
                  >
                    Limpar status
                  </button>
                )}
              </div>

              <div className="space-y-2">
                {historicoFiltrado.map((item) => {
                  const status = STATUS.find(
                    (s) => s.id === item.status
                  );

                  const Icon = status?.icon || Activity;
                  const observacao = obterObservacao(item);

                  return (
                    <div
                      key={item.id}
                      className="rounded-xl border border-black/10 bg-white px-3 py-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-xs font-black">
                            {item.turma || "Sem turma"}

                            <span className="font-medium text-gray-400">
                              {" · "}
                              {item.tipo || "Atividade"}
                            </span>
                          </p>

                          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-gray-400">
                            <span className="flex items-center gap-1">
                              <CalendarDays size={11} />
                              {item.dataFormatada ||
                                formatarData(item.data)}
                            </span>

                            <span className="flex items-center gap-1">
                              <UserRound size={11} />
                              {item.responsavel ||
                                "Não identificado"}
                            </span>
                          </div>
                        </div>

                        <span
                          className={`flex shrink-0 items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-bold ${
                            item.status === "realizado"
                              ? "bg-emerald-50 text-emerald-700"
                              : item.status === "pendente"
                                ? "bg-rose-50 text-rose-700"
                                : "bg-sky-50 text-sky-700"
                          }`}
                        >
                          <Icon size={11} />
                          {status?.label || item.status}
                        </span>
                      </div>

                      {observacao && (
                        <div className="mt-3 rounded-lg border border-black/5 bg-[#f8f8f6] p-3">
                          <div className="mb-1.5 flex items-center gap-1.5 text-[10px] font-black uppercase text-gray-500">
                            <MessageSquareText size={12} />
                            {item.status === "justificado"
                              ? "Justificativa"
                              : "Observação da aula"}
                          </div>

                          <p className="whitespace-pre-wrap break-words text-xs leading-relaxed text-gray-700">
                            {observacao}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {!historicoFiltrado.length && (
                <p className="rounded-xl border border-dashed border-gray-300 p-6 text-center text-xs text-gray-400">
                  Nenhum registro encontrado com esses filtros.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}