import { useState, useMemo } from "react";
import {
  Plus, Search, X, Trash2, Power, PowerOff, Filter,
  Building2, GraduationCap, ChevronDown, ChevronUp, Loader2,
  CheckCircle2,
} from "lucide-react";
import {
  collection, addDoc, doc, updateDoc, deleteDoc, serverTimestamp
} from "firebase/firestore";
import { db } from "../../services/firebase";
import { useTurmas } from "../../hooks/useTurmas";
import { useAuth } from "../../hooks/useAuth";
import { UNIDADES } from "../../data/unidades";

const TURNOS = ["M", "T"];

// Lista exata (sem repetições) retirada do seu arquivo
const SERIES_DISPONIVEIS = [
  "Infantil 2", "Infantil 3", "Infantil 4", "Infantil 5",
  "1º ano", "2º ano", "3º ano", "4º ano", "5º ano",
  "6º ano", "7º ano", "8º ano", "9º ano",
  "1ª série ENEM e Vestibulares", "2ª série ENEM e Vestibulares", "3ª série ENEM e Vestibulares",
  "Pré-ENEM e Vestibulares",
  "1º ano bilíngue", "2º ano bilíngue", "3º ano bilíngue", "4º ano bilíngue",
  "5º Ano Bilíngue", "6º ano bilíngue", "7º ano bilíngue", "8º ano bilíngue", "9º ano bilíngue",
  "Infantil 2 bilíngue", "Infantil 3 bilíngue", "Infantil 4 bilíngue", "Infantil 5 bilíngue",
  "1ª série medicina", "2ª série medicina", "3ª série Medicina", "Medicina",
  "9º ano preparatório militar", "1ª série preparatória militar", "2ª série preparatória militar",
  "3ª série IME/ITA", "IME/ITA", "Preparatório CN",
  "3ª série AFA/EN/EFOMM", "AFA/EN/EFOMM", "Curso Pré IME/ITA 1", "Curso Pré IME/ITA 2",
].sort((a, b) => a.localeCompare(b, "pt-BR"));

export default function TurmasAdmin({ perfilAtivo }) {
  const { user } = useAuth();
  const { todas, carregando } = useTurmas();
  const [busca, setBusca] = useState("");
  const [filtroUnidade, setFiltroUnidade] = useState("Todas");
  const [filtroStatus, setFiltroStatus] = useState("todos");
  
  const [aberto, setAberto] = useState({});
  
  const [modalNova, setModalNova] = useState(false);
  const [novaTurma, setNovaTurma] = useState({
    unidade: "", serie: "", turno: "M", turma: "",
  });
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  const podeGerenciar = ["admin", "nucleo", "regional"].includes(perfilAtivo);
  const ehRegional = perfilAtivo === "regional";
  const unidadesComando = ehRegional ? (user?.unidadesComando || []) : null;

  const unidades = useMemo(() => {
    const mapa = {};
    todas.forEach((t) => {
      if (!mapa[t.unidade]) mapa[t.unidade] = [];
      mapa[t.unidade].push(t);
    });
    return mapa;
  }, [todas]);

  const unidadesVisiveis = useMemo(() => {
    let lista = Object.keys(unidades).sort((a, b) => a.localeCompare(b, "pt-BR"));
    if (ehRegional) return lista.filter((u) => unidadesComando.includes(u));
    return lista;
  }, [unidades, ehRegional, unidadesComando]);

  const unidadesParaCadastro = useMemo(() => {
    if (ehRegional) return unidadesComando;
    return UNIDADES;
  }, [ehRegional, unidadesComando]);

  const turmasFiltradas = useMemo(() => {
    return todas.filter((t) => {
      if (ehRegional && !unidadesComando.includes(t.unidade)) return false;
      if (filtroUnidade !== "Todas" && t.unidade !== filtroUnidade) return false;
      if (filtroStatus === "Ativo" && !t.ativo) return false;
      if (filtroStatus === "Inativo" && t.ativo) return false;
      if (busca) {
        const q = busca.toLowerCase();
        if (
          !t.turma.toLowerCase().includes(q) &&
          !t.serie.toLowerCase().includes(q) &&
          !t.unidade.toLowerCase().includes(q)
        )
          return false;
      }
      return true;
    });
  }, [todas, busca, filtroUnidade, filtroStatus, ehRegional, unidadesComando]);

  const toggleAtivo = async (t) => {
    try {
      await updateDoc(doc(db, "turmas_escolares", t.id), {
        ativo: !t.ativo,
        atualizadoEm: serverTimestamp(),
      });
    } catch (e) {
      console.error(e);
      alert("Erro ao alterar status.");
    }
  };

  const excluir = async (t) => {
    if (!window.confirm(`Excluir a turma "${t.turma}" de ${t.unidade}?`)) return;
    try {
      await deleteDoc(doc(db, "turmas_escolares", t.id));
    } catch (e) {
      console.error(e);
      alert("Erro ao excluir.");
    }
  };

  const adicionar = async (e) => {
    e.preventDefault();
    setErro(""); setSucesso("");
    if (!novaTurma.unidade || !novaTurma.serie || !novaTurma.turma) {
      setErro("Preencha unidade, série e turma.");
      return;
    }
    const dup = todas.find(
      (t) =>
        t.unidade === novaTurma.unidade &&
        t.turma.toLowerCase() === novaTurma.turma.toLowerCase()
    );
    if (dup) {
      setErro("Já existe uma turma com esse nome nessa unidade.");
      return;
    }
    setSalvando(true);
    try {
      await addDoc(collection(db, "turmas_escolares"), {
        unidade: novaTurma.unidade,
        serie: novaTurma.serie,
        turno: novaTurma.turno,
        turma: novaTurma.turma.trim(),
        ativo: true,
        criadoEm: serverTimestamp(),
        atualizadoEm: serverTimestamp(),
      });
      setSucesso("Turma criada com sucesso!");
      setNovaTurma({ unidade: "", serie: "", turno: "M", turma: "" });
      setTimeout(() => {
        setModalNova(false);
        setSucesso("");
      }, 1200);
    } catch (e) {
      console.error(e);
      setErro("Erro ao criar turma.");
    } finally {
      setSalvando(false);
    }
  };

  const abrirModal = () => {
    setErro(""); setSucesso("");
    setNovaTurma({
      unidade: ehRegional ? (unidadesComando[0] || "") : "",
      serie: "",
      turno: "M",
      turma: "",
    });
    setModalNova(true);
  };

  if (carregando) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400 mb-4" />
        <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Carregando turmas...</p>
      </div>
    );
  }

  return (
    <div className="w-full min-w-0 pb-8 animate-fade-in">
      <div className="max-w-5xl mx-auto px-1">
        <section className="mb-5">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-1.5 h-1.5 bg-pensi-yellow border border-black rounded-full" />
                <span className="text-[9px] font-black uppercase tracking-[0.22em] text-gray-500">
                  Gestão de cadastros
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-black tracking-tight leading-none">
                Turmas e Séries<span className="text-pensi-yellow">.</span>
              </h1>
              <p className="text-xs text-gray-500 mt-2 max-w-xl leading-relaxed">
                Cadastre e gerencie as turmas de cada unidade. Turmas inativas não aparecem no calendário dos professores.
              </p>
            </div>
            {podeGerenciar && (
              <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto">
                <button
                  onClick={abrirModal}
                  className="flex items-center gap-1.5 px-3 py-2 bg-pensi-yellow border-2 border-black rounded-md text-[10px] font-black uppercase shadow-[2px_2px_0px_#000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                >
                  <Plus className="w-3.5 h-3.5" /> Nova turma
                </button>
              </div>
            )}
          </div>
        </section>

        {erro && (
          <div className="mb-3 p-2 bg-red-100 border-2 border-red-400 rounded-md text-[10px] font-bold text-red-700">
            {erro}
          </div>
        )}
        {sucesso && (
          <div className="mb-3 flex items-center gap-1.5 p-2 bg-green-100 border-2 border-green-400 rounded-md">
            <CheckCircle2 className="w-3.5 h-3.5 text-green-700" />
            <span className="text-[10px] font-bold text-green-700">{sucesso}</span>
          </div>
        )}

        <div className="bg-white border-2 border-black rounded-md shadow-[3px_3px_0px_#000] p-3 mb-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar turma, série ou unidade..."
                className="w-full bg-gray-50 border-2 border-black rounded-md pl-9 pr-3 py-2 text-xs font-medium outline-none placeholder:text-gray-400 focus:bg-pensi-yellow/20 transition-colors"
              />
            </div>
            {!ehRegional && (
              <select
                value={filtroUnidade}
                onChange={(e) => setFiltroUnidade(e.target.value)}
                className="bg-gray-50 border-2 border-black rounded-md px-2.5 py-2 text-[11px] font-bold outline-none cursor-pointer"
              >
                <option value="Todas">Todas as unidades</option>
                {unidadesVisiveis.map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            )}
            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
              className="bg-gray-50 border-2 border-black rounded-md px-2.5 py-2 text-[11px] font-bold outline-none cursor-pointer"
            >
              <option value="todos">Todos</option>
              <option value="Ativo">Ativas</option>
              <option value="Inativo">Inativas</option>
            </select>
          </div>
          <div className="flex items-center gap-1.5 mt-3 pt-3 border-t-2 border-dashed border-gray-200">
            <Filter className="w-3 h-3 text-gray-400" />
            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Exibindo</span>
            <span className="bg-pensi-yellow border border-black rounded-md px-1.5 py-0.5 text-[9px] font-black text-black">
              {turmasFiltradas.length}
            </span>
            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">de {todas.length}</span>
          </div>
        </div>

        {unidadesVisiveis.length === 0 && !todas.length ? (
          <div className="bg-white border-2 border-black border-dashed rounded-md p-8 text-center">
            <GraduationCap className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm font-black uppercase">Nenhuma turma cadastrada</p>
            <p className="text-[11px] text-gray-500 mt-1">Clique em "Nova turma" para começar.</p>
          </div>
        ) : (
          unidadesVisiveis.map((uni) => {
            const turmasDaUnidade = turmasFiltradas.filter((t) => t.unidade === uni);
            
            if (turmasDaUnidade.length === 0 && (filtroUnidade !== "Todas" || busca)) return null;
            
            const expandido = aberto[uni] === true; 
            const ativas = turmasDaUnidade.filter((t) => t.ativo).length;

            return (
              <div key={uni} className="mb-3 border-2 border-black rounded-md overflow-hidden bg-white shadow-[2px_2px_0px_#000]">
                <button
                  onClick={() => setAberto((p) => ({ ...p, [uni]: !expandido }))}
                  className="w-full flex items-center gap-2.5 p-2.5 bg-gray-50 hover:bg-pensi-yellow/20 transition-colors text-left"
                >
                  <Building2 className="w-3.5 h-3.5 text-black shrink-0" />
                  <span className="flex-1 text-[11px] font-black uppercase text-black">{uni}</span>
                  <span className="text-[8px] font-bold text-gray-500">
                    {ativas}/{turmasDaUnidade.length} ativas
                  </span>
                  {expandido ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>

                {expandido && (
                  <div className="divide-y divide-gray-200">
                    {turmasDaUnidade.length === 0 ? (
                      <div className="p-3 text-center text-[10px] text-gray-400 font-bold uppercase">
                        Nenhuma turma cadastrada nesta unidade
                      </div>
                    ) : (
                      turmasDaUnidade.map((t) => (
                        <div key={t.id} className={`flex items-center gap-2 px-2.5 py-2 ${t.ativo ? "bg-white" : "bg-gray-50"}`}>
                          <div className={`w-6 h-6 shrink-0 border-2 border-black rounded-md flex items-center justify-center ${t.ativo ? "bg-green-300" : "bg-gray-300"}`}>
                            <GraduationCap className="w-3 h-3 text-black" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className={`text-[11px] font-black ${t.ativo ? "text-black" : "text-gray-400 line-through"}`}>
                                {t.turma}
                              </span>
                              <span className="text-[8px] font-bold uppercase bg-gray-100 border border-black/20 rounded px-1.5 py-0.5">
                                {t.serie}
                              </span>
                              <span className="text-[8px] font-bold uppercase bg-gray-100 border border-black/20 rounded px-1.5 py-0.5">
                                {t.turno === "M" ? "Manhã" : "Tarde"}
                              </span>
                            </div>
                          </div>
                          {podeGerenciar && (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => toggleAtivo(t)}
                                title={t.ativo ? "Desativar" : "Ativar"}
                                className={`p-1.5 border-2 border-black rounded-md ${t.ativo ? "bg-red-100" : "bg-green-300"}`}
                              >
                                {t.ativo ? <PowerOff className="w-3 h-3" /> : <Power className="w-3 h-3" />}
                              </button>
                              <button
                                onClick={() => excluir(t)}
                                title="Excluir"
                                className="p-1.5 border-2 border-black rounded-md bg-red-100"
                              >
                                <Trash2 className="w-3 h-3 text-red-700" />
                              </button>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {modalNova && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <form onSubmit={adicionar} className="bg-white border-2 border-black rounded-md shadow-[6px_6px_0px_#000] w-full max-w-md">
            <div className="bg-[#171717] text-white px-4 py-3 border-b-2 border-black flex justify-between items-center">
              <h3 className="font-black text-xs uppercase tracking-wide">Nova turma</h3>
              <button type="button" onClick={() => setModalNova(false)} className="p-1.5 border border-white/30 rounded-md hover:bg-white/10">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="p-4 space-y-3">
              {erro && (
                <div className="p-2 bg-red-100 border-2 border-red-400 rounded-md text-[10px] font-bold text-red-700">
                  {erro}
                </div>
              )}
              
              <div>
                <label className="block text-[9px] font-black uppercase tracking-widest text-gray-500 mb-1">Unidade</label>
                <select
                  value={novaTurma.unidade}
                  onChange={(e) => setNovaTurma({ ...novaTurma, unidade: e.target.value })}
                  className="w-full border-2 border-black rounded-md px-2 py-1.5 text-[12px] font-bold bg-white cursor-pointer"
                >
                  <option value="" disabled>Selecione uma unidade</option>
                  {unidadesParaCadastro.map((u) => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[9px] font-black uppercase tracking-widest text-gray-500 mb-1">Série</label>
                <select
                  value={novaTurma.serie}
                  onChange={(e) => setNovaTurma({ ...novaTurma, serie: e.target.value })}
                  className="w-full border-2 border-black rounded-md px-2 py-1.5 text-[12px] font-bold bg-white cursor-pointer"
                >
                  <option value="" disabled>Selecione uma série</option>
                  {SERIES_DISPONIVEIS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[9px] font-black uppercase tracking-widest text-gray-500 mb-1">Turno</label>
                <div className="flex gap-2">
                  {TURNOS.map((turno) => (
                    <button
                      key={turno}
                      type="button"
                      onClick={() => setNovaTurma({ ...novaTurma, turno })}
                      className={`flex-1 py-1.5 border-2 border-black rounded-md text-[11px] font-black ${
                        novaTurma.turno === turno ? "bg-pensi-yellow" : "bg-white"
                      }`}
                    >
                      {turno === "M" ? "Manhã" : "Tarde"}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-black uppercase tracking-widest text-gray-500 mb-1">Nome da turma</label>
                <input
                  value={novaTurma.turma}
                  onChange={(e) => setNovaTurma({ ...novaTurma, turma: e.target.value })}
                  placeholder="Ex: 6º anoA - M"
                  className="w-full border-2 border-black rounded-md px-2 py-1.5 text-[12px] font-medium"
                />
              </div>

              <button
                type="submit"
                disabled={salvando}
                className="w-full py-2 bg-pensi-yellow border-2 border-black rounded-md text-[10px] font-black uppercase shadow-[2px_2px_0px_#000] disabled:opacity-60"
              >
                {salvando ? "Salvando..." : "Criar turma"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}