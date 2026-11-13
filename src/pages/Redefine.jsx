import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { fetchSignInMethodsForEmail } from "firebase/auth";
import { auth } from "../services/firebase";
import { Mail, ArrowRight } from "lucide-react";

import AuthBackButton from "../components/auth/AuthBackButton";
import AuthCard from "../components/auth/AuthCard";
import AuthError from "../components/auth/AuthError";
import AuthFormField from "../components/auth/AuthFormField";
import RedefineSidePanel from "../components/redefine/RedefineSidePanel";
import RedefineSuccess from "../components/redefine/RedefineSuccess";

export default function Redefine({ onNavigate }) {
  const { redefine } = useAuth();
  const [email, setEmail] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setErro("");

    const emailLimpo = email.trim().toLowerCase();

    if (!emailLimpo) {
      setErro("Informe seu e-mail institucional.");
      return;
    }

    setLoading(true);
    try {
      // 1. Verifica quais métodos de login existem para este e-mail
      let metodos = [];
      try {
        metodos = await fetchSignInMethodsForEmail(auth, emailLimpo);
      } catch (err) {
        // Se a proteção contra enumeração estiver ativa, a função pode falhar
        // ou retornar lista vazia. Nesse caso, seguimos com o fluxo normal.
        console.warn("Não foi possível verificar os métodos de login:", err);
      }

      // 2. Se o único método for Google, avisa e não envia o link
      if (metodos.length > 0 && metodos.includes("google.com") && !metodos.includes("password")) {
        setErro(
          "Esta conta foi criada com o Google e não possui senha para redefinir. " +
          "Por favor, volte e use o botão 'Entrar com o Google'."
        );
        setLoading(false);
        return;
      }

      // 3. Caso contrário, envia o e-mail normalmente
      const res = await redefine(emailLimpo);
      if (res.ok) {
        setEnviado(true);
      } else {
        setErro(res.message || "Não foi possível enviar o e-mail de recuperação.");
      }
    } catch {
      setErro("Ocorreu um erro ao enviar o e-mail. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen flex items-center justify-center bg-[#f3f4f6] px-4 sm:px-6 py-6">
      <AuthBackButton onClick={() => onNavigate("login")} label="Voltar" />

      <AuthCard maxWidth="max-w-[750px]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10 items-center mt-4">
          <RedefineSidePanel enviado={enviado} />

          <div className="md:border-l-[2px] md:border-gray-100 md:pl-10">
            {enviado ? (
              <RedefineSuccess
                email={email}
                onBackToLogin={() => onNavigate("login")}
              />
            ) : (
              <>
                <AuthError>{erro}</AuthError>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <AuthFormField
                    id="redefine-email"
                    label="E-mail institucional"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nome@pensi.com.br"
                    icon={Mail}
                    required
                  />

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 bg-pensi-yellow text-black border-[2px] border-black rounded-lg px-4 py-2.5 text-[13px] font-semibold shadow-[3px_3px_0px_0px_#000] hover:bg-[#ffdb4d] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_#000] active:shadow-none active:translate-x-[3px] active:translate-y-[3px] transition-all duration-150 disabled:opacity-60"
                  >
                    {loading ? (
                      <>
                        <span className="w-4 h-4 border-[2px] border-black border-t-transparent rounded-full animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        Enviar link
                        <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
                      </>
                    )}
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
      </AuthCard>
    </main>
  );
}