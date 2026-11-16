import { useState, useMemo, useRef } from "react";
import { createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, setDoc, writeBatch } from "firebase/firestore";
import { auth, db } from "../../services/firebase";
import { DISCIPLINAS_POR_ANO } from "../../data/disciplinas";
import { useTurmas } from "../../hooks/useTurmas";
import { useUnidades } from "../../hooks/useUnidades";
import {
  Mail, Lock, User, ArrowRight, BookOpen, MapPin,
  Users, ShieldCheck, X, CheckCircle2, GraduationCap, Network,
  Upload, AlertCircle, FileText, Plus
} from "lucide-react";

const CARGOS_ATRIBUIVEIS = [
  { id: "diretor", label: "Diretor", color: "bg-purple-100" },
  { id: "coordenador", label: "Coordenador", color: "bg-indigo-100" },
  { id: "nucleo", label: "Núcleo", color: "bg-blue-100" },
  { id: "regional", label: "Regional", color: "bg-orange-100" },
  { id: "professor", label: "Professor", color: "bg-green-100" },
];

const DOMINIO_PERMITIDO = import.meta.env.VITE_DOMINIO_PERMITIDO || "@pensi.com.br";

export default function CadastrarUsuario({ onClose, onSuccess, perfilAtivo, currentUser, unidadesEscopo }) {
  const { todasUnidades } = useUnidades();
  const { getSeriesPorUnidades, getTurmasPorUnidadesESeries } = useTurmas({ somenteAtivas: true });

  const [abaAtiva, setAbaAtiva] = useState("manual"); // "manual" | "planilha"

  // --- ESTADOS DO CADASTRO MANUAL ---
  const [step, setStep] = useState(1); // 1 dados, 2 cargo, 3 disciplinas/unidades, 4 turmas
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [cargos, setCargos] = useState(["professor"]);
  const [disciplinas, setDisciplinas] = useState([]);
  const [unidades, setUnidades] = useState([]);
  const [unidadesComando, setUnidadesComando] = useState([]);
  const [selecoesPorPar, setSelecoesPorPar] = useState({});
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

  // --- ESTADOS DA PLANILHA ---
  const fileInputRef = useRef(null);
  const [csvData, setCsvData] = useState([]);
  const [csvErros, setCsvErros] = useState([]);

  // Variáveis auxiliares
  const ehRegionalLogado = perfilAtivo === "regional";
  const unidadesDisponiveis = ehRegionalLogado
    ? todasUnidades.filter((u) => (unidadesEscopo || []).includes(u))
    : todasUnidades;

  const disciplinasLista = useMemo(() => {
    const todas = Object.values(DISCIPLINAS_POR_ANO).reduce((acc, ano) => {
      Object.entries(ano).forEach(([key, value]) => { acc[key] = value.nome; });
      return acc;
    }, {});
    return Object.entries(todas).sort((a, b) => a[1].localeCompare(b[1], "pt-BR"));
  }, []);

  const precisaDisciplinasEUnidades = cargos.includes("professor");
  const precisaUnidadesComando = cargos.includes("regional");

  const pares = useMemo(() => {
    if (!precisaDisciplinasEUnidades) return [];
    const lista = [];
    disciplinas.forEach((d) => {
      unidades.forEach((u) => {
        lista.push({ disciplina: d, unidade: u });
      });
    });
    return lista;
  }, [disciplinas, unidades, precisaDisciplinasEUnidades]);

  const toggleItem = (setList, item) => {
    setList((prev) => prev.includes(item) ? prev.filter((v) => v !== item) : [...prev, item]);
  };

  const setSelecao = (chave, valor) => {
    setSelecoesPorPar((prev) => ({ ...prev, [chave]: valor }));
  };

  // --- LÓGICA DE CADASTRO MANUAL ---
  const avancar = () => {
    setErro("");
    if (step === 1) {
      if (!nome.trim() || !email.trim() || !senha) return setErro("Preencha todos os campos.");
      if (!email.toLowerCase().endsWith(DOMINIO_PERMITIDO.toLowerCase())) return setErro(`Use um e-mail ${DOMINIO_PERMITIDO}.`);
      if (senha.length < 6) return setErro("Senha mínima de 6 caracteres.");
      setStep(2);
      return;
    }
    if (step === 2) {
      if (cargos.length === 0) return setErro("Selecione ao menos um cargo.");
      if (precisaDisciplinasEUnidades) { setStep(3); return; }
      if (precisaUnidadesComando) { setStep(3); return; }
      handleSubmitManual();
      return;
    }
    if (step === 3) {
      if (precisaDisciplinasEUnidades && disciplinas.length === 0) return setErro("Selecione ao menos uma disciplina.");
      if (precisaUnidadesComando && unidadesComando.length === 0) return setErro("Selecione ao menos uma unidade para comandar.");
      if (precisaDisciplinasEUnidades) { setStep(4); return; }
      handleSubmitManual();
      return;
    }
    if (step === 4) {
      if (unidades.length === 0) return setErro("Selecione ao menos uma unidade.");
      setStep(5);
      return;
    }
    if (step === 5) {
      for (const par of pares) {
        const chave = `${par.disciplina}|${par.unidade}`;
        const sel = selecoesPorPar[chave];
        if (!sel || !sel.series?.length || !sel.turmas?.length) {
          return setErro(`Preencha séries e turmas de ${par.disciplina} em ${par.unidade}.`);
        }
      }
      handleSubmitManual();
    }
  };

  const handleSubmitManual = async () => {
    setLoading(true);
    setErro("");
    try {
      const userCred = await createUserWithEmailAndPassword(auth, email.trim().toLowerCase(), senha);
      const novoUid = userCred.user.uid;

      const turmasPorUnidade = {};
      const todasSeries = new Set();
      
      Object.entries(selecoesPorPar).forEach(([chave, sel]) => {
        const unidade = chave.split("|")[1];
        if (!turmasPorUnidade[unidade]) turmasPorUnidade[unidade] = [];
        (sel.turmas || []).forEach((t) => {
          if (!turmasPorUnidade[unidade].includes(t)) turmasPorUnidade[unidade].push(t);
        });
        (sel.series || []).forEach((s) => todasSeries.add(s));
      });

      const turmasString = Object.entries(turmasPorUnidade)
        .filter(([_, t]) => t.length > 0)
        .map(([unidade, turmas]) => `${unidade}: ${turmas.join(", ")}`)
        .join(" | ");

      const payload = {
        nome: nome.trim(),
        email: email.trim().toLowerCase(),
        cargos,
        disciplinas: precisaDisciplinasEUnidades ? disciplinas : [],
        unidade: precisaDisciplinasEUnidades ? unidades.join(",") : (precisaUnidadesComando ? unidadesComando.join(",") : ""),
        series: precisaDisciplinasEUnidades ? [...todasSeries].join(",") : "",
        turmas: precisaDisciplinasEUnidades ? turmasString : "",
        unidadesComando: precisaUnidadesComando ? unidadesComando : [],
        unidadesInativas: [],
        turmasInativas: [],
        criadoEm: new Date(),
        status: "Ativo",
      };

      await setDoc(doc(db, "users", novoUid), payload);
      await signOut(auth); // Desloga o novo user pra não perder a sessão do admin
      onSuccess?.();
    } catch (err) {
      console.error(err);
      if (err.code === "auth/email-already-in-use") setErro("E-mail já cadastrado.");
      else if (err.code === "auth/weak-password") setErro("Senha fraca.");
      else setErro("Erro ao cadastrar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  // --- LÓGICA DE IMPORTAÇÃO DE PLANILHA ---
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
        if (index === 0 && linha.toLowerCase().includes("email")) return; // Ignora cabeçalho
        
        const partes = linha.split(",").map(p => p.trim());
        if (partes.length < 4) {
          erros.push(`Linha ${index + 1}: Faltam colunas (Nome, Email, Senha, Cargo).`);
          return;
        }

        const [nomeCsv, emailCsv, senhaCsv, cargoCsv] = partes;
        
        if (!nomeCsv || !emailCsv || !senhaCsv || !cargoCsv) {
          erros.push(`Linha ${index + 1}: Todos os campos são obrigatórios.`);
          return;
        }
        
        if (!emailCsv.toLowerCase().endsWith(DOMINIO_PERMITIDO.toLowerCase())) {
          erros.push(`Linha ${index + 1}: E-mail deve ser ${DOMINIO_PERMITIDO}.`);
          return;
        }

        novosDados.push({ nome: nomeCsv, email: emailCsv, senha: senhaCsv, cargo: cargoCsv.toLowerCase() });
      });

      setCsvData(novosDados);
      setCsvErros(erros);
    };
    reader.readAsText(file);
  };

  const confirmarImportacao = async () => {
    if (csvErros.length > 0) return;
    setLoading(true);
    setErro("");

    try {
      // Para cada usuário da planilha, cria no Auth e no Firestore
      // (Aviso: O Firebase Client SDK loga o último usuário criado. 
      // O signOut no final limpa a sessão).
      
      for (const u of csvData) {
        try {
          const userCred = await createUserWithEmailAndPassword(auth, u.email, u.senha);
          const novoUid = userCred.user.uid;
          
          await setDoc(doc(db, "users", novoUid), {
            nome: u.nome,
            email: u.email,
            cargos: [u.cargo],
            disciplinas: [],
            unidade: "",
            series: "",
            turmas: "",
            unidadesComando: [],
            unidadesInativas: [],
            turmasInativas: [],
            criadoEm: new Date(),
            status: "Ativo",
          });
        } catch (err) {
          console.error(`Erro ao importar ${u.email}:`, err);
          // Continua para o próximo em vez de parar tudo
        }
      }
      
      await signOut(auth); // Restaura a sessão
      onSuccess?.();
    } catch (err) {
      setErro("Erro ao importar planilha. Verifique se as senhas são fortes o suficiente.");
    } finally {
      setLoading(false);
    }
  };

  // --- RENDERIZAÇÃO ---
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white border-2 border-black rounded-xl shadow-[8px_8px_0px_#000] w-full max-w-2xl max-h-[90vh] flex flex-col">
        
        {/* CABEÇALHO COM ABAS */}
        <div className="bg-[#171717] text-white px-4 py-3 border-b-2 border-black flex justify-between items-center rounded-t-xl shrink-0">
          <div className="flex gap-4">
            <button 
              onClick={() => { setAbaAtiva("manual"); setErro(""); }}
              className={`text-xs font-black uppercase tracking-wide pb-1 border-b-2 transition-all ${abaAtiva === "manual" ? "border-pensi-yellow text-pensi-yellow" : "border-transparent text-gray-400 hover:text-white"}`}
            >
              Manual
            </button>
            <button 
              onClick={() => { setAbaAtiva("planilha"); setErro(""); }}
              className={`text-xs font-black uppercase tracking-wide pb-1 border-b-2 transition-all ${abaAtiva === "planilha" ? "border-pensi-yellow text-pensi-yellow" : "border-transparent text-gray-400 hover:text-white"}`}
            >
              Planilha (Lote)
            </button>
          </div>
          <button onClick={onClose} className="p-1.5 border border-white/30 rounded-md hover:bg-white/10"><X className="w-4 h-4" /></button>
        </div>

        <div className="p-5 overflow-y-auto flex-1">
          {erro && (
            <div className="mb-4 p-3 bg-red-100 border-2 border-red-400 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-700 shrink-0 mt-0.5" />
              <p className="text-[11px] font-bold text-red-700">{erro}</p>
            </div>
          )}

          {/* ================= ABA MANUAL ================= */}
          {abaAtiva === "manual" && (
            <div className="space-y-5">
              {step === 1 && (
                <div className="space-y-4 animate-fade-in">
                  <h3 className="text-sm font-black uppercase text-black mb-3">1. Dados Pessoais</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[9px] font-black uppercase tracking-widest text-gray-500 mb-1">Nome Completo</label>
                      <div className="relative">
                        <User className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input value={nome} onChange={(e) => setNome(e.target.value)} className="w-full border-2 border-black rounded-lg pl-9 pr-3 py-2 text-xs font-medium outline-none" placeholder="Nome do usuário" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[9px] font-black uppercase tracking-widest text-gray-500 mb-1">E-mail Institucional</label>
                      <div className="relative">
                        <Mail className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border-2 border-black rounded-lg pl-9 pr-3 py-2 text-xs font-medium outline-none" placeholder="nome@pensi.com.br" />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[9px] font-black uppercase tracking-widest text-gray-500 mb-1">Senha Inicial</label>
                    <div className="relative">
                      <Lock className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input value={senha} onChange={(e) => setSenha(e.target.value)} type="password" className="w-full border-2 border-black rounded-lg pl-9 pr-3 py-2 text-xs font-medium outline-none" placeholder="Mínimo 6 caracteres" />
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="animate-fade-in">
                  <h3 className="text-sm font-black uppercase text-black mb-3">2. Cargos e Acessos</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {CARGOS_ATRIBUIVEIS.map((c) => (
                      <label key={c.id} className={`flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all ${cargos.includes(c.id) ? "border-black bg-pensi-yellow/20 shadow-[2px_2px_0px_#000]" : "border-gray-200 hover:border-black"}`}>
                        <input type="checkbox" checked={cargos.includes(c.id)} onChange={() => toggleItem(setCargos, c.id)} className="w-4 h-4 accent-black" />
                        <span className="text-xs font-black uppercase">{c.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {step === 3 && precisaDisciplinasEUnidades && (
                <div className="animate-fade-in space-y-4">
                  <h3 className="text-sm font-black uppercase text-black">3. Disciplinas Lecionadas</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[300px] overflow-y-auto p-1">
                    {disciplinasLista.map(([key, nomeDisc]) => (
                      <label key={key} className={`flex items-center gap-2 p-2 border-2 rounded-lg cursor-pointer transition-all ${disciplinas.includes(key) ? "border-black bg-pensi-yellow/20" : "border-gray-200 hover:border-black"}`}>
                        <input type="checkbox" checked={disciplinas.includes(key)} onChange={() => toggleItem(setDisciplinas, key)} className="w-3.5 h-3.5 accent-black" />
                        <span className="text-[10px] font-bold truncate">{nomeDisc}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {step === 3 && precisaUnidadesComando && (
                <div className="animate-fade-in space-y-4">
                  <h3 className="text-sm font-black uppercase text-black">3. Unidades de Comando (Regional)</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {unidadesDisponiveis.map((u) => (
                      <label key={u} className={`flex items-center gap-2.5 p-3 border-2 rounded-lg cursor-pointer transition-all ${unidadesComando.includes(u) ? "border-black bg-pensi-yellow/20" : "border-gray-200 hover:border-black"}`}>
                        <input type="checkbox" checked={unidadesComando.includes(u)} onChange={() => toggleItem(setUnidadesComando, u)} className="w-3.5 h-3.5 accent-black" />
                        <MapPin className="w-3.5 h-3.5" />
                        <span className="text-[11px] font-black">{u}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="animate-fade-in space-y-4">
                  <h3 className="text-sm font-black uppercase text-black">4. Unidades onde Leciona</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {unidadesDisponiveis.map((u) => (
                      <label key={u} className={`flex items-center gap-2.5 p-3 border-2 rounded-lg cursor-pointer transition-all ${unidades.includes(u) ? "border-black bg-pensi-yellow/20" : "border-gray-200 hover:border-black"}`}>
                        <input type="checkbox" checked={unidades.includes(u)} onChange={() => toggleItem(setUnidades, u)} className="w-3.5 h-3.5 accent-black" />
                        <MapPin className="w-3.5 h-3.5" />
                        <span className="text-[11px] font-black">{u}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {step === 5 && (
                <div className="animate-fade-in space-y-4">
                  <h3 className="text-sm font-black uppercase text-black mb-2">5. Séries e Turmas</h3>
                  <div className="space-y-3">
                    {pares.map(({ disciplina, unidade }) => {
                      const chave = `${disciplina}|${unidade}`;
                      const sel = selecoesPorPar[chave] || { series: [], turmas: [] };
                      const seriesDisp = getSeriesPorUnidades([unidade]);
                      const turmasDisp = getTurmasPorUnidadesESeries([unidade], sel.series);
                      
                      return (
                        <div key={chave} className="border-2 border-black rounded-lg p-3 bg-gray-50">
                          <div className="text-[11px] font-black mb-2 uppercase text-gray-700">{disciplina} — {unidade}</div>
                          
                          <div className="text-[9px] font-black text-gray-400 uppercase mb-1">Séries</div>
                          <div className="flex flex-wrap gap-1 mb-3">
                            {seriesDisp.map((s) => (
                              <button key={s} type="button" onClick={() => {
                                const novasSeries = sel.series.includes(s) ? sel.series.filter((x) => x !== s) : [...sel.series, s];
                                const turmasValidas = getTurmasPorUnidadesESeries([unidade], novasSeries).map((t) => t.turma);
                                const novasTurmas = sel.turmas.filter((t) => turmasValidas.includes(t));
                                setSelecao(chave, { series: novasSeries, turmas: novasTurmas });
                              }}
                              className={`px-2.5 py-1 border-2 rounded-md text-[10px] font-bold transition-all ${sel.series.includes(s) ? "bg-pensi-yellow border-black shadow-[1px_1px_0px_#000]" : "bg-white border-gray-300 hover:border-black"}`}>
                                {s}
                              </button>
                            ))}
                          </div>

                          <div className="text-[9px] font-black text-gray-400 uppercase mb-1">Turmas</div>
                          <div className="flex flex-wrap gap-1">
                            {turmasDisp.length === 0 ? <span className="text-[10px] text-gray-400 italic">Selecione as séries primeiro.</span> :
                              turmasDisp.map((t) => (
                                <button key={t.turma} type="button" onClick={() => {
                                  const novasTurmas = sel.turmas.includes(t.turma) ? sel.turmas.filter((x) => x !== t.turma) : [...sel.turmas, t.turma];
                                  setSelecao(chave, { ...sel, turmas: novasTurmas });
                                }}
                                className={`px-2.5 py-1 border-2 rounded-md text-[10px] font-bold transition-all ${sel.turmas.includes(t.turma) ? "bg-pensi-yellow border-black shadow-[1px_1px_0px_#000]" : "bg-white border-gray-300 hover:border-black"}`}>
                                  {t.turma}
                                </button>
                              ))
                            }
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ================= ABA PLANILHA ================= */}
          {abaAtiva === "planilha" && (
            <div className="animate-fade-in">
              {!csvData.length && csvErros.length === 0 ? (
                <div className="text-center space-y-4">
                  <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-4 text-left">
                    <h4 className="flex items-center gap-1.5 text-[11px] font-black text-yellow-800 uppercase mb-2"><AlertCircle className="w-4 h-4" /> Formato do Arquivo</h4>
                    <p className="text-[11px] text-yellow-800 leading-relaxed font-medium mb-2">Envie um arquivo <strong>CSV</strong> separado por vírgulas. A ordem deve ser:</p>
                    <ul className="text-[10px] text-yellow-800 font-black uppercase tracking-wide list-disc list-inside space-y-1">
                      <li>Nome Completo</li>
                      <li>E-mail (pensi)</li>
                      <li>Senha Inicial</li>
                      <li>Cargo (ex: professor, nucleo...)</li>
                    </ul>
                    <p className="text-[9px] text-yellow-700 mt-2 italic">Obs: As unidades e turmas deverão ser atribuídas após a importação na tela de usuários.</p>
                  </div>
                  <input type="file" accept=".csv" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
                  <button onClick={() => fileInputRef.current?.click()} className="px-5 py-2.5 bg-blue-300 border-2 border-black rounded-lg text-[10px] font-black uppercase shadow-[3px_3px_0px_#000] hover:shadow-none hover:translate-y-[3px] hover:translate-x-[3px] transition-all">
                    Selecionar Planilha
                  </button>
                </div>
              ) : (
                <div>
                  {csvErros.length > 0 ? (
                    <div className="bg-red-50 border-2 border-red-400 rounded-lg p-4">
                      <h4 className="text-[11px] font-black text-red-800 uppercase mb-2 flex items-center gap-1.5"><AlertCircle className="w-4 h-4"/> Erros encontrados ({csvErros.length})</h4>
                      <div className="max-h-[200px] overflow-y-auto text-[10px] text-red-600 font-bold space-y-1">
                        {csvErros.map((err, i) => <p key={i}>{err}</p>)}
                      </div>
                      <button onClick={() => { setCsvErros([]); setCsvData([]); }} className="mt-4 w-full py-2 bg-white border-2 border-black rounded-lg text-[9px] font-black uppercase">Tentar outro arquivo</button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="bg-green-50 border-2 border-green-400 rounded-lg p-3 flex gap-2 items-start">
                        <CheckCircle2 className="w-4 h-4 text-green-700 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-[11px] font-black text-green-800 uppercase">Tudo certo!</p>
                          <p className="text-[10px] text-green-700 font-medium">Encontramos {csvData.length} usuários prontos para importar.</p>
                        </div>
                      </div>
                      <div className="max-h-[250px] overflow-y-auto border-2 border-black rounded-lg">
                        <table className="w-full text-left text-[10px]">
                          <thead className="bg-gray-100 font-black uppercase text-gray-500 border-b-2 border-black">
                            <tr><th className="p-2 border-r-2 border-black">Nome</th><th className="p-2 border-r-2 border-black">Email</th><th className="p-2">Cargo</th></tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {csvData.map((d, i) => (
                              <tr key={i} className="font-medium text-gray-700 bg-white hover:bg-gray-50">
                                <td className="p-2 border-r-2 border-gray-100">{d.nome}</td>
                                <td className="p-2 border-r-2 border-gray-100">{d.email}</td>
                                <td className="p-2 uppercase">{d.cargo}</td>
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
          )}
        </div>

        {/* RODAPÉ DE AÇÕES */}
        <div className="p-4 border-t-2 border-black bg-gray-50 rounded-b-xl flex gap-3">
          {abaAtiva === "manual" ? (
            <>
              <button onClick={() => step > 1 ? setStep(step - 1) : onClose()}
                className="flex-1 py-2.5 bg-white border-2 border-black rounded-lg text-[10px] font-black uppercase shadow-[2px_2px_0px_#000] active:shadow-none active:translate-y-[2px] transition-all">
                {step > 1 ? "Voltar" : "Cancelar"}
              </button>
              <button onClick={avancar} disabled={loading}
                className="flex-1 py-2.5 bg-pensi-yellow border-2 border-black rounded-lg text-[10px] font-black uppercase shadow-[2px_2px_0px_#000] active:shadow-none active:translate-y-[2px] transition-all disabled:opacity-60">
                {loading ? "Processando..." : (step === 5 || (!precisaDisciplinasEUnidades && !precisaUnidadesComando && step === 2) ? "Finalizar" : "Próximo")}
              </button>
            </>
          ) : (
            <>
              <button onClick={onClose} className="flex-1 py-2.5 bg-white border-2 border-black rounded-lg text-[10px] font-black uppercase shadow-[2px_2px_0px_#000]">
                Cancelar
              </button>
              {csvData.length > 0 && csvErros.length === 0 && (
                <button onClick={confirmarImportacao} disabled={loading} className="flex-1 py-2.5 bg-green-400 border-2 border-black rounded-lg text-[10px] font-black uppercase shadow-[2px_2px_0px_#000] disabled:opacity-60">
                  {loading ? "Importando..." : "Confirmar Importação"}
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}