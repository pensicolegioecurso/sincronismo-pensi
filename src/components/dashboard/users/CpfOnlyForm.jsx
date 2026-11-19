
import { useState } from "react";

import {
  CreditCard,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";

import {
  cadastrarCPFIsolado,
  validarCPF,
  formatarCPF,
} from "../../../services/cpfService";

const inputClass =
  "w-full rounded-lg border-2 border-black bg-white px-3 py-3 text-sm font-bold text-black outline-none transition-all placeholder:text-gray-400 focus:bg-yellow-50 focus:shadow-[2px_2px_0px_#000]";

export default function CpfOnlyForm({ onClose, onSuccess, setErro }) {
  const [cpf, setCpf] = useState("");
  const [loading, setLoading] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setErro("");
    setSucesso(false);

    const cpfNormalizado = cpf.replace(/\D/g, "");

    if (!validarCPF(cpfNormalizado)) {
      setErro("Informe um CPF válido.");
      return;
    }

    setLoading(true);

    try {
      await cadastrarCPFIsolado(cpfNormalizado);

      setSucesso(true);
      setCpf("");

      onSuccess?.();
    } catch (err) {
      console.error("Erro ao cadastrar CPF:", err);

      if (
        err.code === "cpf/ja-cadastrado" ||
        err.code === "cpf/ja-vinculado"
      ) {
        setErro(err.message);
      } else if (err.code === "permission-denied") {
        setErro("Você não tem permissão para cadastrar este CPF.");
      } else {
        setErro("Não foi possível cadastrar o CPF. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="animate-fade-in space-y-5">
      <div>
        <h3 className="text-sm font-black uppercase text-black">
          Cadastro exclusivo de CPF
        </h3>

        <p className="mt-1 text-[10px] font-medium leading-relaxed text-gray-500">
          Cadastre previamente um CPF sem precisar criar uma conta ou
          informar os dados completos do usuário.
        </p>
      </div>

      <div className="rounded-xl border-2 border-black bg-white p-4 shadow-[3px_3px_0px_#000]">
        <div className="mb-4 flex items-center gap-3">
          <div className="rounded-lg border-2 border-black bg-pensi-yellow p-2">
            <CreditCard className="h-5 w-5" />
          </div>

          <div>
            <h4 className="text-[11px] font-black uppercase">
              Identificação
            </h4>
            <p className="text-[9px] font-medium text-gray-400">
              Apenas o número do CPF
            </p>
          </div>
        </div>

        <label className="mb-2 block text-[9px] font-black uppercase tracking-widest text-gray-600">
          CPF *
        </label>

        <input
          type="text"
          value={cpf}
          onChange={(e) => {
            setCpf(formatarCPF(e.target.value));
            setSucesso(false);
            setErro("");
          }}
          placeholder="000.000.000-00"
          inputMode="numeric"
          maxLength={14}
          className={inputClass}
          autoFocus
        />

        <p className="mt-2 text-[9px] font-medium text-gray-400">
          O CPF será validado automaticamente antes de ser salvo.
        </p>
      </div>

      <div className="rounded-lg border-2 border-blue-200 bg-blue-50 p-3">
        <div className="flex items-start gap-2">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-blue-700" />

          <div>
            <p className="text-[10px] font-black uppercase text-blue-900">
              Cadastro independente
            </p>

            <p className="mt-1 text-[9px] font-medium leading-relaxed text-blue-800">
              Este procedimento salva o CPF na coleção exclusiva de
              CPFs. Nenhum usuário ou acesso ao sistema será criado.
            </p>
          </div>
        </div>
      </div>

      {sucesso && (
        <div className="flex items-center gap-2 rounded-lg border-2 border-green-500 bg-green-50 p-3">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-green-700" />

          <p className="text-[10px] font-bold text-green-800">
            CPF cadastrado com sucesso!
          </p>
        </div>
      )}

      <div className="flex gap-3 border-t-2 border-gray-200 pt-4">
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="flex-1 rounded-lg border-2 border-black bg-white py-3 text-[10px] font-black uppercase shadow-[3px_3px_0px_#000] transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:opacity-50"
        >
          Fechar
        </button>

        <button
          type="submit"
          disabled={loading || !cpf}
          className="flex-1 rounded-lg border-2 border-black bg-pensi-yellow py-3 text-[10px] font-black uppercase shadow-[3px_3px_0px_#000] transition-all hover:brightness-95 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:opacity-50"
        >
          {loading ? "Salvando..." : "Cadastrar CPF"}
        </button>
      </div>
    </form>
  );
}
