import { Shield, GraduationCap, Building2, UserCog } from "lucide-react";

export default function SeletorCargo({ cargos, onSelect }) {
  const obterIcone = (cargo) => {
    switch (cargo) {
      case "admin":
      case "regional":
      case "nucleo":
        return Shield;
      case "diretor":
      case "direcao":
      case "coordenador":
        return GraduationCap;
      case "professor":
        return Building2;
      default:
        return UserCog;
    }
  };

  const obterNome = (cargo) => {
    const nomes = {
      admin: "Administrador",
      regional: "Regional",
      nucleo: "Núcleo",
      diretor: "Diretor",
      direcao: "Direção",
      coordenador: "Coordenador",
      professor: "Professor",
    };
    return nomes[cargo] || cargo;
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      
      <div className="relative z-10 w-full max-w-[460px] bg-white border border-gray-100 rounded-[32px] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] px-8 py-8 sm:px-10 sm:py-10">
        
        {/* Bolinhas de navegador */}
        <div className="absolute top-5 left-7 flex items-center gap-2" aria-hidden="true">
          <span className="w-2.5 h-2.5 rounded-full bg-pensi-yellow" />
          <span className="w-2.5 h-2.5 rounded-full bg-gray-200" />
          <span className="w-2.5 h-2.5 rounded-full bg-gray-100" />
        </div>

        <div className="text-center mb-8 mt-2">
          <h2 className="text-[26px] sm:text-[30px] font-black tracking-[-0.04em] leading-[0.9] text-[#111111] uppercase transform -rotate-1 mb-1">
            Escolha seu
          </h2>
          <h2 className="text-[26px] sm:text-[30px] font-black uppercase transform rotate-1">
            <span className="bg-pensi-yellow px-3 py-1 inline-block text-[#111111]">perfil.</span>
          </h2>
          <p className="text-[14px] font-medium text-gray-500 mt-3 max-w-xs mx-auto leading-relaxed">
            Identificamos que você tem mais de um tipo de permissão de acesso. Selecione qual painel deseja gerenciar agora.
          </p>
        </div>

        <div className="flex flex-col gap-2.5">
          {cargos.map((cargo) => {
            const Icon = obterIcone(cargo);
            return (
              <button
                key={cargo}
                onClick={() => onSelect(cargo)}
                className="group flex items-center justify-between w-full p-4 bg-gray-50 hover:bg-white border border-gray-200 hover:border-pensi-yellow rounded-2xl transition-colors duration-200 text-left cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-6 h-6 text-[#111111] shrink-0" strokeWidth={2.5} />
                  <span className="block text-[16px] font-bold text-[#111111]">
                    {obterNome(cargo)}
                  </span>
                </div>
                
                <div className="w-7 h-7 rounded-full bg-white border border-gray-200 flex items-center justify-center group-hover:bg-[#111111] group-hover:border-[#111111] transition-colors shrink-0">
                  <svg className="w-3.5 h-3.5 text-gray-400 group-hover:text-pensi-yellow transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            );
          })}
        </div>

      </div>
    </div>
  );
}