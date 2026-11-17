
import { useState } from "react";
import { createPortal } from "react-dom";
import { X, ShieldCheck, Check } from "lucide-react";

const CARGOS_ATRIBUIVEIS = [
  { id: "diretor", label: "Diretor" },
  { id: "coordenador", label: "Coordenador" },
  { id: "nucleo", label: "Núcleo" },
  { id: "professor", label: "Professor" },
];

const DOTS = ["bg-[#F5B800]", "bg-[#D7E7FF]", "bg-[#F4D5E5]"];

export default function PermissionsModal({ user, processando, onClose, onSave }) {
  const sanitizados = (user.cargos || []).filter((cargo) =>
    CARGOS_ATRIBUIVEIS.some((item) => item.id === cargo)
  );

  const [cargosTemp, setCargosTemp] = useState(
    sanitizados.length ? sanitizados : ["professor"]
  );

  const handleSave = () => {
    const naoEditaveis = (user.cargos || []).filter(
      (cargo) => !CARGOS_ATRIBUIVEIS.some((item) => item.id === cargo)
    );

    onSave([...new Set([...naoEditaveis, ...cargosTemp])]);
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="permissions-title"
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-md overflow-hidden rounded-2xl border-[3px] border-black bg-[#F7F7F5] shadow-[6px_6px_0px_#000]"
      >
        <header className="border-b-2 border-black bg-white px-5 pb-4 pt-4">
          <div className="mb-4 flex items-center gap-1.5">
            {DOTS.map((color, index) => (
              <span
                key={index}
                className={`h-3 w-3 rounded-full border border-black/30 ${color}`}
              />
            ))}
            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar"
              className="ml-auto flex h-8 w-8 items-center justify-center rounded-lg border border-gray-300 text-gray-600 transition hover:border-black hover:bg-pensi-yellow hover:text-black"
            >
              <X size={17} />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2 border-black bg-pensi-yellow shadow-[2px_2px_0px_#000]">
              <ShieldCheck size={20} />
            </div>
            <div className="min-w-0">
              <h2
                id="permissions-title"
                className="text-lg font-black uppercase leading-tight tracking-tight"
              >
                Permissões
              </h2>
              <p className="mt-0.5 truncate text-[11px] text-gray-500">
                {user.nome}
              </p>
            </div>
          </div>
        </header>

        <div className="space-y-4 p-5">
          <div className="rounded-lg border-2 border-black bg-[#EAF1FC] p-3">
            <p className="text-[11px] leading-relaxed text-gray-700">
              O cargo <strong className="text-black">Regional</strong> é definido
              apenas nas Configurações.
            </p>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-[10px] font-black uppercase tracking-wide">
                Cargos disponíveis
              </h3>
              <span className="text-[9px] font-bold text-gray-400">
                {cargosTemp.length} selecionados
              </span>
            </div>

            <div className="space-y-2">
              {CARGOS_ATRIBUIVEIS.map((cargo) => {
                const selecionado = cargosTemp.includes(cargo.id);

                return (
                  <label
                    key={cargo.id}
                    className={`flex cursor-pointer items-center gap-3 rounded-lg border-2 p-3 transition ${
                      selecionado
                        ? "border-black bg-[#FFF7D6] shadow-[2px_2px_0px_#000]"
                        : "border-gray-200 bg-white hover:border-gray-400"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selecionado}
                      onChange={() =>
                        setCargosTemp((atual) =>
                          selecionado
                            ? atual.filter((item) => item !== cargo.id)
                            : [...atual, cargo.id]
                        )
                      }
                      className="h-4 w-4 accent-black"
                    />

                    <span className="flex-1 text-xs font-bold text-gray-900">
                      {cargo.label}
                    </span>

                    {selecionado && (
                      <Check size={16} strokeWidth={3} className="text-green-700" />
                    )}
                  </label>
                );
              })}
            </div>
          </div>

          <button
            type="button"
            onClick={handleSave}
            disabled={processando}
            className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-black bg-pensi-yellow py-3 text-[10px] font-black uppercase shadow-[3px_3px_0px_#000] transition hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_#000] active:translate-y-0 active:shadow-none disabled:cursor-not-allowed disabled:opacity-50"
          >
            {processando ? "Salvando..." : <><Check size={15} strokeWidth={3} /> Salvar permissões</>}
          </button>
        </div>
      </section>
    </div>,
    document.body
  );
}
