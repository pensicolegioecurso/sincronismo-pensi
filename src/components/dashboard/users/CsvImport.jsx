import { useRef, useState } from "react";
import { salvarUsuarioComCPF, verificarCPFDisponivel } from "../../../services/cpfService";
import { criarUsuarioSecundario } from "../../../services/criarUsuarioSecundario";
import { AlertCircle, CheckCircle2, FileSpreadsheet } from "lucide-react";
import { btnPrimary, btnSecondary, panelClass } from "./ui";

const DOMINIO_PERMITIDO = import.meta.env.VITE_DOMINIO_PERMITIDO || "@pensi.com.br";

const CARGOS_VALIDOS = ["diretor", "coordenador", "nucleo", "regional", "professor"];

function validarEmail(email) {
  const dominio = DOMINIO_PERMITIDO.replace(/^@/, "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`^[^\\s@]+@${dominio}$`, "i").test(email.trim());
}

function validarCPF(valor) {
  const cpf = String(valor).replace(/\D/g, "");
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;

  let soma = 0;
  for (let i = 0; i < 9; i++) soma += Number(cpf[i]) * (10 - i);
  let digito = (soma * 10) % 11;
  if (digito === 10) digito = 0;
  if (digito !== Number(cpf[9])) return false;

  soma = 0;
  for (let i = 0; i < 10; i++) soma += Number(cpf[i]) * (11 - i);
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
      if (linha.some((valor) => valor !== "")) linhas.push(linha);
      linha = [];
      campo = "";
    } else {
      campo += caractere;
    }
  }

  linha.push(campo.trim());
  if (linha.some((valor) => valor !== "")) linhas.push(linha);
  return linhas;
}

function interpretarArquivo(texto) {
  const linhas = separarCSV(texto.replace(/^\uFEFF/, ""));
  const dados = [];
  const erros = [];
  const emailsEncontrados = new Set();
  const cpfsEncontrados = new Set();

  if (!linhas.length) return { dados: [], erros: ["O arquivo está vazio."] };

  const primeiraLinha = linhas[0].map((coluna) =>
    coluna.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
  );

  const possuiCabecalho =
    primeiraLinha.some((c) => c.includes("nome")) && primeiraLinha.some((c) => c.includes("email"));

  const linhasDados = possuiCabecalho ? linhas.slice(1) : linhas;
  const numeroLinhaInicial = possuiCabecalho ? 2 : 1;

  linhasDados.forEach((partes, index) => {
    const numeroLinha = numeroLinhaInicial + index;

    if (partes.length < 6) {
      erros.push(`Linha ${numeroLinha}: informe as 6 colunas (Nome, E-mail, Senha, CPF, Cargo e Unidade).`);
      return;
    }

    const [nome, emailOriginal, senha, cpfOriginal, cargoOriginal, unidadeOriginal] = partes;

    const email = emailOriginal.trim().toLowerCase();
    const cpf = cpfOriginal.replace(/\D/g, "");
    const cargo = cargoOriginal.trim().toLowerCase();
    const unidades = unidadeOriginal.split(";").map((u) => u.trim()).filter(Boolean);

    let linhaValida = true;

    if (!nome.trim()) { erros.push(`Linha ${numeroLinha}: nome não informado.`); linhaValida = false; }
    if (!validarEmail(email)) { erros.push(`Linha ${numeroLinha}: e-mail inválido. Use ${DOMINIO_PERMITIDO}.`); linhaValida = false; }
    if (!senha || senha.length < 6) { erros.push(`Linha ${numeroLinha}: senha deve ter no mínimo 6 caracteres.`); linhaValida = false; }
    if (!validarCPF(cpf)) { erros.push(`Linha ${numeroLinha}: CPF inválido.`); linhaValida = false; }
    if (!CARGOS_VALIDOS.includes(cargo)) { erros.push(`Linha ${numeroLinha}: cargo inválido. Use: ${CARGOS_VALIDOS.join(", ")}.`); linhaValida = false; }
    if (!unidades.length) { erros.push(`Linha ${numeroLinha}: informe ao menos uma unidade.`); linhaValida = false; }
    if (emailsEncontrados.has(email)) { erros.push(`Linha ${numeroLinha}: e-mail repetido no arquivo (${email}).`); linhaValida = false; }
    if (cpfsEncontrados.has(cpf)) { erros.push(`Linha ${numeroLinha}: CPF repetido no arquivo.`); linhaValida = false; }

    if (!linhaValida) return;

    emailsEncontrados.add(email);
    cpfsEncontrados.add(cpf);

    dados.push({ nome: nome.trim(), email, senha, cpf, cargo, unidades, numeroLinha });
  });

  if (!dados.length && !erros.length) erros.push("Nenhum usuário foi encontrado no arquivo.");

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

    reader.onerror = () => setCsvErros(["Não foi possível ler o arquivo selecionado."]);

    reader.readAsText(file, "UTF-8");
    event.target.value = "";
  };

  // (corrigido: antes havia uma função confirmarImportacao declarada dentro de outra)
  const confirmarImportacao = async () => {
    if (!csvData.length || csvErros.length || loading) return;

    setLoading(true);
    setErro("");
    setResultado([]);

    const resultados = [];

    for (const usuario of csvData) {
      try {
        // Permite aproveitar CPF pré-cadastrado isoladamente
        await verificarCPFDisponivel(usuario.cpf, { permitirPreCadastro: true });

        const uid = await criarUsuarioSecundario(usuario.email, usuario.senha);

        const payload = {
          nome: usuario.nome,
          email: usuario.email,
          cpf: usuario.cpf,
          cargos: [usuario.cargo],
          disciplinas: [],
          unidade: usuario.unidades.join(","),
          series: "",
          turmas: "",
          unidadesComando: usuario.cargo === "regional" ? usuario.unidades : [],
          unidadesInativas: [],
          turmasInativas: [],
          criadoEm: new Date(),
          status: "Ativo",
        };

        await salvarUsuarioComCPF(uid, payload, "cadastro-lote");

        resultados.push({ email: usuario.email, sucesso: true });
      } catch (err) {
        console.error(`Erro ao importar ${usuario.email}:`, err);

        let mensagem = "Erro ao cadastrar.";

        if (err.code === "cpf/ja-vinculado" || err.code === "cpf/ja-cadastrado") {
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

        resultados.push({ email: usuario.email, sucesso: false, mensagem });
      }
    }

    setResultado(resultados);
    setLoading(false);

    const quantidadeSucesso = resultados.filter((r) => r.sucesso).length;
    const quantidadeErro = resultados.length - quantidadeSucesso;

    if (quantidadeSucesso > 0) onSuccess?.();

    if (quantidadeErro > 0) {
      setErro(
        `${quantidadeSucesso} usuário(s) cadastrado(s) e ${quantidadeErro} com erro. Confira o resultado da importação.`
      );
    }
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
            <h3 className="text-sm font-black uppercase text-gray-900">Importação em lote</h3>
            <p className="mt-1 text-xs text-gray-500">
              Cadastre vários usuários de uma só vez usando um arquivo CSV.
            </p>
          </div>

          <div className={panelClass}>
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pensi-yellow">
                <FileSpreadsheet className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-xs font-black uppercase text-gray-900">Formato do arquivo</h4>
                <p className="text-[11px] font-medium text-gray-500">CSV separado por vírgulas</p>
              </div>
            </div>

            <p className="mb-2 text-xs font-bold text-gray-600">A ordem das colunas deve ser:</p>

            <ol className="space-y-1.5">
              {["Nome completo", "E-mail institucional", "Senha inicial", "CPF", "Cargo", "Unidade(s)"].map(
                (coluna, index) => (
                  <li key={coluna} className="flex items-center gap-2 text-xs font-bold text-gray-700">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-[10px] font-black shadow-sm">
                      {index + 1}
                    </span>
                    {coluna}
                  </li>
                )
              )}
            </ol>

            <div className="mt-3 rounded-xl border border-sky-100 bg-sky-50 p-3">
              <p className="text-[11px] font-bold leading-relaxed text-sky-900">
                Para informar mais de uma unidade, separe os nomes com ponto e vírgula (;). Exemplo: Icaraí 1; Flamengo.
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

          <button type="button" onClick={() => fileInputRef.current?.click()} className={`${btnPrimary} w-full`}>
            <FileSpreadsheet className="h-4 w-4" />
            Selecionar arquivo CSV
          </button>
        </>
      )}

      {csvErros.length > 0 && (
        <div className="space-y-3">
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
            <h4 className="mb-2 flex items-center gap-2 text-xs font-black uppercase text-rose-800">
              <AlertCircle className="h-4 w-4" />
              Erros encontrados ({csvErros.length})
            </h4>
            <div className="max-h-[230px] space-y-1.5 overflow-y-auto">
              {csvErros.map((erro, index) => (
                <p key={index} className="text-[11px] font-bold leading-relaxed text-rose-700">
                  {erro}
                </p>
              ))}
            </div>
          </div>

          <button type="button" onClick={limparArquivo} className={`${btnSecondary} w-full`}>
            Selecionar outro arquivo
          </button>
        </div>
      )}

      {csvData.length > 0 && !importacaoConcluida && csvErros.length === 0 && (
        <div className="space-y-3">
          <div className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
            <div>
              <p className="text-xs font-black uppercase text-emerald-800">Arquivo validado</p>
              <p className="text-[11px] font-medium text-emerald-700">
                {csvData.length} usuário(s) pronto(s) para importação.
              </p>
            </div>
          </div>

          <div className="max-h-[280px] overflow-auto rounded-2xl border border-gray-100 bg-white">
            <table className="w-full text-left text-[11px]">
              <thead className="sticky top-0 bg-gray-50 text-[10px] font-black uppercase text-gray-500">
                <tr>
                  <th className="p-2.5">Nome</th>
                  <th className="p-2.5">E-mail</th>
                  <th className="p-2.5">CPF</th>
                  <th className="p-2.5">Cargo</th>
                  <th className="p-2.5">Unidade(s)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {csvData.map((usuario, index) => (
                  <tr key={`${usuario.email}-${index}`}>
                    <td className="p-2.5 font-bold">{usuario.nome}</td>
                    <td className="p-2.5">{usuario.email}</td>
                    <td className="p-2.5">{usuario.cpf}</td>
                    <td className="p-2.5 font-bold uppercase">{usuario.cargo}</td>
                    <td className="p-2.5">{usuario.unidades.join(", ")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-[11px] font-medium text-gray-400">
            As séries, turmas e disciplinas poderão ser configuradas depois na tela de usuários.
          </p>
        </div>
      )}

      {importacaoConcluida && (
        <div className={panelClass}>
          <h4 className="mb-3 text-xs font-black uppercase text-gray-900">Resultado da importação</h4>

          <div className="mb-3 grid grid-cols-2 gap-2">
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
              <p className="text-xl font-black text-emerald-800">{resultado.filter((r) => r.sucesso).length}</p>
              <p className="text-[10px] font-black uppercase text-emerald-700">Cadastrados</p>
            </div>
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-3">
              <p className="text-xl font-black text-rose-800">{resultado.filter((r) => !r.sucesso).length}</p>
              <p className="text-[10px] font-black uppercase text-rose-700">Com erro</p>
            </div>
          </div>

          <div className="max-h-[220px] space-y-2 overflow-y-auto">
            {resultado.map((item, index) => (
              <div
                key={`${item.email}-${index}`}
                className={`flex items-start gap-2 rounded-xl border p-2.5 ${
                  item.sucesso ? "border-emerald-200 bg-emerald-50" : "border-rose-200 bg-rose-50"
                }`}
              >
                {item.sucesso ? (
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-700" />
                ) : (
                  <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rose-700" />
                )}
                <div className="min-w-0">
                  <p className="break-all text-[11px] font-bold">{item.email}</p>
                  {!item.sucesso && <p className="text-[10px] font-semibold text-rose-700">{item.mensagem}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-3 border-t border-gray-100 pt-4">
        <button type="button" onClick={onClose} disabled={loading} className={`${btnSecondary} flex-1`}>
          Fechar
        </button>

        {csvData.length > 0 && csvErros.length === 0 && !importacaoConcluida && (
          <button type="button" onClick={confirmarImportacao} disabled={loading} className={`${btnPrimary} flex-1`}>
            {loading ? "Importando..." : "Confirmar importação"}
          </button>
        )}
      </div>
    </div>
  );
}