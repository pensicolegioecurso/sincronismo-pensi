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
import { Mail, Lock, Eye, EyeOff, LogIn, ArrowRight, Link2, Loader2 } from "lucide-react";

import LoginBackButton from "../components/auth/AuthBackButton";
import LoginCard from "../components/auth/AuthCard";
import LoginSidePanel from "../components/auth/AuthSidePanel";
import LoginError from "../components/auth/AuthError";
import LoginFormField from "../components/auth/AuthFormField";
import LoginGoogleButton from "../components/auth/AuthGoogleButton";
import LoginDivider from "../components/auth/AuthDivider";

const DOMINIO_PERMITIDO = import.meta.env.VITE_DOMINIO_PERMITIDO || "@pensi.com.br";

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

  const [vinculoPendente, setVinculoPendente] = useState(null);
  const [senhaVinculo, setSenhaVinculo] = useState("");
  const [mostrarSenhaVinculo, setMostrarSenhaVinculo] = useState(false);
  const [vinculando, setVinculando] = useState(false);

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
      if (!res.ok) setErro(res.message || "Não foi possível realizar o login.");
    } catch {
      setErro("Ocorreu um erro ao entrar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

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
    } catch (error) {
      console.error("Erro no login com Google:", error);
      if (error.code === "auth/popup-closed-by-user") {
        setErro("Login cancelado. Tente novamente.");
      } else if (error.code === "auth/unauthorized-domain") {
        setErro("Domínio não autorizado. Configure o domínio no Console do Firebase.");
      } else if (error.code === "auth/account-exists-with-different-credential") {
        const emailConflito =
          error.customData?.email ||
          (await (async () => {
            try {
              const cred = GoogleAuthProvider.credentialFromError(error);
              return cred?.email || "";
            } catch { return ""; }
          })());

        if (!emailConflito) {
          setErro("Este e-mail já possui uma conta com senha. Entre com e-mail e senha e vincule o Google no seu perfil.");
          return;
        }
        try {
          const metodos = await fetchSignInMethodsForEmail(auth, emailConflito);
          if (!metodos.includes("password")) {
            setErro("Este e-mail já está em uso por outro método. Entre em contato com o suporte.");
            return;
          }
        } catch (e) {}
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
      const userCred = await signInWithEmailAndPassword(auth, emailVinc, senhaVinculo);
      if (credentialGoogle) {
        await linkWithCredential(userCred.user, credentialGoogle);
      } else {
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({ prompt: "select_account" });
        const { linkWithPopup } = await import("firebase/auth");
        await linkWithPopup(userCred.user, provider);
      }
      setVinculoPendente(null);
      setSenhaVinculo("");
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

  return (
    <main className="relative isolate min-h-screen flex items-center justify-center bg-[#F1F2F4] px-4 sm:px-6 py-12">
      <LoginBackButton onClick={() => onNavigate("home")} />

      <LoginCard>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center mt-4">
          
          {/* Coluna do Formulário com Divisória */}
          <div className="order-2 lg:order-1 flex flex-col justify-center w-full max-w-md mx-auto lg:max-w-none lg:border-r border-gray-100 lg:pr-12">
            <LoginError>{erro}</LoginError>

            {vinculoPendente ? (
              <div className="space-y-5 animate-fade-in">
                <div className="p-4 bg-pensi-yellow/10 border border-pensi-yellow/30 rounded-2xl flex items-start gap-3">
                  <Link2 className="w-5 h-5 text-pensi-dark shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[13px] font-bold text-pensi-dark mb-1">Vínculo necessário</p>
                    <p className="text-[12px] text-gray-600 leading-relaxed">
                      O e-mail <strong>{vinculoPendente.email}</strong> já tem uma conta. Digite sua senha para vincular o Google e entrar.
                    </p>
                  </div>
                </div>
                <form onSubmit={handleVincular} className="space-y-4">
                  <div>
                    <label htmlFor="vinculo-senha" className="block text-[12px] font-bold text-pensi-dark mb-1.5">Senha</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                      <input
                        id="vinculo-senha" type={mostrarSenhaVinculo ? "text" : "password"} value={senhaVinculo}
                        onChange={(e) => setSenhaVinculo(e.target.value)} placeholder="••••••••" autoFocus
                        className="w-full bg-white border border-gray-200 rounded-2xl pl-11 pr-12 py-3.5 text-[14px] outline-none focus:border-pensi-yellow focus:ring-4 focus:ring-pensi-yellow/20 transition-all"
                      />
                      <button type="button" onClick={() => setMostrarSenhaVinculo((v) => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-pensi-dark transition-colors">
                        {mostrarSenhaVinculo ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <button type="submit" disabled={vinculando} className="w-full flex items-center justify-center gap-2 bg-pensi-yellow text-pensi-dark rounded-2xl px-5 py-4 text-[14px] font-bold hover:bg-pensi-yellow-hover transition-colors disabled:opacity-60">
                    {vinculando ? <><Loader2 className="w-4 h-4 animate-spin" /> Vinculando...</> : <><Link2 className="w-4 h-4" strokeWidth={2.5} /> Vincular e entrar</>}
                  </button>
                  <button type="button" onClick={cancelarVinculo} className="w-full py-1 text-[12px] font-medium text-gray-500 hover:text-pensi-dark transition-colors">
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
                    id="login-email" label="E-mail institucional" type="email" value={email}
                    onChange={(e) => setEmail(e.target.value)} placeholder="nome@pensi.com.br" icon={Mail} required
                  />
                  <div>
                    <div className="flex items-center justify-between gap-3 mb-1.5">
                      <label htmlFor="login-senha" className="text-[12px] font-bold text-[#111111]">Senha</label>
                      <button type="button" onClick={() => onNavigate("redefine")} className="text-[11px] font-medium text-gray-500 hover:text-[#111111] transition-colors">
                        Esqueceu?
                      </button>
                    </div>
                    <LoginFormField
                      id="login-senha" type={mostrarSenha ? "text" : "password"} value={senha}
                      onChange={(e) => setSenha(e.target.value)} placeholder="••••••••" icon={Lock} required
                      rightElement={
                        <button type="button" onClick={() => setMostrarSenha((prev) => !prev)} className="text-gray-400 hover:text-[#111111] transition-colors">
                          {mostrarSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      }
                    />
                  </div>
                  <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 bg-[#111111] text-white rounded-2xl px-5 py-4 mt-2 text-[14px] font-bold hover:bg-black transition-colors disabled:opacity-60">
                    {loading ? <><span className="w-4 h-4 border-[2px] border-white border-t-transparent rounded-full animate-spin" /> Entrando...</> : <>Acessar <ArrowRight className="w-4 h-4" strokeWidth={2.5} /></>}
                  </button>
                </form>
                <div className="mt-6 text-center pt-5 border-t border-gray-100">
                  <p className="text-[13px] font-medium text-gray-500">
                    Ainda não tem acesso?{" "}
                    <button type="button" onClick={() => onNavigate("register")} className="font-bold text-[#111111] hover:text-pensi-yellow transition-colors">
                      Criar conta
                    </button>
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Coluna do Side Panel */}
          <div className="order-1 lg:order-2 flex items-center justify-center lg:justify-start w-full">
            <LoginSidePanel
              icon={LogIn}
              title="Acesse sua"
              description="Bem-vindo de volta! Entre com suas credenciais institucionais para acessar o painel de gestão e acompanhar suas aulas."
            />
          </div>

        </div>
      </LoginCard>
    </main>
  );
}