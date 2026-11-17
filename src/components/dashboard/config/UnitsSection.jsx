
import {
  Building2,
  GraduationCap,
  ChevronDown,
  ChevronUp,
  Search,
  Trash2,
  Upload,
  Eye,
  EyeOff,
} from "lucide-react";

export default function UnitsSection({
  unidadesPermitidas,
  turmasFiltradas,
  totalTurmas,
  busca,
  setBusca,
  filtroUnidade,
  setFiltroUnidade,
  ehRegional,
  ehDirecao,
  podeGerenciar,
  secaoUnidadesVisivel,
  setSecaoUnidadesVisivel,
  unidadesAbertas,
  setUnidadesAbertas,
  excluirTurma,
  abrirImportacao,
  inputClass,
  buttonClass,
}) {
  return (
    <section className="space-y-4">
      {/* CABEÇALHO */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Building2 size={18} />

            <h2 className="text-lg font-black uppercase">
              Unidades e turmas
            </h2>
          </div>

          <p className="mt-1 text-xs text-gray-500">
            {unidadesPermitidas.length} unidades disponíveis · {totalTurmas} turmas encontradas
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {podeGerenciar && (
            <>
              <button
                onClick={abrirImportacao}
                className={`${buttonClass} bg-blue-200`}
              >
                <Upload size={14} />
                Importar CSV
              </button>

              <button
                onClick={() =>
                  setSecaoUnidadesVisivel((atual) => !atual)
                }
                className={`${buttonClass} bg-white`}
              >
                {secaoUnidadesVisivel ? (
                  <EyeOff size={14} />
                ) : (
                  <Eye size={14} />
                )}

                {secaoUnidadesVisivel
                  ? "Ocultar unidades"
                  : "Exibir unidades"}
              </button>
            </>
          )}
        </div>
      </div>

      

      {/* UNIDADES EM CAIXAS */}
      {secaoUnidadesVisivel && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {unidadesPermitidas
            .filter(
              (unidade) =>
                filtroUnidade === "Todas" ||
                filtroUnidade === unidade
            )
            .map((unidade) => {
              const lista = turmasFiltradas.filter(
                (item) => item.unidade === unidade
              );

              if (busca && !lista.length) return null;

              const aberto = unidadesAbertas[unidade] === true;

              return (
                <article
                  key={unidade}
                  className="min-w-0 overflow-hidden rounded-xl border-2 border-black bg-white shadow-[3px_3px_0_#000]"
                >
                  {/* CABEÇALHO DA UNIDADE */}
                  <button
                    onClick={() =>
                      setUnidadesAbertas((atual) => ({
                        ...atual,
                        [unidade]: !aberto,
                      }))
                    }
                    className="flex w-full items-center gap-3 p-3 text-left transition hover:bg-gray-50"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border-2 border-black bg-pensi-yellow">
                      <Building2 size={19} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-xs font-black uppercase">
                        {unidade}
                      </h3>

                      <p className="mt-1 text-[10px] font-semibold text-gray-500">
                        {lista.length}{" "}
                        {lista.length === 1 ? "turma" : "turmas"}
                      </p>
                    </div>

                    {aberto ? (
                      <ChevronUp size={17} className="shrink-0" />
                    ) : (
                      <ChevronDown size={17} className="shrink-0" />
                    )}
                  </button>

                  {/* TURMAS DA UNIDADE */}
                  {aberto && (
                    <div className="border-t-2 border-black bg-gray-50 p-3">
                      {lista.length === 0 ? (
                        <div className="rounded-lg border-2 border-dashed border-gray-300 p-5 text-center">
                          <GraduationCap
                            size={24}
                            className="mx-auto mb-2 text-gray-400"
                          />

                          <p className="text-xs font-bold text-gray-500">
                            Nenhuma turma cadastrada nesta unidade.
                          </p>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-2">
                          {lista.map((turma) => (
                            <div
                              key={turma.id}
                              className="flex min-w-0 items-center gap-3 rounded-lg border-2 border-gray-200 bg-white p-3"
                            >
                              {/* ÍCONE */}
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border-2 border-black bg-green-200">
                                <GraduationCap size={19} />
                              </div>

                              {/* INFORMAÇÕES */}
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-xs font-black text-gray-900">
                                  {turma.turma}
                                </p>

                                <div className="mt-1 flex flex-wrap gap-1">
                                  <span className="rounded-md border border-gray-300 bg-gray-100 px-1.5 py-0.5 text-[9px] font-bold text-gray-600">
                                    {turma.serie}
                                  </span>

                                  <span className="rounded-md border border-gray-300 bg-gray-100 px-1.5 py-0.5 text-[9px] font-bold text-gray-600">
                                    {turma.turno === "M"
                                      ? "Manhã"
                                      : "Tarde"}
                                  </span>
                                </div>
                              </div>

                              {/* EXCLUIR */}
                              {podeGerenciar && (
                                <button
                                  onClick={() => excluirTurma(turma)}
                                  title="Excluir turma"
                                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border-2 border-black bg-red-100 text-red-700 transition hover:bg-red-200"
                                >
                                  <Trash2 size={16} />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </article>
              );
            })}

          {/* NENHUMA UNIDADE */}
          {unidadesPermitidas.length === 0 && (
            <div className="col-span-full rounded-xl border-2 border-dashed border-gray-300 bg-white p-8 text-center">
              <Building2
                size={28}
                className="mx-auto mb-2 text-gray-400"
              />

              <p className="text-sm font-black">
                Nenhuma unidade disponível
              </p>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
