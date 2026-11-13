import { Check } from "lucide-react";

export default function RegisterSelectionGroup({ titulo, icon: Icon, items, selecionados, onToggle, altura = "max-h-48" }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-1.5">
        <Icon className="w-3.5 h-3.5 text-gray-800" strokeWidth={2} />
        <h2 className="text-[11px] font-medium text-gray-800">{titulo}</h2>
      </div>
      <div className={`grid grid-cols-1 sm:grid-cols-2 gap-1.5 ${altura} overflow-y-auto p-2 bg-gray-50 border-[2px] border-gray-200 rounded-lg`}>
        {items.map(({ value, label }) => {
          const selecionado = selecionados.includes(value);
          return (
            <button
              key={value}
              type="button"
              onClick={() => onToggle(value)}
              className={`flex items-center justify-between gap-2 px-2 py-1.5 border-[1.5px] rounded-md text-[11px] font-medium text-left transition-colors ${
                selecionado ? "bg-pensi-yellow border-black text-black" : "bg-white border-gray-200 text-gray-600 hover:border-black"
              }`}
            >
              <span className="truncate">{label}</span>
              <span className={`w-3.5 h-3.5 shrink-0 flex items-center justify-center border rounded-sm ${selecionado ? "bg-black border-black" : "bg-white border-gray-300"}`}>
                {selecionado && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}