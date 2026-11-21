import { LockKeyhole, CheckCircle2 } from "lucide-react";

export default function RedefineSidePanel({ enviado }) {
  return (
    <div className="flex flex-col items-start text-left">
      
      {/* Ícone Solto e Grande */}
      <div className="mb-6">
        {enviado ? (
          <CheckCircle2 className="w-12 h-12 sm:w-14 sm:h-14 text-[#111111]" strokeWidth={2.5} />
        ) : (
          <LockKeyhole className="w-12 h-12 sm:w-14 sm:h-14 text-[#111111]" strokeWidth={2.5} />
        )}
      </div>

      {/* Título Inclinado */}
      <div className="flex flex-col items-start mb-8">
        <h1 className="text-[40px] sm:text-[48px] font-black tracking-[-0.04em] leading-[0.9] text-[#111111] uppercase transform -rotate-2">
          {enviado ? "E-mail" : "Redefinir"}
        </h1>
        <h1 className="text-[40px] sm:text-[48px] font-black tracking-[-0.04em] leading-[0.9] uppercase transform rotate-2 mt-2 ml-2">
          <span className="bg-pensi-yellow px-3 py-1 inline-block text-[#111111]">
            {enviado ? "enviado." : "senha."}
          </span>
        </h1>
      </div>

      <p className="text-[15px] sm:text-[16px] font-medium leading-relaxed text-gray-500 max-w-[320px]">
        {enviado
          ? "Confira sua caixa de entrada. Enviamos um link para redefinir sua senha."
          : "Esqueceu sua senha? Informe seu e-mail institucional para receber o link de recuperação."}
      </p>
    </div>
  );
}