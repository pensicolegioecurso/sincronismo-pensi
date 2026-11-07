import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { Mail, Lock, ArrowRight, ArrowLeft, Eye, EyeOff, LogIn } from "lucide-react";

export default function Login({ onNavigate }) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

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
      
      if (res.ok) {
        const loggedUser = res.user;
        const isAdmin = loggedUser?.cargos?.includes("admin");
        const isDirecao = loggedUser?.cargos?.includes("direcao");
        // Fallback para modelo antigo
        const isAdminAntigo = loggedUser?.cargo === "admin";
        const isDirecaoAntigo = loggedUser?.cargo === "direcao";

        if (isAdmin || isAdminAntigo) {
          onNavigate("admin");
        } else if (isDirecao || isDirecaoAntigo) {
          onNavigate("direcao");
        } else {
          onNavigate("professor");
        }
      } else {
        setErro(res.message || "Não foi possível realizar o login.");
      }
    } catch {
      setErro("Ocorreu um erro ao entrar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  const handleGoogleLogin = () => {
    alert("Login com Google será implementado em breve!");
  };

  return (
    <main className="relative isolate min-h-screen flex items-center justify-center bg-[#f3f4f6] px-4 sm:px-6 py-8">
      <button
        type="button"
        onClick={() => onNavigate("home")}
        className="absolute top-6 left-6 sm:top-8 sm:left-8 z-30 inline-flex items-center gap-2 text-[#171717] text-[12px] font-medium bg-white border-[2px] border-black rounded-lg px-4 py-2 shadow-[3px_3px_0px_0px_#000] hover:bg-gray-50 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all duration-150"
      >
        <ArrowLeft className="w-4 h-4" strokeWidth={2.5} />
        Voltar
      </button>

      <div className="relative z-10 w-full max-w-[850px] bg-white border-[3px] border-black rounded-2xl shadow-[8px_8px_0px_0px_#000] px-8 py-8 sm:px-10 sm:py-10">
        <div className="absolute top-5 left-6 flex items-center gap-1.5" aria-hidden="true">
          <span className="w-2.5 h-2.5 rounded-full bg-pensi-yellow border border-black/30" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#D8E8FF] border border-black/30" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#F8DCEB] border border-black/30" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr] gap-8 md:gap-12 items-center mt-4">
          <div className="md:border-r-[2px] md:border-gray-100 md:pr-10 order-2 md:order-1">
            
            {erro && (
              <div role="alert" className="mb-4 bg-red-50 border-[2px] border-black rounded-lg px-3 py-2 text-[11px] font-medium text-red-700">
                {erro}
              </div>
            )}

            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-2 bg-white text-gray-800 border-[2px] border-black rounded-lg px-4 py-2.5 mb-4 text-[13px] font-medium shadow-[3px_3px_0px_0px_#000] hover:bg-gray-50 hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_#000] active:shadow-none active:translate-x-[3px] active:translate-y-[3px] transition-all duration-150"
            >
              <svg className="w-[16px] h-[16px]" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Entrar com o Google
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-[1px] bg-gray-200"></div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">ou e-mail</span>
              <div className="flex-1 h-[1px] bg-gray-200"></div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="login-email" className="block text-[11px] font-medium text-gray-800 mb-1">E-mail institucional</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" strokeWidth={2} />
                  <input
                    id="login-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nome@pensi.com.br"
                    className="w-full bg-gray-50 border-[2px] border-gray-300 rounded-lg pl-9 pr-4 py-2.5 text-[13px] text-gray-900 placeholder:text-gray-400 outline-none focus:border-black focus:bg-white focus:shadow-[3px_3px_0px_0px_#F5C518] transition-all duration-200"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between gap-3 mb-1">
                  <label htmlFor="login-senha" className="text-[11px] font-medium text-gray-800">Senha</label>
                  <button type="button" onClick={() => onNavigate("redefine")} className="text-[10px] font-normal text-gray-500 hover:text-black transition-colors">Esqueceu?</button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" strokeWidth={2} />
                  <input
                    id="login-senha"
                    type={mostrarSenha ? "text" : "password"}
                    required
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-gray-50 border-[2px] border-gray-300 rounded-lg pl-9 pr-10 py-2.5 text-[13px] text-gray-900 placeholder:text-gray-400 outline-none focus:border-black focus:bg-white focus:shadow-[3px_3px_0px_0px_#F5C518] transition-all duration-200"
                  />
                  <button type="button" onClick={() => setMostrarSenha((prev) => !prev)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors">
                    {mostrarSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-pensi-yellow text-black border-[2px] border-black rounded-lg px-5 py-2.5 mt-5 text-[13px] font-semibold shadow-[3px_3px_0px_0px_#000] hover:bg-[#ffdb4d] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_#000] active:shadow-none active:translate-x-[3px] active:translate-y-[3px] transition-all disabled:opacity-60"
              >
                {loading ? (
                  <><span className="w-4 h-4 border-[2px] border-black border-t-transparent rounded-full animate-spin" />Entrando...</>
                ) : (
                  <>Entrar<ArrowRight className="w-4 h-4" strokeWidth={2.5} /></>
                )}
              </button>
            </form>

            <div className="mt-5 text-center pt-4 border-t-[1px] border-gray-100">
              <p className="text-[11px] font-normal text-gray-500">
                Ainda não tem acesso?{" "}
                <button type="button" onClick={() => onNavigate("register")} className="font-semibold text-black underline decoration-pensi-yellow decoration-2 underline-offset-4 hover:decoration-black transition-colors">Criar conta</button>
              </p>
            </div>
          </div>

          <div className="flex flex-col items-start text-left h-full pt-2 order-1 md:order-2">
            <div className="w-12 h-12 flex items-center justify-center bg-pensi-yellow border-[2px] border-black rounded-full shadow-[3px_3px_0px_0px_#000] mb-6">
              <LogIn className="w-5 h-5 text-black" strokeWidth={2.5} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight leading-tight text-gray-900 mb-3">
              Acesse sua conta<span className="text-pensi-yellow">.</span>
            </h1>
            <p className="text-[13px] font-light leading-relaxed text-gray-500 max-w-[280px]">
              Bem-vindo de volta! Entre com suas credenciais institucionais para acessar o painel de gestão e acompanhar suas aulas.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}