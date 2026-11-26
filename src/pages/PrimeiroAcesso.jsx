
import { useState } from "react";

import {
  Lock,
  Eye,
  EyeOff,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  Loader2,
} from "lucide-react";

import { useAuth } from "../hooks/useAuth";
import AuthBackButton from "../components/auth/AuthBackButton";
import AuthCard from "../components/auth/AuthCard";
import AuthError from "../components/auth/AuthError";
import RegisterPasswordStrength from "../components/register/RegisterPasswordStrength";
import { validarSenha } from "../utils/validators";

export default function PrimeiroAcesso() {
  const {
    user,
    concluirPrimeiroAcesso,
    logout,
  } = useAuth();

  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");

  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false);

  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setErro("");

    const erroSenha = validarSenha(senha);
    if (erroSenha) {
      setErro(erroSenha);
      return;
    }

    if (senha !== confirmarSenha) {
      setErro("As senhas não coincidem.");
      return;
    }

    setLoading(true);

    try {
      const resultado = await concluirPrimeiroAcesso(senha);

      if (!resultado.ok) {
        setErro(resultado.message);
        return;
      }

      setSucesso(true);
      setSenha("");
      setConfirmarSenha("");
    } catch (err) {
      console.error(err);
      setErro("Ocorreu um erro inesperado. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <main className="relative isolate min-h-screen flex items-center justify-center bg-[#F1F2F4] px-4 sm:px-6 py-12">
      <AuthBackButton onClick={handleLogout} label="Sair" />
      <AuthCard maxWidth="max-w-[900px]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center mt-4">
          <section className="order-2 lg:order-1 flex flex-col items-start text-left">
            <KeyRound className="w-10 h-10 sm:w-12 sm:h-12 text-[#111111] mb-6" strokeWidth={2.5} />
            <div className="mb-8">
              <h1 className="text-[40px] sm:text-[48px] font-black tracking-[-0.04em] leading-[0.9] text-[#111111] uppercase -rotate-2">Primeiro</h1>
              <h1 className="text-[40px] sm:text-[48px] font-black tracking-[-0.04em] leading-[0.9] uppercase rotate-2 mt-2 ml-2"><span className="bg-pensi-yellow px-3 py-1 inline-block text-[#111111]">acesso.</span></h1>
            </div>
            <p className="text-[15px] sm:text-[16px] font-medium leading-relaxed text-gray-500 max-w-[320px]">Vamos configurar sua senha pessoal para liberar o acesso à sua conta.</p>
          </section>
          <section className="order-1 lg:order-2 w-full max-w-md mx-auto lg:max-w-none lg:border-l border-gray-100 lg:pl-12">

          <div className="flex items-start gap-3 p-3 bg-yellow-50 border-[2px] border-yellow-300 rounded-lg mb-6">
            <ShieldCheck className="w-5 h-5 text-yellow-700 shrink-0 mt-0.5" />

            <div>
              <p className="text-[11px] font-black uppercase text-yellow-900">
                Proteja sua conta
              </p>

              <p className="text-[11px] text-yellow-800 mt-1 leading-relaxed">
                Como seu acesso foi criado pela administração,
                você precisa substituir a senha inicial por uma
                senha pessoal antes de continuar.
              </p>
            </div>
          </div>

          <div className="mb-5">
            <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400">
              Conta conectada
            </p>

            <p className="text-sm font-semibold text-gray-800 mt-1 break-all">
              {user?.email}
            </p>
          </div>

          <AuthError>{erro}</AuthError>

          {sucesso && (
            <div className="flex items-start gap-2 p-3 mb-4 bg-green-50 border-[2px] border-green-200 rounded-lg">
              <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
              <p className="text-xs text-green-700 font-medium">
                Senha atualizada com sucesso! Seu acesso está liberado.
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            <div>
              <label className="block text-[11px] font-bold text-gray-800 mb-1.5">
                Nova senha
              </label>

              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />

                <input
                  type={mostrarSenha ? "text" : "password"}
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="Digite sua nova senha"
                  autoComplete="new-password"
                  required
                  disabled={loading || sucesso}
                  className="w-full bg-white border border-gray-200 rounded-2xl pl-11 pr-12 py-4 text-[14px] text-[#111111] placeholder:text-gray-400 outline-none focus:border-pensi-yellow focus:ring-4 focus:ring-pensi-yellow/20 transition-all disabled:bg-gray-100"
                />

                <button
                  type="button"
                  onClick={() => setMostrarSenha((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#111111]"
                >
                  {mostrarSenha
                    ? <EyeOff className="w-4 h-4" />
                    : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <RegisterPasswordStrength senha={senha} />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-800 mb-1.5">
                Confirmar nova senha
              </label>

              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />

                <input
                  type={mostrarConfirmacao ? "text" : "password"}
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                  placeholder="Digite novamente sua senha"
                  autoComplete="new-password"
                  required
                  disabled={loading || sucesso}
                  className="w-full bg-white border border-gray-200 rounded-2xl pl-11 pr-12 py-4 text-[14px] text-[#111111] placeholder:text-gray-400 outline-none focus:border-pensi-yellow focus:ring-4 focus:ring-pensi-yellow/20 transition-all disabled:bg-gray-100"
                />

                <button
                  type="button"
                  onClick={() => setMostrarConfirmacao((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#111111]"
                >
                  {mostrarConfirmacao
                    ? <EyeOff className="w-4 h-4" />
                    : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {!sucesso ? (
              <button
                type="submit"
                disabled={loading || !senha || !confirmarSenha}
                className="w-full flex items-center justify-center gap-2 bg-pensi-yellow text-[#111111] rounded-2xl px-5 py-4 text-[14px] font-bold hover:bg-pensi-yellow-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Atualizando senha...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    Salvar nova senha
                  </>
                )}
              </button>
            ) : (
              <div className="flex items-center justify-center gap-2 bg-green-50 border-[2px] border-green-300 rounded-lg px-4 py-3 text-sm font-bold text-green-800">
                <CheckCircle2 className="w-5 h-5" />
                Acesso liberado!
              </div>
            )}

          </form>

          </section>
        </div>
      </AuthCard>
    </main>
  );
}
