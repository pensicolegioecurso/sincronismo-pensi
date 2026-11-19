
import { useState } from "react";

import {
  Lock,
  Eye,
  EyeOff,
  KeyRound,
  ShieldCheck,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";

import { useAuth } from "../hooks/useAuth";

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

    if (senha.length < 6) {
      setErro("A senha precisa ter pelo menos 6 caracteres.");
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
    <main className="min-h-screen bg-[#f3f4f6] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">

        <div className="text-center mb-7">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-pensi-yellow border-[2px] border-black rounded-2xl shadow-[4px_4px_0px_#000] mb-5">
            <KeyRound className="w-8 h-8 text-black" strokeWidth={2.5} />
          </div>

          <h1 className="text-2xl font-black uppercase tracking-tight text-black">
            Primeiro acesso
          </h1>

          <p className="text-sm text-gray-500 mt-2">
            Vamos configurar sua senha pessoal.
          </p>
        </div>

        <div className="bg-white border-[2px] border-black rounded-xl shadow-[6px_6px_0px_#000] p-6 sm:p-8">

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

          {erro && (
            <div className="flex items-start gap-2 p-3 mb-4 bg-red-50 border-[2px] border-red-200 rounded-lg">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <p className="text-xs text-red-700 font-medium">{erro}</p>
            </div>
          )}

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
                  minLength={6}
                  disabled={loading || sucesso}
                  className="w-full border-[2px] border-black rounded-lg pl-9 pr-11 py-3 text-sm outline-none focus:bg-pensi-yellow/20 transition-colors disabled:bg-gray-100"
                />

                <button
                  type="button"
                  onClick={() => setMostrarSenha((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black"
                >
                  {mostrarSenha
                    ? <EyeOff className="w-4 h-4" />
                    : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <p className="text-[10px] text-gray-400 mt-1">
                Mínimo de 6 caracteres.
              </p>
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
                  className="w-full border-[2px] border-black rounded-lg pl-9 pr-11 py-3 text-sm outline-none focus:bg-pensi-yellow/20 transition-colors disabled:bg-gray-100"
                />

                <button
                  type="button"
                  onClick={() => setMostrarConfirmacao((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black"
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
                className="w-full flex items-center justify-center gap-2 bg-pensi-yellow text-black border-[2px] border-black rounded-lg px-5 py-3 text-sm font-bold shadow-[3px_3px_0px_#000] hover:bg-[#ffdb4d] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_#000] active:shadow-none active:translate-x-[3px] active:translate-y-[3px] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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

          <div className="mt-6 pt-5 border-t border-gray-100">
            <button
              type="button"
              onClick={handleLogout}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 text-xs font-semibold text-gray-500 hover:text-black transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sair da conta
            </button>
          </div>

        </div>

        <p className="text-center text-[10px] text-gray-400 mt-5">
          Ambiente institucional Pensi
        </p>

      </div>
    </main>
  );
}
