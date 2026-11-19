
import { useState } from "react";
import { useAuth } from "../hooks/useAuth";

import {
  verificarCPFPreCadastrado,
  salvarUsuarioPublicoComCPF,
  validarCPF,
  formatarCPF,
  normalizarCPF,
} from "../services/cpfService";

import {
  CreditCard,
  ArrowRight,
  ShieldCheck,
  Loader2,
  AlertCircle,
} from "lucide-react";

export default function CadastroCPF({ onNavigate }) {
  const { user, logout } = useAuth();

  const [cpf, setCpf] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro("");

    if (!user?.uid) {
      setErro("Sua sessão não foi identificada. Entre novamente.");
      return;
    }

    const cpfNormalizado = normalizarCPF(cpf);

    if (!validarCPF(cpfNormalizado)) {
      setErro("Informe um CPF válido.");
      return;
    }

    setLoading(true);

    try {
      // A consulta só ocorre depois da autenticação.
      await verificarCPFPreCadastrado(cpfNormalizado);

      // O perfil já existe. Agora vinculamos o CPF.
      await salvarUsuarioPublicoComCPF(user.uid, {
        cpf: cpfNormalizado,
      });

      onNavigate("home");
    } catch (error) {
      console.error("Erro ao vincular CPF:", error);

      const mensagens = {
        "cpf/invalido": "O CPF informado é inválido.",
        "cpf/nao-autorizado":
          "Este CPF não está pré-cadastrado. Solicite à administração a liberação do seu CPF.",
        "cpf/origem-invalida":
          "Este CPF não está liberado para cadastro público.",
        "cpf/ja-vinculado":
          "Este CPF já está vinculado a uma conta.",
      };

      setErro(
        mensagens[error.code] ||
          error.message ||
          "Não foi possível vincular seu CPF. Tente novamente."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#f3f4f6] px-4 py-8">
      <div className="w-full max-w-md rounded-xl border-2 border-black bg-white p-6 shadow-[5px_5px_0px_#000]">
        <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full border-2 border-black bg-pensi-yellow shadow-[3px_3px_0px_#000]">
          <ShieldCheck className="h-6 w-6" />
        </div>

        <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
          Última etapa
        </p>

        <h1 className="text-2xl font-black text-black">
          Confirme seu CPF.
        </h1>

        <p className="mt-3 text-sm leading-relaxed text-gray-500">
          Sua conta foi autenticada com sucesso. Agora informe seu
          CPF para concluir o acesso à plataforma.
        </p>

        <div className="mt-5 rounded-lg border-2 border-blue-200 bg-blue-50 p-3">
          <p className="text-[11px] font-semibold text-blue-900">
            O CPF precisa ter sido previamente cadastrado pela
            administração do Pensi.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label
              htmlFor="cadastro-cpf"
              className="mb-2 block text-[10px] font-black uppercase tracking-widest text-gray-600"
            >
              CPF
            </label>

            <div className="relative">
              <CreditCard className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

              <input
                id="cadastro-cpf"
                type="text"
                value={cpf}
                onChange={(e) => {
                  setCpf(formatarCPF(e.target.value));
                  setErro("");
                }}
                placeholder="000.000.000-00"
                inputMode="numeric"
                autoComplete="off"
                maxLength={14}
                className="w-full rounded-lg border-2 border-black bg-white py-3 pl-10 pr-3 text-sm font-bold outline-none transition-all focus:bg-yellow-50 focus:shadow-[2px_2px_0px_#000]"
              />
            </div>
          </div>

          {erro && (
            <div className="flex items-start gap-2 rounded-lg border-2 border-red-200 bg-red-50 p-3">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
              <p className="text-xs font-semibold text-red-700">
                {erro}
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-black bg-pensi-yellow px-5 py-3 text-sm font-black shadow-[3px_3px_0px_#000] transition-all hover:brightness-95 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Validando CPF...
              </>
            ) : (
              <>
                Confirmar CPF
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <button
          type="button"
          onClick={async () => {
            await logout();
            onNavigate("login");
          }}
          className="mt-5 w-full text-center text-xs font-semibold text-gray-400 hover:text-black"
        >
          Sair da conta
        </button>
      </div>
    </main>
  );
}
