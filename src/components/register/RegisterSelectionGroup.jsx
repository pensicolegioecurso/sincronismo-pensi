import { Check } from "lucide-react";

export default function RegisterSelectionGroup({ titulo, icon: Icon, items, selecionados, onToggle, altura = "max-h-48" }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4 text-[#111111]" strokeWidth={2.5} />
        <h2 className="text-[13px] font-bold text-[#111111]">{titulo}</h2>
      </div>
      <div className={`grid grid-cols-1 sm:grid-cols-2 gap-2 ${altura} overflow-y-auto p-3 bg-gray-50 border border-gray-100 rounded-2xl`}>
        {items.map(({ value, label }) => {
          const selecionado = selecionados.includes(value);
          return (
            <button
              key={value}
              type="button"
              onClick={() => onToggle(value)}
              className={`flex items-center justify-between gap-2 px-3 py-2.5 border rounded-xl text-[13px] font-medium text-left transition-all ${
                selecionado ? "bg-pensi-yellow border-pensi-yellow text-[#111111]" : "bg-white border-gray-200 text-gray-600 hover:border-pensi-yellow"
              }`}
            >
              <span className="truncate">{label}</span>
              <span className={`w-4 h-4 shrink-0 flex items-center justify-center border rounded-md ${selecionado ? "bg-[#111111] border-[#111111]" : "bg-white border-gray-300"}`}>
                {selecionado && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}