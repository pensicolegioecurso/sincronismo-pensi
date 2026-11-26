import { normalizar } from "./normalizer";
import { INTENTS } from "./intents";

export function matchIntent(texto) {
  const t = normalizar(texto);
  let melhor = { intent: null, score: 0 };

  for (const intent of INTENTS) {
    let score = 0;
    for (const kw of intent.keywords || []) {
      if (t.includes(kw)) score += kw.split(" ").length * 2;
    }
    for (const re of intent.regex || []) {
      if (re.test(t)) score += 5;
    }
    if (score > melhor.score) melhor = { intent, score };
  }

  if (melhor.score < 2) return null;
  return {
    id: melhor.intent.id,
    handler: melhor.intent.handler,
    extract: melhor.intent.extract?.(t),
    score: melhor.score,
  };
}