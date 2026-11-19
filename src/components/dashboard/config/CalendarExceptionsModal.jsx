
import { Calendar as CalendarIcon, Trash2 } from "lucide-react";
import Modal from "./Modal";
import Field from "./Field";

function nomeUnidade(valor) {
  if (typeof valor === "string") return valor;
  return valor?.nome || valor?.unidade || valor?.label || "";
}

export default function CalendarExceptionsModal({
  calendario,
  onClose,
  adicionarExcecao,
  excecao,
  setExcecao,
  unidadeCalendario,
  SERIES_DISPONIVEIS,
  turmas = [],
  inputClass,
  buttonClass,
  salvando,
  erro,
  excecoesDaUnidade = [],
  removerExcecao,
  podeGerenciar,
  podeAdicionarGeral,
  ehDirecao,
  ehRegional,
}) {
  const turmasDaUnidade = turmas.filter(
    (item) =>
      nomeUnidade(item.unidade) === unidadeCalendario &&
      item.ativo !== false
  );

  const podeAdicionarNestaUnidade =
    podeGerenciar &&
    (unidadeCalendario !== "Todas" || podeAdicionarGeral);

  const turmasOrdenadas = [...turmasDaUnidade].sort((a, b) =>
    String(a.turma || "").localeCompare(
      String(b.turma || ""),
      "pt-BR"
    )
  );

  return (
    <Modal
      titulo={`Exceções · ${calendario.nome}`}
      tamanho="max-w-3xl"
      onClose={onClose}
    >
      <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-2">
        {podeAdicionarNestaUnidade && (
          <form
            onSubmit={adicionarExcecao}
            className="h-fit space-y-3 rounded-xl border-2 border-black bg-gray-50 p-4"
          >
            <h4 className="border-b-2 border-dashed border-gray-300 pb-2 text-xs font-black uppercase">
              Adicionar exceção
            </h4>

            <div className="rounded-lg border-2 border-black bg-yellow-100 p-3">
              <p className="text-[10px] font-black uppercase text-gray-600">
                Unidade selecionada
              </p>

              <p className="text-sm font-black">
                {unidadeCalendario}
              </p>

              <p className="mt-1 text-[10px] font-semibold text-gray-600">
                {unidadeCalendario === "Todas"
                  ? "Esta exceção será geral (todas as unidades)."
                  : "Esta exceção afetará somente esta unidade."}
              </p>
            </div>

            {erro && (
              <p className="text-xs font-bold text-red-600">
                {erro}
              </p>
            )}

            <div className="grid grid-cols-2 gap-2">
              <Field label="Data inicial">
                <input
                  type="date"
                  required
                  value={excecao.dataInicio}
                  onChange={(event) =>
                    setExcecao((atual) => ({
                      ...atual,
                      dataInicio: event.target.value,
                    }))
                  }
                  className={inputClass}
                />
              </Field>

              <Field label="Data final">
                <input
                  type="date"
                  value={excecao.dataFim}
                  min={excecao.dataInicio || undefined}
                  onChange={(event) =>
                    setExcecao((atual) => ({
                      ...atual,
                      dataFim: event.target.value,
                    }))
                  }
                  className={inputClass}
                />
              </Field>
            </div>

            <Field label="Motivo">
              <input
                value={excecao.motivo}
                onChange={(event) =>
                  setExcecao((atual) => ({
                    ...atual,
                    motivo: event.target.value,
                  }))
                }
                placeholder="Ex.: Feriado municipal"
                className={inputClass}
              />
            </Field>

            <Field label="Aplicar em">
              <select
                value={excecao.tipo}
                onChange={(event) =>
                  setExcecao((atual) => ({
                    ...atual,
                    tipo: event.target.value,
                    serie: "",
                    turma: "",
                  }))
                }
                className={inputClass}
              >
                <option value="todas">Toda a unidade</option>
                <option value="serie">Uma série específica</option>
                <option value="turma">Uma turma específica</option>
              </select>
            </Field>

            {excecao.tipo === "serie" && (
              <Field label="Série">
                <select
                  required
                  value={excecao.serie}
                  onChange={(event) =>
                    setExcecao((atual) => ({
                      ...atual,
                      serie: event.target.value,
                    }))
                  }
                  className={inputClass}
                >
                  <option value="">Selecione uma série</option>

                  {SERIES_DISPONIVEIS.map((serie) => (
                    <option key={serie} value={serie}>
                      {serie}
                    </option>
                  ))}
                </select>
              </Field>
            )}

            {excecao.tipo === "turma" && (
              <Field label="Turma">
                <select
                  required
                  value={excecao.turma}
                  onChange={(event) =>
                    setExcecao((atual) => ({
                      ...atual,
                      turma: event.target.value,
                    }))
                  }
                  className={inputClass}
                >
                  <option value="">Selecione uma turma</option>

                  {turmasOrdenadas.map((item) => (
                    <option key={item.id} value={item.turma}>
                      {item.turma}
                    </option>
                  ))}
                </select>

                {turmasOrdenadas.length === 0 && (
                  <p className="mt-1 text-[10px] font-semibold text-red-600">
                    Nenhuma turma encontrada para esta unidade.
                  </p>
                )}
              </Field>
            )}

            <button
              type="submit"
              disabled={
                salvando ||
                (excecao.tipo === "turma" &&
                  turmasOrdenadas.length === 0)
              }
              className={`${buttonClass} w-full bg-pensi-yellow`}
            >
              {salvando ? "Salvando..." : "Adicionar exceção"}
            </button>
          </form>
        )}

        <div className="max-h-[480px] overflow-y-auto rounded-xl border-2 border-black bg-white">
          {excecoesDaUnidade.length === 0 ? (
            <div className="flex min-h-48 flex-col items-center justify-center p-6 text-center text-gray-400">
              <CalendarIcon size={28} className="mb-2" />

              <p className="text-xs font-bold">
                Nenhuma exceção cadastrada para esta unidade.
              </p>
            </div>
          ) : (
            excecoesDaUnidade.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-3 border-b border-gray-200 p-3 last:border-0"
              >
                <div className="min-w-0">
                  <p className="text-xs font-black">
                    {new Date(
                      `${item.dataInicio}T12:00:00`
                    ).toLocaleDateString("pt-BR")}

                    {item.dataFim &&
                      item.dataFim !== item.dataInicio &&
                      ` até ${new Date(
                        `${item.dataFim}T12:00:00`
                      ).toLocaleDateString("pt-BR")}`}
                  </p>

                  <p className="mt-1 truncate text-[10px] font-semibold text-gray-500">
                    {item.motivo} ·{" "}
                    {item.tipo === "todas"
                      ? "Toda a unidade"
                      : item.tipo === "serie"
                        ? item.serie
                        : item.turma}
                  </p>
                </div>

                {podeGerenciar && (
                  <button
                    type="button"
                    onClick={() => removerExcecao(item.id)}
                    title="Remover exceção"
                    className="shrink-0 rounded-lg border-2 border-black bg-red-100 p-2 text-red-700 hover:bg-red-200"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </Modal>
  );
}
