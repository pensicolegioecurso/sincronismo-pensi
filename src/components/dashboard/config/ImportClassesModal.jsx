import { AlertCircle, Upload, CheckCircle2 } from "lucide-react";
import Modal from "./Modal";

export default function ImportClassesModal({
  onClose,
  fileInputRef,
  handleFileUpload,
  csvErros,
  csvData,
  confirmarImportacao,
  salvando,
  buttonClass,
}) {
  return (
    <Modal titulo="Importar turmas por CSV" tamanho="max-w-2xl" onClose={onClose}>
      <div className="space-y-4 p-5">
        <div className="rounded-xl border-2 border-yellow-500 bg-yellow-50 p-4">
          <p className="mb-2 flex items-center gap-2 text-xs font-black uppercase text-yellow-900">
            <AlertCircle size={16} />
            Estrutura do arquivo
          </p>
          <p className="text-xs text-yellow-900">
            O CSV deve conter as colunas nesta ordem:
          </p>
          <p className="mt-2 text-xs font-black text-yellow-900">
            Unidade, Série, Turno, Nome da Turma
          </p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileUpload}
          className="hidden"
        />

        <button
          onClick={() => fileInputRef.current?.click()}
          className={`${buttonClass} w-full bg-blue-200`}
        >
          <Upload size={15} />
          Selecionar arquivo CSV
        </button>

        {csvErros.length > 0 && (
          <div className="rounded-xl border-2 border-red-400 bg-red-50 p-3">
            <p className="mb-2 text-xs font-black text-red-700">
              {csvErros.length} erro(s) encontrado(s)
            </p>
            <div className="max-h-36 space-y-1 overflow-y-auto">
              {csvErros.map((item, index) => (
                <p key={index} className="text-xs font-semibold text-red-700">{item}</p>
              ))}
            </div>
          </div>
        )}

        {csvData.length > 0 && csvErros.length === 0 && (
          <>
            <div className="flex items-center gap-2 rounded-xl border-2 border-green-500 bg-green-50 p-3 text-xs font-bold text-green-800">
              <CheckCircle2 size={17} />
              {csvData.length} turma(s) prontas para importação.
            </div>

            <div className="max-h-64 overflow-auto rounded-xl border-2 border-black">
              <table className="w-full text-left text-xs">
                <thead className="sticky top-0 bg-gray-100 font-black uppercase">
                  <tr>
                    <th className="p-2">Unidade</th>
                    <th className="p-2">Série</th>
                    <th className="p-2">Turno</th>
                    <th className="p-2">Turma</th>
                  </tr>
                </thead>
                <tbody>
                  {csvData.map((item, index) => (
                    <tr key={index} className="border-t border-gray-200">
                      <td className="p-2">{item.unidade}</td>
                      <td className="p-2">{item.serie}</td>
                      <td className="p-2">{item.turno}</td>
                      <td className="p-2">{item.turma}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button
              onClick={confirmarImportacao}
              disabled={salvando}
              className={`${buttonClass} w-full bg-pensi-yellow`}
            >
              {salvando ? "Importando..." : "Confirmar importação"}
            </button>
          </>
        )}
      </div>
    </Modal>
  );
}