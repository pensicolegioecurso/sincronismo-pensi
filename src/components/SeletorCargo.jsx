import { ShieldCheck, Users, BookOpen, ArrowRight, MapPin, Network } from "lucide-react";

const CARGOS_EXIBIVEIS = ["diretor", "direcao", "coordenador", "nucleo", "regional", "professor"];

export default function SeletorCargo({ cargos, onSelect }) {
  const cargosValidos = cargos.filter((c) => CARGOS_EXIBIVEIS.includes(c));

  const getCargoInfo = (cargo) => {
    switch (cargo) {
      case "diretor":
      case "direcao":
      case "coordenador":
        return { label: cargo === "coordenador" ? "Coordenador" : "Direção", icon: Users, cor: "bg-purple-100", text: "Acompanhe professores e feed da sua unidade." };
      case "nucleo":
        return { label: "Núcleo", icon: ShieldCheck, cor: "bg-blue-100", text: "Gestão pedagógica e acompanhamento geral." };
      case "regional":
        return { label: "Regional", icon: Network, cor: "bg-orange-100", text: "Gestão das unidades que você comanda." };
      default:
        return { label: "Professor", icon: BookOpen, cor: "bg-green-100", text: "Acesse seus calendários e registre suas aulas." };
    }
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white border-[3px] border-black rounded-2xl shadow-[8px_8px_0px_0px_#000] w-full max-w-lg overflow-hidden flex flex-col">
        <div className="bg-[#171717] text-white p-6 text-center border-b-[3px] border-black">
          <h2 className="text-xl font-black uppercase tracking-wide">Escolha seu perfil</h2>
          <p className="text-xs text-gray-400 mt-1">Você possui múltiplos acessos. Como deseja entrar hoje?</p>
        </div>
        <div className="p-6 space-y-3">
          {cargosValidos.map((cargo) => {
            const info = getCargoInfo(cargo);
            const Icon = info.icon;
            return (
              <button key={cargo} onClick={() => onSelect(cargo)}
                className="w-full flex items-center gap-4 p-4 border-[2px] border-black rounded-xl shadow-[3px_3px_0px_0px_#000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] hover:bg-gray-50 transition-all text-left group">
                <div className={`w-12 h-12 shrink-0 ${info.cor} border-[2px] border-black rounded-full flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-black" strokeWidth={2.5} />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-black uppercase text-black">{info.label}</h3>
                  <p className="text-[11px] text-gray-500 font-medium">{info.text}</p>
                </div>
                <div className="w-8 h-8 rounded-full border-[2px] border-black flex items-center justify-center bg-pensi-yellow group-hover:bg-black group-hover:text-pensi-yellow transition-colors">
                  <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}