import { LogIn } from "lucide-react";

export default function AuthSidePanel({ title, description }) {
  return (
    <div className="flex flex-col items-end text-right">
      
      {/* Ícone Solto Acima */}
      <div className="mb-6">
        <LogIn className="w-10 h-10 sm:w-12 sm:h-12 text-[#111111]" strokeWidth={2.5} />
      </div>

      {/* Bloco do Título Inclinado */}
      <div className="flex flex-col items-end mb-8">
        
        {/* Linha 1: Acesse */}
        <div className="transform -rotate-2">
          <h1 className="text-[48px] sm:text-[56px] font-black tracking-[-0.04em] leading-[0.9] text-[#111111] uppercase">
            Acesse
          </h1>
        </div>

        {/* Linha 2: Sua conta (Destacado) */}
        <h1 className="text-[48px] sm:text-[56px] font-black tracking-[-0.04em] leading-[0.9] uppercase transform rotate-2 mt-3 mr-2">
          <span className="bg-pensi-yellow px-3 py-1 inline-block text-[#111111]">sua conta.</span>
        </h1>

      </div>

      <p className="text-[15px] sm:text-[16px] font-medium leading-relaxed text-gray-500 max-w-[320px]">
        {description}
      </p>
    </div>
  );
}