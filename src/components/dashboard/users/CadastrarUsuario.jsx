import { useState } from "react";
import { AlertCircle, UserRound, FileSpreadsheet, CreditCard, UserPlus } from "lucide-react";

import ModalShell from "./ModalShell";
import ManualForm from "./ManualForm";
import CsvImport from "./CsvImport";
import CpfOnlyForm from "./CpfOnlyForm";

const ABAS = [
  { id: "cpf", label: "Somente CPF", icon: CreditCard },
  { id: "manual", label: "Cadastro manual", icon: UserRound },
  { id: "planilha", label: "Importar CSV", icon: FileSpreadsheet },
];

export default function CadastrarUsuario({ onClose, onSuccess, perfilAtivo, unidadesEscopo }) {
  const [abaAtiva, setAbaAtiva] = useState("cpf");
  const [erro, setErro] = useState("");

  const trocarAba = (aba) => {
    setAbaAtiva(aba);
    setErro("");
  };

  return (
    <ModalShell
      title="Cadastrar usuário"
      subtitle="Novo acesso ao sistema Pensi"
      icon={UserPlus}
      maxWidth="max-w-2xl"
      onClose={onClose}
    >
      <div className="mb-5 flex rounded-full bg-gray-100 p-1">
        {ABAS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => trocarAba(id)}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-full px-2 py-2 text-[11px] font-bold transition-colors ${
              abaAtiva === id ? "bg-white text-black shadow-sm" : "text-gray-500 hover:text-gray-800"
            }`}
          >
            <Icon className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{label}</span>
          </button>
        ))}
      </div>

      {erro && (
        <div className="mb-4 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
          <p className="text-xs font-bold text-rose-800">{erro}</p>
        </div>
      )}

      {abaAtiva === "cpf" && <CpfOnlyForm onClose={onClose} onSuccess={onSuccess} setErro={setErro} />}

      {abaAtiva === "manual" && (
        <ManualForm
          onClose={onClose}
          onSuccess={onSuccess}
          perfilAtivo={perfilAtivo}
          unidadesEscopo={unidadesEscopo}
          setErro={setErro}
        />
      )}

      {abaAtiva === "planilha" && <CsvImport onClose={onClose} onSuccess={onSuccess} setErro={setErro} />}
    </ModalShell>
  );
}