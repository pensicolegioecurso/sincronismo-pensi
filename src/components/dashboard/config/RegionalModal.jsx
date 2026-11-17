import Modal from "./Modal";

export default function RegionalModal({
  regional,
  onClose,
  todasUnidades,
  unidadesTemp,
  setUnidadesTemp,
  salvarUnidadesRegional,
  salvando,
  buttonClass,
}) {
  return (
    <Modal titulo={`Unidades de ${regional.nome}`} onClose={onClose}>
      <div className="space-y-4 p-5">
        <p className="text-xs text-gray-500">
          Selecione as unidades que este regional poderá gerenciar.
        </p>

        <div className="max-h-80 space-y-2 overflow-y-auto">
          {todasUnidades.map((unidade) => {
            const selecionada = unidadesTemp.includes(unidade);

            return (
              <label
                key={unidade}
                className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 p-3 transition ${
                  selecionada
                    ? "border-black bg-yellow-50"
                    : "border-gray-200 hover:border-black"
                }`}
              >
                <input
                  type="checkbox"
                  checked={selecionada}
                  onChange={() =>
                    setUnidadesTemp((atuais) =>
                      selecionada
                        ? atuais.filter((item) => item !== unidade)
                        : [...atuais, unidade]
                    )
                  }
                  className="h-4 w-4 accent-black"
                />
                <span className="text-xs font-bold">{unidade}</span>
              </label>
            );
          })}
        </div>

        <button
          onClick={salvarUnidadesRegional}
          disabled={salvando}
          className={`${buttonClass} w-full bg-pensi-yellow`}
        >
          {salvando ? "Salvando..." : "Salvar unidades"}
        </button>
      </div>
    </Modal>
  );
}