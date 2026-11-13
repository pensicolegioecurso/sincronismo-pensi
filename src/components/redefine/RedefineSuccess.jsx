import { CheckCircle2, ArrowRight } from "lucide-react";

export default function RedefineSuccess({ email, onBackToLogin }) {
  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 bg-green-50 border-[2px] border-black rounded-lg p-3">
        <CheckCircle2 className="w-4 h-4 text-green-700 shrink-0 mt-0.5" strokeWidth={2.5} />
        <div>
          <p className="text-[12px] font-bold text-green-800 mb-0.5">Link enviado</p>
          <p className="text-[11px] font-normal leading-relaxed text-green-700">
            Se o e-mail <strong>{email}</strong> estiver cadastrado com senha, você receberá um link para redefini-la. Verifique também a pasta de spam.
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onBackToLogin}
        className="w-full flex items-center justify-center gap-2 bg-pensi-yellow text-black border-[2px] border-black rounded-lg px-4 py-2.5 text-[13px] font-semibold shadow-[3px_3px_0px_0px_#000] hover:bg-[#ffdb4d] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_#000] active:shadow-none active:translate-x-[3px] active:translate-y-[3px] transition-all duration-150"
      >
        Voltar para o login
        <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
      </button>
    </div>
  );
}