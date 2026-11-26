import { mesmaData, hoje } from "../dateParser";
import { normalizar } from "../normalizer";

const fmtBR = (d) => {
  if (!d) return "—";
  const s = String(d);
  const br = s.match(/(\d{1,2})[\/\-](\d{1,2})/);
  if (br) return `${br[1].padStart(2, "0")}/${br[2].padStart(2, "0")}`;
  const iso = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return `${iso[3]}/${iso[2]}`;
  return s;
};

const contarPor = (arr, chaveFn) => {
  const mapa = new Map();
  arr.forEach((x) => {
    const k = chaveFn(x);
    if (!k) return;
    mapa.set(k, (mapa.get(k) || 0) + 1);
  });
  return [...mapa.entries()].sort((a, b) => b[1] - a[1]);
};

export function melhorUnidade({ ctx }) {
  const { checks } = ctx;
  if (!checks.length) return { text: "Ainda não há checks registrados." };
  const ranking = contarPor(checks, (c) => c.unidade);
  if (!ranking.length) return { text: "Os checks ainda não possuem unidade associada." };
  const [nome, total] = ranking[0];
  const segundos = ranking[1];
  return {
    text: `🏆 A melhor unidade é **${nome}**, com **${total} checks**.${
      segundos ? ` Em seguida vem **${segundos[0]}** com ${segundos[1]}.` : ""
    }`,
    data: { tipo: "ranking", ranking: ranking.slice(0, 5), unidade: "checks" },
  };
}

export function rankingUnidades({ ctx }) {
  const ranking = contarPor(ctx.checks, (c) => c.unidade);
  if (!ranking.length) return { text: "Sem dados de unidade nos checks." };
  return {
    text: "Ranking de unidades por checks:",
    data: { tipo: "ranking", ranking, unidade: "checks" },
  };
}

export function listarUnidades({ ctx }) {
  const nomes = (ctx.unidades || []).map((u) => u.nome || u);
  if (!nomes.length) return { text: "Nenhuma unidade cadastrada." };
  return {
    text: `Temos **${nomes.length} unidades** cadastradas:`,
    data: { tipo: "lista", itens: nomes },
  };
}

export function checksPorUnidade({ ctx, extract }) {
  if (!extract) return { text: "Qual unidade você quer consultar?" };
  const alvo = normalizar(extract);
  const filtrados = ctx.checks.filter((c) =>
    normalizar(c.unidade || "").includes(alvo)
  );
  if (!filtrados.length)
    return { text: `Não encontrei checks para a unidade **${extract}**.` };
  return {
    text: `A unidade **${extract}** tem **${filtrados.length} checks**.`,
    data: {
      tipo: "lista",
      itens: filtrados
        .slice(0, 20)
        .map((c) => `${c.disciplina} • ${c.serie} • ${fmtBR(c.dataReal)}`),
    },
  };
}

export function listarProfessores({ ctx }) {
  const nomes = ctx.professores.map((p) => p.nome || p.email).filter(Boolean);
  if (!nomes.length) return { text: "Nenhum professor encontrado." };
  return {
    text: `Temos **${nomes.length} professores** cadastrados:`,
    data: { tipo: "lista", itens: nomes },
  };
}

export function checksDoProfessor({ ctx, extract }) {
  if (!extract) return { text: "Qual professor? Ex: *checks do professor João*" };
  const alvo = normalizar(extract);
  const prof = ctx.professores.find(
    (p) =>
      normalizar(p.nome || "").includes(alvo) ||
      normalizar(p.email || "").includes(alvo)
  );
  if (!prof) return { text: `Não encontrei o professor **${extract}**.` };
  const filtrados = ctx.checks.filter(
    (c) => normalizar(c.professorEmail) === normalizar(prof.email)
  );
  return {
    text: `**${prof.nome || prof.email}** tem **${filtrados.length} checks** registrados.`,
    data: filtrados.length
      ? {
          tipo: "lista",
          itens: filtrados
            .slice(0, 15)
            .map(
              (c) =>
                `${c.disciplina} • ${c.serie} • ${fmtBR(c.dataReal)} • ${c.status}`
            ),
        }
      : null,
  };
}

export function rankingProfessores({ ctx }) {
  const ranking = contarPor(ctx.checks, (c) => c.professorEmail);
  if (!ranking.length) return { text: "Sem checks ainda." };
  const nomes = ranking.map(([email, qtd]) => {
    const p = ctx.professores.find((x) => x.email === email);
    return [p?.nome || email, qtd];
  });
  return {
    text: "Ranking de professores por checks:",
    data: { tipo: "ranking", ranking: nomes.slice(0, 10), unidade: "checks" },
  };
}

export function professoresSemCheck({ ctx }) {
  const comCheck = new Set(ctx.checks.map((c) => c.professorEmail));
  const sem = ctx.professores.filter((p) => !comCheck.has(p.email));
  if (!sem.length)
    return { text: "🎉 Todos os professores já fizeram pelo menos um check!" };
  return {
    text: `**${sem.length} professores** ainda sem check:`,
    data: { tipo: "lista", itens: sem.map((p) => p.nome || p.email) },
  };
}

export function checksHoje({ ctx }) {
  const h = hoje();
  const filtrados = ctx.checks.filter((c) => mesmaData(c.dataReal || c.dataHora, h));
  return { text: `Hoje temos **${filtrados.length} checks** registrados.` };
}

export function checksOntem({ ctx }) {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const alvo = { dia: d.getDate(), mes: d.getMonth() + 1 };
  const filtrados = ctx.checks.filter((c) => mesmaData(c.dataReal || c.dataHora, alvo));
  return { text: `Ontem tivemos **${filtrados.length} checks**.` };
}

export function totalChecks({ ctx }) {
  return { text: `O total de checks registrados é **${ctx.checks.length}**.` };
}

export function checksJustificados({ ctx }) {
  const j = ctx.checks.filter(
    (c) =>
      normalizar(c.status) === "justificado" ||
      normalizar(c.tipo) === "justificativa"
  );
  if (!j.length) return { text: "Nenhum check justificado." };
  return {
    text: `**${j.length} checks justificados**:`,
    data: {
      tipo: "lista",
      itens: j
        .slice(0, 20)
        .map(
          (c) =>
            `${c.professorEmail} • ${c.serie} • ${c.justificativa || "sem motivo"}`
        ),
    },
  };
}

const checkEhJustificado = (check) =>
  normalizar(check.status) === "justificado" || normalizar(check.tipo) === "justificativa";
const checkEhPendente = (check) => normalizar(check.status) === "pendente";
const checkEhConcluido = (check) =>
  !checkEhJustificado(check) && !checkEhPendente(check) &&
  ["concluido", "concluida", "realizado", "realizada", "feito", "feita"].includes(normalizar(check.status));

export function checksPendentes({ ctx }) {
  const itens = ctx.checks.filter(checkEhPendente);
  return {
    text: `Encontrei **${itens.length} checks pendentes**${itens.length ? ":" : "."}`,
    data: itens.length ? { tipo: "lista", itens: itens.slice(0, 20).map((c) => `${c.unidade || "Unidade n/i"} • ${c.serie || c.turma || "Série n/i"} • ${c.disciplina || "Disciplina n/i"} • ${fmtBR(c.dataReal || c.dataHora)}`) } : null,
  };
}

export function checksConcluidos({ ctx }) {
  const itens = ctx.checks.filter(checkEhConcluido);
  return { text: `Encontrei **${itens.length} checks concluídos**.` };
}

export function checksPorDisciplina({ ctx, extract }) {
  const alvo = normalizar(extract || "");
  if (!alvo) {
    const ranking = contarPor(ctx.checks, (c) => c.disciplina);
    return ranking.length
      ? { text: "Checks registrados por disciplina:", data: { tipo: "ranking", ranking, unidade: "checks" } }
      : { text: "Ainda não há checks com disciplina registrada." };
  }
  const itens = ctx.checks.filter((c) => normalizar(c.disciplina).includes(alvo));
  if (!itens.length) return { text: `Não encontrei checks para **${extract}**.` };
  return {
    text: `Encontrei **${itens.length} checks** de **${extract}**.`,
    data: {
      tipo: "lista",
      itens: itens.slice(0, 20).map(
        (c) => `${c.unidade || "Unidade n/i"} • ${c.serie || c.turma || "Série n/i"} • ${fmtBR(c.dataReal || c.dataHora)}`
      ),
    },
  };
}

export function checksPorSerie({ ctx, extract }) {
  const alvo = normalizar(extract || "");
  if (!alvo) {
    const ranking = contarPor(ctx.checks, (c) => c.serie || c.turma);
    return ranking.length
      ? { text: "Checks registrados por série/turma:", data: { tipo: "ranking", ranking, unidade: "checks" } }
      : { text: "Ainda não há checks com série ou turma registrada." };
  }
  const itens = ctx.checks.filter((c) => normalizar(c.serie || c.turma).includes(alvo));
  if (!itens.length) return { text: `Não encontrei checks para **${extract}**.` };
  return {
    text: `Encontrei **${itens.length} checks** para **${extract}**.`,
    data: {
      tipo: "lista",
      itens: itens.slice(0, 20).map(
        (c) => `${c.unidade || "Unidade n/i"} • ${c.disciplina || "Disciplina n/i"} • ${fmtBR(c.dataReal || c.dataHora)}`
      ),
    },
  };
}

export function resumoChecks({ ctx }) {
  const total = ctx.checks.length;
  const concluidos = ctx.checks.filter(checkEhConcluido).length;
  const pendentes = ctx.checks.filter(checkEhPendente).length;
  const justificados = ctx.checks.filter(checkEhJustificado).length;
  const unidades = new Set(ctx.checks.map((c) => normalizar(c.unidade)).filter(Boolean)).size;
  const professores = new Set(ctx.checks.map((c) => normalizar(c.professorEmail)).filter(Boolean)).size;
  return { text: `Resumo dos dados disponíveis:\n• **${total} checks** no total\n• **${concluidos} concluídos**, **${pendentes} pendentes** e **${justificados} justificados**\n• Registros em **${unidades} unidades** e de **${professores} professores**.` };
}

export function checksSemana({ ctx }) {
  const hojeD = new Date();
  const inicio = new Date(hojeD);
  inicio.setDate(hojeD.getDate() - hojeD.getDay());
  const fim = new Date(inicio);
  fim.setDate(inicio.getDate() + 7);
  const filtrados = ctx.checks.filter((c) => {
    const d = new Date(c.dataHora || c.dataReal || 0);
    return d >= inicio && d < fim;
  });
  return { text: `Essa semana tivemos **${filtrados.length} checks**.` };
}

export function checksMes({ ctx }) {
  const h = hoje();
  const filtrados = ctx.checks.filter((c) => {
    const d = new Date(c.dataHora || c.dataReal || 0);
    return d.getMonth() + 1 === h.mes && d.getFullYear() === h.ano;
  });
  return { text: `Esse mês temos **${filtrados.length} checks**.` };
}

export function aulasHoje({ ctx }) {
  const h = hoje();
  const doDia = (ctx.calendario || []).filter((c) => mesmaData(c.data, h));
  if (!doDia.length)
    return { text: "Hoje não há aulas cadastradas no calendário." };
  return {
    text: `Hoje temos **${doDia.length} aulas**:`,
    data: {
      tipo: "lista",
      itens: doDia
        .slice(0, 20)
        .map((c) => `${c.disciplina} • ${c.base} • ${c.aulaIndex}`),
    },
  };
}

export function proximaAula({ ctx }) {
  const h = hoje();
  const hojeD = new Date(h.ano, h.mes - 1, h.dia);
  const futuras = (ctx.calendario || [])
    .filter((c) => {
      const m = String(c.data || "").match(/(\d{1,2})[\/\-](\d{1,2})/);
      if (!m) return false;
      const d = new Date(h.ano, +m[2] - 1, +m[1]);
      return d >= hojeD;
    })
    .slice(0, 10);
  if (!futuras.length) return { text: "Sem aulas futuras cadastradas." };
  return {
    text: "Próximas aulas:",
    data: {
      tipo: "lista",
      itens: futuras.map((c) => `${c.disciplina} • ${c.base} • ${fmtBR(c.data)}`),
    },
  };
}

export function listarSegmentos({ ctx }) {
  const nomes = (ctx.segmentos || []).map((s) => s.nome || s);
  if (!nomes.length) return { text: "Nenhum segmento cadastrado." };
  return {
    text: `Temos **${nomes.length} segmentos**:`,
    data: { tipo: "lista", itens: nomes },
  };
}

export function ajuda() {
  return {
    text:
      "Posso te ajudar com:\n" +
      "• Unidades (melhor unidade, ranking, checks por unidade)\n" +
      "• Professores (lista, checks, ranking, sem check)\n" +
      "• Checks (hoje, ontem, semana, mês, pendentes, concluídos e justificados)\n" +
      "• Consultas por unidade, professor, disciplina ou série\n" +
      "• Resumo geral, rankings e cadastros\n" +
      "• Segmentos\n\n" +
      "Ex: *qual a melhor unidade?*, *checks do professor João*",
  };
}

export function saudacao() {
  return {
    text: "Olá! 👋 Pergunte sobre unidades, professores, checks ou calendário. Ex: *qual a melhor unidade?*",
  };
}

export function fallback() {
  return {
    text: "Não entendi 🤔. Tente reformular ou toque numa sugestão abaixo:",
    data: { tipo: "sugestoes" },
  };
}

export const HANDLERS = {
  melhorUnidade,
  rankingUnidades,
  listarUnidades,
  checksPorUnidade,
  listarProfessores,
  checksDoProfessor,
  rankingProfessores,
  professoresSemCheck,
  checksHoje,
  checksOntem,
  totalChecks,
  checksJustificados,
  checksPendentes,
  checksConcluidos,
  checksPorDisciplina,
  checksPorSerie,
  resumoChecks,
  checksSemana,
  checksMes,
  aulasHoje,
  proximaAula,
  listarSegmentos,
  ajuda,
  saudacao,
  fallback,
};
