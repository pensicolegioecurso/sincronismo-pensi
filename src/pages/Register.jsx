import { useState, useMemo } from "react";
import { useAuth } from "../hooks/useAuth";
import { DISCIPLINAS_POR_ANO } from "../data/disciplinas";
import { UNIDADES } from "../data/unidades";
import { validarEmailInstitucional } from "../utils/validators";
import {
  Mail,
  Lock,
  User,
  ArrowRight,
  ArrowLeft,
  Eye,
  EyeOff,
  BookOpen,
  MapPin,
  Users,
  Check,
  ShieldCheck,
  X,
  CheckCircle2,
} from "lucide-react";

const TURMAS_TESTE = [
  "6º Ano A", "6º Ano B", "7º Ano A", "7º Ano B", 
  "8º Ano A", "8º Ano B", "9º Ano A", "9º Ano B",
  "1ª Série A", "2ª Série A", "3ª Série A",
];

const inputClass = `
  w-full bg-white border-[2px] border-gray-300 rounded-lg
  py-2 text-[13px] text-gray-900 placeholder:text-gray-400
  outline-none focus:border-black focus:bg-white
  focus:shadow-[3px_3px_0px_0px_#F5C518] transition-all duration-200
`;

const labelClass = "block text-[11px] font-medium text-gray-800 mb-1";

export default function Register({ onNavigate }) {
  const { register } = useAuth();
  const [step, setStep] = useState(1);

  // Form states
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [senha2, setSenha2] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarSenha2, setMostrarSenha2] = useState(false);
  const [disciplinas, setDisciplinas] = useState([]);
  const [unidades, setUnidades] = useState([]);
  const [turmas, setTurmas] = useState([]);
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

  // Requisitos da senha
  const temMinLength = senha.length >= 8;
  const temMaiuscula = /[A-Z]/.test(senha);
  const temMinuscula = /[a-z]/.test(senha);
  const temNumero = /[0-9]/.test(senha);
  const temEspecial = /[^A-Za-z0-9]/.test(senha);
  const reqAtendidos = [temMinLength, temMaiuscula, temMinuscula, temNumero, temEspecial].filter(Boolean).length;

  let forcaSenha = 0;
  if (senha.length > 0) {
    if (reqAtendidos <= 2) forcaSenha = 1;
    else if (reqAtendidos <= 4) forcaSenha = 2;
    else forcaSenha = 3;
  }

  const corForca = ["bg-gray-200", "bg-red-500", "bg-amber-400", "bg-green-500"][forcaSenha];
  const textoForca = ["", "Fraca", "Média", "Forte"][forcaSenha];

  const disciplinasLista = useMemo(() => {
    const todas = Object.values(DISCIPLINAS_POR_ANO).reduce((acc, ano) => {
      Object.entries(ano).forEach(([key, value]) => { acc[key] = value.nome; });
      return acc;
    }, {});
    return Object.entries(todas).sort((a, b) => a[1].localeCompare(b[1], "pt-BR"));
  }, []);

  const toggleItem = (setList, item) => {
    setList((prev) => prev.includes(item) ? prev.filter((v) => v !== item) : [...prev, item]);
  };

  const avancar = () => {
    setErro("");
    if (step === 1) {
      if (!nome.trim() || !email.trim() || !senha || !senha2) return setErro("Preencha todos os campos.");
      if (!validarEmailInstitucional(email.trim())) return setErro("E-mail institucional inválido.");
      if (senha !== senha2) return setErro("As senhas não coincidem.");
      if (reqAtendidos < 5) return setErro("A senha não atende a todos os requisitos.");
      setStep(2);
    } else if (step === 2) {
      if (disciplinas.length === 0) return setErro("Selecione ao menos uma disciplina.");
      if (unidades.length === 0) return setErro("Selecione ao menos uma unidade.");
      setStep(3);
    }
  };

  const voltar = () => {
    setErro("");
    if (step > 1) setStep((prev) => prev - 1);
    else onNavigate("home");
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setErro("");
    if (step !== 3) return;
    if (turmas.length === 0) return setErro("Selecione pelo menos uma turma.");

    setLoading(true);
    try {
      const res = await register({
        nome: nome.trim(),
        email: email.trim().toLowerCase(),
        senha,
        disciplinas,
        unidade: unidades.join(","),
        turmas: turmas.join(","),
      });
      if (res.ok) onNavigate("home");
      else setErro(res.message || "Não foi possível criar a conta.");
    } catch {
      setErro("Ocorreu um erro ao criar a conta. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  const handleGoogleLogin = () => {
    alert("Login com Google será implementado em breve!");
  };

  const etapas = [
    { titulo: "Seus dados", desc: "Comece informando seu nome, e-mail institucional e crie uma senha segura.", Icone: User },
    { titulo: "Disciplinas e unidades", desc: "Selecione as matérias que você leciona e em quais unidades.", Icone: BookOpen },
    { titulo: "Suas turmas", desc: "Por fim, marque quais turmas estão sob sua regência.", Icone: Users },
  ];

  const EtapaIcone = etapas[step - 1].Icone;

  return (
    /* Fundo padrão sem blobs */
    <main className="relative min-h-screen flex items-center justify-center bg-[#f3f4f6] px-4 sm:px-6 py-6">
      
      {/* Botão Voltar */}
      <button
        type="button"
        onClick={voltar}
        className="absolute top-6 left-6 sm:top-8 sm:left-8 z-30 inline-flex items-center gap-2 text-[#171717] text-[12px] font-medium bg-white border-[2px] border-black rounded-lg px-4 py-2 shadow-[3px_3px_0px_0px_#000] hover:bg-gray-50 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all duration-150"
      >
        <ArrowLeft className="w-4 h-4" strokeWidth={2.5} />
        {step === 1 ? "Voltar" : "Voltar Etapa"}
      </button>

      {/* CARD PRINCIPAL - Layout Deitado */}
      <div className="relative z-10 w-full max-w-[850px] bg-white border-[3px] border-black rounded-2xl shadow-[8px_8px_0px_0px_#000] px-8 py-8 sm:px-10 sm:py-10">
        
        {/* Pontinhos decorativos */}
        <div className="absolute top-5 left-6 flex items-center gap-1.5" aria-hidden="true">
          <span className="w-2.5 h-2.5 rounded-full bg-pensi-yellow border border-black/30" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#D8E8FF] border border-black/30" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#F8DCEB] border border-black/30" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_1.5fr] gap-8 md:gap-12 items-start mt-4">
          
          {/* LADO ESQUERDO: Progresso, Ícone e Textos */}
          <div className="flex flex-col items-start text-left h-full pt-2">
            
            <div className="w-12 h-12 flex items-center justify-center bg-pensi-yellow border-[2px] border-black rounded-full shadow-[3px_3px_0px_0px_#000] mb-6">
              <EtapaIcone className="w-5 h-5 text-black" strokeWidth={2.5} />
            </div>

            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight leading-tight text-gray-900 mb-3">
              Crie sua conta<span className="text-pensi-yellow">.</span>
            </h1>
            
            <p className="text-[13px] font-light leading-relaxed text-gray-500 mb-6 max-w-[280px]">
              {etapas[step - 1].desc}
            </p>

            {/* Barra de Progresso */}
            <div className="mt-auto w-full max-w-[240px]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Passo {step} de 3</span>
                <span className="text-[10px] font-bold text-gray-500">{etapas[step - 1].titulo}</span>
              </div>
              <div className="flex items-center gap-1.5 w-full">
                {[1, 2, 3].map((numero) => (
                  <div key={numero} className={`h-1.5 flex-1 rounded-full transition-colors ${step >= numero ? "bg-pensi-yellow" : "bg-gray-200"}`} />
                ))}
              </div>
            </div>
          </div>

          {/* LADO DIREITO: Formulário */}
          <div className="md:border-l-[2px] md:border-gray-100 md:pl-10">
            
            {erro && (
              <div role="alert" className="mb-4 bg-red-50 border-[2px] border-black rounded-lg px-3 py-2 text-[11px] font-medium text-red-700">
                {erro}
              </div>
            )}

            {/* BOTÃO GOOGLE (Apenas no Passo 1) */}
            {step === 1 && (
              <>
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  className="w-full flex items-center justify-center gap-2 bg-white text-gray-800 border-[2px] border-black rounded-lg px-4 py-2.5 mb-4 text-[13px] font-medium shadow-[3px_3px_0px_0px_#000] hover:bg-gray-50 hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_#000] active:shadow-none active:translate-x-[3px] active:translate-y-[3px] transition-all duration-150"
                >
                  <svg className="w-[16px] h-[16px]" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  Cadastrar com o Google
                </button>
                
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-1 h-[1px] bg-gray-200"></div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">ou use seu e-mail</span>
                  <div className="flex-1 h-[1px] bg-gray-200"></div>
                </div>
              </>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* ETAPA 1: DADOS */}
              {step === 1 && (
                <div className="space-y-4">
                  <div>
                    <label htmlFor="register-nome" className={labelClass}>Nome completo</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" strokeWidth={2} />
                      <input
                        id="register-nome"
                        type="text"
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                        placeholder="Seu nome"
                        className={`${inputClass} pl-9 pr-4`}
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="register-email" className={labelClass}>E-mail institucional</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" strokeWidth={2} />
                      <input
                        id="register-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="nome@pensi.com.br"
                        className={`${inputClass} pl-9 pr-4`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="register-senha" className={labelClass}>Senha</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" strokeWidth={2} />
                        <input
                          id="register-senha"
                          type={mostrarSenha ? "text" : "password"}
                          value={senha}
                          onChange={(e) => setSenha(e.target.value)}
                          placeholder="••••••••"
                          className={`${inputClass} pl-9 pr-9`}
                        />
                        <button
                          type="button"
                          onClick={() => setMostrarSenha(!mostrarSenha)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors"
                        >
                          {mostrarSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label htmlFor="register-senha2" className={labelClass}>Repetir</label>
                      <div className="relative">
                        <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" strokeWidth={2} />
                        <input
                          id="register-senha2"
                          type={mostrarSenha2 ? "text" : "password"}
                          value={senha2}
                          onChange={(e) => setSenha2(e.target.value)}
                          placeholder="••••••••"
                          className={`${inputClass} pl-9 pr-9`}
                        />
                        <button
                          type="button"
                          onClick={() => setMostrarSenha2(!mostrarSenha2)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors"
                        >
                          {mostrarSenha2 ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Força da senha */}
                  {senha.length > 0 && (
                    <div className="bg-gray-50 border-[2px] border-gray-200 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold text-gray-600">Força da senha</span>
                        <span className="text-[10px] font-bold text-gray-600">{textoForca}</span>
                      </div>
                      <div className="flex gap-1 mb-3">
                        {[1, 2, 3].map((n) => (
                          <div key={n} className={`h-1 flex-1 rounded-full ${forcaSenha >= n ? corForca : "bg-gray-300"}`} />
                        ))}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        <Requisito ok={temMinLength} texto="8+ caracteres" />
                        <Requisito ok={temMaiuscula} texto="Letra maiúscula" />
                        <Requisito ok={temMinuscula} texto="Letra minúscula" />
                        <Requisito ok={temNumero} texto="Número" />
                        <Requisito ok={temEspecial} texto="Símbolo especial" />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ETAPA 2: DISCIPLINAS E UNIDADES */}
              {step === 2 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <p className="text-[12px] text-gray-500">Selecione o que se aplica a você.</p>
                    <div className="flex gap-2">
                      <span className="text-[10px] font-bold text-black bg-pensi-yellow/30 px-2 py-0.5 rounded">{disciplinas.length} Disc.</span>
                      <span className="text-[10px] font-bold text-black bg-pensi-yellow/30 px-2 py-0.5 rounded">{unidades.length} Unid.</span>
                    </div>
                  </div>

                  <GrupoSelecao
                    titulo="Disciplinas"
                    Icone={BookOpen}
                    items={disciplinasLista.map(([key, nome]) => ({ value: key, label: nome }))}
                    selecionados={disciplinas}
                    onToggle={(item) => toggleItem(setDisciplinas, item)}
                    altura="max-h-[140px]"
                  />
                  
                  <GrupoSelecao
                    titulo="Unidades"
                    Icone={MapPin}
                    items={UNIDADES.map((u) => ({ value: u, label: u }))}
                    selecionados={unidades}
                    onToggle={(item) => toggleItem(setUnidades, item)}
                    altura="max-h-[140px]"
                  />
                </div>
              )}

              {/* ETAPA 3: TURMAS */}
              {step === 3 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <p className="text-[12px] text-gray-500">Quais turmas você leciona?</p>
                    <span className="text-[10px] font-bold text-black bg-pensi-yellow/30 px-2 py-0.5 rounded">{turmas.length} selecionadas</span>
                  </div>

                  <GrupoSelecao
                    titulo="Turmas"
                    Icone={Users}
                    items={TURMAS_TESTE.map((t) => ({ value: t, label: t }))}
                    selecionados={turmas}
                    onToggle={(item) => toggleItem(setTurmas, item)}
                    altura="max-h-[220px]"
                  />
                  <p className="text-[10px] text-gray-400 italic">* Dados de teste. As turmas serão integradas em breve.</p>
                </div>
              )}

              {/* BOTÕES DE AÇÃO */}
              <div className="pt-2 space-y-2">
                {step < 3 ? (
                  <button
                    type="button"
                    onClick={avancar}
                    className="w-full flex items-center justify-center gap-2 bg-pensi-yellow text-black border-[2px] border-black rounded-lg px-5 py-2.5 text-[13px] font-semibold shadow-[3px_3px_0px_0px_#000] hover:bg-[#ffdb4d] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_#000] active:shadow-none active:translate-x-[3px] active:translate-y-[3px] transition-all"
                  >
                    Próximo passo
                    <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 bg-[#171717] text-white border-[2px] border-black rounded-lg px-5 py-2.5 text-[13px] font-semibold shadow-[3px_3px_0px_0px_#F5C518] hover:bg-black hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_#F5C518] active:shadow-none active:translate-x-[3px] active:translate-y-[3px] transition-all disabled:opacity-60"
                  >
                    {loading ? (
                      <>
                        <span className="w-4 h-4 border-[2px] border-white border-t-transparent rounded-full animate-spin" />
                        Criando conta...
                      </>
                    ) : (
                      <>
                        Finalizar Cadastro
                        <CheckCircle2 className="w-4 h-4" strokeWidth={2.5} />
                      </>
                    )}
                  </button>
                )}

                {step > 1 && (
                  <button
                    type="button"
                    onClick={voltar}
                    className="w-full py-1 text-[11px] font-medium text-gray-500 hover:text-black transition-colors"
                  >
                    Voltar para o passo anterior
                  </button>
                )}
              </div>
            </form>

            {/* Link para Login */}
            {step === 1 && (
              <div className="mt-5 text-center pt-4 border-t-[1px] border-gray-100">
                <p className="text-[11px] font-normal text-gray-500">
                  Já tem uma conta?{" "}
                  <button
                    type="button"
                    onClick={() => onNavigate("login")}
                    className="font-semibold text-black underline decoration-pensi-yellow decoration-2 underline-offset-4 hover:decoration-black transition-colors"
                  >
                    Fazer login
                  </button>
                </p>
              </div>
            )}
          </div>

        </div>
      </div>
    </main>
  );
}

function GrupoSelecao({ titulo, Icone, items, selecionados, onToggle, altura = "max-h-48" }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-1.5">
        <Icone className="w-3.5 h-3.5 text-gray-800" strokeWidth={2} />
        <h2 className="text-[11px] font-medium text-gray-800">{titulo}</h2>
      </div>
      <div className={`grid grid-cols-1 sm:grid-cols-2 gap-1.5 ${altura} overflow-y-auto p-2 bg-gray-50 border-[2px] border-gray-200 rounded-lg`}>
        {items.map(({ value, label }) => {
          const selecionado = selecionados.includes(value);
          return (
            <button
              key={value}
              type="button"
              onClick={() => onToggle(value)}
              className={`flex items-center justify-between gap-2 px-2 py-1.5 border-[1.5px] rounded-md text-[11px] font-medium text-left transition-colors ${
                selecionado
                  ? "bg-pensi-yellow border-black text-black"
                  : "bg-white border-gray-200 text-gray-600 hover:border-black"
              }`}
            >
              <span className="truncate">{label}</span>
              <span className={`w-3.5 h-3.5 shrink-0 flex items-center justify-center border rounded-sm ${selecionado ? "bg-black border-black" : "bg-white border-gray-300"}`}>
                {selecionado && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Requisito({ ok, texto }) {
  return (
    <div className={`flex items-center gap-1 text-[10px] font-medium ${ok ? "text-green-700" : "text-gray-400"}`}>
      {ok ? <CheckCircle2 className="w-3 h-3 shrink-0" strokeWidth={2.5} /> : <X className="w-3 h-3 shrink-0 opacity-50" strokeWidth={2.5} />}
      <span>{texto}</span>
    </div>
  );
}