import Modal from "./Modal";
import Field from "./Field";

export default function CalendarModal({
  onClose,
  criarCalendario,
  novoCal,
  setNovoCal,
  erro,
  inputClass,
  buttonClass,
  salvando,
}) {
  return (
    <Modal titulo="Novo calendário" onClose={onClose}>
      <form onSubmit={criarCalendario} className="space-y-4 p-5">
        {erro && (
          <p className="rounded-lg border-2 border-red-300 bg-red-50 p-2 text-xs font-bold text-red-700">
            {erro}
          </p>
        )}

        <Field label="Nome do calendário">
          <input
            value={novoCal.nome}
            onChange={(event) =>
              setNovoCal((atual) => ({ ...atual, nome: event.target.value }))
            }
            placeholder="Ex.: Ano letivo 2027"
            className={inputClass}
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Data inicial">
            <input
              type="date"
              value={novoCal.inicio}
              onChange={(event) =>
                setNovoCal((atual) => ({ ...atual, inicio: event.target.value }))
              }
              className={inputClass}
            />
          </Field>

          <Field label="Data final">
            <input
              type="date"
              value={novoCal.fim}
              onChange={(event) =>
                setNovoCal((atual) => ({ ...atual, fim: event.target.value }))
              }
              className={inputClass}
            />
          </Field>
        </div>

        <button type="submit" disabled={salvando} className={`${buttonClass} w-full bg-pensi-yellow`}>
          {salvando ? "Salvando..." : "Criar calendário"}
        </button>
      </form>
    </Modal>
  );
}