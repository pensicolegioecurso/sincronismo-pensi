
import { useMemo, useState } from "react";
import {
  Trophy,
  Medal,
  UserRound,
  ChevronDown,
  Users,
  CheckCircle2,
  TrendingUp,
  Filter,
} from "lucide-react";

function normalizarTexto(valor) {
  return String(valor || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export default function OverviewTeacherRanking({
  professores = [],
  unidades = [],
}) {
  const [unidadeSelecionada, setUnidadeSelecionada] =
    useState("todas");

  const [ordenacao, setOrdenacao] = useState("concluidas");

  const [mostrarFiltroUnidade, setMostrarFiltroUnidade] =
    useState(false);

  const ranking = useMemo(() => {
    let lista = [...professores];

    // Filtro por unidade
    if (unidadeSelecionada !== "todas") {
      lista = lista.filter((professor) =>
        normalizarTexto(professor.unidade) ===
        normalizarTexto(unidadeSelecionada)
      );
    } else {
      // Agrupa o mesmo professor quando ele atua em mais de uma unidade
      const agrupados = new Map();

      lista.forEach((professor) => {
        const chave =
          professor.uid ||
          normalizarTexto(professor.email) ||
          normalizarTexto(professor.nome);

        if (!agrupados.has(chave)) {
          agrupados.set(chave, {
            ...professor,
            unidades: [professor.unidade],
            concluidas: 0,
            pendentes: 0,
            justificadas: 0,
          });
        }

        const atual = agrupados.get(chave);

        if (
          !atual.unidades.some(
            (unidade) =>
              normalizarTexto(unidade) ===
              normalizarTexto(professor.unidade)
          )
        ) {
          atual.unidades.push(professor.unidade);
        }

        atual.concluidas += professor.concluidas || 0;
        atual.pendentes += professor.pendentes || 0;
        atual.justificadas += professor.justificadas || 0;
      });

      lista = Array.from(agrupados.values()).map((professor) => {
        const total =
          professor.concluidas +
          professor.pendentes +
          professor.justificadas;

        return {
          ...professor,
          total,
          percentual: total
            ? Math.round(
                (professor.concluidas / total) * 100
              )
            : 0,
        };
      });
    }

    // Ordenação
    if (ordenacao === "concluidas") {
      lista.sort(
        (a, b) =>
          b.concluidas - a.concluidas ||
          b.percentual - a.percentual ||
          a.nome.localeCompare(b.nome, "pt-BR")
      );
    }

    if (ordenacao === "percentual") {
      lista.sort(
        (a, b) =>
          b.percentual - a.percentual ||
          b.concluidas - a.concluidas
      );
    }

    if (ordenacao === "az") {
      lista.sort((a, b) =>
        a.nome.localeCompare(b.nome, "pt-BR")
      );
    }

    if (ordenacao === "za") {
      lista.sort((a, b) =>
        b.nome.localeCompare(a.nome, "pt-BR")
      );
    }

    return lista.slice(0, 10);
  }, [professores, unidadeSelecionada, ordenacao]);

  const totalProfessores = useMemo(() => {
    if (unidadeSelecionada === "todas") {
      return new Set(
        professores.map(
          (professor) =>
            professor.uid ||
            normalizarTexto(professor.email) ||
            normalizarTexto(professor.nome)
        )
      ).size;
    }

    return professores.filter(
      (professor) =>
        normalizarTexto(professor.unidade) ===
        normalizarTexto(unidadeSelecionada)
    ).length;
  }, [professores, unidadeSelecionada]);

  const opcoesUnidades = useMemo(() => {
    return [...new Set(unidades)].sort((a, b) =>
      a.localeCompare(b, "pt-BR")
    );
  }, [unidades]);

  function obterPosicao(index) {
    if (index === 0) return "1º";
    if (index === 1) return "2º";
    if (index === 2) return "3º";
    return `${index + 1}º`;
  }

  function obterCorPosicao(index) {
    if (index === 0) {
      return "bg-yellow-100 text-yellow-700";
    }

    if (index === 1) {
      return "bg-gray-100 text-gray-600";
    }

    if (index === 2) {
      return "bg-orange-100 text-orange-700";
    }

    return "bg-gray-50 text-gray-500";
  }

  return (
    <section className="mt-10 space-y-4">

      {/* CABEÇALHO */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-pensi-yellow/20">
            <Trophy
              size={18}
              className="text-gray-900"
            />
          </div>

          <div>
            <h2 className="text-lg font-black text-gray-900">
              Top 10 professores
            </h2>

            <p className="text-[11px] font-medium text-gray-400">
              Desempenho no período selecionado
            </p>
          </div>
        </div>

        <span className="rounded-full bg-gray-100 px-3 py-1.5 text-[10px] font-black text-gray-500">
          {totalProfessores} professores
        </span>
      </div>

      {/* CARD */}
      <div className="overflow-hidden rounded-[28px] border border-gray-100 bg-white shadow-sm">

        {/* FILTROS */}
        <div className="border-b border-gray-100 px-4 py-4 sm:px-5">

          <div className="mb-3 flex items-center gap-2">
            <Filter size={13} className="text-gray-400" />

            <span className="text-[11px] font-bold text-gray-500">
              Filtrar ranking
            </span>
          </div>

          {/* FILTRO DE UNIDADE */}
          <div className="relative mb-3">
            <button
              type="button"
              onClick={() =>
                setMostrarFiltroUnidade(!mostrarFiltroUnidade)
              }
              className="flex max-w-full items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-2 text-[11px] font-bold text-gray-700 transition hover:bg-gray-100"
            >
              <span className="max-w-[220px] truncate">
                {unidadeSelecionada === "todas"
                  ? "Todas as unidades"
                  : unidadeSelecionada}
              </span>

              <ChevronDown
                size={13}
                className={`shrink-0 transition ${
                  mostrarFiltroUnidade ? "rotate-180" : ""
                }`}
              />
            </button>

            {mostrarFiltroUnidade && (
              <div className="absolute left-0 top-full z-30 mt-2 max-h-56 w-64 overflow-y-auto rounded-2xl border border-gray-100 bg-white p-2 shadow-xl">

                <button
                  type="button"
                  onClick={() => {
                    setUnidadeSelecionada("todas");
                    setMostrarFiltroUnidade(false);
                  }}
                  className={`w-full rounded-xl px-3 py-2.5 text-left text-xs font-bold transition ${
                    unidadeSelecionada === "todas"
                      ? "bg-pensi-yellow/30 text-gray-900"
                      : "text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  Todas as unidades
                </button>

                {opcoesUnidades.map((unidade) => (
                  <button
                    type="button"
                    key={unidade}
                    onClick={() => {
                      setUnidadeSelecionada(unidade);
                      setMostrarFiltroUnidade(false);
                    }}
                    className={`w-full rounded-xl px-3 py-2.5 text-left text-xs font-bold transition ${
                      normalizarTexto(unidadeSelecionada) ===
                      normalizarTexto(unidade)
                        ? "bg-pensi-yellow/30 text-gray-900"
                        : "text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    {unidade}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ORDENAÇÃO EM PÍLULAS */}
          <div className="flex flex-wrap items-center gap-1.5">

            {[
              { id: "concluidas", label: "Mais aulas" },
              { id: "percentual", label: "Maior taxa" },
              { id: "az", label: "A–Z" },
              { id: "za", label: "Z–A" },
            ].map((item) => (
              <button
                type="button"
                key={item.id}
                onClick={() => setOrdenacao(item.id)}
                className={`rounded-full px-3 py-1.5 text-[10px] font-bold transition ${
                  ordenacao === item.id
                    ? "bg-black text-white"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* LISTA DE PROFESSORES */}
        <div className="px-4 sm:px-5">

          {ranking.length > 0 ? (
            <div className="divide-y divide-gray-100">

              {ranking.map((professor, index) => {
                const percentual = Math.min(
                  professor.percentual || 0,
                  100
                );

                return (
                  <div
                    key={
                      professor.uid ||
                      professor.email ||
                      professor.nome
                    }
                    className="group py-4"
                  >
                    <div className="flex items-center gap-3">

                      {/* POSIÇÃO */}
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-black ${obterCorPosicao(
                          index
                        )}`}
                      >
                        {index < 3 ? (
                          <Medal size={17} />
                        ) : (
                          obterPosicao(index)
                        )}
                      </div>

                      {/* PROFESSOR */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="truncate text-[12px] font-black text-gray-900">
                            {professor.nome}
                          </h3>

                          {index === 0 && (
                            <Trophy
                              size={12}
                              className="shrink-0 text-yellow-500"
                            />
                          )}
                        </div>

                        <p className="mt-0.5 truncate text-[10px] font-medium text-gray-400">
                          {professor.unidades?.length
                            ? professor.unidades.join(", ")
                            : professor.unidade}
                        </p>
                      </div>

                      {/* RESULTADO */}
                      <div className="shrink-0 text-right">
                        <p className="text-xs font-black tabular-nums text-gray-900">
                          {professor.concluidas}{" "}
                          <span className="font-medium text-gray-400">
                            aulas
                          </span>
                        </p>

                        <p className="mt-0.5 text-[10px] font-bold text-gray-400">
                          {percentual}% concluído
                        </p>
                      </div>
                    </div>

                    {/* BARRA DE PROGRESSO */}
                    <div className="ml-12 mt-3 flex items-center gap-3">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-100">
                        <div
                          className="h-full rounded-full bg-pensi-yellow transition-all duration-700"
                          style={{
                            width: `${percentual}%`,
                          }}
                        />
                      </div>

                      <span className="min-w-[55px] text-right text-[9px] font-bold text-gray-400">
                        {professor.total} registros
                      </span>
                    </div>

                    {/* INDICADORES */}
                    <div className="ml-12 mt-2 flex flex-wrap items-center gap-3 text-[9px] font-bold text-gray-400">

                      <span className="flex items-center gap-1">
                        <CheckCircle2
                          size={11}
                          className="text-green-500"
                        />
                        {professor.concluidas} concluídas
                      </span>

                      <span className="flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
                        {professor.pendentes} pendentes
                      </span>

                      <span className="flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
                        {professor.justificadas} justificadas
                      </span>
                    </div>
                  </div>
                );
              })}

            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-50">
                <Users size={22} className="text-gray-300" />
              </div>

              <p className="text-sm font-black text-gray-700">
                Nenhum professor encontrado
              </p>

              <p className="mt-1 max-w-[230px] text-xs text-gray-400">
                Não existem registros de professores para esse filtro e período.
              </p>
            </div>
          )}
        </div>

        {/* RODAPÉ */}
        {ranking.length > 0 && (
          <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50/60 px-5 py-3">
            <div className="flex items-center gap-2">
              <TrendingUp size={14} className="text-gray-400" />

              <span className="text-[10px] font-bold text-gray-500">
                Ranking por aulas concluídas
              </span>
            </div>

            <span className="text-[10px] font-black text-gray-400">
              TOP {ranking.length}
            </span>
          </div>
        )}
      </div>
    </section>
  );
}
