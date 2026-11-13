/**
 * Converte a string "Copacabana: 7º anoA - M, 6º anoB - M | Flamengo: 6º anoA - M"
 * em { Copacabana: ["7º anoA - M", "6º anoB - M"], Flamengo: ["6º anoA - M"] }
 */
export function parseTurmasPorUnidade(turmasStr) {
  if (!turmasStr || typeof turmasStr !== "string") return {};
  const mapa = {};

  const blocos = turmasStr.split("|").map((b) => b.trim()).filter(Boolean);

  blocos.forEach((bloco) => {
    const idx = bloco.indexOf(":");
    if (idx === -1) return;

    const unidade = bloco.slice(0, idx).trim();
    const turmasRaw = bloco.slice(idx + 1).trim();

    const turmas = turmasRaw
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    if (!mapa[unidade]) mapa[unidade] = [];
    turmas.forEach((t) => {
      if (!mapa[unidade].includes(t)) mapa[unidade].push(t);
    });
  });

  return mapa;
}

/**
 * Chave canônica para guardar em turmasInativas.
 * Usa "Unidade::Turma" pra evitar conflito com ":" no nome da turma.
 */
export function chaveTurma(unidade, turma) {
  return `${unidade}::${turma}`;
}