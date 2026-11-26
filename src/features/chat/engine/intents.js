export const INTENTS = [
  {
    id: "melhor_unidade",
    keywords: ["melhor unidade", "unidade destaque", "top unidade", "unidade com mais check", "unidade que mais"],
    regex: [/qual .*unidade .*(melhor|mais|destaque)/],
    handler: "melhorUnidade",
  },
  {
    id: "ranking_unidades",
    keywords: ["ranking unidade", "ranking das unidades", "unidades mais check"],
    handler: "rankingUnidades",
  },
  {
    id: "listar_unidades",
    keywords: ["quais unidades", "lista de unidades", "unidades cadastradas", "todas as unidades"],
    handler: "listarUnidades",
  },
  {
    id: "checks_por_unidade",
    keywords: ["check da unidade", "checks da unidade", "quantos checks unidade"],
    regex: [/checks? (?:da|do|em|de) unidade ([\w\s]+)/],
    handler: "checksPorUnidade",
    extract: (t) => t.match(/unidade ([\w\s]+)/)?.[1]?.trim(),
  },
  {
    id: "listar_professores",
    keywords: ["quais professores", "lista de professores", "todos professores", "professores cadastrados"],
    handler: "listarProfessores",
  },
  {
    id: "checks_professor",
    keywords: ["check do professor", "checks do professor", "quantos checks prof"],
    regex: [/checks? (?:do|da|de) (?:professor |prof )?([a-z\s]+)/],
    handler: "checksDoProfessor",
    extract: (t) => t.match(/checks? (?:do|da|de) (?:professor |prof )?([a-z\s]+)/)?.[1]?.trim(),
  },
  {
    id: "ranking_professores",
    keywords: ["ranking professor", "ranking dos professores", "quem fez mais check", "top professores"],
    handler: "rankingProfessores",
  },
  {
    id: "professores_sem_check",
    keywords: ["professores sem check", "quem nao fez check", "professores pendentes"],
    handler: "professoresSemCheck",
  },
  {
    id: "checks_hoje",
    keywords: ["checks hoje", "quantos checks hoje"],
    handler: "checksHoje",
  },
  {
    id: "checks_ontem",
    keywords: ["checks ontem"],
    handler: "checksOntem",
  },
  {
    id: "total_checks",
    keywords: ["total de checks", "quantos checks no total", "quantidade de checks"],
    handler: "totalChecks",
  },
  {
    id: "checks_semana",
    keywords: ["checks essa semana", "checks esta semana"],
    handler: "checksSemana",
  },
  {
    id: "checks_mes",
    keywords: ["checks esse mes", "checks este mes"],
    handler: "checksMes",
  },
  {
    id: "checks_justificados",
    keywords: ["checks justificados", "justificativas", "quem justificou"],
    handler: "checksJustificados",
  },
  {
    id: "aula_hoje",
    keywords: ["aula hoje", "tem aula hoje", "quais aulas hoje"],
    handler: "aulasHoje",
  },
  {
    id: "proxima_aula",
    keywords: ["proxima aula", "quando e a proxima aula"],
    handler: "proximaAula",
  },
  {
    id: "listar_segmentos",
    keywords: ["quais segmentos", "lista de segmentos", "segmentos"],
    handler: "listarSegmentos",
  },
  {
    id: "ajuda",
    keywords: ["ajuda", "o que voce faz", "o que voce sabe", "como funciona"],
    handler: "ajuda",
  },
  {
    id: "saudacao",
    keywords: ["oi", "ola", "bom dia", "boa tarde", "boa noite", "eai"],
    handler: "saudacao",
  },
];