import { useState, useEffect, useMemo, useRef } from "react";
import { 
  Plus, Search, X, Trash2, Power, PowerOff, 
  Building2, GraduationCap, ChevronDown, ChevronUp, 
  CheckCircle2, Calendar as CalendarIcon, BookOpen, Upload, AlertCircle,
  UserCheck, MapPin
} from "lucide-react";
import {
  collection, addDoc, doc, updateDoc, deleteDoc, serverTimestamp, writeBatch, query, onSnapshot, getDocs, where
} from "firebase/firestore";
import { db } from "../../services/firebase";
import { useTurmas } from "../../hooks/useTurmas";
import { useUnidades } from "../../hooks/useUnidades";
import { useAuth } from "../../hooks/useAuth";

const TURNOS = ["M", "T"];

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

function calcularDiasLetivos(cal) {
  if (!cal.inicio || !cal.fim) return 0;
  const inicio = new Date(cal.inicio + "T12:00:00");
  const fim = new Date(cal.fim + "T12:00:00");
  let diasUteis = 0;
  let atual = new Date(inicio);
  while (atual <= fim) {
    const dia = atual.getDay();
    if (dia !== 0 && dia !== 6) diasUteis++;
    atual.setDate(atual.getDate() + 1);
  }
  const excecoesGlobais = (cal.excecoes || []).filter(e => e.tipo === "todas" && !e.unidade);
  const datasExcluidas = new Set();
  excecoesGlobais.forEach(exc => {
    const excInicio = new Date(exc.dataInicio + "T12:00:00");
    const excFim = new Date((exc.dataFim || exc.dataInicio) + "T12:00:00");
    let d = new Date(excInicio);
    while (d <= excFim) {
      const dia = d.getDay();
      if (dia !== 0 && dia !== 6) datasExcluidas.add(d.toISOString().split("T")[0]);
      d.setDate(d.getDate() + 1);
    }
  });
  return diasUteis - datasExcluidas.size;
}

export default function TurmasAdmin({ perfilAtivo, unidadeFoco, unidadesEscopo }) {
  const { user } = useAuth();
  const { todas: turmas, carregando: carregandoTurmas } = useTurmas();
  const { todasUnidades, criarUnidade } = useUnidades();

  const [abaAtiva, setAbaAtiva] = useState("turmas"); 

  const podeGerenciar = ["admin", "nucleo", "regional"].includes(perfilAtivo);
  const ehRegional = perfilAtivo === "regional";
  const ehDirecao = ["diretor", "coordenador", "direcao"].includes(perfilAtivo);
  
  // Apenas Admin e Núcleo podem ver e editar a aba de Regionais
  const podeVerRegionais = ["admin", "nucleo"].includes(perfilAtivo);

  // Define qual lista de unidades o usuário pode ver
  const unidadesPermitidas = useMemo(() => {
    if (ehDirecao) return unidadeFoco ? [unidadeFoco] : [];
    if (ehRegional) return unidadesEscopo || [];
    return todasUnidades; // Admin / Núcleo
  }, [ehDirecao, ehRegional, unidadeFoco, unidadesEscopo, todasUnidades]);

  // Estado para o filtro de unidade no calendário
  const [unidadeCalendario, setUnidadeCalendario] = useState("");
  useEffect(() => {
    if (unidadesPermitidas.length > 0 && !unidadeCalendario) {
      if (!ehDirecao) setUnidadeCalendario("Todas");
      else setUnidadeCalendario(unidadesPermitidas[0]);
    }
  }, [unidadesPermitidas, unidadeCalendario, ehDirecao]);

  // --- ABA TURMAS ---
  const [busca, setBusca] = useState("");
  const [filtroUnidade, setFiltroUnidade] = useState("Todas");
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [aberto, setAberto] = useState({});
  
  const [modalNova, setModalNova] = useState(false);
  const [modalUnidade, setModalUnidade] = useState(false);
  const [modalImportar, setModalImportar] = useState(false);
  const [modalGerenciarUnidades, setModalGerenciarUnidades] = useState(false);

  const [novaTurma, setNovaTurma] = useState({ unidade: "", serie: "", turno: "M", turma: "" });
  const [novaUnidadeNome, setNovaUnidadeNome] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  const fileInputRef = useRef(null);
  const [csvData, setCsvData] = useState([]);
  const [csvErros, setCsvErros] = useState([]);

  // --- ABA CALENDÁRIO ---
  const [calendarios, setCalendarios] = useState([]);
  const [carregandoCal, setCarregandoCal] = useState(true);
  const [modalNovoCal, setModalNovoCal] = useState(false);
  const [modalExcecao, setModalExcecao] = useState(null);
  const [novoCal, setNovoCal] = useState({ nome: "", inicio: "", fim: "" });
  const [excecao, setExcecao] = useState({ dataInicio: "", dataFim: "", motivo: "", tipo: "todas", serie: "", turma: "" });

  // --- ABA REGIONAIS ---
  const [regionais, setRegionais] = useState([]);
  const [carregandoReg, setCarregandoReg] = useState(true);
  const [modalRegional, setModalRegional] = useState(null);
  const [unidadesTemp, setUnidadesTemp] = useState([]);

  useEffect(() => {
    const q = query(collection(db, "calendarios"));
    const unsub = onSnapshot(q, (snap) => {
      const lista = [];
      snap.forEach(d => lista.push({ id: d.id, ...d.data() }));
      lista.sort((a, b) => new Date(b.inicio).getTime() - new Date(a.inicio).getTime());
      setCalendarios(lista);
      setCarregandoCal(false);
    });
    return unsub;
  }, []);

  useEffect(() => {
    async function carregarRegionais() {
      setCarregandoReg(true);
      try {
        const snap = await getDocs(query(collection(db, "users"), where("cargos", "array-contains", "regional")));
        const lista = [];
        snap.forEach(d => {
          const data = d.data();
          lista.push({
            id: d.id,
            nome: data.nome || "Sem nome",
            email: data.email || "",
            unidadesComando: data.unidadesComando || []
          });
        });
        setRegionais(lista);
      } catch (err) {
        console.error("Erro ao buscar regionais:", err);
      } finally {
        setCarregandoReg(false);
      }
    }
    if (abaAtiva === "regionais" && podeVerRegionais) carregarRegionais();
  }, [abaAtiva, podeVerRegionais]);

  const turmasFiltradas = useMemo(() => {
    return turmas.filter((t) => {
      if (filtroUnidade !== "Todas" && t.unidade !== filtroUnidade) return false;
      
      if (ehDirecao && !unidadesPermitidas.includes(t.unidade)) return false;
      if (ehRegional && !unidadesPermitidas.includes(t.unidade)) return false;

      if (filtroStatus === "Ativo" && !t.ativo) return false;
      if (filtroStatus === "Inativo" && t.ativo) return false;
      if (busca) {
        const q = busca.toLowerCase();
        if (!t.turma.toLowerCase().includes(q) && !t.serie.toLowerCase().includes(q) && !t.unidade.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [turmas, busca, filtroUnidade, filtroStatus, ehRegional, ehDirecao, unidadesPermitidas]);

  const adicionarTurma = async (e) => {
    e.preventDefault();
    setErro(""); setSucesso("");
    if (!novaTurma.unidade || !novaTurma.serie || !novaTurma.turma) return setErro("Preencha tudo.");
    const dup = turmas.find(t => t.unidade === novaTurma.unidade && t.turma.toLowerCase() === novaTurma.turma.toLowerCase());
    if (dup) return setErro("Turma já existe.");
    setSalvando(true);
    try {
      await addDoc(collection(db, "turmas_escolares"), {
        unidade: novaTurma.unidade,
        serie: novaTurma.serie,
        turno: novaTurma.turno,
        turma: novaTurma.turma.trim(),
        ativo: true,
        criadoEm: serverTimestamp(),
      });
      setSucesso("Turma criada!");
      setNovaTurma({ unidade: "", serie: "", turno: "M", turma: "" });
      setTimeout(() => { setModalNova(false); setSucesso(""); }, 1000);
    } catch (e) {
      setErro("Erro ao criar.");
    } finally {
      setSalvando(false);
    }
  };

  const toggleAtivo = async (t) => {
    await updateDoc(doc(db, "turmas_escolares", t.id), { ativo: !t.ativo, atualizadoEm: serverTimestamp() });
  };

  const excluirTurma = async (t) => {
    if (!window.confirm(`Excluir turma "${t.turma}"?`)) return;
    await deleteDoc(doc(db, "turmas_escolares", t.id));
  };

  const handleCriarUnidade = async (e) => {
    if (e) e.preventDefault();
    if (!novaUnidadeNome) return;
    setSalvando(true);
    const ok = await criarUnidade(novaUnidadeNome);
    setSalvando(false);
    if (ok) {
      setSucesso("Unidade criada!");
      setNovaUnidadeNome("");
      setTimeout(() => { setSucesso(""); }, 1000);
    } else {
      setErro("Essa unidade já existe ou é inválida.");
    }
  };

  const handleExcluirUnidade = async (nomeUnidade) => {
    const turmasDaUnidade = turmas.filter(t => t.unidade === nomeUnidade);
    let confirmMsg = `Tem certeza que deseja excluir a unidade "${nomeUnidade}"?`;
    if (turmasDaUnidade.length > 0) {
      confirmMsg += `\n\nAtenção: Existem ${turmasDaUnidade.length} turmas cadastradas nessa unidade. Se você continuar, todas essas turmas também serão apagadas.`;
    }
    if (!window.confirm(confirmMsg)) return;

    setSalvando(true);
    try {
      const batch = writeBatch(db);
      turmasDaUnidade.forEach(t => {
        const turmaRef = doc(db, "turmas_escolares", t.id);
        batch.delete(turmaRef);
      });
      // O array `todasUnidades` retorna apenas as strings dos nomes
      const unidadeObj = unidadesPermitidas.find(u => u === nomeUnidade); 
      if (unidadeObj) {
        // Precisamos achar o ID real da unidade no banco para deletar
        const snapUnidades = await getDocs(collection(db, "unidades_db"));
        let idParaDeletar = null;
        snapUnidades.forEach(d => {
          if (d.data().nome === nomeUnidade) idParaDeletar = d.id;
        });
        if (idParaDeletar) {
          batch.delete(doc(db, "unidades_db", idParaDeletar));
        }
      }
      await batch.commit();
      setSucesso("Unidade e turmas removidas com sucesso.");
      setTimeout(() => setSucesso(""), 3000);
    } catch (e) {
      console.error("Erro ao excluir unidade:", e);
      setErro("Erro ao excluir a unidade. Tente novamente.");
    } finally {
      setSalvando(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const linhas = text.split("\n").map(l => l.trim()).filter(Boolean);
      const novosDados = [];
      const erros = [];
      
      linhas.forEach((linha, index) => {
        if (index === 0 && linha.toLowerCase().includes("unidade")) return;
        const partes = linha.split(",").map(p => p.trim());
        if (partes.length < 4) {
          erros.push(`Linha ${index + 1}: Faltam colunas.`);
          return;
        }
        const [unidade, serie, turno, turma] = partes;
        if (!unidade || !serie || !turno || !turma) {
          erros.push(`Linha ${index + 1}: Todos os campos são obrigatórios.`);
          return;
        }
        if (!["M", "T"].includes(turno.toUpperCase())) {
          erros.push(`Linha ${index + 1}: Turno deve ser M ou T.`);
          return;
        }
        novosDados.push({ unidade, serie, turno: turno.toUpperCase(), turma });
      });

      setCsvData(novosDados);
      setCsvErros(erros);
    };
    reader.readAsText(file);
  };

  const confirmarImportacao = async () => {
    if (csvErros.length > 0) return; 
    setSalvando(true);
    try {
      const batch = writeBatch(db);
      const agora = serverTimestamp();
      const unidadesNoBanco = new Set(todasUnidades.map(u => u.toLowerCase()));
      const novasUnidades = new Set();
      
      csvData.forEach(t => {
        if (!unidadesNoBanco.has(t.unidade.toLowerCase())) novasUnidades.add(t.unidade);
      });
      for (const u of novasUnidades) {
        const ref = doc(collection(db, "unidades_db"));
        batch.set(ref, { nome: u, criadoEm: agora });
      }
      csvData.forEach(t => {
        const ref = doc(collection(db, "turmas_escolares"));
        batch.set(ref, {
          unidade: t.unidade, serie: t.serie, turno: t.turno, turma: t.turma,
          ativo: true, criadoEm: agora, atualizadoEm: agora
        });
      });
      await batch.commit();
      setSucesso("Importação concluída!");
      setTimeout(() => { setModalImportar(false); setCsvData([]); setCsvErros([]); setSucesso(""); }, 1500);
    } catch (e) {
      console.error(e);
      setErro("Erro ao importar.");
    } finally {
      setSalvando(false);
    }
  };

  const criarCalendario = async (e) => {
    e.preventDefault();
    if (!novoCal.nome || !novoCal.inicio || !novoCal.fim) return setErro("Preencha todos os campos.");
    setSalvando(true);
    try {
      await addDoc(collection(db, "calendarios"), {
        nome: novoCal.nome, inicio: novoCal.inicio, fim: novoCal.fim,
        excecoes: [], criadoEm: serverTimestamp(),
      });
      setModalNovoCal(false); setNovoCal({ nome: "", inicio: "", fim: "" }); setErro("");
    } catch (err) { setErro("Erro."); } finally { setSalvando(false); }
  };

  const adicionarExcecao = async (e) => {
    e.preventDefault();
    if (!excecao.dataInicio) return setErro("Data obrigatória.");
    const inicio = excecao.dataInicio;
    const fim = excecao.dataFim || excecao.dataInicio; 
    if (fim < inicio) return setErro("Data final inválida.");
    
    if (excecao.tipo === "turma" && !excecao.turma) return setErro("Selecione a turma.");
    if (excecao.tipo === "serie" && !excecao.serie) return setErro("Selecione a série.");

    setSalvando(true);
    try {
      const calRef = doc(db, "calendarios", modalExcecao.id);
      const novaExcecao = {
        id: Date.now().toString(), dataInicio: inicio, dataFim: fim,
        motivo: excecao.motivo || "Sem motivo", tipo: excecao.tipo,
        serie: excecao.tipo === "serie" ? excecao.serie : null,
        turma: excecao.tipo === "turma" ? excecao.turma : null,
        unidade: unidadeCalendario === "Todas" ? null : unidadeCalendario,
      };
      const novasExcecoes = [...(modalExcecao.excecoes || []), novaExcecao];
      await updateDoc(calRef, { excecoes: novasExcecoes });
      setModalExcecao({ ...modalExcecao, excecoes: novasExcecoes });
      setExcecao({ dataInicio: "", dataFim: "", motivo: "", tipo: "todas", serie: "", turma: "" });
    } catch (err) { setErro("Erro."); } finally { setSalvando(false); }
  };

  const removerExcecao = async (excId) => {
    if (!window.confirm("Remover?")) return;
    const calRef = doc(db, "calendarios", modalExcecao.id);
    const novasExcecoes = modalExcecao.excecoes.filter(e => e.id !== excId);
    await updateDoc(calRef, { excecoes: novasExcecoes });
    setModalExcecao({ ...modalExcecao, excecoes: novasExcecoes });
  };

  const abrirModalRegional = (reg) => {
    setModalRegional(reg);
    setUnidadesTemp([...(reg.unidadesComando || [])]);
  };

  const toggleUnidadeTemp = (uni) => {
    setUnidadesTemp(prev => prev.includes(uni) ? prev.filter(u => u !== uni) : [...prev, uni]);
  };

  const salvarUnidadesRegional = async () => {
    setSalvando(true);
    try {
      await updateDoc(doc(db, "users", modalRegional.id), {
        unidadesComando: unidadesTemp
      });
      setRegionais(prev => prev.map(r => r.id === modalRegional.id ? { ...r, unidadesComando: unidadesTemp } : r));
      setModalRegional(null);
    } catch (e) {
      console.error(e);
      setErro("Erro ao salvar unidades.");
    } finally {
      setSalvando(false);
    }
  };

  if (carregandoTurmas || carregandoCal) return <div className="p-10 text-center font-bold">Carregando...</div>;

  const excecoesDaUnidade = modalExcecao
    ? (modalExcecao.excecoes || []).filter(e => e.unidade === (unidadeCalendario === "Todas" ? null : unidadeCalendario))
    : [];

  return (
    <div className="w-full min-w-0 pb-8 animate-fade-in">
      <div className="max-w-5xl mx-auto px-1">
        
        {/* CABEÇALHO DE ABAS */}
        <section className="mb-5 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-1.5 h-1.5 bg-pensi-yellow border border-black rounded-full" />
              <span className="text-[9px] font-black uppercase tracking-[0.22em] text-gray-500">Gestão de cadastros</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-black tracking-tight leading-none">
              Configurações<span className="text-pensi-yellow">.</span>
            </h1>
          </div>
          
          <div className="flex bg-gray-200 p-1.5 rounded-xl border-2 border-black shadow-[2px_2px_0px_#000]">
            <button onClick={() => setAbaAtiva("turmas")} className={`px-5 py-2 rounded-lg text-[11px] font-black uppercase transition-all ${abaAtiva === "turmas" ? "bg-white text-black shadow-sm" : "text-gray-500 hover:text-black"}`}>
              Turmas
            </button>
            <button onClick={() => setAbaAtiva("calendario")} className={`px-5 py-2 rounded-lg text-[11px] font-black uppercase transition-all ${abaAtiva === "calendario" ? "bg-white text-black shadow-sm" : "text-gray-500 hover:text-black"}`}>
              Calendário
            </button>
            {podeVerRegionais && (
              <button onClick={() => setAbaAtiva("regionais")} className={`px-5 py-2 rounded-lg text-[11px] font-black uppercase transition-all ${abaAtiva === "regionais" ? "bg-white text-black shadow-sm" : "text-gray-500 hover:text-black"}`}>
                Regionais
              </button>
            )}
          </div>
        </section>

        {/* ================= ABA TURMAS ================= */}
        {abaAtiva === "turmas" && (
          <div className="animate-fade-in">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              {(podeGerenciar || ehDirecao) && (
                <>
                  <button onClick={() => { setErro(""); setModalNova(true); }} className="flex items-center gap-1.5 px-3 py-2 bg-pensi-yellow border-2 border-black rounded-lg text-[10px] font-black uppercase shadow-[2px_2px_0px_#000] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all">
                    <Plus className="w-3.5 h-3.5" /> Nova turma
                  </button>
                  {podeGerenciar && (
                    <>
                      <button onClick={() => { setErro(""); setModalImportar(true); }} className="flex items-center gap-1.5 px-3 py-2 bg-blue-300 border-2 border-black rounded-lg text-[10px] font-black uppercase shadow-[2px_2px_0px_#000] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all">
                        <Upload className="w-3.5 h-3.5" /> Importar planilha
                      </button>
                      <button onClick={() => { setErro(""); setModalGerenciarUnidades(true); }} className="flex items-center gap-1.5 px-3 py-2 bg-gray-300 border-2 border-black rounded-lg text-[10px] font-black uppercase shadow-[2px_2px_0px_#000] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all">
                        <Building2 className="w-3.5 h-3.5" /> Gerenciar Unidades
                      </button>
                    </>
                  )}
                </>
              )}
            </div>

            <div className="bg-white border-2 border-black rounded-lg shadow-[3px_3px_0px_#000] p-3 mb-4">
               <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar turma, série ou unidade..." className="w-full bg-gray-50 border-2 border-black rounded-lg pl-9 pr-3 py-2 text-xs font-medium outline-none focus:bg-pensi-yellow/20 transition-colors" />
                  </div>
                  {!ehRegional && !ehDirecao && (
                    <select value={filtroUnidade} onChange={(e) => setFiltroUnidade(e.target.value)} className="bg-gray-50 border-2 border-black rounded-lg px-2.5 py-2 text-[11px] font-bold outline-none cursor-pointer">
                      <option value="Todas">Todas as unidades</option>
                      {unidadesPermitidas.map((u) => <option key={u} value={u}>{u}</option>)}
                    </select>
                  )}
                  <select value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)} className="bg-gray-50 border-2 border-black rounded-lg px-2.5 py-2 text-[11px] font-bold outline-none cursor-pointer">
                    <option value="todos">Todos os status</option>
                    <option value="Ativo">Ativas</option>
                    <option value="Inativo">Inativas</option>
                  </select>
               </div>
            </div>

            {unidadesPermitidas.length === 0 && !turmas.length ? (
              <div className="bg-white border-2 border-black border-dashed rounded-xl p-8 text-center">
                <GraduationCap className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm font-black uppercase">Nenhuma turma cadastrada</p>
                <p className="text-[11px] text-gray-500 mt-1">Clique em "Nova turma" ou importe uma planilha.</p>
              </div>
            ) : (
              unidadesPermitidas.map((uni) => {
                const turmasDaUnidade = turmasFiltradas.filter((t) => t.unidade === uni);
                if (turmasDaUnidade.length === 0 && (filtroUnidade !== "Todas" || busca)) return null;
                const expandido = aberto[uni] === true; 
                const ativas = turmasDaUnidade.filter((t) => t.ativo).length;

                return (
                  <div key={uni} className="mb-3 border-2 border-black rounded-lg overflow-hidden bg-white shadow-[2px_2px_0px_#000]">
                    <button onClick={() => setAberto((p) => ({ ...p, [uni]: !expandido }))} className="w-full flex items-center gap-2.5 p-3 bg-gray-50 hover:bg-pensi-yellow/20 transition-colors text-left border-b-2 border-transparent">
                      <Building2 className="w-4 h-4 text-black shrink-0" />
                      <span className="flex-1 text-[12px] font-black uppercase text-black">{uni}</span>
                      <span className="text-[9px] font-bold text-gray-500 bg-white px-2 py-0.5 rounded border border-black/10">
                        {ativas}/{turmasDaUnidade.length} ativas
                      </span>
                      {expandido ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    {expandido && (
                      <div className="divide-y divide-gray-100 p-2">
                        {turmasDaUnidade.map((t) => (
                          <div key={t.id} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg ${t.ativo ? "bg-white hover:bg-gray-50" : "bg-gray-50"}`}>
                            <div className={`w-8 h-8 shrink-0 border-2 border-black rounded-lg flex items-center justify-center ${t.ativo ? "bg-green-300" : "bg-gray-300"}`}>
                              <GraduationCap className="w-4 h-4 text-black" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className={`text-[12px] font-black ${t.ativo ? "text-black" : "text-gray-400 line-through"}`}>{t.turma}</span>
                                <span className="text-[9px] font-bold uppercase bg-gray-100 border border-black/20 rounded px-1.5 py-0.5 text-gray-600">{t.serie}</span>
                                <span className="text-[9px] font-bold uppercase bg-gray-100 border border-black/20 rounded px-1.5 py-0.5 text-gray-600">{t.turno === "M" ? "Manhã" : "Tarde"}</span>
                              </div>
                            </div>
                            {podeGerenciar && (
                              <div className="flex items-center gap-1.5">
                                <button onClick={() => toggleAtivo(t)} title={t.ativo ? "Desativar" : "Ativar"} className={`p-1.5 border-2 border-black rounded-lg shadow-[1px_1px_0px_#000] active:shadow-none active:translate-x-[1px] active:translate-y-[1px] transition-all ${t.ativo ? "bg-red-100 hover:bg-red-200" : "bg-green-300 hover:bg-green-400"}`}>
                                  {t.ativo ? <PowerOff className="w-3 h-3" /> : <Power className="w-3 h-3" />}
                                </button>
                                <button onClick={() => excluirTurma(t)} title="Excluir" className="p-1.5 border-2 border-black rounded-lg shadow-[1px_1px_0px_#000] active:shadow-none active:translate-x-[1px] active:translate-y-[1px] transition-all bg-red-100 hover:bg-red-200">
                                  <Trash2 className="w-3 h-3 text-red-700" />
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* ================= ABA CALENDÁRIO ================= */}
        {abaAtiva === "calendario" && (
          <div className="animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
              <div className="flex items-center gap-2 bg-white border-2 border-black rounded-lg px-3 py-2 shadow-[2px_2px_0px_#000]">
                <MapPin className="w-4 h-4 text-black" />
                <span className="text-[10px] font-black uppercase text-gray-500">Unidade:</span>
                <select 
                  value={unidadeCalendario} 
                  onChange={(e) => setUnidadeCalendario(e.target.value)} 
                  disabled={ehDirecao}
                  className="bg-transparent text-[12px] font-black text-black outline-none cursor-pointer disabled:opacity-70"
                >
                  {!ehDirecao && <option value="Todas">Todas (Global)</option>}
                  {unidadesPermitidas.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>

              {podeGerenciar && (
                <button onClick={() => { setErro(""); setModalNovoCal(true); }} className="flex items-center gap-1.5 px-3 py-2 bg-pensi-yellow border-2 border-black rounded-lg text-[10px] font-black uppercase shadow-[2px_2px_0px_#000] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all">
                  <Plus className="w-3.5 h-3.5" /> Novo Calendário
                </button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {calendarios.map(cal => {
                const diasLetivos = calcularDiasLetivos(cal);
                return (
                  <div key={cal.id} className="bg-white border-2 border-black rounded-lg shadow-[4px_4px_0px_#000] p-4 flex flex-col">
                    <div className="flex justify-between items-start mb-3 border-b-2 border-dashed border-gray-200 pb-3">
                      <div>
                        <h3 className="text-[14px] font-black text-black uppercase tracking-tight">{cal.nome}</h3>
                        <p className="text-[10px] text-gray-500 font-bold mt-1">De {new Date(cal.inicio + "T12:00:00").toLocaleDateString('pt-BR')} até {new Date(cal.fim + "T12:00:00").toLocaleDateString('pt-BR')}</p>
                      </div>
                      {podeGerenciar && (
                        <button onClick={() => { if(window.confirm("Excluir calendário inteiro?")) deleteDoc(doc(db, "calendarios", cal.id)) }} className="p-1.5 bg-red-100 border-2 border-black rounded-lg shadow-[2px_2px_0px_#000] hover:shadow-none hover:translate-y-[2px] hover:translate-x-[2px] transition-all text-red-700"><Trash2 className="w-3.5 h-3.5" /></button>
                      )}
                    </div>
                    <div className="bg-green-100 border-2 border-black rounded-lg p-3 mb-3 flex items-center justify-between shadow-[2px_2px_0px_#000]">
                      <div className="flex items-center gap-2 text-green-900"><BookOpen className="w-4 h-4" /><span className="text-[10px] font-black uppercase tracking-wider">Dias Letivos</span></div>
                      <span className="text-2xl font-black text-green-950 tabular-nums leading-none">{diasLetivos}</span>
                    </div>
                    <div className="flex items-center justify-between mt-auto pt-2">
                      <span className="text-[10px] font-bold text-gray-500 uppercase bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                        {(cal.excecoes || []).filter(e => e.unidade === (unidadeCalendario === "Todas" ? null : unidadeCalendario)).length} exceções em {unidadeCalendario}
                      </span>
                      <button onClick={() => setModalExcecao(cal)} className="flex items-center gap-1.5 px-3 py-1.5 bg-white border-2 border-black rounded-lg text-[9px] font-black uppercase shadow-[2px_2px_0px_#000] hover:bg-gray-50 hover:shadow-none hover:translate-y-[2px] hover:translate-x-[2px] transition-all">
                        <CalendarIcon className="w-3 h-3" /> Gerenciar Dias
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ================= ABA REGIONAIS ================= */}
        {abaAtiva === "regionais" && podeVerRegionais && (
          <div className="animate-fade-in">
            {carregandoReg ? (
              <div className="p-10 text-center font-bold">Carregando regionais...</div>
            ) : regionais.length === 0 ? (
              <div className="bg-white border-2 border-black border-dashed rounded-xl p-8 text-center">
                <UserCheck className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm font-black uppercase">Nenhum regional cadastrado</p>
                <p className="text-[11px] text-gray-500 mt-1">Cadastre um usuário com o cargo "Regional" na aba de Usuários.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {regionais.map(reg => (
                  <div key={reg.id} className="bg-white border-2 border-black rounded-lg shadow-[3px_3px_0px_#000] flex flex-col overflow-hidden">
                    <div className="p-4 flex justify-between items-start bg-gray-50 border-b-2 border-black">
                      <div>
                        <h3 className="text-sm font-black text-black uppercase">{reg.nome}</h3>
                        <p className="text-[10px] text-gray-500 font-bold mt-0.5">{reg.email}</p>
                      </div>
                      <button onClick={() => abrirModalRegional(reg)} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-300 border-2 border-black rounded-lg text-[9px] font-black uppercase shadow-[2px_2px_0px_#000] hover:bg-blue-400 hover:shadow-none hover:translate-y-[2px] hover:translate-x-[2px] transition-all">
                        <MapPin className="w-3 h-3" /> Atribuir Unidades
                      </button>
                    </div>
                    <div className="p-4 flex-1">
                      <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-2">Unidades Comandadas ({reg.unidadesComando.length})</p>
                      <div className="flex flex-wrap gap-1.5">
                        {reg.unidadesComando.length === 0 ? (
                          <span className="text-[10px] text-gray-400 italic">Nenhuma unidade atribuída.</span>
                        ) : (
                          reg.unidadesComando.map(u => (
                            <span key={u} className="text-[10px] font-bold bg-white border border-black/20 rounded-md px-2 py-1 text-black shadow-sm">{u}</span>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ================= MODAIS ================= */}

      {/* Modal Gerenciar Unidades */}
      {modalGerenciarUnidades && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border-2 border-black rounded-xl shadow-[8px_8px_0px_#000] w-full max-w-md flex flex-col max-h-[90vh]">
            <div className="bg-[#171717] text-white px-4 py-3 border-b-2 border-black flex justify-between items-center rounded-t-xl">
              <h3 className="font-black text-xs uppercase tracking-wide">Gerenciar Unidades</h3>
              <button type="button" onClick={() => setModalGerenciarUnidades(false)} className="p-1.5 border border-white/30 rounded-md hover:bg-white/10"><X className="w-3.5 h-3.5" /></button>
            </div>
            
            <div className="p-4 overflow-y-auto flex-1">
              <p className="text-[11px] text-gray-500 mb-3 leading-relaxed">Aqui você pode adicionar novas unidades e excluir as antigas. Ao excluir uma unidade com turmas, as turmas também serão apagadas.</p>
              
              <div className="flex gap-2 mb-4">
                <input 
                  value={novaUnidadeNome} 
                  onChange={(e) => setNovaUnidadeNome(e.target.value)} 
                  placeholder="Nome da nova unidade..." 
                  className="flex-1 border-2 border-black rounded-lg px-2 py-2 text-[12px] font-medium outline-none focus:bg-pensi-yellow/20"
                />
                <button 
                  onClick={(e) => handleCriarUnidade(e)} 
                  disabled={salvando}
                  className="px-4 py-2 bg-green-300 border-2 border-black rounded-lg text-[10px] font-black uppercase shadow-[2px_2px_0px_#000] active:shadow-none active:translate-y-[2px] active:translate-x-[2px] transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-2">
                {todasUnidades.map(u => (
                  <div key={u} className="flex justify-between items-center p-2 border-2 border-gray-200 rounded-lg bg-gray-50 hover:border-black transition-colors">
                    <span className="text-[11px] font-black">{u}</span>
                    <button 
                      onClick={() => handleExcluirUnidade(u)}
                      disabled={salvando}
                      className="p-1.5 bg-red-100 hover:bg-red-200 border-2 border-black rounded-lg text-red-700 transition-all shadow-[1px_1px_0px_#000] active:shadow-none active:translate-x-[1px] active:translate-y-[1px]"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Atribuir Unidades ao Regional */}
      {modalRegional && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border-2 border-black rounded-xl shadow-[8px_8px_0px_#000] w-full max-w-md flex flex-col max-h-[90vh]">
            <div className="bg-[#171717] text-white px-4 py-3 border-b-2 border-black flex justify-between items-center rounded-t-xl">
              <div>
                <h3 className="font-black text-xs uppercase tracking-wide">Unidades do Regional</h3>
                <p className="text-[9px] text-gray-400 mt-0.5">{modalRegional.nome}</p>
              </div>
              <button type="button" onClick={() => setModalRegional(null)} className="p-1.5 border border-white/30 rounded-md hover:bg-white/10"><X className="w-3.5 h-3.5" /></button>
            </div>
            <div className="p-4 overflow-y-auto flex-1">
              <p className="text-[11px] text-gray-500 mb-3 leading-relaxed">Selecione as unidades que este regional tem permissão para gerenciar.</p>
              <div className="space-y-1.5">
                {todasUnidades.map(u => (
                  <label key={u} className={`flex items-center gap-2.5 p-2.5 border-2 rounded-lg cursor-pointer transition-all ${unidadesTemp.includes(u) ? "border-black bg-pensi-yellow/20" : "border-gray-200 hover:border-black"}`}>
                    <input 
                      type="checkbox" 
                      checked={unidadesTemp.includes(u)} 
                      onChange={() => toggleUnidadeTemp(u)} 
                      className="w-3.5 h-3.5 accent-black" 
                    />
                    <span className="flex-1 text-[11px] font-black">{u}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="p-4 border-t-2 border-black bg-gray-50 rounded-b-xl">
              <button onClick={salvarUnidadesRegional} disabled={salvando} className="w-full py-2.5 bg-pensi-yellow border-2 border-black rounded-lg text-[10px] font-black uppercase shadow-[3px_3px_0px_#000] active:shadow-none active:translate-y-[3px] active:translate-x-[3px] transition-all disabled:opacity-60">
                {salvando ? "Salvando..." : "Salvar Unidades"}
              </button>
            </div>
          </div>
        </div>
      )}

      {modalNova && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <form onSubmit={adicionarTurma} className="bg-white border-2 border-black rounded-xl shadow-[8px_8px_0px_#000] w-full max-w-md">
            <div className="bg-[#171717] text-white px-4 py-3 border-b-2 border-black flex justify-between items-center rounded-t-xl">
              <h3 className="font-black text-xs uppercase tracking-wide">Nova turma</h3>
              <button type="button" onClick={() => setModalNova(false)} className="p-1.5 border border-white/30 rounded-md hover:bg-white/10"><X className="w-3.5 h-3.5" /></button>
            </div>
            <div className="p-4 space-y-3">
              {erro && <div className="p-2 bg-red-100 border-2 border-red-400 rounded-md text-[10px] font-bold text-red-700">{erro}</div>}
              <div>
                <label className="block text-[9px] font-black uppercase tracking-widest text-gray-500 mb-1">Unidade</label>
                <select value={novaTurma.unidade} onChange={(e) => setNovaTurma({ ...novaTurma, unidade: e.target.value })} className="w-full border-2 border-black rounded-lg px-2 py-2 text-[12px] font-bold bg-white cursor-pointer outline-none">
                  <option value="" disabled>Selecione uma unidade</option>
                  {unidadesPermitidas.map((u) => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[9px] font-black uppercase tracking-widest text-gray-500 mb-1">Série</label>
                <select value={novaTurma.serie} onChange={(e) => setNovaTurma({ ...novaTurma, serie: e.target.value })} className="w-full border-2 border-black rounded-lg px-2 py-2 text-[12px] font-bold bg-white cursor-pointer outline-none">
                  <option value="" disabled>Selecione uma série</option>
                  {SERIES_DISPONIVEIS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[9px] font-black uppercase tracking-widest text-gray-500 mb-1">Turno</label>
                <div className="flex gap-2">
                  {TURNOS.map((turno) => (
                    <button key={turno} type="button" onClick={() => setNovaTurma({ ...novaTurma, turno })} className={`flex-1 py-2 border-2 border-black rounded-lg text-[11px] font-black shadow-[2px_2px_0px_#000] active:shadow-none active:translate-y-[2px] active:translate-x-[2px] transition-all ${novaTurma.turno === turno ? "bg-pensi-yellow" : "bg-white hover:bg-gray-50"}`}>{turno === "M" ? "Manhã" : "Tarde"}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-[9px] font-black uppercase tracking-widest text-gray-500 mb-1">Nome da turma</label>
                <input value={novaTurma.turma} onChange={(e) => setNovaTurma({ ...novaTurma, turma: e.target.value })} placeholder="Ex: 6º anoA - M" className="w-full border-2 border-black rounded-lg px-2 py-2 text-[12px] font-medium outline-none" />
              </div>
              <button type="submit" disabled={salvando} className="w-full py-2.5 bg-pensi-yellow border-2 border-black rounded-lg text-[10px] font-black uppercase shadow-[3px_3px_0px_#000] active:shadow-none active:translate-y-[3px] active:translate-x-[3px] transition-all disabled:opacity-60">{salvando ? "Salvando..." : "Criar turma"}</button>
            </div>
          </form>
        </div>
      )}

      {modalImportar && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border-2 border-black rounded-xl shadow-[8px_8px_0px_#000] w-full max-w-lg max-h-[90vh] flex flex-col">
            <div className="bg-[#171717] text-white px-4 py-3 border-b-2 border-black flex justify-between items-center rounded-t-xl">
              <h3 className="font-black text-xs uppercase tracking-wide">Importar Planilha (CSV)</h3>
              <button type="button" onClick={() => { setModalImportar(false); setCsvData([]); setCsvErros([]); setErro(""); }} className="p-1.5 border border-white/30 rounded-md hover:bg-white/10"><X className="w-3.5 h-3.5" /></button>
            </div>
            
            <div className="p-4 overflow-y-auto flex-1">
              {erro && <div className="p-2 bg-red-100 border-2 border-red-400 rounded-md text-[10px] font-bold text-red-700 mb-3">{erro}</div>}

              {!csvData.length && csvErros.length === 0 ? (
                <div className="text-center space-y-4 py-4">
                  <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-4 text-left shadow-[2px_2px_0px_#000]">
                    <h4 className="flex items-center gap-1.5 text-[11px] font-black text-yellow-800 uppercase mb-2"><AlertCircle className="w-4 h-4" /> Atenção à Estrutura</h4>
                    <p className="text-[11px] text-yellow-800 leading-relaxed font-medium mb-2">O arquivo deve ser um <strong>CSV</strong> separado por vírgulas. A ordem das colunas deve ser obrigatoriamente:</p>
                    <ul className="text-[10px] text-yellow-800 font-black uppercase tracking-wide list-disc list-inside space-y-1">
                      <li>Unidade</li>
                      <li>Série</li>
                      <li>Turno (M ou T)</li>
                      <li>Nome da Turma</li>
                    </ul>
                  </div>
                  <input type="file" accept=".csv" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
                  <button onClick={() => fileInputRef.current?.click()} className="px-5 py-2.5 bg-blue-300 border-2 border-black rounded-lg text-[10px] font-black uppercase shadow-[3px_3px_0px_#000] hover:shadow-none hover:translate-y-[3px] hover:translate-x-[3px] transition-all">Selecionar Arquivo</button>
                </div>
              ) : (
                <div>
                  {csvErros.length > 0 ? (
                    <div className="bg-red-50 border-2 border-red-400 rounded-lg p-4 shadow-[2px_2px_0px_#000]">
                      <h4 className="text-[11px] font-black text-red-800 uppercase mb-2 flex items-center gap-1.5"><AlertCircle className="w-4 h-4"/> Erros encontrados ({csvErros.length})</h4>
                      <div className="max-h-[200px] overflow-y-auto text-[10px] text-red-600 font-bold space-y-1">
                        {csvErros.map((err, i) => <p key={i}>{err}</p>)}
                      </div>
                      <button onClick={() => { setCsvErros([]); setCsvData([]); }} className="mt-4 w-full py-2 bg-white border-2 border-black rounded-lg text-[9px] font-black uppercase shadow-[2px_2px_0px_#000] active:shadow-none active:translate-y-[2px] active:translate-x-[2px] transition-all">Tentar outro arquivo</button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="bg-green-50 border-2 border-green-400 rounded-lg p-3 flex gap-2 items-start shadow-[2px_2px_0px_#000]">
                        <CheckCircle2 className="w-4 h-4 text-green-700 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-[11px] font-black text-green-800 uppercase">Tudo certo!</p>
                          <p className="text-[10px] text-green-700 font-medium">Encontramos {csvData.length} turmas prontas para importar.</p>
                        </div>
                      </div>
                      <div className="max-h-[250px] overflow-y-auto border-2 border-black rounded-lg">
                        <table className="w-full text-left text-[10px]">
                          <thead className="bg-gray-100 font-black uppercase text-gray-500 border-b-2 border-black">
                            <tr><th className="p-2 border-r-2 border-black">Unidade</th><th className="p-2 border-r-2 border-black">Série</th><th className="p-2 border-r-2 border-black">Turno</th><th className="p-2">Turma</th></tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {csvData.map((d, i) => (
                              <tr key={i} className="font-medium text-gray-700 bg-white hover:bg-gray-50">
                                <td className="p-2 border-r-2 border-gray-100">{d.unidade}</td><td className="p-2 border-r-2 border-gray-100">{d.serie}</td><td className="p-2 border-r-2 border-gray-100">{d.turno}</td><td className="p-2">{d.turma}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {csvData.length > 0 && csvErros.length === 0 && (
              <div className="p-4 border-t-2 border-black bg-gray-50 rounded-b-xl">
                <button onClick={confirmarImportacao} disabled={salvando} className="w-full py-2.5 bg-green-400 border-2 border-black rounded-lg text-[10px] font-black uppercase shadow-[3px_3px_0px_#000] active:shadow-none active:translate-y-[3px] active:translate-x-[3px] transition-all disabled:opacity-60">
                  {salvando ? "Importando..." : "Prosseguir e Importar"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {modalNovoCal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <form onSubmit={criarCalendario} className="bg-white border-2 border-black rounded-xl shadow-[8px_8px_0px_#000] w-full max-w-sm">
            <div className="bg-[#171717] text-white px-4 py-3 border-b-2 border-black flex justify-between items-center rounded-t-xl">
              <h3 className="font-black text-xs uppercase tracking-wide">Novo Calendário</h3>
              <button type="button" onClick={() => setModalNovoCal(false)} className="p-1.5 border border-white/30 rounded-md hover:bg-white/10"><X className="w-3.5 h-3.5" /></button>
            </div>
            <div className="p-4 space-y-3">
              {erro && <div className="p-2 bg-red-100 border-2 border-red-400 rounded-md text-[10px] font-bold text-red-700">{erro}</div>}
              <div>
                <label className="block text-[9px] font-black uppercase tracking-widest text-gray-500 mb-1">Nome (Ex: Ano 2026)</label>
                <input value={novoCal.nome} onChange={(e) => setNovoCal({...novoCal, nome: e.target.value})} className="w-full border-2 border-black rounded-lg px-2 py-2 text-[12px] font-medium outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[9px] font-black uppercase tracking-widest text-gray-500 mb-1">Início</label>
                  <input type="date" value={novoCal.inicio} onChange={(e) => setNovoCal({...novoCal, inicio: e.target.value})} className="w-full border-2 border-black rounded-lg px-2 py-2 text-[12px] font-medium outline-none" />
                </div>
                <div>
                  <label className="block text-[9px] font-black uppercase tracking-widest text-gray-500 mb-1">Fim</label>
                  <input type="date" value={novoCal.fim} onChange={(e) => setNovoCal({...novoCal, fim: e.target.value})} className="w-full border-2 border-black rounded-lg px-2 py-2 text-[12px] font-medium outline-none" />
                </div>
              </div>
              <button type="submit" disabled={salvando} className="w-full py-2.5 bg-pensi-yellow border-2 border-black rounded-lg text-[10px] font-black uppercase shadow-[3px_3px_0px_#000] active:shadow-none active:translate-y-[3px] active:translate-x-[3px] transition-all disabled:opacity-60">{salvando ? "Salvando..." : "Criar"}</button>
            </div>
          </form>
        </div>
      )}

      {modalExcecao && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border-2 border-black rounded-xl shadow-[8px_8px_0px_#000] w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="bg-[#171717] text-white px-4 py-3 border-b-2 border-black flex justify-between items-center shrink-0 rounded-t-xl">
              <div>
                <h3 className="font-black text-xs uppercase tracking-wide">Exceções: {modalExcecao.nome}</h3>
                <p className="text-[9px] text-gray-400 mt-0.5">Gerenciando para a unidade: {unidadeCalendario}</p>
              </div>
              <button type="button" onClick={() => setModalExcecao(null)} className="p-1.5 border border-white/30 rounded-md hover:bg-white/10"><X className="w-3.5 h-3.5" /></button>
            </div>
            <div className="p-4 overflow-y-auto flex-1 flex flex-col md:flex-row gap-4">
              <form onSubmit={adicionarExcecao} className="flex-1 bg-gray-50 p-4 rounded-lg border-2 border-black shadow-[2px_2px_0px_#000] space-y-3 h-fit">
                <h4 className="text-[10px] font-black uppercase text-black mb-2 border-b-2 border-dashed border-gray-300 pb-2">Adicionar Exceção</h4>
                {erro && <p className="text-[9px] text-red-600 font-bold">{erro}</p>}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[9px] font-black uppercase text-gray-500 mb-1 block">Início</label>
                    <input type="date" value={excecao.dataInicio} onChange={(e) => setExcecao({...excecao, dataInicio: e.target.value})} className="w-full border-2 border-black rounded-lg px-2 py-1.5 text-[12px] font-medium" />
                  </div>
                  <div>
                    <label className="text-[9px] font-black uppercase text-gray-500 mb-1 block">Fim (Opcional)</label>
                    <input type="date" value={excecao.dataFim} onChange={(e) => setExcecao({...excecao, dataFim: e.target.value})} className="w-full border-2 border-black rounded-lg px-2 py-1.5 text-[12px] font-medium" />
                  </div>
                </div>
                <div>
                  <label className="text-[9px] font-black uppercase text-gray-500 mb-1 block">Motivo</label>
                  <input value={excecao.motivo} onChange={(e) => setExcecao({...excecao, motivo: e.target.value})} className="w-full border-2 border-black rounded-lg px-2 py-1.5 text-[12px] font-medium" placeholder="Ex: Feriado" />
                </div>
                <div>
                  <label className="text-[9px] font-black uppercase text-gray-500 mb-1 block">Aplicar em</label>
                  <select value={excecao.tipo} onChange={(e) => setExcecao({...excecao, tipo: e.target.value})} className="w-full border-2 border-black rounded-lg px-2 py-1.5 text-[12px] font-bold bg-white cursor-pointer mb-2">
                    <option value="todas">{unidadeCalendario === "Todas" ? "Global (Todas as unidades)" : `Todas as turmas de ${unidadeCalendario}`}</option>
                    {unidadeCalendario !== "Todas" && (
                      <>
                        <option value="serie">Uma Série Específica</option>
                        <option value="turma">Uma Turma Específica</option>
                      </>
                    )}
                  </select>
                  {excecao.tipo === "serie" && (
                    <select value={excecao.serie} onChange={(e) => setExcecao({...excecao, serie: e.target.value})} className="w-full border-2 border-black rounded-lg px-2 py-1.5 text-[12px] font-bold bg-white cursor-pointer">
                      <option value="">Selecione...</option>
                      {SERIES_DISPONIVEIS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  )}
                  {excecao.tipo === "turma" && (
                    <select value={excecao.turma} onChange={(e) => setExcecao({...excecao, turma: e.target.value})} className="w-full border-2 border-black rounded-lg px-2 py-1.5 text-[12px] font-bold bg-white cursor-pointer">
                      <option value="">Selecione...</option>
                      {turmas.filter(t => t.unidade === unidadeCalendario).map(t => <option key={t.id} value={t.turma}>{t.turma}</option>)}
                    </select>
                  )}
                </div>
                <button type="submit" disabled={salvando} className="w-full py-2 bg-blue-300 border-2 border-black rounded-lg text-[10px] font-black uppercase shadow-[2px_2px_0px_#000] active:shadow-none active:translate-y-[2px] active:translate-x-[2px] transition-all">{salvando ? "Salvando..." : "Adicionar"}</button>
              </form>
              
              <div className="flex-1 border-2 border-black rounded-lg max-h-[50vh] overflow-y-auto bg-white shadow-[2px_2px_0px_#000]">
                {excecoesDaUnidade.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full p-6 text-center text-gray-400">
                    <CalendarIcon className="w-8 h-8 mb-2 opacity-20" />
                    <p className="text-xs font-bold">Nenhuma exceção cadastrada para {unidadeCalendario}.</p>
                  </div>
                ) : (
                  excecoesDaUnidade.map(exc => (
                    <div key={exc.id} className="flex items-center justify-between p-3 border-b-2 border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                      <div>
                        <p className="text-[11px] font-black text-black">{new Date(exc.dataInicio + 'T12:00:00').toLocaleDateString('pt-BR')}{exc.dataFim && exc.dataFim !== exc.dataInicio && ` até ${new Date(exc.dataFim + 'T12:00:00').toLocaleDateString('pt-BR')}`}</p>
                        <p className="text-[9px] text-gray-500 font-bold uppercase tracking-wider mt-0.5">{exc.motivo} • <span className="text-blue-600">{exc.tipo === "todas" ? (exc.unidade ? `Toda a unidade` : "Global") : exc.tipo === "serie" ? exc.serie : exc.turma}</span></p>
                      </div>
                      <button type="button" onClick={() => removerExcecao(exc.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded border border-transparent hover:border-red-200 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}