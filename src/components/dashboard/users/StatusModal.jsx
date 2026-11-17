
import { useState } from "react";
import { createPortal } from "react-dom";
import {
  X, GraduationCap, Plus, Building2,
  Check, LockKeyhole, Users,
} from "lucide-react";
import { parseTurmasPorUnidade, chaveTurma } from "../../../utils/turmas";

const dots = ["bg-[#F5B800]", "bg-[#D7E7FF]", "bg-[#F4D5E5]"];

export default function StatusModal({
  user,
  ehRegional,
  perfilAtivo,
  unidadesEscopo,
  todasTurmasDb,
  todasUnidades,
  processando,
  onClose,
  onSave,
  onAddUnit,
}) {
  const [unidadesInativasTemp, setUnidadesInativasTemp] = useState([
    ...(user.unidadesInativas || []),
  ]);
  const [turmasInativasTemp, setTurmasInativasTemp] = useState([
    ...(user.turmasInativas || []),
  ]);
  const [unidadeParaAdicionar, setUnidadeParaAdicionar] = useState("");
  const [turmaParaAdicionar, setTurmaParaAdicionar] = useState("");
  const [unidadeDaTurmaNova, setUnidadeDaTurmaNova] = useState("");

  const cargosUsuario = (user.cargos || []).map((cargo) =>
    String(cargo).toLowerCase().trim()
  );

  const turmasHerdadas = cargosUsuario.some((cargo) =>
    ["diretor", "coordenador", "regional"].includes(cargo)
  );

  const podeAdicionarUnidade = [
    "admin", "nucleo", "diretor", "coordenador",
  ].includes(perfilAtivo);

  const podeAdicionarTurma =
    ["admin", "nucleo"].includes(perfilAtivo) && !turmasHerdadas;

  const turmasDoUsuario = parseTurmasPorUnidade(user.turmas);
  const unidadesDoUser = (user.unidade || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  const unidadesVisiveis = unidadesDoUser.filter((unidade) =>
    ehRegional ? (unidadesEscopo || []).includes(unidade) : true
  );

  const turmasPorUnidade = Object.fromEntries(
    unidadesVisiveis.map((unidade) => [
      unidade,
      [...new Set([
        ...(turmasDoUsuario[unidade] || []),
        ...todasTurmasDb
          .filter((item) => item.unidade === unidade)
          .map((item) => item.turma),
      ])],
    ])
  );

  const unidadesDisponiveis = todasUnidades.filter(
    (unidade) => !unidadesDoUser.includes(unidade)
  );

  const turmasDisponiveis = todasTurmasDb.filter(
    (item) =>
      item.unidade === unidadeDaTurmaNova &&
      !(turmasDoUsuario[unidadeDaTurmaNova] || []).includes(item.turma)
  );

  const totalTurmas = Object.values(turmasPorUnidade).reduce(
    (total, turmas) => total + turmas.length,
    0
  );

  const totalUnidadesAtivas = unidadesVisiveis.filter(
    (unidade) => !unidadesInativasTemp.includes(unidade)
  ).length;

  const salvarTurmas = async (mapa) => {
    const novaString = Object.entries(mapa)
      .map(([unidade, turmas]) => `${unidade}: ${turmas.join(", ")}`)
      .join(" | ");

    await onAddUnit(user.id, user.unidade, novaString);
  };

  const adicionarUnidade = async () => {
    if (!unidadeParaAdicionar) return;

    const mapa = parseTurmasPorUnidade(user.turmas);
    const novasUnidades = [...unidadesDoUser, unidadeParaAdicionar].join(",");

    mapa[unidadeParaAdicionar] = [
      ...new Set([
        ...(mapa[unidadeParaAdicionar] || []),
        ...todasTurmasDb
          .filter((item) => item.unidade === unidadeParaAdicionar)
          .map((item) => item.turma),
      ]),
    ];

    const novaString = Object.entries(mapa)
      .map(([unidade, turmas]) => `${unidade}: ${turmas.join(", ")}`)
      .join(" | ");

    await onAddUnit(user.id, novasUnidades, novaString);
    setUnidadeParaAdicionar("");
  };

  const adicionarTurma = async () => {
    if (!turmaParaAdicionar || !unidadeDaTurmaNova) return;

    const mapa = parseTurmasPorUnidade(user.turmas);
    mapa[unidadeDaTurmaNova] = [
      ...new Set([
        ...(mapa[unidadeDaTurmaNova] || []),
        turmaParaAdicionar,
      ]),
    ];

    await salvarTurmas(mapa);
    setTurmaParaAdicionar("");
  };

  const alternarUnidade = (unidade) => {
    setUnidadesInativasTemp((atual) =>
      atual.includes(unidade)
        ? atual.filter((item) => item !== unidade)
        : [...atual, unidade]
    );
  };

  const alternarTurma = (chave) => {
    if (turmasHerdadas) return;

    setTurmasInativasTemp((atual) =>
      atual.includes(chave)
        ? atual.filter((item) => item !== chave)
        : [...atual, chave]
    );
  };

  const alternarTodasTurmas = (unidade, turmas, ativar) => {
    const chaves = turmas.map((turma) => chaveTurma(unidade, turma));

    setTurmasInativasTemp((atual) =>
      ativar
        ? atual.filter((chave) => !chaves.includes(chave))
        : [...new Set([...atual, ...chaves])]
    );
  };

  const campoSelect =
    "min-w-0 flex-1 rounded-lg border-2 border-black bg-white px-3 py-2.5 text-xs font-semibold outline-none focus:ring-2 focus:ring-[#F5B800]";

  const botaoAmarelo =
    "flex items-center justify-center gap-2 rounded-lg border-2 border-black bg-pensi-yellow px-5 py-2.5 text-[10px] font-black uppercase shadow-[3px_3px_0px_#000] transition hover:translate-y-[-1px] hover:shadow-[4px_4px_0px_#000] active:translate-y-0 active:shadow-none disabled:cursor-not-allowed disabled:opacity-40";

  const secao =
    "overflow-hidden rounded-xl border-2 border-black bg-white shadow-[3px_3px_0px_#000]";

  return createPortal(
    <div
      className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/60 p-3 backdrop-blur-sm sm:p-5"
      onClick={onClose}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="status-modal-title"
        onClick={(event) => event.stopPropagation()}
        className="flex max-h-[88dvh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border-[3px] border-black bg-[#F7F7F5] shadow-[8px_8px_0px_#000]"
      >
        {/* CABEÇALHO */}
        <header className="shrink-0 border-b-2 border-black bg-white px-5 pb-4 pt-4 sm:px-6">
          <div className="mb-4 flex items-center gap-1.5">
            {dots.map((color, index) => (
              <span
                key={index}
                className={`h-3.5 w-3.5 rounded-full border border-black/30 ${color}`}
              />
            ))}
        
            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar"
              className="ml-auto flex h-8 w-8 items-center justify-center rounded-lg border border-gray-300 text-gray-600 transition hover:border-black hover:bg-pensi-yellow hover:text-black"
            >
              <X size={18} />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2 border-black bg-pensi-yellow shadow-[2px_2px_0px_#000]">
              <Users size={19} strokeWidth={2.5} />
            </div>
            <div className="min-w-0">
              <h2
                id="status-modal-title"
                className="text-lg font-black uppercase leading-tight tracking-tight sm:text-xl"
              >
                Acessos e permissões
              </h2>
              <p className="mt-0.5 text-[11px] text-gray-500">
                Gerenciamento de unidades e turmas
              </p>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded-md border-2 border-black bg-pensi-yellow px-3 py-1 text-[10px] font-black uppercase shadow-[2px_2px_0px_#000]">
              {user.nome}
            </span>
            {cargosUsuario.map((cargo) => (
              <span
                key={cargo}
                className="rounded-md border border-gray-300 bg-gray-100 px-2.5 py-1 text-[9px] font-black uppercase text-gray-700"
              >
                {cargo}
              </span>
            ))}
          </div>
        </header>

        {/* RESUMO */}
        <div className="grid shrink-0 grid-cols-2 gap-3 border-b-2 border-black bg-pensi-yellow p-3 sm:grid-cols-3 sm:p-4">
          {[
            {
              label: "Unidades",
              value: `${totalUnidadesAtivas}/${unidadesVisiveis.length}`,
              icon: Building2,
            },
            { label: "Turmas", value: totalTurmas, icon: GraduationCap },
            {
              label: "Modelo",
              value: turmasHerdadas ? "Herdado" : "Individual",
              icon: LockKeyhole,
              hidden: true,
            },
          ].map(({ label, value, icon: Icon, hidden }) => (
            <div
              key={label}
              className={`${hidden ? "col-span-2 hidden sm:col-span-1 sm:block" : ""} rounded-lg border-2 border-black bg-white p-3 shadow-[3px_3px_0px_#000]`}
            >
              <div className="flex items-center gap-2 text-gray-500">
                <Icon size={14} />
                <span className="text-[9px] font-black uppercase">{label}</span>
              </div>
              <p className="mt-1 text-xl font-black text-gray-900 sm:text-2xl">
                {value}
              </p>
            </div>
          ))}
        </div>

        {/* CONTEÚDO */}
        <main className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4 sm:p-5">
          {turmasHerdadas && (
            <div className="overflow-hidden rounded-xl border-2 border-black bg-[#DCEBFF] shadow-[3px_3px_0px_#000]">
              <div className="flex items-center gap-3 border-b-2 border-black bg-[#B9D5FF] px-3 py-2.5">
                <LockKeyhole size={17} />
                <h3 className="text-xs font-black uppercase">
                  Acesso automático às turmas
                </h3>
              </div>
              <div className="p-3">
                <p className="text-xs leading-relaxed text-gray-800">
                  Este usuário recebe automaticamente todas as turmas das
                  unidades vinculadas ao seu perfil. O gerenciamento individual
                  de turmas não está disponível para este cargo.
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="flex items-center gap-1 rounded-md border border-black bg-white px-2 py-1 text-[9px] font-black uppercase">
                    <Check size={12} /> Turmas herdadas
                  </span>
                  <span className="flex items-center gap-1 rounded-md border border-black bg-white px-2 py-1 text-[9px] font-black uppercase">
                    <LockKeyhole size={12} /> Edição bloqueada
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ADICIONAR UNIDADE */}
          {podeAdicionarUnidade && unidadesDisponiveis.length > 0 && (
            <section className={secao}>
              <div className="flex items-center gap-3 border-b-2 border-black bg-[#FFF7D6] px-3 py-2.5">
                <Plus size={18} />
                <div>
                  <h3 className="text-xs font-black uppercase">Adicionar unidade</h3>
                  <p className="text-[9px] text-gray-500">
                    Vincular uma nova unidade ao usuário
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-2 p-3 sm:flex-row">
                <select
                  value={unidadeParaAdicionar}
                  onChange={(event) => setUnidadeParaAdicionar(event.target.value)}
                  className={campoSelect}
                >
                  <option value="">Selecione uma unidade...</option>
                  {unidadesDisponiveis.map((unidade) => (
                    <option key={unidade} value={unidade}>{unidade}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={adicionarUnidade}
                  disabled={!unidadeParaAdicionar}
                  className={botaoAmarelo}
                >
                  <Plus size={15} /> Adicionar
                </button>
              </div>
            </section>
          )}

          {/* ADICIONAR TURMA */}
          {podeAdicionarTurma && (
            <section className={secao}>
              <div className="flex items-center gap-3 border-b-2 border-black bg-[#EAF1FC] px-3 py-2.5">
                <GraduationCap size={18} />
                <div>
                  <h3 className="text-xs font-black uppercase">Adicionar nova turma</h3>
                  <p className="text-[9px] text-gray-500">
                    Vincular uma turma específica ao usuário
                  </p>
                </div>
              </div>
              <div className="space-y-2 p-3">
                <select
                  value={unidadeDaTurmaNova}
                  onChange={(event) => {
                    setUnidadeDaTurmaNova(event.target.value);
                    setTurmaParaAdicionar("");
                  }}
                  className={campoSelect}
                >
                  <option value="">Selecione a unidade...</option>
                  {unidadesDoUser.map((unidade) => (
                    <option key={unidade} value={unidade}>{unidade}</option>
                  ))}
                </select>

                {unidadeDaTurmaNova && (
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <select
                      value={turmaParaAdicionar}
                      onChange={(event) => setTurmaParaAdicionar(event.target.value)}
                      className={campoSelect}
                    >
                      <option value="">Selecione a turma...</option>
                      {turmasDisponiveis.map((item) => (
                        <option key={item.id} value={item.turma}>
                          {item.turma}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={adicionarTurma}
                      disabled={!turmaParaAdicionar}
                      className={botaoAmarelo}
                    >
                      <Plus size={15} /> Adicionar
                    </button>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* UNIDADES VINCULADAS */}
          <section>
            <div className="mb-3 flex items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-black uppercase tracking-tight">
                  Unidades vinculadas
                </h3>
                <p className="mt-0.5 text-[10px] font-medium text-gray-500">
                  Gerencie a disponibilidade de cada unidade
                </p>
              </div>
              <span className="rounded-md border-2 border-black bg-pensi-yellow px-2.5 py-1 text-[9px] font-black uppercase shadow-[2px_2px_0px_#000]">
                {unidadesVisiveis.length} unidades
              </span>
            </div>

            {unidadesVisiveis.length === 0 ? (
              <div className="rounded-xl border-2 border-dashed border-black bg-white p-8 text-center">
                <Building2 size={28} className="mx-auto mb-2 text-gray-400" />
                <p className="text-xs font-black uppercase">
                  Nenhuma unidade cadastrada
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {unidadesVisiveis.map((unidade) => {
                  const turmas = turmasPorUnidade[unidade] || [];
                  const unidadeAtiva = !unidadesInativasTemp.includes(unidade);
                  const turmasAtivas = turmasHerdadas
                    ? turmas.length
                    : turmas.filter(
                        (turma) =>
                          !turmasInativasTemp.includes(chaveTurma(unidade, turma))
                      ).length;

                  return (
                    <article
                      key={unidade}
                      className="overflow-hidden rounded-xl border-2 border-black bg-white shadow-[3px_3px_0px_#000]"
                    >
                      <label
                        className={`flex cursor-pointer items-center gap-3 border-b-2 border-black p-3 ${
                          unidadeAtiva ? "bg-[#E5E7EB]" : "bg-gray-200"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={unidadeAtiva}
                          onChange={() => alternarUnidade(unidade)}
                          className="h-5 w-5 shrink-0 accent-black"
                        />
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border-2 border-black bg-white shadow-[2px_2px_0px_#000]">
                          <Building2 size={19} strokeWidth={2.5} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="truncate text-sm font-black uppercase">
                            {unidade}
                          </h4>
                          <p className="mt-0.5 text-[9px] font-bold uppercase text-gray-600">
                            {turmas.length} {turmas.length === 1 ? "turma cadastrada" : "turmas cadastradas"}
                          </p>
                        </div>
                        <span
                          className={`shrink-0 rounded-md border-2 border-black px-2.5 py-1 text-[9px] font-black uppercase shadow-[2px_2px_0px_#000] ${
                            unidadeAtiva ? "bg-[#B9F6C8]" : "bg-white text-gray-500"
                          }`}
                        >
                          {unidadeAtiva ? "Ativa" : "Inativa"}
                        </span>
                      </label>

                      <div className="p-3">
                        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <GraduationCap size={17} />
                            <span className="text-[10px] font-black uppercase tracking-wide">
                              Turmas disponíveis
                            </span>
                          </div>
                          <span className="text-[9px] font-black uppercase text-gray-500">
                            {turmasAtivas}/{turmas.length} ativas
                          </span>
                        </div>

                        {turmas.length === 0 ? (
                          <p className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4 text-center text-[10px] font-bold text-gray-400">
                            Nenhuma turma cadastrada nesta unidade.
                          </p>
                        ) : (
                          <>
                            {!turmasHerdadas && (
                              <div className="mb-3 flex flex-wrap gap-2">
                                <button
                                  type="button"
                                  disabled={!unidadeAtiva}
                                  onClick={() => alternarTodasTurmas(unidade, turmas, true)}
                                  className="rounded-md border-2 border-black bg-[#B9F6C8] px-3 py-1.5 text-[9px] font-black uppercase shadow-[2px_2px_0px_#000] disabled:opacity-40"
                                >
                                  Ativar todas
                                </button>
                                <button
                                  type="button"
                                  disabled={!unidadeAtiva}
                                  onClick={() => alternarTodasTurmas(unidade, turmas, false)}
                                  className="rounded-md border-2 border-black bg-[#FFCCCC] px-3 py-1.5 text-[9px] font-black uppercase shadow-[2px_2px_0px_#000] disabled:opacity-40"
                                >
                                  Desativar todas
                                </button>
                              </div>
                            )}

                            <div className={`grid grid-cols-1 gap-2 sm:grid-cols-2 ${!unidadeAtiva ? "opacity-40" : ""}`}>
                              {turmas.map((turma) => {
                                const chave = chaveTurma(unidade, turma);
                                const ativa = turmasHerdadas ||
                                  !turmasInativasTemp.includes(chave);

                                return (
                                  <div
                                    key={chave}
                                    className={`flex min-w-0 items-center gap-2.5 rounded-lg border-2 p-3 ${
                                      turmasHerdadas
                                        ? "border-black bg-[#E8E5DC]"
                                        : ativa
                                          ? "border-black bg-white"
                                          : "border-gray-300 bg-gray-100"
                                    }`}
                                  >
                                    {turmasHerdadas ? (
                                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 border-black bg-pensi-yellow">
                                        <LockKeyhole size={12} />
                                      </div>
                                    ) : (
                                      <input
                                        type="checkbox"
                                        checked={ativa}
                                        disabled={!unidadeAtiva}
                                        onChange={() => alternarTurma(chave)}
                                        className="h-4 w-4 shrink-0 accent-black"
                                      />
                                    )}
                                    <span
                                      className={`min-w-0 flex-1 truncate text-[10px] font-black uppercase ${
                                        ativa ? "text-black" : "text-gray-400 line-through"
                                      }`}
                                    >
                                      {turma}
                                    </span>
                                    {turmasHerdadas ? (
                                      <span className="shrink-0 rounded border border-black bg-white px-1.5 py-1 text-[8px] font-black uppercase">
                                        Herdada
                                      </span>
                                    ) : ativa ? (
                                      <Check size={14} className="shrink-0 text-green-700" strokeWidth={3} />
                                    ) : (
                                      <span className="text-[8px] font-black uppercase text-red-500">
                                        OFF
                                      </span>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </main>

        {/* RODAPÉ */}
        <footer className="flex shrink-0 flex-col-reverse gap-2 border-t-[3px] border-black bg-white p-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <p className="hidden text-[9px] font-bold uppercase text-gray-400 sm:block">
            Alterações aplicadas ao salvar
          </p>
          <div className="flex flex-col-reverse gap-2 sm:flex-row">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border-2 border-black bg-white px-5 py-2.5 text-[10px] font-black uppercase transition hover:bg-gray-100"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={() => onSave(unidadesInativasTemp, turmasInativasTemp)}
              disabled={processando}
              className={botaoAmarelo}
            >
              {processando ? "Salvando..." : <><Check size={15} strokeWidth={3} /> Salvar alterações</>}
            </button>
          </div>
        </footer>
      </section>
    </div>,
    document.body
  );
}
