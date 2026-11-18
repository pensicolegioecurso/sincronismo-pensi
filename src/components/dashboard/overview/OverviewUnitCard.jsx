
import { useMemo, useState } from "react";

import {
  Building2,
  ChevronUp,
  ChevronDown,
  CheckCircle2,
  AlertCircle,
  Clock,
  History,
  X,
  Filter,
  CalendarDays,
  GraduationCap,
  User,
} from "lucide-react";

function formatarTipo(tipo) {
  if (!tipo) return "Atividade";

  return String(tipo)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letra) => letra.toUpperCase());
}

function StatusHistorico({ status }) {
  const configuracoes = {
    realizado: {
      texto: "Realizada",
      classe: "bg-green-100 text-green-800 border-green-300",
      icone: CheckCircle2,
    },
    justificado: {
      texto: "Justificada",
      classe: "bg-yellow-100 text-yellow-800 border-yellow-300",
      icone: AlertCircle,
    },
    pendente: {
      texto: "Pendente",
      classe: "bg-red-100 text-red-800 border-red-300",
      icone: Clock,
    },
  };

  const config = configuracoes[status] || configuracoes.pendente;
  const Icone = config.icone;

  return (
    <span
      className={`inline-flex items-center gap-1 border rounded-md px-2 py-1 text-[9px] font-black uppercase ${config.classe}`}
    >
      <Icone size={11} />
      {config.texto}
    </span>
  );
}

export default function OverviewUnitCard({
  u,
  isExpanded,
  onToggle,
  onClose,
}) {
  const [filtroTurma, setFiltroTurma] = useState("Todas");

  const temPendencia = u.p > 0;

  const historicoFiltrado = useMemo(() => {
    return (u.historico || [])
      .filter((item) => {
        if (filtroTurma === "Todas") return true;

        return item.turma === filtroTurma;
      })
      .sort((a, b) => b.data.localeCompare(a.data));
  }, [u.historico, filtroTurma]);

  return (
    <div
      className={`bg-white border-2 border-black rounded-xl shadow-[2px_2px_0px_#000] overflow-hidden transition-all duration-200 ${
        isExpanded
          ? "md:col-span-2 xl:col-span-3"
          : "hover:shadow-[4px_4px_0px_#000]"
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isExpanded}
        className="w-full text-left p-3.5 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 shrink-0 bg-pensi-yellow border-2 border-black rounded-lg flex items-center justify-center shadow-[2px_2px_0px_#000]">
            <Building2 className="w-5 h-5 text-black" />

            <span
              className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border-2 border-black ${
                temPendencia ? "bg-red-500" : "bg-green-500"
              }`}
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <p className="font-black text-black text-sm uppercase truncate">
                {u.nome}
              </p>
            </div>

            <p className="text-[10px] text-gray-500 font-semibold uppercase">
              Regional:{" "}
              <span className="text-gray-800">
                {u.regional || "Sem regional"}
              </span>
            </p>
          </div>

          <div className="w-8 h-8 shrink-0 border-2 border-black rounded-lg flex items-center justify-center bg-gray-50">
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </div>
        </div>
      </button>

      {isExpanded && (
        <div className="border-t-2 border-black p-4 bg-gray-50 animate-fade-in">
          <div className="flex items-center justify-between gap-2.5 mb-4">
            <div>
              <span className="text-[9px] font-black uppercase tracking-widest text-gray-500">
                Detalhamento
              </span>

              <h3 className="text-sm font-black uppercase mt-0.5">
                {u.nome}
              </h3>

              <p className="text-[10px] text-gray-500 font-semibold mt-1">
                Regional responsável: {u.regional || "Não identificada"}
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-1.5 bg-white border-2 border-black rounded-xl px-3 py-2 text-[10px] font-black uppercase shadow-[2px_2px_0px_#000] hover:bg-gray-100"
            >
              <X className="w-3.5 h-3.5" />
              Fechar
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
            <div className="bg-green-100 border-2 border-black rounded-xl p-4 shadow-[2px_2px_0px_#000]">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-black uppercase tracking-wider">
                  Realizadas
                </span>
                <CheckCircle2 className="w-4 h-4 text-green-700" />
              </div>

              <p className="text-3xl font-black mt-2">{u.c}</p>
            </div>

            <div className="bg-yellow-100 border-2 border-black rounded-xl p-4 shadow-[2px_2px_0px_#000]">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-black uppercase tracking-wider">
                  Justificadas
                </span>
                <AlertCircle className="w-4 h-4 text-yellow-700" />
              </div>

              <p className="text-3xl font-black mt-2">{u.j}</p>
            </div>

            <div className="bg-red-100 border-2 border-black rounded-xl p-4 shadow-[2px_2px_0px_#000]">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-black uppercase tracking-wider">
                  Pendentes
                </span>
                <Clock className="w-4 h-4 text-red-700" />
              </div>

              <p className="text-3xl font-black mt-2">{u.p}</p>
            </div>
          </div>

          <div className="bg-white border-2 border-black rounded-xl overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 bg-gray-100 border-b-2 border-black">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4" />

                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-widest">
                    Histórico da unidade
                  </h4>

                  <p className="text-[9px] text-gray-500 font-medium mt-0.5">
                    {historicoFiltrado.length} registros encontrados
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-gray-500 shrink-0" />

                <select
                  value={filtroTurma}
                  onChange={(e) => setFiltroTurma(e.target.value)}
                  className="h-9 min-w-0 max-w-full bg-white border-2 border-black rounded-lg px-2.5 text-[10px] font-bold outline-none focus:bg-[#FFFDF2]"
                >
                  <option value="Todas">Todas as turmas</option>

                  {(u.turmas || []).map((turma) => (
                    <option key={turma} value={turma}>
                      {turma}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {historicoFiltrado.length === 0 ? (
              <div className="p-8 text-center">
                <History className="w-8 h-8 mx-auto mb-2 text-gray-300" />

                <p className="text-[11px] font-black uppercase text-gray-500">
                  Nenhum registro encontrado
                </p>

                <p className="text-[10px] text-gray-400 mt-1">
                  Não existem atividades para o filtro selecionado.
                </p>
              </div>
            ) : (
              <div className="p-4">
                <div className="relative space-y-0">
                  {historicoFiltrado.map((item, index) => (
                    <div
                      key={item.id}
                      className="relative flex gap-3 pb-5 last:pb-0"
                    >
                      <div className="relative flex flex-col items-center shrink-0">
                        <div
                          className={`w-8 h-8 rounded-full border-2 border-black flex items-center justify-center z-10 ${
                            item.status === "realizado"
                              ? "bg-green-100"
                              : item.status === "justificado"
                              ? "bg-yellow-100"
                              : "bg-red-100"
                          }`}
                        >
                          {item.status === "realizado" ? (
                            <CheckCircle2 className="w-4 h-4 text-green-700" />
                          ) : item.status === "justificado" ? (
                            <AlertCircle className="w-4 h-4 text-yellow-700" />
                          ) : (
                            <Clock className="w-4 h-4 text-red-700" />
                          )}
                        </div>

                        {index !== historicoFiltrado.length - 1 && (
                          <div className="absolute top-8 bottom-0 w-0.5 bg-gray-200" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0 bg-white border border-gray-200 rounded-lg p-3">
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-1.5">
                            <CalendarDays className="w-3.5 h-3.5 text-gray-400" />

                            <span className="text-[10px] font-black text-gray-700">
                              {item.dataFormatada}
                            </span>
                          </div>

                          <StatusHistorico status={item.status} />
                        </div>

                        <h5 className="text-[11px] font-black uppercase text-gray-900">
                          {formatarTipo(item.tipo)}
                        </h5>

                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                          <span className="flex items-center gap-1 text-[9px] font-semibold text-gray-500">
                            <GraduationCap size={12} />
                            {item.turma || "Sem turma"}
                          </span>

                          <span className="flex items-center gap-1 text-[9px] font-semibold text-gray-500">
                            <User size={11} />
                            {item.responsavel || "Não identificado"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
