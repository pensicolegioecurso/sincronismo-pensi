
import { useState, useEffect, useMemo } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../services/firebase";
import { getRegionalDaUnidade } from "../../data/unidades";
import { parseTurmasPorUnidade } from "../../utils/turmas";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import OverviewReportsModal from "./overview/OverviewReportsModal";

import OverviewHeader from "./overview/OverviewHeader";
import OverviewFilters from "./overview/OverviewFilters";
import OverviewSummary from "./overview/OverviewSummary";
import OverviewUnits from "./overview/OverviewUnits";
import UnitDetailsModal from "./overview/UnitDetailsModal";
import OverviewTeacherRanking from "./overview/OverviewTeacherRanking";


function normalizarTexto(valor) {
  return String(valor || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}

function dataLocalString(data) {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

function converterData(valor) {
  if (!valor) return null;

  if (valor?.toDate) {
    const data = valor.toDate();
    data.setHours(0, 0, 0, 0);
    return data;
  }

  if (valor instanceof Date) {
    const data = new Date(valor);
    data.setHours(0, 0, 0, 0);
    return data;
  }

  if (typeof valor === "string" && /^\d{4}-\d{2}-\d{2}$/.test(valor)) {
    const [ano, mes, dia] = valor.split("-").map(Number);
    return new Date(ano, mes - 1, dia);
  }

  const data = new Date(valor);

  if (Number.isNaN(data.getTime())) return null;

  data.setHours(0, 0, 0, 0);
  return data;
}

function gerarDiasUteis(dataInicio, dataFim) {
  const dias = [];
  const atual = new Date(dataInicio);
  const fim = new Date(dataFim);

  atual.setHours(12, 0, 0, 0);
  fim.setHours(12, 0, 0, 0);

  while (atual <= fim) {
    const diaSemana = atual.getDay();

    if (diaSemana !== 0 && diaSemana !== 6) {
      dias.push(dataLocalString(atual));
    }

    atual.setDate(atual.getDate() + 1);
  }

  return dias;
}

function formatarData(data) {
  if (!data) return "";

  const [ano, mes, dia] = data.split("-");
  return `${dia}/${mes}/${ano}`;
}

function mesmaUnidade(a, b) {
  const primeira = normalizarTexto(a);
  const segunda = normalizarTexto(b);

  return Boolean(primeira && segunda && primeira === segunda);
}

function obterUnidadesDoCampo(valor) {
  if (Array.isArray(valor)) {
    return valor
      .flatMap((item) => obterUnidadesDoCampo(item))
      .filter(Boolean);
  }

  if (typeof valor === "string") {
    return valor.split(",").map((item) => item.trim()).filter(Boolean);
  }

  return [];
}

function unidadeEstaNoEscopo(unidade, escopo = []) {
  return escopo.some((item) => mesmaUnidade(item, unidade));
}

function usuarioPossuiUnidade(usuario, unidade) {
  return obterUnidadesDoCampo(usuario?.unidade).some((item) =>
    mesmaUnidade(item, unidade)
  );
}

function obterRegionalDaLista(unidade, regionais) {
  const regionalEncontrada = regionais.find((regional) =>
    (regional.unidadesComando || []).some((uni) =>
      mesmaUnidade(uni, unidade)
    )
  );

  return regionalEncontrada?.nome || getRegionalDaUnidade(unidade);
}

function checkEhJustificado(check) {
  return (
    normalizarTexto(check?.status) === "justificado" ||
    normalizarTexto(check?.tipo) === "justificativa"
  );
}

function checkEstaPendente(check) {
  return normalizarTexto(check?.status) === "pendente";
}

function checkEhConcluido(check) {
  return [
    "concluido",
    "concluida",
    "realizado",
    "realizada",
    "feito",
    "feita",
  ].includes(normalizarTexto(check?.status));
}

function checkFoiCancelado(check) {
  return ["cancelado", "cancelada"].includes(
    normalizarTexto(check?.status)
  );
}

function obterLimiteDePendencias(hoje) {
  const data = new Date(hoje);
  data.setHours(12, 0, 0, 0);

  const diaSemana = data.getDay();

  if (diaSemana === 6 || diaSemana === 0) {
    return dataLocalString(data);
  }

  const diasDesdeSegunda = diaSemana - 1;
  data.setDate(data.getDate() - diasDesdeSegunda - 3);

  return dataLocalString(data);
}

function obterDataInicioCadastro(professor) {
  if (!professor?.criadoEm) return "1970-01-01";
  return dataLocalString(professor.criadoEm);
}

function excecaoAbrangeUnidade(excecao, unidade) {
  if (!excecao?.unidade) return true;
  return mesmaUnidade(excecao.unidade, unidade);
}

function excecaoAbrangeDia(excecao, dia) {
  const inicio = excecao?.dataInicio;
  const fim = excecao?.dataFim || excecao?.dataInicio;

  if (!inicio || !fim) return false;

  return dia >= inicio && dia <= fim;
}

export default function AdminOverview({
  unidadeFoco,
  unidadesEscopo,
  nomeUsuario,
  cargoUsuario,
  onBack,
  onChat,
  onFamily,
  onDownloadPDF,
}) {
  // Estados
  const [mostrarRelatorios, setMostrarRelatorios] = useState(false);

  const [filtroRegional, setFiltroRegional] = useState([]);
  const [filtroUnidade, setFiltroUnidade] = useState([]);
  const [filtroPeriodo, setFiltroPeriodo] = useState("mes");
  const [mesFiltro, setMesFiltro] = useState(new Date());
  const [dataInicioCustom, setDataInicioCustom] = useState("");
  const [dataFimCustom, setDataFimCustom] = useState("");
  const [busca, setBusca] = useState("");

  const [mostrarEstatisticas, setMostrarEstatisticas] = useState(false);

  const [checks, setChecks] = useState([]);
  const [users, setUsers] = useState([]);
  const [calendarios, setCalendarios] = useState([]);
  const [excecoesCalendario, setExcecoesCalendario] = useState([]);
  const [regionais, setRegionais] = useState([]);
  const [unidadesCadastradas, setUnidadesCadastradas] = useState([]);
  const [turmasCadastradas, setTurmasCadastradas] = useState([]);

  const [carregando, setCarregando] = useState(true);
  const [unidadeSelecionada, setUnidadeSelecionada] = useState(null);

  const [paginaAtual, setPaginaAtual] = useState(1);

  const ITENS_POR_PAGINA = 6;

  const isDiretor = Boolean(unidadeFoco);

  const isRegional =
    !isDiretor &&
    Array.isArray(unidadesEscopo) &&
    unidadesEscopo.length > 0;

  // Carregamento do Firestore
  useEffect(() => {
    let cancelado = false;

    async function carregarColecao(nome) {
      try {
        return await getDocs(collection(db, nome));
      } catch (erro) {
        console.warn(`Erro ao carregar ${nome}:`, erro);
        return null;
      }
    }

    async function carregar() {
      try {
        const [
          snapChecks,
          snapUsers,
          snapCalendarios,
          snapExcecoes,
          snapUnidades,
          snapTurmas,
        ] = await Promise.all([
          carregarColecao("checks"),
          carregarColecao("users"),
          carregarColecao("calendarios"),
          carregarColecao("excecoes_calendario"),
          carregarColecao("unidades_db"),
          carregarColecao("turmas_escolares"),
        ]);

        if (cancelado) return;

        // CHECKS
        const listaChecks = [];

        snapChecks?.forEach((documento) => {
          const data = documento.data();

          listaChecks.push({
            id: documento.id,
            professorUid: data.professorUid || data.uid || "",
            professorEmail: normalizarTexto(
              data.professorEmail || data.email || ""
            ),
            unidade: data.unidade || "",
            dataReal: data.dataReal || "",
            status: normalizarTexto(data.status),
            tipo: normalizarTexto(data.tipo),
            turma: data.turma || "",
            serie: data.serie || "",
            observacao:
              data.observacao ||
              data.observacaoAula ||
              data.descricao ||
              data.comentario ||
              "",
            justificativa:
              data.justificativa ||
              data.motivo ||
              data.descricaoJustificativa ||
              "",
            motivo: data.motivo || "",
            descricao: data.descricao || "",
            comentario: data.comentario || "",
            comentarios: data.comentarios || "",
          });
        });

        setChecks(listaChecks);

        // USUÁRIOS
        const listaUsers = [];

        snapUsers?.forEach((documento) => {
          const data = documento.data();

          listaUsers.push({
            id: documento.id,
            uid: data.uid || documento.id,
            nome: data.nome || "",
            email: normalizarTexto(data.email || ""),
            cargo: data.cargo || "",
            unidade: data.unidade || "",
            criadoEm: converterData(data.criadoEm) || new Date(0),
            turmas: data.turmas || "",
            disciplinas: data.disciplinas || [],
            unidadesInativas: data.unidadesInativas || [],
            turmasInativas: data.turmasInativas || [],
            cargos: data.cargos || [],
            unidadesComando: data.unidadesComando || [],
          });
        });

        setUsers(listaUsers);

        setRegionais(
          listaUsers.filter((user) =>
            (user.cargos || []).some(
              (cargo) => normalizarTexto(cargo) === "regional"
            )
          )
        );

        // CALENDÁRIOS
        const listaCalendarios = [];

        snapCalendarios?.forEach((documento) => {
          listaCalendarios.push({
            id: documento.id,
            ...documento.data(),
          });
        });

        setCalendarios(listaCalendarios);

        // EXCEÇÕES
        const listaExcecoes = [];

        snapExcecoes?.forEach((documento) => {
          listaExcecoes.push({
            id: documento.id,
            ...documento.data(),
          });
        });

        setExcecoesCalendario(listaExcecoes);

        // UNIDADES
        const listaUnidades = [];

        snapUnidades?.forEach((documento) => {
          const data = documento.data();

          if (data.nome) {
            listaUnidades.push({
              id: documento.id,
              nome: data.nome,
            });
          }
        });

        setUnidadesCadastradas(listaUnidades);

        // TURMAS
        const listaTurmas = [];

        snapTurmas?.forEach((documento) => {
          const data = documento.data();

          if (!data.unidade || !data.turma || data.ativo === false) {
            return;
          }

          listaTurmas.push({
            id: documento.id,
            unidade: data.unidade,
            turma: data.turma,
            serie: data.serie || "",
            turno: data.turno || "",
          });
        });

        setTurmasCadastradas(listaTurmas);
      } catch (erro) {
        console.error("Erro ao carregar overview:", erro);
      } finally {
        if (!cancelado) setCarregando(false);
      }
    }

    carregar();

    return () => {
      cancelado = true;
    };
  }, []);

  // Dados gerais do overview
  const dadosFiltrados = useMemo(() => {
    const vazio = {
      total: {
        concluidas: 0,
        pendentes: 0,
        justificadas: 0,
      },
      porUnidade: [],
    };

    if (carregando) return vazio;

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const hojeString = dataLocalString(hoje);
    const limitePendencias = obterLimiteDePendencias(hoje);

    const inicioMesFiltro = new Date(
      mesFiltro.getFullYear(),
      mesFiltro.getMonth(),
      1
    );

    const fimMesFiltro = new Date(
      mesFiltro.getFullYear(),
      mesFiltro.getMonth() + 1,
      0
    );

    const inicioMesFiltroString = dataLocalString(inicioMesFiltro);
    const fimMesFiltroString = dataLocalString(fimMesFiltro);

    const total = {
      concluidas: 0,
      pendentes: 0,
      justificadas: 0,
    };

    const mapaUnidades = new Map();

    function garantirUnidade(nome) {
      const nomeReal = String(nome || "").trim();

      if (!nomeReal) return null;

      const chave = normalizarTexto(nomeReal);

      if (!mapaUnidades.has(chave)) {
        mapaUnidades.set(chave, {
          nome: nomeReal,
          regional: obterRegionalDaLista(nomeReal, regionais),
          c: 0,
          p: 0,
          j: 0,
          turmas: [],
          historico: [],
        });
      }

      return mapaUnidades.get(chave);
    }

    function unidadeEstaVisivel(nome) {
      if (!nome) return false;

      if (isDiretor) {
        return mesmaUnidade(nome, unidadeFoco);
      }

      if (isRegional) {
        return unidadeEstaNoEscopo(nome, unidadesEscopo);
      }

      if (
        filtroRegional.length > 0 &&
        !filtroRegional.includes(obterRegionalDaLista(nome, regionais))
      ) {
        return false;
      }

      if (
        filtroUnidade.length > 0 &&
        !filtroUnidade.some((unidade) => mesmaUnidade(unidade, nome))
      ) {
        return false;
      }

      return true;
    }

    function periodoInclui(data) {
      if (!data) return false;

      if (filtroPeriodo === "mes") {
        return (
          data >= inicioMesFiltroString &&
          data <= fimMesFiltroString
        );
      }

      if (filtroPeriodo === "anual") {
        return data.startsWith(mesFiltro.getFullYear().toString());
      }

      if (filtroPeriodo === "custom") {
        const inicio = dataInicioCustom || "1970-01-01";
        const fim = dataFimCustom || "2100-01-01";

        return data >= inicio && data <= fim;
      }

      return data <= hojeString;
    }

    function adicionarTurma(unidade, turma) {
      if (!unidade || !turma) return;

      const unidadeAtual = garantirUnidade(unidade);

      if (!unidadeAtual) return;

      if (
        !unidadeAtual.turmas.some(
          (item) => normalizarTexto(item) === normalizarTexto(turma)
        )
      ) {
        unidadeAtual.turmas.push(turma);
      }
    }

    unidadesCadastradas.forEach((unidade) => {
      if (unidadeEstaVisivel(unidade.nome)) {
        garantirUnidade(unidade.nome);
      }
    });

    checks.forEach((check) => {
      if (check.unidade && unidadeEstaVisivel(check.unidade)) {
        garantirUnidade(check.unidade);
      }
    });

    turmasCadastradas.forEach((turma) => {
      if (unidadeEstaVisivel(turma.unidade)) {
        adicionarTurma(turma.unidade, turma.turma);
      }
    });

    users.forEach((user) => {
      const mapaTurmas = parseTurmasPorUnidade(user.turmas);

      Object.entries(mapaTurmas || {}).forEach(([unidade, turmas]) => {
        if (!unidadeEstaVisivel(unidade)) return;

        garantirUnidade(unidade);

        (turmas || []).forEach((turma) => {
          adicionarTurma(unidade, turma);
        });
      });

      obterUnidadesDoCampo(user.unidade).forEach((unidade) => {
        if (unidadeEstaVisivel(unidade)) {
          garantirUnidade(unidade);
        }
      });
    });

    const checksValidos = checks.filter((check) => {
      if (
        !check?.unidade ||
        !check?.dataReal ||
        !unidadeEstaVisivel(check.unidade) ||
        check.dataReal > hojeString
      ) {
        return false;
      }

      if (!periodoInclui(check.dataReal) || checkFoiCancelado(check)) {
        return false;
      }

      return (
        checkEhConcluido(check) ||
        checkEhJustificado(check) ||
        checkEstaPendente(check)
      );
    });

    checksValidos.forEach((check) => {
      const unidadeAtual = garantirUnidade(check.unidade);

      if (!unidadeAtual) return;

      const registroHistorico = {
        id: check.id,
        tipo: check.tipo || "aula",
        status: checkEhJustificado(check)
          ? "justificado"
          : checkEstaPendente(check)
            ? "pendente"
            : "realizado",
        unidade: check.unidade,
        data: check.dataReal,
        dataFormatada: formatarData(check.dataReal),
        turma: check.turma || check.serie || "",
        responsavel: "",
        responsavelUid: check.professorUid,
        observacao: check.observacao || "",
        justificativa: check.justificativa || "",
        motivo: check.motivo || "",
        descricao: check.descricao || "",
        comentario: check.comentario || "",
        comentarios: check.comentarios || "",
      };

      if (checkEhJustificado(check)) {
        total.justificadas++;
        unidadeAtual.j++;
      } else if (checkEhConcluido(check)) {
        total.concluidas++;
        unidadeAtual.c++;
      } else if (checkEstaPendente(check)) {
        total.pendentes++;
        unidadeAtual.p++;
      }

      unidadeAtual.historico.push(registroHistorico);
    });

    // CALENDÁRIO
    const calendarioAtivo = calendarios[0];

    let diasUteisAno = [];

    if (calendarioAtivo?.inicio && calendarioAtivo?.fim) {
      const inicio = converterData(calendarioAtivo.inicio);
      const fim = converterData(calendarioAtivo.fim);

      if (inicio && fim) {
        diasUteisAno = gerarDiasUteis(inicio, fim);
      }
    }

    const excecoes = [
      ...(Array.isArray(calendarioAtivo?.excecoes)
        ? calendarioAtivo.excecoes
        : []),
      ...excecoesCalendario.filter(
        (excecao) =>
          !excecao.calendarioId ||
          !calendarioAtivo?.id ||
          excecao.calendarioId === calendarioAtivo.id
      ),
    ];

    let professoresVisiveis = users.filter(
      (user) => (user.disciplinas || []).length > 0
    );

    if (isDiretor) {
      professoresVisiveis = professoresVisiveis.filter((user) =>
        usuarioPossuiUnidade(user, unidadeFoco)
      );
    } else if (isRegional) {
      professoresVisiveis = professoresVisiveis.filter((user) =>
        obterUnidadesDoCampo(user.unidade).some((unidade) =>
          unidadeEstaNoEscopo(unidade, unidadesEscopo)
        )
      );
    } else {
      if (filtroRegional.length > 0) {
        professoresVisiveis = professoresVisiveis.filter((user) =>
          obterUnidadesDoCampo(user.unidade).some((unidade) =>
            filtroRegional.includes(
              obterRegionalDaLista(unidade, regionais)
            )
          )
        );
      }

      if (filtroUnidade.length > 0) {
        professoresVisiveis = professoresVisiveis.filter((user) =>
          obterUnidadesDoCampo(user.unidade).some((unidade) =>
            filtroUnidade.some((filtro) =>
              mesmaUnidade(filtro, unidade)
            )
          )
        );
      }
    }

    professoresVisiveis.forEach((professor) => {
      const dataCadastro = obterDataInicioCadastro(professor);

      const unidadesProfessor = new Set([
        ...obterUnidadesDoCampo(professor.unidade),
        ...Object.keys(parseTurmasPorUnidade(professor.turmas) || {}),
      ]);

      const unidadesInativas = new Set(
        (professor.unidadesInativas || []).map(normalizarTexto)
      );

      unidadesProfessor.forEach((unidade) => {
        if (
          !unidadeEstaVisivel(unidade) ||
          unidadesInativas.has(normalizarTexto(unidade))
        ) {
          return;
        }

        const unidadeAtual = garantirUnidade(unidade);

        if (!unidadeAtual) return;

        const checksProfessorUnidade = checksValidos.filter((check) => {
          if (!mesmaUnidade(check.unidade, unidade)) return false;

          if (check.professorUid) {
            return check.professorUid === professor.uid;
          }

          return (
            check.professorEmail &&
            check.professorEmail === professor.email
          );
        });

        const diasComRegistro = new Set(
          checksProfessorUnidade.map((check) => check.dataReal)
        );

        diasUteisAno.forEach((dia) => {
          if (
            dia < dataCadastro ||
            dia > limitePendencias ||
            !periodoInclui(dia) ||
            diasComRegistro.has(dia)
          ) {
            return;
          }

          const estaEmExcecao = excecoes.some(
            (excecao) =>
              excecaoAbrangeDia(excecao, dia) &&
              excecaoAbrangeUnidade(excecao, unidade)
          );

          if (estaEmExcecao) return;

          total.pendentes++;
          unidadeAtual.p++;

          unidadeAtual.historico.push({
            id: `pendente-${professor.uid}-${normalizarTexto(unidade)}-${dia}`,
            tipo: "aula",
            status: "pendente",
            unidade,
            data: dia,
            dataFormatada: formatarData(dia),
            turma: "",
            responsavel: professor.nome || "",
            responsavelUid: professor.uid,
            observacao: "",
            justificativa: "",
            motivo: "",
            descricao: "",
          });
        });
      });
    });

    const porUnidade = Array.from(mapaUnidades.values());

    porUnidade.forEach((unidade) => {
      unidade.turmas.sort((a, b) =>
        a.localeCompare(b, "pt-BR")
      );

      unidade.historico.sort((a, b) =>
        b.data.localeCompare(a.data)
      );
    });

    porUnidade.sort((a, b) =>
      a.nome.localeCompare(b.nome, "pt-BR")
    );

    return {
      total,
      porUnidade,
    };
  }, [
    checks,
    users,
    calendarios,
    excecoesCalendario,
    regionais,
    unidadesCadastradas,
    turmasCadastradas,
    filtroRegional,
    filtroUnidade,
    filtroPeriodo,
    mesFiltro,
    dataInicioCustom,
    dataFimCustom,
    isDiretor,
    isRegional,
    unidadeFoco,
    unidadesEscopo,
    carregando,
  ]);

  // Unidades filtradas pela busca
  const unidadesBuscadas = useMemo(() => {
    return dadosFiltrados.porUnidade.filter((unidade) =>
      unidade.nome.toLowerCase().includes(busca.toLowerCase()) ||
      (unidade.regional &&
        unidade.regional.toLowerCase().includes(busca.toLowerCase()))
    );
  }, [dadosFiltrados.porUnidade, busca]);

  // =====================================================
  // RANKING DOS PROFESSORES
  // Independente da paginação das unidades.
  // =====================================================

  const rankingProfessores = useMemo(() => {
    if (carregando) return [];

    const hoje = dataLocalString(new Date());

    const inicioMes = dataLocalString(
      new Date(mesFiltro.getFullYear(), mesFiltro.getMonth(), 1)
    );

    const fimMes = dataLocalString(
      new Date(mesFiltro.getFullYear(), mesFiltro.getMonth() + 1, 0)
    );

    function periodoInclui(data) {
      if (!data || data > hoje) return false;

      if (filtroPeriodo === "mes") {
        return data >= inicioMes && data <= fimMes;
      }

      if (filtroPeriodo === "anual") {
        return data.startsWith(String(mesFiltro.getFullYear()));
      }

      if (filtroPeriodo === "custom") {
        return (
          data >= (dataInicioCustom || "1970-01-01") &&
          data <= (dataFimCustom || "2100-01-01")
        );
      }

      return data <= hoje;
    }

    function unidadeVisivel(unidade) {
      if (!unidade) return false;

      if (isDiretor) {
        return mesmaUnidade(unidade, unidadeFoco);
      }

      if (isRegional) {
        return unidadeEstaNoEscopo(unidade, unidadesEscopo);
      }

      if (
        filtroRegional.length &&
        !filtroRegional.includes(
          obterRegionalDaLista(unidade, regionais)
        )
      ) {
        return false;
      }

      if (
        filtroUnidade.length &&
        !filtroUnidade.some((item) => mesmaUnidade(item, unidade))
      ) {
        return false;
      }

      return true;
    }

    const mapaProfessores = new Map();

    const professores = users.filter((user) => {
      const cargos = [
        ...(Array.isArray(user.cargos) ? user.cargos : []),
        user.cargo,
      ]
        .filter(Boolean)
        .map(normalizarTexto);

      return (
        cargos.includes("professor") ||
        (Array.isArray(user.disciplinas) &&
          user.disciplinas.length > 0)
      );
    });

    const usuariosPorUid = new Map();
    const usuariosPorEmail = new Map();

    professores.forEach((professor) => {
      if (professor.uid) {
        usuariosPorUid.set(professor.uid, professor);
      }

      if (professor.email) {
        usuariosPorEmail.set(
          normalizarTexto(professor.email),
          professor
        );
      }
    });

    checks.forEach((check) => {
      if (
        !check.unidade ||
        !check.dataReal ||
        !periodoInclui(check.dataReal) ||
        !unidadeVisivel(check.unidade) ||
        checkFoiCancelado(check)
      ) {
        return;
      }

      if (
        !checkEhConcluido(check) &&
        !checkEhJustificado(check) &&
        !checkEstaPendente(check)
      ) {
        return;
      }

      let professor = check.professorUid
        ? usuariosPorUid.get(check.professorUid)
        : null;

      if (!professor && check.professorEmail) {
        professor = usuariosPorEmail.get(
          normalizarTexto(check.professorEmail)
        );
      }

      // Não contabiliza registros sem professor identificado.
      if (!professor) return;

      const unidade = String(check.unidade).trim();

      if (
        obterUnidadesDoCampo(professor.unidade).length > 0 &&
        !usuarioPossuiUnidade(professor, unidade) &&
        !Object.keys(
          parseTurmasPorUnidade(professor.turmas) || {}
        ).some((item) => mesmaUnidade(item, unidade))
      ) {
        return;
      }

      const chaveProfessor = professor.uid || professor.email;
      const chave = `${normalizarTexto(unidade)}|${chaveProfessor}`;

      if (!mapaProfessores.has(chave)) {
        mapaProfessores.set(chave, {
          uid: professor.uid,
          nome: professor.nome || "Professor sem nome",
          email: professor.email || "",
          unidade,
          concluidas: 0,
          pendentes: 0,
          justificadas: 0,
        });
      }

      const registro = mapaProfessores.get(chave);

      if (checkEhConcluido(check)) {
        registro.concluidas++;
      } else if (checkEhJustificado(check)) {
        registro.justificadas++;
      } else if (checkEstaPendente(check)) {
        registro.pendentes++;
      }
    });

    return Array.from(mapaProfessores.values()).map((professor) => {
      const total =
        professor.concluidas +
        professor.pendentes +
        professor.justificadas;

      return {
        ...professor,
        total,
        percentual: total
          ? Math.round((professor.concluidas / total) * 100)
          : 0,
      };
    });
  }, [
    checks,
    users,
    filtroPeriodo,
    mesFiltro,
    dataInicioCustom,
    dataFimCustom,
    filtroRegional,
    filtroUnidade,
    regionais,
    isDiretor,
    isRegional,
    unidadeFoco,
    unidadesEscopo,
    carregando,
  ]);

  // Indicadores
  const totalGeral =
    dadosFiltrados.total.concluidas +
    dadosFiltrados.total.pendentes +
    dadosFiltrados.total.justificadas;

  const percentualConcluidas =
    totalGeral > 0
      ? Math.round(
        (dadosFiltrados.total.concluidas / totalGeral) * 100
      )
      : 0;

  const temFiltrosAtivos =
    !isDiretor &&
    !isRegional &&
    (filtroRegional.length > 0 ||
      filtroUnidade.length > 0 ||
      filtroPeriodo !== "mes");

  // Paginação SOMENTE das unidades
  const totalPaginas = Math.ceil(
    unidadesBuscadas.length / ITENS_POR_PAGINA
  );

  const unidadesPaginadas = useMemo(() => {
    const inicio = (paginaAtual - 1) * ITENS_POR_PAGINA;

    return unidadesBuscadas.slice(
      inicio,
      inicio + ITENS_POR_PAGINA
    );
  }, [unidadesBuscadas, paginaAtual]);

  useEffect(() => {
    setPaginaAtual(1);
  }, [
    filtroRegional,
    filtroUnidade,
    filtroPeriodo,
    mesFiltro,
    dataInicioCustom,
    dataFimCustom,
    busca,
  ]);

  if (carregando) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="mb-4 h-8 w-8 animate-spin text-gray-400" />

        <p className="text-sm font-bold uppercase tracking-wider text-gray-500">
          Carregando indicadores...
        </p>
      </div>
    );
  }

  return (
    <div className="w-full min-w-0 pb-10 animate-fade-in">
      <div className="mx-auto max-w-4xl px-4 pt-6 sm:px-6">

        <OverviewHeader
          isDiretor={isDiretor}
          unidadeFoco={unidadeFoco}
          nomeUsuario={nomeUsuario}
          cargoUsuario={cargoUsuario}
          onBack={onBack || (() => window.history.back())}
          onReports={() => setMostrarRelatorios(true)}
          onChat={onChat}
          onFamily={onFamily}
          onDownloadPDF={onDownloadPDF}
          filtroPeriodo={filtroPeriodo}
          setFiltroPeriodo={setFiltroPeriodo}
          mesFiltro={mesFiltro}
          setMesFiltro={setMesFiltro}
        />

        <OverviewFilters
          isDiretor={isDiretor}
          isRegional={isRegional}
          unidadeFoco={unidadeFoco}
          unidadesEscopo={unidadesEscopo}
          filtroRegional={filtroRegional}
          setFiltroRegional={setFiltroRegional}
          filtroUnidade={filtroUnidade}
          setFiltroUnidade={setFiltroUnidade}
          filtroPeriodo={filtroPeriodo}
          mesFiltro={mesFiltro}
          setMesFiltro={setMesFiltro}
          dataInicioCustom={dataInicioCustom}
          setDataInicioCustom={setDataInicioCustom}
          dataFimCustom={dataFimCustom}
          setDataFimCustom={setDataFimCustom}
          temFiltrosAtivos={temFiltrosAtivos}
          busca={busca}
          setBusca={setBusca}
          regionaisDisponiveis={regionais}
        />

        <OverviewSummary
          totalGeral={totalGeral}
          percentualConcluidas={percentualConcluidas}
          total={dadosFiltrados.total}
        />

        {/* UNIDADES */}
        <OverviewUnits
          isDiretor={isDiretor}
          mostrarEstatisticas={mostrarEstatisticas}
          setMostrarEstatisticas={setMostrarEstatisticas}
          porUnidade={unidadesPaginadas}
          onOpenUnit={setUnidadeSelecionada}
        />

        {/* PAGINAÇÃO DAS UNIDADES */}
        {totalPaginas > 1 && (
          <div className="mt-8 flex items-center justify-between border-t border-gray-100 pt-5">
            <span className="text-sm font-medium text-gray-500">
              Página {paginaAtual} de {totalPaginas}
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  setPaginaAtual((pagina) =>
                    Math.max(1, pagina - 1)
                  )
                }
                disabled={paginaAtual === 1}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft size={18} />
              </button>

              <button
                onClick={() =>
                  setPaginaAtual((pagina) =>
                    Math.min(totalPaginas, pagina + 1)
                  )
                }
                disabled={paginaAtual === totalPaginas}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* RANKING FORA DA PAGINAÇÃO */}
        <OverviewTeacherRanking
          professores={rankingProfessores}
          unidades={dadosFiltrados.porUnidade.map(
            (unidade) => unidade.nome
          )}
        />

      </div>

      {unidadeSelecionada && (
        <UnitDetailsModal
          unidade={unidadeSelecionada}
          onClose={() => setUnidadeSelecionada(null)}
        />
      )}
      {mostrarRelatorios && (
        <OverviewReportsModal
          onClose={() => setMostrarRelatorios(false)}
          dadosFiltrados={dadosFiltrados}
          users={users}
          excecoesCalendario={excecoesCalendario}
          calendarios={calendarios}
          filtroPeriodo={filtroPeriodo}
          mesFiltro={mesFiltro}
          dataInicioCustom={dataInicioCustom}
          dataFimCustom={dataFimCustom}
        />
      )}
    </div>
  );
}
