import Modal from "./Modal";
import Field from "./Field";

export default function UnitModal({
  onClose,
  adicionarUnidade,
  erro,
  novaUnidadeNome,
  setNovaUnidadeNome,
  inputClass,
  buttonClass,
  salvando,
}) {
  return (
    <Modal titulo="Cadastrar unidade" onClose={onClose}>
      <form onSubmit={adicionarUnidade} className="space-y-4 p-5">
        {erro && (
          <p className="rounded-lg border-2 border-red-300 bg-red-50 p-2 text-xs font-bold text-red-700">
            {erro}
          </p>
        )}

        <Field label="Nome da unidade">
          <input
            autoFocus
            value={novaUnidadeNome}
            onChange={(event) => setNovaUnidadeNome(event.target.value)}
            placeholder="Ex.: Icaraí 1"
            className={inputClass}
          />
        </Field>

        <p className="text-[11px] text-gray-500">
          A primeira letra será convertida automaticamente para maiúscula.
        </p>

        <button type="submit" disabled={salvando} className={`${buttonClass} w-full bg-pensi-yellow`}>
          {salvando ? "Salvando..." : "Cadastrar unidade"}
        </button>
      </form>
    </Modal>
  );
}