import { useState } from "react";
import { ShieldCheck, Check } from "lucide-react";
import ModalShell from "./ModalShell";
import { btnPrimary, btnSecondary, optionClass } from "./ui";

const CARGOS_ATRIBUIVEIS = [
  { id: "diretor", label: "Diretor" },
  { id: "coordenador", label: "Coordenador" },
  { id: "nucleo", label: "Núcleo" },
  { id: "professor", label: "Professor" },
];

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

  return (
    <ModalShell
      title="Permissões"
      subtitle={user.nome}
      icon={ShieldCheck}
      maxWidth="max-w-md"
      onClose={onClose}
      footer={
        <div className="flex gap-2">
          <button type="button" onClick={onClose} className={`${btnSecondary} flex-1`}>
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={processando}
            className={`${btnPrimary} flex-1`}
          >
            {processando ? "Salvando..." : (<><Check size={15} strokeWidth={3} /> Salvar</>)}
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="rounded-2xl border border-sky-100 bg-sky-50 p-3">
          <p className="text-[11px] leading-relaxed text-sky-900">
            O cargo <strong>Regional</strong> é definido apenas nas Configurações.
          </p>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-[10px] font-black uppercase tracking-wide text-gray-500">
              Cargos disponíveis
            </h3>
            <span className="text-[10px] font-bold text-gray-400">
              {cargosTemp.length} selecionado(s)
            </span>
          </div>

          <div className="space-y-2">
            {CARGOS_ATRIBUIVEIS.map((cargo) => {
              const selecionado = cargosTemp.includes(cargo.id);
              return (
                <label key={cargo.id} className={optionClass(selecionado)}>
                  <input
                    type="checkbox"
                    checked={selecionado}
                    onChange={() =>
                      setCargosTemp((atual) =>
                        selecionado ? atual.filter((i) => i !== cargo.id) : [...atual, cargo.id]
                      )
                    }
                    className="h-4 w-4 accent-black"
                  />
                  <span className="flex-1 text-sm font-bold text-gray-900">{cargo.label}</span>
                  {selecionado && <Check size={16} strokeWidth={3} className="text-emerald-600" />}
                </label>
              );
            })}
          </div>
        </div>
      </div>
    </ModalShell>
  );
}