
import { createPortal } from "react-dom";
import { AlertCircle, X, Trash2 } from "lucide-react";

const DOTS = ["bg-[#F5B800]", "bg-[#D7E7FF]", "bg-[#F4D5E5]"];

export default function DeleteModal({ user, processando, onClose, onConfirm }) {
  return createPortal(
    <div
      className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <section
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-title"
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-sm overflow-hidden rounded-2xl border-[3px] border-black bg-[#F7F7F5] shadow-[6px_6px_0px_#000]"
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
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2 border-black bg-[#FFE1E1] shadow-[2px_2px_0px_#000]">
              <AlertCircle size={20} />
            </div>
            <div>
              <h2
                id="delete-title"
                className="text-lg font-black uppercase leading-tight tracking-tight"
              >
                Excluir usuário?
              </h2>
              <p className="mt-0.5 text-[11px] text-gray-500">
                Esta ação é permanente
              </p>
            </div>
          </div>
        </header>

        <div className="space-y-4 p-5">
          <div className="rounded-lg border-2 border-black bg-white p-4">
            <p className="text-xs leading-relaxed text-gray-600">
              Tem certeza de que deseja excluir:
            </p>
            <p className="mt-2 break-words text-sm font-black text-gray-900">
              {user.nome}
            </p>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border-2 border-black bg-white py-3 text-[10px] font-black uppercase transition hover:bg-gray-100"
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={onConfirm}
              disabled={processando}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg border-2 border-black bg-[#FFCCCC] py-3 text-[10px] font-black uppercase shadow-[3px_3px_0px_#000] transition hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_#000] active:translate-y-0 active:shadow-none disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Trash2 size={14} />
              {processando ? "Excluindo..." : "Sim, excluir"}
            </button>
          </div>
        </div>
      </section>
    </div>,
    document.body
  );
}
