import { useState } from "react";
import * as XLSX from "xlsx";
import { serverTimestamp } from "firebase/firestore";
import { salvarSincronismo } from "../../../services/sincronismos";
import { useMaterias } from "../../../hooks/useMaterias";
import { useSegmentos } from "../../../hooks/useSegmentos";
import Modal from "./Modal";
import Field from "./Field";

const SERIES = ["1º ano", "2º ano", "3º ano", "4º ano", "5º ano", "6º ano", "7º ano", "8º ano", "9º ano", "1ª Série", "2ª Série", "3ª Série"];
const normalizar = (s) => String(s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/\s+/g, " ").trim();

export default function SyncModal({ onClose, unidades = [] }) {
  const [nome, setNome] = useState("");
  const [ano, setAno] = useState("2027");
  const [materia, setMateria] = useState("");
  const [guias, setGuias] = useState([]);
  const [unidadesSelecionadas, setUnidadesSelecionadas] = useState(null);
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);
  const { materias, carregandoMaterias } = useMaterias();
  const { segmentos } = useSegmentos();
  const opcoesSegmento = segmentos.length ? segmentos.map((item) => item.nome) : SERIES;

  async function lerArquivo(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setErro("");
    try {
      const workbook = XLSX.read(await file.arrayBuffer(), { type: "array", cellDates: false });
      const novasGuias = workbook.SheetNames.map((sheetName) => ({
        nome: sheetName,
        segmentos: opcoesSegmento.filter((serie) => normalizar(serie) === normalizar(sheetName)),
        rows: XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1, defval: "", raw: false }),
      }));
      setNome((atual) => atual || file.name.replace(/\.[^.]+$/, ""));
      setGuias(novasGuias);
    } catch (error) {
      console.error(error);
      setErro("Não foi possível ler a planilha. Envie um arquivo .xlsx ou .xls.");
    }
  }

  async function salvar(event) {
    event.preventDefault();
    setErro("");
    if (!nome.trim() || !materia || !guias.length || guias.some((g) => !g.segmentos?.length) || !Number.isInteger(Number(ano)) || Number(ano) < 2026) {
      setErro("Informe o nome, a matéria e atribua cada guia a um segmento.");
      return;
    }
    setSalvando(true);
    try {
      const materiaInfo = materias.find((item) => item.key === materia);
      await salvarSincronismo({ nome: nome.trim(), ano: String(ano), materia, materiaNome: materiaInfo?.nome || materia, unidades: unidadesSelecionadas || [], todasUnidades: unidadesSelecionadas === null, ativo: true, criadoEm: serverTimestamp() }, guias);
      onClose();
    } catch (error) {
      console.error(error);
      setErro("Não foi possível armazenar a planilha. Tente novamente.");
    } finally {
      setSalvando(false);
    }
  }

  return <Modal titulo="Cadastrar sincronismo" tamanho="max-w-3xl" cabecalhoClaro onClose={onClose}>
    <form onSubmit={salvar} className="space-y-5 p-6">
      <p className="text-xs text-gray-600">Envie a planilha de planejamento, escolha a matéria e associe cada guia ao segmento que verá o conteúdo.</p>
      {erro && <p className="rounded-lg border-2 border-red-300 bg-red-50 p-2 text-xs font-bold text-red-700">{erro}</p>}
      <div className="grid grid-cols-2 gap-3">
        <Field label="Ano"><input type="number" min="2026" step="1" required value={ano} onChange={(e) => setAno(e.target.value)} className="w-full rounded-xl border-2 border-black bg-white px-3 py-2.5 text-sm font-semibold" /></Field>
        <Field label="Matéria"><select required value={materia} onChange={(e) => setMateria(e.target.value)} disabled={carregandoMaterias} className="w-full rounded-xl border-2 border-black bg-white px-3 py-2.5 text-sm font-semibold"><option value="">{carregandoMaterias ? "Carregando..." : "Selecione"}</option>{materias.map((item) => <option key={item.key} value={item.key}>{item.nome}</option>)}</select></Field>
      </div>
      <Field label="Nome do sincronismo"><input required value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex.: Química 2027" className="w-full rounded-xl border-2 border-black bg-white px-3 py-2.5 text-sm font-semibold" /></Field>
      <fieldset className="rounded-2xl border border-gray-200 bg-white p-4">
        <legend className="px-1 text-[10px] font-black uppercase tracking-wider text-gray-600">Unidades que verão este sincronismo</legend>
        <label className={`mb-2 flex cursor-pointer items-center gap-2 rounded-xl border p-3 text-sm font-bold ${unidadesSelecionadas === null ? "border-amber-300 bg-amber-50" : "border-gray-200 bg-white"}`}>
          <input type="checkbox" checked={unidadesSelecionadas === null} onChange={() => setUnidadesSelecionadas((atual) => atual === null ? [] : null)} className="accent-black" /> Todas as unidades
        </label>
        <div className="grid max-h-40 grid-cols-1 gap-2 overflow-y-auto sm:grid-cols-2">
          {unidades.map((unidade) => <label key={unidade} className="flex cursor-pointer items-center gap-2 rounded-xl border border-gray-200 bg-white p-3 text-xs font-semibold">
            <input type="checkbox" checked={unidadesSelecionadas === null || unidadesSelecionadas.includes(unidade)} onChange={() => setUnidadesSelecionadas((atual) => { const base = atual === null ? [...unidades] : atual; return base.includes(unidade) ? base.filter((item) => item !== unidade) : [...base, unidade]; })} className="accent-black" />{unidade}
          </label>)}
        </div>
      </fieldset>
      <Field label="Planilha (.xlsx ou .xls)"><input required type="file" accept=".xlsx,.xls" onChange={lerArquivo} className="w-full rounded-xl border-2 border-black bg-white px-3 py-2.5 text-sm font-semibold" /></Field>
      {!!guias.length && (
        <div className="max-h-96 space-y-3 overflow-y-auto rounded-2xl border-2 border-black bg-gray-50 p-4">
          <p className="text-xs font-black uppercase">Atribua um ou mais segmentos a cada guia</p>
          {guias.map((guia, index) => (
            <div key={`${guia.nome}-${index}`} className="rounded-xl border-2 border-black bg-white p-3">
              <p className="mb-2 truncate text-sm font-bold" title={guia.nome}>{guia.nome}</p>
              <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
                {opcoesSegmento.map((segmento) => {
                  const marcado = guia.segmentos.includes(segmento);
                  return <label key={segmento} className={`flex cursor-pointer items-center gap-2 rounded-lg border px-2.5 py-2 text-xs font-semibold ${marcado ? "border-black bg-yellow-100" : "border-gray-200 bg-white"}`}>
                    <input type="checkbox" checked={marcado} onChange={() => setGuias((atuais) => atuais.map((item, i) => i === index ? { ...item, segmentos: marcado ? item.segmentos.filter((s) => s !== segmento) : [...item.segmentos, segmento] } : item))} className="accent-black" />
                    <span>{segmento}</span>
                  </label>;
                })}
              </div>
            </div>
          ))}
        </div>
      )}      <button type="submit" disabled={salvando} className="w-full rounded-xl border-2 border-black bg-pensi-yellow px-4 py-3 text-xs font-black uppercase shadow-[3px_3px_0_#000] disabled:opacity-50">{salvando ? "Salvando..." : "Salvar sincronismo"}</button>
    </form>
  </Modal>;
}
