import Modal from "./Modal";
import Field from "./Field";

export default function ClassModal({
  onClose,
  adicionarTurma,
  erro,
  novaTurma,
  setNovaTurma,
  unidadesPermitidas,
  SERIES_DISPONIVEIS,
  TURNOS,
  inputClass,
  buttonClass,
  salvando,
}) {
  return (
    <Modal titulo="Cadastrar turma" onClose={onClose}>
      <form onSubmit={adicionarTurma} className="space-y-4 p-5">
        {erro && (
          <p className="rounded-lg border-2 border-red-300 bg-red-50 p-2 text-xs font-bold text-red-700">
            {erro}
          </p>
        )}

        <Field label="Unidade">
          <select
            value={novaTurma.unidade}
            onChange={(event) =>
              setNovaTurma((atual) => ({ ...atual, unidade: event.target.value }))
            }
            className={inputClass}
          >
            <option value="">Selecione uma unidade</option>
            {unidadesPermitidas.map((unidade) => (
              <option key={unidade} value={unidade}>{unidade}</option>
            ))}
          </select>
        </Field>

        <Field label="Série">
          <select
            value={novaTurma.serie}
            onChange={(event) =>
              setNovaTurma((atual) => ({ ...atual, serie: event.target.value }))
            }
            className={inputClass}
          >
            <option value="">Selecione uma série</option>
            {SERIES_DISPONIVEIS.map((serie) => (
              <option key={serie} value={serie}>{serie}</option>
            ))}
          </select>
        </Field>

        <Field label="Turno">
          <div className="grid grid-cols-2 gap-2">
            {TURNOS.map((turno) => (
              <button
                key={turno}
                type="button"
                onClick={() => setNovaTurma((atual) => ({ ...atual, turno }))}
                className={`rounded-xl border-2 border-black py-3 text-xs font-black uppercase transition ${
                  novaTurma.turno === turno
                    ? "bg-pensi-yellow shadow-[2px_2px_0_#000]"
                    : "bg-white hover:bg-gray-100"
                }`}
              >
                {turno === "M" ? "Manhã" : "Tarde"}
              </button>
            ))}
          </div>
        </Field>

        <Field label="Nome da turma">
          <input
            value={novaTurma.turma}
            onChange={(event) =>
              setNovaTurma((atual) => ({ ...atual, turma: event.target.value }))
            }
            placeholder="Ex.: 6º ano A"
            className={inputClass}
          />
        </Field>

        <button
          type="submit"
          disabled={salvando || !unidadesPermitidas.length}
          className={`${buttonClass} w-full bg-pensi-yellow`}
        >
          {salvando ? "Salvando..." : "Cadastrar turma"}
        </button>
      </form>
    </Modal>
  );
}