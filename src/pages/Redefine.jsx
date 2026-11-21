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
      let metodos = [];
      try {
        metodos = await fetchSignInMethodsForEmail(auth, emailLimpo);
      } catch (err) {
        console.warn("Não foi possível verificar os métodos de login:", err);
      }

      if (metodos.length > 0 && metodos.includes("google.com") && !metodos.includes("password")) {
        setErro(
          "Esta conta foi criada com o Google e não possui senha para redefinir. " +
          "Por favor, volte e use o botão 'Entrar com o Google'."
        );
        setLoading(false);
        return;
      }

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
    <main className="relative isolate min-h-screen flex items-center justify-center bg-[#F1F2F4] px-4 sm:px-6 py-12">
      <AuthBackButton onClick={() => onNavigate("login")} label="Voltar" />

      <AuthCard maxWidth="max-w-[900px]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center mt-4">
          
          {/* Painel Lateral Esquerdo (Estilo Home) */}
          <div className="order-2 lg:order-1 flex flex-col items-start text-left h-full pt-2">
            <RedefineSidePanel enviado={enviado} />
          </div>

          {/* Coluna do Formulário com Divisória */}
          <div className="order-1 lg:order-2 w-full max-w-md mx-auto lg:max-w-none lg:border-l border-gray-100 lg:pl-12">
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
                    className="w-full flex items-center justify-center gap-2 bg-pensi-yellow text-[#111111] rounded-full px-5 py-4 mt-2 text-[14px] font-bold hover:bg-pensi-yellow-hover transition-colors disabled:opacity-60"
                  >
                    {loading ? (
                      <>
                        <span className="w-4 h-4 border-[2px] border-[#111111] border-t-transparent rounded-full animate-spin" />
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

                <div className="mt-6 text-center pt-5 border-t border-gray-100">
                  <p className="text-[13px] font-medium text-gray-500">
                    Lembrou sua senha?{" "}
                    <button
                      type="button"
                      onClick={() => onNavigate("login")}
                      className="font-bold text-[#111111] hover:text-pensi-yellow transition-colors"
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