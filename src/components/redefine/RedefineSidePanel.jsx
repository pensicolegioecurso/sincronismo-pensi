import { LockKeyhole, CheckCircle2 } from "lucide-react";

export default function RedefineSidePanel({ enviado }) {
  return (
    <div className="flex flex-col items-start text-left">
      <div className="w-12 h-12 flex items-center justify-center bg-pensi-yellow border-[2px] border-black rounded-full shadow-[3px_3px_0px_0px_#000] mb-6">
        {enviado ? (
          <CheckCircle2 className="w-5 h-5 text-black" strokeWidth={2.5} />
        ) : (
          <LockKeyhole className="w-5 h-5 text-black" strokeWidth={2.5} />
        )}
      </div>

      <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight leading-tight text-gray-900 mb-3">
        {enviado ? "E-mail enviado" : "Redefinir senha"}
        <span className="text-pensi-yellow">.</span>
      </h1>

      <p className="text-[13px] font-light leading-relaxed text-gray-500 max-w-[280px]">
        {enviado
          ? "Confira sua caixa de entrada. Enviamos um link para redefinir sua senha."
          : "Esqueceu sua senha? Informe seu e-mail institucional para receber o link de recuperação."}
      </p>
    </div>
  );
}