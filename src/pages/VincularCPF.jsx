
import { useState } from "react";
import {
  CreditCard,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Loader2,
  LogOut,
} from "lucide-react";

import { useAuth } from "../hooks/useAuth";
import { formatarCPF, validarCPF } from "../services/cpfService";

export default function VincularCPF() {
  const { user, vincularCPF, logout } = useAuth();

  const [cpf, setCpf] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro("");

    if (!validarCPF(cpf)) {
      setErro("Informe um CPF válido.");
      return;
    }

    setLoading(true);

    try {
      const resultado = await vincularCPF(cpf);

      if (!resultado.ok) {
        setErro(resultado.message);
        return;
      }

      setSucesso(true);
    } catch (error) {
      setErro(error.message || "Não foi possível vincular seu CPF.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f3f4f6] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-7">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-pensi-yellow border-[2px] border-black rounded-2xl shadow-[4px_4px_0px_#000] mb-5">
            <CreditCard className="w-8 h-8 text-black" />
          </div>

          <h1 className="text-2xl font-black uppercase tracking-tight text-black">
            Vincular CPF
          </h1>

          <p className="text-sm text-gray-500 mt-2">
            Falta só confirmar seu CPF para liberar seu acesso.
          </p>
        </div>

        <div className="bg-white border-[2px] border-black rounded-xl shadow-[6px_6px_0px_#000] p-6 sm:p-8">
          <div className="flex items-start gap-3 p-3 bg-yellow-50 border-[2px] border-yellow-300 rounded-lg mb-6">
            <ShieldCheck className="w-5 h-5 text-yellow-700 shrink-0" />
            <div>
              <p className="text-[11px] font-black uppercase text-yellow-900">
                Validação institucional
              </p>
              <p className="text-[11px] text-yellow-800 mt-1 leading-relaxed">
                Informe o CPF previamente cadastrado pela administração do Pensi.
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

          {sucesso ? (
            <div className="flex items-center gap-2 p-3 bg-green-50 border-[2px] border-green-300 rounded-lg text-sm font-bold text-green-800">
              <CheckCircle2 className="w-5 h-5" />
              CPF vinculado. Acesso liberado!
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-gray-800 mb-1.5">
                  CPF
                </label>

                <input
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
                  className="w-full border-[2px] border-black rounded-lg px-4 py-3 text-sm outline-none focus:bg-pensi-yellow/20"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !cpf}
                className="w-full flex items-center justify-center gap-2 bg-pensi-yellow text-black border-[2px] border-black rounded-lg px-5 py-3 text-sm font-bold shadow-[3px_3px_0px_#000] hover:bg-[#ffdb4d] transition-all disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Validando CPF...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    Confirmar CPF
                  </>
                )}
              </button>
            </form>
          )}

          <div className="mt-6 pt-5 border-t border-gray-100">
            <button
              type="button"
              onClick={logout}
              className="w-full flex items-center justify-center gap-2 text-xs font-semibold text-gray-500 hover:text-black"
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
