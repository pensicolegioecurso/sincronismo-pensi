import { AlertCircle, Trash2 } from "lucide-react";
import ModalShell from "./ModalShell";
import { btnSecondary, btnDanger } from "./ui";

export default function DeleteModal({ user, processando, onClose, onConfirm }) {
  return (
    <ModalShell
      role="alertdialog"
      title="Excluir usuário?"
      subtitle="Esta ação é permanente"
      icon={AlertCircle}
      maxWidth="max-w-sm"
      onClose={onClose}
      footer={
        <div className="flex gap-2">
          <button type="button" onClick={onClose} className={`${btnSecondary} flex-1`}>
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={processando}
            className={`${btnDanger} flex-1`}
          >
            <Trash2 size={14} />
            {processando ? "Excluindo..." : "Sim, excluir"}
          </button>
        </div>
      }
    >
      <div className="rounded-2xl border border-rose-100 bg-rose-50/60 p-4">
        <p className="text-xs leading-relaxed text-gray-600">Tem certeza de que deseja excluir:</p>
        <p className="mt-2 break-words text-sm font-black text-gray-900">{user.nome}</p>
        <p className="mt-0.5 break-all text-[11px] font-medium text-gray-500">{user.email}</p>
      </div>
    </ModalShell>
  );
}