import { useState, useMemo } from "react";
import { createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../../services/firebase";
import { DISCIPLINAS_POR_ANO } from "../../data/disciplinas";
import { UNIDADES } from "../../data/unidades";
import { getSeriesPorUnidades, getTurmasPorUnidadesESeries } from "../../data/turmas";
import {
  Mail, Lock, User, ArrowRight, BookOpen, MapPin,
  Users, ShieldCheck, X, CheckCircle2, GraduationCap, Network,
} from "lucide-react";

const CARGOS_ATRIBUIVEIS = [
  { id: "diretor", label: "Diretor" },
  { id: "coordenador", label: "Coordenador" },
  { id: "nucleo", label: "Núcleo" },
  { id: "regional", label: "Regional" },
  { id: "professor", label: "Professor" },
];

const DOMINIO_PERMITIDO = import.meta.env.VITE_DOMINIO_PERMITIDO || "@pensi.com.br";

export default function CadastrarUsuario({ onClose, onSuccess, perfilAtivo, currentUser, unidadesEscopo }) {
  const [step, setStep] = useState(1); // 1 dados, 2 cargo, 3 disciplinas, 4 unidades, 5 séries/turmas
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

  const ehRegionalLogado = perfilAtivo === "regional";
  const unidadesDisponiveis = ehRegionalLogado
    ? UNIDADES.filter((u) => (unidadesEscopo || []).includes(u))
    : UNIDADES;

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

  const setSelecao = (chave, valor) => {
    setSelecoesPorPar((prev) => ({ ...prev, [chave]: valor }));
  };

  const toggle = (setList, item) => {
    setList((prev) => prev.includes(item) ? prev.filter((v) => v !== item) : [...prev, item]);
  };

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
      if (precisaUnidadesComando) { setStep(4); return; }
      handleSubmitFinal();
      return;
    }
    if (step === 3) {
      if (disciplinas.length === 0) return setErro("Selecione ao menos uma disciplina.");
      setStep(4);
      return;
    }
    if (step === 4) {
      if (precisaDisciplinasEUnidades && unidades.length === 0) return setErro("Selecione ao menos uma unidade.");
      if (precisaUnidadesComando && unidadesComando.length === 0) return setErro("Selecione ao menos uma unidade para comandar.");
      if (precisaDisciplinasEUnidades) { setStep(5); return; }
      handleSubmitFinal();
      return;
    }
    if (step === 5) {
      // checar séries/turmas de cada par
      for (const par of pares) {
        const chave = `${par.disciplina}|${par.unidade}`;
        const sel = selecoesPorPar[chave];
        if (!sel || !sel.series?.length || !sel.turmas?.length) {
          return setErro(`Preencha séries e turmas de ${par.disciplina} em ${par.unidade}.`);
        }
      }
      handleSubmitFinal();
    }
  };

  const handleSubmitFinal = async () => {
    setLoading(true);
    setErro("");
    try {
      // cria usuário no Auth
      const userCred = await createUserWithEmailAndPassword(auth, email.trim().toLowerCase(), senha);
      const novoUid = userCred.user.uid;

      // Agrupa turmas por unidade
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
        unidade: precisaDisciplinasEUnidades ? unidades.join(",") : (precisaUnidadesComando ? "" : ""),
        series: precisaDisciplinasEUnidades ? [...todasSeries].join(",") : "",
        turmas: precisaDisciplinasEUnidades ? turmasString : "",
        unidadesComando: precisaUnidadesComando ? unidadesComando : [],
        unidadesInativas: [],
        turmasInativas: [],
        criadoEm: new Date(),
        status: "Ativo",
      };

      await setDoc(doc(db, "users", novoUid), payload);

      // Signout do novo user pra não derrubar o admin logado
      await signOut(auth);

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

  const totalSteps = precisaDisciplinasEUnidades
    ? (precisaUnidadesComando ? 5 : 5)
    : (precisaUnidadesComando ? 3 : 2);

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white border-2 border-black rounded-md shadow-[6px_6px_0px_#000] w-full max-w-xl max-h-[90vh] flex flex-col">
        <div className="bg-[#171717] text-white px-4 py-3 border-b-2 border-black flex justify-between items-center">
          <div>
            <h3 className="font-black text-xs uppercase tracking-wide">Cadastrar usuário</h3>
            <p className="text-[9px] text-gray-400 mt-0.5">Passo {step} de {totalSteps}</p>
          </div>
          <button onClick={onClose} className="p-1.5 border border-white/30 rounded-md hover:bg-white/10"><X className="w-3.5 h-3.5" /></button>
        </div>

        <div className="p-4 overflow-y-auto flex-1">
          {erro && (
            <div className="mb-3 p-2 bg-red-100 border-2 border-red-400 rounded-md text-[10px] font-bold text-red-700">
              {erro}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-3">
              <div>
                <label className="block text-[9px] font-black uppercase tracking-widest text-gray-500 mb-1">Nome</label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input value={nome} onChange={(e) => setNome(e.target.value)}
                    className="w-full border-2 border-black rounded-md pl-9 pr-3 py-2 text-xs font-medium outline-none" placeholder="Nome completo" />
                </div>
              </div>
              <div>
                <label className="block text-[9px] font-black uppercase tracking-widest text-gray-500 mb-1">E-mail</label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input value={email} onChange={(e) => setEmail(e.target.value)} type="email"
                    className="w-full border-2 border-black rounded-md pl-9 pr-3 py-2 text-xs font-medium outline-none" placeholder="nome@pensi.com.br" />
                </div>
              </div>
              <div>
                <label className="block text-[9px] font-black uppercase tracking-widest text-gray-500 mb-1">Senha</label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input value={senha} onChange={(e) => setSenha(e.target.value)} type="password"
                    className="w-full border-2 border-black rounded-md pl-9 pr-3 py-2 text-xs font-medium outline-none" placeholder="••••••••" />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-2">
              <p className="text-[11px] text-gray-500 mb-2">Selecione os cargos do novo usuário.</p>
              {CARGOS_ATRIBUIVEIS.map((c) => (
                <label key={c.id} className={`flex items-center gap-2.5 p-2.5 border-2 rounded-md cursor-pointer ${cargos.includes(c.id) ? "border-black bg-pensi-yellow/20" : "border-gray-200"}`}>
                  <input type="checkbox" checked={cargos.includes(c.id)}
                    onChange={() => toggle(setCargos, c.id)} className="w-3.5 h-3.5 accent-black" />
                  <span className="flex-1 text-[11px] font-black">{c.label}</span>
                </label>
              ))}
            </div>
          )}

          {step === 3 && (
            <div>
              <p className="text-[11px] text-gray-500 mb-2">Disciplinas que leciona.</p>
              <div className="max-h-[300px] overflow-y-auto border-2 border-black rounded-md p-2 space-y-1">
                {disciplinasLista.map(([key, nomeDisc]) => (
                  <label key={key} className={`flex items-center gap-2 px-2 py-1.5 border rounded-md cursor-pointer ${disciplinas.includes(key) ? "border-black bg-pensi-yellow/20" : "border-gray-200"}`}>
                    <input type="checkbox" checked={disciplinas.includes(key)} onChange={() => toggle(setDisciplinas, key)} className="w-3 h-3 accent-black" />
                    <span className="text-[10px] font-bold">{nomeDisc}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-3">
              {precisaDisciplinasEUnidades && (
                <div>
                  <p className="text-[11px] text-gray-500 mb-2">Unidades onde leciona.</p>
                  <div className="max-h-[240px] overflow-y-auto border-2 border-black rounded-md p-2 space-y-1">
                    {unidadesDisponiveis.map((u) => (
                      <label key={u} className={`flex items-center gap-2 px-2 py-1.5 border rounded-md cursor-pointer ${unidades.includes(u) ? "border-black bg-pensi-yellow/20" : "border-gray-200"}`}>
                        <input type="checkbox" checked={unidades.includes(u)} onChange={() => toggle(setUnidades, u)} className="w-3 h-3 accent-black" />
                        <MapPin className="w-3 h-3" />
                        <span className="text-[10px] font-bold">{u}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
              {precisaUnidadesComando && (
                <div>
                  <p className="text-[11px] text-gray-500 mb-2">Unidades que vai comandar (regional).</p>
                  <div className="max-h-[240px] overflow-y-auto border-2 border-black rounded-md p-2 space-y-1">
                    {unidadesDisponiveis.map((u) => (
                      <label key={u} className={`flex items-center gap-2 px-2 py-1.5 border rounded-md cursor-pointer ${unidadesComando.includes(u) ? "border-black bg-pensi-yellow/20" : "border-gray-200"}`}>
                        <input type="checkbox" checked={unidadesComando.includes(u)} onChange={() => toggle(setUnidadesComando, u)} className="w-3 h-3 accent-black" />
                        <Network className="w-3 h-3" />
                        <span className="text-[10px] font-bold">{u}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 5 && (
            <div className="space-y-3">
              <p className="text-[11px] text-gray-500">Séries e turmas por disciplina/unidade.</p>
              {pares.map(({ disciplina, unidade }) => {
                const chave = `${disciplina}|${unidade}`;
                const sel = selecoesPorPar[chave] || { series: [], turmas: [] };
                const seriesDisp = getSeriesPorUnidades([unidade]);
                const turmasDisp = getTurmasPorUnidadesESeries([unidade], sel.series);
                return (
                  <div key={chave} className="border-2 border-black rounded-md p-2">
                    <div className="text-[10px] font-black mb-1">{disciplina} — {unidade}</div>
                    <div className="text-[9px] font-bold text-gray-400 uppercase mb-1">Séries</div>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {seriesDisp.map((s) => (
                        <button key={s} type="button"
                          onClick={() => {
                            const novasSeries = sel.series.includes(s) ? sel.series.filter((x) => x !== s) : [...sel.series, s];
                            const turmasValidas = getTurmasPorUnidadesESeries([unidade], novasSeries).map((t) => t.turma);
                            const novasTurmas = sel.turmas.filter((t) => turmasValidas.includes(t));
                            setSelecao(chave, { series: novasSeries, turmas: novasTurmas });
                          }}
                          className={`px-2 py-1 border-2 rounded-md text-[9px] font-bold ${sel.series.includes(s) ? "bg-pensi-yellow border-black" : "bg-white border-gray-300"}`}>
                          {s}
                        </button>
                      ))}
                    </div>
                    <div className="text-[9px] font-bold text-gray-400 uppercase mb-1">Turmas</div>
                    <div className="flex flex-wrap gap-1">
                      {turmasDisp.map((t) => (
                        <button key={t.turma} type="button"
                          onClick={() => {
                            const novasTurmas = sel.turmas.includes(t.turma) ? sel.turmas.filter((x) => x !== t.turma) : [...sel.turmas, t.turma];
                            setSelecao(chave, { ...sel, turmas: novasTurmas });
                          }}
                          className={`px-2 py-1 border-2 rounded-md text-[9px] font-bold ${sel.turmas.includes(t.turma) ? "bg-pensi-yellow border-black" : "bg-white border-gray-300"}`}>
                          {t.turma}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="p-3 border-t-2 border-black flex gap-2">
          <button onClick={() => step > 1 ? setStep(step - 1) : onClose()}
            className="flex-1 py-2 bg-white border-2 border-black rounded-md text-[9px] font-black uppercase shadow-[2px_2px_0px_#000]">
            {step > 1 ? "Voltar" : "Cancelar"}
          </button>
          <button onClick={avancar} disabled={loading}
            className="flex-1 py-2 bg-pensi-yellow border-2 border-black rounded-md text-[9px] font-black uppercase shadow-[2px_2px_0px_#000]">
            {loading ? "Salvando..." : (step === totalSteps ? "Finalizar" : "Próximo")}
          </button>
        </div>
      </div>
    </div>
  );
}