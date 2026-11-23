import { useState } from "react";
import { GraduationCap, Plus, Building2, Check, LockKeyhole, Users } from "lucide-react";
import { parseTurmasPorUnidade, chaveTurma } from "../../../utils/turmas";
import ModalShell from "./ModalShell";
import { btnPrimary, btnSecondary, inputClass, panelClass } from "./ui";

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
  const [unidadesInativasTemp, setUnidadesInativasTemp] = useState([...(user.unidadesInativas || [])]);
  const [turmasInativasTemp, setTurmasInativasTemp] = useState([...(user.turmasInativas || [])]);
  const [unidadeParaAdicionar, setUnidadeParaAdicionar] = useState("");
  const [turmaParaAdicionar, setTurmaParaAdicionar] = useState("");
  const [unidadeDaTurmaNova, setUnidadeDaTurmaNova] = useState("");

  const cargosUsuario = (user.cargos || []).map((c) => String(c).toLowerCase().trim());
  const turmasHerdadas = cargosUsuario.some((c) => ["diretor", "coordenador", "regional"].includes(c));

  const podeAdicionarUnidade = ["admin", "nucleo", "diretor", "coordenador"].includes(perfilAtivo);
  const podeAdicionarTurma = ["admin", "nucleo"].includes(perfilAtivo) && !turmasHerdadas;

  const turmasDoUsuario = parseTurmasPorUnidade(user.turmas);
  const unidadesDoUser = (user.unidade || "").split(",").map((i) => i.trim()).filter(Boolean);

  const unidadesVisiveis = unidadesDoUser.filter((u) =>
    ehRegional ? (unidadesEscopo || []).includes(u) : true
  );

  const turmasPorUnidade = Object.fromEntries(
    unidadesVisiveis.map((unidade) => [
      unidade,
      [
        ...new Set([
          ...(turmasDoUsuario[unidade] || []),
          ...todasTurmasDb.filter((i) => i.unidade === unidade).map((i) => i.turma),
        ]),
      ],
    ])
  );

  const unidadesDisponiveis = todasUnidades.filter((u) => !unidadesDoUser.includes(u));

  const turmasDisponiveis = todasTurmasDb.filter(
    (i) =>
      i.unidade === unidadeDaTurmaNova &&
      !(turmasDoUsuario[unidadeDaTurmaNova] || []).includes(i.turma)
  );

  const totalTurmas = Object.values(turmasPorUnidade).reduce((t, l) => t + l.length, 0);
  const totalUnidadesAtivas = unidadesVisiveis.filter((u) => !unidadesInativasTemp.includes(u)).length;

  const mapaParaString = (mapa) =>
    Object.entries(mapa)
      .map(([unidade, turmas]) => `${unidade}: ${turmas.join(", ")}`)
      .join(" | ");

  const adicionarUnidade = async () => {
    if (!unidadeParaAdicionar) return;
    const mapa = parseTurmasPorUnidade(user.turmas);
    const novasUnidades = [...unidadesDoUser, unidadeParaAdicionar].join(",");

    mapa[unidadeParaAdicionar] = [
      ...new Set([
        ...(mapa[unidadeParaAdicionar] || []),
        ...todasTurmasDb.filter((i) => i.unidade === unidadeParaAdicionar).map((i) => i.turma),
      ]),
    ];

    await onAddUnit(user.id, novasUnidades, mapaParaString(mapa));
    setUnidadeParaAdicionar("");
  };

  const adicionarTurma = async () => {
    if (!turmaParaAdicionar || !unidadeDaTurmaNova) return;
    const mapa = parseTurmasPorUnidade(user.turmas);
    mapa[unidadeDaTurmaNova] = [...new Set([...(mapa[unidadeDaTurmaNova] || []), turmaParaAdicionar])];

    await onAddUnit(user.id, user.unidade, mapaParaString(mapa));
    setTurmaParaAdicionar("");
  };

  const alternarUnidade = (unidade) =>
    setUnidadesInativasTemp((atual) =>
      atual.includes(unidade) ? atual.filter((i) => i !== unidade) : [...atual, unidade]
    );

  const alternarTurma = (chave) => {
    if (turmasHerdadas) return;
    setTurmasInativasTemp((atual) =>
      atual.includes(chave) ? atual.filter((i) => i !== chave) : [...atual, chave]
    );
  };

  const alternarTodasTurmas = (unidade, turmas, ativar) => {
    const chaves = turmas.map((t) => chaveTurma(unidade, t));
    setTurmasInativasTemp((atual) =>
      ativar ? atual.filter((c) => !chaves.includes(c)) : [...new Set([...atual, ...chaves])]
    );
  };

  const selectClass = `${inputClass} min-w-0 flex-1`;

  return (
    <ModalShell
      title="Acessos e permissões"
      subtitle={user.nome}
      icon={Users}
      maxWidth="max-w-3xl"
      onClose={onClose}
      footer={
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="hidden text-[10px] font-bold uppercase text-gray-400 sm:block">
            Alterações aplicadas ao salvar
          </p>
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className={`${btnSecondary} flex-1 sm:flex-none`}>
              Cancelar
            </button>
            <button
              type="button"
              onClick={() => onSave(unidadesInativasTemp, turmasInativasTemp)}
              disabled={processando}
              className={`${btnPrimary} flex-1 sm:flex-none`}
            >
              {processando ? "Salvando..." : (<><Check size={15} strokeWidth={3} /> Salvar alterações</>)}
            </button>
          </div>
        </div>
      }
    >
      <div className="space-y-5">
        {/* Cargos */}
        <div className="flex flex-wrap gap-1.5">
          {cargosUsuario.map((cargo) => (
            <span
              key={cargo}
              className="rounded-full bg-gray-100 px-3 py-1 text-[10px] font-bold uppercase text-gray-600"
            >
              {cargo}
            </span>
          ))}
        </div>

        {/* Resumo */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Unidades", value: `${totalUnidadesAtivas}/${unidadesVisiveis.length}`, icon: Building2 },
            { label: "Turmas", value: totalTurmas, icon: GraduationCap },
            { label: "Modelo", value: turmasHerdadas ? "Herdado" : "Individual", icon: LockKeyhole },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="rounded-2xl border border-gray-100 bg-gray-50/60 p-3 sm:p-4">
              <div className="flex items-center gap-1.5 text-gray-400">
                <Icon size={13} />
                <span className="text-[10px] font-black uppercase">{label}</span>
              </div>
              <p className="mt-1 text-lg font-black text-gray-900 sm:text-xl">{value}</p>
            </div>
          ))}
        </div>

        {turmasHerdadas && (
          <div className="flex items-start gap-3 rounded-2xl border border-sky-100 bg-sky-50 p-4">
            <LockKeyhole size={17} className="mt-0.5 shrink-0 text-sky-700" />
            <div>
              <h3 className="text-xs font-black uppercase text-sky-900">Acesso automático às turmas</h3>
              <p className="mt-1 text-xs leading-relaxed text-sky-900/80">
                Este usuário recebe automaticamente todas as turmas das unidades vinculadas ao seu
                perfil. O gerenciamento individual de turmas não está disponível para este cargo.
              </p>
            </div>
          </div>
        )}

        {/* Adicionar unidade */}
        {podeAdicionarUnidade && unidadesDisponiveis.length > 0 && (
          <section className={panelClass}>
            <div className="mb-3 flex items-center gap-2">
              <Plus size={16} />
              <div>
                <h3 className="text-xs font-black uppercase text-gray-900">Adicionar unidade</h3>
                <p className="text-[10px] text-gray-500">Vincular uma nova unidade ao usuário</p>
              </div>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <select
                value={unidadeParaAdicionar}
                onChange={(e) => setUnidadeParaAdicionar(e.target.value)}
                className={selectClass}
              >
                <option value="">Selecione uma unidade...</option>
                {unidadesDisponiveis.map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
              <button type="button" onClick={adicionarUnidade} disabled={!unidadeParaAdicionar} className={btnPrimary}>
                <Plus size={15} /> Adicionar
              </button>
            </div>
          </section>
        )}

        {/* Adicionar turma */}
        {podeAdicionarTurma && (
          <section className={panelClass}>
            <div className="mb-3 flex items-center gap-2">
              <GraduationCap size={16} />
              <div>
                <h3 className="text-xs font-black uppercase text-gray-900">Adicionar nova turma</h3>
                <p className="text-[10px] text-gray-500">Vincular uma turma específica ao usuário</p>
              </div>
            </div>
            <div className="space-y-2">
              <select
                value={unidadeDaTurmaNova}
                onChange={(e) => {
                  setUnidadeDaTurmaNova(e.target.value);
                  setTurmaParaAdicionar("");
                }}
                className={selectClass}
              >
                <option value="">Selecione a unidade...</option>
                {unidadesDoUser.map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>

              {unidadeDaTurmaNova && (
                <div className="flex flex-col gap-2 sm:flex-row">
                  <select
                    value={turmaParaAdicionar}
                    onChange={(e) => setTurmaParaAdicionar(e.target.value)}
                    className={selectClass}
                  >
                    <option value="">Selecione a turma...</option>
                    {turmasDisponiveis.map((i) => (
                      <option key={i.id} value={i.turma}>{i.turma}</option>
                    ))}
                  </select>
                  <button type="button" onClick={adicionarTurma} disabled={!turmaParaAdicionar} className={btnPrimary}>
                    <Plus size={15} /> Adicionar
                  </button>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Unidades vinculadas */}
        <section>
          <div className="mb-3 flex items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-black uppercase tracking-tight text-gray-900">Unidades vinculadas</h3>
              <p className="mt-0.5 text-[11px] font-medium text-gray-500">
                Gerencie a disponibilidade de cada unidade
              </p>
            </div>
            <span className="rounded-full bg-gray-100 px-3 py-1 text-[10px] font-bold uppercase text-gray-600">
              {unidadesVisiveis.length} unidades
            </span>
          </div>

          {unidadesVisiveis.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-8 text-center">
              <Building2 size={28} className="mx-auto mb-2 text-gray-300" />
              <p className="text-xs font-bold uppercase text-gray-500">Nenhuma unidade cadastrada</p>
            </div>
          ) : (
            <div className="space-y-3">
              {unidadesVisiveis.map((unidade) => {
                const turmas = turmasPorUnidade[unidade] || [];
                const unidadeAtiva = !unidadesInativasTemp.includes(unidade);
                const turmasAtivas = turmasHerdadas
                  ? turmas.length
                  : turmas.filter((t) => !turmasInativasTemp.includes(chaveTurma(unidade, t))).length;

                return (
                  <article key={unidade} className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                    <label className="flex cursor-pointer items-center gap-3 border-b border-gray-100 bg-gray-50/60 p-3.5">
                      <input
                        type="checkbox"
                        checked={unidadeAtiva}
                        onChange={() => alternarUnidade(unidade)}
                        className="h-5 w-5 shrink-0 accent-black"
                      />
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-gray-700 shadow-sm">
                        <Building2 size={17} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="truncate text-sm font-bold text-gray-900">{unidade}</h4>
                        <p className="text-[10px] font-bold uppercase text-gray-400">
                          {turmas.length} {turmas.length === 1 ? "turma cadastrada" : "turmas cadastradas"}
                        </p>
                      </div>
                      <span
                        className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${
                          unidadeAtiva ? "bg-emerald-100 text-emerald-800" : "bg-gray-200 text-gray-500"
                        }`}
                      >
                        {unidadeAtiva ? "Ativa" : "Inativa"}
                      </span>
                    </label>

                    <div className="p-3.5">
                      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2 text-gray-500">
                          <GraduationCap size={15} />
                          <span className="text-[10px] font-black uppercase tracking-wide">Turmas disponíveis</span>
                        </div>
                        <span className="text-[10px] font-bold uppercase text-gray-400">
                          {turmasAtivas}/{turmas.length} ativas
                        </span>
                      </div>

                      {turmas.length === 0 ? (
                        <p className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-4 text-center text-[11px] font-bold text-gray-400">
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
                                className="rounded-full bg-emerald-50 px-3 py-1.5 text-[10px] font-bold uppercase text-emerald-700 transition hover:bg-emerald-100 disabled:opacity-40"
                              >
                                Ativar todas
                              </button>
                              <button
                                type="button"
                                disabled={!unidadeAtiva}
                                onClick={() => alternarTodasTurmas(unidade, turmas, false)}
                                className="rounded-full bg-rose-50 px-3 py-1.5 text-[10px] font-bold uppercase text-rose-700 transition hover:bg-rose-100 disabled:opacity-40"
                              >
                                Desativar todas
                              </button>
                            </div>
                          )}

                          <div className={`grid grid-cols-1 gap-2 sm:grid-cols-2 ${!unidadeAtiva ? "opacity-40" : ""}`}>
                            {turmas.map((turma) => {
                              const chave = chaveTurma(unidade, turma);
                              const ativa = turmasHerdadas || !turmasInativasTemp.includes(chave);
                              return (
                                <div
                                  key={chave}
                                  className={`flex min-w-0 items-center gap-2.5 rounded-xl border p-3 ${
                                    ativa ? "border-gray-200 bg-white" : "border-gray-100 bg-gray-50"
                                  }`}
                                >
                                  {turmasHerdadas ? (
                                    <LockKeyhole size={14} className="shrink-0 text-gray-400" />
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
                                    className={`min-w-0 flex-1 truncate text-[11px] font-bold ${
                                      ativa ? "text-gray-900" : "text-gray-400 line-through"
                                    }`}
                                  >
                                    {turma}
                                  </span>
                                  {turmasHerdadas ? (
                                    <span className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-[9px] font-bold uppercase text-gray-500">
                                      Herdada
                                    </span>
                                  ) : ativa ? (
                                    <Check size={14} className="shrink-0 text-emerald-600" strokeWidth={3} />
                                  ) : (
                                    <span className="text-[9px] font-black uppercase text-rose-500">Off</span>
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
      </div>
    </ModalShell>
  );
}