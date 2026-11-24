// src/utils/turmasAtivas.js
import {
  parseTurmasPorUnidade,
  chaveTurma,
  normalizarTurma,
  normalizarUnidade,
} from "./turmas";

export function obterUnidadesUsuario(valor) {
  if (Array.isArray(valor)) {
    return valor.map((item) => String(item).trim()).filter(Boolean);
  }
  return String(valor || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function obterTurmasAtivas(user) {
  if (!user) return {};

  const mapa = parseTurmasPorUnidade(user.turmas || "");
  const unidadesUsuario = obterUnidadesUsuario(user.unidade);
  const unidadesPermitidas = new Set(unidadesUsuario.map(normalizarUnidade));
  const unidadesInativas = new Set(
    (Array.isArray(user.unidadesInativas) ? user.unidadesInativas : []).map(normalizarUnidade)
  );
  const turmasInativas = Array.isArray(user.turmasInativas) ? user.turmasInativas : [];

  const resultado = {};

  Object.entries(mapa).forEach(([unidade, turmas]) => {
    const unidadeNormalizada = normalizarUnidade(unidade);

    if (unidadesPermitidas.size > 0 && !unidadesPermitidas.has(unidadeNormalizada)) return;
    if (unidadesInativas.has(unidadeNormalizada)) return;

    const inativasDaUnidade = new Set(
      turmasInativas
        .map((item) => {
          if (typeof item !== "string") return "";
          if (item.includes("::")) {
            const [unidadeItem, ...resto] = item.split("::");
            if (normalizarUnidade(unidadeItem) !== unidadeNormalizada) return "";
            return normalizarTurma(resto.join("::"));
          }
          return normalizarTurma(item);
        })
        .filter(Boolean)
    );

    const ativas = turmas.filter((turma) => {
      const inativaPorChave = turmasInativas.includes(chaveTurma(unidade, turma));
      const inativaPorNome = inativasDaUnidade.has(normalizarTurma(turma));
      return !inativaPorChave && !inativaPorNome;
    });

    if (ativas.length > 0) resultado[unidade] = ativas;
  });

  return resultado;
}