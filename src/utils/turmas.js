
function normalizarTexto(valor) {
  return String(valor || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}

/**
 * Normaliza nomes de turmas para comparação.
 *
 * Exemplos:
 * "6º anoA - M" -> "6 ano a m"
 * "6 ano a m"   -> "6 ano a m"
 * "7º ano B - T" -> "7 ano b t"
 */
export function normalizarTurma(turma) {
  return normalizarTexto(turma)
    .replace(/[ºª°.,_-]/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\b(ano|serie)\s*([a-z])\b/g, "$1 $2")
    .trim();
}

/**
 * Normaliza nomes de unidades.
 */
export function normalizarUnidade(unidade) {
  return normalizarTexto(unidade);
}

/**
 * Converte:
 * "Copacabana: 7º anoA - M, 6º anoB - M"
 * "Campos dos Goytacazes: 6 ano a m"
 *
 * em:
 * {
 *   "Copacabana": ["7º anoA - M", "6º anoB - M"],
 *   "Campos dos Goytacazes": ["6 ano a m"]
 * }
 */
export function parseTurmasPorUnidade(turmasStr) {
  if (!turmasStr) return {};

  const blocos = Array.isArray(turmasStr)
    ? turmasStr
    : String(turmasStr).split(/[|\n]+/);

  const mapa = {};

  blocos
    .map((bloco) => String(bloco || "").trim())
    .filter(Boolean)
    .forEach((bloco) => {
      const idx = bloco.indexOf(":");

      if (idx === -1) return;

      const unidade = bloco.slice(0, idx).trim();
      const turmasRaw = bloco.slice(idx + 1).trim();

      if (!unidade || !turmasRaw) return;

      const turmas = turmasRaw
        .split(",")
        .map((turma) => turma.trim())
        .filter(Boolean);

      if (!mapa[unidade]) {
        mapa[unidade] = [];
      }

      turmas.forEach((turma) => {
        const existe = mapa[unidade].some(
          (item) =>
            normalizarTurma(item) === normalizarTurma(turma)
        );

        if (!existe) {
          mapa[unidade].push(turma);
        }
      });
    });

  return mapa;
}

/**
 * Chave original da turma.
 * Mantida para não alterar o formato já utilizado no restante do sistema.
 */
export function chaveTurma(unidade, turma) {
  return `${unidade}::${turma}`;
}

/**
 * Chave normalizada para comparar registros existentes
 * sem depender de acentos, espaços ou pontuação.
 */
export function chaveTurmaNormalizada(unidade, turma) {
  return `${normalizarUnidade(unidade)}::${normalizarTurma(turma)}`;
}

/**
 * Identifica a série de qualquer turma cadastrada.
 *
 * Exemplos:
 * "6 ano a m" -> "6 ano"
 * "6º anoA - M" -> "6 ano"
 * "7º ano B - T" -> "7 ano"
 * "1ª série A" -> "1 serie"
 */
export function extrairSerieTurma(turma) {
  const texto = normalizarTexto(turma);

  const match = texto.match(
    /(\d+)\s*º?\s*(ano|serie|efaf|em)/
  );

  if (match) {
    return `${match[1]} ${match[2]}`;
  }

  const ordinal = texto.match(
    /(primeiro|segundo|terceiro|quarto|quinto|sexto|setimo|oitavo|nono)\s*(ano|serie)/
  );

  if (ordinal) {
    const numeros = {
      primeiro: "1",
      segundo: "2",
      terceiro: "3",
      quarto: "4",
      quinto: "5",
      sexto: "6",
      setimo: "7",
      oitavo: "8",
      nono: "9",
    };

    return `${numeros[ordinal[1]]} ${ordinal[2]}`;
  }

  return null;
}
