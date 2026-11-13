import { useState, useMemo, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { DISCIPLINAS_POR_ANO } from "../data/disciplinas";
import { UNIDADES } from "../data/unidades";
import { useTurmas } from "../hooks/useTurmas"; // IMPORTANDO O HOOK DO BANCO
import { validarEmailInstitucional } from "../utils/validators";
import { signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";
import { auth } from "../services/firebase";
import {
  Mail, Lock, User, ArrowRight, Eye, EyeOff, BookOpen, MapPin,
  Users, ShieldCheck, CheckCircle2, GraduationCap,
} from "lucide-react";

import AuthBackButton from "../components/auth/AuthBackButton";
import AuthCard from "../components/auth/AuthCard";
import AuthError from "../components/auth/AuthError";
import AuthFormField from "../components/auth/AuthFormField";
import AuthGoogleButton from "../components/auth/AuthGoogleButton";
import AuthDivider from "../components/auth/AuthDivider";
import RegisterProgress from "../components/register/RegisterProgress";
import RegisterPasswordStrength from "../components/register/RegisterPasswordStrength";
import RegisterSelectionGroup from "../components/register/RegisterSelectionGroup";
import RegisterCountBadge from "../components/register/RegisterCountBadge";
import RegisterGoogleBanner from "../components/register/RegisterGoogleBanner";

const DOMINIO_PERMITIDO = import.meta.env.VITE_DOMINIO_PERMITIDO || "@pensi.com.br";

export default function Register({ onNavigate }) {
  const { register, atualizarPerfil, user } = useAuth();
  
  // PEGA AS FUNÇÕES DO BANCO DE DADOS
  const { getSeriesPorUnidades, getTurmasPorUnidadesESeries } = useTurmas({ somenteAtivas: true });

  const [baseStep, setBaseStep] = useState(1);
  const [parIdx, setParIdx] = useState(0);
  const [subStep, setSubStep] = useState(null);

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [senha2, setSenha2] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarSenha2, setMostrarSenha2] = useState(false);

  const [disciplinas, setDisciplinas] = useState([]);
  const [unidades, setUnidades] = useState([]);
  const [selecoesPorPar, setSelecoesPorPar] = useState({});

  const [googleUser, setGoogleUser] = useState(null);

  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    if (user?.perfilIncompleto && !googleUser) {
      setGoogleUser({ uid: user.uid, email: user.email, displayName: user.nome || "" });
      setNome(user.nome || "");
      setEmail(user.email || "");
      setBaseStep(2);
    }
  }, [user, googleUser]);

  const disciplinasLista = useMemo(() => {
    const todas = Object.values(DISCIPLINAS_POR_ANO).reduce((acc, ano) => {
      Object.entries(ano).forEach(([key, value]) => { acc[key] = value.nome; });
      return acc;
    }, {});
    return Object.entries(todas).sort((a, b) => a[1].localeCompare(b[1], "pt-BR"));
  }, []);

  const nomeDisciplina = useMemo(() => {
    const mapa = {};
    disciplinasLista.forEach(([key, nome]) => { mapa[key] = nome; });
    return mapa;
  }, [disciplinasLista]);

  const pares = useMemo(() => {
    const lista = [];
    disciplinas.forEach((d) => {
      unidades.forEach((u) => {
        lista.push({ disciplina: d, unidade: u });
      });
    });
    return lista;
  }, [disciplinas, unidades]);

  useEffect(() => {
    setSelecoesPorPar((prev) => {
      const novo = {};
      pares.forEach(({ disciplina, unidade }) => {
        const chave = `${disciplina}|${unidade}`;
        novo[chave] = prev[chave] || { series: [], turmas: [] };
      });
      return novo;
    });
  }, [pares]);

  const toggleItem = (setList, item) => {
    setList((prev) =>
      prev.includes(item) ? prev.filter((v) => v !== item) : [...prev, item]
    );
  };

  const totalSteps = googleUser ? 2 + 2 * pares.length : 3 + 2 * pares.length;

  const currentStepNumber = (() => {
    if (baseStep === 1) return 1;
    if (baseStep === 2) return googleUser ? 1 : 2;
    if (baseStep === 3) return googleUser ? 2 : 3;
    const offset = googleUser ? 2 : 3;
    return offset + parIdx * 2 + (subStep === "turma" ? 2 : 1);
  })();

  const parAtual = pares[parIdx] || null;
  const chaveParAtual = parAtual ? `${parAtual.disciplina}|${parAtual.unidade}` : null;
  const selecaoAtual = chaveParAtual ? selecoesPorPar[chaveParAtual] || { series: [], turmas: [] } : { series: [], turmas: [] };

  // AGORA PUXA DO BANCO DE DADOS
  const seriesDoParAtual = useMemo(() => {
    if (!parAtual) return [];
    return getSeriesPorUnidades([parAtual.unidade]);
  }, [parAtual, getSeriesPorUnidades]);

  const turmasDoParAtual = useMemo(() => {
    if (!parAtual) return [];
    return getTurmasPorUnidadesESeries([parAtual.unidade], selecaoAtual.series);
  }, [parAtual, selecaoAtual.series, getTurmasPorUnidadesESeries]);

  const toggleSerieDoPar = (serie) => {
    if (!chaveParAtual) return;
    setSelecoesPorPar((prev) => {
      const atual = prev[chaveParAtual] || { series: [], turmas: [] };
      const novasSeries = atual.series.includes(serie)
        ? atual.series.filter((s) => s !== serie)
        : [...atual.series, serie];
      const turmasValidas = getTurmasPorUnidadesESeries([parAtual.unidade], novasSeries).map((t) => t.turma);
      const novasTurmas = atual.turmas.filter((t) => turmasValidas.includes(t));
      return { ...prev, [chaveParAtual]: { series: novasSeries, turmas: novasTurmas } };
    });
  };

  const toggleTurmaDoPar = (turma) => {
    if (!chaveParAtual) return;
    setSelecoesPorPar((prev) => {
      const atual = prev[chaveParAtual] || { series: [], turmas: [] };
      const novasTurmas = atual.turmas.includes(turma)
        ? atual.turmas.filter((t) => t !== turma)
        : [...atual.turmas, turma];
      return { ...prev, [chaveParAtual]: { ...atual, turmas: novasTurmas } };
    });
  };

  const tituloEtapa = (() => {
    if (baseStep === 1) return "Seus dados";
    if (baseStep === 2) return "Disciplinas";
    if (baseStep === 3) return "Unidades";
    if (subStep === "serie") return `Séries — ${parAtual.unidade}`;
    return `Turmas — ${parAtual.unidade}`;
  })();

  const avancar = () => {
    setErro("");
    if (baseStep === 1) {
      if (!nome.trim() || !email.trim() || !senha || !senha2) return setErro("Preencha todos os campos.");
      if (!validarEmailInstitucional(email.trim())) return setErro("E-mail institucional inválido. Use @pensi.com.br.");
      if (senha !== senha2) return setErro("As senhas não coincidem.");
      const req = [senha.length >= 8, /[A-Z]/.test(senha), /[a-z]/.test(senha), /[0-9]/.test(senha), /[^A-Za-z0-9]/.test(senha)].filter(Boolean).length;
      if (req < 5) return setErro("A senha não atende a todos os requisitos.");
      setBaseStep(2);
      return;
    }
    if (baseStep === 2) {
      if (disciplinas.length === 0) return setErro("Selecione ao menos uma disciplina.");
      setBaseStep(3);
      return;
    }
    if (baseStep === 3) {
      if (unidades.length === 0) return setErro("Selecione ao menos uma unidade.");
      setParIdx(0);
      setSubStep("serie");
      setBaseStep(4);
      return;
    }
    if (!parAtual) return;
    if (subStep === "serie") {
      if (selecaoAtual.series.length === 0) return setErro(`Selecione ao menos uma série em ${parAtual.unidade}.`);
      setSubStep("turma");
      return;
    }
    if (subStep === "turma") {
      if (selecaoAtual.turmas.length === 0) return setErro(`Selecione ao menos uma turma em ${parAtual.unidade}.`);
      if (parIdx + 1 < pares.length) {
        setParIdx(parIdx + 1);
        setSubStep("serie");
      } else {
        handleSubmitFinal();
      }
    }
  };

  const voltar = () => {
    setErro("");
    if (baseStep === 1) return onNavigate("home");
    if (baseStep === 2) { setBaseStep(1); return; }
    if (baseStep === 3) { setBaseStep(2); return; }
    if (subStep === "turma") { setSubStep("serie"); return; }
    if (subStep === "serie") {
      if (parIdx === 0) { setBaseStep(3); setSubStep(null); }
      else { setParIdx(parIdx - 1); setSubStep("turma"); }
    }
  };

  const handleSubmitFinal = async () => {
    setErro("");
    
    const turmasPorUnidade = {};
    const todasSeries = new Set();

    Object.entries(selecoesPorPar).forEach(([chave, sel]) => {
      const unidade = chave.split("|")[1]; 
      
      if (!turmasPorUnidade[unidade]) {
        turmasPorUnidade[unidade] = [];
      }
      
      sel.turmas.forEach((t) => {
        if (!turmasPorUnidade[unidade].includes(t)) {
          turmasPorUnidade[unidade].push(t);
        }
      });
      
      sel.series.forEach((s) => todasSeries.add(s));
    });

    const turmasString = Object.entries(turmasPorUnidade)
      .filter(([_, t]) => t.length > 0)
      .map(([unidade, turmas]) => `${unidade}: ${turmas.join(", ")}`)
      .join(" | ");

    if (!turmasString) return setErro("Selecione ao menos uma turma.");

    setLoading(true);
    try {
      const payload = {
        nome: nome.trim() || googleUser?.displayName || "",
        disciplinas,
        unidade: unidades.join(","),
        series: [...todasSeries].join(","),
        turmas: turmasString,
      };

      if (googleUser) {
        const res = await atualizarPerfil(payload);
        if (res.ok) onNavigate("home");
        else setErro(res.message || "Não foi possível salvar os dados.");
      } else {
        const res = await register({ ...payload, email: email.trim().toLowerCase(), senha });
        if (res.ok) onNavigate("home");
        else setErro(res.message || "Não foi possível criar a conta.");
      }
    } catch {
      setErro("Ocorreu um erro. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    avancar();
  };

  const handleGoogleLogin = async () => {
    setErro("");
    setGoogleLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const gUser = result.user;
      if (!gUser.email || !gUser.email.toLowerCase().endsWith(DOMINIO_PERMITIDO.toLowerCase())) {
        await signOut(auth);
        setErro(`Acesso negado. Use um e-mail ${DOMINIO_PERMITIDO}.`);
        return;
      }
      setGoogleUser(gUser);
      setNome(gUser.displayName || "");
      setEmail(gUser.email || "");
      setBaseStep(2);
    } catch (error) {
      console.error("Erro no login com Google:", error);
      if (error.code === "auth/popup-closed-by-user") setErro("Login cancelado. Tente novamente.");
      else if (error.code === "account-exists-with-different-credential") setErro("Já existe uma conta com este e-mail usando outro método de login.");
      else if (error.code === "auth/unauthorized-domain") setErro("Domínio não autorizado. Configure o domínio no Console do Firebase.");
      else setErro("Erro ao entrar com Google. Tente novamente.");
    } finally {
      setGoogleLoading(false);
    }
  };

  const EtapaIcone = (() => {
    if (baseStep === 1) return User;
    if (baseStep === 2) return BookOpen;
    if (baseStep === 3) return MapPin;
    if (subStep === "serie") return GraduationCap;
    return Users;
  })();

  return (
    <main className="relative min-h-screen flex items-center justify-center bg-[#f3f4f6] px-4 sm:px-6 py-6">
      <AuthBackButton onClick={voltar} label={currentStepNumber === 1 ? "Voltar" : "Voltar Etapa"} />

      <AuthCard>
        <div className="grid grid-cols-1 md:grid-cols-[1fr_1.5fr] gap-8 md:gap-12 items-start mt-4">
          <div className="flex flex-col items-start text-left h-full pt-2">
            <div className="w-12 h-12 flex items-center justify-center bg-pensi-yellow border-[2px] border-black rounded-full shadow-[3px_3px_0px_0px_#000] mb-6">
              <EtapaIcone className="w-5 h-5 text-black" strokeWidth={2.5} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight leading-tight text-gray-900 mb-3">
              Crie sua conta<span className="text-pensi-yellow">.</span>
            </h1>
            <p className="text-[13px] font-light leading-relaxed text-gray-500 mb-6 max-w-[280px]">
              Leva menos de 2 minutos. Informe seus dados, escolha suas disciplinas e turmas, e comece a usar.
            </p>
            <RegisterProgress
              step={currentStepNumber}
              totalSteps={totalSteps}
              title={tituloEtapa}
            />
          </div>

          <div className="md:border-l-[2px] md:border-gray-100 md:pl-10">
            <AuthError>{erro}</AuthError>

            {baseStep === 1 && !googleUser && (
              <>
                <AuthGoogleButton onClick={handleGoogleLogin} loading={googleLoading} label="Cadastrar com o Google" />
                <AuthDivider label="ou use seu e-mail" />
              </>
            )}

            {googleUser && baseStep === 2 && (
              <RegisterGoogleBanner email={googleUser.email} />
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4">
              {baseStep === 1 && (
                <div className="space-y-4">
                  <AuthFormField id="register-nome" label="Nome completo" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Seu nome" icon={User} />
                  <AuthFormField id="register-email" label="E-mail institucional" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nome@pensi.com.br" icon={Mail} />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <AuthFormField id="register-senha" label="Senha" type={mostrarSenha ? "text" : "password"} value={senha} onChange={(e) => setSenha(e.target.value)} placeholder="••••••••" icon={Lock}
                      rightElement={<button type="button" onClick={() => setMostrarSenha(!mostrarSenha)} className="text-gray-400 hover:text-black transition-colors">{mostrarSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>} />
                    <AuthFormField id="register-senha2" label="Repetir" type={mostrarSenha2 ? "text" : "password"} value={senha2} onChange={(e) => setSenha2(e.target.value)} placeholder="••••••••" icon={ShieldCheck}
                      rightElement={<button type="button" onClick={() => setMostrarSenha2(!mostrarSenha2)} className="text-gray-400 hover:text-black transition-colors">{mostrarSenha2 ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>} />
                  </div>
                  <RegisterPasswordStrength senha={senha} />
                </div>
              )}

              {baseStep === 2 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <p className="text-[12px] text-gray-500">Marque todas as disciplinas que você leciona.</p>
                    <RegisterCountBadge count={disciplinas.length} singular="selecionada" plural="selecionadas" />
                  </div>
                  <RegisterSelectionGroup titulo="Disciplinas" icon={BookOpen}
                    items={disciplinasLista.map(([key, nome]) => ({ value: key, label: nome }))}
                    selecionados={disciplinas}
                    onToggle={(item) => toggleItem(setDisciplinas, item)}
                    altura="max-h-[320px]" />
                </div>
              )}

              {baseStep === 3 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <p className="text-[12px] text-gray-500">Marque todas as unidades em que você leciona.</p>
                    <RegisterCountBadge count={unidades.length} singular="selecionada" plural="selecionadas" />
                  </div>
                  <RegisterSelectionGroup titulo="Unidades" icon={MapPin}
                    items={UNIDADES.map((u) => ({ value: u, label: u }))}
                    selecionados={unidades}
                    onToggle={(item) => toggleItem(setUnidades, item)}
                    altura="max-h-[320px]" />
                </div>
              )}

              {baseStep === 4 && subStep === "serie" && parAtual && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <p className="text-[12px] text-gray-500">
                      Séries de <strong>{nomeDisciplina[parAtual.disciplina] || parAtual.disciplina}</strong> em <strong>{parAtual.unidade}</strong>.
                    </p>
                    <RegisterCountBadge count={selecaoAtual.series.length} singular="selecionada" plural="selecionadas" />
                  </div>
                  <RegisterSelectionGroup titulo="Séries" icon={GraduationCap}
                    items={seriesDoParAtual.map((s) => ({ value: s, label: s }))}
                    selecionados={selecaoAtual.series}
                    onToggle={toggleSerieDoPar}
                    altura="max-h-[320px]" />
                </div>
              )}

              {baseStep === 4 && subStep === "turma" && parAtual && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <p className="text-[12px] text-gray-500">
                      Turmas de <strong>{nomeDisciplina[parAtual.disciplina] || parAtual.disciplina}</strong> em <strong>{parAtual.unidade}</strong>.
                    </p>
                    <RegisterCountBadge count={selecaoAtual.turmas.length} singular="selecionada" plural="selecionadas" />
                  </div>
                  {turmasDoParAtual.length === 0 ? (
                    <p className="text-sm text-gray-500 italic">Nenhuma turma encontrada. Volte e ajuste as séries.</p>
                  ) : (
                    <RegisterSelectionGroup titulo="Turmas" icon={Users}
                      items={turmasDoParAtual.map((t) => ({ value: t.turma, label: t.turma }))}
                      selecionados={selecaoAtual.turmas}
                      onToggle={toggleTurmaDoPar}
                      altura="max-h-[320px]" />
                  )}
                </div>
              )}

              <div className="pt-2 space-y-2">
                {baseStep === 4 && subStep === "turma" && parIdx === pares.length - 1 ? (
                  <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 bg-[#171717] text-white border-[2px] border-black rounded-lg px-5 py-2.5 text-[13px] font-semibold shadow-[3px_3px_0px_0px_#F5C518] hover:bg-black hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_#F5C518] active:shadow-none active:translate-x-[3px] active:translate-y-[3px] transition-all disabled:opacity-60">
                    {loading ? (<><span className="w-4 h-4 border-[2px] border-white border-t-transparent rounded-full animate-spin" />Salvando...</>) : (<>Finalizar Cadastro <CheckCircle2 className="w-4 h-4" strokeWidth={2.5} /></>)}
                  </button>
                ) : (
                  <button type="submit" className="w-full flex items-center justify-center gap-2 bg-pensi-yellow text-black border-[2px] border-black rounded-lg px-5 py-2.5 text-[13px] font-semibold shadow-[3px_3px_0px_0px_#000] hover:bg-[#ffdb4d] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_#000] active:shadow-none active:translate-x-[3px] active:translate-y-[3px] transition-all">
                    Próximo passo <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
                  </button>
                )}

                {currentStepNumber > 1 && (
                  <button type="button" onClick={voltar} className="w-full py-1 text-[11px] font-medium text-gray-500 hover:text-black transition-colors">
                    Voltar para o passo anterior
                  </button>
                )}
              </div>
            </form>

            {baseStep === 1 && (
              <div className="mt-5 text-center pt-4 border-t-[1px] border-gray-100">
                <p className="text-[11px] font-normal text-gray-500">
                  Já tem uma conta?{" "}
                  <button type="button" onClick={() => onNavigate("login")} className="font-semibold text-black underline decoration-pensi-yellow decoration-2 underline-offset-4 hover:decoration-black transition-colors">
                    Fazer login
                  </button>
                </p>
              </div>
            )}
          </div>
        </div>
      </AuthCard>
    </main>
  );
}