import { X } from "lucide-react";

export default function Modal({ titulo, children, onClose, tamanho = "max-w-md" }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className={`flex max-h-[92vh] w-full ${tamanho} flex-col overflow-hidden rounded-2xl border-2 border-black bg-white shadow-[8px_8px_0_#000]`}>
        <div className="flex items-center justify-between border-b-2 border-black bg-[#171717] px-5 py-4 text-white">
          <h3 className="text-sm font-black uppercase tracking-wide">{titulo}</h3>
          <button type="button" onClick={onClose} className="rounded-lg border border-white/30 p-2 transition hover:bg-white/10">
            <X size={16} />
          </button>
        </div>
        <div className="min-h-0 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}