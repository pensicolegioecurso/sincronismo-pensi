
import { useState } from "react";
import {
  Calendar as CalendarIcon,
  Plus,
  MapPin,
  Trash2,
  BookOpen,
  Settings2,
  Eye,
  EyeOff,
  ChevronRight,
} from "lucide-react";

export default function CalendarsSection({
  podeGerenciar,
  ehDirecao,
  buttonClass,
  unidadeCalendario,
  setUnidadeCalendario,
  unidadesPermitidas,
  carregandoCal,
  calendarios,
  calcularDiasLetivos,
  abrirNovoCalendario,
  abrirExcecoes,
  excluirCalendario,
}) {
  const [calendariosVisiveis, setCalendariosVisiveis] = useState(false);

  return (
    <section className="space-y-4 pt-7">

      {/* CABEÇALHO */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <CalendarIcon size={18} />
            <h2 className="text-lg font-black uppercase">
              Calendários
            </h2>
          </div>

          <p className="mt-1 text-xs text-gray-500">
            Consulte os dias letivos e gerencie exceções.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setCalendariosVisiveis((atual) => !atual)}
            className="inline-flex w-auto flex-row items-center justify-center gap-2 whitespace-nowrap rounded-2xl border-2 border-black bg-white px-5 py-3 text-xs font-black uppercase tracking-wide text-black shadow-[4px_4px_0_#000] transition-colors hover:bg-gray-100"
          >
            {calendariosVisiveis ? (
              <>
                <EyeOff size={17} />
                Ocultar
              </>
            ) : (
              <>
                <Eye size={17} />
                Exibir
              </>
            )}
          </button>

          {podeGerenciar && (
            <button
              onClick={abrirNovoCalendario}
              className={`${buttonClass} border-2 border-black bg-pensi-yellow shadow-[3px_3px_0_#000] transition-colors hover:bg-yellow-300`}
            >
              <Plus size={14} />
              Novo calendário
            </button>
          )}
        </div>
      </div>

      {/* CONTEÚDO */}
      {calendariosVisiveis && (
        <div className="space-y-5">

          {/* FILTRO DE UNIDADE */}
          <div className="flex flex-wrap items-center gap-3 rounded-xl border-2 border-black bg-white p-3 shadow-[4px_4px_0_#000]">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border-2 border-black bg-pensi-yellow">
              <MapPin size={18} />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-[9px] font-black uppercase tracking-[0.15em] text-gray-500">
                Visualizando calendários de
              </p>

              <select
                value={unidadeCalendario}
                onChange={(event) =>
                  setUnidadeCalendario(event.target.value)
                }
                disabled={ehDirecao}
                className="mt-0.5 w-full bg-transparent text-sm font-black text-black outline-none disabled:opacity-60"
              >
                {!ehDirecao && (
                  <option value="Todas">Todas as unidades</option>
                )}

                {unidadesPermitidas.map((unidade) => (
                  <option key={unidade} value={unidade}>
                    {unidade}
                  </option>
                ))}
              </select>
            </div>

            <span className="hidden rounded-md border-2 border-black bg-gray-100 px-2 py-1 text-[9px] font-black uppercase sm:block">
              Unidade ativa
            </span>
          </div>

          {/* CARREGAMENTO */}
          {carregandoCal ? (
            <div className="rounded-xl border-2 border-black bg-white p-8 text-center shadow-[4px_4px_0_#000]">
              <CalendarIcon
                size={28}
                className="mx-auto mb-3 animate-pulse"
              />

              <p className="text-xs font-black uppercase">
                Carregando calendários...
              </p>
            </div>

          ) : calendarios.length === 0 ? (

            /* ESTADO VAZIO */
            <div className="rounded-xl border-2 border-dashed border-black bg-white p-8 text-center">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-xl border-2 border-black bg-pensi-yellow shadow-[3px_3px_0_#000]">
                <CalendarIcon size={26} />
              </div>

              <p className="text-sm font-black uppercase">
                Nenhum calendário cadastrado
              </p>

              <p className="mt-1 text-xs text-gray-500">
                Cadastre um calendário para começar.
              </p>
            </div>

          ) : (

            /* CARDS DE CALENDÁRIOS */
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              {calendarios.map((cal) => {
                const excecoes = (cal.excecoes || []).filter(
                  (item) =>
                    item.unidade ===
                    (unidadeCalendario === "Todas"
                      ? null
                      : unidadeCalendario)
                );

                return (
                  <article
                    key={cal.id}
                    className="overflow-hidden rounded-xl border-[2.5px] border-black bg-white shadow-[5px_5px_0_#000]"
                  >
                    {/* CABEÇALHO AMARELO */}
                    <div className="flex items-center justify-between gap-3 border-b-[2.5px] border-black bg-pensi-yellow p-4">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border-2 border-black bg-white shadow-[2px_2px_0_#000]">
                          <CalendarIcon size={20} />
                        </div>

                        <div className="min-w-0">
                          <h3 className="truncate text-sm font-black uppercase tracking-wide text-black">
                            {cal.nome}
                          </h3>

                          <p className="mt-0.5 text-[9px] font-black uppercase tracking-widest text-black/60">
                            Calendário acadêmico
                          </p>
                        </div>
                      </div>

                      {podeGerenciar && (
                        <button
                          onClick={() => excluirCalendario(cal)}
                          title="Excluir calendário"
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border-2 border-black bg-white shadow-[2px_2px_0_#000] transition-colors hover:bg-red-200"
                        >
                          <Trash2 size={16} className="text-red-700" />
                        </button>
                      )}
                    </div>

                    {/* CONTEÚDO */}
                    <div className="space-y-4 p-4">

                      {/* PERÍODO */}
                      <div>
                        <div className="mb-2 flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full border border-black bg-pensi-yellow" />

                          <p className="text-[10px] font-black uppercase tracking-widest">
                            Período letivo
                          </p>
                        </div>

                        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                          <div className="rounded-lg border-2 border-black bg-gray-100 p-3 shadow-[2px_2px_0_#000]">
                            <p className="text-[9px] font-black uppercase text-gray-500">
                              Início
                            </p>

                            <p className="mt-1 text-sm font-black tabular-nums">
                              {new Date(
                                `${cal.inicio}T12:00:00`
                              ).toLocaleDateString("pt-BR")}
                            </p>
                          </div>

                          <ChevronRight size={19} strokeWidth={3} />

                          <div className="rounded-lg border-2 border-black bg-gray-100 p-3 shadow-[2px_2px_0_#000]">
                            <p className="text-[9px] font-black uppercase text-gray-500">
                              Término
                            </p>

                            <p className="mt-1 text-sm font-black tabular-nums">
                              {new Date(
                                `${cal.fim}T12:00:00`
                              ).toLocaleDateString("pt-BR")}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* DIAS LETIVOS */}
                      <div className="relative flex items-center justify-between gap-3 overflow-hidden rounded-xl border-2 border-black bg-green-200 p-4 shadow-[3px_3px_0_#000]">
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 items-center justify-center rounded-lg border-2 border-black bg-white shadow-[2px_2px_0_#000]">
                            <BookOpen size={20} />
                          </div>

                          <div>
                            <p className="text-xs font-black uppercase tracking-wide">
                              Dias letivos
                            </p>

                            <p className="text-[9px] font-bold uppercase text-green-900">
                              Total do calendário
                            </p>
                          </div>
                        </div>

                        <span className="text-4xl font-black tabular-nums tracking-tighter">
                          {calcularDiasLetivos(cal)}
                        </span>
                      </div>

                      {/* RODAPÉ */}
                      <div className="flex flex-wrap items-center justify-between gap-3 border-t-2 border-black pt-3">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg border-2 border-black bg-pensi-yellow">
                            <Settings2 size={15} />
                          </div>

                          <div>
                            <p className="text-xs font-black uppercase">
                              {excecoes.length}{" "}
                              {excecoes.length === 1
                                ? "exceção"
                                : "exceções"}
                            </p>

                            <p className="text-[9px] font-bold text-gray-500">
                              Em {unidadeCalendario}
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => abrirExcecoes(cal)}
                          className="flex items-center gap-2 rounded-lg border-2 border-black bg-white px-3 py-2.5 text-[10px] font-black uppercase shadow-[3px_3px_0_#000] transition-colors hover:bg-pensi-yellow"
                        >
                          <Settings2 size={14} />
                          Gerenciar dias
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
