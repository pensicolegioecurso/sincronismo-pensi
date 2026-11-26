const SINONIMOS = [
  [/\b(bom dia|boa tarde|boa noite|oi|olá|ola|e aí|eai)\b/g, ""],
  [/\b(gostaria de saber|queria saber|quero saber|me diga|me fala|poderia me (dizer|informar)|por favor)\b/g, ""],
  [/\b(qual foi|quais foram|qual é|quais são)\b/g, "qual"],
  [/\b(prof|profs)\b/g, "professor"],
  [/\b(unid|unds)\b/g, "unidade"],
  [/\b(checagem|checagens|check-in|checkin)\b/g, "check"],
  [/\b(cadê|cade)\b/g, "onde esta"],
  [/\b(qtos|qts)\b/g, "quantos"],
];

export function normalizar(texto) {
  let t = String(texto || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[?!.,;:]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  for (const [re, sub] of SINONIMOS) t = t.replace(re, sub);
  return t.replace(/\s+/g, " ").trim();
}

export function contemAlgum(texto, lista) {
  return lista.some((k) => texto.includes(k));
}