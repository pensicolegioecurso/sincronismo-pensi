
import { CheckCircle2, Clock, AlertCircle } from "lucide-react";

const TABS = [
  {
    id: "pendente",
    label: "Pendentes",
    icon: Clock,
    texto: "text-red-700",
  },
  {
    id: "feito",
    label: "Realizadas",
    icon: CheckCircle2,
    texto: "text-green-700",
  },
  {
    id: "justificado",
    label: "Justificadas",
    icon: AlertCircle,
    texto: "text-yellow-700",
  },
];

export default function ProfileTabs({ abaAtiva, setAbaAtiva, counts }) {
  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-3">
      {TABS.map((tab) => {
        const Icon = tab.icon;
        const ativa = abaAtiva === tab.id;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => setAbaAtiva(tab.id)}
            className={`flex min-w-0 flex-col items-center justify-center gap-2 rounded-lg border-2 border-black px-1 py-3 transition-all duration-150 sm:flex-row sm:gap-2 ${
              ativa
                ? "translate-x-[2px] translate-y-[2px] bg-[#FFF7D6] shadow-none"
                : "bg-white shadow-[2px_2px_0px_#000] hover:bg-[#FFF7D6] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
            }`}
          >
            <Icon
              size={19}
              strokeWidth={2.5}
              className={`shrink-0 ${ativa ? "text-black" : tab.texto}`}
            />

            <div className="min-w-0 text-center sm:text-left">
              <span className="block truncate text-[8px] font-black uppercase tracking-wider text-gray-700 sm:text-[9px]">
                {tab.label}
              </span>

              <span className="mt-0.5 block text-lg font-black leading-none tabular-nums text-black sm:text-xl">
                {counts[tab.id] ?? 0}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
