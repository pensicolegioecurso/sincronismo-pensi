
import { useState } from "react";
import { X, AlertCircle, UserRound, FileSpreadsheet } from "lucide-react";
import ManualForm from "./ManualForm";
import CsvImport from "./CsvImport";

export default function CadastrarUsuario({
  onClose,
  onSuccess,
  perfilAtivo,
  unidadesEscopo,
}) {
  const [abaAtiva, setAbaAtiva] = useState("manual");
  const [erro, setErro] = useState("");

  const trocarAba = (aba) => {
    setAbaAtiva(aba);
    setErro("");
  };

  return (
    <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in">
      <div className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border-[3px] border-black bg-[#F7F7F5] shadow-[8px_8px_0px_#000]">
        <header className="shrink-0 border-b-[3px] border-black bg-white px-5 py-4">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <div className="mb-2 flex gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full border border-black bg-[#F5B800]" />
                <span className="h-2.5 w-2.5 rounded-full border border-black bg-[#D7E7FF]" />
                <span className="h-2.5 w-2.5 rounded-full border border-black bg-[#F4D5E5]" />
              </div>

              <h2 className="text-base font-black uppercase tracking-tight text-black">
                Cadastrar usuário
              </h2>
              <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-gray-500">
                Novo acesso ao sistema Pensi
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar"
              className="rounded-lg border-2 border-black bg-white p-2 shadow-[2px_2px_0px_#000] transition-all hover:bg-gray-100 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => trocarAba("manual")}
              className={`flex items-center justify-center gap-2 rounded-lg border-2 border-black px-3 py-2.5 text-[10px] font-black uppercase transition-all ${
                abaAtiva === "manual"
                  ? "bg-pensi-yellow shadow-[3px_3px_0px_#000]"
                  : "bg-white text-gray-500 hover:bg-gray-100"
              }`}
            >
              <UserRound className="h-3.5 w-3.5" />
              Cadastro manual
            </button>

            <button
              type="button"
              onClick={() => trocarAba("planilha")}
              className={`flex items-center justify-center gap-2 rounded-lg border-2 border-black px-3 py-2.5 text-[10px] font-black uppercase transition-all ${
                abaAtiva === "planilha"
                  ? "bg-pensi-yellow shadow-[3px_3px_0px_#000]"
                  : "bg-white text-gray-500 hover:bg-gray-100"
              }`}
            >
              <FileSpreadsheet className="h-3.5 w-3.5" />
              Importar CSV
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-5">
          {erro && (
            <div className="mb-4 flex items-start gap-2 rounded-lg border-2 border-red-500 bg-red-50 p-3">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-700" />
              <p className="text-[11px] font-bold text-red-800">{erro}</p>
            </div>
          )}

          {abaAtiva === "manual" && (
            <ManualForm
              onClose={onClose}
              onSuccess={onSuccess}
              perfilAtivo={perfilAtivo}
              unidadesEscopo={unidadesEscopo}
              setErro={setErro}
            />
          )}

          {abaAtiva === "planilha" && (
            <CsvImport
              onClose={onClose}
              onSuccess={onSuccess}
              setErro={setErro}
            />
          )}
        </main>
      </div>
    </div>
  );
}
