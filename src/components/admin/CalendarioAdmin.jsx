import { useState, useEffect, useMemo } from "react";
import { 
  Plus, Calendar as CalendarIcon, X, Trash2, Loader2, BookOpen
} from "lucide-react";
import { 
  collection, addDoc, deleteDoc, doc, serverTimestamp, 
  query, onSnapshot, updateDoc 
} from "firebase/firestore";
import { db } from "../../services/firebase";
import { useTurmas } from "../../hooks/useTurmas";

const SERIES = [
  "Infantil 2", "Infantil 3", "Infantil 4", "Infantil 5",
  "1º ano", "2º ano", "3º ano", "4º ano", "5º ano", "6º ano", "7º ano", "8º ano", "9º ano",
  "1ª série ENEM e Vestibulares", "2ª série ENEM e Vestibulares", "3ª série ENEM e Vestibulares",
  "Pré-ENEM e Vestibulares", "1º ano bilíngue", "2º ano bilíngue", "3º ano bilíngue", 
  "4º ano bilíngue", "5º Ano Bilíngue", "6º ano bilíngue", "7º ano bilíngue", 
  "8º ano bilíngue", "9º ano bilíngue", "Medicina", "IME/ITA", "Preparatório CN"
].sort((a, b) => a.localeCompare(b, "pt-BR"));

// Função para contar os dias letivos de um calendário
function calcularDiasLetivos(cal) {
  if (!cal.inicio || !cal.fim) return 0;

  const inicio = new Date(cal.inicio + "T12:00:00");
  const fim = new Date(cal.fim + "T12:00:00");
  let diasUteis = 0;

  // Conta todos os dias úteis (seg a sex) no intervalo
  let atual = new Date(inicio);
  while (atual <= fim) {
    const dia = atual.getDay();
    if (dia !== 0 && dia !== 6) {
      diasUteis++;
    }
    atual.setDate(atual.getDate() + 1);
  }

  // Conta quantos dias foram tirados por exceções globais
  const excecoesGlobais = (cal.excecoes || []).filter(e => e.tipo === "todas");
  const datasExcluidas = new Set();

  excecoesGlobais.forEach(exc => {
    const excInicio = new Date(exc.dataInicio + "T12:00:00");
    const excFim = new Date((exc.dataFim || exc.dataInicio) + "T12:00:00");
    
    let d = new Date(excInicio);
    while (d <= excFim) {
      // Só tira se for dia útil (evita contar feriado em final de semana 2x)
      const dia = d.getDay();
      if (dia !== 0 && dia !== 6) {
        datasExcluidas.add(d.toISOString().split("T")[0]);
      }
      d.setDate(d.getDate() + 1);
    }
  });

  return diasUteis - datasExcluidas.size;
}

export default function CalendarioAdmin({ perfilAtivo }) {
  const { turmas } = useTurmas({ somenteAtivas: true });
  
  const [calendarios, setCalendarios] = useState([]);
  const [carregando, setCarregando] = useState(true);
  
  const [modalNovo, setModalNovo] = useState(false);
  const [modalExcecao, setModalExcecao] = useState(null);

  const [novoCal, setNovoCal] = useState({ nome: "", inicio: "", fim: "" });
  
  const [excecao, setExcecao] = useState({ 
    dataInicio: "", dataFim: "", motivo: "", 
    tipo: "todas", 
    serie: "", turma: "" 
  });

  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    const q = query(collection(db, "calendarios"));
    const unsub = onSnapshot(q, (snap) => {
      const lista = [];
      snap.forEach(d => lista.push({ id: d.id, ...d.data() }));
      lista.sort((a, b) => new Date(b.inicio).getTime() - new Date(a.inicio).getTime());
      setCalendarios(lista);
      setCarregando(false);
    });
    return unsub;
  }, []);

  const criarCalendario = async (e) => {
    e.preventDefault();
    if (!novoCal.nome || !novoCal.inicio || !novoCal.fim) return setErro("Preencha todos os campos.");
    setSalvando(true);
    try {
      await addDoc(collection(db, "calendarios"), {
        nome: novoCal.nome,
        inicio: novoCal.inicio,
        fim: novoCal.fim,
        excecoes: [],
        criadoEm: serverTimestamp(),
      });
      setModalNovo(false);
      setNovoCal({ nome: "", inicio: "", fim: "" });
      setErro("");
    } catch (err) {
      setErro("Erro ao criar calendário.");
    } finally {
      setSalvando(false);
    }
  };

  const adicionarExcecao = async (e) => {
    e.preventDefault();
    if (!excecao.dataInicio) return setErro("Selecione a data de início.");
    
    const inicio = excecao.dataInicio;
    const fim = excecao.dataFim || excecao.dataInicio; 

    if (fim < inicio) return setErro("A data final não pode ser menor que a inicial.");

    setSalvando(true);
    try {
      const calRef = doc(db, "calendarios", modalExcecao.id);
      
      const novaExcecao = {
        id: Date.now().toString(),
        dataInicio: inicio,
        dataFim: fim,
        motivo: excecao.motivo || "Sem motivo",
        tipo: excecao.tipo,
        serie: excecao.tipo === "serie" ? excecao.serie : null,
        turma: excecao.tipo === "turma" ? excecao.turma : null,
      };

      const novasExcecoes = [...(modalExcecao.excecoes || []), novaExcecao];
      await updateDoc(calRef, { excecoes: novasExcecoes });

      setModalExcecao({ ...modalExcecao, excecoes: novasExcecoes });
      setExcecao({ dataInicio: "", dataFim: "", motivo: "", tipo: "todas", serie: "", turma: "" });
      setErro("");
    } catch (err) {
      console.error(err);
      setErro("Erro ao adicionar exceção.");
    } finally {
      setSalvando(false);
    }
  };

  const removerExcecao = async (excId) => {
    if (!window.confirm("Remover esta exceção?")) return;
    try {
      const calRef = doc(db, "calendarios", modalExcecao.id);
      const novasExcecoes = modalExcecao.excecoes.filter(e => e.id !== excId);
      await updateDoc(calRef, { excecoes: novasExcecoes });
      setModalExcecao({ ...modalExcecao, excecoes: novasExcecoes });
    } catch (err) {
      console.error(err);
    }
  };

  const excluirCalendario = async (id) => {
    if (!window.confirm("Excluir este calendário inteiro? Os dias voltarão ao padrão.")) return;
    await deleteDoc(doc(db, "calendarios", id));
  };

  if (carregando) return <div className="p-10 text-center font-bold">Carregando calendários...</div>;

  return (
    <div className="w-full max-w-5xl mx-auto pb-8 animate-fade-in px-1">
      <section className="mb-5 flex justify-between items-end">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-1.5 h-1.5 bg-pensi-yellow border border-black rounded-full" />
            <span className="text-[9px] font-black uppercase tracking-[0.22em] text-gray-500">Gestão de calendário</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-black">Ano Letivo<span className="text-pensi-yellow">.</span></h1>
          <p className="text-xs text-gray-500 mt-2">Defina os dias letivos globais e crie exceções (feriados, recessos).</p>
        </div>
        <button onClick={() => { setErro(""); setModalNovo(true); }} className="flex items-center gap-1.5 px-3 py-2 bg-pensi-yellow border-2 border-black rounded-md text-[10px] font-black uppercase shadow-[2px_2px_0px_#000]">
          <Plus className="w-3.5 h-3.5" /> Novo Calendário
        </button>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {calendarios.map(cal => {
          // Calcula os dias letivos na renderização
          const diasLetivos = calcularDiasLetivos(cal);

          return (
            <div key={cal.id} className="bg-white border-2 border-black rounded-md shadow-[2px_2px_0px_#000] p-4 flex flex-col">
              <div className="flex justify-between items-start mb-3 border-b-2 border-dashed border-gray-200 pb-3">
                <div>
                  <h3 className="text-sm font-black text-black uppercase">{cal.nome}</h3>
                  <p className="text-[10px] text-gray-500 font-bold mt-1">
                    De {new Date(cal.inicio + "T12:00:00").toLocaleDateString('pt-BR')} até {new Date(cal.fim + "T12:00:00").toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <button onClick={() => excluirCalendario(cal.id)} className="p-1.5 bg-red-100 border-2 border-black rounded-md text-red-700">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* INDICADOR DE DIAS LETIVOS */}
              <div className="bg-green-50 border-2 border-green-300 rounded-md p-2.5 mb-3 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-green-800">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-black uppercase tracking-wider">Dias Letivos</span>
                </div>
                <span className="text-lg font-black text-green-900 tabular-nums">
                  {diasLetivos}
                </span>
              </div>
              
              <div className="flex items-center justify-between mt-auto">
                <span className="text-[10px] font-bold text-gray-500 uppercase">
                  {cal.excecoes?.length || 0} exceções
                </span>
                <button onClick={() => setModalExcecao(cal)} className="flex items-center gap-1 px-2 py-1.5 bg-gray-100 border-2 border-black rounded-md text-[9px] font-black uppercase hover:bg-gray-200">
                  <CalendarIcon className="w-3 h-3" /> Gerenciar Dias
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL NOVO CALENDARIO */}
      {modalNovo && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <form onSubmit={criarCalendario} className="bg-white border-2 border-black rounded-md shadow-[6px_6px_0px_#000] w-full max-w-sm">
            <div className="bg-[#171717] text-white px-4 py-3 border-b-2 border-black flex justify-between">
              <h3 className="font-black text-xs uppercase">Novo Calendário Letivo</h3>
              <button type="button" onClick={() => setModalNovo(false)}><X className="w-4 h-4" /></button>
            </div>
            <div className="p-4 space-y-3">
              {erro && <p className="text-[10px] text-red-600 font-bold">{erro}</p>}
              <div>
                <label className="text-[9px] font-black uppercase text-gray-500 mb-1 block">Nome (Ex: Ano Letivo 2026)</label>
                <input value={novoCal.nome} onChange={e => setNovoCal({...novoCal, nome: e.target.value})} className="w-full border-2 border-black rounded-md px-2 py-1.5 text-xs" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[9px] font-black uppercase text-gray-500 mb-1 block">Início</label>
                  <input type="date" value={novoCal.inicio} onChange={e => setNovoCal({...novoCal, inicio: e.target.value})} className="w-full border-2 border-black rounded-md px-2 py-1.5 text-xs" />
                </div>
                <div>
                  <label className="text-[9px] font-black uppercase text-gray-500 mb-1 block">Fim</label>
                  <input type="date" value={novoCal.fim} onChange={e => setNovoCal({...novoCal, fim: e.target.value})} className="w-full border-2 border-black rounded-md px-2 py-1.5 text-xs" />
                </div>
              </div>
              <button disabled={salvando} className="w-full py-2 bg-pensi-yellow border-2 border-black rounded-md text-[10px] font-black uppercase mt-2">
                {salvando ? "Salvando..." : "Criar Calendário"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL EXCEÇÕES */}
      {modalExcecao && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white border-2 border-black rounded-md shadow-[6px_6px_0px_#000] w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="bg-[#171717] text-white px-4 py-3 border-b-2 border-black flex justify-between items-center shrink-0">
              <h3 className="font-black text-xs uppercase">Exceções: {modalExcecao.nome}</h3>
              <button type="button" onClick={() => setModalExcecao(null)}><X className="w-4 h-4" /></button>
            </div>
            
            <div className="p-4 overflow-y-auto flex-1 flex flex-col md:flex-row gap-4">
              <form onSubmit={adicionarExcecao} className="flex-1 bg-gray-50 p-3 rounded-md border-2 border-gray-200 space-y-3 h-fit">
                <h4 className="text-[10px] font-black uppercase text-black mb-2">Adicionar Exceção</h4>
                {erro && <p className="text-[9px] text-red-600 font-bold">{erro}</p>}
                
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[9px] font-black uppercase text-gray-500 mb-1 block">Início</label>
                    <input type="date" value={excecao.dataInicio} onChange={e => setExcecao({...excecao, dataInicio: e.target.value})} className="w-full border-2 border-black rounded-md px-2 py-1.5 text-xs" />
                  </div>
                  <div>
                    <label className="text-[9px] font-black uppercase text-gray-500 mb-1 block">Fim (Opcional)</label>
                    <input type="date" value={excecao.dataFim} onChange={e => setExcecao({...excecao, dataFim: e.target.value})} className="w-full border-2 border-black rounded-md px-2 py-1.5 text-xs" />
                  </div>
                </div>

                <div>
                  <label className="text-[9px] font-black uppercase text-gray-500 mb-1 block">Motivo (opcional)</label>
                  <input value={excecao.motivo} onChange={e => setExcecao({...excecao, motivo: e.target.value})} placeholder="Ex: Feriado, Recesso..." className="w-full border-2 border-black rounded-md px-2 py-1.5 text-xs" />
                </div>
                
                <div>
                  <label className="text-[9px] font-black uppercase text-gray-500 mb-1 block">Aplicar em</label>
                  <select value={excecao.tipo} onChange={e => setExcecao({...excecao, tipo: e.target.value})} className="w-full border-2 border-black rounded-md px-2 py-1.5 text-xs font-bold mb-2">
                    <option value="todas">Todos (Global)</option>
                    <option value="serie">Uma Série Específica</option>
                    <option value="turma">Uma Turma Específica</option>
                  </select>

                  {excecao.tipo === "serie" && (
                    <select value={excecao.serie} onChange={e => setExcecao({...excecao, serie: e.target.value})} className="w-full border-2 border-black rounded-md px-2 py-1.5 text-xs">
                      <option value="">Selecione a série...</option>
                      {SERIES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  )}

                  {excecao.tipo === "turma" && (
                    <select value={excecao.turma} onChange={e => setExcecao({...excecao, turma: e.target.value})} className="w-full border-2 border-black rounded-md px-2 py-1.5 text-xs">
                      <option value="">Selecione a turma...</option>
                      {turmas.map(t => <option key={t.id} value={t.turma}>{t.turma} ({t.unidade})</option>)}
                    </select>
                  )}
                </div>
                
                <button disabled={salvando} className="w-full py-2 bg-blue-300 border-2 border-black rounded-md text-[10px] font-black uppercase">
                  Adicionar
                </button>
              </form>

              <div className="flex-1 border-2 border-gray-200 rounded-md max-h-[50vh] overflow-y-auto">
                {(modalExcecao.excecoes || []).length === 0 ? (
                  <p className="text-xs text-gray-400 p-4 text-center">Nenhuma exceção cadastrada.</p>
                ) : (
                  modalExcecao.excecoes.map(exc => (
                    <div key={exc.id} className="flex items-center justify-between p-2 border-b border-gray-100 last:border-0">
                      <div>
                        <p className="text-[11px] font-bold text-black">
                          {new Date(exc.dataInicio + 'T12:00:00').toLocaleDateString('pt-BR')}
                          {exc.dataFim && exc.dataFim !== exc.dataInicio && ` até ${new Date(exc.dataFim + 'T12:00:00').toLocaleDateString('pt-BR')}`}
                        </p>
                        <p className="text-[9px] text-gray-500 font-medium">{exc.motivo} • {exc.tipo === "todas" ? "Geral" : exc.tipo === "serie" ? exc.serie : exc.turma}</p>
                      </div>
                      <button type="button" onClick={() => removerExcecao(exc.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
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