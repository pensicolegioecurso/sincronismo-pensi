import { CheckCircle2, ArrowRight } from "lucide-react";

export default function RedefineSuccess({ email, onBackToLogin }) {
  return (
    <div className="space-y-5">
      <div className="flex items-start gap-3 bg-green-50/50 border border-green-100 rounded-2xl p-4">
        <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" strokeWidth={2.5} />
        <div>
          <p className="text-[13px] font-bold text-green-800 mb-1">Link enviado</p>
          <p className="text-[12px] font-medium leading-relaxed text-green-700/80">
            Se o e-mail <strong>{email}</strong> estiver cadastrado com senha, você receberá um link para redefini-la. Verifique também a pasta de spam.
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onBackToLogin}
        className="w-full flex items-center justify-center gap-2 bg-[#111111] text-white rounded-full px-5 py-4 text-[14px] font-bold hover:bg-black transition-colors"
      >
        Voltar para o login
        <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
      </button>
    </div>
  );
}