import { useEffect, useState } from "react";
import { BookOpen, Trash2 } from "lucide-react";
import Modal from "./Modal";
import Field from "./Field";
import { useMaterias } from "../../../hooks/useMaterias";
import { cadastrarMateria, popularBaseMaterias, removerMateria } from "../../../services/materias";

export default function MateriasModal({ onClose }) {
  const { materias, carregandoMaterias } = useMaterias();
  const [nome, setNome] = useState("");
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    popularBaseMaterias().catch((error) => {
      console.error("Erro ao preparar catálogo de matérias:", error);
      setErro("Não foi possível carregar o catálogo de matérias.");
    });
  }, []);

  async function salvar(event) {
    event.preventDefault();
    setErro("");
    setSalvando(true);
    try {
      await cadastrarMateria(nome);
      setNome("");
    } catch (error) {
      setErro(error.message || "Não foi possível cadastrar a matéria.");
    } finally {
      setSalvando(false);
    }
  }

  async function excluir(materia) {
    if (!window.confirm(`Remover "${materia.nome}" e os sincronismos vinculados?`)) return;
    setErro("");
    setSalvando(true);
    try {
      await removerMateria(materia);
    } catch (error) {
      setErro(error.message || "Não foi possível remover a matéria.");
    } finally {
      setSalvando(false);
    }
  }

  return <Modal titulo="Matérias" tamanho="max-w-2xl" onClose={onClose}>
    <div className="space-y-5 p-5">
      <form onSubmit={salvar} className="rounded-2xl border-2 border-black bg-yellow-50 p-4 shadow-[3px_3px_0_#000]">
        <div className="mb-3 flex items-center gap-2"><span className="flex h-9 w-9 items-center justify-center rounded-lg border-2 border-black bg-pensi-yellow"><BookOpen size={17} /></span><div><h3 className="text-xs font-black uppercase">Cadastrar matéria</h3><p className="text-[10px] text-gray-500">Aparecerá nas listas de cadastro e planejamento.</p></div></div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end"><Field label="Nome da matéria"><input value={nome} onChange={(event) => setNome(event.target.value)} placeholder="Ex.: Química" className="w-full rounded-xl border-2 border-black bg-white px-3 py-2.5 text-sm font-semibold" /></Field><button disabled={salvando || !nome.trim()} className="rounded-xl border-2 border-black bg-pensi-yellow px-5 py-2.5 text-xs font-black uppercase shadow-[3px_3px_0_#000] disabled:opacity-50">{salvando ? "Salvando..." : "Cadastrar"}</button></div>
      </form>
      {erro && <p className="rounded-lg border-2 border-red-300 bg-red-50 p-2 text-xs font-bold text-red-700">{erro}</p>}
      <div>
        <div className="mb-2 flex items-center justify-between"><h3 className="text-xs font-black uppercase">Matérias cadastradas</h3><span className="rounded-full border border-black bg-gray-100 px-2 py-1 text-[10px] font-bold">{materias.length}</span></div>
        <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
          {carregandoMaterias ? <p className="py-5 text-center text-xs text-gray-500">Carregando matérias...</p> : materias.map((materia) => <div key={materia.key} className="flex items-center justify-between gap-3 rounded-xl border-2 border-black bg-white px-3 py-2.5"><div className="min-w-0"><p className="truncate text-sm font-bold">{materia.nome}</p><p className="text-[10px] text-gray-400">{materia.key}</p></div><button type="button" disabled={salvando} onClick={() => excluir(materia)} title={`Remover ${materia.nome}`} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border-2 border-black hover:bg-red-100 disabled:opacity-50"><Trash2 size={15} className="text-red-700" /></button></div>)}
          {!carregandoMaterias && materias.length === 0 && <p className="rounded-xl border border-dashed border-gray-300 py-6 text-center text-xs text-gray-500">Nenhuma matéria cadastrada.</p>}
        </div>
      </div>
    </div>
  </Modal>;
}
