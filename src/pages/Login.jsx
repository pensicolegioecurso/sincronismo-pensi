import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import {
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  fetchSignInMethodsForEmail,
  signInWithEmailAndPassword,
  linkWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import { auth } from "../services/firebase";
import { Mail, Lock, Eye, EyeOff, LogIn, ArrowRight, AlertCircle, Link2, Loader2 } from "lucide-react";

import LoginBackButton from "../components/auth/AuthBackButton";
import LoginCard from "../components/auth/AuthCard";
import LoginSidePanel from "../components/auth/AuthSidePanel";
import LoginError from "../components/auth/AuthError";
import LoginFormField from "../components/auth/AuthFormField";
import LoginGoogleButton from "../components/auth/AuthGoogleButton";
import LoginDivider from "../components/auth/AuthDivider";

const DOMINIO_PERMITIDO =
  import.meta.env.VITE_DOMINIO_PERMITIDO || "@pensi.com.br";

function emailPertenceAoDominio(email) {
  if (!email) return false;
  return email.toLowerCase().endsWith(DOMINIO_PERMITIDO.toLowerCase());
}

export default function Login({ onNavigate }) {
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Estado do fluxo de vínculo (quando o Google bate em conta existente com senha)
  const [vinculoPendente, setVinculoPendente] = useState(null);
  // vinculoPendente = { email, credentialGoogle }

  const [senhaVinculo, setSenhaVinculo] = useState("");
  const [mostrarSenhaVinculo, setMostrarSenhaVinculo] = useState(false);
  const [vinculando, setVinculando] = useState(false);

  // ----- LOGIN COM EMAIL/SENHA -----
  async function handleSubmit(e) {
    e.preventDefault();
    setErro("");

    if (!email || !senha) {
      setErro("Por favor, preencha todos os campos.");
      return;
    }

    setLoading(true);
    try {
      const res = await login(email, senha);
      if (!res.ok) {
        setErro(res.message || "Não foi possível realizar o login.");
      }
      // NÃO navegar aqui. O App decide (modal de cargos ou redirect).
    } catch {
      setErro("Ocorreu um erro ao entrar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  // ----- LOGIN COM GOOGLE -----
  const handleGoogleLogin = async () => {
    setErro("");
    setVinculoPendente(null);
    setGoogleLoading(true);
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });

    try {
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;

      if (!emailPertenceAoDominio(firebaseUser.email)) {
        await signOut(auth);
        setErro(`Acesso negado. Use um e-mail ${DOMINIO_PERMITIDO}.`);
        return;
      }
      // OK: App decide o resto.
    } catch (error) {
      console.error("Erro no login com Google:", error);

      if (error.code === "auth/popup-closed-by-user") {
        setErro("Login cancelado. Tente novamente.");
      } else if (error.code === "auth/unauthorized-domain") {
        setErro("Domínio não autorizado. Configure o domínio no Console do Firebase.");
      } else if (error.code === "auth/account-exists-with-different-credential") {
        // A conta já existe com senha. Vamos pedir a senha pra vincular.
        const emailConflito =
          error.customData?.email ||
          (await (async () => {
            try {
              // fallback: pegar o e-mail do credential retornado
              const cred = GoogleAuthProvider.credentialFromError(error);
              return cred?.email || "";
            } catch { return ""; }
          })());

        if (!emailConflito) {
          setErro(
            "Este e-mail já possui uma conta com senha. Entre com e-mail e senha e vincule o Google no seu perfil."
          );
          return;
        }

        // Descobre se realmente é senha
        try {
          const metodos = await fetchSignInMethodsForEmail(auth, emailConflito);
          if (!metodos.includes("password")) {
            setErro(
              "Este e-mail já está em uso por outro método. Entre em contato com o suporte."
            );
            return;
          }
        } catch (e) {
          // se falhar, segue com o fluxo mesmo assim
        }

        // Guarda o credential do Google pra vincular depois
        const credentialGoogle = GoogleAuthProvider.credentialFromError(error);
        setVinculoPendente({ email: emailConflito, credentialGoogle });
        setSenhaVinculo("");
        setErro("");
      } else {
        setErro("Erro ao entrar com Google. Tente novamente.");
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  // ----- VINCULAR GOOGLE A UMA CONTA EXISTENTE -----
  const handleVincular = async (e) => {
    e.preventDefault();
    if (!vinculoPendente) return;
    if (!senhaVinculo) {
      setErro("Digite sua senha para vincular a conta do Google.");
      return;
    }

    setErro("");
    setVinculando(true);
    try {
      const { email: emailVinc, credentialGoogle } = vinculoPendente;

      // 1) Autentica com a senha
      const userCred = await signInWithEmailAndPassword(auth, emailVinc, senhaVinculo);

      // 2) Vincula o credential do Google à conta existente
      if (credentialGoogle) {
        await linkWithCredential(userCred.user, credentialGoogle);
      } else {
        // fallback: abre popup de novo e vincula
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({ prompt: "select_account" });
        const { linkWithPopup } = await import("firebase/auth");
        await linkWithPopup(userCred.user, provider);
      }

      setVinculoPendente(null);
      setSenhaVinculo("");
      // App detecta user e segue (modal de cargos ou redirect).
    } catch (err) {
      console.error("Erro ao vincular:", err);
      if (err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
        setErro("Senha incorreta. Tente novamente.");
      } else if (err.code === "auth/credential-already-in-use") {
        setErro("Esta conta do Google já está vinculada a outro usuário.");
      } else if (err.code === "auth/provider-already-linked") {
        setErro("O Google já está vinculado a esta conta. Faça login com Google novamente.");
        setVinculoPendente(null);
      } else {
        setErro("Não foi possível vincular. Tente novamente.");
      }
    } finally {
      setVinculando(false);
    }
  };

  const cancelarVinculo = () => {
    setVinculoPendente(null);
    setSenhaVinculo("");
    setErro("");
  };

  // ----- RENDER -----
  return (
    <main className="relative isolate min-h-screen flex items-center justify-center bg-[#f3f4f6] px-4 sm:px-6 py-8">
      <LoginBackButton onClick={() => onNavigate("home")} />

      <LoginCard>
        <div className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr] gap-8 md:gap-12 items-center mt-4">
          <div className="md:border-r-[2px] md:border-gray-100 md:pr-10 order-2 md:order-1">
            <LoginError>{erro}</LoginError>

            {/* FLUXO DE VÍNCULO */}
            {vinculoPendente ? (
              <div className="space-y-4 animate-fade-in">
                <div className="p-3 bg-blue-50 border-2 border-blue-300 rounded-lg flex items-start gap-2">
                  <Link2 className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[11px] font-black text-blue-900 uppercase tracking-wide">
                      Vínculo necessário
                    </p>
                    <p className="text-[10px] text-blue-700 mt-0.5 leading-relaxed">
                      O e-mail <strong>{vinculoPendente.email}</strong> já tem uma conta com senha.
                      Digite sua senha para vincular a conta do Google e entrar.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleVincular} className="space-y-3">
                  <div>
                    <label htmlFor="vinculo-senha" className="block text-[11px] font-medium text-gray-800 mb-1">
                      Senha
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        id="vinculo-senha"
                        type={mostrarSenhaVinculo ? "text" : "password"}
                        value={senhaVinculo}
                        onChange={(e) => setSenhaVinculo(e.target.value)}
                        placeholder="••••••••"
                        autoFocus
                        className="w-full border-[2px] border-black rounded-lg pl-9 pr-10 py-2.5 text-[13px] outline-none focus:bg-pensi-yellow/20 transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setMostrarSenhaVinculo((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black"
                      >
                        {mostrarSenhaVinculo ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={vinculando}
                    className="w-full flex items-center justify-center gap-2 bg-pensi-yellow text-black border-[2px] border-black rounded-lg px-5 py-2.5 text-[13px] font-semibold shadow-[3px_3px_0px_0px_#000] hover:bg-[#ffdb4d] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_#000] active:shadow-none active:translate-x-[3px] active:translate-y-[3px] transition-all disabled:opacity-60"
                  >
                    {vinculando ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Vinculando...
                      </>
                    ) : (
                      <>
                        <Link2 className="w-4 h-4" strokeWidth={2.5} />
                        Vincular e entrar
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={cancelarVinculo}
                    className="w-full py-1 text-[11px] font-medium text-gray-500 hover:text-black transition-colors"
                  >
                    Cancelar e voltar
                  </button>
                </form>
              </div>
            ) : (
              <>
                <LoginGoogleButton onClick={handleGoogleLogin} loading={googleLoading} />

                <LoginDivider label="ou e-mail" />

                <form onSubmit={handleSubmit} className="space-y-4">
                  <LoginFormField
                    id="login-email"
                    label="E-mail institucional"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nome@pensi.com.br"
                    icon={Mail}
                    required
                  />

                  <div>
                    <div className="flex items-center justify-between gap-3 mb-1">
                      <label htmlFor="login-senha" className="text-[11px] font-medium text-gray-800">
                        Senha
                      </label>
                      <button
                        type="button"
                        onClick={() => onNavigate("redefine")}
                        className="text-[10px] font-normal text-gray-500 hover:text-black transition-colors"
                      >
                        Esqueceu?
                      </button>
                    </div>
                    <LoginFormField
                      id="login-senha"
                      type={mostrarSenha ? "text" : "password"}
                      value={senha}
                      onChange={(e) => setSenha(e.target.value)}
                      placeholder="••••••••"
                      icon={Lock}
                      required
                      rightElement={
                        <button
                          type="button"
                          onClick={() => setMostrarSenha((prev) => !prev)}
                          className="text-gray-400 hover:text-black transition-colors"
                        >
                          {mostrarSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      }
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 bg-pensi-yellow text-black border-[2px] border-black rounded-lg px-5 py-2.5 mt-5 text-[13px] font-semibold shadow-[3px_3px_0px_0px_#000] hover:bg-[#ffdb4d] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_#000] active:shadow-none active:translate-x-[3px] active:translate-y-[3px] transition-all disabled:opacity-60"
                  >
                    {loading ? (
                      <>
                        <span className="w-4 h-4 border-[2px] border-black border-t-transparent rounded-full animate-spin" />
                        Entrando...
                      </>
                    ) : (
                      <>
                        Entrar
                        <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-5 text-center pt-4 border-t-[1px] border-gray-100">
                  <p className="text-[11px] font-normal text-gray-500">
                    Ainda não tem acesso?{" "}
                    <button
                      type="button"
                      onClick={() => onNavigate("register")}
                      className="font-semibold text-black underline decoration-pensi-yellow decoration-2 underline-offset-4 hover:decoration-black transition-colors"
                    >
                      Criar conta
                    </button>
                  </p>
                </div>
              </>
            )}
          </div>

          <LoginSidePanel
            icon={LogIn}
            title="Acesse sua conta"
            description="Bem-vindo de volta! Entre com suas credenciais institucionais para acessar o painel de gestão e acompanhar suas aulas."
            order="order-1 md:order-2"
          />
        </div>
      </LoginCard>
    </main>
  );
}