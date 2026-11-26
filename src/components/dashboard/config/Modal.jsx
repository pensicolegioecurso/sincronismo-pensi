import { X } from "lucide-react";

export default function Modal({ titulo, children, onClose, tamanho = "max-w-md", cabecalhoClaro = false }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className={`flex max-h-[92vh] w-full ${tamanho} flex-col overflow-hidden rounded-2xl border-2 border-black bg-white shadow-[8px_8px_0_#000]`}>
        <div className={`flex items-center justify-between border-b px-5 py-4 ${cabecalhoClaro ? "border-gray-100 bg-white text-[#171717]" : "border-b-2 border-black bg-[#171717] text-white"}`}>
          <h3 className="text-sm font-black uppercase tracking-wide">{titulo}</h3>
          <button type="button" onClick={onClose} className={`rounded-lg border p-2 transition ${cabecalhoClaro ? "border-gray-200 hover:bg-gray-100" : "border-white/30 hover:bg-white/10"}`}>
            <X size={16} />
          </button>
        </div>
        <div className="min-h-0 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
