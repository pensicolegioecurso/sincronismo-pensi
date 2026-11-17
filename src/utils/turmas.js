
/**
 * Converte:
 * "Copacabana: 7º anoA - M, 6º anoB - M"
 * ou
 * "Campos dos Goytacazes: 6 ano a m"
 *
 * em:
 * {
 *   "Copacabana": ["7º anoA - M", "6º anoB - M"],
 *   "Campos dos Goytacazes": ["6 ano a m"]
 * }
 */

export function parseTurmasPorUnidade(turmasStr) {
  if (!turmasStr || typeof turmasStr !== "string") return {};

  const mapa = {};

  turmasStr
    .split("|")
    .map((bloco) => bloco.trim())
    .filter(Boolean)
    .forEach((bloco) => {
      const idx = bloco.indexOf(":");
      if (idx === -1) return;

      const unidade = bloco.slice(0, idx).trim();
      const turmasRaw = bloco.slice(idx + 1).trim();

      if (!unidade || !turmasRaw) return;

      const turmas = turmasRaw
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      if (!mapa[unidade]) mapa[unidade] = [];

      turmas.forEach((turma) => {
        if (!mapa[unidade].includes(turma)) {
          mapa[unidade].push(turma);
        }
      });
    });

  return mapa;
}

/**
 * Chave canônica de turma.
 */
export function chaveTurma(unidade, turma) {
  return `${unidade}::${turma}`;
}

/**
 * Identifica a série de qualquer turma cadastrada.
 * Exemplos:
 * "6 ano a m" -> "6 ano"
 * "6º anoA - M" -> "6 ano"
 * "7º ano B - T" -> "7 ano"
 * "1ª série A" -> "1 serie"
 */
export function extrairSerieTurma(turma) {
  const texto = String(turma || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

  const match = texto.match(
    /(\d+)\s*º?\s*(ano|serie|série|efaf|em)\b/
  );

  if (match) {
    return `${match[1]} ${match[2] === "série" ? "serie" : match[2]}`;
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
