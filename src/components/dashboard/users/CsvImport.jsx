
import { useRef, useState } from "react";
import {
  salvarUsuarioComCPF,
  verificarCPFDisponivel,
} from "../../../services/cpfService";
import { db } from "../../../services/firebase";
import { criarUsuarioSecundario } from "../../../services/criarUsuarioSecundario";
import { AlertCircle, CheckCircle2, FileSpreadsheet } from "lucide-react";

const DOMINIO_PERMITIDO =
  import.meta.env.VITE_DOMINIO_PERMITIDO || "@pensi.com.br";

const CARGOS_VALIDOS = [
  "diretor",
  "coordenador",
  "nucleo",
  "regional",
  "professor",
];

function validarEmail(email) {
  const dominio = DOMINIO_PERMITIDO.replace(/^@/, "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`^[^\\s@]+@${dominio}$`, "i").test(email.trim());
}

function validarCPF(valor) {
  const cpf = String(valor).replace(/\D/g, "");

  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;

  let soma = 0;

  for (let i = 0; i < 9; i++) {
    soma += Number(cpf[i]) * (10 - i);
  }

  let digito = (soma * 10) % 11;
  if (digito === 10) digito = 0;
  if (digito !== Number(cpf[9])) return false;

  soma = 0;

  for (let i = 0; i < 10; i++) {
    soma += Number(cpf[i]) * (11 - i);
  }

  digito = (soma * 10) % 11;
  if (digito === 10) digito = 0;

  return digito === Number(cpf[10]);
}

function separarCSV(texto) {
  const linhas = [];
  let linha = [];
  let campo = "";
  let dentroDeAspas = false;

  for (let i = 0; i < texto.length; i++) {
    const caractere = texto[i];
    const proximo = texto[i + 1];

    if (caractere === '"' && dentroDeAspas && proximo === '"') {
      campo += '"';
      i++;
    } else if (caractere === '"') {
      dentroDeAspas = !dentroDeAspas;
    } else if (caractere === "," && !dentroDeAspas) {
      linha.push(campo.trim());
      campo = "";
    } else if ((caractere === "\n" || caractere === "\r") && !dentroDeAspas) {
      if (caractere === "\r" && proximo === "\n") i++;

      linha.push(campo.trim());

      if (linha.some((valor) => valor !== "")) {
        linhas.push(linha);
      }

      linha = [];
      campo = "";
    } else {
      campo += caractere;
    }
  }

  linha.push(campo.trim());

  if (linha.some((valor) => valor !== "")) {
    linhas.push(linha);
  }

  return linhas;
}

function interpretarArquivo(texto) {
  const linhas = separarCSV(texto.replace(/^\uFEFF/, ""));
  const dados = [];
  const erros = [];
  const emailsEncontrados = new Set();
  const cpfsEncontrados = new Set();

  if (!linhas.length) {
    return {
      dados: [],
      erros: ["O arquivo está vazio."],
    };
  }

  const primeiraLinha = linhas[0].map((coluna) =>
    coluna.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
  );

  const possuiCabecalho =
    primeiraLinha.some((coluna) => coluna.includes("nome")) &&
    primeiraLinha.some((coluna) => coluna.includes("email"));

  const linhasDados = possuiCabecalho ? linhas.slice(1) : linhas;
  const numeroLinhaInicial = possuiCabecalho ? 2 : 1;

  linhasDados.forEach((partes, index) => {
    const numeroLinha = numeroLinhaInicial + index;

    if (partes.length < 6) {
      erros.push(
        `Linha ${numeroLinha}: informe as 6 colunas (Nome, E-mail, Senha, CPF, Cargo e Unidade).`
      );
      return;
    }

    const [
      nome,
      emailOriginal,
      senha,
      cpfOriginal,
      cargoOriginal,
      unidadeOriginal,
    ] = partes;

    const email = emailOriginal.trim().toLowerCase();
    const cpf = cpfOriginal.replace(/\D/g, "");
    const cargo = cargoOriginal.trim().toLowerCase();
    const unidades = unidadeOriginal
      .split(";")
      .map((unidade) => unidade.trim())
      .filter(Boolean);

    let linhaValida = true;

    if (!nome.trim()) {
      erros.push(`Linha ${numeroLinha}: nome não informado.`);
      linhaValida = false;
    }

    if (!validarEmail(email)) {
      erros.push(
        `Linha ${numeroLinha}: e-mail inválido. Use ${DOMINIO_PERMITIDO}.`
      );
      linhaValida = false;
    }

    if (!senha || senha.length < 6) {
      erros.push(`Linha ${numeroLinha}: senha deve ter no mínimo 6 caracteres.`);
      linhaValida = false;
    }

    if (!validarCPF(cpf)) {
      erros.push(`Linha ${numeroLinha}: CPF inválido.`);
      linhaValida = false;
    }

    if (!CARGOS_VALIDOS.includes(cargo)) {
      erros.push(
        `Linha ${numeroLinha}: cargo inválido. Use: ${CARGOS_VALIDOS.join(", ")}.`
      );
      linhaValida = false;
    }

    if (!unidades.length) {
      erros.push(`Linha ${numeroLinha}: informe ao menos uma unidade.`);
      linhaValida = false;
    }

    if (emailsEncontrados.has(email)) {
      erros.push(`Linha ${numeroLinha}: e-mail repetido no arquivo (${email}).`);
      linhaValida = false;
    }

    if (cpfsEncontrados.has(cpf)) {
      erros.push(`Linha ${numeroLinha}: CPF repetido no arquivo.`);
      linhaValida = false;
    }

    if (!linhaValida) return;

    emailsEncontrados.add(email);
    cpfsEncontrados.add(cpf);

    dados.push({
      nome: nome.trim(),
      email,
      senha,
      cpf,
      cargo,
      unidades,
      numeroLinha,
    });
  });

  if (!dados.length && !erros.length) {
    erros.push("Nenhum usuário foi encontrado no arquivo.");
  }

  return { dados, erros };
}

export default function CsvImport({ onClose, onSuccess, setErro }) {
  const fileInputRef = useRef(null);

  const [csvData, setCsvData] = useState([]);
  const [csvErros, setCsvErros] = useState([]);
  const [resultado, setResultado] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleFileUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setCsvData([]);
    setCsvErros([]);
    setResultado([]);
    setErro("");

    const reader = new FileReader();

    reader.onload = (e) => {
      const texto = String(e.target.result || "");
      const { dados, erros } = interpretarArquivo(texto);

      setCsvData(dados);
      setCsvErros(erros);
    };

    reader.onerror = () => {
      setCsvErros(["Não foi possível ler o arquivo selecionado."]);
    };

    reader.readAsText(file, "UTF-8");
    event.target.value = "";
  };

  const confirmarImportacao = async () => {
   
const confirmarImportacao = async () => {
  if (!csvData.length || csvErros.length || loading) return;

  setLoading(true);
  setErro("");
  setResultado([]);

  const resultados = [];

  for (const usuario of csvData) {
    try {
      // Permite aproveitar CPF que já foi cadastrado
      // isoladamente na coleção cpfs.
      await verificarCPFDisponivel(usuario.cpf, {
        permitirPreCadastro: true,
      });

      const uid = await criarUsuarioSecundario(
        usuario.email,
        usuario.senha
      );

      const payload = {
        nome: usuario.nome,
        email: usuario.email,
        cpf: usuario.cpf,
        cargos: [usuario.cargo],
        disciplinas: [],
        unidade: usuario.unidades.join(","),
        series: "",
        turmas: "",
        unidadesComando:
          usuario.cargo === "regional"
            ? usuario.unidades
            : [],
        unidadesInativas: [],
        turmasInativas: [],
        criadoEm: new Date(),
        status: "Ativo",
      };

      // Salva o usuário e o CPF na mesma transação.
      await salvarUsuarioComCPF(
        uid,
        payload,
        "cadastro-lote"
      );

      resultados.push({
        email: usuario.email,
        sucesso: true,
      });

    } catch (err) {
      console.error(
        `Erro ao importar ${usuario.email}:`,
        err
      );

      let mensagem = "Erro ao cadastrar.";

      if (
        err.code === "cpf/ja-vinculado" ||
        err.code === "cpf/ja-cadastrado"
      ) {
        mensagem = "CPF já cadastrado ou vinculado a outro usuário.";
      } else if (err.code === "cpf/invalido") {
        mensagem = "CPF inválido.";
      } else if (err.code === "auth/email-already-in-use") {
        mensagem = "E-mail já cadastrado.";
      } else if (err.code === "auth/weak-password") {
        mensagem = "Senha fraca.";
      } else if (err.code === "permission-denied") {
        mensagem = "Sem permissão para gravar no Firestore.";
      }

      resultados.push({
        email: usuario.email,
        sucesso: false,
        mensagem,
      });
    }
  }

  setResultado(resultados);
  setLoading(false);

  const quantidadeSucesso = resultados.filter(
    (r) => r.sucesso
  ).length;

  const quantidadeErro = resultados.length - quantidadeSucesso;

  if (quantidadeSucesso > 0) {
    onSuccess?.();
  }

  if (quantidadeErro > 0) {
    setErro(
      `${quantidadeSucesso} usuário(s) cadastrado(s) e ${quantidadeErro} com erro. Confira o resultado da importação.`
    );
  }
};

  };

  const limparArquivo = () => {
    setCsvData([]);
    setCsvErros([]);
    setResultado([]);
    setErro("");
  };

  const importacaoConcluida = resultado.length > 0;

  return (
    <div className="animate-fade-in space-y-4">
      {!csvData.length && !csvErros.length && !importacaoConcluida && (
        <>
          <div>
            <h3 className="text-sm font-black uppercase text-black">
              Importação em lote
            </h3>
            <p className="mt-1 text-[10px] font-medium text-gray-500">
              Cadastre vários usuários de uma só vez usando um arquivo CSV.
            </p>
          </div>

          <div className="rounded-xl border-2 border-black bg-white p-4 shadow-[3px_3px_0px_#000]">
            <div className="mb-3 flex items-center gap-2">
              <div className="rounded-lg border-2 border-black bg-pensi-yellow p-2">
                <FileSpreadsheet className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-[11px] font-black uppercase">
                  Formato do arquivo
                </h4>
                <p className="text-[9px] font-medium text-gray-500">
                  CSV separado por vírgulas
                </p>
              </div>
            </div>

            <p className="mb-2 text-[10px] font-bold text-gray-600">
              A ordem das colunas deve ser:
            </p>

            <ol className="space-y-1.5">
              {[
                "Nome completo",
                "E-mail institucional",
                "Senha inicial",
                "CPF",
                "Cargo",
                "Unidade(s)",
              ].map((coluna, index) => (
                <li
                  key={coluna}
                  className="flex items-center gap-2 text-[10px] font-bold text-gray-700"
                >
                  <span className="flex h-5 w-5 items-center justify-center rounded border-2 border-black bg-[#F7F7F5] text-[9px] font-black">
                    {index + 1}
                  </span>
                  {coluna}
                </li>
              ))}
            </ol>

            <div className="mt-3 rounded-lg border-2 border-[#D7E7FF] bg-[#EEF5FF] p-3">
              <p className="text-[9px] font-bold leading-relaxed text-blue-900">
                Para informar mais de uma unidade, separe os nomes com ponto e
                vírgula (;). Exemplo: Icaraí 1; Flamengo.
              </p>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            onChange={handleFileUpload}
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full rounded-lg border-2 border-black bg-pensi-yellow px-5 py-3 text-[10px] font-black uppercase shadow-[3px_3px_0px_#000] transition-all hover:brightness-95 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
          >
            <FileSpreadsheet className="mr-2 inline h-4 w-4" />
            Selecionar arquivo CSV
          </button>
        </>
      )}

      {csvErros.length > 0 && (
        <div className="space-y-3">
          <div className="rounded-xl border-2 border-red-500 bg-red-50 p-4">
            <h4 className="mb-2 flex items-center gap-2 text-[11px] font-black uppercase text-red-800">
              <AlertCircle className="h-4 w-4" />
              Erros encontrados ({csvErros.length})
            </h4>

            <div className="max-h-[230px] space-y-1.5 overflow-y-auto">
              {csvErros.map((erro, index) => (
                <p
                  key={index}
                  className="text-[10px] font-bold leading-relaxed text-red-700"
                >
                  {erro}
                </p>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={limparArquivo}
            className="w-full rounded-lg border-2 border-black bg-white py-2.5 text-[10px] font-black uppercase shadow-[2px_2px_0px_#000] transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
          >
            Selecionar outro arquivo
          </button>
        </div>
      )}

      {csvData.length > 0 && !importacaoConcluida && csvErros.length === 0 && (
        <div className="space-y-3">
          <div className="flex items-start gap-2 rounded-lg border-2 border-green-500 bg-green-50 p-3">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-700" />
            <div>
              <p className="text-[11px] font-black uppercase text-green-800">
                Arquivo validado
              </p>
              <p className="text-[10px] font-medium text-green-700">
                {csvData.length} usuário(s) pronto(s) para importação.
              </p>
            </div>
          </div>

          <div className="max-h-[280px] overflow-auto rounded-lg border-2 border-black bg-white">
            <table className="w-full text-left text-[10px]">
              <thead className="sticky top-0 border-b-2 border-black bg-gray-100 text-[9px] font-black uppercase text-gray-600">
                <tr>
                  <th className="p-2">Nome</th>
                  <th className="p-2">E-mail</th>
                  <th className="p-2">CPF</th>
                  <th className="p-2">Cargo</th>
                  <th className="p-2">Unidade(s)</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {csvData.map((usuario, index) => (
                  <tr key={`${usuario.email}-${index}`} className="bg-white">
                    <td className="p-2 font-bold">{usuario.nome}</td>
                    <td className="p-2">{usuario.email}</td>
                    <td className="p-2">{usuario.cpf}</td>
                    <td className="p-2 font-bold uppercase">
                      {usuario.cargo}
                    </td>
                    <td className="p-2">{usuario.unidades.join(", ")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-[9px] font-medium text-gray-400">
            As séries, turmas e disciplinas poderão ser configuradas depois na
            tela de usuários.
          </p>
        </div>
      )}

      {importacaoConcluida && (
        <div className="space-y-3">
          <div className="rounded-xl border-2 border-black bg-white p-4 shadow-[3px_3px_0px_#000]">
            <h4 className="mb-3 text-xs font-black uppercase">
              Resultado da importação
            </h4>

            <div className="mb-3 grid grid-cols-2 gap-2">
              <div className="rounded-lg border-2 border-green-500 bg-green-50 p-3">
                <p className="text-lg font-black text-green-800">
                  {resultado.filter((r) => r.sucesso).length}
                </p>
                <p className="text-[9px] font-black uppercase text-green-700">
                  Cadastrados
                </p>
              </div>

              <div className="rounded-lg border-2 border-red-400 bg-red-50 p-3">
                <p className="text-lg font-black text-red-800">
                  {resultado.filter((r) => !r.sucesso).length}
                </p>
                <p className="text-[9px] font-black uppercase text-red-700">
                  Com erro
                </p>
              </div>
            </div>

            <div className="max-h-[220px] space-y-2 overflow-y-auto">
              {resultado.map((item, index) => (
                <div
                  key={`${item.email}-${index}`}
                  className={`flex items-start gap-2 rounded-lg border p-2 ${
                    item.sucesso
                      ? "border-green-300 bg-green-50"
                      : "border-red-300 bg-red-50"
                  }`}
                >
                  {item.sucesso ? (
                    <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-green-700" />
                  ) : (
                    <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-700" />
                  )}

                  <div className="min-w-0">
                    <p className="break-all text-[10px] font-bold">
                      {item.email}
                    </p>
                    {!item.sucesso && (
                      <p className="text-[9px] font-semibold text-red-700">
                        {item.mensagem}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
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

        {csvData.length > 0 &&
          csvErros.length === 0 &&
          !importacaoConcluida && (
            <button
              type="button"
              onClick={confirmarImportacao}
              disabled={loading}
              className="flex-1 rounded-lg border-2 border-black bg-pensi-yellow py-3 text-[10px] font-black uppercase shadow-[3px_3px_0px_#000] transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:opacity-50"
            >
              {loading ? "Importando..." : "Confirmar importação"}
            </button>
          )}
      </div>
    </div>
  );
}
