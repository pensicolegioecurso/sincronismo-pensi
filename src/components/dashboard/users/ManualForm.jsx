import { useState, useMemo } from "react";
import { salvarUsuarioComCPF, verificarCPFDisponivel } from "../../../services/cpfService";
import { criarUsuarioSecundario } from "../../../services/criarUsuarioSecundario";
import { useMaterias } from "../../../hooks/useMaterias";
import { useTurmas } from "../../../hooks/useTurmas";
import { useUnidades } from "../../../hooks/useUnidades";
import { Mail, Lock, User, MapPin, CreditCard, CheckCircle2 } from "lucide-react";
import { inputClass, labelClass, btnPrimary, btnSecondary, optionClass, chipClass, panelClass } from "./ui";

const CARGOS_ATRIBUIVEIS = [
  { id: "diretor", label: "Diretor" },
  { id: "coordenador", label: "Coordenador" },
  { id: "nucleo", label: "Núcleo" },
  { id: "regional", label: "Regional" },
  { id: "professor", label: "Professor" },
];

const DOMINIO_PERMITIDO = import.meta.env.VITE_DOMINIO_PERMITIDO || "@pensi.com.br";

function validarEmail(email) {
  const dominio = DOMINIO_PERMITIDO.replace(/^@/, "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`^[^\\s@]+@${dominio}$`, "i").test(email.trim());
}

function validarCPF(valor) {
  const cpf = valor.replace(/\D/g, "");
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

function formatarCPF(valor) {
  return valor
    .replace(/\D/g, "")
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

export default function ManualForm({ onClose, onSuccess, perfilAtivo, unidadesEscopo, setErro }) {
  const { materias } = useMaterias();
  const { todasUnidades } = useUnidades();
  const { getSeriesPorUnidades, getTurmasPorUnidadesESeries } = useTurmas({ somenteAtivas: true });

  const [step, setStep] = useState(1);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [cpf, setCpf] = useState("");
  const [cargos, setCargos] = useState(["professor"]);
  const [disciplinas, setDisciplinas] = useState([]);
  const [unidades, setUnidades] = useState([]);
  const [selecoesPorPar, setSelecoesPorPar] = useState({});
  const [loading, setLoading] = useState(false);

  const cargosLogado = [
    ...(Array.isArray(perfilAtivo?.cargos) ? perfilAtivo.cargos : []),
    perfilAtivo?.cargo,
    ...(typeof perfilAtivo === "string" ? [perfilAtivo] : []),
  ].filter(Boolean).map((cargo) => String(cargo).toLowerCase().trim());
  const ehRegionalLogado = cargosLogado.includes("regional");
  const ehDiretorOuCoordenadorLogado = cargosLogado.some((cargo) => ["diretor", "direcao", "coordenador"].includes(cargo));

  const unidadesDoEscopo = useMemo(() => {
    if (Array.isArray(unidadesEscopo)) return unidadesEscopo;
    if (typeof unidadesEscopo === "string") {
      return unidadesEscopo.split(",").map((u) => u.trim()).filter(Boolean);
    }
    return [];
  }, [unidadesEscopo]);

  const unidadesDisponiveis = ehRegionalLogado
    ? todasUnidades.filter((u) => unidadesDoEscopo.includes(u))
    : todasUnidades;

  const cargosPermitidos = ehDiretorOuCoordenadorLogado
    ? [{ id: "professor", label: "Professor" }]
    : ehRegionalLogado
      ? CARGOS_ATRIBUIVEIS.filter((cargo) => ["diretor", "coordenador", "professor"].includes(cargo.id))
      : CARGOS_ATRIBUIVEIS;

  const disciplinasLista = useMemo(() => materias.map((item) => [item.key, item.nome]), [materias]);

  const precisaDisciplinas = cargos.includes("professor");
  const ehRegional = cargos.includes("regional");
  const ehNucleo = cargos.includes("nucleo");

  // Diretor e coordenador usam automaticamente a própria unidade.
  const unidadesEfetivas = ehDiretorOuCoordenadorLogado ? unidadesDoEscopo : ehNucleo ? [] : unidades;

  // Núcleo não precisa atribuir unidade ao usuário cadastrado.
  const precisaSelecionarUnidade = !ehDiretorOuCoordenadorLogado && !ehNucleo;

  const pares = useMemo(() => {
    if (!precisaDisciplinas) return [];
    const lista = [];
    disciplinas.forEach((disciplina) => {
      unidadesEfetivas.forEach((unidade) => lista.push({ disciplina, unidade }));
    });
    return lista;
  }, [disciplinas, unidadesEfetivas, precisaDisciplinas]);

  // Ordem real das etapas conforme o perfil (corrige "Etapa 4 de 3" e o botão Voltar)
  const ordem = ehDiretorOuCoordenadorLogado
    ? [1, 4, ...(pares.length > 0 ? [5] : [])]
    : ehNucleo
      ? [1, 2, ...(precisaDisciplinas ? [4] : [])]
      : [1, 2, 3, ...(precisaDisciplinas ? [4, 5] : [])];

  const totalEtapas = ordem.length;
  const etapaAtual = Math.max(1, ordem.indexOf(step) + 1);
  const ehUltimaEtapa = step === ordem[ordem.length - 1];

  const toggleItem = (setList, item) =>
    setList((prev) => (prev.includes(item) ? prev.filter((v) => v !== item) : [...prev, item]));

  const setSelecao = (chave, valor) => setSelecoesPorPar((prev) => ({ ...prev, [chave]: valor }));

  const voltar = () => {
    const idx = ordem.indexOf(step);
    if (idx > 0) setStep(ordem[idx - 1]);
    else onClose();
  };

  const handleSubmitManual = async () => {
    setLoading(true);
    setErro("");

    try {
      const emailNormalizado = email.trim().toLowerCase();
      const cpfNormalizado = cpf.replace(/\D/g, "");

      if (ehDiretorOuCoordenadorLogado && unidadesEfetivas.length === 0) {
        throw new Error("Não foi possível identificar a unidade do Diretor/Coordenador.");
      }

      await verificarCPFDisponivel(cpfNormalizado, { permitirPreCadastro: true });

      const novoUid = await criarUsuarioSecundario(emailNormalizado, senha);

      const turmasPorUnidade = {};
      const todasSeries = new Set();

      Object.entries(selecoesPorPar).forEach(([chave, selecao]) => {
        const partes = chave.split("|");
        const unidade = partes.slice(1).join("|");

        if (!turmasPorUnidade[unidade]) turmasPorUnidade[unidade] = [];

        (selecao.turmas || []).forEach((turma) => {
          if (!turmasPorUnidade[unidade].includes(turma)) turmasPorUnidade[unidade].push(turma);
        });

        (selecao.series || []).forEach((serie) => todasSeries.add(serie));
      });

      const turmasString = Object.entries(turmasPorUnidade)
        .filter(([, turmas]) => turmas.length > 0)
        .map(([unidade, turmas]) => `${unidade}: ${turmas.join(", ")}`)
        .join(" | ");

      const payload = {
        nome: nome.trim(),
        email: emailNormalizado,
        cpf: cpfNormalizado,
        cargos: ehDiretorOuCoordenadorLogado ? ["professor"] : cargos,
        disciplinas: precisaDisciplinas ? disciplinas : [],
        unidade: unidadesEfetivas.join(","),
        series: precisaDisciplinas ? [...todasSeries].join(",") : "",
        turmas: precisaDisciplinas ? turmasString : "",
        unidadesComando: ehRegional ? unidadesEfetivas : [],
        unidadesInativas: [],
        turmasInativas: [],
        origem: "cadastro-manual",
        primeiroAcessoConcluido: false,
        criadoEm: new Date(),
        status: "Ativo",
      };

      await salvarUsuarioComCPF(novoUid, payload, "cadastro-manual");

      onSuccess?.();
    } catch (err) {
      console.error("Erro ao cadastrar usuário:", err);

      if (err.code === "cpf/ja-vinculado") setErro("Este CPF já está vinculado a outro usuário.");
      else if (err.code === "cpf/ja-cadastrado") setErro("Este CPF já está cadastrado.");
      else if (err.code === "cpf/invalido") setErro("O CPF informado é inválido.");
      else if (err.code === "auth/email-already-in-use") setErro("Este e-mail já está cadastrado.");
      else if (err.code === "auth/weak-password") setErro("A senha deve ter pelo menos 6 caracteres.");
      else if (err.code === "permission-denied") setErro("Você não tem permissão para cadastrar este usuário.");
      else setErro(err.message || "Não foi possível cadastrar. Verifique os dados e tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const avancar = () => {
    setErro("");

    if (step === 1) {
      if (!nome.trim() || !email.trim() || !senha || !cpf.trim()) {
        return setErro("Preencha todos os campos obrigatórios.");
      }
      if (!validarEmail(email)) return setErro(`Use um e-mail válido com o domínio ${DOMINIO_PERMITIDO}.`);
      if (senha.length < 6) return setErro("A senha deve ter no mínimo 6 caracteres.");
      if (!validarCPF(cpf)) return setErro("O CPF informado é inválido. Confira os números.");

      if (ehDiretorOuCoordenadorLogado) {
        if (unidadesDoEscopo.length === 0) return setErro("Não foi possível identificar a unidade do seu perfil.");
        setCargos(["professor"]);
        setUnidades(unidadesDoEscopo);
        setStep(4);
        return;
      }

      setStep(2);
      return;
    }

    if (step === 2) {
      if (cargos.length === 0) return setErro("Selecione ao menos um cargo.");

      if (ehNucleo) {
        if (precisaDisciplinas) setStep(4);
        else handleSubmitManual();
        return;
      }

      setStep(3);
      return;
    }

    if (step === 3) {
      if (unidades.length === 0) return setErro("Selecione ao menos uma unidade.");

      if (precisaDisciplinas) setStep(4);
      else handleSubmitManual();
      return;
    }

    if (step === 4) {
      if (disciplinas.length === 0) return setErro("Selecione ao menos uma disciplina.");

      if (pares.length === 0) {
        handleSubmitManual();
        return;
      }

      setStep(5);
      return;
    }

    if (step === 5) {
      for (const par of pares) {
        const chave = `${par.disciplina}|${par.unidade}`;
        const selecao = selecoesPorPar[chave];

        if (!selecao || !selecao.series?.length || !selecao.turmas?.length) {
          return setErro(`Preencha séries e turmas de ${par.disciplina} em ${par.unidade}.`);
        }
      }

      handleSubmitManual();
    }
  };

  const titulos = { 1: "Dados pessoais", 2: "Cargos e acessos", 3: "Unidade(s) de atuação", 4: "Disciplinas lecionadas", 5: "Séries e turmas" };
  const descricoes = {
    1: "Informe os dados de identificação e acesso do usuário.",
    2: "Selecione os cargos que serão atribuídos ao usuário.",
    3: "Selecione ao menos uma unidade para vincular ao usuário.",
    4: "Selecione as disciplinas vinculadas ao professor.",
    5: "Configure as séries e turmas de cada disciplina e unidade.",
  };

  return (
    <div className="space-y-5">
      {/* Progresso */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
            Etapa {etapaAtual} de {totalEtapas}
          </p>
          <div className="mt-2 flex gap-1">
            {Array.from({ length: totalEtapas }).map((_, index) => (
              <span
                key={index}
                className={`h-1.5 w-8 rounded-full ${index < etapaAtual ? "bg-pensi-yellow" : "bg-gray-200"}`}
              />
            ))}
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-black uppercase text-gray-900">{titulos[step]}</h3>
        <p className="mt-1 text-xs text-gray-500">{descricoes[step]}</p>
      </div>

      {step === 1 && (
        <div className="animate-fade-in space-y-4">
          <div>
            <label className={labelClass}>Nome completo *</label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className={`${inputClass} pl-10`}
                placeholder="Nome completo do usuário"
                autoComplete="name"
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>E-mail institucional *</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`${inputClass} pl-10`}
                placeholder="nome@pensi.com.br"
                autoComplete="email"
              />
            </div>
            <p className="mt-1 text-[11px] font-medium text-gray-400">
              Apenas e-mails institucionais {DOMINIO_PERMITIDO}.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className={labelClass}>CPF *</label>
              <div className="relative">
                <CreditCard className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  value={cpf}
                  onChange={(e) => setCpf(formatarCPF(e.target.value))}
                  className={`${inputClass} pl-10`}
                  placeholder="000.000.000-00"
                  inputMode="numeric"
                  maxLength={14}
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>Senha inicial *</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  type="password"
                  className={`${inputClass} pl-10`}
                  placeholder="Mínimo 6 caracteres"
                  autoComplete="new-password"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-sky-100 bg-sky-50 p-3">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-sky-700" />
            <p className="text-[11px] font-bold text-sky-900">
              O CPF será validado antes de avançar e salvo no cadastro do usuário.
            </p>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="animate-fade-in grid grid-cols-1 gap-2 sm:grid-cols-2">
          {cargosPermitidos.map((cargo) => (
            <label key={cargo.id} className={optionClass(cargos.includes(cargo.id))}>
              <input
                type="checkbox"
                checked={cargos.includes(cargo.id)}
                onChange={() => toggleItem(setCargos, cargo.id)}
                className="h-4 w-4 accent-black"
              />
              <span className="text-sm font-bold text-gray-900">{cargo.label}</span>
            </label>
          ))}
        </div>
      )}

      {step === 3 && precisaSelecionarUnidade && (
        <div className="animate-fade-in space-y-3">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {unidadesDisponiveis.map((unidade) => (
              <label key={unidade} className={optionClass(unidades.includes(unidade))}>
                <input
                  type="checkbox"
                  checked={unidades.includes(unidade)}
                  onChange={() => toggleItem(setUnidades, unidade)}
                  className="h-4 w-4 accent-black"
                />
                <MapPin className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                <span className="text-xs font-bold text-gray-900">{unidade}</span>
              </label>
            ))}
          </div>

          {unidadesDisponiveis.length === 0 && (
            <p className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-bold text-rose-700">
              Nenhuma unidade disponível para seleção.
            </p>
          )}

          <p className="text-[11px] font-semibold text-gray-400">{unidades.length} unidade(s) selecionada(s).</p>
        </div>
      )}

      {step === 4 && (
        <div className="animate-fade-in grid max-h-[320px] grid-cols-2 gap-2 overflow-y-auto p-1 sm:grid-cols-3">
          {disciplinasLista.map(([key, nomeDisciplina]) => (
            <label key={key} className={optionClass(disciplinas.includes(key))}>
              <input
                type="checkbox"
                checked={disciplinas.includes(key)}
                onChange={() => toggleItem(setDisciplinas, key)}
                className="h-3.5 w-3.5 accent-black"
              />
              <span className="truncate text-[11px] font-bold text-gray-900">{nomeDisciplina}</span>
            </label>
          ))}
        </div>
      )}

      {step === 5 && (
        <div className="animate-fade-in space-y-3">
          {pares.map(({ disciplina, unidade }) => {
            const chave = `${disciplina}|${unidade}`;
            const selecao = selecoesPorPar[chave] || { series: [], turmas: [] };
            const seriesDisponiveis = getSeriesPorUnidades([unidade]);
            const turmasDisponiveis = getTurmasPorUnidadesESeries([unidade], selecao.series);

            return (
              <div key={chave} className={panelClass}>
                <div className="mb-3 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-xs font-black uppercase text-gray-900">{disciplina}</p>
                    <p className="truncate text-[10px] font-bold uppercase text-gray-400">{unidade}</p>
                  </div>
                  <MapPin className="h-4 w-4 shrink-0 text-gray-300" />
                </div>

                <p className="mb-2 text-[10px] font-black uppercase tracking-wider text-gray-500">Séries</p>
                <div className="mb-4 flex flex-wrap gap-1.5">
                  {seriesDisponiveis.map((serie) => (
                    <button
                      key={serie}
                      type="button"
                      onClick={() => {
                        const novasSeries = selecao.series.includes(serie)
                          ? selecao.series.filter((i) => i !== serie)
                          : [...selecao.series, serie];

                        const turmasValidas = getTurmasPorUnidadesESeries([unidade], novasSeries).map((t) => t.turma);
                        const novasTurmas = selecao.turmas.filter((t) => turmasValidas.includes(t));

                        setSelecao(chave, { series: novasSeries, turmas: novasTurmas });
                      }}
                      className={chipClass(selecao.series.includes(serie))}
                    >
                      {serie}
                    </button>
                  ))}
                </div>

                <p className="mb-2 text-[10px] font-black uppercase tracking-wider text-gray-500">Turmas</p>
                <div className="flex flex-wrap gap-1.5">
                  {turmasDisponiveis.length === 0 ? (
                    <span className="text-[11px] italic text-gray-400">Selecione as séries primeiro.</span>
                  ) : (
                    turmasDisponiveis.map((turma) => (
                      <button
                        key={turma.turma}
                        type="button"
                        onClick={() => {
                          const novasTurmas = selecao.turmas.includes(turma.turma)
                            ? selecao.turmas.filter((i) => i !== turma.turma)
                            : [...selecao.turmas, turma.turma];
                          setSelecao(chave, { ...selecao, turmas: novasTurmas });
                        }}
                        className={chipClass(selecao.turmas.includes(turma.turma))}
                      >
                        {turma.turma}
                      </button>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="flex gap-3 border-t border-gray-100 pt-4">
        <button type="button" onClick={voltar} disabled={loading} className={`${btnSecondary} flex-1`}>
          {step > 1 ? "Voltar" : "Cancelar"}
        </button>

        <button type="button" onClick={avancar} disabled={loading} className={`${btnPrimary} flex-1`}>
          {loading ? "Processando..." : ehUltimaEtapa ? "Finalizar cadastro" : "Próximo"}
        </button>
      </div>
    </div>
  );
}
