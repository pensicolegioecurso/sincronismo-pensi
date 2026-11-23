import { useState } from "react";
import { CreditCard, CheckCircle2, ShieldCheck } from "lucide-react";
import { cadastrarCPFIsolado, validarCPF, formatarCPF } from "../../../services/cpfService";
import { inputClass, labelClass, btnPrimary, btnSecondary, panelClass } from "./ui";

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

      if (err.code === "cpf/ja-cadastrado" || err.code === "cpf/ja-vinculado") {
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
        <h3 className="text-sm font-black uppercase text-gray-900">Cadastro exclusivo de CPF</h3>
        <p className="mt-1 text-xs leading-relaxed text-gray-500">
          Cadastre previamente um CPF sem precisar criar uma conta ou informar os dados completos do usuário.
        </p>
      </div>

      <div className={panelClass}>
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pensi-yellow">
            <CreditCard className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-xs font-black uppercase text-gray-900">Identificação</h4>
            <p className="text-[11px] font-medium text-gray-400">Apenas o número do CPF</p>
          </div>
        </div>

        <label className={labelClass}>CPF *</label>
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
        <p className="mt-2 text-[11px] font-medium text-gray-400">
          O CPF será validado automaticamente antes de ser salvo.
        </p>
      </div>

      <div className="flex items-start gap-2 rounded-2xl border border-sky-100 bg-sky-50 p-3">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-sky-700" />
        <div>
          <p className="text-[11px] font-black uppercase text-sky-900">Cadastro independente</p>
          <p className="mt-1 text-[11px] leading-relaxed text-sky-800">
            Este procedimento salva o CPF na coleção exclusiva de CPFs. Nenhum usuário ou acesso ao
            sistema será criado.
          </p>
        </div>
      </div>

      {sucesso && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-700" />
          <p className="text-xs font-bold text-emerald-800">CPF cadastrado com sucesso!</p>
        </div>
      )}

      <div className="flex gap-3 border-t border-gray-100 pt-4">
        <button type="button" onClick={onClose} disabled={loading} className={`${btnSecondary} flex-1`}>
          Fechar
        </button>
        <button type="submit" disabled={loading || !cpf} className={`${btnPrimary} flex-1`}>
          {loading ? "Salvando..." : "Cadastrar CPF"}
        </button>
      </div>
    </form>
  );
}