import { useState } from "react";
import {
  Mail,
  ArrowLeft,
  ArrowRight,
  LockKeyhole,
  CheckCircle2,
} from "lucide-react";

export default function Redefine({ onNavigate }) {
  const [email, setEmail] = useState("");
  const [enviado, setEnviado] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    if (!email.trim()) return;
    setEnviado(true);
  }

  return (
    /* Fundo atualizado e sem blobs */
    <main className="relative min-h-screen flex items-center justify-center bg-[#f3f4f6] px-4 sm:px-6 py-6">
      
      {/* Botão Voltar */}
      <button
        type="button"
        onClick={() => onNavigate("login")}
        className="absolute top-6 left-6 sm:top-8 sm:left-8 z-30 inline-flex items-center gap-2 text-[#171717] text-[12px] font-medium bg-white border-[2px] border-black rounded-lg px-4 py-2 shadow-[3px_3px_0px_0px_#000] hover:bg-gray-50 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all duration-150"
      >
        <ArrowLeft className="w-4 h-4" strokeWidth={2.5} />
        Voltar
      </button>

      {/* CARD PRINCIPAL */}
      <div className="relative z-10 w-full max-w-[750px] bg-white border-[3px] border-black rounded-2xl shadow-[8px_8px_0px_0px_#000] px-8 py-8 sm:px-10 sm:py-10">
        
        {/* Pontinhos decorativos */}
        <div className="absolute top-5 left-6 flex items-center gap-1.5" aria-hidden="true">
          <span className="w-2.5 h-2.5 rounded-full bg-pensi-yellow border border-black/30" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#D8E8FF] border border-black/30" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#F8DCEB] border border-black/30" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10 items-center mt-4">
          
          {/* LADO ESQUERDO: Título e Ícone */}
          <div className="flex flex-col items-start text-left">
            <div className="w-12 h-12 flex items-center justify-center bg-pensi-yellow border-[2px] border-black rounded-full shadow-[3px_3px_0px_0px_#000] mb-6">
              {enviado ? (
                <CheckCircle2 className="w-5 h-5 text-black" strokeWidth={2.5} />
              ) : (
                <LockKeyhole className="w-5 h-5 text-black" strokeWidth={2.5} />
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight leading-tight text-gray-900 mb-3">
              {enviado ? "Solicitação registrada" : "Redefinir senha"}
              <span className="text-pensi-yellow">.</span>
            </h1>

            <p className="text-[13px] font-light leading-relaxed text-gray-500 max-w-[280px]">
              {enviado
                ? "Sua solicitação foi registrada. Confira as informações ao lado."
                : "Esqueceu sua senha? Informe seu e-mail institucional para solicitar a recuperação do acesso."}
            </p>
          </div>

          {/* LADO DIREITO: Formulário / Sucesso */}
          <div className="md:border-l-[2px] md:border-gray-100 md:pl-10">
            {enviado ? (
              <div className="space-y-4">
                <div className="flex items-start gap-3 bg-green-50 border-[2px] border-black rounded-lg p-3">
                  <CheckCircle2 className="w-4 h-4 text-green-700 shrink-0 mt-0.5" strokeWidth={2.5} />
                  <div>
                    <p className="text-[12px] font-bold text-green-800 mb-0.5">Solicitação recebida</p>
                    <p className="text-[11px] font-normal leading-relaxed text-green-700">
                      A recuperação por e-mail está em desenvolvimento. Nenhum link foi enviado nesta etapa.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onNavigate("login")}
                  className="w-full flex items-center justify-center gap-2 bg-pensi-yellow text-black border-[2px] border-black rounded-lg px-4 py-2.5 text-[13px] font-semibold shadow-[3px_3px_0px_0px_#000] hover:bg-[#ffdb4d] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_#000] active:shadow-none active:translate-x-[3px] active:translate-y-[3px] transition-all duration-150"
                >
                  Voltar para o login
                  <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
                </button>
              </div>
            ) : (
              <>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="redefine-email" className="block text-[11px] font-medium text-gray-800 mb-1.5">
                      E-mail institucional
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" strokeWidth={2} />
                      <input
                        id="redefine-email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="nome@pensi.com.br"
                        className="w-full bg-gray-50 border-[2px] border-gray-300 rounded-lg pl-9 pr-4 py-2.5 text-[13px] text-gray-900 placeholder:text-gray-400 outline-none focus:border-black focus:bg-white focus:shadow-[3px_3px_0px_0px_#F5C518] transition-all duration-200"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 bg-pensi-yellow text-black border-[2px] border-black rounded-lg px-4 py-2.5 text-[13px] font-semibold shadow-[3px_3px_0px_0px_#000] hover:bg-[#ffdb4d] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_#000] active:shadow-none active:translate-x-[3px] active:translate-y-[3px] transition-all duration-150"
                  >
                    Enviar link
                    <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
                  </button>
                </form>

                <div className="mt-5 text-center pt-4 border-t-[1px] border-gray-100">
                  <p className="text-[11px] font-normal text-gray-500">
                    Lembrou sua senha?{" "}
                    <button
                      type="button"
                      onClick={() => onNavigate("login")}
                      className="font-semibold text-black underline decoration-pensi-yellow decoration-2 underline-offset-4 hover:decoration-black transition-colors"
                    >
                      Fazer login
                    </button>
                  </p>
                </div>
              </>
            )}
          </div>

        </div>
      </div>
    </main>
  );
}